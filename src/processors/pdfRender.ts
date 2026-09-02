import * as pdfjsLib from 'pdfjs-dist'
// eslint-disable-next-line import/no-unresolved
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

/** destroy() lives on the loading task pdfjs-dist's own types return from
 * getDocument(), not on the resolved PDFDocumentProxy -- keep the task
 * around so worker-side resources actually get released after each use. */
async function withPdf<T>(bytes: ArrayBuffer, fn: (pdf: pdfjsLib.PDFDocumentProxy) => Promise<T>): Promise<T> {
  const task = pdfjsLib.getDocument({ data: bytes })
  const pdf = await task.promise
  try {
    return await fn(pdf)
  } finally {
    await task.destroy()
  }
}

async function renderPageToCanvas(pdf: pdfjsLib.PDFDocumentProxy, pageNum: number, scale: number) {
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  // `canvas` alone -- pdfjs-dist's own docs say `canvas` and `canvasContext`
  // are mutually exclusive ("if canvasContext must be used, canvas must be
  // null"); `canvas` is the modern, preferred parameter.
  await page.render({ canvas, viewport }).promise
  return canvas
}

/** Renders every page of a PDF to a canvas data URL, for thumbnails and
 * PDF-to-JPG export. Runs entirely in the browser via pdf.js's WASM/JS
 * renderer -- no upload involved. */
export async function renderPdfPages(file: File, scale = 1): Promise<string[]> {
  const bytes = await file.arrayBuffer()
  return withPdf(bytes, async (pdf) => {
    const urls: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      urls.push((await renderPageToCanvas(pdf, i, scale)).toDataURL('image/jpeg', 0.9))
    }
    return urls
  })
}

export async function pdfPagesToJpgBlobs(file: File, scale = 2): Promise<Blob[]> {
  const bytes = await file.arrayBuffer()
  return withPdf(bytes, async (pdf) => {
    const blobs: Blob[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const canvas = await renderPageToCanvas(pdf, i, scale)
      const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92))
      blobs.push(blob)
    }
    return blobs
  })
}

/** Pulls the real text layer out of a PDF via pdf.js's own text content API
 * -- this only finds text a PDF actually embeds as text (fast, exact, no
 * WASM model download). A scanned/image-only PDF has no text layer at all;
 * that case is what the separate OCR tool (Tesseract.js) is for. */
export async function extractPdfText(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  return withPdf(bytes, async (pdf) => {
    const pages: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
      pages.push(text.trim())
    }
    return pages.join('\n\n')
  })
}
