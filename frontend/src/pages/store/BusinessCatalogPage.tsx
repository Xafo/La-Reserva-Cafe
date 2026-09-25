import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { catalogService } from '../../services'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { useCart } from '../../context/CartContext'
import { lps } from '../../lib/format'
import type { Product } from '../../types'

export function BusinessCatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState(false)
  const { add } = useCart()
  useEffect(() => { catalogService.getProducts(true).then(setProducts).catch(() => setError(true)) }, [])
  return <main><StoreNav /><section className="mx-auto max-w-4xl px-5 pb-24 pt-36">
    <h1 className="font-display text-4xl font-bold">Café para tu empresa</h1>
    <p className="mt-5 max-w-prose">Elegí los cafés que querés evaluar y registrá tu solicitud comercial. El equipo confirma precios, disponibilidad, entrega y condiciones antes de preparar cualquier orden.</p>
    {error && <p role="alert" className="mt-4 text-destructive">No se pudo cargar el catálogo. Recargá para reintentar.</p>}
    <div className="mt-8 space-y-3">{products.map(product => <article key={product.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4"><div><h2 className="font-semibold">{product.name}</h2><p className="text-sm text-muted-foreground">{product.presentationGrams} g · {lps(product.priceLps)} · {product.stock} disponibles</p></div><button onClick={() => add(product, 1)} className="rounded border border-input px-3 py-2 text-sm">Agregar al carrito</button></article>)}</div>
    <div className="mt-8 flex gap-6"><Link to="/cuenta" className="underline">Registrar solicitud comercial</Link><Link to="/checkout" className="underline">Revisar carrito</Link></div>
  </section><StoreFooter /></main>
}
