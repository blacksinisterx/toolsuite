import type { CategoryMeta, ToolCategory, ToolMeta } from '../types/tool'

export const CATEGORIES: CategoryMeta[] = [
  { id: 'pdf', label: 'PDF', description: 'Merge, split, convert and edit PDF files' },
  { id: 'images', label: 'Images', description: 'Convert, resize, crop and compress images' },
  { id: 'developer', label: 'Developer', description: 'JSON, encoding, hashing and text utilities for devs' },
  { id: 'text', label: 'Text', description: 'Word counting, diffing and markdown editing' },
  { id: 'utilities', label: 'Utilities', description: 'QR codes, colors, passwords and quick calculators' },
  { id: 'analyzer', label: 'File Analyzer', description: 'Inspect any file before you use it' },
  { id: 'ocr', label: 'OCR', description: 'Pull real text out of images and scanned PDFs' },
  { id: 'archives', label: 'Archives', description: 'Create and extract ZIP files' },
  { id: 'data', label: 'Data', description: 'View, clean and convert CSV and JSON' },
  { id: 'web', label: 'Web', description: 'URL, sitemap and meta-tag tools for site owners' },
  { id: 'video', label: 'Video', description: 'Convert, compress, trim and export video' },
  { id: 'audio', label: 'Audio', description: 'Convert, trim and adjust audio' },
  { id: 'latex', label: 'LaTeX', description: 'Write and compile real LaTeX documents' },
  { id: 'privacy', label: 'Privacy', description: 'Scan text and files for sensitive data before you share them' },
]

