import { useEffect, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { inputCls, labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { extractPages, getPageCount, parsePageRanges } from '../../processors/pdf'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'split-pdf')!

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [ranges, setRanges] = useState('')
  const { busy, error, run } = useAsyncTask()

  useEffect(() => {
    if (!file) return
    getPageCount(file).then(setPageCount).catch(() => setPageCount(0))
  }, [file])

  async function process() {
    if (!file) return
    await run(async () => {
      const groups = ranges.split(';').map((g) => g.trim()).filter(Boolean)
      if (groups.length === 0) throw new Error('Enter at least one page range, e.g. "1-3" or "1-3;4-6".')
      const base = file.name.replace(/\.pdf$/i, '')
      for (let i = 0; i < groups.length; i++) {
        const indices = parsePageRanges(groups[i], pageCount)
        if (indices.length === 0) throw new Error(`"${groups[i]}" doesn't match any real page (this PDF has ${pageCount} pages).`)
        const blob = await extractPages(file, indices)
        downloadBlob(blob, `${base}-part${i + 1}.pdf`)
        // Small gap so the browser doesn't treat rapid downloads as a popup flood.
        await new Promise((r) => setTimeout(r, 250))
      }
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="application/pdf" hint="PDF files only" onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <p className="text-sm text-text-muted">{file.name} — {pageCount} page{pageCount === 1 ? '' : 's'}</p>
          <div>
            <label className={labelCls} htmlFor="ranges">
              Page ranges — separate multiple output files with a semicolon
            </label>
            <input
              id="ranges"
              className={inputCls}
              placeholder="e.g. 1-3;4-6;7-10"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
            />
          </div>
        </>
      )}

      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || !ranges.trim() || busy}>
          {busy ? 'Splitting…' : 'Split PDF'}
        </Button>
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setRanges('') }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
