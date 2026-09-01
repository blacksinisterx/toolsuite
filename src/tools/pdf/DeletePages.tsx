import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { deletePages } from '../../processors/pdf'
import { usePdfThumbnails, PdfPageGrid } from '../../components/PdfPageGrid'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'delete-pages')!

export default function DeletePages() {
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
      const blob = await deletePages(file, [...selected])
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}-edited.pdf`)
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
            Click the pages you want to delete ({selected.size} of {pages.length} selected).
          </p>
          <PdfPageGrid pages={pages} selected={selected} onToggle={toggle} />
        </>
      )}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || selected.size === 0 || selected.size === pages.length || busy} variant="danger">
          {busy ? 'Deleting…' : `Delete ${selected.size || ''} page${selected.size === 1 ? '' : 's'}`.trim()}
        </Button>
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setSelected(new Set()) }}>
            Reset
          </Button>
        )}
      </div>
      {selected.size > 0 && selected.size === pages.length && (
        <p className="text-xs text-warning">Can't delete every page -- a PDF needs at least one page left.</p>
      )}
    </ToolLayout>
  )
}
