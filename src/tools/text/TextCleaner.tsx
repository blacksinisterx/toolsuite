import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'text-cleaner')!

export default function TextCleaner() {
  const [text, setText] = useState('')
  const [dedupe, setDedupe] = useState(true)
  const [trimLines, setTrimLines] = useState(true)
  const [removeEmpty, setRemoveEmpty] = useState(true)
  const [collapseSpaces, setCollapseSpaces] = useState(false)

  const output = useMemo(() => {
    let lines = text.split(/\r?\n/)
    if (trimLines) lines = lines.map((l) => l.trim())
    if (collapseSpaces) lines = lines.map((l) => l.replace(/[ \t]+/g, ' '))
    if (removeEmpty) lines = lines.filter((l) => l.length > 0)
    if (dedupe) lines = [...new Set(lines)]
    return lines.join('\n')
  }, [text, dedupe, trimLines, removeEmpty, collapseSpaces])

  const removed = text.split(/\r?\n/).length - (output ? output.split('\n').length : 0)

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">Text</label>
        <textarea id="in" className={textareaCls} rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Paste lines here, e.g.\napple\n apple \nbanana\n\ncherry'} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="flex items-center gap-2 text-sm text-text-muted"><input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} className="accent-accent" />Trim whitespace</label>
        <label className="flex items-center gap-2 text-sm text-text-muted"><input type="checkbox" checked={collapseSpaces} onChange={(e) => setCollapseSpaces(e.target.checked)} className="accent-accent" />Collapse spaces</label>
        <label className="flex items-center gap-2 text-sm text-text-muted"><input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} className="accent-accent" />Remove empty lines</label>
        <label className="flex items-center gap-2 text-sm text-text-muted"><input type="checkbox" checked={dedupe} onChange={(e) => setDedupe(e.target.checked)} className="accent-accent" />Remove duplicates</label>
      </div>

      {text && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelCls + ' mb-0'} htmlFor="out">Result {removed > 0 && <span className="text-text-faint">({removed} line{removed === 1 ? '' : 's'} removed)</span>}</label>
            <CopyButton text={output} />
          </div>
          <textarea id="out" readOnly className={textareaCls} rows={10} value={output} />
        </div>
      )}
    </ToolLayout>
  )
}
