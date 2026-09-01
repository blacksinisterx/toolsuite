import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'case-converter')!

const CASES: { label: string; fn: (s: string) => string }[] = [
  { label: 'UPPERCASE', fn: (s) => s.toUpperCase() },
  { label: 'lowercase', fn: (s) => s.toLowerCase() },
  { label: 'Title Case', fn: (s) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()) },
  { label: 'Sentence case', fn: (s) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase()) },
  { label: 'camelCase', fn: (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
  { label: 'snake_case', fn: (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') },
  { label: 'kebab-case', fn: (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
]

export default function CaseConverter() {
  const [text, setText] = useState('')

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">Text</label>
        <textarea id="in" className={textareaCls} rows={6} value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        {CASES.map(({ label, fn }) => {
          const value = text ? fn(text) : ''
          return (
            <div key={label} className="flex items-center gap-3 rounded-lg border border-border bg-bg-sunken px-3 py-2">
              <span className="w-28 shrink-0 text-xs font-semibold text-text-muted">{label}</span>
              <span className="flex-1 truncate text-sm text-text">{value}</span>
              {value && <CopyButton text={value} />}
            </div>
          )
        })}
      </div>
    </ToolLayout>
  )
}
