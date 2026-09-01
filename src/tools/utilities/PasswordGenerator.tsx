import { useEffect, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'password-generator')!

const SETS = {
  lower: 'abcdefghijkmnopqrstuvwxyz',
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  digits: '23456789',
  symbols: '!@#$%^&*()-_=+[]{}',
}

function generate(length: number, opts: Record<keyof typeof SETS, boolean>) {
  const pool = (Object.keys(SETS) as (keyof typeof SETS)[]).filter((k) => opts[k]).map((k) => SETS[k]).join('')
  if (!pool) return ''
  const bytes = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(bytes, (n) => pool[n % pool.length]).join('')
}

function strength(length: number, opts: Record<keyof typeof SETS, boolean>): { label: string; color: string } {
  const variety = Object.values(opts).filter(Boolean).length
  const score = length * variety
  if (score < 40) return { label: 'Weak', color: 'text-danger' }
  if (score < 80) return { label: 'Okay', color: 'text-warning' }
  if (score < 120) return { label: 'Strong', color: 'text-success' }
  return { label: 'Very strong', color: 'text-success' }
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true })
  const [password, setPassword] = useState('')

  useEffect(() => {
    setPassword(generate(length, opts))
  }, [length, opts])

  const s = strength(length, opts)

  return (
    <ToolLayout tool={tool}>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-sunken px-4 py-3">
        <code className="flex-1 select-all break-all font-mono text-lg text-text">{password || '—'}</code>
        <CopyButton text={password} />
      </div>
      <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="len">Length — {length}</label>
        <input id="len" type="range" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-accent" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(SETS) as (keyof typeof SETS)[]).map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm text-text-muted capitalize">
            <input
              type="checkbox"
              checked={opts[k]}
              onChange={(e) => setOpts((prev) => ({ ...prev, [k]: e.target.checked }))}
              className="accent-accent"
            />
            {k}
          </label>
        ))}
      </div>

      <Button onClick={() => setPassword(generate(length, opts))}>Regenerate</Button>
    </ToolLayout>
  )
}
