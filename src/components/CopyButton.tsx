import { useState } from 'react'
import { Button } from './Button'

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="secondary"
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      disabled={!text}
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </Button>
  )
}
