import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { inputCls, labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { pdfToEpub } from '../../processors/epub'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'pdf-to-epub')!

export default function PdfToEpub() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [done, setDone] = useState(false)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file) return
    await run(async () => {
      const t = title || file.name.replace(/\.pdf$/i, '')
      const blob = await pdfToEpub(file, t, author)
      downloadBlob(blob, `${t.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'book'}.epub`)
      setDone(true)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="A PDF with real, selectable text -- not a scan" onFiles={(f) => { setFile(f[0]); setTitle(f[0].name.replace(/\.pdf$/i, '')); setDone(false) }} />}

      {file && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="title">Title</label>
            <input id="title" className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="author">Author (optional)</label>
            <input id="author" className={inputCls} value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
        </div>
      )}

      {done && !error && <p className="text-sm text-success">EPUB downloaded.</p>}
      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>{busy ? 'Converting…' : 'Convert to EPUB'}</Button>
        {file && <Button variant="ghost" onClick={() => { setFile(null); setDone(false) }}>Reset</Button>}
      </div>

      <p className="text-xs text-text-faint">
        Extracts the PDF's real embedded text layer and wraps it as a single-chapter EPUB3 file. Needs a PDF
        with real text (not a scan) -- for scanned PDFs, run OCR first.
      </p>
    </ToolLayout>
  )
}
