/** Minimal recursive-descent expression evaluator -- deliberately not
 * `eval`/`Function` (never run arbitrary JS from user input, even our own
 * UI's). Supports + - * / ^, parens, unary minus, sin/cos/tan/sqrt/log/ln,
 * and the constants pi/e. */
const FUNCS: Record<string, (n: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  sqrt: Math.sqrt, log: Math.log10, ln: Math.log, abs: Math.abs,
}
const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E }

export function evaluateExpression(input: string): number {
  const tokens = input.match(/(\d+\.?\d*|\.\d+|[a-zA-Z]+|[+\-*/^(),])/g) ?? []
  let pos = 0
  const peek = () => tokens[pos]
  const next = () => tokens[pos++]

  function parseExpr(): number {
    let value = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const op = next()
      const rhs = parseTerm()
      value = op === '+' ? value + rhs : value - rhs
    }
    return value
  }
  function parseTerm(): number {
    let value = parsePow()
    while (peek() === '*' || peek() === '/') {
      const op = next()
      const rhs = parsePow()
      value = op === '*' ? value * rhs : value / rhs
    }
    return value
  }
  function parsePow(): number {
    const base = parseUnary()
    if (peek() === '^') {
      next()
      return base ** parsePow()
    }
    return base
  }
  function parseUnary(): number {
    if (peek() === '-') {
      next()
      return -parseUnary()
    }
    return parseAtom()
  }
  function parseAtom(): number {
    const tok = next()
    if (tok === undefined) throw new Error('Unexpected end of expression.')
    if (tok === '(') {
      const value = parseExpr()
      if (next() !== ')') throw new Error('Missing closing parenthesis.')
      return value
    }
    if (/^[a-zA-Z]+$/.test(tok)) {
      if (tok in FUNCS) {
        if (next() !== '(') throw new Error(`Expected "(" after ${tok}`)
        const arg = parseExpr()
        if (next() !== ')') throw new Error('Missing closing parenthesis.')
        return FUNCS[tok](arg)
      }
      if (tok in CONSTS) return CONSTS[tok]
      throw new Error(`Unknown function or constant: ${tok}`)
    }
    const n = Number(tok)
    if (Number.isNaN(n)) throw new Error(`Unexpected token: ${tok}`)
    return n
  }

  const result = parseExpr()
  if (pos < tokens.length) throw new Error(`Unexpected token: ${tokens[pos]}`)
  if (Number.isNaN(result)) throw new Error('Not a valid expression.')
  return result
}
