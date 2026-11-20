import { Link } from 'react-router-dom'
import { Check, ShoppingBag } from 'lucide-react'
import type { Recommendation } from '../../types'
import { lps } from '../../lib/format'
import { ProductCard } from './ProductCard'
import { Reveal } from './Reveal'
import { AddToCartButton } from './AddToCartButton'

// Pantalla de resultado del quiz: el cafe ganador con el % de compatibilidad
// y las razones, mas hasta dos alternativas.

export function RecommendationResult({ recommendations }: { recommendations: Recommendation[] }) {
  const [winner, ...runnerUps] = recommendations

  if (!winner) return <div role="status" className="rounded-lg border border-border p-6"><h2 className="font-display text-xl font-bold">No hay cafés disponibles para recomendar</h2><p className="mt-3 text-muted-foreground">Tu perfil queda guardado. Podés volver a consultar cuando haya disponibilidad.</p><Link to="/tienda" className="mt-4 inline-block font-semibold text-primary">Ver catálogo</Link></div>
  const { product, matchPct, reasons } = winner

  return (
    <div>
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Tu café ideal</p>
        <div className="mt-5 grid gap-8 rounded-lg border border-border bg-background p-6 md:grid-cols-[280px_1fr] md:p-8">
          <Link to={`/tienda/${product.id}`} className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-muted">
            <img src={product.imageUrl} alt={product.imageAlt} className="h-full w-full object-cover" />
            <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1.5 text-sm font-bold text-forest-deep">
              {matchPct}% de afinidad
            </span>
          </Link>
          <div className="flex flex-col">
            <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              <Link to={`/tienda/${product.id}`} className="transition-colors hover:text-primary">
                {product.name}
              </Link>
            </h2>
            <p className="mt-1 text-muted-foreground">
              {product.origin} · {product.process} · Tueste {product.roast.toLowerCase()}
            </p>
            <ul className="mt-5 space-y-2.5">
              {reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2.5 text-sm md:text-base">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>
            <p className="mt-3 text-sm text-muted-foreground">Afinidad orientativa calculada con tus respuestas y las características del café; no garantiza que te guste. Presentación y molienda se coordinan al atender el pedido.</p>
            <div className="mt-auto flex flex-wrap items-center gap-4 pt-7">
              <AddToCartButton product={product} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground transition-colors hover:bg-forest">
                <ShoppingBag className="h-4 w-4" />
                Agregar al carrito — {lps(product.priceLps)}
              </AddToCartButton>
              <Link to={`/tienda/${product.id}`} className="font-medium text-primary hover:underline">
                Ver detalle
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      {runnerUps.length > 0 && (
        <Reveal>
          <h3 className="mt-14 font-display text-xl font-bold">Tambien te podrian gustar</h3>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            {runnerUps.map((r) => (
              <ProductCard key={r.product.id} product={r.product} />
            ))}
          </div>
        </Reveal>
      )}
    </div>
  )
}
