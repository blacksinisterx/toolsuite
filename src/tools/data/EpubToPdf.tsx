import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { parseEpub } from '../../processors/epub'
import { textChaptersToPdf } from '../../processors/pdf'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'epub-to-pdf')!

export default function EpubToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [meta, setMeta] = useState<{ title: string; chapterCount: number } | null>(null)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!file) return
    await run(async () => {
      const parsed = await parseEpub(file)
      setMeta({ title: parsed.title, chapterCount: parsed.chapters.length })
      const blob = await textChaptersToPdf(parsed.chapters, parsed.title)
      downloadBlob(blob, `${parsed.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'book'}.pdf`)
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept=".epub,application/epub+zip" hint="An .epub file" onFiles={(f) => { setFile(f[0]); setMeta(null) }} />}

      {file && <p className="text-sm text-text-muted">{file.name}</p>}
      {meta && <p className="text-sm text-success">Converted "{meta.title}" -- {meta.chapterCount} chapter{meta.chapterCount === 1 ? '' : 's'} downloaded.</p>}
      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>{busy ? 'Converting…' : 'Convert to PDF'}</Button>
        {file && <Button variant="ghost" onClick={() => { setFile(null); setMeta(null) }}>Reset</Button>}
      </div>

      <p className="text-xs text-text-faint">
        Reads the EPUB's real chapters in their actual reading order and lays the text out as a clean, paginated
        PDF. Text only -- original fonts, images and CSS styling aren't carried over.
      </p>
    </ToolLayout>
  )
}
