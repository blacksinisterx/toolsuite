import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { ErrorState } from '../../components/States'
import { textareaCls, labelCls } from '../../components/formStyles'
import { jsonToCsv, csvToJson } from '../../processors/csv'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'json-csv')!

export default function JsonCsv() {
  const [mode, setMode] = useState<'json-to-csv' | 'csv-to-json'>('json-to-csv')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function convert() {
    try {
      if (mode === 'json-to-csv') {
        setOutput(jsonToCsv(JSON.parse(input)))
      } else {
        setOutput(JSON.stringify(csvToJson(input), null, 2))
      }
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not convert this input.')
      setOutput('')
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setMode('json-to-csv'); setInput(''); setOutput(''); setError(null) }}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'json-to-csv' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
        >
          JSON → CSV
        </button>
        <button
          type="button"
          onClick={() => { setMode('csv-to-json'); setInput(''); setOutput(''); setError(null) }}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'csv-to-json' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
        >
          CSV → JSON
        </button>
      </div>

      <div>
        <label className={labelCls} htmlFor="in">{mode === 'json-to-csv' ? 'JSON array input' : 'CSV input'}</label>
        <textarea
          id="in"
          className={textareaCls}
          rows={8}
          spellCheck={false}
          placeholder={mode === 'json-to-csv' ? '[{"name": "Aiza", "role": "Engineer"}]' : 'name,role\nAiza,Engineer'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={convert} disabled={!input.trim()}>Convert</Button>
        <Button variant="ghost" onClick={() => { setInput(''); setOutput(''); setError(null) }}>Reset</Button>
      </div>

      {error && <ErrorState message={error} />}

      {output && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelCls + ' mb-0'} htmlFor="out">Result</label>
            <CopyButton text={output} />
          </div>
          <textarea id="out" readOnly className={textareaCls} rows={8} value={output} />
        </div>
      )}
    </ToolLayout>
  )
}
