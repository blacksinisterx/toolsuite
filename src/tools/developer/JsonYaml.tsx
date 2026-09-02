import { useState } from 'react'
import { dump, load } from 'js-yaml'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { ErrorState } from '../../components/States'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'json-yaml')!

export default function JsonYaml() {
  const [mode, setMode] = useState<'json-to-yaml' | 'yaml-to-json'>('json-to-yaml')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function convert() {
    try {
      if (mode === 'json-to-yaml') {
        setOutput(dump(JSON.parse(input)))
      } else {
        setOutput(JSON.stringify(load(input), null, 2))
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
          onClick={() => { setMode('json-to-yaml'); setInput(''); setOutput(''); setError(null) }}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'json-to-yaml' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
        >
          JSON → YAML
        </button>
        <button
          type="button"
          onClick={() => { setMode('yaml-to-json'); setInput(''); setOutput(''); setError(null) }}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'yaml-to-json' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
        >
          YAML → JSON
        </button>
      </div>

      <div>
        <label className={labelCls} htmlFor="in">{mode === 'json-to-yaml' ? 'JSON input' : 'YAML input'}</label>
        <textarea
          id="in"
          className={textareaCls}
          rows={10}
          spellCheck={false}
          placeholder={mode === 'json-to-yaml' ? '{"name": "Aiza", "role": "Engineer"}' : 'name: Aiza\nrole: Engineer'}
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
          <textarea id="out" readOnly className={textareaCls} rows={10} value={output} />
        </div>
      )}
    </ToolLayout>
  )
}
