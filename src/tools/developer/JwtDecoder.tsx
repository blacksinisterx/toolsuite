import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { ErrorState } from '../../components/States'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'jwt-decoder')!

function decodePart(part: string): unknown {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(part.length + ((4 - (part.length % 4)) % 4), '=')
  return JSON.parse(decodeURIComponent(escape(atob(padded))))
}

export default function JwtDecoder() {
  const [input, setInput] = useState('')

  const result = useMemo<{ error: string } | { header: unknown; payload: unknown } | null>(() => {
    if (!input.trim()) return null
    const parts = input.trim().split('.')
    if (parts.length < 2) return { error: 'A JWT needs at least a header and a payload, separated by dots.' }
    try {
      return { header: decodePart(parts[0]), payload: decodePart(parts[1]) }
    } catch {
      return { error: "Could not decode this -- it doesn't look like a valid JWT." }
    }
  }, [input])

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">JWT</label>
        <textarea
          id="in"
          className={textareaCls}
          rows={4}
          spellCheck={false}
          placeholder="eyJhbGciOi..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <p className="text-xs text-text-faint">This only decodes the token -- it never verifies the signature, so don't treat a "successfully decoded" token as proof it's genuine.</p>

      {result && 'error' in result && <ErrorState message={result.error} />}

      {result && 'header' in result && (
        <div className="flex flex-col gap-4">
          <div>
            <p className={labelCls}>Header</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-bg-sunken p-3 font-mono text-xs text-text">
              {JSON.stringify(result.header, null, 2)}
            </pre>
          </div>
          <div>
            <p className={labelCls}>Payload</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-bg-sunken p-3 font-mono text-xs text-text">
              {JSON.stringify(result.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
