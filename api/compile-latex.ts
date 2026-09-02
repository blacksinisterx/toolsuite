import type { VercelRequest, VercelResponse } from '@vercel/node'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const execFileAsync = promisify(execFile)

// This is the one endpoint in the whole app that costs real money to run --
// every other tool executes for free in the visitor's own browser. It's
// also unauthenticated and its URL isn't secret (it's right there in the
// shipped JS bundle), so it needs its own defense against someone just
// looping requests at it. Upstash's REST-based Redis is what makes a real,
// atomic rate limit possible from a stateless serverless function (no
// persistent connection, no in-memory counter that resets every cold start).
//
// Fails OPEN, not closed: if UPSTASH_REDIS_REST_URL/TOKEN aren't set (e.g.
// local dev, or before the free Upstash database is wired up), compiling
// still works -- it just isn't rate-limited yet. See README for setup.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null

// 10 compiles per 10 minutes per IP -- generous enough for a real editing
// session (type, compile, tweak, compile again) while still shutting down
// a script that loops this endpoint.
const ratelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '10 m'), prefix: 'latex-compile' })
  : null

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for']
  const raw = Array.isArray(fwd) ? fwd[0] : fwd
  return raw?.split(',')[0]?.trim() || 'unknown'
}

// The only genuinely server-side piece of this whole app: a real LaTeX
// compiler (Tectonic, a self-contained Rust TeX engine) bundled as a static
// binary and run in a Vercel serverless function. Everything else in this
// product is client-only by design -- this is the one tool that structurally
// can't be (there is no maintained, npm-installable WASM LaTeX compiler).
// The source .tex text is the only thing that ever reaches this function;
// it's written to an ephemeral /tmp directory, compiled, and deleted --
// nothing is retained between requests.
const TECTONIC_BIN = join(process.cwd(), 'api', 'bin', 'tectonic')
const FONTS_DIR = join(process.cwd(), 'api', 'fonts')
const MAX_SOURCE_BYTES = 2_000_000 // 2MB of LaTeX source is already a huge document

// Real bug found from real use: documents using `fontspec` + `\setmainfont`
// (very common in resume templates, which usually ask for Times New
// Roman/Arial/Calibri) failed with "Fontconfig error: Cannot load default
// config file" -- this serverless environment ships no fontconfig setup at
// all, so XeTeX can't discover any font, system or otherwise.
//
// This minimal config just fixes *that* baseline problem (a real directory
// + cache fontconfig can actually load) and points at our bundled,
// genuinely free substitute fonts so they're discoverable *under their own
// real names* (Tinos, Arimo, ...). Getting fontconfig to additionally
// alias/rename "Times New Roman" -> "Tinos" was tried two ways (query-time
// `<match target="pattern">`, then scan-time `<match target="scan">`) and
// confirmed live, twice, that neither actually took effect for how
// Tectonic's XeTeX resolves fonts -- see substituteProprietaryFonts below
// for the fix that actually works.
function fontConfigXml(cacheDir: string): string {
  return `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${FONTS_DIR}</dir>
  <cachedir>${cacheDir}</cachedir>
</fontconfig>
`
}

// Real, working fix for the proprietary-font problem: rewrite the font name
// directly in the source before compiling, rather than fighting
// fontconfig's alias semantics blind (no shell access to this environment
// to debug fc-match/fc-list interactively). Scoped tightly to fontspec's
// three family-setting commands so it can't touch anything else in the
// document (body text that happens to say "Times New Roman" is untouched --
// verified against that exact case). "Times New Roman" itself can never be
// legally bundled; Tinos is Google's own official metric-compatible
// replacement, same reasoning for the rest.
const FONT_SUBSTITUTES: Record<string, string> = {
  'times new roman': 'Tinos',
  arial: 'Arimo',
  'courier new': 'Cousine',
  calibri: 'Carlito',
  cambria: 'Caladea',
}

