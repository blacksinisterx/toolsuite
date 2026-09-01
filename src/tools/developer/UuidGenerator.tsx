import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { Button } from '../../components/Button'
import { CopyButton } from '../../components/CopyButton'
import { inputCls, labelCls } from '../../components/formStyles'
import { TOOLS } from '../../lib/registry'

const tool = TOOLS.find((t) => t.id === 'uuid-generator')!

export default function UuidGenerator() {
  const [count, setCount] = useState(5)
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, () => crypto.randomUUID()))

  function generate() {
    setUuids(Array.from({ length: count }, () => crypto.randomUUID()))
  }

  return (
    <ToolLayout tool={tool}>
      <div className="flex items-end gap-3">
        <div>
          <label className={labelCls} htmlFor="count">How many</label>
          <input
            id="count"
            type="number"
            min={1}
            max={100}
            className={`${inputCls} w-24`}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
          />
        </div>
        <Button onClick={generate}>Generate</Button>
        <CopyButton text={uuids.join('\n')} />
      </div>

      <div className="flex flex-col gap-1.5">
        {uuids.map((id) => (
          <code key={id} className="rounded-lg border border-border bg-bg-sunken px-3 py-2 font-mono text-sm text-text">
            {id}
          </code>
        ))}
      </div>
    </ToolLayout>
  )
}
