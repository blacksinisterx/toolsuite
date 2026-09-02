import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { ErrorState } from '../../components/States'
import { textareaCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { extractPdfText } from '../../processors/pdfRender'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'pdf-to-text')!

export default function PdfToText() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file) return
    await run(async () => {
      const result = await extractPdfText(file)
      if (!result.trim()) throw new Error("This PDF has no embedded text layer -- it's likely a scan. Try the OCR tool instead.")
      setText(result)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="A PDF with real, selectable text -- not a scan" onFiles={(f) => { setFile(f[0]); setText('') }} />}

      {file && <p className="text-sm text-text-muted">{file.name}</p>}

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
          <textarea readOnly className={textareaCls} rows={14} value={text} />
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Reading…' : 'Extract Text'}
        </Button>
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setText('') }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
