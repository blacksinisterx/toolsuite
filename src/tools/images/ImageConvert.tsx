import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { formatBytes } from '../../lib/format'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { convertImage, type ImageFormat } from '../../processors/image'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'image-convert')!
const FORMATS: { value: ImageFormat; label: string; ext: string }[] = [
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
]

export default function ImageConvert() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<ImageFormat>('image/webp')
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file) return
    await run(async () => {
      const blob = await convertImage(file, format)
      setResult({ blob, url: URL.createObjectURL(blob) })
    })
  }

  const ext = FORMATS.find((f) => f.value === format)!.ext

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="image/jpeg,image/png,image/webp" hint="JPG, PNG or WebP" onFiles={(f) => { setFile(f[0]); setResult(null) }} />}

      {file && (
        <>
          <p className="text-sm text-text-muted">{file.name} — {formatBytes(file.size)}</p>
          <div className="flex gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => { setFormat(f.value); setResult(null) }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  format === f.value ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}

      {error && <ErrorState message={error} />}

      {result && (
        <div className="flex items-center gap-4 rounded-lg border border-border bg-bg-sunken p-3">
          <img src={result.url} alt="Converted preview" className="h-16 w-16 rounded object-cover" />
          <p className="text-sm text-text-muted">New size: <span className="font-medium text-text">{formatBytes(result.blob.size)}</span></p>
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Converting…' : 'Convert'}
        </Button>
        {result && (
          <Button variant="secondary" onClick={() => downloadBlob(result.blob, `${file!.name.replace(/\.[^.]+$/, '')}.${ext}`)}>
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
