import { useEffect, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { reorderPages } from '../../processors/pdf'
import { usePdfThumbnails } from '../../components/PdfPageGrid'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'reorder-pages')!

export default function ReorderPages() {
  const [file, setFile] = useState<File | null>(null)
  const { pages, loading, error: loadError } = usePdfThumbnails(file)
  const [order, setOrder] = useState<number[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const { busy, error, run } = useAsyncTask()

  useEffect(() => {
    setOrder(pages.map((_, i) => i))
  }, [pages])

  function dropOn(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return
    setOrder((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setDragIndex(null)
  }

  async function process() {
    if (!file) return
    await run(async () => {
      const blob = await reorderPages(file, order)
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}-reordered.pdf`)
    })
  }

  const isChanged = order.some((p, i) => p !== i)

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="PDF files only" onFiles={(f) => setFile(f[0])} />}

      {file && loading && <p className="text-sm text-text-muted">Loading pages…</p>}
      {loadError && <ErrorState message={loadError} />}
      {error && <ErrorState message={error} />}

      {file && pages.length > 0 && (
        <>
          <p className="text-sm text-text-muted">Drag pages to reorder them.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {order.map((pageIndex, slot) => (
              <div
                key={pageIndex}
                draggable
                onDragStart={() => setDragIndex(slot)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dropOn(slot)}
                className="relative cursor-grab overflow-hidden rounded-lg border-2 border-border active:cursor-grabbing"
              >
                <img src={pages[pageIndex]} alt={`Page ${pageIndex + 1}`} className="w-full bg-white" />
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] font-semibold text-white">
                  {slot + 1}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || !isChanged || busy}>
          {busy ? 'Saving…' : 'Save New Order'}
        </Button>
        {file && (
          <Button variant="ghost" onClick={() => setFile(null)}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
