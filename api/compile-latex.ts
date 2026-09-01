import type { VercelRequest, VercelResponse } from '@vercel/node'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const execFileAsync = promisify(execFile)

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
// all, so XeTeX can't discover any font, system or otherwise. Separately,
// even a working fontconfig could never legitimately serve "Times New
// Roman" itself -- it's a proprietary Microsoft font, not redistributable.
// Real fix: bundle genuinely free, metric-compatible substitutes (Google's
// own official replacements -- Tinos/Arimo/Cousine/Carlito/Caladea, all
// OFL-licensed) and a real fontconfig config that transparently aliases
// the proprietary names to them, so a resume written against "Times New
// Roman" compiles unmodified.
function fontConfigXml(cacheDir: string): string {
  const alias = (proprietary: string, substitute: string) =>
    `  <match target="pattern">
    <test name="family"><string>${proprietary}</string></test>
    <edit name="family" mode="assign" binding="strong"><string>${substitute}</string></edit>
  </match>`
  return `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${FONTS_DIR}</dir>
  <cachedir>${cacheDir}</cachedir>
${alias('Times New Roman', 'Tinos')}
${alias('Arial', 'Arimo')}
${alias('Courier New', 'Cousine')}
${alias('Calibri', 'Carlito')}
${alias('Cambria', 'Caladea')}
</fontconfig>
`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST.' })
    return
  }

  const { source } = (req.body ?? {}) as { source?: string }
  if (typeof source !== 'string' || !source.trim()) {
    res.status(400).json({ error: 'Missing "source" (the .tex document text).' })
    return
  }
  if (Buffer.byteLength(source, 'utf8') > MAX_SOURCE_BYTES) {
    res.status(413).json({ error: 'Document is too large to compile here (2MB limit).' })
    return
  }

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
        env: {
          ...process.env,
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
