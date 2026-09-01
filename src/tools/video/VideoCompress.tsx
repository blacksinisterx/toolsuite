import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { ErrorState } from '../../components/States'
import { FfmpegNotice } from '../../components/FfmpegNotice'
import { formatBytes } from '../../lib/format'
import { downloadBlob } from '../../lib/download'
import { compressVideo } from '../../processors/ffmpeg'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'video-compress')!

export default function VideoCompress() {
  const [file, setFile] = useState<File | null>(null)
  const [crf, setCrf] = useState(28)
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
      setResult(await compressVideo(file, crf, setProgress))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not compress this video.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="video/*" hint="Any common video format" onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <p className="text-sm text-text-muted">
            {file.name} — {formatBytes(file.size)}
            {result && <> → <span className="font-medium text-success">{formatBytes(result.size)}</span> ({Math.round((1 - result.size / file.size) * 100)}% smaller)</>}
          </p>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="crf">
              Compression — {crf < 23 ? 'higher quality, larger file' : crf > 32 ? 'smaller file, lower quality' : 'balanced'} (CRF {crf})
            </label>
            <input id="crf" type="range" min={18} max={40} value={crf} onChange={(e) => setCrf(Number(e.target.value))} className="w-full accent-accent" />
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
