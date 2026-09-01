import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CsvInput } from '../../components/CsvInput'
import { CsvTableView } from '../../components/CsvTableView'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { parseCsvTable, tableToCsv, type CsvTable } from '../../processors/csv'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'csv-cleaner')!

export default function CsvCleaner() {
  const [text, setText] = useState('')
  const [filename, setFilename] = useState('cleaned.csv')
  const [dedupe, setDedupe] = useState(true)
  const [trim, setTrim] = useState(true)
  const [dropEmpty, setDropEmpty] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const original = useMemo<CsvTable | null>(() => {
    if (!text.trim()) return null
    try {
      setError(null)
      return parseCsvTable(text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not parse this CSV.')
      return null
    }
  }, [text])

  const cleaned = useMemo<CsvTable | null>(() => {
    if (!original) return null
    let rows = original.rows
    if (trim) rows = rows.map((r) => r.map((c) => c.trim()))
    if (dropEmpty) rows = rows.filter((r) => r.some((c) => c.trim()))
    if (dedupe) {
      const seen = new Set<string>()
      rows = rows.filter((r) => {
        const key = r.join('')
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }
    return { headers: original.headers, rows }
  }, [original, trim, dropEmpty, dedupe])

  return (
    <ToolLayout tool={tool}>
      <CsvInput onText={(t, name) => { setText(t); if (name) setFilename(`${name.replace(/\.csv$/i, '')}-cleaned.csv`) }} />
      {error && <ErrorState message={error} />}

      {original && (
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={dedupe} onChange={(e) => setDedupe(e.target.checked)} className="accent-accent" />
            Remove duplicate rows
          </label>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} className="accent-accent" />
            Trim whitespace
          </label>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={dropEmpty} onChange={(e) => setDropEmpty(e.target.checked)} className="accent-accent" />
            Remove empty rows
          </label>
        </div>
      )}

      {original && cleaned && (
        <>
          <p className="text-sm text-text-muted">
            {original.rows.length} rows → <span className="font-medium text-success">{cleaned.rows.length} rows</span>
            {cleaned.rows.length < original.rows.length && ` (${original.rows.length - cleaned.rows.length} removed)`}
          </p>
          <CsvTableView table={cleaned} />
          <Button onClick={() => downloadBlob(new Blob([tableToCsv(cleaned)], { type: 'text/csv' }), filename)}>
            Download cleaned CSV
          </Button>
        </>
      )}
    </ToolLayout>
  )
}
