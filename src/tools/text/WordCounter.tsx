import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'word-counter')!

export default function WordCounter() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, '').length
    const sentences = text.trim() ? (text.match(/[.!?]+(\s|$)/g)?.length ?? (text.trim() ? 1 : 0)) : 0
    const paragraphs = text.trim() ? text.split(/\n{2,}/).filter((p) => p.trim()).length : 0
    const readingMinutes = Math.max(1, Math.round(words / 200))
    return { words, chars, charsNoSpaces, sentences, paragraphs, readingMinutes }
  }, [text])

  const stat = (label: string, value: number | string) => (
    <div className="rounded-lg border border-border bg-bg-sunken px-3 py-2.5 text-center">
      <div className="text-xl font-semibold tabular-nums text-text">{value}</div>
      <div className="text-xs text-text-faint">{label}</div>
    </div>
  )

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">Text</label>
        <textarea id="in" className={textareaCls} rows={10} value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {stat('Words', stats.words)}
        {stat('Characters', stats.chars)}
        {stat('No spaces', stats.charsNoSpaces)}
        {stat('Sentences', stats.sentences)}
        {stat('Paragraphs', stats.paragraphs)}
        {stat('Read time', `${stats.readingMinutes}m`)}
      </div>
    </ToolLayout>
  )
}
