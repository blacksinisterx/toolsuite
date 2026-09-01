import type { CsvTable } from '../processors/csv'

export function CsvTableView({ table, maxRows = 200 }: { table: CsvTable; maxRows?: number }) {
  const visible = table.rows.slice(0, maxRows)
  return (
    <div className="overflow-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 bg-bg-sunken">
          <tr>
            {table.headers.map((h, i) => (
              <th key={i} className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-text-muted">
                {h || <span className="italic text-text-faint">(blank)</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row, i) => (
            <tr key={i} className="odd:bg-bg-elevated even:bg-bg">
              {row.map((cell, j) => (
                <td key={j} className="whitespace-nowrap border-b border-border px-3 py-1.5 text-text">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.rows.length > maxRows && (
        <p className="border-t border-border px-3 py-2 text-xs text-text-faint">
          Showing {maxRows} of {table.rows.length} rows.
        </p>
      )}
    </div>
  )
}
