// LinkedIn (and most social apps) has no rich-text formatting -- these
// "bold"/"italic" looks are real, distinct Unicode code points from the
// Mathematical Alphanumeric Symbols block (and a few older math-symbol
// holdouts) that happen to render bold/italic/etc, not actual styling.
// Genuine mapping tables here, not a placeholder -- see the exceptions
// below for the well-known holes in that Unicode block.

interface AlphaStyle {
  upperStart?: number
  lowerStart?: number
  digitStart?: number
  space?: string
  exceptions?: Record<string, string>
}

const STYLES: Record<string, AlphaStyle> = {
  bold: { upperStart: 0x1d400, lowerStart: 0x1d41a, digitStart: 0x1d7ce },
  italic: { upperStart: 0x1d434, lowerStart: 0x1d44e, exceptions: { h: 'ℎ' } },
  boldItalic: { upperStart: 0x1d468, lowerStart: 0x1d482 },
  sans: { upperStart: 0x1d5a0, lowerStart: 0x1d5ba, digitStart: 0x1d7e2 },
  boldSans: { upperStart: 0x1d5d4, lowerStart: 0x1d5ee, digitStart: 0x1d7ec },
  italicSans: { upperStart: 0x1d608, lowerStart: 0x1d622 },
  boldItalicSans: { upperStart: 0x1d63c, lowerStart: 0x1d656 },
  script: {
    upperStart: 0x1d49c,
    lowerStart: 0x1d4b6,
    exceptions: { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ', e: 'ℯ', g: 'ℊ', o: 'ℴ' },
  },
  doublestruck: {
    upperStart: 0x1d538,
    lowerStart: 0x1d552,
    digitStart: 0x1d7d8,
    exceptions: { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' },
  },
  fullwidth: { upperStart: 0xff21, lowerStart: 0xff41, digitStart: 0xff10, space: '　' },
  monospace: { upperStart: 0x1d670, lowerStart: 0x1d68a, digitStart: 0x1d7f6 },
}

// Reverse lookup (styled char -> plain ASCII), built once from the same
// tables above -- used by "Clear formatting" so it's a real inverse, not a
// second hand-maintained table that could drift from the forward one.
const REVERSE = new Map<string, string>()
for (const def of Object.values(STYLES)) {
  for (let i = 0; i < 26; i++) {
    if (def.upperStart !== undefined) REVERSE.set(String.fromCodePoint(def.upperStart + i), String.fromCharCode(65 + i))
    if (def.lowerStart !== undefined) REVERSE.set(String.fromCodePoint(def.lowerStart + i), String.fromCharCode(97 + i))
  }
  for (let i = 0; i < 10; i++) {
    if (def.digitStart !== undefined) REVERSE.set(String.fromCodePoint(def.digitStart + i), String.fromCharCode(48 + i))
  }
  if (def.space !== undefined) REVERSE.set(def.space, ' ')
  if (def.exceptions) for (const [plain, styled] of Object.entries(def.exceptions)) REVERSE.set(styled, plain)
}

export function clearFormatting(s: string): string {
  return [...s]
    .map((c) => REVERSE.get(c) ?? c)
    .join('')
    .replace(/[\u0332\u0336]/g, '')
}

function mapChar(c: string, def: AlphaStyle): string {
  if (def.exceptions?.[c]) return def.exceptions[c]
  const code = c.codePointAt(0)!
  if (def.upperStart !== undefined && code >= 65 && code <= 90) return String.fromCodePoint(def.upperStart + (code - 65))
  if (def.lowerStart !== undefined && code >= 97 && code <= 122) return String.fromCodePoint(def.lowerStart + (code - 97))
  if (def.digitStart !== undefined && code >= 48 && code <= 57) return String.fromCodePoint(def.digitStart + (code - 48))
  if (def.space !== undefined && c === ' ') return def.space
  return c
}

const apply = (s: string, styleName: keyof typeof STYLES) => [...s].map((c) => mapChar(c, STYLES[styleName])).join('')

const COMBINING_UNDERLINE = '̲'
const COMBINING_STRIKETHROUGH = '̶'

function withCombining(s: string, mark: string, bold: boolean): string {
  const base = bold ? apply(s, 'bold') : s
  return [...base].map((c) => (c === '\n' ? c : c + mark)).join('')
}

const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'
const circledNum = (n: number) => (n >= 1 && n <= 20 ? CIRCLED[n - 1] : `(${n})`)

function eachNonEmptyLine(s: string, fn: (line: string, i: number) => string): string {
  let i = 0
  return s
    .split('\n')
    .map((line) => (line.trim() ? fn(line, i++) : line))
    .join('\n')
}

// Selection-aware helpers for a real toolbar: apply a style to just the
// selected substring (or the whole text if nothing's selected), matching
// how a real formatting toolbar behaves rather than always transforming
// the entire post.
export type InlineStyle = 'bold' | 'italic' | 'underline' | 'strikethrough'

export function applyInlineStyle(text: string, start: number, end: number, style: InlineStyle): { text: string; start: number; end: number } {
  const [from, to] = start === end ? [0, text.length] : [start, end]
  const selected = text.slice(from, to)
  const styled =
    style === 'bold' ? apply(selected, 'bold')
    : style === 'italic' ? apply(selected, 'italic')
    : style === 'underline' ? withCombining(selected, COMBINING_UNDERLINE, false)
    : withCombining(selected, COMBINING_STRIKETHROUGH, false)
  return { text: text.slice(0, from) + styled + text.slice(to), start: from, end: from + styled.length }
}

// Bullet/numbered apply per-line, scoped to whichever lines the selection
// touches (a collapsed cursor touches just its own line) -- lines outside
// that range are left untouched, same as a real editor's list button.
export type ListStyle = 'bullet' | 'numbered' | 'checklist'

export function applyListStyle(text: string, start: number, end: number, style: ListStyle): { text: string; start: number; end: number } {
  const lines = text.split('\n')
  let idx = 0
  let startLine = 0
  let endLine = lines.length - 1
  for (let i = 0; i < lines.length; i++) {
    const lineStart = idx
    const lineEnd = idx + lines[i].length
    if (start >= lineStart && start <= lineEnd) startLine = i
    if (end >= lineStart && end <= lineEnd) endLine = i
    idx = lineEnd + 1
  }
  let n = 1
  const newLines = lines.map((line, i) => {
    if (i < startLine || i > endLine || !line.trim()) return line
    if (style === 'bullet') return `• ${line}`
    if (style === 'checklist') return `☑ ${line}`
    return `${n++}. ${line}`
  })
  const newText = newLines.join('\n')
  return { text: newText, start: 0, end: newText.length }
}

export interface LinkedInStyleOption {
  label: string
  fn: (s: string) => string
}

export const LINKEDIN_STYLES: LinkedInStyleOption[] = [
  { label: 'Bold', fn: (s) => apply(s, 'bold') },
  { label: 'Bold Sans', fn: (s) => apply(s, 'boldSans') },
  { label: 'Italic', fn: (s) => apply(s, 'italic') },
  { label: 'Italic Sans', fn: (s) => apply(s, 'italicSans') },
  { label: 'Bold Italic', fn: (s) => apply(s, 'boldItalic') },
  { label: 'Bold Italic Sans', fn: (s) => apply(s, 'boldItalicSans') },
  { label: 'Sans', fn: (s) => apply(s, 'sans') },
  { label: 'Underline', fn: (s) => withCombining(s, COMBINING_UNDERLINE, false) },
  { label: 'Strikethrough', fn: (s) => withCombining(s, COMBINING_STRIKETHROUGH, false) },
  { label: 'Bold Underline', fn: (s) => withCombining(s, COMBINING_UNDERLINE, true) },
  { label: 'Bold Strikethrough', fn: (s) => withCombining(s, COMBINING_STRIKETHROUGH, true) },
  { label: 'Script', fn: (s) => apply(s, 'script') },
  { label: 'Doublestruck', fn: (s) => apply(s, 'doublestruck') },
  { label: 'Fullwidth', fn: (s) => apply(s, 'fullwidth') },
  { label: 'Monospace', fn: (s) => apply(s, 'monospace') },
  { label: 'Uppercase', fn: (s) => s.toUpperCase() },
  { label: 'Lowercase', fn: (s) => s.toLowerCase() },
  { label: 'Numbered List', fn: (s) => eachNonEmptyLine(s, (l, i) => `${i + 1}. ${l}`) },
  { label: 'Bullet Points', fn: (s) => eachNonEmptyLine(s, (l) => `• ${l}`) },
  { label: 'Checklist', fn: (s) => eachNonEmptyLine(s, (l) => `☑ ${l}`) },
  { label: 'Ascending List', fn: (s) => eachNonEmptyLine(s, (l, i) => `${circledNum(i + 1)} ${l}`) },
  {
    label: 'Descending List',
    fn: (s) => {
      const total = s.split('\n').filter((l) => l.trim()).length
      return eachNonEmptyLine(s, (l, i) => `${circledNum(total - i)} ${l}`)
    },
  },
]
