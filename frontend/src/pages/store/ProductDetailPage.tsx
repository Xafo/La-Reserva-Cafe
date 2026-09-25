import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import type { Product } from '../../types'
import { catalogService } from '../../services'
import { useCart } from '../../context/CartContext'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { lps, shortDate } from '../../lib/format'

export function ProductDetailPage() {
  const { id } = useParams()
  const { add } = useCart()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (id) catalogService.getProduct(id).then((p) => setProduct(p ?? null))
  }, [id])

  if (product === undefined) {
    return (
      <main>
        <StoreNav />
        <div className="mx-auto max-w-7xl animate-pulse px-5 pt-28 md:px-8" aria-busy="true">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="aspect-[4/5] rounded-lg bg-muted" />
            <div className="space-y-4 pt-8">
              <div className="h-10 w-3/4 rounded bg-muted" />
              <div className="h-5 w-1/2 rounded bg-muted" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (product === null) {
    return (
      <main>
        <StoreNav />
        <div className="mx-auto max-w-3xl px-5 pb-32 pt-40 text-center">
          <h1 className="font-display text-3xl font-extrabold">Ese café ya no está en la carta</h1>
          <p className="mt-3 text-muted-foreground">Las cosechas rotan por temporada. Mira lo que hay disponible hoy.</p>
          <Link to="/tienda" className="mt-7 inline-block rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground hover:bg-forest">
            Volver a la tienda
          </Link>
        </div>
        <StoreFooter />
      </main>
    )
  }

  const q = product.quality

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <StoreNav />
      <section className="mx-auto max-w-7xl px-5 pb-28 pt-24 md:px-8 md:pt-32">
        <Link to="/tienda" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Toda la carta
        </Link>

        <div className="mt-8 grid gap-12 md:grid-cols-2 lg:gap-20">
          <div className="overflow-hidden rounded-lg">
            <img src={product.imageUrl} alt={product.imageAlt} className="aspect-[4/5] w-full object-cover" />
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-medium text-muted-foreground">{product.origin} · {product.region}</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">{product.name}</h1>
            <p className="mt-3 flex flex-wrap gap-2">
              {q.notes.map((n) => (
                <span key={n} className="rounded-full bg-accent/20 px-3.5 py-1 text-sm font-medium text-accent-ink">
                  {n}
                </span>
              ))}
            </p>
            <p className="mt-6 max-w-prose leading-relaxed text-foreground/90">{product.description}</p>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-6 text-sm sm:grid-cols-3">
              {[
                ['Variedad', q.grainType],
                ['Altura', `${q.altitudeMasl} msnm`],
                ['Proceso', product.process],
                ['Tueste', product.roast],
                ['Puntaje de taza', q.cuppingScore.toFixed(1)],
                ['Humedad', `${q.humidityPct}%`],
                ['Productor', q.producer],
                ['Cosecha', shortDate(q.harvestDate)],
                ['Clasificacion', q.grade],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <p className="font-display text-3xl font-extrabold">
                {lps(product.priceLps)}
                <span className="ml-2 text-sm font-medium text-muted-foreground">/ {product.presentationGrams} g</span>
              </p>
              <div className="inline-flex items-center rounded-full border border-border">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Disminuir cantidad" className="cursor-pointer p-2.5 hover:text-primary"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} aria-label="Aumentar cantidad" className="cursor-pointer p-2.5 hover:text-primary"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <button
              onClick={() => add(product, quantity)}
              className="mt-6 w-full cursor-pointer rounded-full bg-primary py-4 font-semibold text-primary-foreground transition-colors hover:bg-forest sm:max-w-sm"
            >
              Agregar al pedido — {lps(product.priceLps * quantity)}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              {product.stock < 15
                ? `Quedan ${product.stock} unidades de esta cosecha.`
                : 'Café de La Reserva Café. Consultá su origen, proceso y presentación en esta ficha.'}
            </p>
          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}
