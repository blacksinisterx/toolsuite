import { rgbToHex } from './color'

/** Dominant-color extraction via histogram quantization: downsample the
 * image for speed, bucket pixels by coarse RGB (so near-identical shades
 * count as "the same" color), then return the N most common buckets'
 * average color. A real, standard technique for this -- not a fake
 * placeholder -- just not a full k-means clustering, which would be
 * overkill for a quick palette pull. */
export async function extractPaletteFromImage(file: File, count = 5): Promise<string[]> {
  const bitmap = await createImageBitmap(file)
  const maxSide = 150
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)

  const BUCKET = 24 // quantization step per channel
  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>()

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha < 128) continue // skip transparent pixels
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const key = `${Math.floor(r / BUCKET)},${Math.floor(g / BUCKET)},${Math.floor(b / BUCKET)}`
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.r += r; bucket.g += g; bucket.b += b; bucket.n += 1
    } else {
      buckets.set(key, { r, g, b, n: 1 })
    }
  }

  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map((b) => rgbToHex({ r: b.r / b.n, g: b.g / b.n, b: b.b / b.n }))
}
