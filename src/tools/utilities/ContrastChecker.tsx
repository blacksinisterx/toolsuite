import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { hexToRgb, contrastRatio } from '../../lib/color'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'contrast-checker')!

function Badge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${pass ? 'border-success/30 bg-success-soft text-success' : 'border-danger/30 bg-danger-soft text-danger'}`}>
      {pass ? '✓' : '✕'} {label}
    </span>
  )
}

export default function ContrastChecker() {
  const [fg, setFg] = useState('#ffffff')
  const [bg, setBg] = useState('#ff5a3c')

  const ratio = useMemo(() => {
    const fgRgb = hexToRgb(fg)
    const bgRgb = hexToRgb(bg)
    if (!fgRgb || !bgRgb) return null
    return contrastRatio(fgRgb, bgRgb)
  }, [fg, bg])

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="fg">Text color</label>
          <div className="flex items-center gap-2">
            <input id="fg" type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent" />
            <input type="text" value={fg} onChange={(e) => setFg(e.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="bg">Background color</label>
          <div className="flex items-center gap-2">
            <input id="bg" type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent" />
            <input type="text" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-border p-6" style={{ background: bg }}>
        <p style={{ color: fg }} className="text-3xl font-bold">Sample text</p>
        <p style={{ color: fg }} className="text-sm">The quick brown fox jumps over the lazy dog.</p>
      </div>

      {ratio !== null ? (
        <>
          <p className="text-center text-3xl font-semibold tabular-nums text-text">{ratio.toFixed(2)}:1</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge pass={ratio >= 4.5} label="AA normal text (4.5:1)" />
            <Badge pass={ratio >= 3} label="AA large text (3:1)" />
            <Badge pass={ratio >= 7} label="AAA normal text (7:1)" />
            <Badge pass={ratio >= 4.5} label="AAA large text (4.5:1)" />
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-text-faint">Enter two valid hex colors.</p>
      )}
    </ToolLayout>
  )
}
