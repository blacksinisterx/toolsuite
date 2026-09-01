import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { ProgressBar } from '../../components/ProgressBar'
import { ErrorState } from '../../components/States'
import { textareaCls } from '../../components/formStyles'
import { ocrImage } from '../../processors/ocr'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'image-to-text')!

export default function ImageToText() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function process() {
    if (!file) return
    setBusy(true)
    setError(null)
    setProgress(0)
    try {
      setText(await ocrImage(file, setProgress))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read text from this image.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="image/*" hint="A photo, screenshot, or scan" onFiles={(f) => { setFile(f[0]); setText('') }} />}

      {file && (
        <p className="text-sm text-text-muted">{file.name}</p>
      )}

      {busy && <ProgressBar value={progress} label="Reading text…" />}
      {error && <ErrorState message={error} />}

      {text && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-medium text-text-muted">Extracted text</p>
            <CopyButton text={text} />
          </div>
          <textarea readOnly className={textareaCls} rows={10} value={text} />
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Reading…' : 'Extract Text'}
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
