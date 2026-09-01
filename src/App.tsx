import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RootLayout } from './components/RootLayout'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'

// Every tool is lazy-loaded -- the homepage never pulls in pdf-lib,
// pdfjs-dist, qrcode, marked etc. up front (Performance principle: don't
// load the entire toolbox on initial page load).
const MergePdf = lazy(() => import('./tools/pdf/MergePdf'))
const SplitPdf = lazy(() => import('./tools/pdf/SplitPdf'))
const ExtractPages = lazy(() => import('./tools/pdf/ExtractPages'))
const DeletePages = lazy(() => import('./tools/pdf/DeletePages'))
const RotatePages = lazy(() => import('./tools/pdf/RotatePages'))
const ReorderPages = lazy(() => import('./tools/pdf/ReorderPages'))
const JpgToPdf = lazy(() => import('./tools/pdf/JpgToPdf'))
const PdfToJpg = lazy(() => import('./tools/pdf/PdfToJpg'))
const CompressPdf = lazy(() => import('./tools/pdf/CompressPdf'))
const WatermarkPdf = lazy(() => import('./tools/pdf/WatermarkPdf'))
const AddTextToPdf = lazy(() => import('./tools/pdf/AddTextToPdf'))
const PageNumbers = lazy(() => import('./tools/pdf/PageNumbers'))

const ImageConvert = lazy(() => import('./tools/images/ImageConvert'))
const ImageResize = lazy(() => import('./tools/images/ImageResize'))
const ImageCrop = lazy(() => import('./tools/images/ImageCrop'))
const ImageCompress = lazy(() => import('./tools/images/ImageCompress'))
const ImageRotate = lazy(() => import('./tools/images/ImageRotate'))
const ImageMetadataRemover = lazy(() => import('./tools/images/ImageMetadataRemover'))

const JsonFormatter = lazy(() => import('./tools/developer/JsonFormatter'))
const JsonCsv = lazy(() => import('./tools/developer/JsonCsv'))
const Base64Tool = lazy(() => import('./tools/developer/Base64Tool'))
const UrlEncode = lazy(() => import('./tools/developer/UrlEncode'))
const HashGenerator = lazy(() => import('./tools/developer/HashGenerator'))
const JwtDecoder = lazy(() => import('./tools/developer/JwtDecoder'))
const UuidGenerator = lazy(() => import('./tools/developer/UuidGenerator'))
const RegexTester = lazy(() => import('./tools/developer/RegexTester'))

const WordCounter = lazy(() => import('./tools/text/WordCounter'))
const CaseConverter = lazy(() => import('./tools/text/CaseConverter'))
const TextDiff = lazy(() => import('./tools/text/TextDiff'))
const MarkdownEditor = lazy(() => import('./tools/text/MarkdownEditor'))

const QrGenerator = lazy(() => import('./tools/utilities/QrGenerator'))
const ColorConverter = lazy(() => import('./tools/utilities/ColorConverter'))
const PasswordGenerator = lazy(() => import('./tools/utilities/PasswordGenerator'))
const Calculator = lazy(() => import('./tools/utilities/Calculator'))

const FileAnalyzer = lazy(() => import('./tools/analyzer/FileAnalyzer'))

const ImageToText = lazy(() => import('./tools/ocr/ImageToText'))
const PdfToTextOcr = lazy(() => import('./tools/ocr/PdfToTextOcr'))

const CreateZip = lazy(() => import('./tools/archives/CreateZip'))
const ExtractZip = lazy(() => import('./tools/archives/ExtractZip'))

const CsvViewer = lazy(() => import('./tools/data/CsvViewer'))
const CsvCleaner = lazy(() => import('./tools/data/CsvCleaner'))
const CsvExcel = lazy(() => import('./tools/data/CsvExcel'))
const JsonTreeViewer = lazy(() => import('./tools/data/JsonTreeViewer'))

