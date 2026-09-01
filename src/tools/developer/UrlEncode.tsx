import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { ErrorState } from '../../components/States'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'url-encode')!

export default function UrlEncode() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function convert(value: string, m: typeof mode) {
    try {
      setOutput(m === 'encode' ? encodeURIComponent(value) : decodeURIComponent(value))
      setError(null)
    } catch {
      setError('Could not decode this -- it may not be validly URL-encoded.')
      setOutput('')
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="flex gap-2">
        {(['encode', 'decode'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setInput(''); setOutput(''); setError(null) }}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium capitalize ${mode === m ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div>
        <label className={labelCls} htmlFor="in">{mode === 'encode' ? 'Text or URL' : 'Encoded text'}</label>
        <textarea
          id="in"
          className={textareaCls}
          rows={5}
          spellCheck={false}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            if (e.target.value) convert(e.target.value, mode)
            else setOutput('')
          }}
        />
      </div>

      {error && <ErrorState message={error} />}

      {output && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelCls + ' mb-0'} htmlFor="out">Result</label>
            <CopyButton text={output} />
          </div>
          <textarea id="out" readOnly className={textareaCls} rows={5} value={output} />
        </div>
      )}
    </ToolLayout>
  )
}
