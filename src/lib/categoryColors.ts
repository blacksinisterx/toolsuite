import type { ToolCategory } from '../types/tool'

/** CSS custom property name per category -- defined in index.css. Small,
 * deliberate color identity per category (icon badges, active nav state),
 * kept out of large fields so it reads as "colorful" without chaos. */
export const CATEGORY_VAR: Record<ToolCategory, string> = {
  pdf: '--cat-pdf',
  images: '--cat-images',
  developer: '--cat-developer',
  text: '--cat-text',
  utilities: '--cat-utilities',
  analyzer: '--cat-analyzer',
  ocr: '--cat-ocr',
  archives: '--cat-archives',
  data: '--cat-data',
  web: '--cat-web',
  video: '--cat-video',
  audio: '--cat-audio',
  latex: '--cat-latex',
}

export function categoryColor(category: ToolCategory): string {
  return `var(${CATEGORY_VAR[category]})`
}
