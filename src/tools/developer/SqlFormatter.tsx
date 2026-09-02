import { useState } from 'react'
import { format, type SqlLanguage } from 'sql-formatter'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { ErrorState } from '../../components/States'
import { textareaCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'sql-formatter')!

const DIALECTS: { value: SqlLanguage; label: string }[] = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'tsql', label: 'SQL Server (T-SQL)' },
]

export default function SqlFormatter() {
  const [dialect, setDialect] = useState<SqlLanguage>('sql')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function run() {
    try {
      setOutput(format(input, { language: dialect, keywordCase: 'upper' }))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not format this SQL.')
      setOutput('')
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div>
        <label className={labelCls} htmlFor="dialect">Dialect</label>
        <select id="dialect" value={dialect} onChange={(e) => setDialect(e.target.value as SqlLanguage)} className="w-56 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent">
          {DIALECTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls} htmlFor="in">SQL input</label>
        <textarea
          id="in"
          className={textareaCls}
          rows={10}
          spellCheck={false}
          placeholder="select id, name from users where active = 1 order by name;"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={run} disabled={!input.trim()}>Format</Button>
        <Button variant="ghost" onClick={() => { setInput(''); setOutput(''); setError(null) }}>Reset</Button>
      </div>

      {error && <ErrorState message={error} />}

      {output && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelCls + ' mb-0'} htmlFor="out">Result</label>
            <CopyButton text={output} />
          </div>
          <textarea id="out" readOnly className={textareaCls} rows={10} value={output} />
        </div>
      )}
    </ToolLayout>
  )
}
