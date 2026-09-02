# ToolSuite

A free, privacy-first all-in-one utility site for files, media, documents, and developer tasks.

**Core principle:** nothing you upload is ever stored. Every tool below runs 100% in your
browser — no server, no database, no account. Close the tab and your file is gone, the way it
should be.

## What's built (Phase 1 + Phase 2)

77 fully working tools, all client-side:

- **PDF** — Merge, Split, Extract Pages, Delete Pages, Rotate, Reorder (drag-and-drop),
  JPG/PNG → PDF, PDF → JPG, Compress, Watermark, Add Text (click-to-place), Page Numbers,
  PDF to Text (real text-layer extraction), Remove PDF Metadata
- **Images** — Convert (JPG/PNG/WebP), Resize, Crop, Compress, Rotate, Remove Metadata
- **Developer** — JSON Formatter, JSON ⇄ CSV, JSON ⇄ YAML, JSON ⇄ XML, Base64, URL Encode/Decode,
  Hash Generator (MD5/SHA-1/256/512), JWT Decoder, UUID Generator, Regex Tester, SQL Formatter,
  HTML/CSS/JS Formatter
- **Text** — Word Counter, Case Converter, Text Diff, Markdown Editor, Text Cleaner (dedupe/trim),
  Lorem Ipsum Generator
- **Utilities** — QR Generator, QR Scanner, Color Converter, Color Palette Generator,
  Gradient Generator, Favicon Generator, Password Generator, Scientific Calculator,
  Unit Converter, Percentage Calculator, Number Base Converter, Date & Time Calculator,
  Random Number Generator
- **File Analyzer** — type, size, hash, and format-specific metadata for any file
- **OCR** — Image to Text, PDF to Text (real WASM OCR via Tesseract.js)
- **Archives** — Create ZIP, Extract ZIP
- **Data** — CSV Viewer, CSV Cleaner, CSV ⇄ Excel, JSON Tree Viewer
- **Web** — URL Parser, UTM Builder/Cleaner, Open Graph Generator, Robots.txt Generator,
  Sitemap Generator
- **Video** — Converter (MP4/WebM/MOV/AVI/MKV), Compressor, Trimmer, Video → GIF, Extract Audio,
  Change Resolution (real WASM FFmpeg via ffmpeg.wasm)
- **Audio** — Converter (MP3/WAV/M4A/OGG/FLAC), Trimmer, Compressor, Volume/Normalize
- **Privacy** — Sensitive Data Scanner (emails, cards, keys and more, regex-based, nothing leaves
  your browser)

Plus: global search, category browsing, light/dark theme, responsive layout, and a shared
component architecture so new tools are cheap to add.

## Why (almost) zero backend

Every tool above has a real, mature browser-side implementation: [`pdf-lib`](https://pdf-lib.js.org/)
+ [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) for PDFs, the Canvas API for images,
[`tesseract.js`](https://tesseract.projectnaptha.com/) (WASM) for OCR, [`jszip`](https://stuk.github.io/jszip/)
for archives, [SheetJS](https://sheetjs.com/) for Excel, [`ffmpeg.wasm`](https://ffmpegwasm.netlify.app/)
(a real WASM build of FFmpeg) for video/audio, Web Crypto (`SubtleCrypto`) for hashing. That means
the "no permanent storage" promise isn't a policy you have to trust — there's no upload endpoint
for a file to ever reach. It's also free to host: this is a static site.

The one exception: OCR's language-model file (~10-15MB, English) is fetched from Tesseract's
own public CDN the first time you use an OCR tool, cached by the browser after that. It never
carries any of your file's content — it's a one-time download of Tesseract's own asset, same as
any web font. FFmpeg's engine binary (~32MB, WASM) is self-hosted from this app's own origin
instead, for the same reason pdf.js's worker is: it's a large asset, not a CDN dependency.

Remaining Phase 3 items (LaTeX, AI document tools, real webpage screenshotting) need either a
genuinely heavier client integration (a WASM TeX engine) or a real backend (screenshotting an
arbitrary URL, HTTP checks that hit CORS from the browser) — see [Roadmap](#roadmap).

## Stack

React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + React Router. No backend, no database.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Deployment

`dist/` is a plain static site — deploy it to any static host (Vercel, Netlify, Cloudflare
Pages, GitHub Pages). No environment variables, no build secrets, no server config needed.
`vercel.json` adds the one thing a client-side router needs: a rewrite so every path serves
`index.html` and lets React Router take over (otherwise a direct link to e.g. `/pdf/merge` 404s).

## Project structure

```
src/
  components/     # shared UI: DropZone, ToolLayout, Button, SearchBar, ...
  pages/          # HomePage, CategoryPage
  tools/          # one file per tool, grouped by category
    pdf/  images/  developer/  text/  utilities/  analyzer/
    ocr/  archives/  data/  web/  video/  audio/
  processors/     # the actual file-processing logic (pdf.ts, image.ts, hash.ts, csv.ts,
                   # ocr.ts, archive.ts, spreadsheet.ts, pdfRender.ts, ffmpeg.ts)
  lib/            # registry (tool metadata), search, small utilities
  types/          # ToolMeta, CategoryMeta
```

Every tool is registered once in `src/lib/registry.ts` (name, description, category, path,
search keywords) and lazy-loaded in `src/App.tsx` — the homepage never downloads pdf-lib,
pdfjs-dist, tesseract.js, ffmpeg.wasm, or any other tool's dependencies until that specific tool
is opened.

`vite.config.ts` excludes `@ffmpeg/ffmpeg`/`@ffmpeg/util` from Vite's dev-mode dependency
pre-bundling — that package constructs its own Worker via a relative `import.meta.url`, which
pre-bundling breaks (the worker script silently fails to load and every ffmpeg call hangs
forever with no error). Confirmed via a real Playwright-driven browser, both in dev and against
the production build.

## Roadmap

**Phase 2, remaining**: LaTeX workspace (a WASM TeX engine), Protect/Unlock PDF (pdf-lib has no
built-in encryption support), Background Removal.

**Phase 2b** (needs a real backend): Webpage screenshot / HTML to PDF, HTTP status/header
checking — both require fetching an arbitrary third-party URL, which the browser's own CORS
policy blocks from client-side JS.

**Phase 3**: AI document tools, universal converter, workflow builder, natural-language search.

Not-yet-built tools are shown in each category page as "coming later" — never as a fake button
that doesn't work.
