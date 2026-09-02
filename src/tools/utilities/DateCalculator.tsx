import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { labelCls, inputCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'date-calculator')!

const DAY_MS = 86400000

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function diffBreakdown(from: Date, to: Date) {
  const ms = to.getTime() - from.getTime()
  const totalDays = Math.round(ms / DAY_MS)
  const [a, b] = ms >= 0 ? [from, to] : [to, from]
  let years = b.getFullYear() - a.getFullYear()
  let months = b.getMonth() - a.getMonth()
  let days = b.getDate() - a.getDate()
  if (days < 0) {
    months -= 1
    days += new Date(b.getFullYear(), b.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  return { totalDays, years, months, days }
}

export default function DateCalculator() {
  const [mode, setMode] = useState<'between' | 'add'>('between')

  // between two dates
  const [start, setStart] = useState(todayStr())
  const [end, setEnd] = useState(todayStr())
  const between = useMemo(() => {
    const s = new Date(start + 'T00:00:00')
    const e = new Date(end + 'T00:00:00')
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null
    return diffBreakdown(s, e)
  }, [start, end])

  // add/subtract days
  const [base, setBase] = useState(todayStr())
  const [amount, setAmount] = useState('30')
  const [unit, setUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days')
  const [direction, setDirection] = useState<'add' | 'subtract'>('add')
  const resultDate = useMemo(() => {
    const b = new Date(base + 'T00:00:00')
    const n = Number(amount)
    if (Number.isNaN(b.getTime()) || Number.isNaN(n)) return null
    const signed = direction === 'add' ? n : -n
    const d = new Date(b)
    if (unit === 'days') d.setDate(d.getDate() + signed)
    else if (unit === 'weeks') d.setDate(d.getDate() + signed * 7)
    else if (unit === 'months') d.setMonth(d.getMonth() + signed)
    else d.setFullYear(d.getFullYear() + signed)
    return d
  }, [base, amount, unit, direction])

  return (
    <ToolLayout tool={tool}>
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('between')} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'between' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}>Days between dates</button>
        <button type="button" onClick={() => setMode('add')} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'add' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}>Add / subtract</button>
      </div>

      {mode === 'between' ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="d-start">Start date</label>
              <input id="d-start" type="date" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="d-end">End date</label>
              <input id="d-end" type="date" className={inputCls} value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          {between && (
            <div className="rounded-lg border border-border bg-bg-sunken px-4 py-3 text-text">
              <p className="text-lg"><strong>{Math.abs(between.totalDays)}</strong> total days</p>
              <p className="text-sm text-text-muted">{between.years}y {between.months}m {between.days}d</p>
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            <label className={labelCls} htmlFor="d-base">From date</label>
            <input id="d-base" type="date" className={inputCls} value={base} onChange={(e) => setBase(e.target.value)} />
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
            <div>
              <label className={labelCls} htmlFor="d-amount">Amount</label>
              <input id="d-amount" type="number" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="d-direction">&nbsp;</label>
              <select id="d-direction" value={direction} onChange={(e) => setDirection(e.target.value as 'add' | 'subtract')} className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent">
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="d-unit">Unit</label>
              <select id="d-unit" value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent">
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>
          {resultDate && (
            <div className="rounded-lg border border-border bg-bg-sunken px-4 py-3 text-lg text-text">
              {resultDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
        </>
      )}
    </ToolLayout>
  )
}
