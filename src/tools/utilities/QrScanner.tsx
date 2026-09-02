import { useState } from 'react'
import jsQR from 'jsqr'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { ErrorState } from '../../components/States'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'qr-scanner')!

async function decode(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const result = jsQR(imageData.data, imageData.width, imageData.height)
  if (!result) throw new Error("Couldn't find a QR code in this image.")
  return result.data
}

export default function QrScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const { busy, error, run } = useAsyncTask()

  function pick(f: File) {
    setFile(f)
    setResult(null)
    setPreview(URL.createObjectURL(f))
    run(async () => setResult(await decode(f)))
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="image/*" hint="A photo or screenshot containing a QR code" onFiles={(f) => pick(f[0])} />}

      {file && (
        <div className="flex flex-col items-center gap-3">
          <img src={preview} alt="Uploaded" className="max-h-64 rounded-lg border border-border object-contain" />
          <Button variant="ghost" onClick={() => { setFile(null); setResult(null) }}>Try another image</Button>
        </div>
      )}

      {busy && <p className="text-sm text-text-muted">Scanning…</p>}
      {error && <ErrorState message={error} />}

      {result && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Decoded content</span>
            <CopyButton text={result} />
          </div>
          <p className="break-all rounded-lg border border-border bg-bg-sunken px-4 py-3 font-mono text-sm text-text">{result}</p>
          {/^https?:\/\//.test(result) && (
            <a href={result} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-accent hover:underline">Open link →</a>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
