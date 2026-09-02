import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RootLayout } from './components/RootLayout'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import SuggestPage from './pages/SuggestPage'

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
const PdfToText = lazy(() => import('./tools/pdf/PdfToText'))
const PdfMetadataRemover = lazy(() => import('./tools/pdf/PdfMetadataRemover'))

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
const JsonYaml = lazy(() => import('./tools/developer/JsonYaml'))
const JsonXml = lazy(() => import('./tools/developer/JsonXml'))
const SqlFormatter = lazy(() => import('./tools/developer/SqlFormatter'))
const HtmlFormatter = lazy(() => import('./tools/developer/HtmlFormatter'))

const WordCounter = lazy(() => import('./tools/text/WordCounter'))
const CaseConverter = lazy(() => import('./tools/text/CaseConverter'))
const TextDiff = lazy(() => import('./tools/text/TextDiff'))
const MarkdownEditor = lazy(() => import('./tools/text/MarkdownEditor'))
const TextCleaner = lazy(() => import('./tools/text/TextCleaner'))
const LoremIpsum = lazy(() => import('./tools/text/LoremIpsum'))

const QrGenerator = lazy(() => import('./tools/utilities/QrGenerator'))
const ColorConverter = lazy(() => import('./tools/utilities/ColorConverter'))
const PasswordGenerator = lazy(() => import('./tools/utilities/PasswordGenerator'))
const Calculator = lazy(() => import('./tools/utilities/Calculator'))
const UnitConverter = lazy(() => import('./tools/utilities/UnitConverter'))
const PercentageCalculator = lazy(() => import('./tools/utilities/PercentageCalculator'))
const BaseConverter = lazy(() => import('./tools/utilities/BaseConverter'))
const DateCalculator = lazy(() => import('./tools/utilities/DateCalculator'))
const RandomNumberGenerator = lazy(() => import('./tools/utilities/RandomNumberGenerator'))
const TimezoneConverter = lazy(() => import('./tools/utilities/TimezoneConverter'))
const BakingConverter = lazy(() => import('./tools/utilities/BakingConverter'))
const SymbolPicker = lazy(() => import('./tools/utilities/SymbolPicker'))
const QrScanner = lazy(() => import('./tools/utilities/QrScanner'))
const FaviconGenerator = lazy(() => import('./tools/utilities/FaviconGenerator'))
const ColorPaletteGenerator = lazy(() => import('./tools/utilities/ColorPaletteGenerator'))
const GradientGenerator = lazy(() => import('./tools/utilities/GradientGenerator'))

const FileAnalyzer = lazy(() => import('./tools/analyzer/FileAnalyzer'))

const ImageToText = lazy(() => import('./tools/ocr/ImageToText'))
const PdfToTextOcr = lazy(() => import('./tools/ocr/PdfToTextOcr'))

const CreateZip = lazy(() => import('./tools/archives/CreateZip'))
const ExtractZip = lazy(() => import('./tools/archives/ExtractZip'))

const CsvViewer = lazy(() => import('./tools/data/CsvViewer'))
const CsvCleaner = lazy(() => import('./tools/data/CsvCleaner'))
const CsvExcel = lazy(() => import('./tools/data/CsvExcel'))
const JsonTreeViewer = lazy(() => import('./tools/data/JsonTreeViewer'))
const MarkdownToEpub = lazy(() => import('./tools/data/MarkdownToEpub'))

const VideoConvert = lazy(() => import('./tools/video/VideoConvert'))
const VideoCompress = lazy(() => import('./tools/video/VideoCompress'))
const VideoTrim = lazy(() => import('./tools/video/VideoTrim'))
const VideoToGif = lazy(() => import('./tools/video/VideoToGif'))
const VideoExtractAudio = lazy(() => import('./tools/video/VideoExtractAudio'))
const VideoResize = lazy(() => import('./tools/video/VideoResize'))

const AudioConvert = lazy(() => import('./tools/audio/AudioConvert'))
const AudioTrim = lazy(() => import('./tools/audio/AudioTrim'))
const AudioCompress = lazy(() => import('./tools/audio/AudioCompress'))
const AudioVolume = lazy(() => import('./tools/audio/AudioVolume'))

