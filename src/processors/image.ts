export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp'

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read this image -- it may be corrupted or an unsupported format.'))
    }
    img.src = url
  })
}

function canvasFrom(img: HTMLImageElement, width = img.naturalWidth, height = img.naturalHeight) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  return { canvas, ctx }
}

function toBlob(canvas: HTMLCanvasElement, format: ImageFormat, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image in that format.'))),
      format,
      quality,
    )
  })
}

/** Convert format and/or drop quality. Re-drawing onto a fresh canvas also
 * strips EXIF/GPS metadata as a side effect -- canvas only ever carries
 * pixel data, never the original file's metadata segments. */
export async function convertImage(file: File, format: ImageFormat, quality = 0.92): Promise<Blob> {
  const img = await loadImage(file)
  const { canvas, ctx } = canvasFrom(img)
  ctx.drawImage(img, 0, 0)
  return toBlob(canvas, format, quality)
}

export const removeImageMetadata = (file: File, format: ImageFormat) => convertImage(file, format, 0.95)

export async function resizeImage(
  file: File,
  { width, height }: { width: number; height: number },
  format: ImageFormat,
  quality = 0.92,
): Promise<Blob> {
  const img = await loadImage(file)
  const { canvas, ctx } = canvasFrom(img, width, height)
  ctx.drawImage(img, 0, 0, width, height)
  return toBlob(canvas, format, quality)
}

export async function cropImage(
  file: File,
  box: { x: number; y: number; width: number; height: number },
  format: ImageFormat,
  quality = 0.92,
): Promise<Blob> {
  const img = await loadImage(file)
  const { canvas, ctx } = canvasFrom(img, box.width, box.height)
  ctx.drawImage(img, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height)
  return toBlob(canvas, format, quality)
}

export async function rotateImage(file: File, angle: 0 | 90 | 180 | 270, flip: boolean, format: ImageFormat, quality = 0.92): Promise<Blob> {
  const img = await loadImage(file)
  const swap = angle === 90 || angle === 270
  const w = swap ? img.naturalHeight : img.naturalWidth
  const h = swap ? img.naturalWidth : img.naturalHeight
  const { canvas, ctx } = canvasFrom(img, w, h)
  ctx.translate(w / 2, h / 2)
  ctx.rotate((angle * Math.PI) / 180)
  if (flip) ctx.scale(-1, 1)
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
  return toBlob(canvas, format, quality)
}
