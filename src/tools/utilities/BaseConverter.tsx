import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { labelCls, inputCls } from '../../components/formStyles'
import { ErrorState } from '../../components/States'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'base-converter')!

const BASES = [
  { base: 2, label: 'Binary' },
  { base: 8, label: 'Octal' },
  { base: 10, label: 'Decimal' },
  { base: 16, label: 'Hexadecimal' },
] as const

export default function BaseConverter() {
  const [fromBase, setFromBase] = useState(10)
  const [input, setInput] = useState('255')

  const { value, error } = useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) return { value: null as bigint | null, error: null }
    try {
      const digits = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, fromBase)
      let n = 0n
      for (const ch of trimmed.toLowerCase()) {
        const d = digits.indexOf(ch)
        if (d === -1) throw new Error(`'${ch}' isn't a valid digit in base ${fromBase}.`)
        n = n * BigInt(fromBase) + BigInt(d)
      }
      return { value: n, error: null }
    } catch (e) {
      return { value: null, error: e instanceof Error ? e.message : 'Invalid input.' }
    }
  }, [input, fromBase])

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="base-in">Value</label>
        <div className="flex gap-2">
          <input
            id="base-in"
            className={`${inputCls} font-mono`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          <select
            value={fromBase}
            onChange={(e) => setFromBase(Number(e.target.value))}
            className="w-40 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
          >
            {BASES.map((b) => <option key={b.base} value={b.base}>{b.label}</option>)}
          </select>
        </div>
      </div>

      {error && <ErrorState message={error} />}

      {value !== null && (
        <div className="flex flex-col gap-2">
          {BASES.map((b) => (
            <div key={b.base} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-sunken px-4 py-2.5">
              <span className="text-xs font-medium text-text-muted">{b.label}</span>
              <code className="select-all break-all font-mono text-sm text-text">{value.toString(b.base)}</code>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  )
}
