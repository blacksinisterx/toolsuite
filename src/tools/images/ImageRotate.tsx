import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { rotateImage } from '../../processors/image'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'image-rotate')!

export default function ImageRotate() {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [angle, setAngle] = useState<0 | 90 | 180 | 270>(0)
  const [flip, setFlip] = useState(false)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file) return
    await run(async () => {
      const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const blob = await rotateImage(file, angle, flip, format)
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, '')}-rotated.${format === 'image/png' ? 'png' : 'jpg'}`)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && (
        <DropZone accept="image/*" hint="Any common image format" onFiles={(f) => { setFile(f[0]); setUrl(URL.createObjectURL(f[0])) }} />
      )}

      {file && (
        <>
          <div className="flex justify-center overflow-hidden rounded-lg border border-border bg-bg-sunken p-4">
            <img
              src={url}
              alt="Preview"
              className="max-h-64 transition-transform"
              style={{ transform: `rotate(${angle}deg) scaleX(${flip ? -1 : 1})` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {([0, 90, 180, 270] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAngle(a)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  angle === a ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'
                }`}
              >
                {a}°
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFlip((v) => !v)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                flip ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'
              }`}
            >
              Flip horizontal
            </button>
          </div>
        </>
      )}

      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Applying…' : 'Rotate & Download'}
        </Button>
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setUrl(''); setAngle(0); setFlip(false) }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
