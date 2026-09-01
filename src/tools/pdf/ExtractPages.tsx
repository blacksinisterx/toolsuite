import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { extractPages } from '../../processors/pdf'
import { usePdfThumbnails, PdfPageGrid } from '../../components/PdfPageGrid'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'extract-pages')!

export default function ExtractPages() {
  const [file, setFile] = useState<File | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const { pages, loading, error: loadError } = usePdfThumbnails(file)
  const { busy, error, run } = useAsyncTask()

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  async function process() {
    if (!file) return
    await run(async () => {
      const blob = await extractPages(file, [...selected].sort((a, b) => a - b))
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}-extracted.pdf`)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="PDF files only" onFiles={(f) => setFile(f[0])} />}

      {file && loading && <p className="text-sm text-text-muted">Loading pages…</p>}
      {loadError && <ErrorState message={loadError} />}
      {error && <ErrorState message={error} />}

      {file && pages.length > 0 && (
        <>
          <p className="text-sm text-text-muted">
            Click the pages you want to keep ({selected.size} of {pages.length} selected).
          </p>
          <PdfPageGrid pages={pages} selected={selected} onToggle={toggle} />
        </>
      )}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || selected.size === 0 || busy}>
          {busy ? 'Extracting…' : `Extract ${selected.size || ''} page${selected.size === 1 ? '' : 's'}`.trim()}
        </Button>
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setSelected(new Set()) }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
