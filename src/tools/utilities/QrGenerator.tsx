import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { inputCls, labelCls, textareaCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'qr-generator')!

type Kind = 'text' | 'url' | 'wifi' | 'email' | 'phone'

function buildPayload(kind: Kind, fields: Record<string, string>): string {
  switch (kind) {
    case 'url':
      return fields.url?.trim() || ''
    case 'wifi':
      return `WIFI:T:${fields.security || 'WPA'};S:${fields.ssid || ''};P:${fields.password || ''};;`
    case 'email':
      return `mailto:${fields.email || ''}${fields.subject ? `?subject=${encodeURIComponent(fields.subject)}` : ''}`
    case 'phone':
      return `tel:${fields.phone || ''}`
    default:
      return fields.text || ''
  }
}

export default function QrGenerator() {
  const [kind, setKind] = useState<Kind>('text')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [dataUrl, setDataUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const payload = buildPayload(kind, fields)

  useEffect(() => {
    if (!payload.trim()) {
      setDataUrl('')
      return
    }
    QRCode.toDataURL(payload, { width: 320, margin: 1 })
      .then((url) => {
        setDataUrl(url)
        setError(null)
      })
      .catch(() => setError('Could not generate a QR code for this input -- it may be too long.'))
  }, [payload])

  function set(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-wrap gap-2">
        {(['text', 'url', 'wifi', 'email', 'phone'] as Kind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => { setKind(k); setFields({}) }}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium capitalize ${kind === k ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
          >
            {k}
          </button>
        ))}
      </div>

      {kind === 'text' && (
        <div>
          <label className={labelCls} htmlFor="text">Text</label>
          <textarea id="text" className={textareaCls} rows={3} value={fields.text ?? ''} onChange={(e) => set('text', e.target.value)} />
        </div>
      )}
      {kind === 'url' && (
        <div>
          <label className={labelCls} htmlFor="url">URL</label>
          <input id="url" className={inputCls} placeholder="https://example.com" value={fields.url ?? ''} onChange={(e) => set('url', e.target.value)} />
        </div>
      )}
      {kind === 'wifi' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="ssid">Network name</label>
            <input id="ssid" className={inputCls} value={fields.ssid ?? ''} onChange={(e) => set('ssid', e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="pw">Password</label>
            <input id="pw" className={inputCls} value={fields.password ?? ''} onChange={(e) => set('password', e.target.value)} />
          </div>
        </div>
      )}
      {kind === 'email' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="email">Email</label>
            <input id="email" className={inputCls} value={fields.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="subject">Subject (optional)</label>
            <input id="subject" className={inputCls} value={fields.subject ?? ''} onChange={(e) => set('subject', e.target.value)} />
          </div>
        </div>
      )}
      {kind === 'phone' && (
        <div>
          <label className={labelCls} htmlFor="phone">Phone number</label>
          <input id="phone" className={inputCls} value={fields.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
        </div>
      )}

      {error && <ErrorState message={error} />}

      {dataUrl && (
        <div className="flex flex-col items-center gap-3">
          <img src={dataUrl} alt="QR code" className="h-56 w-56 rounded-lg border border-border bg-white p-2" />
          <Button
            variant="secondary"
            onClick={async () => {
              const res = await fetch(dataUrl)
              downloadBlob(await res.blob(), 'qr-code.png')
            }}
          >
            Download PNG
          </Button>
        </div>
      )}
    </ToolLayout>
  )
}
