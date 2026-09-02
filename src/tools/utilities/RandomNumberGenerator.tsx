import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { labelCls, inputCls } from '../../components/formStyles'
import { ErrorState } from '../../components/States'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'random-number-generator')!

// Uniform random int in [min, max] via rejection sampling on crypto bytes --
// avoids the modulo bias a plain `Math.random() * range` would have.
function randomInt(min: number, max: number): number {
  const range = max - min + 1
  const bits = Math.ceil(Math.log2(range))
  const bytes = Math.ceil(bits / 8)
  const maxValid = Math.floor(256 ** bytes / range) * range
  let n: number
  do {
    const arr = crypto.getRandomValues(new Uint8Array(bytes))
    n = arr.reduce((acc, b) => acc * 256 + b, 0)
  } while (n >= maxValid)
  return min + (n % range)
}

export default function RandomNumberGenerator() {
  const [min, setMin] = useState('1')
  const [max, setMax] = useState('100')
  const [count, setCount] = useState('1')
  const [unique, setUnique] = useState(false)
  const [results, setResults] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  function generate() {
    const lo = Number(min), hi = Number(max), n = Number(count)
    if (Number.isNaN(lo) || Number.isNaN(hi) || Number.isNaN(n)) return setError('Enter valid numbers.')
    if (lo > hi) return setError('Min must be less than or equal to max.')
    if (n < 1 || n > 1000) return setError('Count must be between 1 and 1000.')
    if (unique && n > hi - lo + 1) return setError('Range is too small for that many unique values.')

    setError(null)
    if (unique) {
      const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
      const picked: number[] = []
      for (let i = 0; i < n; i++) {
        const idx = randomInt(0, pool.length - 1)
        picked.push(pool[idx])
        pool.splice(idx, 1)
      }
      setResults(picked)
    } else {
      setResults(Array.from({ length: n }, () => randomInt(lo, hi)))
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls} htmlFor="rng-min">Min</label>
          <input id="rng-min" type="number" className={inputCls} value={min} onChange={(e) => setMin(e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="rng-max">Max</label>
          <input id="rng-max" type="number" className={inputCls} value={max} onChange={(e) => setMax(e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="rng-count">Count</label>
          <input id="rng-count" type="number" className={inputCls} value={count} onChange={(e) => setCount(e.target.value)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} className="accent-accent" />
        No duplicates
      </label>

      <Button onClick={generate}>Generate</Button>

      {error && <ErrorState message={error} />}

      {results.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className={labelCls + ' mb-0'}>Result{results.length > 1 ? 's' : ''}</span>
            <CopyButton text={results.join(', ')} />
          </div>
          <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-bg-sunken px-4 py-3">
            {results.map((r, i) => (
              <code key={i} className="rounded bg-bg px-2 py-1 font-mono text-sm text-text">{r}</code>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
