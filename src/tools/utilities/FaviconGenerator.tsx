import { useState } from 'react'
import JSZip from 'jszip'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'favicon-generator')!

const SIZES = [16, 32, 48, 180, 192, 512]

async function resize(bitmap: ImageBitmap, size: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, size, size)
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not render this size.'))), 'image/png')
  })
}

export default function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const { busy, error, run } = useAsyncTask()

  async function generate() {
    if (!file) return
    await run(async () => {
      const bitmap = await createImageBitmap(file)
      const zip = new JSZip()
      for (const size of SIZES) {
        const blob = await resize(bitmap, size)
        zip.file(`favicon-${size}x${size}.png`, blob)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(zipBlob, 'favicons.zip')
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && (
        <DropZone
          accept="image/*"
          hint="A square image works best (PNG, JPG, or WebP)"
          onFiles={(f) => { setFile(f[0]); setPreview(URL.createObjectURL(f[0])) }}
        />
      )}

      {file && (
        <div className="flex flex-col items-center gap-3">
          <img src={preview} alt="Uploaded" className="h-32 w-32 rounded-lg border border-border object-cover" />
          <p className="text-sm text-text-muted">Generates {SIZES.join(', ')}px PNGs, bundled as a ZIP.</p>
        </div>
      )}

      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={generate} disabled={!file || busy}>{busy ? 'Generating…' : 'Generate & Download ZIP'}</Button>
        {file && <Button variant="ghost" onClick={() => setFile(null)}>Reset</Button>}
      </div>
    </ToolLayout>
  )
}
