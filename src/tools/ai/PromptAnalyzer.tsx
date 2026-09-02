import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { textareaCls, labelCls } from '../../components/formStyles'
import { analyzePrompt } from '../../lib/promptAnalysis'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'prompt-analyzer')!

export default function PromptAnalyzer() {
  const [text, setText] = useState('')
  const analysis = useMemo(() => analyzePrompt(text), [text])
  const passCount = analysis.checks.filter((c) => c.pass).length

  return (
    <ToolLayout tool={tool}>
      <div className="rounded-lg border border-border bg-bg-sunken px-4 py-3 text-sm text-text-muted">
        A rule-based checklist against well-known prompt-engineering advice -- not an AI call. It never reads or
        judges your prompt's actual content, only its structure, so it stays free, private, and instant.
      </div>

      <div>
        <label className={labelCls} htmlFor="in">Prompt</label>
        <textarea id="in" className={textareaCls} rows={10} placeholder="Paste the prompt you're about to send to an LLM..." value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      {text.trim() && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text">{passCount} of {analysis.checks.length} checks pass</p>
            <p className="text-xs text-text-faint">{analysis.wordCount} words · {analysis.charCount} characters</p>
          </div>

          <div className="flex flex-col gap-2">
            {analysis.checks.map((c) => (
              <div key={c.id} className={`rounded-lg border px-4 py-2.5 ${c.pass ? 'border-success/30 bg-success-soft' : 'border-warning/30 bg-warning-soft'}`}>
                <p className={`text-sm font-medium ${c.pass ? 'text-success' : 'text-warning'}`}>{c.pass ? '✓' : '!'} {c.label}</p>
                <p className="mt-0.5 text-xs text-text-muted">{c.detail}</p>
              </div>
            ))}
          </div>

          {analysis.vagueHits.length > 0 && (
            <div>
              <p className={labelCls}>Vague words worth tightening up</p>
              <div className="flex flex-wrap gap-2">
                {analysis.vagueHits.map((v) => (
                  <span key={v.word} className="rounded-full border border-warning/30 bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning">
                    "{v.word}" × {v.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </ToolLayout>
  )
}
