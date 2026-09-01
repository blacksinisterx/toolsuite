import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { ErrorState } from '../../components/States'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'json-tree-viewer')!

function JsonNode({ value, name, depth }: { value: unknown; name?: string; depth: number }) {
  const [open, setOpen] = useState(depth < 2)
  const isObj = value !== null && typeof value === 'object'

  if (!isObj) {
    const kind = value === null ? 'null' : typeof value
    const color = kind === 'string' ? 'text-success' : kind === 'number' ? 'text-accent' : kind === 'boolean' ? 'text-warning' : 'text-text-faint'
    return (
      <div className="whitespace-nowrap font-mono text-xs">
        {name !== undefined && <span className="text-text-muted">{name}: </span>}
        <span className={color}>{JSON.stringify(value)}</span>
      </div>
    )
  }

  const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value)
  const bracket = Array.isArray(value) ? ['[', ']'] : ['{', '}']

  return (
    <div className="font-mono text-xs">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-text-muted hover:text-text">
        <span className="w-3 text-text-faint">{open ? '▾' : '▸'}</span>
        {name !== undefined && <span>{name}: </span>}
        <span>{bracket[0]}{!open && `…${bracket[1]}`}</span>
        {!open && <span className="ml-1 text-text-faint">{entries.length} item{entries.length === 1 ? '' : 's'}</span>}
      </button>
      {open && (
        <div className="ml-4 border-l border-border pl-3">
          {entries.map(([k, v]) => (
            <JsonNode key={k} value={v} name={k} depth={depth + 1} />
          ))}
          <div className="text-text-muted">{bracket[1]}</div>
        </div>
      )}
    </div>
  )
}

export default function JsonTreeViewer() {
  const [input, setInput] = useState('')
  const parsed = useMemo(() => {
    if (!input.trim()) return null
    try {
      return { value: JSON.parse(input) }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Invalid JSON.' }
    }
  }, [input])

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">JSON input</label>
        <textarea id="in" className={textareaCls} rows={8} spellCheck={false} value={input} onChange={(e) => setInput(e.target.value)} />
      </div>

      {parsed && 'error' in parsed && <ErrorState message={`Invalid JSON: ${parsed.error}`} />}

      {parsed && 'value' in parsed && (
        <div className="overflow-auto rounded-lg border border-border bg-bg-sunken p-4">
          <JsonNode value={parsed.value} depth={0} />
        </div>
      )}
    </ToolLayout>
  )
}
