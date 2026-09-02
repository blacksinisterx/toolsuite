import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { inputCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'slug-generator')!

// U+0300-U+036F: combining diacritical marks NFKD leaves behind on a base
// letter (e.g. "e" + a separate grave-accent mark after decomposing "e").
// Built via fromCharCode/RegExp rather than a literal character class so
// the source file has no invisible combining characters sitting in it.
const COMBINING_MARKS = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g')

function slugify(text: string, separator: string): string {
  return text
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '') // strip accents NFKD decomposed off their base letters
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '')
}

export default function SlugGenerator() {
  const [text, setText] = useState('')
  const [separator, setSeparator] = useState('-')

  const slug = useMemo(() => (text ? slugify(text, separator) : ''), [text, separator])

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">Text</label>
        <input id="in" className={inputCls} placeholder="My Blog Post Title!" value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <div className="flex gap-2">
        {(['-', '_'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSeparator(s)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${separator === s ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
          >
            {s === '-' ? 'hyphen-case' : 'snake_case'}
          </button>
        ))}
      </div>

      {slug && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-sunken px-4 py-3">
          <code className="select-all break-all font-mono text-sm text-text">{slug}</code>
          <CopyButton text={slug} />
        </div>
      )}
    </ToolLayout>
  )
}
