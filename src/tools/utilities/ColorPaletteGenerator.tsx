import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from '../../lib/color'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'color-palette-generator')!

type Scheme = 'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'shades'

const wrap = (h: number) => ((h % 360) + 360) % 360

function buildPalette(baseHex: string, scheme: Scheme): string[] {
  const rgb = hexToRgb(baseHex)
  if (!rgb) return []
  const { h, s, l } = rgbToHsl(rgb)

  switch (scheme) {
    case 'complementary':
      return [baseHex, rgbToHex(hslToRgb({ h: wrap(h + 180), s, l }))]
    case 'analogous':
      return [-30, -15, 0, 15, 30].map((d) => rgbToHex(hslToRgb({ h: wrap(h + d), s, l })))
    case 'triadic':
      return [0, 120, 240].map((d) => rgbToHex(hslToRgb({ h: wrap(h + d), s, l })))
    case 'monochromatic':
      return [20, 35, 50, 65, 80].map((lv) => rgbToHex(hslToRgb({ h, s, l: lv })))
    case 'shades':
      return [80, 60, 40, 20, 5].map((amt) => rgbToHex(hslToRgb({ h, s, l: Math.max(0, l - (l * amt) / 100) })))
  }
}

const SCHEMES: { id: Scheme; label: string }[] = [
  { id: 'complementary', label: 'Complementary' },
  { id: 'analogous', label: 'Analogous' },
  { id: 'triadic', label: 'Triadic' },
  { id: 'monochromatic', label: 'Monochromatic' },
  { id: 'shades', label: 'Shades' },
]

export default function ColorPaletteGenerator() {
  const [base, setBase] = useState('#ff5a3c')
  const [scheme, setScheme] = useState<Scheme>('analogous')

  const palette = useMemo(() => buildPalette(base, scheme), [base, scheme])

  return (
    <ToolLayout tool={tool}>
      <div className="flex items-center gap-4">
        <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="h-12 w-12 cursor-pointer rounded-lg border border-border bg-transparent" aria-label="Base color" />
        <input
          type="text"
          value={base}
          onChange={(e) => hexToRgb(e.target.value) && setBase(e.target.value)}
          className="w-32 rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {SCHEMES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScheme(s.id)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${scheme === s.id ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {palette.map((hex, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-border">
            <div className="h-20" style={{ background: hex }} />
            <div className="flex items-center justify-between gap-1 bg-bg-sunken px-2 py-1.5">
              <code className="font-mono text-xs text-text">{hex}</code>
              <CopyButton text={hex} />
            </div>
          </div>
        ))}
      </div>
    </ToolLayout>
  )
}
