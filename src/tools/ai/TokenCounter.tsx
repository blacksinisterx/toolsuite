import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'token-counter')!

// Context windows as of this writing -- labeled with the model, not
// treated as gospel, since providers change these. A live comparison
// point is more useful than no reference at all.
const CONTEXT_WINDOWS = [
  { label: 'Claude (200K)', size: 200_000 },
  { label: 'GPT-4o (128K)', size: 128_000 },
  { label: 'Gemini 1.5 Pro (1M)', size: 1_000_000 },
]

export default function TokenCounter() {
  const [text, setText] = useState('')
  const [tokenCount, setTokenCount] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  async function count(value: string) {
    setText(value)
    if (!value.trim()) {
      setTokenCount(0)
      return
    }
    setBusy(true)
    const { encode } = await import('gpt-tokenizer/esm/encoding/cl100k_base')
    setTokenCount(encode(value).length)
    setBusy(false)
  }

  const charsPerToken = useMemo(() => (tokenCount && tokenCount > 0 ? (text.length / tokenCount).toFixed(2) : null), [text, tokenCount])

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">Text</label>
        <textarea id="in" className={textareaCls} rows={12} placeholder="Paste your prompt, document, or anything else here..." value={text} onChange={(e) => count(e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-bg-sunken px-4 py-3 text-center">
          <p className="text-2xl font-semibold tabular-nums text-text">{tokenCount ?? (busy ? '…' : '—')}</p>
          <p className="text-xs text-text-muted">tokens</p>
        </div>
        <div className="rounded-lg border border-border bg-bg-sunken px-4 py-3 text-center">
          <p className="text-2xl font-semibold tabular-nums text-text">{text.length}</p>
          <p className="text-xs text-text-muted">characters</p>
        </div>
        <div className="rounded-lg border border-border bg-bg-sunken px-4 py-3 text-center">
          <p className="text-2xl font-semibold tabular-nums text-text">{charsPerToken ?? '—'}</p>
          <p className="text-xs text-text-muted">chars/token</p>
        </div>
      </div>

      {tokenCount !== null && tokenCount > 0 && (
        <div className="flex flex-col gap-2">
          <p className={labelCls}>As a share of common context windows</p>
          {CONTEXT_WINDOWS.map((c) => {
            const pct = Math.min(100, (tokenCount / c.size) * 100)
            return (
              <div key={c.label}>
                <div className="mb-1 flex justify-between text-xs text-text-muted">
                  <span>{c.label}</span>
                  <span>{pct < 0.1 ? '<0.1' : pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-sunken">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(pct, 0.5)}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-text-faint">
        Counted with OpenAI's cl100k_base tokenizer (the real one, run locally -- not an estimate). It's the same
        tokenizer GPT-3.5/GPT-4 use; other model families (Claude, Gemini, Llama) tokenize slightly differently, so
        treat this as a close approximation for those, not an exact count.
      </p>
    </ToolLayout>
  )
}
