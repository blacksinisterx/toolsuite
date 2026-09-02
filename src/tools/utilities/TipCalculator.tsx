import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { labelCls, inputCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'tip-calculator')!

function num(s: string): number {
  const n = Number(s)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

const PRESETS = [10, 15, 18, 20]

export default function TipCalculator() {
  const [bill, setBill] = useState('50')
  const [tipPct, setTipPct] = useState('18')
  const [people, setPeople] = useState('1')

  const { tipAmount, total, perPerson } = useMemo(() => {
    const b = num(bill)
    const t = num(tipPct)
    const p = Math.max(1, Math.round(num(people)) || 1)
    const tipAmount = (b * t) / 100
    const total = b + tipAmount
    return { tipAmount, total, perPerson: total / p }
  }, [bill, tipPct, people])

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="bill">Bill amount</label>
          <input id="bill" type="number" min={0} className={inputCls} value={bill} onChange={(e) => setBill(e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="tip">Tip %</label>
          <input id="tip" type="number" min={0} className={inputCls} value={tipPct} onChange={(e) => setTipPct(e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="people">Split between</label>
          <input id="people" type="number" min={1} step={1} className={inputCls} value={people} onChange={(e) => setPeople(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setTipPct(String(p))}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${tipPct === String(p) ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
          >
            {p}%
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-lg border border-border bg-bg-sunken px-4 py-2.5">
          <span className="text-xs font-medium text-text-muted">Tip amount</span>
          <span className="font-mono text-text">{fmt(tipAmount)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border bg-bg-sunken px-4 py-2.5">
          <span className="text-xs font-medium text-text-muted">Total</span>
          <span className="font-mono text-text">{fmt(total)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-accent/40 bg-accent-soft px-4 py-2.5">
          <span className="text-xs font-medium text-accent">Per person</span>
          <span className="font-mono text-lg font-semibold text-accent">{fmt(perPerson)}</span>
        </div>
      </div>
    </ToolLayout>
  )
}
