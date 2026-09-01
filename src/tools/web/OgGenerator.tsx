import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { inputCls, labelCls, textareaCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'og-generator')!

export default function OgGenerator() {
  const [fields, setFields] = useState({ title: '', description: '', image: '', url: '', siteName: '' })

  function set(key: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const tags = useMemo(() => {
    const lines: string[] = []
    if (fields.title) {
      lines.push(`<meta property="og:title" content="${fields.title}" />`)
      lines.push(`<meta name="twitter:title" content="${fields.title}" />`)
    }
    if (fields.description) {
      lines.push(`<meta property="og:description" content="${fields.description}" />`)
      lines.push(`<meta name="twitter:description" content="${fields.description}" />`)
    }
    if (fields.image) {
      lines.push(`<meta property="og:image" content="${fields.image}" />`)
      lines.push(`<meta name="twitter:card" content="summary_large_image" />`)
      lines.push(`<meta name="twitter:image" content="${fields.image}" />`)
    }
    if (fields.url) lines.push(`<meta property="og:url" content="${fields.url}" />`)
    if (fields.siteName) lines.push(`<meta property="og:site_name" content="${fields.siteName}" />`)
    if (lines.length) lines.unshift(`<meta property="og:type" content="website" />`)
    return lines.join('\n')
  }, [fields])

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="title">Title</label>
          <input id="title" className={inputCls} value={fields.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="siteName">Site name</label>
          <input id="siteName" className={inputCls} value={fields.siteName} onChange={(e) => set('siteName', e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="url">Page URL</label>
          <input id="url" className={inputCls} value={fields.url} onChange={(e) => set('url', e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="image">Image URL</label>
          <input id="image" className={inputCls} value={fields.image} onChange={(e) => set('image', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor="description">Description</label>
        <textarea id="description" className={textareaCls} rows={3} value={fields.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      {tags && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelCls + ' mb-0'}>Meta tags</label>
            <CopyButton text={tags} />
          </div>
          <textarea readOnly className={textareaCls} rows={8} value={tags} />
        </div>
      )}
    </ToolLayout>
  )
}
