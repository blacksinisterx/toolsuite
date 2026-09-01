import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { ErrorState } from '../../components/States'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'json-formatter')!

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function format(indent: number | null) {
    try {
      const parsed = JSON.parse(input)
      setOutput(indent === null ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON.')
      setOutput('')
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">JSON input</label>
        <textarea
          id="in"
          className={textareaCls}
          rows={10}
          spellCheck={false}
          placeholder='{"hello": "world"}'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={() => format(2)} disabled={!input.trim()}>Format</Button>
        <Button variant="secondary" onClick={() => format(null)} disabled={!input.trim()}>Minify</Button>
        <Button variant="ghost" onClick={() => { setInput(''); setOutput(''); setError(null) }}>Reset</Button>
      </div>

      {error && <ErrorState message={`Invalid JSON: ${error}`} />}

      {output && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelCls + ' mb-0'} htmlFor="out">Result — valid JSON ✓</label>
            <CopyButton text={output} />
          </div>
          <textarea id="out" readOnly className={textareaCls} rows={10} value={output} />
        </div>
      )}
    </ToolLayout>
  )
}