// Every tool here is fully working and 100% client-side (Phase 1 scope).
// Nothing in this list is a placeholder -- per the product principle, a
// tool that isn't real yet doesn't get a fake page here, it goes in
// COMING_SOON below instead.
export const TOOLS: ToolMeta[] = [
  // PDF
  { id: 'merge-pdf', name: 'Merge PDF', description: 'Combine multiple PDFs into one file, in any order.', category: 'pdf', path: '/pdf/merge', keywords: ['merge', 'combine', 'join', 'pdf'], processing: 'client' },
  { id: 'split-pdf', name: 'Split PDF', description: 'Split a PDF into separate files at a page range you choose.', category: 'pdf', path: '/pdf/split', keywords: ['split', 'separate', 'pdf'], processing: 'client' },
  { id: 'extract-pages', name: 'Extract Pages', description: 'Pull specific pages out of a PDF into a new file.', category: 'pdf', path: '/pdf/extract-pages', keywords: ['extract', 'pages', 'pdf'], processing: 'client' },
  { id: 'delete-pages', name: 'Delete Pages', description: 'Remove pages from a PDF.', category: 'pdf', path: '/pdf/delete-pages', keywords: ['delete', 'remove', 'pages', 'pdf'], processing: 'client' },
  { id: 'rotate-pages', name: 'Rotate PDF', description: 'Rotate one, some, or all pages in a PDF.', category: 'pdf', path: '/pdf/rotate', keywords: ['rotate', 'pdf', 'turn'], processing: 'client' },
  { id: 'reorder-pages', name: 'Reorder Pages', description: 'Drag and drop to change page order in a PDF.', category: 'pdf', path: '/pdf/reorder', keywords: ['reorder', 'rearrange', 'pages', 'pdf'], processing: 'client' },
  { id: 'jpg-to-pdf', name: 'JPG/PNG to PDF', description: 'Turn one or more images into a PDF.', category: 'pdf', path: '/pdf/jpg-to-pdf', keywords: ['jpg', 'png', 'image', 'to', 'pdf', 'convert'], processing: 'client' },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Export every page of a PDF as a JPG image.', category: 'pdf', path: '/pdf/pdf-to-jpg', keywords: ['pdf', 'to', 'jpg', 'image', 'convert'], processing: 'client' },
  { id: 'compress-pdf', name: 'Compress PDF', description: 'Shrink a PDF by re-encoding its embedded images.', category: 'pdf', path: '/pdf/compress', keywords: ['compress', 'shrink', 'reduce', 'pdf'], processing: 'client' },
  { id: 'watermark-pdf', name: 'Add Watermark', description: 'Stamp text across every page of a PDF.', category: 'pdf', path: '/pdf/watermark', keywords: ['watermark', 'stamp', 'pdf'], processing: 'client' },
  { id: 'pdf-add-text', name: 'Add Text to PDF', description: 'Click anywhere on a page to place custom text.', category: 'pdf', path: '/pdf/add-text', keywords: ['add', 'text', 'edit', 'pdf'], processing: 'client' },
  { id: 'pdf-page-numbers', name: 'Page Numbers', description: 'Add page numbers in any position and format.', category: 'pdf', path: '/pdf/page-numbers', keywords: ['page', 'numbers', 'pdf'], processing: 'client' },
  { id: 'pdf-to-text', name: 'PDF to Text', description: "Extract a PDF's real embedded text layer -- fast and exact, for PDFs that aren't scans.", category: 'pdf', path: '/pdf/to-text', keywords: ['pdf', 'text', 'extract', 'convert'], processing: 'client' },
  { id: 'pdf-metadata-remover', name: 'Remove PDF Metadata', description: 'Strip title, author, subject and other metadata fields from a PDF.', category: 'pdf', path: '/pdf/remove-metadata', keywords: ['pdf', 'metadata', 'remove', 'privacy', 'strip', 'author'], processing: 'client' },

  // Images
  { id: 'image-convert', name: 'Image Converter', description: 'Convert between JPG, PNG and WebP.', category: 'images', path: '/image/convert', keywords: ['convert', 'jpg', 'png', 'webp', 'image', 'format'], processing: 'client' },
  { id: 'image-resize', name: 'Resize Image', description: 'Resize an image by exact pixels or percentage.', category: 'images', path: '/image/resize', keywords: ['resize', 'scale', 'image', 'dimensions'], processing: 'client' },
  { id: 'image-crop', name: 'Crop Image', description: 'Crop an image to the area you select.', category: 'images', path: '/image/crop', keywords: ['crop', 'image', 'cut'], processing: 'client' },
  { id: 'image-compress', name: 'Compress Image', description: 'Reduce image file size with an adjustable quality slider.', category: 'images', path: '/image/compress', keywords: ['compress', 'reduce', 'image', 'quality'], processing: 'client' },
  { id: 'image-rotate', name: 'Rotate Image', description: 'Rotate or flip an image.', category: 'images', path: '/image/rotate', keywords: ['rotate', 'flip', 'image', 'turn'], processing: 'client' },
  { id: 'image-metadata', name: 'Remove Image Metadata', description: 'Strip EXIF, GPS and camera data from a photo.', category: 'images', path: '/image/remove-metadata', keywords: ['exif', 'metadata', 'gps', 'privacy', 'remove', 'image'], processing: 'client' },

  // Developer
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate and minify JSON.', category: 'developer', path: '/developer/json-formatter', keywords: ['json', 'format', 'validate', 'beautify', 'minify'], processing: 'client' },
  { id: 'json-csv', name: 'JSON ⇄ CSV', description: 'Convert JSON arrays to CSV and back.', category: 'developer', path: '/developer/json-csv', keywords: ['json', 'csv', 'convert'], processing: 'client' },
  { id: 'base64', name: 'Base64 Encode/Decode', description: 'Encode or decode Base64 text and files.', category: 'developer', path: '/developer/base64', keywords: ['base64', 'encode', 'decode'], processing: 'client' },
  { id: 'url-encode', name: 'URL Encode/Decode', description: 'Encode or decode a URL or query string.', category: 'developer', path: '/developer/url-encode', keywords: ['url', 'encode', 'decode', 'uri'], processing: 'client' },
  { id: 'hash-generator', name: 'Hash Generator', description: 'Generate MD5-style, SHA-1, SHA-256 and SHA-512 hashes.', category: 'developer', path: '/developer/hash-generator', keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'checksum'], processing: 'client' },
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode a JWT header and payload (no verification).', category: 'developer', path: '/developer/jwt-decoder', keywords: ['jwt', 'token', 'decode', 'auth'], processing: 'client' },
  { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate random UUID v4 identifiers.', category: 'developer', path: '/developer/uuid-generator', keywords: ['uuid', 'guid', 'generator', 'id'], processing: 'client' },
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test a regular expression against sample text, live.', category: 'developer', path: '/developer/regex-tester', keywords: ['regex', 'regexp', 'test', 'pattern'], processing: 'client' },
  { id: 'json-yaml', name: 'JSON ⇄ YAML', description: 'Convert between JSON and YAML.', category: 'developer', path: '/developer/json-yaml', keywords: ['json', 'yaml', 'yml', 'convert'], processing: 'client' },
  { id: 'json-xml', name: 'JSON ⇄ XML', description: 'Convert between JSON and XML.', category: 'developer', path: '/developer/json-xml', keywords: ['json', 'xml', 'convert'], processing: 'client' },
  { id: 'sql-formatter', name: 'SQL Formatter', description: 'Format and indent SQL for MySQL, PostgreSQL, SQLite and more.', category: 'developer', path: '/developer/sql-formatter', keywords: ['sql', 'format', 'beautify', 'query'], processing: 'client' },
  { id: 'html-formatter', name: 'HTML/CSS/JS Formatter', description: 'Beautify and indent HTML, CSS or JavaScript.', category: 'developer', path: '/developer/html-formatter', keywords: ['html', 'css', 'javascript', 'format', 'beautify', 'pretty print'], processing: 'client' },

  // Text
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, sentences and reading time.', category: 'text', path: '/text/word-counter', keywords: ['word', 'count', 'character', 'counter'], processing: 'client' },
  { id: 'case-converter', name: 'Case Converter', description: 'Convert text between upper, lower, title and sentence case.', category: 'text', path: '/text/case-converter', keywords: ['case', 'uppercase', 'lowercase', 'title case', 'convert'], processing: 'client' },
  { id: 'text-diff', name: 'Text Diff', description: 'Compare two blocks of text and see what changed.', category: 'text', path: '/text/diff', keywords: ['diff', 'compare', 'text', 'difference'], processing: 'client' },
  { id: 'markdown-editor', name: 'Markdown Editor', description: 'Write Markdown with a live rendered preview.', category: 'text', path: '/text/markdown-editor', keywords: ['markdown', 'editor', 'preview', 'md'], processing: 'client' },
  { id: 'text-cleaner', name: 'Text Cleaner', description: 'Remove duplicate lines, trim whitespace, and drop empty lines.', category: 'text', path: '/text/cleaner', keywords: ['remove', 'duplicate', 'lines', 'whitespace', 'trim', 'clean'], processing: 'client' },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text by paragraphs, sentences or words.', category: 'text', path: '/text/lorem-ipsum', keywords: ['lorem', 'ipsum', 'placeholder', 'dummy text', 'generator'], processing: 'client' },

  // Utilities
  { id: 'qr-generator', name: 'QR Generator', description: 'Create a QR code for a link, text or Wi-Fi network.', category: 'utilities', path: '/utilities/qr-generator', keywords: ['qr', 'code', 'generator', 'barcode'], processing: 'client' },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert colors between HEX, RGB and HSL, with a picker.', category: 'utilities', path: '/utilities/color-converter', keywords: ['color', 'hex', 'rgb', 'hsl', 'converter', 'picker'], processing: 'client' },
  { id: 'password-generator', name: 'Password Generator', description: 'Generate a strong random password.', category: 'utilities', path: '/utilities/password-generator', keywords: ['password', 'generator', 'random', 'secure'], processing: 'client' },
  { id: 'calculator', name: 'Calculator', description: 'A scientific calculator for quick math.', category: 'utilities', path: '/utilities/calculator', keywords: ['calculator', 'math', 'scientific'], processing: 'client' },
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert length, weight, temperature, area, volume, speed, time and data size.', category: 'utilities', path: '/utilities/unit-converter', keywords: ['unit', 'converter', 'length', 'weight', 'temperature', 'metric', 'imperial', 'school', 'math'], processing: 'client' },
  { id: 'percentage-calculator', name: 'Percentage Calculator', description: 'Find a percentage of a number, what percent one number is of another, or percent change.', category: 'utilities', path: '/utilities/percentage-calculator', keywords: ['percentage', 'percent', 'calculator', 'math', 'school'], processing: 'client' },
  { id: 'base-converter', name: 'Number Base Converter', description: 'Convert a number between binary, octal, decimal and hexadecimal.', category: 'utilities', path: '/utilities/base-converter', keywords: ['base', 'binary', 'octal', 'decimal', 'hex', 'hexadecimal', 'converter', 'math'], processing: 'client' },
  { id: 'date-calculator', name: 'Date & Time Calculator', description: 'Find the days between two dates, or add/subtract time from a date.', category: 'utilities', path: '/utilities/date-calculator', keywords: ['date', 'time', 'calculator', 'days between', 'add', 'subtract'], processing: 'client' },
  { id: 'random-number-generator', name: 'Random Number Generator', description: 'Generate one or many random numbers in a range, with an optional no-duplicates mode.', category: 'utilities', path: '/utilities/random-number-generator', keywords: ['random', 'number', 'generator', 'rng'], processing: 'client' },
  { id: 'qr-scanner', name: 'QR Scanner', description: 'Decode a QR code from an uploaded photo or screenshot.', category: 'utilities', path: '/utilities/qr-scanner', keywords: ['qr', 'scanner', 'decode', 'read', 'barcode'], processing: 'client' },
  { id: 'favicon-generator', name: 'Favicon Generator', description: 'Generate a full set of favicon PNG sizes from one image.', category: 'utilities', path: '/utilities/favicon-generator', keywords: ['favicon', 'generator', 'icon', 'ico'], processing: 'client' },
  { id: 'color-palette-generator', name: 'Color Palette Generator', description: 'Generate complementary, analogous, triadic and monochromatic palettes from a base color.', category: 'utilities', path: '/utilities/color-palette-generator', keywords: ['color', 'palette', 'generator', 'scheme', 'complementary', 'analogous'], processing: 'client' },
  { id: 'gradient-generator', name: 'Gradient Generator', description: 'Build a linear or radial CSS gradient with a live preview.', category: 'utilities', path: '/utilities/gradient-generator', keywords: ['gradient', 'css', 'generator', 'linear', 'radial'], processing: 'client' },

  // Analyzer
  { id: 'file-analyzer', name: 'File Analyzer', description: 'Drop any file to see its type, size and hash.', category: 'analyzer', path: '/analyzer', keywords: ['file', 'analyze', 'inspect', 'hash', 'metadata', 'info'], processing: 'client' },

  // OCR
  { id: 'image-to-text', name: 'Image to Text (OCR)', description: 'Pull text out of a photo, screenshot or scan.', category: 'ocr', path: '/ocr/image-to-text', keywords: ['ocr', 'image', 'text', 'extract', 'scan'], processing: 'client' },
  { id: 'pdf-to-text-ocr', name: 'PDF to Text (OCR)', description: 'Extract text from a scanned or image-based PDF.', category: 'ocr', path: '/ocr/pdf-to-text', keywords: ['ocr', 'pdf', 'text', 'extract', 'scan'], processing: 'client' },

  // Archives
  { id: 'create-zip', name: 'Create ZIP', description: 'Bundle multiple files into one ZIP archive.', category: 'archives', path: '/archives/create-zip', keywords: ['zip', 'archive', 'compress', 'create'], processing: 'client' },
  { id: 'extract-zip', name: 'Extract ZIP', description: 'Unpack a ZIP archive and download the files inside.', category: 'archives', path: '/archives/extract-zip', keywords: ['zip', 'archive', 'extract', 'unzip'], processing: 'client' },

  // Data
  { id: 'csv-viewer', name: 'CSV Viewer', description: 'View, sort and filter a CSV file as a table.', category: 'data', path: '/data/csv-viewer', keywords: ['csv', 'viewer', 'table', 'sort', 'filter'], processing: 'client' },
  { id: 'csv-cleaner', name: 'CSV Cleaner', description: 'Remove duplicate rows, trim whitespace, drop empty rows.', category: 'data', path: '/data/csv-cleaner', keywords: ['csv', 'clean', 'duplicate', 'trim'], processing: 'client' },
  { id: 'csv-excel', name: 'CSV ⇄ Excel', description: 'Convert between CSV and Excel (.xlsx).', category: 'data', path: '/data/csv-excel', keywords: ['csv', 'excel', 'xlsx', 'convert', 'spreadsheet'], processing: 'client' },
  { id: 'json-tree-viewer', name: 'JSON Tree Viewer', description: 'Browse JSON as a collapsible tree.', category: 'data', path: '/data/json-tree-viewer', keywords: ['json', 'tree', 'viewer', 'explorer'], processing: 'client' },

  // Web
  { id: 'url-parser', name: 'URL Parser', description: 'Break a URL down into its parts and query params.', category: 'web', path: '/web/url-parser', keywords: ['url', 'parser', 'query', 'params'], processing: 'client' },
  { id: 'utm-builder', name: 'UTM Builder', description: 'Build or strip UTM tracking parameters on a link.', category: 'web', path: '/web/utm-builder', keywords: ['utm', 'builder', 'campaign', 'tracking', 'cleaner'], processing: 'client' },
  { id: 'og-generator', name: 'Open Graph Generator', description: 'Generate Open Graph and Twitter Card meta tags.', category: 'web', path: '/web/og-generator', keywords: ['open graph', 'og', 'meta', 'twitter card'], processing: 'client' },
  { id: 'robots-generator', name: 'Robots.txt Generator', description: 'Build a robots.txt with rules per user-agent.', category: 'web', path: '/web/robots-generator', keywords: ['robots.txt', 'crawler', 'generator'], processing: 'client' },
  { id: 'sitemap-generator', name: 'Sitemap Generator', description: 'Turn a list of URLs into a sitemap.xml.', category: 'web', path: '/web/sitemap-generator', keywords: ['sitemap', 'xml', 'seo', 'generator'], processing: 'client' },

  // Video
  { id: 'video-convert', name: 'Video Converter', description: 'Convert between MP4, WebM, MOV, AVI and MKV.', category: 'video', path: '/video/convert', keywords: ['video', 'convert', 'mp4', 'webm', 'mov', 'avi', 'mkv'], processing: 'client' },
  { id: 'video-compress', name: 'Video Compressor', description: 'Shrink a video file with an adjustable quality slider.', category: 'video', path: '/video/compress', keywords: ['video', 'compress', 'shrink', 'reduce'], processing: 'client' },
  { id: 'video-trim', name: 'Video Trimmer', description: 'Cut a video down to a start and end time.', category: 'video', path: '/video/trim', keywords: ['video', 'trim', 'cut', 'clip'], processing: 'client' },
  { id: 'video-to-gif', name: 'Video to GIF', description: 'Turn a video clip into an animated GIF.', category: 'video', path: '/video/to-gif', keywords: ['video', 'gif', 'convert', 'animated'], processing: 'client' },
  { id: 'video-extract-audio', name: 'Extract Audio', description: 'Pull the audio track out of a video.', category: 'video', path: '/video/extract-audio', keywords: ['video', 'audio', 'extract', 'mp3'], processing: 'client' },
  { id: 'video-resize', name: 'Change Video Resolution', description: 'Resize a video to a new resolution.', category: 'video', path: '/video/resize', keywords: ['video', 'resize', 'resolution', '1080p', '720p'], processing: 'client' },

  // Audio
  { id: 'audio-convert', name: 'Audio Converter', description: 'Convert between MP3, WAV, M4A, OGG and FLAC.', category: 'audio', path: '/audio/convert', keywords: ['audio', 'convert', 'mp3', 'wav', 'm4a', 'ogg', 'flac'], processing: 'client' },
  { id: 'audio-trim', name: 'Audio Trimmer', description: 'Cut an audio file down to a start and end time.', category: 'audio', path: '/audio/trim', keywords: ['audio', 'trim', 'cut', 'clip'], processing: 'client' },
  { id: 'audio-compress', name: 'Audio Compressor', description: 'Reduce audio file size by changing the bitrate.', category: 'audio', path: '/audio/compress', keywords: ['audio', 'compress', 'bitrate', 'reduce'], processing: 'client' },
  { id: 'audio-volume', name: 'Volume / Normalize', description: 'Adjust volume or auto-normalize loudness.', category: 'audio', path: '/audio/volume', keywords: ['audio', 'volume', 'normalize', 'loudness'], processing: 'client' },

  // LaTeX -- the one genuinely server-processed tool in this app (see
  // api/compile-latex.ts): there's no maintained WASM LaTeX compiler to run
  // this client-side, so real compilation happens in an ephemeral
  // serverless function. Only the .tex source is ever sent, and nothing is
  // retained after the response.
  { id: 'latex-workspace', name: 'LaTeX Workspace', description: 'Write LaTeX with real compilation and a live PDF preview.', category: 'latex', path: '/latex/workspace', keywords: ['latex', 'tex', 'compile', 'pdf', 'editor'], processing: 'server' },

  // Privacy
  { id: 'sensitive-data-scanner', name: 'Sensitive Data Scanner', description: 'Scan text for emails, phone numbers, card numbers, keys and other PII before you share it.', category: 'privacy', path: '/privacy/sensitive-data-scanner', keywords: ['pii', 'privacy', 'scan', 'sensitive', 'redact', 'email', 'credit card', 'ssn'], processing: 'client' },
]

// Named in the spec but deliberately not built yet -- surfaced honestly in
// search/category pages as "coming later" rather than as a broken or fake
// link. These specifically need either a real backend (screenshotting an
// arbitrary URL, HTTP header/status checks that hit CORS from the browser)
// or a much heavier client integration that deserves its own careful pass
// (a real WASM LaTeX engine).
export const COMING_SOON: { name: string; category: ToolCategory }[] = [
  { name: 'Protect / Unlock PDF', category: 'pdf' },
  { name: 'Background Removal', category: 'images' },
  { name: 'AI Document Tools', category: 'developer' },
  { name: 'Webpage Screenshot / HTML to PDF', category: 'web' },
  { name: 'HTTP Status & Header Checker', category: 'web' },
]

export function toolsByCategory(category: string): ToolMeta[] {
  return TOOLS.filter((t) => t.category === category)
}

export function popularTools(): ToolMeta[] {
  const ids = ['merge-pdf', 'compress-pdf', 'jpg-to-pdf', 'image-convert', 'image-compress', 'json-formatter', 'word-counter', 'qr-generator', 'password-generator', 'file-analyzer']
  return ids.map((id) => TOOLS.find((t) => t.id === id)!).filter(Boolean)
}
