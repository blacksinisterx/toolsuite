import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { rotatePages } from '../../processors/pdf'
import { usePdfThumbnails, PdfPageGrid } from '../../components/PdfPageGrid'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'rotate-pages')!

export default function RotatePages() {
  const [file, setFile] = useState<File | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [angle, setAngle] = useState<90 | 180 | 270>(90)
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
      const blob = await rotatePages(file, [...selected], angle)
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}-rotated.pdf`)
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-muted">
              Select pages to rotate ({selected.size ? selected.size : 'all'} of {pages.length}).
            </p>
            <div className="flex gap-2">
              {([90, 180, 270] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAngle(a)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    angle === a ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'
                  }`}
                >
                  {a}°
                </button>
              ))}
            </div>
          </div>
          <PdfPageGrid pages={pages} selected={selected} onToggle={toggle} />
        </>
      )}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Rotating…' : 'Rotate PDF'}
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
