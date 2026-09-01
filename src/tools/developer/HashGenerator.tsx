import { useEffect, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { CopyButton } from '../../components/CopyButton'
import { Button } from '../../components/Button'
import { textareaCls, labelCls } from '../../components/formStyles'
import { hashText, hashFile, type HashAlgo } from '../../processors/hash'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'hash-generator')!
const ALGOS: HashAlgo[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512']

export default function HashGenerator() {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!text && !file) {
      setHashes({})
      return
    }
    let cancelled = false
    setBusy(true)
    Promise.all(ALGOS.map(async (algo) => [algo, file ? await hashFile(file, algo) : await hashText(text, algo)] as const))
      .then((entries) => !cancelled && setHashes(Object.fromEntries(entries)))
      .finally(() => !cancelled && setBusy(false))
    return () => {
      cancelled = true
    }
  }, [text, file])

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="in">Text</label>
        <textarea
          id="in"
          className={textareaCls}
          rows={5}
          spellCheck={false}
          value={text}
          disabled={!!file}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <p className="text-center text-xs text-text-faint">— or —</p>

      {!file ? (
        <DropZone hint="Hash any file instead of typed text" onFiles={(f) => { setFile(f[0]); setText('') }} />
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm">
          <span className="truncate">{file.name}</span>
          <Button variant="ghost" onClick={() => setFile(null)}>Remove</Button>
        </div>
      )}

      {(text || file) && (
        <div className="flex flex-col gap-2">
          {ALGOS.map((algo) => (
            <div key={algo} className="flex items-center gap-3 rounded-lg border border-border bg-bg-sunken px-3 py-2">
              <span className="w-16 shrink-0 text-xs font-semibold text-text-muted">{algo}</span>
              <code className="flex-1 truncate font-mono text-xs text-text">{busy ? 'Computing…' : hashes[algo]}</code>
              {hashes[algo] && <CopyButton text={hashes[algo]} />}
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  )
}
