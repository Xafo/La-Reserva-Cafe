import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { Product } from '../../types'
import { useCart } from '../../context/CartContext'
import { lps } from '../../lib/format'

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()

  return (
    <article className="group relative flex flex-col">
      <Link
        to={`/tienda/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-muted"
      >
        <img
          src={product.imageUrl}
          alt={product.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover saturate-[0.92] transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-forest-deep/85 px-3 py-1 text-[11px] font-semibold tracking-wide text-forest-foreground">
          {product.process} · {product.quality.altitudeMasl} msnm
        </span>
        {product.stock < 15 && (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-forest-deep">
            Cosecha limitada
          </span>
        )}
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold leading-tight">
            <Link to={`/tienda/${product.id}`} className="hover:text-primary transition-colors">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{product.origin}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.quality.notes.slice(0, 2).join(' · ')}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className="font-display text-lg font-bold">{lps(product.priceLps)}</p>
          <button
            onClick={() => add(product)}
            aria-label={`Agregar ${product.name} al carrito`}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-forest"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
