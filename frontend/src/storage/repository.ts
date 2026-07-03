import { parseCsv, serializeCsv, rowsToRecords } from './csv'

// =============================================================================
// Repositorio generico con semilla CSV y persistencia en localStorage.
//
// Los .csv de public/data/ son el contrato de esquema: columnas planas que
// mapean 1:1 a las tablas de la futura base de datos (ver docs/STORAGE.md).
// TODO(backend .NET 10): sustituir CsvRepository por un ApiRepository que
// implemente esta misma interfaz Repository<T> llamando a api<T>() de
// src/config/api.ts; la capa de servicios no cambia.
// =============================================================================

export interface EntityCodec<T> {
  headers: string[]
  fromRow(row: Record<string, string>): T
  toRow(item: T): Record<string, string>
}

export interface Repository<T extends { id: string }> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | undefined>
  create(item: T): Promise<T>
  update(item: T): Promise<T>
  replaceAll(items: T[]): Promise<void>
}

export class CsvRepository<T extends { id: string }> implements Repository<T> {
  private cache: T[] | null = null
  private readonly entity: string
  private readonly seedUrl: string
  private readonly codec: EntityCodec<T>

  constructor(entity: string, seedUrl: string, codec: EntityCodec<T>) {
    this.entity = entity
    this.seedUrl = seedUrl
    this.codec = codec
  }

  get storageKey(): string {
    return `csvdb:${this.entity}:v1`
  }

  private async load(): Promise<T[]> {
    if (this.cache) return this.cache
    const stored = localStorage.getItem(this.storageKey)
    if (stored) {
      this.cache = JSON.parse(stored) as T[]
      return this.cache
    }
    const res = await fetch(this.seedUrl)
    if (!res.ok) throw new Error(`No se pudo cargar la semilla ${this.seedUrl} (${res.status})`)
    const records = rowsToRecords(parseCsv(await res.text()))
    this.cache = records.map((r) => this.codec.fromRow(r))
    this.persist()
    return this.cache
  }

  private persist(): void {
    if (this.cache) localStorage.setItem(this.storageKey, JSON.stringify(this.cache))
  }

  async getAll(): Promise<T[]> {
    return [...(await this.load())]
  }

  async getById(id: string): Promise<T | undefined> {
    return (await this.load()).find((item) => item.id === id)
  }

  async create(item: T): Promise<T> {
    const items = await this.load()
    items.unshift(item)
    this.persist()
    return item
  }

  async update(item: T): Promise<T> {
    const items = await this.load()
    const idx = items.findIndex((existing) => existing.id === item.id)
    if (idx === -1) throw new Error(`${this.entity}: no existe el id ${item.id}`)
    items[idx] = item
    this.persist()
    return item
  }

  async replaceAll(items: T[]): Promise<void> {
    this.cache = [...items]
    this.persist()
  }

  /** Serializa el estado vivo con el esquema CSV (la "tabla" exportable). */
  async exportCsv(): Promise<string> {
    const items = await this.load()
    const rows = items.map((item) => {
      const record = this.codec.toRow(item)
      return this.codec.headers.map((h) => record[h] ?? '')
    })
    return serializeCsv(this.codec.headers, rows)
  }

  /** Descarga el CSV del estado actual (demo: "descargar la base de datos"). */
  async downloadCsv(filename: string): Promise<void> {
    const csv = await this.exportCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  /** Olvida el estado local; el proximo acceso vuelve a sembrar del CSV. */
  reset(): void {
    this.cache = null
    localStorage.removeItem(this.storageKey)
  }
}
