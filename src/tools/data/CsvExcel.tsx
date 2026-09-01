import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { CsvInput } from '../../components/CsvInput'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { csvToXlsx, xlsxToCsv } from '../../processors/spreadsheet'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'csv-excel')!

export default function CsvExcel() {
  const [mode, setMode] = useState<'csv-to-xlsx' | 'xlsx-to-csv'>('csv-to-xlsx')
  const [csvText, setCsvText] = useState('')
  const [xlsxFile, setXlsxFile] = useState<File | null>(null)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    await run(async () => {
      if (mode === 'csv-to-xlsx') {
        if (!csvText.trim()) throw new Error('Paste or upload a CSV first.')
        downloadBlob(await csvToXlsx(csvText), 'converted.xlsx')
      } else {
        if (!xlsxFile) throw new Error('Upload an Excel file first.')
        const csv = await xlsxToCsv(xlsxFile)
        downloadBlob(new Blob([csv], { type: 'text/csv' }), `${xlsxFile.name.replace(/\.xlsx?$/i, '')}.csv`)
      }
    })
  }

  return (
    <ToolLayout tool={tool}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('csv-to-xlsx')}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'csv-to-xlsx' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
        >
          CSV → Excel
        </button>
        <button
          type="button"
          onClick={() => setMode('xlsx-to-csv')}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'xlsx-to-csv' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
        >
          Excel → CSV
        </button>
      </div>

      {mode === 'csv-to-xlsx' ? (
        <CsvInput onText={setCsvText} />
      ) : (
        <DropZone accept=".xlsx,.xls" hint="An Excel .xlsx or .xls file" onFiles={(f) => setXlsxFile(f[0])} />
      )}

      {xlsxFile && mode === 'xlsx-to-csv' && <p className="text-sm text-text-muted">{xlsxFile.name}</p>}

      {error && <ErrorState message={error} />}

      <Button onClick={process} disabled={busy}>
        {busy ? 'Converting…' : 'Convert & Download'}
      </Button>
    </ToolLayout>
  )
}
