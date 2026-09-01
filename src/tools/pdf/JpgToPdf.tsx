import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { FileList } from '../../components/FileList'
import { Button } from '../../components/Button'
import { ErrorState, EmptyState } from '../../components/States'
import { downloadBlob } from '../../lib/download'
import { useAsyncTask } from '../../lib/useAsyncTask'
import { imagesToPdf } from '../../processors/pdf'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'jpg-to-pdf')!

export default function JpgToPdf() {
  const [files, setFiles] = useState<File[]>([])
  const { busy, error, run } = useAsyncTask()

  async function process() {
    await run(async () => {
      const blob = await imagesToPdf(files)
      downloadBlob(blob, 'images.pdf')
    })
  }

  return (
    <ToolLayout tool={tool}>
      <DropZone
        accept="image/jpeg,image/png"
        multiple
        hint="JPG or PNG files"
        onFiles={(f) => setFiles((prev) => [...prev, ...f.filter((x) => x.type === 'image/jpeg' || x.type === 'image/png')])}
      />

      {files.length === 0 ? (
        <EmptyState message="Add one or more images — each becomes a page, in the order added." />
      ) : (
        <FileList files={files} onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))} />
      )}

      {error && <ErrorState message={error} />}

      <div className="flex gap-3">
        <Button onClick={process} disabled={files.length === 0 || busy}>
          {busy ? 'Creating PDF…' : 'Create PDF'}
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
