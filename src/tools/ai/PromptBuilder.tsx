import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { textareaCls, labelCls, inputCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'prompt-builder')!

type Format = 'xml' | 'markdown' | 'plain'

const FIELDS = [
  { key: 'role', label: 'Role / Persona', placeholder: 'You are a senior copy editor who specializes in concise, plain-English writing.', tag: 'role', heading: 'Role' },
  { key: 'task', label: 'Task', placeholder: 'Rewrite the text below so a 12-year-old could follow it, without losing any facts.', tag: 'task', heading: 'Task' },
  { key: 'context', label: 'Context / Background', placeholder: 'This is for a public health pamphlet. The audience has no medical background.', tag: 'context', heading: 'Context' },
  { key: 'constraints', label: 'Constraints', placeholder: 'Keep it under 150 words. No jargon. Do not add new claims that aren\'t in the source.', tag: 'constraints', heading: 'Constraints' },
  { key: 'outputFormat', label: 'Output format', placeholder: 'Return only the rewritten text -- no preamble, no notes.', tag: 'output_format', heading: 'Output Format' },
  { key: 'examples', label: 'Examples (optional)', placeholder: 'Input: "The medication should be administered orally."\nOutput: "Take this medicine by mouth."', tag: 'examples', heading: 'Examples' },
] as const

type FieldKey = (typeof FIELDS)[number]['key']

function assemble(values: Record<FieldKey, string>, format: Format): string {
  const filled = FIELDS.filter((f) => values[f.key].trim())
  if (filled.length === 0) return ''

  if (format === 'xml') {
    return filled.map((f) => `<${f.tag}>\n${values[f.key].trim()}\n</${f.tag}>`).join('\n\n')
  }
  if (format === 'markdown') {
    return filled.map((f) => `## ${f.heading}\n${values[f.key].trim()}`).join('\n\n')
  }
  return filled.map((f) => values[f.key].trim()).join('\n\n')
}

export default function PromptBuilder() {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    role: '', task: '', context: '', constraints: '', outputFormat: '', examples: '',
  })
  const [format, setFormat] = useState<Format>('xml')

  const set = (key: FieldKey, v: string) => setValues((prev) => ({ ...prev, [key]: v }))
  const output = useMemo(() => assemble(values, format), [values, format])

  return (
    <ToolLayout tool={tool}>
      <div className="flex gap-2">
        {(
          [
            ['xml', 'XML tags'],
            ['markdown', 'Markdown'],
            ['plain', 'Plain'],
          ] as [Format, string][]
        ).map(([f, label]) => (
          <button
            key={f}
            type="button"
            onClick={() => setFormat(f)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${format === f ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-text-faint">
        XML tags are what Anthropic's own docs recommend for structuring a prompt -- most models (Claude, GPT,
        Gemini) parse them reliably. Markdown headers and plain paragraphs both work too, just less consistently.
      </p>

      <div className="flex flex-col gap-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className={labelCls} htmlFor={f.key}>{f.label}</label>
            {f.key === 'examples' || f.key === 'context' ? (
              <textarea id={f.key} className={textareaCls} rows={3} placeholder={f.placeholder} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} />
            ) : (
              <input id={f.key} className={inputCls} placeholder={f.placeholder} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} />
            )}
          </div>
        ))}
      </div>

      {output && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelCls + ' mb-0'} htmlFor="out">Assembled prompt</label>
            <CopyButton text={output} />
          </div>
          <textarea id="out" readOnly className={textareaCls} rows={12} value={output} />
        </div>
      )}
    </ToolLayout>
  )
}
