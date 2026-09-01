import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CsvInput } from '../../components/CsvInput'
import { CsvTableView } from '../../components/CsvTableView'
import { ErrorState } from '../../components/States'
import { inputCls } from '../../components/formStyles'
import { parseCsvTable } from '../../processors/csv'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'csv-viewer')!

export default function CsvViewer() {
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState<number | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const table = useMemo(() => {
    if (!text.trim()) return null
    try {
      setError(null)
      return parseCsvTable(text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not parse this CSV.')
      return null
    }
  }, [text])

  const displayed = useMemo(() => {
    if (!table) return null
    let rows = table.rows
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((r) => r.some((c) => c.toLowerCase().includes(q)))
    }
    if (sortCol !== null) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortCol] ?? '', bv = b[sortCol] ?? ''
        const an = Number(av), bn = Number(bv)
        const cmp = !Number.isNaN(an) && !Number.isNaN(bn) ? an - bn : av.localeCompare(bv)
        return sortAsc ? cmp : -cmp
      })
    }
    return { headers: table.headers, rows }
  }, [table, search, sortCol, sortAsc])

  return (
    <ToolLayout tool={tool}>
      <CsvInput onText={setText} />
      {error && <ErrorState message={error} />}

      {table && displayed && (
        <>
          <div className="flex items-center justify-between gap-3">
            <input
              className={`${inputCls} max-w-xs`}
              placeholder="Filter rows…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <p className="shrink-0 text-xs text-text-faint">{displayed.rows.length} of {table.rows.length} rows</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {table.headers.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (sortCol === i) setSortAsc((a) => !a)
                  else { setSortCol(i); setSortAsc(true) }
                }}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${sortCol === i ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
              >
                Sort: {h || `col ${i + 1}`} {sortCol === i && (sortAsc ? '↑' : '↓')}
              </button>
            ))}
          </div>
          <CsvTableView table={displayed} />
        </>
      )}
    </ToolLayout>
  )
}
