import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { Button } from '../../components/Button'
import { inputCls, labelCls, textareaCls } from '../../components/formStyles'
import { downloadBlob } from '../../lib/download'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'robots-generator')!

interface Rule { userAgent: string; disallow: string; allow: string }

export default function RobotsGenerator() {
  const [rules, setRules] = useState<Rule[]>([{ userAgent: '*', disallow: '', allow: '' }])
  const [sitemap, setSitemap] = useState('')

  function update(i: number, patch: Partial<Rule>) {
    setRules((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  const output = useMemo(() => {
    const lines: string[] = []
    for (const rule of rules) {
      if (!rule.userAgent.trim()) continue
      lines.push(`User-agent: ${rule.userAgent}`)
      rule.disallow.split('\n').map((l) => l.trim()).filter(Boolean).forEach((path) => lines.push(`Disallow: ${path}`))
      rule.allow.split('\n').map((l) => l.trim()).filter(Boolean).forEach((path) => lines.push(`Allow: ${path}`))
      lines.push('')
    }
    if (sitemap.trim()) lines.push(`Sitemap: ${sitemap.trim()}`)
    return lines.join('\n').trim()
  }, [rules, sitemap])

  return (
    <ToolLayout tool={tool}>
      {rules.map((rule, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <label className={labelCls + ' mb-0 shrink-0'} htmlFor={`ua-${i}`}>User-agent</label>
            <input id={`ua-${i}`} className={inputCls} value={rule.userAgent} onChange={(e) => update(i, { userAgent: e.target.value })} />
            {rules.length > 1 && (
              <Button variant="ghost" onClick={() => setRules((prev) => prev.filter((_, idx) => idx !== i))}>Remove</Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor={`dis-${i}`}>Disallow (one path per line)</label>
              <textarea id={`dis-${i}`} className={textareaCls} rows={3} value={rule.disallow} onChange={(e) => update(i, { disallow: e.target.value })} />
            </div>
            <div>
              <label className={labelCls} htmlFor={`allow-${i}`}>Allow (one path per line)</label>
              <textarea id={`allow-${i}`} className={textareaCls} rows={3} value={rule.allow} onChange={(e) => update(i, { allow: e.target.value })} />
            </div>
          </div>
        </div>
      ))}

      <Button variant="secondary" onClick={() => setRules((prev) => [...prev, { userAgent: '', disallow: '', allow: '' }])}>
        + Add another user-agent
      </Button>

      <div>
        <label className={labelCls} htmlFor="sitemap">Sitemap URL (optional)</label>
        <input id="sitemap" className={inputCls} placeholder="https://example.com/sitemap.xml" value={sitemap} onChange={(e) => setSitemap(e.target.value)} />
      </div>

      {output && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelCls + ' mb-0'}>robots.txt</label>
            <div className="flex gap-2">
              <CopyButton text={output} />
              <Button variant="secondary" onClick={() => downloadBlob(new Blob([output], { type: 'text/plain' }), 'robots.txt')}>
                Download
              </Button>
            </div>
          </div>
          <textarea readOnly className={textareaCls} rows={8} value={output} />
        </div>
      )}
    </ToolLayout>
  )
}
