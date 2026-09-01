import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { removeImageMetadata } from '../../processors/image'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'image-metadata')!

export default function ImageMetadataRemover() {
  const [file, setFile] = useState<File | null>(null)
  const [done, setDone] = useState(false)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file) return
    await run(async () => {
      const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const blob = await removeImageMetadata(file, format)
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, '')}-clean.${format === 'image/png' ? 'png' : 'jpg'}`)
      setDone(true)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="image/*" hint="Any common image format" onFiles={(f) => { setFile(f[0]); setDone(false) }} />}

      {file && (
        <p className="text-sm text-text-muted">
          {file.name} — re-encoding this image will strip EXIF, GPS location, camera model, and every other
          metadata field. Only the visible pixels are kept.
        </p>
      )}

      {error && <ErrorState message={error} />}
      {done && !error && <p className="text-sm text-success">Cleaned copy downloaded — metadata removed.</p>}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Cleaning…' : 'Remove Metadata'}
        </Button>
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setDone(false) }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
