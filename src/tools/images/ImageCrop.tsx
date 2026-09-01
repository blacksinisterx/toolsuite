import { useRef, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { cropImage } from '../../processors/image'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'image-crop')!

interface Box { x: number; y: number; w: number; h: number } // fractions 0..1

export default function ImageCrop() {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState<string>('')
  const [box, setBox] = useState<Box>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 })
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const { busy, error, run } = useAsyncTask()

  function pointFromEvent(e: React.MouseEvent) {
    const rect = imgRef.current!.getBoundingClientRect()
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    }
  }

  function onMouseDown(e: React.MouseEvent) {
    const p = pointFromEvent(e)
    setDragStart(p)
    setBox({ x: p.x, y: p.y, w: 0, h: 0 })
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragStart) return
    const p = pointFromEvent(e)
    setBox({
      x: Math.min(dragStart.x, p.x),
      y: Math.min(dragStart.y, p.y),
      w: Math.abs(p.x - dragStart.x),
      h: Math.abs(p.y - dragStart.y),
    })
  }

  async function process() {
    if (!file || !imgRef.current) return
    await run(async () => {
      const naturalW = imgRef.current!.naturalWidth
      const naturalH = imgRef.current!.naturalHeight
      const cropBox = {
        x: Math.round(box.x * naturalW),
        y: Math.round(box.y * naturalH),
        width: Math.round(box.w * naturalW),
        height: Math.round(box.h * naturalH),
      }
      if (cropBox.width < 2 || cropBox.height < 2) throw new Error('Draw a crop area on the image first.')
      const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const blob = await cropImage(file, cropBox, format)
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, '')}-cropped.${format === 'image/png' ? 'png' : 'jpg'}`)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && (
        <DropZone
          accept="image/*"
          hint="Any common image format"
          onFiles={(f) => {
            setFile(f[0])
            setUrl(URL.createObjectURL(f[0]))
          }}
        />
      )}

      {file && (
        <>
          <p className="text-sm text-text-muted">Drag on the image to select the area to keep.</p>
          <div
            className="relative select-none"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={() => setDragStart(null)}
            onMouseLeave={() => setDragStart(null)}
          >
            <img ref={imgRef} src={url} alt="To crop" className="w-full rounded-lg border border-border" draggable={false} />
            <div
              className="absolute border-2 border-accent bg-accent/10"
              style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` }}
            />
          </div>
        </>
      )}

      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Cropping…' : 'Crop & Download'}
        </Button>
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setUrl('') }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
