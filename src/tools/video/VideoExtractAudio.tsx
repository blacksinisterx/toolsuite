import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { ErrorState } from '../../components/States'
import { FfmpegNotice } from '../../components/FfmpegNotice'
import { downloadBlob } from '../../lib/download'
import { extractAudioFromVideo } from '../../processors/ffmpeg'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'video-extract-audio')!
const FORMATS = ['mp3', 'wav', 'm4a', 'ogg']

export default function VideoExtractAudio() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState('mp3')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function process() {
    if (!file) return
    setBusy(true)
    setError(null)
    setProgress(0)
    try {
      const blob = await extractAudioFromVideo(file, format, setProgress)
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, '')}.${format}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not extract audio from this video.')
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
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium uppercase ${format === f ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </>
      )}

      <FfmpegNotice />
      {busy && <ProgressBar value={progress * 100} label="Extracting…" />}
      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Extracting…' : 'Extract Audio'}
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
