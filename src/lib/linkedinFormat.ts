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
