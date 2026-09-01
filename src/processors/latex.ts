export interface CompileResult {
  ok: boolean
  pdfBlob?: Blob
  log?: string
  fontSubstitutions?: string[]
}

/** The one call in this whole app that leaves the browser -- LaTeX
 * compilation genuinely needs a real TeX engine, and there's no maintained
 * WASM one to run client-side. Only the .tex source text is sent, compiled
 * in an ephemeral serverless function, and discarded immediately after
 * (see api/compile-latex.ts). */
export async function compileLatex(source: string): Promise<CompileResult> {
  const res = await fetch('/api/compile-latex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  })

  if (res.ok) {
    const header = res.headers.get('X-Font-Substitutions')
    return { ok: true, pdfBlob: await res.blob(), fontSubstitutions: header ? header.split('; ') : undefined }
  }

  let log = `Server returned ${res.status}.`
  try {
    const body = await res.json()
    log = body.log || body.error || log
  } catch {
    /* non-JSON error response, keep the generic message */
  }
  return { ok: false, log }
}
