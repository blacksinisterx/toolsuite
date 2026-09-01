import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { Button } from '../../components/Button'
import { inputCls, labelCls, textareaCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'sitemap-generator')!
const FREQS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export default function SitemapGenerator() {
  const [urls, setUrls] = useState('')
  const [changefreq, setChangefreq] = useState('weekly')
  const [priority, setPriority] = useState('0.8')

  const xml = useMemo(() => {
    const list = urls.split('\n').map((u) => u.trim()).filter(Boolean)
    if (list.length === 0) return ''
    const today = new Date().toISOString().slice(0, 10)
    const entries = list
      .map(
        (u) =>
          `  <url>\n    <loc>${escapeXml(u)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
      )
      .join('\n')
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`
  }, [urls, changefreq, priority])

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="urls">Page URLs — one per line</label>
        <textarea
          id="urls"
          className={textareaCls}
          rows={8}
          spellCheck={false}
          placeholder={'https://example.com/\nhttps://example.com/about'}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="freq">Change frequency</label>
          <select id="freq" className={inputCls} value={changefreq} onChange={(e) => setChangefreq(e.target.value)}>
            {FREQS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="prio">Priority</label>
          <input id="prio" type="number" min={0} max={1} step={0.1} className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value)} />
        </div>
      </div>

      {xml && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelCls + ' mb-0'}>sitemap.xml</label>
            <div className="flex gap-2">
              <CopyButton text={xml} />
              <Button variant="secondary" onClick={() => downloadBlob(new Blob([xml], { type: 'application/xml' }), 'sitemap.xml')}>
                Download
              </Button>
            </div>
          </div>
          <textarea readOnly className={textareaCls} rows={8} value={xml} />
        </div>
      )}
    </ToolLayout>
  )
}
