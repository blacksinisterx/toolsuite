import { useMemo, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'markdown-editor')!
const DEFAULT_MD = '# Hello\n\nStart typing **Markdown** on the left.\n\n- Live preview\n- No upload, no storage'

export default function MarkdownEditor() {
  const [md, setMd] = useState(DEFAULT_MD)

  const html = useMemo(() => DOMPurify.sanitize(marked.parse(md, { async: false }) as string), [md])

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelCls + ' mb-0'} htmlFor="md">Markdown</label>
            <CopyButton text={md} />
          </div>
          <textarea id="md" className={`${textareaCls} h-96`} value={md} onChange={(e) => setMd(e.target.value)} />
        </div>
        <div>
          <p className={labelCls}>Preview</p>
          <div
            className="prose prose-sm h-96 max-w-none overflow-y-auto rounded-lg border border-border bg-bg-sunken p-4 text-text [&_a]:text-accent [&_code]:font-mono [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-bg-elevated [&_pre]:p-3"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </ToolLayout>
  )
}
