import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { ErrorState } from '../../components/States'
import { FfmpegNotice } from '../../components/FfmpegNotice'
import { downloadBlob } from '../../lib/download'
import { changeAudioVolume, normalizeAudio } from '../../processors/ffmpeg'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'audio-volume')!

export default function AudioVolume() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'adjust' | 'normalize'>('adjust')
  const [volume, setVolume] = useState(1)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function process() {
    if (!file) return
    setBusy(true)
    setError(null)
    setProgress(0)
    try {
      const blob = mode === 'adjust' ? await changeAudioVolume(file, volume, setProgress) : await normalizeAudio(file, setProgress)
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, '')}-${mode}.${file.name.split('.').pop()}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change this audio file\'s volume.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="audio/*" hint="Any common audio format" onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <p className="text-sm text-text-muted">{file.name}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('adjust')}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'adjust' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
            >
              Adjust volume
            </button>
            <button
              type="button"
              onClick={() => setMode('normalize')}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode === 'normalize' ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
            >
              Normalize (auto)
            </button>
          </div>
          {mode === 'adjust' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="vol">
                Volume — {Math.round(volume * 100)}%
              </label>
              <input id="vol" type="range" min={0} max={3} step={0.1} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-accent" />
            </div>
          )}
        </>
      )}

      <FfmpegNotice />
      {busy && <ProgressBar value={progress * 100} label="Processing…" />}
      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Processing…' : 'Apply & Download'}
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
