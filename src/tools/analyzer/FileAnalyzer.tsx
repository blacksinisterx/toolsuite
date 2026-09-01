import { useEffect, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { DropZone } from '../../components/DropZone'
import { Button } from '../../components/Button'
import { formatBytes } from '../../lib/format'
import { hashFile } from '../../processors/hash'
import { getPageCount } from '../../processors/pdf'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'file-analyzer')!

export default function FileAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [sha256, setSha256] = useState('')
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)

  useEffect(() => {
    if (!file) return
    setSha256('')
    setDimensions(null)
    setPageCount(null)

    hashFile(file, 'SHA-256').then(setSha256)

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        setDimensions({ w: img.naturalWidth, h: img.naturalHeight })
        URL.revokeObjectURL(url)
      }
      img.src = url
    }

    if (file.type === 'application/pdf') {
      getPageCount(file).then(setPageCount).catch(() => setPageCount(null))
    }
  }, [file])

  const row = (label: string, value: string) => (
    <div className="flex items-center justify-between border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="max-w-[60%] truncate text-right font-mono text-xs text-text">{value}</span>
    </div>
  )

  return (
    <ToolLayout tool={tool}>
      {!file && <DropZone hint="Any file type" onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <div className="rounded-lg border border-border bg-bg-sunken px-4">
            {row('Name', file.name)}
            {row('Type', file.type || 'unknown')}
            {row('Size', formatBytes(file.size))}
            {row('Last modified', new Date(file.lastModified).toLocaleString())}
            {dimensions && row('Dimensions', `${dimensions.w} × ${dimensions.h}px`)}
            {pageCount !== null && row('Pages', String(pageCount))}
            {row('SHA-256', sha256 || 'computing…')}
          </div>
          <Button variant="ghost" onClick={() => setFile(null)}>Analyze another file</Button>
        </>
      )}
    </ToolLayout>
  )
}
