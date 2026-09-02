import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { WorldMap } from '../../components/WorldMap'
import { labelCls, inputCls } from '../../components/formStyles'
import { allTimeZones, formatInZone, zonedTimeToUtc, POPULAR_ZONES, type ZonedResult } from '../../lib/timezone'
import { coordFor } from '../../lib/worldMap'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'timezone-converter')!

const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const ALL_ZONES = allTimeZones()

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
function nowTimeStr() {
  return new Date().toTimeString().slice(0, 5)
}

/** A 24h gradient bar (night -> dawn -> day -> dusk -> night) with a dot
 * marking the current hour -- a lightweight, honest stand-in for "a map":
 * no tile server, no new dependency, but still gives an at-a-glance sense
 * of day/night in that city, which is the actual useful information. */
function DayNightBar({ hour24 }: { hour24: number }) {
  const pct = (hour24 / 24) * 100
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full" style={{
      background: 'linear-gradient(90deg, #0a0a2e 0%, #1e3a5f 15%, #f59e0b 25%, #fef3c7 40%, #fef3c7 60%, #f59e0b 75%, #1e3a5f 85%, #0a0a2e 100%)',
    }}>
      <div
        className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow"
        style={{ left: `calc(${pct}% - 6px)`, background: hour24 >= 6 && hour24 < 18 ? '#f59e0b' : '#1e293b' }}
      />
    </div>
  )
}

function ZoneCard({ result, diffHours, onRemove }: { result: ZonedResult; diffHours: number; onRemove?: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg-elevated p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-text">{result.label}</p>
          <p className="text-xs text-text-faint">{result.utcOffset} · {result.weekday}</p>
        </div>
        {onRemove && (
          <button type="button" onClick={onRemove} aria-label="Remove" className="text-text-faint hover:text-danger">✕</button>
        )}
      </div>
      <p className="text-2xl font-semibold tabular-nums text-text">{result.time}</p>
      <p className="text-xs text-text-muted">{result.date}</p>
      <DayNightBar hour24={result.hour24} />
      {diffHours !== 0 && (
        <p className="text-xs text-text-faint">
          {diffHours > 0 ? `${diffHours}h ahead of` : `${Math.abs(diffHours)}h behind`} source
        </p>
      )}
    </div>
  )
}

export default function TimezoneConverter() {
  const [sourceZone, setSourceZone] = useState(browserZone)
  const [date, setDate] = useState(todayStr())
  const [time, setTime] = useState(nowTimeStr())
  const [targets, setTargets] = useState<string[]>(['Asia/Karachi', 'Australia/Sydney', 'America/Los_Angeles'].filter((z) => z !== browserZone).slice(0, 3))
  const [addZone, setAddZone] = useState('')

  const instant = useMemo(() => {
    try {
      return zonedTimeToUtc(date, time, sourceZone)
    } catch {
      return new Date()
    }
  }, [date, time, sourceZone])

  const sourceResult = useMemo(() => formatInZone(instant, sourceZone), [instant, sourceZone])
  const results = useMemo(
    () => targets.map((tz) => ({ zone: tz, result: formatInZone(instant, tz) })),
    [instant, targets],
  )

  function addTarget() {
    if (addZone && !targets.includes(addZone) && addZone !== sourceZone) {
      setTargets((prev) => [...prev, addZone])
    }
    setAddZone('')
  }

  const mapPins = useMemo(() => {
    const pins: { timeZone: string; lat: number; lon: number; label: string; time: string; isSource?: boolean }[] = []
    const src = coordFor(sourceZone)
    if (src) pins.push({ timeZone: sourceZone, lat: src[0], lon: src[1], label: sourceResult.label, time: sourceResult.time, isSource: true })
    for (const { zone, result } of results) {
      const c = coordFor(zone)
      if (c) pins.push({ timeZone: zone, lat: c[0], lon: c[1], label: result.label, time: result.time })
    }
    return pins
  }, [sourceZone, sourceResult, results])

  return (
    <ToolLayout tool={tool}>
      <WorldMap pins={mapPins} now={instant} />

      <div className="rounded-xl border border-border bg-bg-sunken p-4">
        <p className={labelCls}>From</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="tz-date">Date</label>
            <input id="tz-date" type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="tz-time">Time</label>
            <input id="tz-time" type="time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="tz-source">Timezone</label>
            <select id="tz-source" className={inputCls} value={sourceZone} onChange={(e) => setSourceZone(e.target.value)}>
              {ALL_ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <ZoneCard result={sourceResult} diffHours={0} />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className={labelCls + ' mb-0'}>Converted to</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ zone, result }) => (
            <ZoneCard
              key={zone}
              result={result}
              diffHours={Math.round(result.offsetHours - sourceResult.offsetHours)}
              onRemove={() => setTargets((prev) => prev.filter((z) => z !== zone))}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1">
          <label className={labelCls} htmlFor="tz-add">Add a city</label>
          <select id="tz-add" className={inputCls} value={addZone} onChange={(e) => setAddZone(e.target.value)}>
            <option value="">Choose a timezone…</option>
            <optgroup label="Popular">
              {POPULAR_ZONES.filter((z) => z !== sourceZone && !targets.includes(z)).map((z) => <option key={z} value={z}>{z}</option>)}
            </optgroup>
            <optgroup label="All">
              {ALL_ZONES.filter((z) => z !== sourceZone && !targets.includes(z)).map((z) => <option key={z} value={z}>{z}</option>)}
            </optgroup>
          </select>
        </div>
        <Button variant="secondary" onClick={addTarget} disabled={!addZone}>Add</Button>
      </div>
    </ToolLayout>
  )
}
