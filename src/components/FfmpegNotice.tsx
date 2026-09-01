export function FfmpegNotice() {
  return (
    <p className="text-xs text-text-faint">
      First use on this visit downloads a real FFmpeg engine (~30MB, WebAssembly) so this can run
      entirely in your browser — cached after that. Large files can take a while and use real
      memory; for best results keep video under ~300MB.
    </p>
  )
}
