import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'gradient-generator')!

type Kind = 'linear' | 'radial'

export default function GradientGenerator() {
  const [kind, setKind] = useState<Kind>('linear')
  const [angle, setAngle] = useState(135)
  const [colorA, setColorA] = useState('#ff6b4d')
  const [colorB, setColorB] = useState('#9b83ff')

  const css =
    kind === 'linear'
      ? `linear-gradient(${angle}deg, ${colorA}, ${colorB})`
      : `radial-gradient(circle, ${colorA}, ${colorB})`

  const cssCode = `background: ${css};`

  return (
    <ToolLayout tool={tool}>
      <div className="flex gap-2">
        <button type="button" onClick={() => setKind('linear')} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${kind === 'linear' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}>Linear</button>
        <button type="button" onClick={() => setKind('radial')} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${kind === 'radial' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}>Radial</button>
      </div>

      <div className="h-40 rounded-xl border border-border" style={{ background: css }} />

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-text-muted">
          Color A
          <input type="color" value={colorA} onChange={(e) => setColorA(e.target.value)} className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent" />
        </label>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          Color B
          <input type="color" value={colorB} onChange={(e) => setColorB(e.target.value)} className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent" />
        </label>
        {kind === 'linear' && (
          <label className="flex flex-1 items-center gap-2 text-sm text-text-muted">
            Angle — {angle}°
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="flex-1 accent-accent" />
          </label>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-sunken px-4 py-3">
        <code className="select-all break-all font-mono text-sm text-text">{cssCode}</code>
        <CopyButton text={cssCode} />
      </div>
    </ToolLayout>
  )
}
