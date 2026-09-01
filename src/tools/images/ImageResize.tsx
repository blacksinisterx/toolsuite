import { useEffect, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { inputCls, labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { loadImage, resizeImage } from '../../processors/image'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'image-resize')!

export default function ImageResize() {
  const [file, setFile] = useState<File | null>(null)
  const [original, setOriginal] = useState<{ w: number; h: number } | null>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [lockAspect, setLockAspect] = useState(true)
  const { busy, error, run } = useAsyncTask()

  useEffect(() => {
    if (!file) return
    loadImage(file).then((img) => {
      setOriginal({ w: img.naturalWidth, h: img.naturalHeight })
      setWidth(img.naturalWidth)
      setHeight(img.naturalHeight)
    })
  }, [file])

  function onWidth(v: number) {
    setWidth(v)
    if (lockAspect && original) setHeight(Math.round((v * original.h) / original.w))
  }
  function onHeight(v: number) {
    setHeight(v)
    if (lockAspect && original) setWidth(Math.round((v * original.w) / original.h))
  }

  async function process() {
    if (!file) return
    await run(async () => {
      const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const blob = await resizeImage(file, { width, height }, format)
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, '')}-resized.${format === 'image/png' ? 'png' : 'jpg'}`)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="image/*" hint="Any common image format" onFiles={(f) => setFile(f[0])} />}

      {file && original && (
        <>
          <p className="text-sm text-text-muted">Original: {original.w} × {original.h}px</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="w">Width (px)</label>
              <input id="w" type="number" min={1} className={inputCls} value={width} onChange={(e) => onWidth(Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls} htmlFor="h">Height (px)</label>
              <input id="h" type="number" min={1} className={inputCls} value={height} onChange={(e) => onHeight(Number(e.target.value))} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="accent-accent" />
            Lock aspect ratio
          </label>
        </>
      )}

      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || width < 1 || height < 1 || busy}>
          {busy ? 'Resizing…' : 'Resize & Download'}
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
