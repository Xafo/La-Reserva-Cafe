// Parser y serializador CSV (subset RFC 4180: comillas dobles, comas y
// saltos de linea embebidos). Sin dependencias; los datos del demo son
// pequenos y controlados.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }
    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }
    if (ch === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
      i++
      continue
    }
    field += ch
    i++
  }
  row.push(field)
  if (row.length > 1 || row[0] !== '') rows.push(row)
  return rows
}

function escapeField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function serializeCsv(headers: string[], rows: string[][]): string {
  const lines = [headers.map(escapeField).join(',')]
  for (const row of rows) lines.push(row.map(escapeField).join(','))
  return lines.join('\n') + '\n'
}

/** Convierte filas crudas (primera fila = headers) a registros clave/valor. */
export function rowsToRecords(rows: string[][]): Record<string, string>[] {
  const [headers, ...data] = rows
  return data.map((row) => {
    const record: Record<string, string> = {}
    headers.forEach((h, idx) => {
      record[h] = row[idx] ?? ''
    })
    return record
  })
}
