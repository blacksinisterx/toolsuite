import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { ErrorState } from '../../components/States'
import { FfmpegNotice } from '../../components/FfmpegNotice'
import { inputCls, labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { trimAudio } from '../../processors/ffmpeg'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'audio-trim')!

export default function AudioTrim() {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [duration, setDuration] = useState(0)
  const [start, setStart] = useState('00:00:00')
  const [end, setEnd] = useState('00:00:00')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function process() {
    if (!file) return
    setBusy(true)
    setError(null)
    setProgress(0)
    try {
      const blob = await trimAudio(file, start, end, setProgress)
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, '')}-trimmed.${file.name.split('.').pop()}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not trim this audio.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout tool={tool}>
      {!file && (
        <DropZone
          accept="audio/*"
          hint="Any common audio format"
          onFiles={(f) => {
            setFile(f[0])
            setUrl(URL.createObjectURL(f[0]))
          }}
        />
      )}

      {file && (
        <>
          <audio
            src={url}
            controls
            className="w-full"
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration
              setDuration(d)
              setEnd(new Date(d * 1000).toISOString().slice(11, 19))
            }}
          />
          {duration > 0 && <p className="text-xs text-text-faint">Duration: {duration.toFixed(1)}s</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="start">Start (HH:MM:SS)</label>
              <input id="start" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="end">End (HH:MM:SS)</label>
              <input id="end" className={inputCls} value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
        </>
      )}

      <FfmpegNotice />
      {busy && <ProgressBar value={progress * 100} label="Trimming…" />}
      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={!file || busy}>
          {busy ? 'Trimming…' : 'Trim & Download'}
        </Button>
        {file && (
          <Button variant="ghost" onClick={() => { setFile(null); setUrl('') }}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
