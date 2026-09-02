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

// A stuck/very-heavy WASM encode had no ceiling before -- it just spun
// forever with the progress bar frozen and no way out except reloading the
// tab. 5 minutes is generous for anything this app's tools are meant for
// (short clips), and turns a silent hang into a real, actionable error.
const MAX_RUN_MS = 5 * 60 * 1000

async function attempt(
  ffmpeg: FFmpeg,
  file: File,
  inName: string,
  outName: string,
  args: string[],
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const onProgressEvent = ({ progress }: { progress: number }) => onProgress?.(Math.min(1, Math.max(0, progress)))
  if (onProgress) ffmpeg.on('progress', onProgressEvent)
  try {
    await ffmpeg.writeFile(inName, await fetchFile(file))
    let timer: ReturnType<typeof setTimeout>
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        // .exec() itself has no cancel -- terminate the whole worker so it
        // actually stops burning CPU, and drop the cached instance so the
        // next tool call gets a fresh one instead of a dead reference.
        ffmpeg.terminate()
        ffmpegPromise = null
        reject(new Error('This is taking too long -- try a smaller file, a lower resolution, or a shorter clip.'))
      }, MAX_RUN_MS)
    })
    try {
      await Promise.race([ffmpeg.exec(['-i', inName, ...args, outName]), timeout])
    } finally {
      clearTimeout(timer!)
    }
    const data = await ffmpeg.readFile(outName)
    const bytes = data as Uint8Array
    return new Blob([new Uint8Array(bytes)], { type: MIME[extOf(outName)] ?? 'application/octet-stream' })
  } finally {
    if (onProgress) ffmpeg.off('progress', onProgressEvent)
    await ffmpeg.deleteFile(inName).catch(() => {})
    await ffmpeg.deleteFile(outName).catch(() => {})
  }
}

async function run(
  file: File,
  outName: string,
  args: string[],
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const inName = `input.${extOf(file.name)}`
  try {
    return await attempt(await getFFmpeg(), file, inName, outName, args, onProgress)
  } catch (e) {
    // The shared engine occasionally comes out of a prior job in a state
    // where the next, unrelated job on it fails outright (real, observed:
    // a run that used a scale filter left the *next* plain conversion
    // erroring every time until the page was reloaded). One retry on a
    // completely fresh instance is cheap next to a false "your video is
    // broken" and matches what reloading the tab already fixed by hand.
    ffmpegPromise = null
    try {
      return await attempt(await getFFmpeg(), file, inName, outName, args, onProgress)
    } catch {
      throw e
    }
  }
}

export const convertVideo = (file: File, outExt: string, onProgress?: (r: number) => void) =>
  // No args here means ffmpeg picks defaults for the target container --
  // when that requires a real re-encode (not a same-codec remux), it falls
  // back to libx264's slow "medium" preset same as changeVideoResolution
  // did. "veryfast" only takes effect when x264 is actually the encoder
  // chosen for outExt, so it's harmless to pass for containers that don't
  // use it.
  run(file, `output.${outExt}`, ['-preset', 'veryfast'], onProgress)

export const compressVideo = (file: File, crf: number, onProgress?: (r: number) => void) =>
  run(file, `output.${extOf(file.name)}`, ['-vcodec', 'libx264', '-crf', String(crf), '-preset', 'veryfast'], onProgress)

export const trimVideo = (file: File, start: string, end: string, onProgress?: (r: number) => void) =>
  run(file, `output.${extOf(file.name)}`, ['-ss', start, '-to', end, '-c', 'copy'], onProgress)

export const videoToGif = (file: File, fps: number, width: number, onProgress?: (r: number) => void) =>
  run(file, 'output.gif', ['-vf', `fps=${fps},scale=${width}:-1:flags=lanczos`], onProgress)

export const extractAudioFromVideo = (file: File, outExt: string, onProgress?: (r: number) => void) =>
  run(file, `output.${outExt}`, ['-vn'], onProgress)

export const changeVideoResolution = (file: File, width: number, height: number, onProgress?: (r: number) => void) => {
  // libx264 (the encoder .mp4/.mov/.mkv output actually uses) requires
  // even width/height for yuv420p -- an odd value the user typed crashed
  // the encode outright. Round instead of rejecting, so it just works.
  const w = Math.max(2, Math.round(width / 2) * 2)
  const h = Math.max(2, Math.round(height / 2) * 2)
  // This was the one video transcode with no -preset, silently defaulting
  // to libx264's "medium" -- 2-4x slower than every other tool here, which
  // all explicitly use "veryfast". That mismatch, not a real hang, is what
  // made this specific tool feel stuck.
  return run(file, `output.${extOf(file.name)}`, ['-vf', `scale=${w}:${h}`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23'], onProgress)
}

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
