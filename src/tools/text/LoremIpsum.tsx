import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { textareaCls, labelCls, inputCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'lorem-ipsum')!

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ')

function randWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

function sentence(minWords = 6, maxWords = 14): string {
  const n = minWords + Math.floor(Math.random() * (maxWords - minWords))
  const words = Array.from({ length: n }, randWord)
  words[0] = words[0][0].toUpperCase() + words[0].slice(1)
  return words.join(' ') + '.'
}

function paragraph(sentences = 5): string {
  return Array.from({ length: sentences }, () => sentence()).join(' ')
}

type Unit = 'paragraphs' | 'sentences' | 'words'

function generate(unit: Unit, count: number, startClassic: boolean): string {
  if (unit === 'words') {
    const words = Array.from({ length: count }, randWord)
    if (startClassic) words.splice(0, 5, 'Lorem', 'ipsum', 'dolor', 'sit', 'amet')
    else words[0] = words[0][0].toUpperCase() + words[0].slice(1)
    return words.join(' ')
  }
  if (unit === 'sentences') {
    const sentences = Array.from({ length: count }, () => sentence())
    if (startClassic) sentences[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    return sentences.join(' ')
  }
  const paragraphs = Array.from({ length: count }, () => paragraph())
  if (startClassic) paragraphs[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + paragraph(4)
  return paragraphs.join('\n\n')
}

export default function LoremIpsum() {
  const [unit, setUnit] = useState<Unit>('paragraphs')
  const [count, setCount] = useState(3)
  const [startClassic, setStartClassic] = useState(true)
  const [seed, setSeed] = useState(0)

  const output = useMemo(() => generate(unit, count, startClassic), [unit, count, startClassic, seed])

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="unit">Generate</label>
          <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent">
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="count">Count</label>
          <input id="count" type="number" min={1} max={50} className={inputCls} value={count} onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={startClassic} onChange={(e) => setStartClassic(e.target.checked)} className="accent-accent" />
            Start with "Lorem ipsum..."
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => setSeed((s) => s + 1)} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:border-accent">Regenerate</button>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className={labelCls + ' mb-0'} htmlFor="out">Result</label>
          <CopyButton text={output} />
        </div>
        <textarea id="out" readOnly className={textareaCls} rows={12} value={output} />
      </div>
    </ToolLayout>
  )
}
