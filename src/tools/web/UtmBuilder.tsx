import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { inputCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'utm-builder')!
const FIELDS = ['source', 'medium', 'campaign', 'term', 'content'] as const

export default function UtmBuilder() {
  const [mode, setMode] = useState<'build' | 'clean'>('build')
  const [baseUrl, setBaseUrl] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})

  const result = useMemo(() => {
    if (!baseUrl.trim()) return ''
    try {
      const url = new URL(baseUrl)
      if (mode === 'clean') {
        ;[...url.searchParams.keys()].filter((k) => k.startsWith('utm_')).forEach((k) => url.searchParams.delete(k))
      } else {
        for (const field of FIELDS) {
          if (values[field]) url.searchParams.set(`utm_${field}`, values[field])
        }
      }
      return url.toString()
    } catch {
      return ''
    }
  }, [baseUrl, values, mode])

  return (
    <ToolLayout tool={tool}>
      <div className="flex gap-2">
        {(['build', 'clean'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium capitalize ${mode === m ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-muted'}`}
          >
            {m === 'build' ? 'Build UTM link' : 'Remove UTM params'}
          </button>
        ))}
      </div>

      <div>
        <label className={labelCls} htmlFor="base">{mode === 'build' ? 'Destination URL' : 'URL with UTM params'}</label>
        <input id="base" className={inputCls} placeholder="https://example.com" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
      </div>

      {mode === 'build' && (
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map((field) => (
            <div key={field}>
              <label className={labelCls} htmlFor={field}>utm_{field}</label>
              <input
                id={field}
                className={inputCls}
                value={values[field] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [field]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-sunken px-3 py-2">
          <code className="flex-1 truncate font-mono text-xs text-text">{result}</code>
          <CopyButton text={result} />
        </div>
      )}
    </ToolLayout>
  )
}
