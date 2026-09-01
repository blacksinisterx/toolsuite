import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { ErrorState } from '../../components/States'
import { FfmpegNotice } from '../../components/FfmpegNotice'
import { inputCls, labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { videoToGif } from '../../processors/ffmpeg'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'video-to-gif')!

export default function VideoToGif() {
  const [file, setFile] = useState<File | null>(null)
  const [fps, setFps] = useState(10)
  const [width, setWidth] = useState(480)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function process() {
    if (!file) return
    setBusy(true)
    setError(null)
    setProgress(0)
    setResultUrl('')
    try {
      const blob = await videoToGif(file, fps, width, setProgress)
      setResultUrl(URL.createObjectURL(blob))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create a GIF from this video.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="video/*" hint="Keep it short -- GIFs from long clips get huge" onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <p className="text-sm text-text-muted">{file.name}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="fps">Frame rate (fps)</label>
              <input id="fps" type="number" min={2} max={30} className={inputCls} value={fps} onChange={(e) => setFps(Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls} htmlFor="width">Width (px)</label>
              <input id="width" type="number" min={64} max={1280} className={inputCls} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
            </div>
          </div>
        </>
      )}

      <FfmpegNotice />
      {busy && <ProgressBar value={progress * 100} label="Creating GIF…" />}
      {error && <ErrorState message={error} />}

      {resultUrl && <img src={resultUrl} alt="Generated GIF" className="max-h-64 rounded-lg border border-border" />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Creating…' : 'Create GIF'}
        </Button>
        {resultUrl && (
          <Button variant="secondary" onClick={async () => downloadBlob(await (await fetch(resultUrl)).blob(), `${file!.name.replace(/\.[^.]+$/, '')}.gif`)}>
            Download
          </Button>
        )}
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setResultUrl('') }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
