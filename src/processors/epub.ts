import JSZip from 'jszip'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { extractPdfText } from './pdfRender'

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** A real, spec-valid EPUB3 file from already-built body HTML -- the
 * mimetype entry MUST be the first file in the zip and stored
 * uncompressed, which is why this doesn't just reuse createZip(). */
async function buildEpub(bodyHtml: string, title: string, author: string): Promise<Blob> {
  const uid = `urn:uuid:${crypto.randomUUID()}`
  const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z')

  const contentXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="utf-8"/><title>${escapeXml(title)}</title></head>
<body>
${bodyHtml}
</body>
</html>`

  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><meta charset="utf-8"/><title>Contents</title></head>
<body>
  <nav epub:type="toc"><ol><li><a href="content.xhtml">${escapeXml(title)}</a></li></ol></nav>
</body>
</html>`

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${uid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>${escapeXml(author || 'Unknown')}</dc:creator>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="content"/>
  </spine>
</package>`

  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`

  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
  zip.folder('META-INF')!.file('container.xml', containerXml)
  const oebps = zip.folder('OEBPS')!
  oebps.file('content.opf', contentOpf)
  oebps.file('nav.xhtml', navXhtml)
  oebps.file('content.xhtml', contentXhtml)

  return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' })
}

export async function markdownToEpub(source: string, title: string, author: string): Promise<Blob> {
  const html = DOMPurify.sanitize(marked.parse(source, { async: false }) as string)
  return buildEpub(html, title, author)
}

/** For PDF-extracted text, which isn't markdown -- wraps each blank-line-
 * separated block as its own paragraph instead of running it through a
 * markdown parser (a PDF full of stray # or * characters shouldn't turn
 * into headings/lists it never had). */
export async function textToEpub(text: string, title: string, author: string): Promise<Blob> {
  const html = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeXml(block).replace(/\n/g, '<br/>')}</p>`)
    .join('\n')
  return buildEpub(html || '<p></p>', title, author)
}

/** Text-only PDF -> EPUB: pulls the real embedded text layer (same
 * extractor the PDF to Text tool uses) and wraps it as a single-chapter
 * EPUB. Doesn't preserve original layout/images -- a genuinely faithful
 * conversion would need real page layout reconstruction, which is a much
 * bigger, separate tool. */
export async function pdfToEpub(file: File, title: string, author: string): Promise<Blob> {
  const text = await extractPdfText(file)
  if (!text.trim()) throw new Error("This PDF has no embedded text layer -- it's likely a scan, so there's no text to carry over.")
  return textToEpub(text, title, author)
}

interface ParsedEpub {
  title: string
  author: string
  chapters: string[] // plain text per spine item, in reading order
}

/** Reads an EPUB's real spine order from content.opf (not just "every
 * .xhtml file alphabetically" -- reading order and file naming aren't
 * the same thing) and strips each chapter's HTML down to plain text. */
export async function parseEpub(file: File): Promise<ParsedEpub> {
  const zip = await JSZip.loadAsync(file)
  const containerXml = await zip.file('META-INF/container.xml')?.async('string')
  if (!containerXml) throw new Error("Doesn't look like a valid EPUB (missing META-INF/container.xml).")
  const opfPath = containerXml.match(/full-path="([^"]+)"/)?.[1]
  if (!opfPath) throw new Error('Could not find the EPUB package file.')
  const opfDir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : ''

  const opfXml = await zip.file(opfPath)?.async('string')
  if (!opfXml) throw new Error('Could not read the EPUB package file.')

  const title = opfXml.match(/<dc:title[^>]*>([^<]*)<\/dc:title>/)?.[1] ?? file.name.replace(/\.epub$/i, '')
  const author = opfXml.match(/<dc:creator[^>]*>([^<]*)<\/dc:creator>/)?.[1] ?? ''

  const idToHref = new Map<string, string>()
  for (const m of opfXml.matchAll(/<item\s+[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*>/g)) idToHref.set(m[1], m[2])
  for (const m of opfXml.matchAll(/<item\s+[^>]*href="([^"]+)"[^>]*id="([^"]+)"[^>]*>/g)) if (!idToHref.has(m[2])) idToHref.set(m[2], m[1])

  const spineIds = [...opfXml.matchAll(/<itemref\s+[^>]*idref="([^"]+)"/g)].map((m) => m[1])

  const chapters: string[] = []
  for (const id of spineIds) {
    const href = idToHref.get(id)
    if (!href) continue
    const path = opfDir + href
    const xhtml = await zip.file(path)?.async('string')
    if (!xhtml) continue
    const bodyMatch = xhtml.match(/<body[^>]*>([\s\S]*)<\/body>/)
    const bodyHtml = bodyMatch ? bodyMatch[1] : xhtml
    const text = bodyHtml
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<(p|div|h[1-6]|br|li)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    if (text) chapters.push(text)
  }
  if (chapters.length === 0) throw new Error('Could not find any readable chapters in this EPUB.')
  return { title, author, chapters }
}
