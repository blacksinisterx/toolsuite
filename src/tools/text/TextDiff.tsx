import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { textareaCls, labelCls } from '../../components/formStyles'
import { diffLines } from '../../lib/diff'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'text-diff')!

export default function TextDiff() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const ops = useMemo(() => (a || b ? diffLines(a, b) : []), [a, b])

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="a">Original</label>
          <textarea id="a" className={textareaCls} rows={8} value={a} onChange={(e) => setA(e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="b">Changed</label>
          <textarea id="b" className={textareaCls} rows={8} value={b} onChange={(e) => setB(e.target.value)} />
        </div>
      </div>

      {ops.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          {ops.map((op, i) => (
            <div
              key={i}
              className={`whitespace-pre px-3 py-0.5 font-mono text-xs ${
                op.type === 'add' ? 'bg-success-soft text-success' : op.type === 'remove' ? 'bg-danger-soft text-danger' : 'text-text-muted'
              }`}
            >
              {op.type === 'add' ? '+ ' : op.type === 'remove' ? '- ' : '  '}
              {op.line || ' '}
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  )
}
