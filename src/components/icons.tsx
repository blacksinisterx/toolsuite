import type { ReactElement } from 'react'
import type { ToolCategory } from '../types/tool'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export function PdfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M6 2h9l5 5v15H6z" />
      <path d="M15 2v5h5" />
      <path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-3Zm0 3v2m4-5v5h1.5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H13Zm6 0h-2v5m0-2.5h1.5" />
    </svg>
  )
}
export function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 16-5.5-5.5L4 21" />
    </svg>
  )
}
export function DevIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="m9 8-4 4 4 4m6-8 4 4-4 4" />
    </svg>
  )
}
export function TextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M5 6h14M5 12h14M5 18h9" />
    </svg>
  )
}
export function UtilityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L14.7 6.3Z" />
    </svg>
  )
}
export function AnalyzerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export const CATEGORY_ICONS: Record<ToolCategory, () => ReactElement> = {
  pdf: PdfIcon,
  images: ImageIcon,
  developer: DevIcon,
  text: TextIcon,
  utilities: UtilityIcon,
  analyzer: AnalyzerIcon,
}
