# Toolbox

A free, privacy-first all-in-one utility site for files, media, documents, and developer tasks.

**Core principle:** nothing you upload is ever stored. Every tool below runs 100% in your
browser — no server, no database, no account. Close the tab and your file is gone, the way it
should be.

## What's built (Phase 1 + Phase 2 part 1)

48 fully working tools, all client-side:

- **PDF** — Merge, Split, Extract Pages, Delete Pages, Rotate, Reorder (drag-and-drop),
  JPG/PNG → PDF, PDF → JPG, Compress, Watermark, Add Text (click-to-place), Page Numbers
- **Images** — Convert (JPG/PNG/WebP), Resize, Crop, Compress, Rotate, Remove Metadata
- **Developer** — JSON Formatter, JSON ⇄ CSV, Base64, URL Encode/Decode, Hash Generator
  (MD5/SHA-1/256/512), JWT Decoder, UUID Generator, Regex Tester
- **Text** — Word Counter, Case Converter, Text Diff, Markdown Editor
- **Utilities** — QR Generator, Color Converter, Password Generator, Calculator
- **File Analyzer** — type, size, hash, and format-specific metadata for any file
- **OCR** — Image to Text, PDF to Text (real WASM OCR via Tesseract.js)
- **Archives** — Create ZIP, Extract ZIP
- **Data** — CSV Viewer, CSV Cleaner, CSV ⇄ Excel, JSON Tree Viewer
- **Web** — URL Parser, UTM Builder/Cleaner, Open Graph Generator, Robots.txt Generator,
  Sitemap Generator

Plus: global search, category browsing, light/dark theme, responsive layout, and a shared
component architecture so new tools are cheap to add.

## Why (almost) zero backend

Every tool above has a real, mature browser-side implementation: [`pdf-lib`](https://pdf-lib.js.org/)
+ [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) for PDFs, the Canvas API for images,
[`tesseract.js`](https://tesseract.projectnaptha.com/) (WASM) for OCR, [`jszip`](https://stuk.github.io/jszip/)
for archives, [SheetJS](https://sheetjs.com/) for Excel, Web Crypto (`SubtleCrypto`) for hashing.
That means the "no permanent storage" promise isn't a policy you have to trust — there's no
upload endpoint for a file to ever reach. It's also free to host: this is a static site.

The one exception: OCR's language-model file (~10-15MB, English) is fetched from Tesseract's
own public CDN the first time you use an OCR tool, cached by the browser after that. It never
carries any of your file's content — it's a one-time download of Tesseract's own asset, same as
any web font.

Remaining Phase 2/3 items (video/audio conversion, LaTeX, AI tools, real webpage screenshotting)
need either a genuinely heavier client integration (ffmpeg.wasm, a WASM TeX engine) or a real
backend (screenshotting an arbitrary URL, HTTP checks that hit CORS from the browser) — see
[Roadmap](#roadmap).

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
    ocr/  archives/  data/  web/
  processors/     # the actual file-processing logic (pdf.ts, image.ts, hash.ts, csv.ts,
                   # ocr.ts, archive.ts, spreadsheet.ts, pdfRender.ts)
  lib/            # registry (tool metadata), search, small utilities
  types/          # ToolMeta, CategoryMeta
```

Every tool is registered once in `src/lib/registry.ts` (name, description, category, path,
search keywords) and lazy-loaded in `src/App.tsx` — the homepage never downloads pdf-lib,
pdfjs-dist, tesseract.js, or any other tool's dependencies until that specific tool is opened.

## Roadmap

**Phase 2, remaining**: Video/audio conversion (ffmpeg.wasm — a real, heavier client
integration that deserves its own careful pass), LaTeX workspace (a WASM TeX engine),
Protect/Unlock PDF (pdf-lib has no built-in encryption support), Background Removal.

**Phase 2b** (needs a real backend): Webpage screenshot / HTML to PDF, HTTP status/header
checking — both require fetching an arbitrary third-party URL, which the browser's own CORS
policy blocks from client-side JS.

**Phase 3**: AI document tools, universal converter, workflow builder, natural-language search.

Not-yet-built tools are shown in each category page as "coming later" — never as a fake button
that doesn't work.
