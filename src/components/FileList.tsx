import { formatBytes } from '../lib/format'

export function FileList({
  files,
  onRemove,
}: {
  files: File[]
  onRemove?: (index: number) => void
}) {
  if (files.length === 0) return null
  return (
    <ul className="flex flex-col gap-1.5">
      {files.map((file, i) => (
        <li
          key={`${file.name}-${i}`}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm"
        >
          <span className="truncate text-text">{file.name}</span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="text-xs text-text-faint tabular-nums">{formatBytes(file.size)}</span>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${file.name}`}
                className="text-text-faint hover:text-danger"
              >
                ✕
              </button>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}
