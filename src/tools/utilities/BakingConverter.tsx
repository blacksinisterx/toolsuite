import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { labelCls, inputCls } from '../../components/formStyles'
import { INGREDIENTS, VOLUME_UNITS, volumeToGrams, gramsToOz, cToF, closestGasMark } from '../../lib/baking'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'baking-converter')!

function round(n: number, dp = 1): number {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

export default function BakingConverter() {
  const [mode, setMode] = useState<'ingredient' | 'oven'>('ingredient')

  // Ingredient weight/volume converter
  const [ingredientId, setIngredientId] = useState('flour')
  const [amount, setAmount] = useState('1')
  const [unit, setUnit] = useState('cup')
  const ingredient = INGREDIENTS.find((i) => i.id === ingredientId)!

  const grams = useMemo(() => {
    const n = Number(amount)
    if (!amount.trim() || Number.isNaN(n)) return null
    return volumeToGrams(n, unit, ingredient.gramsPerCup)
  }, [amount, unit, ingredient])

  // Oven temperature converter
  const [ovenC, setOvenC] = useState('180')
  const ovenTemps = useMemo(() => {
    const n = Number(ovenC)
    if (!ovenC.trim() || Number.isNaN(n)) return null
    return { c: n, f: cToF(n), gas: closestGasMark(n) }
  }, [ovenC])

  return (
    <ToolLayout tool={tool}>
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('ingredient')} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'ingredient' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}>Ingredient amounts</button>
        <button type="button" onClick={() => setMode('oven')} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'oven' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}>Oven temperature</button>
      </div>

      {mode === 'ingredient' ? (
        <>
          <div>
            <label className={labelCls} htmlFor="ingredient">Ingredient</label>
            <select id="ingredient" className={inputCls} value={ingredientId} onChange={(e) => setIngredientId(e.target.value)}>
              {INGREDIENTS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="amount">Amount</label>
              <input id="amount" type="number" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="unit">Unit</label>
              <select id="unit" className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value)}>
                {VOLUME_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
          </div>

          {grams !== null && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-bg-sunken px-3 py-2.5 text-center">
                <p className="text-xs text-text-muted">Grams</p>
                <p className="text-lg font-semibold text-text">{round(grams)}g</p>
              </div>
              <div className="rounded-lg border border-border bg-bg-sunken px-3 py-2.5 text-center">
                <p className="text-xs text-text-muted">Ounces</p>
                <p className="text-lg font-semibold text-text">{round(gramsToOz(grams))} oz</p>
              </div>
              <div className="rounded-lg border border-border bg-bg-sunken px-3 py-2.5 text-center">
                <p className="text-xs text-text-muted">Kilograms</p>
                <p className="text-lg font-semibold text-text">{round(grams / 1000, 3)} kg</p>
              </div>
              <div className="rounded-lg border border-border bg-bg-sunken px-3 py-2.5 text-center">
                <p className="text-xs text-text-muted">Pounds</p>
                <p className="text-lg font-semibold text-text">{round(gramsToOz(grams) / 16, 2)} lb</p>
              </div>
            </div>
          )}
          <p className="text-xs text-text-faint">Weight per cup varies by ingredient (butter and flour aren't the same density) -- that's why this asks which one, unlike a generic unit converter.</p>
        </>
      ) : (
        <>
          <div>
            <label className={labelCls} htmlFor="oven-c">Temperature (°C)</label>
            <input id="oven-c" type="number" className={inputCls} value={ovenC} onChange={(e) => setOvenC(e.target.value)} />
          </div>
          {ovenTemps && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-bg-sunken px-3 py-2.5 text-center">
                <p className="text-xs text-text-muted">Celsius</p>
                <p className="text-lg font-semibold text-text">{round(ovenTemps.c, 0)}°C</p>
              </div>
              <div className="rounded-lg border border-border bg-bg-sunken px-3 py-2.5 text-center">
                <p className="text-xs text-text-muted">Fahrenheit</p>
                <p className="text-lg font-semibold text-text">{round(ovenTemps.f, 0)}°F</p>
              </div>
              <div className="rounded-lg border border-border bg-bg-sunken px-3 py-2.5 text-center">
                <p className="text-xs text-text-muted">Gas Mark</p>
                <p className="text-lg font-semibold text-text">{ovenTemps.gas}</p>
              </div>
            </div>
          )}
        </>
      )}
    </ToolLayout>
  )
}
