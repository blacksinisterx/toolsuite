import { useCallback, useState } from 'react'

/** Every tool's "Process" step is the same shape: run some async work,
 * show a busy state, catch and surface a friendly error. One hook instead
 * of reimplementing this in ~30 tool components. */
export function useAsyncTask() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong while processing this file.')
    } finally {
      setBusy(false)
    }
  }, [])

  const reset = useCallback(() => setError(null), [])

  return { busy, error, run, reset }
}
