import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { formatBytes } from '../../lib/format'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { compressPdf } from '../../processors/pdf'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'compress-pdf')!

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Blob | null>(null)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file) return
    await run(async () => {
      const blob = await compressPdf(file)
      setResult(blob)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="PDF files only" onFiles={(f) => { setFile(f[0]); setResult(null) }} />}

      {file && (
        <p className="text-sm text-text-muted">
          {file.name} — {formatBytes(file.size)}
          {result && <> → <span className="font-medium text-success">{formatBytes(result.size)}</span> ({Math.round((1 - result.size / file.size) * 100)}% smaller)</>}
        </p>
      )}

      <p className="text-xs text-text-faint">
        This re-packs the PDF's internal structure. It works best on PDFs with a lot of repeated fonts/objects — a
        scanned, image-heavy PDF won't shrink much this way, since that needs recompressing the embedded images
        themselves (coming in a later phase).
      </p>

      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Compressing…' : 'Compress PDF'}
        </Button>
        {result && (
          <Button
            variant="secondary"
            onClick={() => downloadBlob(result, `${file!.name.replace(/\.pdf$/i, '')}-compressed.pdf`)}
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
