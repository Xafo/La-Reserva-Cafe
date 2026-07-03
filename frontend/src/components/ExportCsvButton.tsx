import { Download } from 'lucide-react'
import type { CsvRepository } from '../storage/repository'

// Descarga el estado vivo de un repositorio como .csv — la "base de datos"
// del demo en un archivo abrible en Excel.

export function ExportCsvButton<T extends { id: string }>({
  repo,
  filename,
}: {
  repo: CsvRepository<T>
  filename: string
}) {
  return (
    <button
      onClick={() => repo.downloadCsv(filename)}
      title="Descargar CSV (placeholder de la base de datos)"
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition-colors duration-150 hover:bg-muted"
    >
      <Download className="h-4 w-4" /> CSV
    </button>
  )
}
