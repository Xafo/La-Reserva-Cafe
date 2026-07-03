import { useEffect, useState } from 'react'
import { AdminLayout, StatusBadge } from '../../components/AdminLayout'
import { catalogService } from '../../services'
import { shortDate } from '../../lib/format'
import type { Product } from '../../types'

export function QualityPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    catalogService.getProducts().then((p) => { setProducts(p); setLoading(false) })
  }, [])

  return (
    <AdminLayout title="Calidad del cafe">
      <div className="rounded-lg border border-border bg-background">
        <header className="border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Ficha tecnica por lote: variedad, altura, humedad, cosecha y clasificacion.
          </p>
        </header>
        {loading ? (
          <div className="space-y-2 p-5" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Lote</th>
                <th className="px-5 py-2.5 font-medium">Variedad</th>
                <th className="px-5 py-2.5 font-medium">Altura</th>
                <th className="px-5 py-2.5 font-medium">Humedad</th>
                <th className="px-5 py-2.5 font-medium">Cosecha</th>
                <th className="px-5 py-2.5 font-medium">Productor</th>
                <th className="px-5 py-2.5 font-medium">Taza</th>
                <th className="px-5 py-2.5 font-medium">Clasificacion</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3">{p.quality.grainType}</td>
                  <td className="px-5 py-3">{p.quality.altitudeMasl} msnm</td>
                  <td className="px-5 py-3">{p.quality.humidityPct}%</td>
                  <td className="px-5 py-3 text-muted-foreground">{shortDate(p.quality.harvestDate)}</td>
                  <td className="px-5 py-3">{p.quality.producer}</td>
                  <td className="px-5 py-3 font-semibold">{p.quality.cuppingScore.toFixed(1)}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.quality.grade} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
