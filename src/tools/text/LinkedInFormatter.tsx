import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { textareaCls, labelCls } from '../../components/formStyles'
import { LINKEDIN_STYLES } from '../../lib/linkedinFormat'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'linkedin-formatter')!

export default function LinkedInFormatter() {
  const [text, setText] = useState('')

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">Text</label>
        <textarea id="in" className={textareaCls} rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your LinkedIn post..." />
      </div>

      {text && (
        <div>
          <p className={labelCls}>Preview</p>
          <div className="rounded-lg border border-border bg-bg-sunken p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-accent-soft" />
              <div>
                <p className="text-sm font-semibold text-text">Your Name</p>
                <p className="text-xs text-text-muted">Your headline · 1st</p>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm text-text">{text}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {LINKEDIN_STYLES.map(({ label, fn }) => {
          const value = text ? fn(text) : ''
          return (
            <div key={label} className="flex items-center gap-3 rounded-lg border border-border bg-bg-sunken px-3 py-2">
              <span className="w-36 shrink-0 text-xs font-semibold text-text-muted">{label}</span>
              <span className="flex-1 truncate whitespace-pre text-sm text-text">{value}</span>
              {value && <CopyButton text={value} />}
            </div>
          )
        })}
      </div>
    </ToolLayout>
  )
}
