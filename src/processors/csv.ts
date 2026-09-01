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
