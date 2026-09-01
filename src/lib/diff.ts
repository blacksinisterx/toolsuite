export type DiffOp = { type: 'equal' | 'add' | 'remove'; line: string }

/** Classic LCS-based line diff -- O(n*m), fine for the pasted-text sizes
 * this tool is meant for. No dependency needed for line-level diffing. */
export function diffLines(a: string, b: string): DiffOp[] {
  const linesA = a.split('\n')
  const linesB = b.split('\n')
  const n = linesA.length
  const m = linesB.length
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = linesA[i] === linesB[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }

  const ops: DiffOp[] = []
  let i = 0, j = 0
  while (i < n && j < m) {
    if (linesA[i] === linesB[j]) {
      ops.push({ type: 'equal', line: linesA[i] })
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ type: 'remove', line: linesA[i] })
      i++
    } else {
      ops.push({ type: 'add', line: linesB[j] })
      j++
    }
  }
  while (i < n) ops.push({ type: 'remove', line: linesA[i++] })
  while (j < m) ops.push({ type: 'add', line: linesB[j++] })
  return ops
}
