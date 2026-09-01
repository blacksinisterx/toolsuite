import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { FileList } from '../../components/FileList'
import { Button } from '../../components/Button'
import { ErrorState, EmptyState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { createZip } from '../../processors/archive'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'create-zip')!

export default function CreateZip() {
  const [files, setFiles] = useState<File[]>([])
  const { busy, error, run } = useAsyncTask()

  async function process() {
    await run(async () => {
      downloadBlob(await createZip(files), 'archive.zip')
    })
  }

  return (
    <ToolLayout tool={tool}>
      <DropZone multiple hint="Any files" onFiles={(f) => setFiles((prev) => [...prev, ...f])} />

      {files.length === 0 ? (
        <EmptyState message="Add the files you want zipped together." />
      ) : (
        <FileList files={files} onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))} />
      )}

      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={files.length === 0 || busy}>
          {busy ? 'Zipping…' : 'Create ZIP'}
        </Button>
        {files.length > 0 && (
          <Button variant="ghost" onClick={() => setFiles([])}>
            Reset
          </Button>
        )}
      </div>
    </ToolLayout>
  )
}
