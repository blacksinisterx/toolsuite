import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { CopyButton } from '../../components/CopyButton'
import { ErrorState } from '../../components/States'
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, readableTextColor } from '../../lib/color'
import { extractPaletteFromImage } from '../../lib/paletteExtract'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'color-palette-generator')!

type Scheme = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic' | 'shades'

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
    case 'tetradic':
      return [0, 90, 180, 270].map((d) => rgbToHex(hslToRgb({ h: wrap(h + d), s, l })))
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
  { id: 'tetradic', label: 'Tetradic' },
  { id: 'monochromatic', label: 'Monochromatic' },
  { id: 'shades', label: 'Shades' },
]

function randomHex(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(3))
  return rgbToHex({ r: bytes[0], g: bytes[1], b: bytes[2] })
}

function Swatch({ hex }: { hex: string }) {
  const rgb = hexToRgb(hex)
  const textColor = rgb ? readableTextColor(rgb) : '#000000'
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border">
      <div className="flex h-20 items-start justify-end p-1.5" style={{ background: hex }}>
        <span className="rounded px-1 text-[10px] font-semibold" style={{ color: textColor }}>Aa</span>
      </div>
      <div className="flex items-center justify-between gap-1 bg-bg-sunken px-2 py-1.5">
        <code className="font-mono text-xs text-text">{hex}</code>
        <CopyButton text={hex} />
      </div>
    </div>
  )
}

export default function ColorPaletteGenerator() {
  const [mode, setMode] = useState<'color' | 'image'>('color')
  const [base, setBase] = useState('#ff5a3c')
  const [scheme, setScheme] = useState<Scheme>('analogous')
  const [imagePalette, setImagePalette] = useState<string[] | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const { busy, error, run } = useAsyncTask()

  const colorPalette = useMemo(() => buildPalette(base, scheme), [base, scheme])
  const palette = mode === 'color' ? colorPalette : (imagePalette ?? [])

  function shuffle() {
    setBase(randomHex())
    setScheme(SCHEMES[Math.floor(Math.random() * SCHEMES.length)].id)
  }

  async function extract(file: File) {
    setImagePreview(URL.createObjectURL(file))
    await run(async () => {
      setImagePalette(await extractPaletteFromImage(file))
    })
  }

  const cssVars = palette.map((hex, i) => `  --color-${i + 1}: ${hex};`).join('\n')

  return (
    <ToolLayout tool={tool}>
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('color')} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'color' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}>From a color</button>
        <button type="button" onClick={() => setMode('image')} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'image' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}>From an image</button>
      </div>

      {mode === 'color' ? (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="h-12 w-12 cursor-pointer rounded-lg border border-border bg-transparent" aria-label="Base color" />
            <input
              type="text"
              value={base}
              onChange={(e) => hexToRgb(e.target.value) && setBase(e.target.value)}
              className="w-32 rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent"
            />
            <button type="button" onClick={shuffle} className="ml-auto rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-muted hover:border-accent hover:text-accent">
              🎲 Random
            </button>
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
        </>
      ) : (
        <>
          {!imagePreview && <DropZone accept="image/*" hint="Any common image format" onFiles={(f) => extract(f[0])} />}
          {imagePreview && (
            <div className="flex items-center gap-4">
              <img src={imagePreview} alt="Source" className="h-20 w-20 rounded-lg border border-border object-cover" />
              <button type="button" onClick={() => { setImagePreview(''); setImagePalette(null) }} className="text-sm text-text-muted hover:text-text">
                Choose a different image
              </button>
            </div>
          )}
          {busy && <p className="text-sm text-text-muted">Sampling colors…</p>}
          {error && <ErrorState message={error} />}
        </>
      )}

      {palette.length > 0 && (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3">
            {palette.map((hex, i) => <Swatch key={i} hex={hex} />)}
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-sunken px-4 py-3">
            <div>
              <p className="text-xs font-medium text-text-muted">Copy all as CSS custom properties</p>
              <code className="select-all break-all font-mono text-xs text-text">{palette.join(', ')}</code>
            </div>
            <CopyButton text={`:root {\n${cssVars}\n}`} />
          </div>
        </>
      )}
    </ToolLayout>
  )
}
