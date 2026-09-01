import JSZip from 'jszip'

export async function createZip(files: File[]): Promise<Blob> {
  const zip = new JSZip()
  for (const file of files) zip.file(file.name, file)
  return zip.generateAsync({ type: 'blob' })
}

export interface ZipEntry {
  name: string
  getBlob: () => Promise<Blob>
}

/** Strips ".."/leading-slash path components -- an entry name from an
 * untrusted zip can otherwise carry a "zip-slip" path (../../whatever).
 * Downloading via the browser's save dialog can't actually escape the
 * user's own choice of folder, but the filename we hand it should never
 * echo a raw traversal path back at them either. */
function safeName(name: string): string {
  return name.split('/').filter((seg) => seg && seg !== '..').join('/') || 'file'
}

export async function readZip(file: File): Promise<ZipEntry[]> {
  const zip = await JSZip.loadAsync(file)
  const entries: ZipEntry[] = []
  zip.forEach((_path, entry) => {
    if (entry.dir) return
    entries.push({ name: safeName(entry.name), getBlob: () => entry.async('blob') })
  })
  return entries.sort((a, b) => a.name.localeCompare(b.name))
}
