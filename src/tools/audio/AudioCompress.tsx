import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { ErrorState } from '../../components/States'
import { FfmpegNotice } from '../../components/FfmpegNotice'
import { formatBytes } from '../../lib/format'
import { downloadBlob } from '../../lib/download'
import { compressAudio } from '../../processors/ffmpeg'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'audio-compress')!
const BITRATES = [64, 96, 128, 192]

export default function AudioCompress() {
  const [file, setFile] = useState<File | null>(null)
  const [bitrate, setBitrate] = useState(128)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function process() {
    if (!file) return
    setBusy(true)
    setError(null)
    setProgress(0)
    setResult(null)
    try {
      setResult(await compressAudio(file, bitrate, setProgress))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not compress this audio file.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="audio/*" hint="Any common audio format" onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <p className="text-sm text-text-muted">
            {file.name} — {formatBytes(file.size)}
            {result && <> → <span className="font-medium text-success">{formatBytes(result.size)}</span></>}
          </p>
          <div className="flex gap-2">
            {BITRATES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => { setBitrate(b); setResult(null) }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${bitrate === b ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
              >
                {b} kbps
              </button>
            ))}
          </div>
        </>
      )}

      <FfmpegNotice />
      {busy && <ProgressBar value={progress * 100} label="Compressing…" />}
      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Compressing…' : 'Compress'}
        </Button>
        {result && (
          <Button variant="secondary" onClick={() => downloadBlob(result, `${file!.name.replace(/\.[^.]+$/, '')}-compressed.${file!.name.split('.').pop()}`)}>
            Download
          </Button>
        )}
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setResult(null) }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
