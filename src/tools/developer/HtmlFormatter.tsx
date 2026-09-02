import { useState } from 'react'
import beautify from 'js-beautify'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { ErrorState } from '../../components/States'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'html-formatter')!

type Lang = 'html' | 'css' | 'js'

const FORMATTERS: Record<Lang, (s: string) => string> = {
  html: (s) => beautify.html(s, { indent_size: 2 }),
  css: (s) => beautify.css(s, { indent_size: 2 }),
  js: (s) => beautify.js(s, { indent_size: 2 }),
}

export default function HtmlFormatter() {
  const [lang, setLang] = useState<Lang>('html')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function run() {
    try {
      setOutput(FORMATTERS[lang](input))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not format this input.')
      setOutput('')
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="flex gap-2">
        {(['html', 'css', 'js'] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => { setLang(l); setOutput(''); setError(null) }}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium uppercase ${lang === l ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div>
        <label className={labelCls} htmlFor="in">{lang.toUpperCase()} input</label>
        <textarea
          id="in"
          className={textareaCls}
          rows={10}
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={run} disabled={!input.trim()}>Format</Button>
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
