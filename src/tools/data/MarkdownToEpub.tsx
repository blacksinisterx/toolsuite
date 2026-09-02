import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { textareaCls, labelCls, inputCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { markdownToEpub } from '../../processors/epub'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'markdown-to-epub')!

const SAMPLE = `# Chapter One

Start writing your book here in **Markdown**. Headings become chapter
titles, and *italics*, lists, and links all carry through.

- Works offline
- No account
- Real, valid EPUB3 you can open in any reader`

export default function MarkdownToEpub() {
  const [title, setTitle] = useState('My Book')
  const [author, setAuthor] = useState('')
  const [source, setSource] = useState(SAMPLE)
  const { busy, error, run } = useAsyncTask()

  async function process() {
    if (!source.trim()) return
    await run(async () => {
      const blob = await markdownToEpub(source, title || 'Untitled', author)
      downloadBlob(blob, `${(title || 'book').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.epub`)
    })
  }

  return (
    <ToolLayout tool={tool}>
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

      <div>
        <label className={labelCls} htmlFor="in">Content (Markdown)</label>
        <textarea id="in" className={`${textareaCls} h-96`} value={source} onChange={(e) => setSource(e.target.value)} />
      </div>

      {error && <ErrorState message={error} />}

      <Button onClick={process} disabled={!source.trim() || busy}>
        {busy ? 'Building…' : 'Create EPUB & Download'}
      </Button>

      <p className="text-xs text-text-faint">
        Builds a real, spec-valid single-chapter EPUB3 file -- opens in Apple Books, Calibre, Kobo and any other
        reader. For a multi-chapter book, use a heading (# Chapter Two) per section; it all lands in one file for now.
      </p>
    </ToolLayout>
  )
}
