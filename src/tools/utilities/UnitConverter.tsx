import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { labelCls } from '../../components/formStyles'
import { UNIT_GROUPS, convertUnit, type UnitGroup } from '../../lib/unitConversions'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'unit-converter')!

export default function UnitConverter() {
  const [groupId, setGroupId] = useState<UnitGroup>('length')
  const group = UNIT_GROUPS.find((g) => g.id === groupId)!
  const unitIds = Object.keys(group.units)
  const [from, setFrom] = useState(unitIds[0])
  const [to, setTo] = useState(unitIds[1])
  const [value, setValue] = useState('1')

  function switchGroup(id: UnitGroup) {
    const g = UNIT_GROUPS.find((x) => x.id === id)!
    const ids = Object.keys(g.units)
    setGroupId(id)
    setFrom(ids[0])
    setTo(ids[1])
  }

  const result = useMemo(() => {
    const n = Number(value)
    if (!value.trim() || Number.isNaN(n)) return null
    return convertUnit(groupId, n, from, to)
  }, [groupId, value, from, to])

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-wrap gap-2">
        {UNIT_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => switchGroup(g.id)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${groupId === g.id ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <label className={labelCls} htmlFor="from-unit">From</label>
          <input
            id="value-in"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mb-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-lg text-text outline-none focus:border-accent"
          />
          <select id="from-unit" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent">
            {unitIds.map((u) => <option key={u} value={u}>{group.units[u]}</option>)}
          </select>
        </div>

        <button
          type="button"
          onClick={() => { setFrom(to); setTo(from) }}
          aria-label="Swap units"
          className="hidden h-9 w-9 shrink-0 items-center justify-center self-center rounded-lg border border-border text-text-muted hover:border-accent hover:text-accent sm:flex"
        >
          ⇄
        </button>

        <div>
          <label className={labelCls} htmlFor="to-unit">To</label>
          <div className="mb-2 w-full rounded-lg border border-border bg-bg-sunken px-3 py-2 text-lg text-text">
            {result === null ? '—' : Number(result.toPrecision(10)).toString()}
          </div>
          <select id="to-unit" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent">
            {unitIds.map((u) => <option key={u} value={u}>{group.units[u]}</option>)}
          </select>
        </div>
      </div>
    </ToolLayout>
  )
}
