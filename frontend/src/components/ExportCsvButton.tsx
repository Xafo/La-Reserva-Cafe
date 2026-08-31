import { Download } from 'lucide-react'

function csvValue(value: unknown): string {
  const text = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function ExportCsvButton<T extends object>({
  items,
  filename,
}: {
  items: T[]
  filename: string
}) {
  const download = () => {
    if (items.length === 0) return
    const headers = Object.keys(items[0]) as (keyof T)[]
    const csv = [
      headers.map((header) => csvValue(String(header))).join(','),
      ...items.map((item) => headers.map((header) => csvValue(item[header])).join(',')),
    ].join('\n')
    const url = URL.createObjectURL(new Blob([`${csv}\n`], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={download}
      disabled={items.length === 0}
      title="Descargar datos actuales en CSV"
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition-colors duration-150 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4" /> CSV
    </button>
  )
}
