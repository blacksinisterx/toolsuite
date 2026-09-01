import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { ErrorState } from '../../components/States'
import { FfmpegNotice } from '../../components/FfmpegNotice'
import { inputCls, labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { changeVideoResolution } from '../../processors/ffmpeg'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'video-resize')!
const PRESETS = [
  { label: '1080p', w: 1920, h: 1080 },
  { label: '720p', w: 1280, h: 720 },
  { label: '480p', w: 854, h: 480 },
]

export default function VideoResize() {
  const [file, setFile] = useState<File | null>(null)
  const [width, setWidth] = useState(1280)
  const [height, setHeight] = useState(720)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function process() {
    if (!file) return
    setBusy(true)
    setError(null)
    setProgress(0)
    try {
      const blob = await changeVideoResolution(file, width, height, setProgress)
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, '')}-${width}x${height}.${file.name.split('.').pop()}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resize this video.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="video/*" hint="Any common video format" onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <p className="text-sm text-text-muted">{file.name}</p>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setWidth(p.w); setHeight(p.h) }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${width === p.w && height === p.h ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="w">Width</label>
              <input id="w" type="number" className={inputCls} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls} htmlFor="h">Height</label>
              <input id="h" type="number" className={inputCls} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            </div>
          </div>
        </>
      )}

      <FfmpegNotice />
      {busy && <ProgressBar value={progress * 100} label="Resizing…" />}
      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Resizing…' : 'Resize & Download'}
        </Button>
        {file && (
          <Button variant="ghost" onClick={() => setFile(null)}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
