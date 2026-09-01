import * as XLSX from 'xlsx'
import { csvToJson } from './csv'

export async function csvToXlsx(csvText: string): Promise<Blob> {
  const rows = csvToJson(csvText)
  const sheet = XLSX.utils.json_to_sheet(rows as object[])
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, 'Sheet1')
  const out = XLSX.write(book, { type: 'array', bookType: 'xlsx' })
  return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export async function xlsxToCsv(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const book = XLSX.read(buffer, { type: 'array' })
  const firstSheet = book.Sheets[book.SheetNames[0]]
  return XLSX.utils.sheet_to_csv(firstSheet)
}
