import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { inputCls, labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { addPageNumbers, type NumberPosition } from '../../processors/pdf'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'pdf-page-numbers')!
const POSITIONS: NumberPosition[] = ['bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right']

export default function PageNumbers() {
  const [file, setFile] = useState<File | null>(null)
  const [position, setPosition] = useState<NumberPosition>('bottom-center')
  const [format, setFormat] = useState('Page {n} of {total}')
  const [startAt, setStartAt] = useState(1)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file) return
    await run(async () => {
      const blob = await addPageNumbers(file, position, format, startAt)
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}-numbered.pdf`)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="PDF files only" onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <p className="text-sm text-text-muted">{file.name}</p>

          <div>
            <label className={labelCls}>Position</label>
            <div className="grid grid-cols-3 gap-2">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosition(p)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize ${position === p ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
                >
                  {p.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="format">Format — {'{n}'} and {'{total}'} are placeholders</label>
              <input id="format" className={inputCls} value={format} onChange={(e) => setFormat(e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="start">Start numbering at</label>
              <input id="start" type="number" min={0} className={inputCls} value={startAt} onChange={(e) => setStartAt(Number(e.target.value))} />
            </div>
          </div>
        </>
      )}

      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Applying…' : 'Add Page Numbers'}
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
