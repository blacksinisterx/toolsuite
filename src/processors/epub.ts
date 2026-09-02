import JSZip from 'jszip'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** A real, spec-valid EPUB3 file from Markdown or plain text -- the
 * mimetype entry MUST be the first file in the zip and stored
 * uncompressed, which is why this doesn't just reuse createZip(). */
export async function markdownToEpub(source: string, title: string, author: string): Promise<Blob> {
  const html = DOMPurify.sanitize(marked.parse(source, { async: false }) as string)
  const uid = `urn:uuid:${crypto.randomUUID()}`
  const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z')

  const contentXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="utf-8"/><title>${escapeXml(title)}</title></head>
<body>
${html}
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
