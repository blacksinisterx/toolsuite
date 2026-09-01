import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState, EmptyState } from '../../components/States'
import { formatBytes } from '../../lib/format'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { mergePdfs } from '../../processors/pdf'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'merge-pdf')!

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([])
  const { busy, error, run } = useAsyncTask()
  const [done, setDone] = useState(false)

  function move(index: number, dir: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function remove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setDone(false)
  }

  async function process() {
    await run(async () => {
      const blob = await mergePdfs(files)
      downloadBlob(blob, 'merged.pdf')
      setDone(true)
    })
  }

  return (
    <ToolLayout tool={tool}>
      <DropZone
        accept="application/pdf"
        multiple
        hint="PDF files only"
        onFiles={(f) => {
          setFiles((prev) => [...prev, ...f.filter((x) => x.type === 'application/pdf')])
          setDone(false)
        }}
      />

      {files.length === 0 && <EmptyState message="Add two or more PDFs to merge them, in the order shown below." />}

      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm">
              <span className="w-5 text-center text-xs text-text-faint tabular-nums">{i + 1}</span>
              <span className="flex-1 truncate text-text">{file.name}</span>
              <span className="shrink-0 text-xs text-text-faint tabular-nums">{formatBytes(file.size)}</span>
              <span className="flex shrink-0 gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="text-text-faint hover:text-text disabled:opacity-30">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === files.length - 1} aria-label="Move down" className="text-text-faint hover:text-text disabled:opacity-30">↓</button>
                <button type="button" onClick={() => remove(i)} aria-label={`Remove ${file.name}`} className="text-text-faint hover:text-danger">✕</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <ErrorState message={error} />}
      {done && !error && <p className="text-sm text-success">Merged PDF downloaded.</p>}

      <div className="flex gap-3">
        <Button onClick={process} disabled={files.length < 2 || busy}>
          {busy ? 'Merging…' : 'Merge PDFs'}
        </Button>
        {files.length > 0 && (
          <Button variant="ghost" onClick={() => { setFiles([]); setDone(false) }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
