import { useMemo, useState, type ReactNode } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { labelCls, inputCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'percentage-calculator')!

function num(s: string): number | null {
  if (!s.trim()) return null
  const n = Number(s)
  return Number.isNaN(n) ? null : n
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type="number" className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function Result({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-border bg-bg-sunken px-4 py-3 text-lg text-text">{children}</p>
}

export default function PercentageCalculator() {
  // X% of Y
  const [x1, setX1] = useState('20')
  const [y1, setY1] = useState('150')
  const r1 = useMemo(() => {
    const x = num(x1), y = num(y1)
    return x !== null && y !== null ? (x / 100) * y : null
  }, [x1, y1])

  // X is what % of Y
  const [x2, setX2] = useState('30')
  const [y2, setY2] = useState('150')
  const r2 = useMemo(() => {
    const x = num(x2), y = num(y2)
    return x !== null && y !== null && y !== 0 ? (x / y) * 100 : null
  }, [x2, y2])

  // percent change from X to Y
  const [x3, setX3] = useState('150')
  const [y3, setY3] = useState('180')
  const r3 = useMemo(() => {
    const x = num(x3), y = num(y3)
    return x !== null && y !== null && x !== 0 ? ((y - x) / x) * 100 : null
  }, [x3, y3])

  return (
    <ToolLayout tool={tool}>
      <section className="flex flex-col gap-3 border-b border-border pb-6">
        <p className="text-sm font-medium text-text">What is X% of Y?</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="X (%)" value={x1} onChange={setX1} />
          <Field label="Y" value={y1} onChange={setY1} />
        </div>
        <Result>{r1 === null ? '—' : <>{x1}% of {y1} = <strong>{r1}</strong></>}</Result>
      </section>

      <section className="flex flex-col gap-3 border-b border-border pb-6">
        <p className="text-sm font-medium text-text">X is what percent of Y?</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="X" value={x2} onChange={setX2} />
          <Field label="Y" value={y2} onChange={setY2} />
        </div>
        <Result>{r2 === null ? '—' : <>{x2} is <strong>{Number(r2.toFixed(4))}%</strong> of {y2}</>}</Result>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium text-text">Percent change from X to Y</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="X (before)" value={x3} onChange={setX3} />
          <Field label="Y (after)" value={y3} onChange={setY3} />
        </div>
        <Result>
          {r3 === null ? '—' : (
            <>{r3 >= 0 ? 'Increase' : 'Decrease'} of <strong>{Number(Math.abs(r3).toFixed(4))}%</strong></>
          )}
        </Result>
      </section>
    </ToolLayout>
  )
}
