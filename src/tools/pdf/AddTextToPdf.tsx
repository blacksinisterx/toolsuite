import { useRef, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { inputCls, labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { applyAnnotations, type Annotation } from '../../processors/pdf'
import { usePdfThumbnails } from '../../components/PdfPageGrid'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'pdf-add-text')!

type ToolKind = 'text' | 'highlight' | 'rect'

export default function AddTextToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const { pages, loading, error: loadError } = usePdfThumbnails(file)
  const [pageIndex, setPageIndex] = useState(0)
  const [annotations, setAnnotations] = useState<Annotation[]>([])

  const [activeTool, setActiveTool] = useState<ToolKind>('text')
  const [text, setText] = useState('Your text here')
  const [size, setSize] = useState(18)
  const [color, setColor] = useState('#10241e')

  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const [dragNow, setDragNow] = useState<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const { busy, error, run } = useAsyncTask()

  function pointFromEvent(e: React.MouseEvent) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    }
  }

  function onCanvasClick(e: React.MouseEvent) {
    if (activeTool !== 'text' || !text.trim()) return
    const p = pointFromEvent(e)
    setAnnotations((prev) => [...prev, { kind: 'text', pageIndex, x: p.x, y: p.y, text, size, color }])
  }
  function onMouseDown(e: React.MouseEvent) {
    if (activeTool === 'text') return
    const p = pointFromEvent(e)
    setDrag(p)
    setDragNow(p)
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!drag) return
    setDragNow(pointFromEvent(e))
  }
  function onMouseUp() {
    if (!drag || !dragNow || activeTool === 'text') return
    const x = Math.min(drag.x, dragNow.x)
    const y = Math.min(drag.y, dragNow.y)
    const w = Math.abs(dragNow.x - drag.x)
    const h = Math.abs(dragNow.y - drag.y)
    if (w > 0.01 && h > 0.01) {
      setAnnotations((prev) => [...prev, { kind: activeTool, pageIndex, x, y, w, h, color }])
    }
    setDrag(null)
    setDragNow(null)
  }

  function removeAnnotation(i: number) {
    setAnnotations((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function process() {
    if (!file || annotations.length === 0) return
    await run(async () => {
      const blob = await applyAnnotations(file, annotations)
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}-edited.pdf`)
    })
  }

  const onThisPage = annotations.map((a, i) => ({ a, i })).filter(({ a }) => a.pageIndex === pageIndex)
  const liveRect = drag && dragNow ? {
    left: `${Math.min(drag.x, dragNow.x) * 100}%`, top: `${Math.min(drag.y, dragNow.y) * 100}%`,
    width: `${Math.abs(dragNow.x - drag.x) * 100}%`, height: `${Math.abs(dragNow.y - drag.y) * 100}%`,
  } : null

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="PDF files only" onFiles={(f) => { setFile(f[0]); setAnnotations([]) }} />}

      {file && loading && <p className="text-sm text-text-muted">Loading pages…</p>}
      {loadError && <ErrorState message={loadError} />}

      {file && pages.length > 0 && (
        <>
          {pages.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {pages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPageIndex(i)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${i === pageIndex ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
                >
                  Page {i + 1}{annotations.some((a) => a.pageIndex === i) ? ` (${annotations.filter((a) => a.pageIndex === i).length})` : ''}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-bg-sunken p-3">
            <div className="flex gap-2">
              {(['text', 'highlight', 'rect'] as ToolKind[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTool(t)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium capitalize ${activeTool === t ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
                >
                  {t === 'rect' ? 'Rectangle' : t}
                </button>
              ))}
            </div>
            {activeTool === 'text' && (
              <>
                <div className="flex-1 min-w-[140px]">
                  <label className={labelCls} htmlFor="text">Text</label>
                  <input id="text" className={inputCls} value={text} onChange={(e) => setText(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="size">Size</label>
                  <input id="size" type="number" min={6} max={72} className={`${inputCls} w-20`} value={size} onChange={(e) => setSize(Number(e.target.value))} />
                </div>
              </>
            )}
            <div>
              <label className={labelCls} htmlFor="color">Color</label>
              <input id="color" type="color" className="h-10 w-14 rounded-lg border border-border" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>

          <p className="text-sm text-text-muted">
            {activeTool === 'text' ? 'Click on the page to place text -- add as many as you like.' : `Drag on the page to draw a ${activeTool}.`}
          </p>

          <div
            ref={canvasRef}
            className="relative cursor-crosshair select-none overflow-hidden rounded-lg border border-border"
            onClick={onCanvasClick}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
          >
            <img src={pages[pageIndex]} alt={`Page ${pageIndex + 1}`} className="w-full bg-white" draggable={false} />
            {onThisPage.map(({ a, i }) => {
              if (a.kind === 'text') {
                return (
                  <span
                    key={i}
                    className="group absolute -translate-y-1/2 whitespace-nowrap font-medium"
                    style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%`, fontSize: Math.max(10, a.size * 0.6), color: a.color }}
                  >
                    {a.text}
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeAnnotation(i) }} className="ml-1 hidden rounded bg-black/70 px-1 text-[10px] text-white group-hover:inline">✕</button>
                  </span>
                )
              }
              return (
                <span
                  key={i}
                  className="group absolute"
                  style={{
                    left: `${a.x * 100}%`, top: `${a.y * 100}%`, width: `${a.w * 100}%`, height: `${a.h * 100}%`,
                    background: a.kind === 'highlight' ? a.color : 'transparent',
                    opacity: a.kind === 'highlight' ? 0.4 : 1,
                    border: a.kind === 'rect' ? `2px solid ${a.color}` : undefined,
                  }}
                >
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeAnnotation(i) }} className="absolute -right-2 -top-2 hidden h-4 w-4 rounded-full bg-black/70 text-[10px] leading-4 text-white group-hover:block">✕</button>
                </span>
              )
            })}
            {liveRect && <span className="absolute border-2 border-dashed" style={{ ...liveRect, borderColor: color }} />}
          </div>

          {error && <ErrorState message={error} />}

          <div className="flex items-center gap-3">
            <Button onClick={process} disabled={annotations.length === 0 || busy}>
              {busy ? 'Applying…' : `Apply ${annotations.length || ''} Edit${annotations.length === 1 ? '' : 's'} & Download`.replace('  ', ' ')}
            </Button>
            <Button variant="ghost" onClick={() => { setFile(null); setAnnotations([]); setPageIndex(0) }}>
              Choose a different PDF
            </Button>
            {annotations.length > 0 && (
              <Button variant="ghost" onClick={() => setAnnotations([])}>
                Clear all edits
              </Button>
            )}
          </div>
        </>
      )}
    </ToolLayout>
  )
}
