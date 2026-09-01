import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { pdfPagesToJpgBlobs } from '../../processors/pdfRender'
import { usePdfThumbnails } from '../../components/PdfPageGrid'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'pdf-to-jpg')!

export default function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null)
  const { pages, loading, error: loadError } = usePdfThumbnails(file)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file) return
    await run(async () => {
      const blobs = await pdfPagesToJpgBlobs(file, 2)
      const base = file.name.replace(/\.pdf$/i, '')
      for (let i = 0; i < blobs.length; i++) {
        downloadBlob(blobs[i], `${base}-page-${i + 1}.jpg`)
        await new Promise((r) => setTimeout(r, 200))
      }
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="PDF files only" onFiles={(f) => setFile(f[0])} />}

      {file && loading && <p className="text-sm text-text-muted">Rendering pages…</p>}
      {loadError && <ErrorState message={loadError} />}
      {error && <ErrorState message={error} />}

      {file && pages.length > 0 && (
        <>
          <p className="text-sm text-text-muted">{pages.length} page{pages.length === 1 ? '' : 's'} will be exported as JPG images.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {pages.map((src, i) => (
              <img key={i} src={src} alt={`Page ${i + 1}`} className="w-full rounded-lg border border-border bg-white" />
            ))}
          </div>
        </>
      )}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Exporting…' : `Export ${pages.length || ''} JPG${pages.length === 1 ? '' : 's'}`.trim()}
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
