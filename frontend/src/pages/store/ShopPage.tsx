import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Product, CoffeeProcess, RoastLevel } from '../../types'
import { catalogService } from '../../services'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { ProductCard } from '../../components/store/ProductCard'
import { cn } from '../../lib/utils'

const PROCESSES: CoffeeProcess[] = ['Lavado', 'Honey', 'Natural']
const ROASTS: RoastLevel[] = ['Claro', 'Medio', 'Oscuro']

function FilterGroup<T extends string>({ label, options, value, onChange }: {
  label: string
  options: T[]
  value: T | null
  onChange: (v: T | null) => void
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{label}</legend>
      <span className="mr-1 text-sm font-medium text-muted-foreground">{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? null : opt)}
          aria-pressed={value === opt}
          className={cn(
            'cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            value === opt
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-foreground hover:border-primary hover:text-primary'
          )}
        >
          {opt}
        </button>
      ))}
    </fieldset>
  )
}

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useSearchParams()

  const process = (params.get('proceso') as CoffeeProcess) || null
  const roast = (params.get('tueste') as RoastLevel) || null

  useEffect(() => {
    catalogService.getProducts(true).then((p) => {
      setProducts(p)
      setLoading(false)
    })
  }, [])

  const setFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const filtered = useMemo(
    () => products.filter((p) => (!process || p.process === process) && (!roast || p.roast === roast)),
    [products, process, roast]
  )

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <StoreNav />
      <section className="mx-auto max-w-7xl px-5 pb-28 pt-28 md:px-8 md:pt-36">
        <h1 className="max-w-4xl font-display text-[clamp(2.6rem,5vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight">
          La carta de temporada
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Microlotes de Olancho y Francisco Morazan, con blends de casa para tu
          espresso de cada dia. Cada lote catado antes de entrar a la carta.
        </p>

        <div className="mt-10 flex flex-col gap-4 border-y border-border py-5 md:flex-row md:items-center md:gap-10">
          <FilterGroup label="Proceso" options={PROCESSES} value={process} onChange={(v) => setFilter('proceso', v)} />
          <FilterGroup label="Tueste" options={ROASTS} value={roast} onChange={(v) => setFilter('tueste', v)} />
        </div>

        {loading ? (
          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] rounded-lg bg-muted" />
                <div className="mt-4 h-5 w-2/3 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-20 max-w-md">
            <h2 className="font-display text-2xl font-bold">Sin resultados con esos filtros</h2>
            <p className="mt-2 text-muted-foreground">
              Esa combinacion no esta en la cosecha actual. Quita un filtro o
              escribinos y te avisamos cuando entre.
            </p>
            <button
              onClick={() => setParams({}, { replace: true })}
              className="mt-5 cursor-pointer rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-forest"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
      <StoreFooter />
    </main>
  )
}