const UrlParser = lazy(() => import('./tools/web/UrlParser'))
const UtmBuilder = lazy(() => import('./tools/web/UtmBuilder'))
const OgGenerator = lazy(() => import('./tools/web/OgGenerator'))
const RobotsGenerator = lazy(() => import('./tools/web/RobotsGenerator'))
const SitemapGenerator = lazy(() => import('./tools/web/SitemapGenerator'))

function Loading() {
  return <div className="px-6 py-20 text-center text-sm text-text-faint">Loading tool…</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:category" element={<CategoryPage />} />

            <Route path="/pdf/merge" element={<MergePdf />} />
            <Route path="/pdf/split" element={<SplitPdf />} />
            <Route path="/pdf/extract-pages" element={<ExtractPages />} />
            <Route path="/pdf/delete-pages" element={<DeletePages />} />
            <Route path="/pdf/rotate" element={<RotatePages />} />
            <Route path="/pdf/reorder" element={<ReorderPages />} />
            <Route path="/pdf/jpg-to-pdf" element={<JpgToPdf />} />
            <Route path="/pdf/pdf-to-jpg" element={<PdfToJpg />} />
            <Route path="/pdf/compress" element={<CompressPdf />} />
            <Route path="/pdf/watermark" element={<WatermarkPdf />} />
            <Route path="/pdf/add-text" element={<AddTextToPdf />} />
            <Route path="/pdf/page-numbers" element={<PageNumbers />} />

            <Route path="/image/convert" element={<ImageConvert />} />
            <Route path="/image/resize" element={<ImageResize />} />
            <Route path="/image/crop" element={<ImageCrop />} />
            <Route path="/image/compress" element={<ImageCompress />} />
            <Route path="/image/rotate" element={<ImageRotate />} />
            <Route path="/image/remove-metadata" element={<ImageMetadataRemover />} />

            <Route path="/developer/json-formatter" element={<JsonFormatter />} />
            <Route path="/developer/json-csv" element={<JsonCsv />} />
            <Route path="/developer/base64" element={<Base64Tool />} />
            <Route path="/developer/url-encode" element={<UrlEncode />} />
            <Route path="/developer/hash-generator" element={<HashGenerator />} />
            <Route path="/developer/jwt-decoder" element={<JwtDecoder />} />
            <Route path="/developer/uuid-generator" element={<UuidGenerator />} />
            <Route path="/developer/regex-tester" element={<RegexTester />} />

            <Route path="/text/word-counter" element={<WordCounter />} />
            <Route path="/text/case-converter" element={<CaseConverter />} />
            <Route path="/text/diff" element={<TextDiff />} />
            <Route path="/text/markdown-editor" element={<MarkdownEditor />} />

            <Route path="/utilities/qr-generator" element={<QrGenerator />} />
            <Route path="/utilities/color-converter" element={<ColorConverter />} />
            <Route path="/utilities/password-generator" element={<PasswordGenerator />} />
            <Route path="/utilities/calculator" element={<Calculator />} />

            <Route path="/analyzer" element={<FileAnalyzer />} />

            <Route path="/ocr/image-to-text" element={<ImageToText />} />
            <Route path="/ocr/pdf-to-text" element={<PdfToTextOcr />} />

            <Route path="/archives/create-zip" element={<CreateZip />} />
            <Route path="/archives/extract-zip" element={<ExtractZip />} />

            <Route path="/data/csv-viewer" element={<CsvViewer />} />
            <Route path="/data/csv-cleaner" element={<CsvCleaner />} />
            <Route path="/data/csv-excel" element={<CsvExcel />} />
            <Route path="/data/json-tree-viewer" element={<JsonTreeViewer />} />

            <Route path="/web/url-parser" element={<UrlParser />} />
            <Route path="/web/utm-builder" element={<UtmBuilder />} />
            <Route path="/web/og-generator" element={<OgGenerator />} />
            <Route path="/web/robots-generator" element={<RobotsGenerator />} />
            <Route path="/web/sitemap-generator" element={<SitemapGenerator />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="px-6 py-20 text-center">
      <p className="text-lg font-semibold text-text">Page not found</p>
      <p className="mt-1 text-sm text-text-muted">That tool doesn't exist yet — try the search above.</p>
    </div>
  )
}
