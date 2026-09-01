import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
// Self-hosted, not fetched from a CDN -- same reasoning as the OCR language
// model comment: this is a large (~32MB) engine binary, not user content,
// but keeping it on our own origin means it's covered by the same "nothing
// leaves this app's control" story as everything else here.
import coreURL from '@ffmpeg/core?url'
import wasmURL from '@ffmpeg/core/wasm?url'

let ffmpegPromise: Promise<FFmpeg> | null = null

/** One shared FFmpeg instance for the whole session (loading the ~32MB core
 * a second time per tool visit would be wasteful) -- @ffmpeg/ffmpeg runs
 * its actual work in a Web Worker internally, so this never blocks the UI
 * thread regardless of how many video tools reuse it. */
function getFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg()
      await ffmpeg.load({
        coreURL: await toBlobURL(coreURL, 'text/javascript'),
        wasmURL: await toBlobURL(wasmURL, 'application/wasm'),
      })
      return ffmpeg
    })()
  }
  return ffmpegPromise
}

function extOf(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? 'bin'
}

const MIME: Record<string, string> = {
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', mkv: 'video/x-matroska', avi: 'video/x-msvideo', gif: 'image/gif',
  mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', ogg: 'audio/ogg', aac: 'audio/aac', flac: 'audio/flac',
}

async function run(
  file: File,
  outName: string,
  args: string[],
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const ffmpeg = await getFFmpeg()
  const inName = `input.${extOf(file.name)}`
  const onProgressEvent = ({ progress }: { progress: number }) => onProgress?.(Math.min(1, Math.max(0, progress)))
  if (onProgress) ffmpeg.on('progress', onProgressEvent)
  try {
    await ffmpeg.writeFile(inName, await fetchFile(file))
    await ffmpeg.exec(['-i', inName, ...args, outName])
    const data = await ffmpeg.readFile(outName)
    const bytes = data as Uint8Array
    return new Blob([new Uint8Array(bytes)], { type: MIME[extOf(outName)] ?? 'application/octet-stream' })
  } finally {
    if (onProgress) ffmpeg.off('progress', onProgressEvent)
    await ffmpeg.deleteFile(inName).catch(() => {})
    await ffmpeg.deleteFile(outName).catch(() => {})
  }
}

export const convertVideo = (file: File, outExt: string, onProgress?: (r: number) => void) =>
  run(file, `output.${outExt}`, [], onProgress)

export const compressVideo = (file: File, crf: number, onProgress?: (r: number) => void) =>
  run(file, `output.${extOf(file.name)}`, ['-vcodec', 'libx264', '-crf', String(crf), '-preset', 'veryfast'], onProgress)

export const trimVideo = (file: File, start: string, end: string, onProgress?: (r: number) => void) =>
  run(file, `output.${extOf(file.name)}`, ['-ss', start, '-to', end, '-c', 'copy'], onProgress)

export const videoToGif = (file: File, fps: number, width: number, onProgress?: (r: number) => void) =>
  run(file, 'output.gif', ['-vf', `fps=${fps},scale=${width}:-1:flags=lanczos`], onProgress)

export const extractAudioFromVideo = (file: File, outExt: string, onProgress?: (r: number) => void) =>
  run(file, `output.${outExt}`, ['-vn'], onProgress)

export const changeVideoResolution = (file: File, width: number, height: number, onProgress?: (r: number) => void) =>
  run(file, `output.${extOf(file.name)}`, ['-vf', `scale=${width}:${height}`], onProgress)

export const convertAudio = (file: File, outExt: string, onProgress?: (r: number) => void) =>
  run(file, `output.${outExt}`, [], onProgress)

export const trimAudio = (file: File, start: string, end: string, onProgress?: (r: number) => void) =>
  run(file, `output.${extOf(file.name)}`, ['-ss', start, '-to', end], onProgress)

export const compressAudio = (file: File, bitrateKbps: number, onProgress?: (r: number) => void) =>
  run(file, `output.${extOf(file.name)}`, ['-b:a', `${bitrateKbps}k`], onProgress)

export const changeAudioVolume = (file: File, factor: number, onProgress?: (r: number) => void) =>
  run(file, `output.${extOf(file.name)}`, ['-filter:a', `volume=${factor}`], onProgress)

export const normalizeAudio = (file: File, onProgress?: (r: number) => void) =>
  run(file, `output.${extOf(file.name)}`, ['-filter:a', 'loudnorm'], onProgress)
