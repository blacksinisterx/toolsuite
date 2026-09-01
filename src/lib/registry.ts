import type { CategoryMeta, ToolCategory, ToolMeta } from '../types/tool'

export const CATEGORIES: CategoryMeta[] = [
  { id: 'pdf', label: 'PDF', description: 'Merge, split, convert and edit PDF files' },
  { id: 'images', label: 'Images', description: 'Convert, resize, crop and compress images' },
  { id: 'developer', label: 'Developer', description: 'JSON, encoding, hashing and text utilities for devs' },
  { id: 'text', label: 'Text', description: 'Word counting, diffing and markdown editing' },
  { id: 'utilities', label: 'Utilities', description: 'QR codes, colors, passwords and quick calculators' },
  { id: 'analyzer', label: 'File Analyzer', description: 'Inspect any file before you use it' },
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

  // Text
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, sentences and reading time.', category: 'text', path: '/text/word-counter', keywords: ['word', 'count', 'character', 'counter'], processing: 'client' },
  { id: 'case-converter', name: 'Case Converter', description: 'Convert text between upper, lower, title and sentence case.', category: 'text', path: '/text/case-converter', keywords: ['case', 'uppercase', 'lowercase', 'title case', 'convert'], processing: 'client' },
  { id: 'text-diff', name: 'Text Diff', description: 'Compare two blocks of text and see what changed.', category: 'text', path: '/text/diff', keywords: ['diff', 'compare', 'text', 'difference'], processing: 'client' },
  { id: 'markdown-editor', name: 'Markdown Editor', description: 'Write Markdown with a live rendered preview.', category: 'text', path: '/text/markdown-editor', keywords: ['markdown', 'editor', 'preview', 'md'], processing: 'client' },

  // Utilities
  { id: 'qr-generator', name: 'QR Generator', description: 'Create a QR code for a link, text or Wi-Fi network.', category: 'utilities', path: '/utilities/qr-generator', keywords: ['qr', 'code', 'generator', 'barcode'], processing: 'client' },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert colors between HEX, RGB and HSL, with a picker.', category: 'utilities', path: '/utilities/color-converter', keywords: ['color', 'hex', 'rgb', 'hsl', 'converter', 'picker'], processing: 'client' },
  { id: 'password-generator', name: 'Password Generator', description: 'Generate a strong random password.', category: 'utilities', path: '/utilities/password-generator', keywords: ['password', 'generator', 'random', 'secure'], processing: 'client' },
  { id: 'calculator', name: 'Calculator', description: 'A scientific calculator for quick math.', category: 'utilities', path: '/utilities/calculator', keywords: ['calculator', 'math', 'scientific'], processing: 'client' },

  // Analyzer
  { id: 'file-analyzer', name: 'File Analyzer', description: 'Drop any file to see its type, size and hash.', category: 'analyzer', path: '/analyzer', keywords: ['file', 'analyze', 'inspect', 'hash', 'metadata', 'info'], processing: 'client' },
]

// Named in the spec but deliberately not built this phase -- surfaced
// honestly in search/category pages as "coming later" rather than as a
// broken or fake link.
export const COMING_SOON: { name: string; category: ToolCategory }[] = [
  { name: 'OCR (Image/PDF to Text)', category: 'pdf' },
  { name: 'Protect / Unlock PDF', category: 'pdf' },
  { name: 'Video Compressor', category: 'utilities' },
  { name: 'Audio Converter', category: 'utilities' },
  { name: 'LaTeX Workspace', category: 'developer' },
  { name: 'Background Removal', category: 'images' },
  { name: 'Archive (ZIP) Tools', category: 'utilities' },
  { name: 'AI Document Tools', category: 'developer' },
]

export function toolsByCategory(category: string): ToolMeta[] {
  return TOOLS.filter((t) => t.category === category)
}

export function popularTools(): ToolMeta[] {
  const ids = ['merge-pdf', 'compress-pdf', 'jpg-to-pdf', 'image-convert', 'image-compress', 'json-formatter', 'word-counter', 'qr-generator', 'password-generator', 'file-analyzer']
  return ids.map((id) => TOOLS.find((t) => t.id === id)!).filter(Boolean)
}
