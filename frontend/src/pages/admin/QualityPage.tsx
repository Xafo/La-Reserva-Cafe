import { useEffect, useState, type FormEvent } from 'react'
import { AdminLayout, StatusBadge } from '../../components/AdminLayout'
import { Dialog } from '../../components/ui/dialog'
import { catalogService } from '../../services'
import { shortDate } from '../../lib/format'
import type { Product } from '../../types'

export function QualityPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)

  useEffect(() => {
    catalogService.getProducts().then((p) => { setProducts(p); setLoading(false) })
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editing) return
    const form = new FormData(event.currentTarget)
    const updated = { ...editing, quality: { ...editing.quality, grainType: String(form.get('grainType')), altitudeMasl: Number(form.get('altitude')), humidityPct: Number(form.get('humidity')), harvestDate: String(form.get('harvestDate')), producer: String(form.get('producer')), cuppingScore: Number(form.get('cupping')), grade: String(form.get('grade')) as Product['quality']['grade'] } }
    const saved = await catalogService.updateProduct(updated)
    setProducts((items) => items.map((item) => item.id === saved.id ? saved : item)); setEditing(null)
  }

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
                <tr key={p.id} onClick={() => setEditing(p)} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50">
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
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        {editing && <form onSubmit={submit} className="space-y-3"><h2 className="font-display text-xl font-bold">Ficha de calidad</h2><p className="text-sm text-muted-foreground">{editing.name}</p><input name="grainType" required defaultValue={editing.quality.grainType} placeholder="Variedad" className="w-full rounded border border-input p-2" /><input name="altitude" required type="number" defaultValue={editing.quality.altitudeMasl} placeholder="Altura" className="w-full rounded border border-input p-2" /><input name="humidity" required type="number" step="0.1" defaultValue={editing.quality.humidityPct} placeholder="Humedad" className="w-full rounded border border-input p-2" /><input name="harvestDate" required type="date" defaultValue={editing.quality.harvestDate} className="w-full rounded border border-input p-2" /><input name="producer" required defaultValue={editing.quality.producer} placeholder="Productor" className="w-full rounded border border-input p-2" /><input name="cupping" required type="number" step="0.1" defaultValue={editing.quality.cuppingScore} placeholder="Puntaje" className="w-full rounded border border-input p-2" /><select name="grade" defaultValue={editing.quality.grade} className="w-full rounded border border-input p-2"><option>Premium</option><option>Exportacion</option><option>Estandar</option></select><button className="w-full rounded bg-primary py-2 font-semibold text-primary-foreground">Guardar</button></form>}
      </Dialog>
    </AdminLayout>
  )
}
