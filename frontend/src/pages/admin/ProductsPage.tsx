import { useEffect, useState } from 'react'
import { AdminLayout, StatusBadge } from '../../components/AdminLayout'
import { catalogService } from '../../services'
import { lps } from '../../lib/format'
import type { Product } from '../../types'
import { cn } from '../../lib/utils'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    catalogService.getProducts().then((p) => { setProducts(p); setLoading(false) })
  }, [])

  const toggleActive = async (product: Product) => {
    const updated = { ...product, active: !product.active }
    setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)))
    await catalogService.updateProduct(updated)
  }

  return (
    <AdminLayout title="Catalogo de productos">
      <div className="rounded-lg border border-border bg-background">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">{products.length} productos registrados</p>
          {/* TODO(backend): alta de producto con carga de imagenes (POST /api/products) */}
          <button className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-forest">
            Nuevo producto
          </button>
        </header>
        {loading ? (
          <div className="space-y-2 p-5" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Producto</th>
                <th className="px-5 py-2.5 font-medium">Origen</th>
                <th className="px-5 py-2.5 font-medium">Proceso</th>
                <th className="px-5 py-2.5 font-medium">Presentacion</th>
                <th className="px-5 py-2.5 font-medium">Precio</th>
                <th className="px-5 py-2.5 font-medium">Stock</th>
                <th className="px-5 py-2.5 font-medium">Calidad</th>
                <th className="px-5 py-2.5 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="flex items-center gap-3 px-5 py-3">
                    <img src={p.imageUrl} alt="" className="h-9 w-9 rounded object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.origin}</td>
                  <td className="px-5 py-3">{p.process}</td>
                  <td className="px-5 py-3">{p.presentationGrams} g</td>
                  <td className="px-5 py-3">{lps(p.priceLps)}</td>
                  <td className={cn('px-5 py-3 font-medium', p.stock < 25 && 'text-destructive')}>{p.stock}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.quality.grade} /></td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(p)}
                      role="switch"
                      aria-checked={p.active}
                      aria-label={`${p.active ? 'Desactivar' : 'Activar'} ${p.name}`}
                      className={cn(
                        'relative h-5.5 w-10 cursor-pointer rounded-full transition-colors duration-150',
                        p.active ? 'bg-primary' : 'bg-border'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform duration-150',
                          p.active ? 'translate-x-5' : 'translate-x-0.5'
                        )}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
