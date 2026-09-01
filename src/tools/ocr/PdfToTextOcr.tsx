import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { ProgressBar } from '../../components/ProgressBar'
import { ErrorState } from '../../components/States'
import { textareaCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { ocrPdf } from '../../processors/ocr'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'pdf-to-text-ocr')!

export default function PdfToTextOcr() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function process() {
    if (!file) return
    setBusy(true)
    setError(null)
    setProgress(null)
    try {
      setText(await ocrPdf(file, (done, total) => setProgress({ done, total })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read text from this PDF.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="A scanned or image-based PDF" onFiles={(f) => { setFile(f[0]); setText('') }} />}

      {file && <p className="text-sm text-text-muted">{file.name}</p>}

      {busy && progress && (
        <ProgressBar value={(progress.done / progress.total) * 100} label={`OCR: page ${progress.done} of ${progress.total}`} />
      )}
      {error && <ErrorState message={error} />}

      {text && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-medium text-text-muted">Extracted text</p>
            <div className="flex gap-2">
              <CopyButton text={text} />
              <Button variant="secondary" onClick={() => downloadBlob(new Blob([text], { type: 'text/plain' }), `${file!.name.replace(/\.pdf$/i, '')}.txt`)}>
                Download .txt
              </Button>
            </div>
          </div>
          <textarea readOnly className={textareaCls} rows={12} value={text} />
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Reading…' : 'Extract Text (OCR)'}
        </Button>
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setText(''); setError(null) }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
