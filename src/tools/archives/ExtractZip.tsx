import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { ErrorState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { readZip, type ZipEntry } from '../../processors/archive'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'extract-zip')!

export default function ExtractZip() {
  const [entries, setEntries] = useState<ZipEntry[] | null>(null)
  const { busy, error, run } = useAsyncTask()

  async function load(file: File) {
    await run(async () => {
      setEntries(await readZip(file))
    })
  }

  return (
    <ToolLayout tool={tool}>
      {!entries && <DropZone accept=".zip,application/zip" hint="A .zip file" onFiles={(f) => load(f[0])} />}

      {busy && <p className="text-sm text-text-muted">Reading archive…</p>}
      {error && <ErrorState message={error} />}

      {entries && (
        <>
          <p className="text-sm text-text-muted">{entries.length} file{entries.length === 1 ? '' : 's'} inside.</p>
          <ul className="flex flex-col gap-1.5">
            {entries.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm">
                <span className="truncate text-text">{entry.name}</span>
                <Button
                  variant="secondary"
                  onClick={async () => downloadBlob(await entry.getBlob(), entry.name.split('/').pop()!)}
                >
                  Download
                </Button>
              </li>
            ))}
          </ul>
          <Button variant="ghost" onClick={() => setEntries(null)}>
            Extract another ZIP
          </Button>
        </>
      )}
    </ToolLayout>
  )
}
