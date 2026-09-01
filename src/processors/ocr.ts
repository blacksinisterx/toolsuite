import { createWorker } from 'tesseract.js'
import { renderPdfPages } from './pdfRender'

/** Tesseract.js runs OCR via WASM in the browser -- the image/PDF itself
 * never leaves the machine. Its language-model file (~10-15MB, English by
 * default) is fetched from Tesseract's own public CDN the first time OCR
 * runs and cached by the browser after that -- the only network request
 * this tool makes, and it never carries any of your content. */
export async function ocrImage(file: File, onProgress?: (pct: number) => void): Promise<string> {
  const worker = await createWorker('eng', undefined, {
    logger: (m) => {
      if (m.status === 'recognizing text') onProgress?.(Math.round(m.progress * 100))
    },
  })
  try {
    const { data } = await worker.recognize(file)
    return data.text
  } finally {
    await worker.terminate()
  }
}

export async function ocrPdf(file: File, onProgress?: (pageDone: number, total: number) => void): Promise<string> {
  const pageImages = await renderPdfPages(file, 2)
  const worker = await createWorker('eng')
  try {
    const texts: string[] = []
    for (let i = 0; i < pageImages.length; i++) {
      const { data } = await worker.recognize(pageImages[i])
      texts.push(`--- Page ${i + 1} ---\n${data.text}`)
      onProgress?.(i + 1, pageImages.length)
    }
    return texts.join('\n\n')
  } finally {
    await worker.terminate()
  }
}
