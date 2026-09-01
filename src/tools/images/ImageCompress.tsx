import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { formatBytes } from '../../lib/format'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { convertImage } from '../../processors/image'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'image-compress')!

export default function ImageCompress() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(0.7)
  const [result, setResult] = useState<Blob | null>(null)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file) return
    await run(async () => {
      // PNG has no lossy quality knob in Canvas -- compressing a PNG means
      // re-encoding as JPEG (this only makes sense for photos, not
      // transparency); keep original format for everything else.
      const format = file.type === 'image/png' ? 'image/jpeg' : (file.type as 'image/jpeg' | 'image/webp')
      const blob = await convertImage(file, format, quality)
      setResult(blob)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="image/jpeg,image/png,image/webp" hint="JPG, PNG or WebP" onFiles={(f) => { setFile(f[0]); setResult(null) }} />}

      {file && (
        <>
          <p className="text-sm text-text-muted">
            {file.name} — {formatBytes(file.size)}
            {result && <> → <span className="font-medium text-success">{formatBytes(result.size)}</span> ({Math.round((1 - result.size / file.size) * 100)}% smaller)</>}
          </p>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="q">
              Quality — {Math.round(quality * 100)}%
            </label>
            <input
              id="q"
              type="range"
              min={0.2}
              max={0.95}
              step={0.05}
              value={quality}
              onChange={(e) => { setQuality(Number(e.target.value)); setResult(null) }}
              className="w-full accent-accent"
            />
          </div>
          {file.type === 'image/png' && (
            <p className="text-xs text-text-faint">PNG has no lossy quality setting — this converts to JPEG, so transparency will be lost.</p>
          )}
        </>
      )}

      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Compressing…' : 'Compress'}
        </Button>
        {result && (
          <Button
            variant="secondary"
            onClick={() => downloadBlob(result, `${file!.name.replace(/\.[^.]+$/, '')}-compressed.${file!.type === 'image/webp' ? 'webp' : 'jpg'}`)}
          >
            Download
          </Button>
        )}
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setResult(null) }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
