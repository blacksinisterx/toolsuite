import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { inputCls, labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { watermarkPdf } from '../../processors/pdf'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'watermark-pdf')!

export default function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState(0.3)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file) return
    await run(async () => {
      const blob = await watermarkPdf(file, text, opacity)
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}-watermarked.pdf`)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="PDF files only" onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <p className="text-sm text-text-muted">{file.name}</p>
          <div>
            <label className={labelCls} htmlFor="wm-text">Watermark text</label>
            <input id="wm-text" className={inputCls} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="wm-opacity">Opacity — {Math.round(opacity * 100)}%</label>
            <input
              id="wm-opacity"
              type="range"
              min={0.1}
              max={0.8}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
        </>
      )}

      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || !text.trim() || busy}>
          {busy ? 'Applying…' : 'Add Watermark'}
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
