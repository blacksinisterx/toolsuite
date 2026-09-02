import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { StreamLanguage } from '@codemirror/language'
import { stex } from '@codemirror/legacy-modes/mode/stex'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { LATEX_TEMPLATES } from '../../lib/latexTemplates'
import { compileLatex } from '../../processors/latex'
import { appEditorTheme } from '../../lib/codeMirrorTheme'
import { TOOLS } from '../../lib/registry'

const latexLang = StreamLanguage.define(stex)

const tool = TOOLS.find((t) => t.id === 'latex-workspace')!

export default function LatexWorkspace() {
  const [source, setSource] = useState(LATEX_TEMPLATES.Article)
  const [busy, setBusy] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [log, setLog] = useState<string | null>(null)
  const [fontNote, setFontNote] = useState<string[] | null>(null)

  async function compile() {
    setBusy(true)
    setLog(null)
    setFontNote(null)
    try {
      const result = await compileLatex(source)
      if (result.ok && result.pdfBlob) {
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return URL.createObjectURL(result.pdfBlob!)
        })
        if (result.fontSubstitutions) setFontNote(result.fontSubstitutions)
      } else {
        setLog(result.log ?? 'Compilation failed.')
      }
    } catch {
      setLog('Could not reach the compile server. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout tool={tool} fullWidth>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-elevated p-3">
        <div className="flex items-center gap-2">
          <label className={labelCls + ' mb-0'} htmlFor="template">Template</label>
          <select
            id="template"
            className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text outline-none"
            onChange={(e) => e.target.value && setSource(LATEX_TEMPLATES[e.target.value])}
            defaultValue="Article"
          >
            {Object.keys(LATEX_TEMPLATES).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button onClick={compile} disabled={busy}>
            {busy ? 'Compiling…' : 'Compile'}
          </Button>
          <Button variant="secondary" onClick={() => downloadBlob(new Blob([source], { type: 'text/x-tex' }), 'main.tex')}>
            Download .tex
          </Button>
          {pdfUrl && (
            <Button
              variant="secondary"
              onClick={async () => downloadBlob(await (await fetch(pdfUrl)).blob(), 'main.pdf')}
            >
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {fontNote && (
        <p className="rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning">
          Proprietary fonts can't be bundled (licensing), so they were swapped for free,
          metric-compatible equivalents that keep the same spacing and line breaks:{' '}
          {fontNote.join(', ')}.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className={labelCls}>main.tex</p>
          <div className="h-[65vh] overflow-hidden rounded-lg border border-border">
            <CodeMirror
              value={source}
              onChange={setSource}
              height="65vh"
              theme={appEditorTheme}
              extensions={[latexLang]}
              basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true, autocompletion: false }}
            />
          </div>
        </div>
        <div>
          <p className={labelCls}>Preview</p>
          {pdfUrl ? (
            <iframe src={pdfUrl} title="Compiled PDF preview" className="h-[65vh] w-full rounded-lg border border-border bg-white" />
          ) : (
            <div className="flex h-[65vh] items-center justify-center rounded-lg border border-dashed border-border-strong bg-bg-sunken text-center text-sm text-text-faint">
              Click Compile to see your PDF here
            </div>
          )}
        </div>
      </div>

      {log && (
        <div>
          <p className={labelCls}>Compile log</p>
          <ErrorState message="Compilation failed -- see the real compiler output below." />
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-border bg-bg-sunken p-3 font-mono text-xs text-text">
            {log}
          </pre>
        </div>
      )}
    </ToolLayout>
  )
}
