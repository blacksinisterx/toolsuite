import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'

async function loadPdf(file: File) {
  const bytes = await file.arrayBuffer()
  return PDFDocument.load(bytes)
}

// pdf-lib's save() returns Uint8Array<ArrayBufferLike>, which newer TS lib
// defs don't accept directly as a BlobPart (ArrayBufferLike also covers
// SharedArrayBuffer, which Blob's constructor type doesn't allow) -- copy
// into a fresh, definitely-ArrayBuffer-backed Uint8Array once, here.
function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
}

export async function getPageCount(file: File): Promise<number> {
  const doc = await loadPdf(file)
  return doc.getPageCount()
}

export interface PdfMetadata {
  title: string
  author: string
  subject: string
  keywords: string
  producer: string
  creator: string
}

export async function readPdfMetadata(file: File): Promise<PdfMetadata> {
  const doc = await loadPdf(file)
  return {
    title: doc.getTitle() ?? '',
    author: doc.getAuthor() ?? '',
    subject: doc.getSubject() ?? '',
    keywords: doc.getKeywords() ?? '',
    producer: doc.getProducer() ?? '',
    creator: doc.getCreator() ?? '',
  }
}

/** Clears every standard metadata field pdf-lib exposes -- title, author,
 * subject, keywords, producer, creator, and both timestamps -- and
 * re-saves. Page content itself is untouched. */
export async function removePdfMetadata(file: File): Promise<Blob> {
  const doc = await loadPdf(file)
  doc.setTitle('')
  doc.setAuthor('')
  doc.setSubject('')
  doc.setKeywords([])
  doc.setProducer('')
  doc.setCreator('')
  doc.setCreationDate(new Date(0))
  doc.setModificationDate(new Date(0))
  return pdfBlob(await doc.save())
}

export async function mergePdfs(files: File[]): Promise<Blob> {
  const out = await PDFDocument.create()
  for (const file of files) {
    const src = await loadPdf(file)
    const pages = await out.copyPages(src, src.getPageIndices())
    pages.forEach((p) => out.addPage(p))
  }
  const bytes = await out.save()
  return pdfBlob(bytes)
}

/** Parses "1-3,5,8-9" (1-indexed, as shown to the user) into 0-indexed page numbers. */
export function parsePageRanges(input: string, pageCount: number): number[] {
  const indices = new Set<number>()
  for (const part of input.split(',').map((s) => s.trim()).filter(Boolean)) {
    const range = part.match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      const start = Math.max(1, parseInt(range[1], 10))
      const end = Math.min(pageCount, parseInt(range[2], 10))
      for (let i = start; i <= end; i++) indices.add(i - 1)
    } else if (/^\d+$/.test(part)) {
      const n = parseInt(part, 10)
      if (n >= 1 && n <= pageCount) indices.add(n - 1)
    }
  }
  return [...indices].sort((a, b) => a - b)
}

export async function extractPages(file: File, pageIndices: number[]): Promise<Blob> {
  const src = await loadPdf(file)
  const out = await PDFDocument.create()
  const pages = await out.copyPages(src, pageIndices)
  pages.forEach((p) => out.addPage(p))
  const bytes = await out.save()
  return pdfBlob(bytes)
}

export async function deletePages(file: File, pageIndicesToDelete: number[]): Promise<Blob> {
  const doc = await loadPdf(file)
  const toDelete = new Set(pageIndicesToDelete)
  // Delete from the end so earlier indices stay valid as we go.
  for (let i = doc.getPageCount() - 1; i >= 0; i--) {
    if (toDelete.has(i)) doc.removePage(i)
  }
  const bytes = await doc.save()
  return pdfBlob(bytes)
}

export async function rotatePages(file: File, pageIndices: number[], degreesAmount: 90 | 180 | 270): Promise<Blob> {
  const doc = await loadPdf(file)
  const pages = doc.getPages()
  const targets = pageIndices.length ? pageIndices : pages.map((_, i) => i)
  for (const i of targets) {
    const page = pages[i]
    const current = page.getRotation().angle
    page.setRotation(degrees((current + degreesAmount) % 360))
  }
  const bytes = await doc.save()
  return pdfBlob(bytes)
}

export async function reorderPages(file: File, newOrder: number[]): Promise<Blob> {
  const src = await loadPdf(file)
  const out = await PDFDocument.create()
  const pages = await out.copyPages(src, newOrder)
  pages.forEach((p) => out.addPage(p))
  const bytes = await out.save()
  return pdfBlob(bytes)
}

export async function imagesToPdf(files: File[]): Promise<Blob> {
  const doc = await PDFDocument.create()
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const isPng = file.type === 'image/png'
    const image = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
    const page = doc.addPage([image.width, image.height])
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
  }
  const bytes = await doc.save()
  return pdfBlob(bytes)
}

/** Light, honest compression: re-saves with object streams. This does not
 * recompress embedded images (pdf-lib can't decode/re-encode arbitrary
 * embedded image streams) -- it typically saves 5-20% on PDFs with a lot
 * of repeated objects/fonts, not the "shrink a scanned PDF" case. That
 * heavier version needs real image re-encoding and is a Phase 2 item. */
export async function compressPdf(file: File): Promise<Blob> {
  const doc = await loadPdf(file)
  const bytes = await doc.save({ useObjectStreams: true })
  return pdfBlob(bytes)
}

export async function watermarkPdf(file: File, text: string, opacity: number): Promise<Blob> {
  const doc = await loadPdf(file)
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize()
    const size = Math.min(width, height) / 8
    page.drawText(text, {
      x: width / 2 - (font.widthOfTextAtSize(text, size) / 2),
      y: height / 2,
      size,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(45),
    })
  }
  const bytes = await doc.save()
  return pdfBlob(bytes)
}

/** xFrac/yFrac are 0..1 fractions of the page, measured from the TOP-LEFT
 * (matching how a thumbnail image is clicked) -- converted here to PDF's
 * own bottom-left-origin point space. */
export async function addTextToPdf(
  file: File,
  pageIndex: number,
  xFrac: number,
  yFrac: number,
  text: string,
  size: number,
  colorHex: string,
): Promise<Blob> {
  const doc = await loadPdf(file)
  const page = doc.getPage(pageIndex)
  const { width, height } = page.getSize()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const r = parseInt(colorHex.slice(1, 3), 16) / 255
  const g = parseInt(colorHex.slice(3, 5), 16) / 255
  const b = parseInt(colorHex.slice(5, 7), 16) / 255
  page.drawText(text, { x: xFrac * width, y: height - yFrac * height, size, font, color: rgb(r, g, b) })
  const bytes = await doc.save()
  return pdfBlob(bytes)
}

export type NumberPosition = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'

export async function addPageNumbers(file: File, position: NumberPosition, format: string, startAt: number): Promise<Blob> {
  const doc = await loadPdf(file)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const size = 10
  const margin = 24
  const pages = doc.getPages()
  pages.forEach((page, i) => {
    const { width, height } = page.getSize()
    const text = format.replace('{n}', String(i + startAt)).replace('{total}', String(pages.length))
    const textWidth = font.widthOfTextAtSize(text, size)
    const x = position.endsWith('center') ? width / 2 - textWidth / 2 : position.endsWith('right') ? width - margin - textWidth : margin
    const y = position.startsWith('top') ? height - margin : margin - size / 2
    page.drawText(text, { x, y, size, font, color: rgb(0.3, 0.3, 0.3) })
  })
  const bytes = await doc.save()
  return pdfBlob(bytes)
}