function substituteProprietaryFonts(source: string): { source: string; substitutions: string[] } {
  const substitutions: string[] = []
  const result = source.replace(
    /\\(setmainfont|setsansfont|setmonofont)((?:\[[^\]]*\])?)\{([^}]*)\}/g,
    (full, cmd: string, opts: string, fontName: string) => {
      const trimmed = fontName.trim()
      const sub = FONT_SUBSTITUTES[trimmed.toLowerCase()]
      if (!sub) return full
      substitutions.push(`${trimmed} -> ${sub}`)
      return `\\${cmd}${opts}{${sub}}`
    },
  )
  return { source: result, substitutions }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST.' })
    return
  }

  if (ratelimit) {
    const { success, limit, remaining, reset } = await ratelimit.limit(clientIp(req))
    res.setHeader('X-RateLimit-Limit', String(limit))
    res.setHeader('X-RateLimit-Remaining', String(remaining))
    if (!success) {
      const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
      res.setHeader('Retry-After', String(retryAfterSec))
      res.status(429).json({ error: `Too many compile requests. Try again in ${retryAfterSec}s.` })
      return
    }
  }

  const { source: rawSource } = (req.body ?? {}) as { source?: string }
  if (typeof rawSource !== 'string' || !rawSource.trim()) {
    res.status(400).json({ error: 'Missing "source" (the .tex document text).' })
    return
  }
  if (Buffer.byteLength(rawSource, 'utf8') > MAX_SOURCE_BYTES) {
    res.status(413).json({ error: 'Document is too large to compile here (2MB limit).' })
    return
  }
  const { source, substitutions } = substituteProprietaryFonts(rawSource)

  const workDir = await mkdtemp(join(tmpdir(), 'tex-'))
  const cacheDir = await mkdtemp(join(tmpdir(), 'tex-cache-'))
  const fontCacheDir = await mkdtemp(join(tmpdir(), 'font-cache-'))
  const texPath = join(workDir, 'main.tex')
  const pdfPath = join(workDir, 'main.pdf')
  const fontConfPath = join(workDir, 'fonts.conf')

  try {
    await writeFile(texPath, source, 'utf8')
    await writeFile(fontConfPath, fontConfigXml(fontCacheDir), 'utf8')

    await execFileAsync(
      TECTONIC_BIN,
      ['--outdir', workDir, '--keep-logs', texPath],
      {
        cwd: workDir,
        // Deliberately NOT `...process.env` -- the compiler never needs
        // this function's environment (which could carry secrets for
        // unrelated Vercel env vars), only PATH to find shared libs and
        // the two vars it actually reads. Least privilege in case any
        // LaTeX package ever finds a way to leak its own environment into
        // the rendered PDF.
        env: {
          PATH: process.env.PATH,
          // Tectonic needs a writable cache for its TeX package bundle --
          // the function's own filesystem is read-only outside /tmp.
          TECTONIC_CACHE_DIR: cacheDir,
          FONTCONFIG_FILE: fontConfPath,
        },
        timeout: 55_000,
        maxBuffer: 10_000_000,
      },
    )

    const pdf = await readFile(pdfPath)
    res.setHeader('Content-Type', 'application/pdf')
    if (substitutions.length) res.setHeader('X-Font-Substitutions', substitutions.join('; '))
    res.status(200).send(pdf)
  } catch (err) {
    // A real compile error (bad LaTeX) throws from execFile with stdout/
    // stderr attached -- that's the actual compiler's log, not a fabricated
    // message, and is exactly what the editor should show the user.
    const e = err as { stdout?: string; stderr?: string; message?: string }
    const log = [e.stdout, e.stderr].filter(Boolean).join('\n\n') || e.message || 'Unknown compile error.'
    res.status(422).json({ error: 'LaTeX compilation failed.', log })
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {})
    await rm(cacheDir, { recursive: true, force: true }).catch(() => {})
    await rm(fontCacheDir, { recursive: true, force: true }).catch(() => {})
  }
}
