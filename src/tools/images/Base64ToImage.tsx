import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { textareaCls, labelCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { formatBytes } from '../../lib/format'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'base64-to-image')!

export default function Base64ToImage() {
  const [input, setInput] = useState('')
  const [preview, setPreview] = useState('')
  const [size, setSize] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function decode() {
    setError(null)
    const trimmed = input.trim()
    const dataUrl = trimmed.startsWith('data:') ? trimmed : `data:image/png;base64,${trimmed}`
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/s)
    if (!match) {
      setError("That doesn't look like a valid base64 image (data URI or raw base64).")
      setPreview('')
      return
    }
    try {
      const bytes = atob(match[2].replace(/\s/g, ''))
      setSize(bytes.length)
      setPreview(dataUrl)
    } catch {
      setError("That doesn't look like valid base64.")
      setPreview('')
    }
  }

  function download() {
    const match = preview.match(/^data:([^;]+);base64,(.+)$/s)
    if (!match) return
    const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0))
    const ext = match[1].split('/')[1] || 'png'
    downloadBlob(new Blob([bytes], { type: match[1] }), `image.${ext}`)
  }

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">Base64 (data URI or raw)</label>
        <textarea
          id="in"
          className={`${textareaCls} font-mono text-xs`}
          rows={8}
          spellCheck={false}
          placeholder="data:image/png;base64,iVBORw0KGgo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <Button onClick={decode} disabled={!input.trim()}>Decode</Button>

      {error && <ErrorState message={error} />}

      {preview && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-bg-sunken p-4">
          <img src={preview} alt="Decoded" className="max-h-64 max-w-full rounded" />
          <p className="text-xs text-text-faint">{formatBytes(size)}</p>
          <Button variant="secondary" onClick={download}>Download</Button>
        </div>
      )}
    </ToolLayout>
  )
}
