import { useState } from 'react'
import { Button } from '../components/Button'
import { labelCls, inputCls, textareaCls } from '../components/formStyles'

const REPO = 'blacksinisterx/toolsuite'

export default function SuggestPage() {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')

  function openIssue() {
    const body = details || 'Describe the tool or feature you\'d like to see...'
    const url = `https://github.com/${REPO}/issues/new?title=${encodeURIComponent(`[Suggestion] ${title || 'New tool idea'}`)}&body=${encodeURIComponent(body)}&labels=suggestion`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Suggest a Tool</h1>
        <p className="mt-2 text-sm text-text-muted sm:text-base">
          Missing something? Tell us what to build next. This opens a pre-filled GitHub issue on the
          project's own repo -- nothing you type here is stored by ToolSuite itself, and no account is
          needed to have it seen.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm sm:p-7">
        <div>
          <label className={labelCls} htmlFor="s-title">What tool or feature?</label>
          <input id="s-title" className={inputCls} placeholder="e.g. Currency converter" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="s-details">More details (optional)</label>
          <textarea id="s-details" className={textareaCls} rows={5} placeholder="What would it do? Any examples?" value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
        <Button onClick={openIssue}>Open on GitHub →</Button>
      </div>

      <p className="text-xs text-text-faint">
        Prefer not to use GitHub? You can also just reply to any conversation where you're already talking
        to us about ToolSuite -- there's no single "right" way to ask.
      </p>
    </div>
  )
}
