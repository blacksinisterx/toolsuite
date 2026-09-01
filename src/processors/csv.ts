import Papa from 'papaparse'

export function jsonToCsv(json: unknown): string {
  const rows = Array.isArray(json) ? json : [json]
  return Papa.unparse(rows as object[])
}

export function csvToJson(csv: string): unknown[] {
  const result = Papa.parse(csv.trim(), { header: true, skipEmptyLines: true, dynamicTyping: true })
  if (result.errors.length) throw new Error(result.errors[0].message)
  return result.data
}

export interface CsvTable {
  headers: string[]
  rows: string[][]
}

/** Raw string grid (no type coercion) -- what a viewer/cleaner/sorter needs,
 * as opposed to csvToJson's typed-object rows (built for JSON conversion). */
export function parseCsvTable(csv: string): CsvTable {
  const result = Papa.parse<string[]>(csv.trim(), { skipEmptyLines: true })
  if (result.errors.length) throw new Error(result.errors[0].message)
  const [headers = [], ...rows] = result.data
  return { headers, rows }
}

export function tableToCsv({ headers, rows }: CsvTable): string {
  return Papa.unparse([headers, ...rows])
}
