import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { inputCls, labelCls } from '../../components/formStyles'
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, type Rgb } from '../../lib/color'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'color-converter')!

export default function ColorConverter() {
  const [rgb, setRgb] = useState<Rgb>({ r: 15, g: 138, b: 108 })
  const hex = rgbToHex(rgb)
  const hsl = rgbToHsl(rgb)

  function setFromHex(value: string) {
    const parsed = hexToRgb(value)
    if (parsed) setRgb(parsed)
  }

  function setFromHsl(h: number, s: number, l: number) {
    setRgb(hslToRgb({ h, s, l }))
  }

  const rowCls = 'flex items-center gap-3 rounded-lg border border-border bg-bg-sunken px-3 py-2'

  return (
    <ToolLayout tool={tool}>
      <div className="flex items-center gap-4">
        <input
          type="color"
          value={hex}
          onChange={(e) => setFromHex(e.target.value)}
          className="h-16 w-16 cursor-pointer rounded-lg border border-border bg-transparent"
          aria-label="Pick a color"
        />
        <div className="h-16 flex-1 rounded-lg border border-border" style={{ background: hex }} />
      </div>

      <div className="flex flex-col gap-2">
        <div className={rowCls}>
          <label className="w-14 shrink-0 text-xs font-semibold text-text-muted" htmlFor="hex">HEX</label>
          <input id="hex" className={`${inputCls} border-0 bg-transparent font-mono`} value={hex} onChange={(e) => setFromHex(e.target.value)} />
          <CopyButton text={hex} />
        </div>

        <div className={rowCls}>
          <span className="w-14 shrink-0 text-xs font-semibold text-text-muted">RGB</span>
          <div className="flex flex-1 gap-2">
            {(['r', 'g', 'b'] as const).map((k) => (
              <input
                key={k}
                type="number"
                min={0}
                max={255}
                value={rgb[k]}
                onChange={(e) => setRgb({ ...rgb, [k]: Math.min(255, Math.max(0, Number(e.target.value))) })}
                className="w-16 rounded border border-border bg-bg px-2 py-1 text-sm"
                aria-label={k.toUpperCase()}
              />
            ))}
          </div>
          <CopyButton text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
        </div>

        <div className={rowCls}>
          <span className="w-14 shrink-0 text-xs font-semibold text-text-muted">HSL</span>
          <div className="flex flex-1 gap-2">
            <input type="number" min={0} max={360} value={hsl.h} onChange={(e) => setFromHsl(Number(e.target.value), hsl.s, hsl.l)} className="w-16 rounded border border-border bg-bg px-2 py-1 text-sm" aria-label="Hue" />
            <input type="number" min={0} max={100} value={hsl.s} onChange={(e) => setFromHsl(hsl.h, Number(e.target.value), hsl.l)} className="w-16 rounded border border-border bg-bg px-2 py-1 text-sm" aria-label="Saturation" />
            <input type="number" min={0} max={100} value={hsl.l} onChange={(e) => setFromHsl(hsl.h, hsl.s, Number(e.target.value))} className="w-16 rounded border border-border bg-bg px-2 py-1 text-sm" aria-label="Lightness" />
          </div>
          <CopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
        </div>
      </div>

      <p className={labelCls}>Tip: paste a hex value directly into the HEX field, or use the color picker.</p>
    </ToolLayout>
  )
}
