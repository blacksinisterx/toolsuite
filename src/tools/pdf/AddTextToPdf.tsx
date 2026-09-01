import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { inputCls, labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { addTextToPdf } from '../../processors/pdf'
import { usePdfThumbnails } from '../../components/PdfPageGrid'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'pdf-add-text')!

export default function AddTextToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const { pages, loading, error: loadError } = usePdfThumbnails(file)
  const [pageIndex, setPageIndex] = useState<number | null>(null)
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null)
  const [text, setText] = useState('Your text here')
  const [size, setSize] = useState(18)
  const [color, setColor] = useState('#10241e')
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file || pageIndex === null || !point) return
    await run(async () => {
      const blob = await addTextToPdf(file, pageIndex, point.x, point.y, text, size, color)
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}-edited.pdf`)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="PDF files only" onFiles={(f) => setFile(f[0])} />}

      {file && loading && <p className="text-sm text-text-muted">Loading pages…</p>}
      {loadError && <ErrorState message={loadError} />}

      {file && pages.length > 0 && pageIndex === null && (
        <>
          <p className="text-sm text-text-muted">Pick a page to add text to.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {pages.map((src, i) => (
              <button key={i} type="button" onClick={() => setPageIndex(i)} className="overflow-hidden rounded-lg border-2 border-border hover:border-accent">
                <img src={src} alt={`Page ${i + 1}`} className="w-full bg-white" />
              </button>
            ))}
          </div>
        </>
      )}

      {file && pageIndex !== null && (
        <>
          <p className="text-sm text-text-muted">Click on the page to place your text.</p>
          <div
            className="relative cursor-crosshair select-none"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setPoint({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
            }}
          >
            <img src={pages[pageIndex]} alt={`Page ${pageIndex + 1}`} className="w-full rounded-lg border border-border bg-white" draggable={false} />
            {point && (
              <span
                className="absolute -translate-y-1/2 whitespace-nowrap font-medium"
                style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, fontSize: Math.max(10, size * 0.6), color }}
              >
                {text}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <label className={labelCls} htmlFor="text">Text</label>
              <input id="text" className={inputCls} value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="size">Font size</label>
              <input id="size" type="number" min={6} max={72} className={inputCls} value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls} htmlFor="color">Color</label>
              <input id="color" type="color" className="h-10 w-full rounded-lg border border-border" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>

          {error && <ErrorState message={error} />}

          <div className="flex gap-3">
            <Button onClick={process} disabled={!point || !text.trim() || busy}>
              {busy ? 'Applying…' : 'Add Text & Download'}
            </Button>
            <Button variant="ghost" onClick={() => { setPageIndex(null); setPoint(null) }}>
              Choose a different page
            </Button>
          </div>
        </>
      )}
    </ToolLayout>
  )
}
