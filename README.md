# Toolbox

A free, privacy-first all-in-one utility site for files, media, documents, and developer tasks.

**Core principle:** nothing you upload is ever stored. Every Phase 1 tool runs 100% in your
browser — no server, no database, no account. Close the tab and your file is gone, the way it
should be.

## What's built (Phase 1 MVP)

33 fully working tools, all client-side:

- **PDF** — Merge, Split, Extract Pages, Delete Pages, Rotate, Reorder (drag-and-drop),
  JPG/PNG → PDF, PDF → JPG, Compress, Watermark
- **Images** — Convert (JPG/PNG/WebP), Resize, Crop, Compress, Rotate, Remove Metadata
- **Developer** — JSON Formatter, JSON ⇄ CSV, Base64, URL Encode/Decode, Hash Generator
  (MD5/SHA-1/256/512), JWT Decoder, UUID Generator, Regex Tester
- **Text** — Word Counter, Case Converter, Text Diff, Markdown Editor
- **Utilities** — QR Generator, Color Converter, Password Generator, Calculator
- **File Analyzer** — type, size, hash, and format-specific metadata for any file

Plus: global search, category browsing, light/dark theme, responsive layout, and a shared
component architecture so new tools are cheap to add.

## Why zero backend for Phase 1

Every tool listed above has a real, mature browser-side implementation:
[`pdf-lib`](https://pdf-lib.js.org/) + [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) for PDFs,
the Canvas API for images, Web Crypto (`SubtleCrypto`) for hashing, and plain JS for the rest.
That means the "no permanent storage" promise isn't a policy you have to trust — there's no
upload endpoint for a file to ever reach. It's also literally free to host: this is a static
site.

Phase 2+ (OCR, video/audio conversion, LaTeX, AI tools) will need real server-side processing —
see [Roadmap](#roadmap) below.

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

## Project structure

```
src/
  components/     # shared UI: DropZone, ToolLayout, Button, SearchBar, ...
  pages/          # HomePage, CategoryPage
  tools/          # one file per tool, grouped by category
    pdf/
    images/
    developer/
    text/
    utilities/
    analyzer/
  processors/     # the actual file-processing logic (pdf.ts, image.ts, hash.ts, csv.ts)
  lib/            # registry (tool metadata), search, small utilities
  types/          # ToolMeta, CategoryMeta
```

Every tool is registered once in `src/lib/registry.ts` (name, description, category, path,
search keywords) and lazy-loaded in `src/App.tsx` — the homepage never downloads pdf-lib,
pdfjs-dist, or any other tool's dependencies until that specific tool is opened.

## Roadmap

**Phase 2** (needs real server-side processing, still free-tier friendly): OCR, video/audio
conversion (FFmpeg), archive tools, LaTeX workspace, protect/unlock PDF, background removal.

**Phase 3**: AI document tools, universal converter, workflow builder, natural-language search.

Not-yet-built tools are shown in each category page as "coming later" — never as a fake button
that doesn't work.
