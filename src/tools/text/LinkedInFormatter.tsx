import { useRef, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { labelCls } from '../../components/formStyles'
import { applyInlineStyle, applyListStyle, clearFormatting, type InlineStyle, type ListStyle } from '../../lib/linkedinFormat'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'linkedin-formatter')!

const INLINE_BUTTONS: { style: InlineStyle; label: string; className: string }[] = [
  { style: 'bold', label: 'B', className: 'font-bold' },
  { style: 'italic', label: 'I', className: 'italic' },
  { style: 'underline', label: 'U', className: 'underline' },
  { style: 'strikethrough', label: 'S', className: 'line-through' },
]

const LIST_BUTTONS: { style: ListStyle; label: string }[] = [
  { style: 'bullet', label: '☰ Bullets' },
  { style: 'numbered', label: '① Numbered' },
  { style: 'checklist', label: '☑ Checklist' },
]

const toolbarBtnCls = 'flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm text-text-muted hover:bg-bg-sunken hover:text-text disabled:opacity-40 disabled:hover:bg-transparent'

export default function LinkedInFormatter() {
  const [text, setText] = useState('')
  const [history, setHistory] = useState<string[]>([''])
  const [histIdx, setHistIdx] = useState(0)
  const taRef = useRef<HTMLTextAreaElement>(null)

  function commit(next: string, selStart?: number, selEnd?: number) {
    setText(next)
    setHistory((h) => [...h.slice(0, histIdx + 1), next])
    setHistIdx((i) => i + 1)
    requestAnimationFrame(() => {
      const ta = taRef.current
      if (ta && selStart !== undefined && selEnd !== undefined) {
        ta.focus()
        ta.setSelectionRange(selStart, selEnd)
      }
    })
  }

  function inline(style: InlineStyle) {
    const ta = taRef.current
    if (!ta) return
    const { text: next, end } = applyInlineStyle(text, ta.selectionStart, ta.selectionEnd, style)
    commit(next, end, end)
  }

  function list(style: ListStyle) {
    const ta = taRef.current
    if (!ta) return
    const { text: next } = applyListStyle(text, ta.selectionStart, ta.selectionEnd, style)
    commit(next, next.length, next.length)
  }

  function clear() {
    const ta = taRef.current
    if (!ta) return
    const hasSelection = ta.selectionStart !== ta.selectionEnd
    const from = hasSelection ? ta.selectionStart : 0
    const to = hasSelection ? ta.selectionEnd : text.length
    const cleaned = clearFormatting(text.slice(from, to))
    const next = text.slice(0, from) + cleaned + text.slice(to)
    commit(next, from + cleaned.length, from + cleaned.length)
  }

  function undo() {
    if (histIdx === 0) return
    setHistIdx(histIdx - 1)
    setText(history[histIdx - 1])
  }

  function redo() {
    if (histIdx >= history.length - 1) return
    setHistIdx(histIdx + 1)
    setText(history[histIdx + 1])
  }

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col overflow-hidden rounded-lg border border-border">
          <div className="flex flex-wrap items-center gap-1 border-b border-border bg-bg-sunken px-2 py-1.5">
            {INLINE_BUTTONS.map(({ style, label, className }) => (
              <button key={style} type="button" onClick={() => inline(style)} className={`${toolbarBtnCls} ${className}`} title={style}>
                {label}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-border" />
            <button type="button" onClick={undo} disabled={histIdx === 0} className={toolbarBtnCls} title="Undo">↺</button>
            <button type="button" onClick={redo} disabled={histIdx >= history.length - 1} className={toolbarBtnCls} title="Redo">↻</button>
            <button type="button" onClick={clear} className={toolbarBtnCls} title="Clear formatting">⌫</button>
            <span className="mx-1 h-5 w-px bg-border" />
            {LIST_BUTTONS.map(({ style, label }) => (
              <button key={style} type="button" onClick={() => list(style)} className={`${toolbarBtnCls} whitespace-nowrap`} title={style}>
                {label}
              </button>
            ))}
          </div>
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => { setText(e.target.value); setHistory((h) => [...h.slice(0, histIdx + 1), e.target.value]); setHistIdx((i) => i + 1) }}
            placeholder="Write here..."
            className="min-h-[280px] flex-1 resize-y bg-bg px-3 py-2.5 text-sm text-text outline-none"
          />
        </div>

        <div>
          <p className={labelCls}>Post Preview</p>
          <div className="rounded-lg border border-border bg-bg-sunken p-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-accent-soft" />
              <div>
                <p className="text-sm font-semibold text-text">Your Name</p>
                <p className="text-xs text-text-muted">Your headline</p>
                <p className="text-xs text-text-faint">now</p>
              </div>
            </div>
            <p className="mt-3 min-h-[4rem] whitespace-pre-wrap break-words text-sm text-text">
              {text || <span className="text-text-faint">Start writing and your post will appear here...</span>}
            </p>
          </div>
        </div>
      </div>

      {text && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-sunken px-4 py-3">
          <p className="text-xs text-text-muted">Ready to paste into LinkedIn.</p>
          <CopyButton text={text} />
        </div>
      )}
    </ToolLayout>
  )
}