const LatexWorkspace = lazy(() => import('./tools/latex/LatexWorkspace'))
const SensitiveDataScanner = lazy(() => import('./tools/privacy/SensitiveDataScanner'))

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
            <Route path="/suggest" element={<SuggestPage />} />

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
            <Route path="/pdf/to-text" element={<PdfToText />} />
            <Route path="/pdf/remove-metadata" element={<PdfMetadataRemover />} />

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
            <Route path="/developer/json-yaml" element={<JsonYaml />} />
            <Route path="/developer/json-xml" element={<JsonXml />} />
            <Route path="/developer/sql-formatter" element={<SqlFormatter />} />
            <Route path="/developer/html-formatter" element={<HtmlFormatter />} />

            <Route path="/text/word-counter" element={<WordCounter />} />
            <Route path="/text/case-converter" element={<CaseConverter />} />
            <Route path="/text/diff" element={<TextDiff />} />
            <Route path="/text/markdown-editor" element={<MarkdownEditor />} />
            <Route path="/text/cleaner" element={<TextCleaner />} />
            <Route path="/text/lorem-ipsum" element={<LoremIpsum />} />

            <Route path="/utilities/qr-generator" element={<QrGenerator />} />
            <Route path="/utilities/color-converter" element={<ColorConverter />} />
            <Route path="/utilities/password-generator" element={<PasswordGenerator />} />
            <Route path="/utilities/calculator" element={<Calculator />} />
            <Route path="/utilities/unit-converter" element={<UnitConverter />} />
            <Route path="/utilities/percentage-calculator" element={<PercentageCalculator />} />
            <Route path="/utilities/base-converter" element={<BaseConverter />} />
            <Route path="/utilities/date-calculator" element={<DateCalculator />} />
            <Route path="/utilities/random-number-generator" element={<RandomNumberGenerator />} />
            <Route path="/utilities/timezone-converter" element={<TimezoneConverter />} />
            <Route path="/utilities/baking-converter" element={<BakingConverter />} />
            <Route path="/utilities/symbols" element={<SymbolPicker />} />
            <Route path="/utilities/qr-scanner" element={<QrScanner />} />
            <Route path="/utilities/favicon-generator" element={<FaviconGenerator />} />
            <Route path="/utilities/color-palette-generator" element={<ColorPaletteGenerator />} />
            <Route path="/utilities/gradient-generator" element={<GradientGenerator />} />

            <Route path="/analyzer" element={<FileAnalyzer />} />

            <Route path="/ocr/image-to-text" element={<ImageToText />} />
            <Route path="/ocr/pdf-to-text" element={<PdfToTextOcr />} />

            <Route path="/archives/create-zip" element={<CreateZip />} />
            <Route path="/archives/extract-zip" element={<ExtractZip />} />

            <Route path="/data/csv-viewer" element={<CsvViewer />} />
            <Route path="/data/csv-cleaner" element={<CsvCleaner />} />
            <Route path="/data/csv-excel" element={<CsvExcel />} />
            <Route path="/data/json-tree-viewer" element={<JsonTreeViewer />} />
            <Route path="/data/markdown-to-epub" element={<MarkdownToEpub />} />

            <Route path="/web/url-parser" element={<UrlParser />} />
            <Route path="/web/utm-builder" element={<UtmBuilder />} />
            <Route path="/web/og-generator" element={<OgGenerator />} />
            <Route path="/web/robots-generator" element={<RobotsGenerator />} />
            <Route path="/web/sitemap-generator" element={<SitemapGenerator />} />

            <Route path="/video/convert" element={<VideoConvert />} />
            <Route path="/video/compress" element={<VideoCompress />} />
            <Route path="/video/trim" element={<VideoTrim />} />
            <Route path="/video/to-gif" element={<VideoToGif />} />
            <Route path="/video/extract-audio" element={<VideoExtractAudio />} />
            <Route path="/video/resize" element={<VideoResize />} />

            <Route path="/audio/convert" element={<AudioConvert />} />
            <Route path="/audio/trim" element={<AudioTrim />} />
            <Route path="/audio/compress" element={<AudioCompress />} />
            <Route path="/audio/volume" element={<AudioVolume />} />

            <Route path="/latex/workspace" element={<LatexWorkspace />} />

            <Route path="/privacy/sensitive-data-scanner" element={<SensitiveDataScanner />} />

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
