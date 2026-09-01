import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { ErrorState } from '../../components/States'
import { inputCls, textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'regex-tester')!

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('')

  const result = useMemo<{ re: RegExp; matches: RegExpMatchArray[] } | { error: string } | null>(() => {
    if (!pattern) return null
    try {
      const re = new RegExp(pattern, flags)
      const matches = flags.includes('g') ? [...text.matchAll(re)] : (() => { const m = text.match(re); return m ? [m] : [] })()
      return { re, matches }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Invalid regular expression.' }
    }
  }, [pattern, flags, text])

  function highlighted() {
    if (!result || 'error' in result || result.matches.length === 0) return text
    const parts: (string | { match: string })[] = []
    let last = 0
    for (const m of result.matches) {
      if (m.index === undefined) continue
      parts.push(text.slice(last, m.index))
      parts.push({ match: m[0] })
      last = m.index + m[0].length
    }
    parts.push(text.slice(last))
    return parts
  }

  const parts = highlighted()

  return (
    <ToolLayout tool={tool}>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelCls} htmlFor="pattern">Pattern</label>
          <div className="flex items-center gap-1">
            <span className="text-text-faint">/</span>
            <input id="pattern" className={inputCls} value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="\d+" />
            <span className="text-text-faint">/</span>
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="flags">Flags</label>
          <input id="flags" className={`${inputCls} w-20`} value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="g" />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="text">Test text</label>
        <textarea id="text" className={textareaCls} rows={6} spellCheck={false} value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      {result && 'error' in result && <ErrorState message={result.error} />}

      {result && !('error' in result) && (
        <>
          <p className="text-sm text-text-muted">{result.matches.length} match{result.matches.length === 1 ? '' : 'es'}</p>
          {text && (
            <div className="whitespace-pre-wrap rounded-lg border border-border bg-bg-sunken p-3 font-mono text-sm leading-relaxed text-text">
              {typeof parts === 'string'
                ? parts
                : parts.map((p, i) =>
                    typeof p === 'string' ? (
                      <span key={i}>{p}</span>
                    ) : (
                      <mark key={i} className="rounded bg-accent-soft text-accent">{p.match}</mark>
                    ),
                  )}
            </div>
          )}
        </>
      )}
    </ToolLayout>
  )
}
