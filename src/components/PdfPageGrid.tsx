import { useEffect, useState } from 'react'
import { renderPdfPages } from '../processors/pdfRender'

export function usePdfThumbnails(file: File | null) {
  const [pages, setPages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPages([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    renderPdfPages(file, 0.5)
      .then((urls) => !cancelled && setPages(urls))
      .catch(() => !cancelled && setError('Could not read this PDF -- it may be corrupted, encrypted, or password-protected.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [file])

  return { pages, loading, error }
}

/** Selectable page thumbnail grid, used by Extract/Delete/Rotate-specific. */
export function PdfPageGrid({
  pages,
  selected,
  onToggle,
}: {
  pages: string[]
  selected: Set<number>
  onToggle: (index: number) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {pages.map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onToggle(i)}
          aria-pressed={selected.has(i)}
          className={`relative overflow-hidden rounded-lg border-2 transition-colors ${
            selected.has(i) ? 'border-accent' : 'border-border hover:border-border-strong'
          }`}
        >
          <img src={src} alt={`Page ${i + 1}`} className="w-full bg-white" />
          <span
            className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
              selected.has(i) ? 'bg-accent text-accent-text' : 'bg-black/50 text-white'
            }`}
          >
            {i + 1}
          </span>
        </button>
      ))}
    </div>
  )
}
