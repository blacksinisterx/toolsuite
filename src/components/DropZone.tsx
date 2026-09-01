import { useCallback, useId, useRef, useState } from 'react'

export function DropZone({
  accept,
  multiple = false,
  onFiles,
  hint,
}: {
  accept?: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  hint?: string
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return
      onFiles(Array.from(list))
    },
    [onFiles],
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-labelledby={id}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
        dragging ? 'border-accent bg-accent-soft' : 'border-border-strong bg-bg-sunken hover:border-accent'
      }`}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-text-faint" aria-hidden="true">
        <path d="M12 15V3m0 0 4 4m-4-4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p id={id} className="text-sm font-medium text-text">
        Drop {multiple ? 'files' : 'a file'} here, or click to browse
      </p>
      {hint && <p className="text-xs text-text-faint">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
