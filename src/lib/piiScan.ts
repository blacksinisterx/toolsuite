export interface PiiMatch {
  type: string
  value: string
  index: number
}

// Regex-only heuristics -- no ML, no network call, everything stays in the
// browser. Order matters: more specific patterns (SSN, credit card) are
// checked before broader ones (generic long-number sequences aren't scanned
// at all, to keep the false-positive rate sane).
const PATTERNS: { type: string; re: RegExp }[] = [
  { type: 'Email address', re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { type: 'Credit card number', re: /\b(?:\d[ -]?){13,16}\b/g },
  { type: 'US Social Security Number', re: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: 'Phone number', re: /\b(?:\+?\d{1,3}[ -]?)?(?:\(\d{2,4}\)[ -]?)?\d{3,4}[ -]?\d{3,4}[ -]?\d{0,4}\b/g },
  { type: 'IPv4 address', re: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\b/g },
  { type: 'IBAN', re: /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g },
  { type: 'AWS Access Key', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { type: 'Private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { type: 'JWT', re: /\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { type: 'API key / secret (generic)', re: /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"]?[A-Za-z0-9_\-/+]{12,}['"]?/gi },
]

function luhnValid(digits: string): boolean {
  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i])
    if (alt) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    alt = !alt
  }
  return sum % 10 === 0
}

export function scanText(text: string): PiiMatch[] {
  const matches: PiiMatch[] = []
  for (const { type, re } of PATTERNS) {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      const value = m[0]
      if (type === 'Credit card number') {
        const digits = value.replace(/[ -]/g, '')
        if (digits.length < 13 || digits.length > 19 || !luhnValid(digits)) continue
      }
      if (type === 'Phone number') {
        const digits = value.replace(/\D/g, '')
        if (digits.length < 7 || digits.length > 15) continue
      }
      matches.push({ type, value, index: m.index })
    }
  }
  return matches.sort((a, b) => a.index - b.index)
}
