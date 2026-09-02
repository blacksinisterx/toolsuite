import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { CopyButton } from '../../components/CopyButton'
import { textareaCls, labelCls } from '../../components/formStyles'
import { formatBytes } from '../../lib/format'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'image-to-base64')!

export default function ImageToBase64() {
  const [file, setFile] = useState<File | null>(null)
  const [dataUrl, setDataUrl] = useState('')

  function pick(f: File) {
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setDataUrl(reader.result as string)
    reader.readAsDataURL(f)
  }

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone accept="image/*" hint="Any common image format" onFiles={(f) => pick(f[0])} />}

      {file && (
        <>
          <div className="flex items-center gap-4 rounded-lg border border-border bg-bg-sunken p-3">
            <img src={dataUrl} alt="Preview" className="h-16 w-16 rounded object-cover" />
            <p className="text-sm text-text-muted">{file.name} — {formatBytes(file.size)} → {formatBytes(dataUrl.length)} as base64 text</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={labelCls + ' mb-0'} htmlFor="out">Data URI</label>
              <CopyButton text={dataUrl} />
            </div>
            <textarea id="out" readOnly className={textareaCls} rows={8} value={dataUrl} />
          </div>

          <button type="button" onClick={() => { setFile(null); setDataUrl('') }} className="self-start text-sm text-text-muted hover:text-text">
            Reset
          </button>
        </>
      )}

      <p className="text-xs text-text-faint">
        A data: URI encodes the image directly as text -- paste it straight into CSS (`background-image: url(...)`)
        or an `&lt;img src&gt;`, no separate file needed. Base64 text runs about a third larger than the original file.
      </p>
    </ToolLayout>
  )
}
