import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { ErrorState } from '../../components/States'
import { evaluateExpression } from '../../lib/calc'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'calculator')!

const BUTTONS = [
  'sin(', 'cos(', 'tan(', 'sqrt(',
  '7', '8', '9', '/',
  '4', '5', '6', '*',
  '1', '2', '3', '-',
  '0', '.', '(', ')',
  'pi', 'e', '^', '+',
]

export default function Calculator() {
  const [expr, setExpr] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{ expr: string; result: number }[]>([])

  function press(token: string) {
    setExpr((prev) => prev + token)
  }

  function evaluate() {
    try {
      const value = evaluateExpression(expr)
      setResult(value)
      setError(null)
      setHistory((prev) => [{ expr, result: value }, ...prev].slice(0, 8))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid expression.')
      setResult(null)
    }
  }

  return (
    <ToolLayout tool={tool}>
      <input
        type="text"
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && evaluate()}
        placeholder="e.g. sqrt(16) + 2^3"
        className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-right font-mono text-2xl text-text outline-none focus:border-accent"
      />
      {result !== null && !error && <p className="text-right text-sm text-text-muted">= <span className="font-medium text-text">{result}</span></p>}
      {error && <ErrorState message={error} />}

      <div className="grid grid-cols-4 gap-2">
        {BUTTONS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => press(b)}
            className="rounded-lg border border-border bg-bg-sunken py-2.5 text-sm font-medium text-text hover:border-accent"
          >
            {b}
          </button>
        ))}
        <button type="button" onClick={() => setExpr('')} className="rounded-lg border border-border py-2.5 text-sm font-medium text-text-muted hover:border-danger hover:text-danger">C</button>
        <button type="button" onClick={() => setExpr((p) => p.slice(0, -1))} className="rounded-lg border border-border py-2.5 text-sm font-medium text-text-muted">⌫</button>
        <button type="button" onClick={evaluate} className="col-span-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-accent-text hover:bg-accent-hover">=</button>
      </div>

      {history.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          {history.map((h, i) => (
            <button key={i} type="button" onClick={() => setExpr(h.expr)} className="flex justify-between text-left text-xs text-text-faint hover:text-text">
              <span>{h.expr}</span>
              <span>= {h.result}</span>
            </button>
          ))}
        </div>
      )}
    </ToolLayout>
  )
}
