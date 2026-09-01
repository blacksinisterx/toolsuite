import { useState } from 'react'
import { DropZone } from './DropZone'
import { textareaCls, labelCls } from './formStyles'

/** Paste-or-upload input shared by every CSV tool -- most people either
 * have a .csv file or a chunk of copied spreadsheet text, not always one
 * specific way. */
export function CsvInput({ onText }: { onText: (text: string, filename?: string) => void }) {
  const [pasted, setPasted] = useState('')

  return (
    <div className="flex flex-col gap-3">
      <DropZone
        accept=".csv,text/csv"
        hint="A .csv file"
        onFiles={async (files) => {
          const text = await files[0].text()
          setPasted(text)
          onText(text, files[0].name)
        }}
      />
      <p className="text-center text-xs text-text-faint">— or paste CSV text —</p>
      <div>
        <label className={labelCls} htmlFor="csv-paste">CSV text</label>
        <textarea
          id="csv-paste"
          className={textareaCls}
          rows={5}
          spellCheck={false}
          value={pasted}
          onChange={(e) => {
            setPasted(e.target.value)
            onText(e.target.value)
          }}
        />
      </div>
    </div>
  )
}
