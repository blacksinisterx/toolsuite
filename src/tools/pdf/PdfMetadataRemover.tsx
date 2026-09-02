import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { readPdfMetadata, removePdfMetadata, type PdfMetadata } from '../../processors/pdf'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'pdf-metadata-remover')!

const FIELDS: { key: keyof PdfMetadata; label: string }[] = [
  { key: 'title', label: 'Title' },
  { key: 'author', label: 'Author' },
  { key: 'subject', label: 'Subject' },
  { key: 'keywords', label: 'Keywords' },
  { key: 'producer', label: 'Producer' },
  { key: 'creator', label: 'Creator' },
]

export default function PdfMetadataRemover() {
  const [file, setFile] = useState<File | null>(null)
  const [meta, setMeta] = useState<PdfMetadata | null>(null)
  const [done, setDone] = useState(false)
  const { busy, error, run } = useAsyncTask()

  async function pick(f: File) {
    setFile(f)
    setDone(false)
    setMeta(await readPdfMetadata(f))
  }

  async function process() {
    if (!file) return
    await run(async () => {
      const blob = await removePdfMetadata(file)
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}-clean.pdf`)
      setDone(true)
    })
  }

  const hasMeta = meta && Object.values(meta).some((v) => v.trim())

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="Any PDF" onFiles={(f) => pick(f[0])} />}

      {file && meta && (
        <>
          <p className="text-sm text-text-muted">{file.name}</p>
          {hasMeta ? (
            <div className="flex flex-col gap-2">
              {FIELDS.filter((f) => meta[f.key].trim()).map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-sunken px-4 py-2.5">
                  <span className="text-xs font-medium text-text-muted">{f.label}</span>
                  <span className="truncate text-sm text-text">{meta[f.key]}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-border bg-bg-sunken px-4 py-3 text-sm text-text-muted">No metadata fields are set on this PDF already.</p>
          )}
        </>
      )}

      {error && <ErrorState message={error} />}
      {done && !error && <p className="text-sm text-success">Cleaned copy downloaded — metadata removed.</p>}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>{busy ? 'Cleaning…' : 'Remove Metadata'}</Button>
        {file && <Button variant="ghost" onClick={() => { setFile(null); setMeta(null); setDone(false) }}>Reset</Button>}
      </div>
    </ToolLayout>
  )
}
