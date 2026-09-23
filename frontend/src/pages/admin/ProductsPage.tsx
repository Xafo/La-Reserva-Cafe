import { useEffect, useState, type FormEvent } from 'react'
import { AdminLayout, StatusBadge } from '../../components/AdminLayout'
import { ExportCsvButton } from '../../components/ExportCsvButton'
import { Dialog } from '../../components/ui/dialog'
import { catalogService } from '../../services'
import { lps } from '../../lib/format'
import type { Product } from '../../types'
import { cn } from '../../lib/utils'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    catalogService.getProducts().then((p) => { setProducts(p); setLoading(false) })
  }, [])

  const toggleActive = async (product: Product) => {
    const updated = { ...product, active: !product.active }
    setError(null)
    try {
      const saved = await catalogService.updateProduct(updated)
      setProducts(prev => prev.map(p => p.id === saved.id ? saved : p))
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo guardar. Recargá el catálogo.') }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(null)
    const form = new FormData(event.currentTarget)
    try {
      let product = await catalogService.createProduct({
        name: String(form.get('name')), origin: String(form.get('origin')), region: String(form.get('region')), process: String(form.get('process')) as Product['process'], roast: String(form.get('roast')) as Product['roast'], presentationGrams: Number(form.get('grams')), priceLps: Number(form.get('price')), stock: Number(form.get('stock')), active: true, description: String(form.get('description')), imageUrl: String(form.get('imageUrl')) || '/images/cafe-default.jpg', imageAlt: String(form.get('name')), quality: { grainType: String(form.get('grainType')), altitudeMasl: Number(form.get('altitude')), humidityPct: Number(form.get('humidity')), harvestDate: String(form.get('harvestDate')), producer: String(form.get('producer')), grade: String(form.get('grade')) as Product['quality']['grade'], cuppingScore: Number(form.get('cupping')), notes: [] },
      })
      const image = form.get('image')
      if (image instanceof File && image.size > 0) product = await catalogService.uploadProductImage(product.id, image)
      setProducts((items) => [...items, product]); setOpen(false)
    } catch { setError('No se pudo guardar el producto.') }
  }

  return (
    <AdminLayout title="Catalogo de productos">
      {error && !open && <p role="alert" className="mb-4 text-destructive">{error}</p>}
      <div className="rounded-lg border border-border bg-background">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">{products.length} productos registrados</p>
          <div className="flex items-center gap-2">
            <ExportCsvButton items={products} filename="productos.csv" />
            <button onClick={() => setOpen(true)} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-forest">
              Nuevo producto
            </button>
          </div>
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
      <Dialog open={open} onOpenChange={setOpen}><form onSubmit={submit} className="grid max-h-[80vh] gap-2 overflow-y-auto"><h2 className="font-display text-xl font-bold">Nuevo producto</h2>{[['name','Nombre'],['origin','Origen'],['region','Región'],['grams','Presentación (g)'],['price','Precio LPS'],['stock','Stock'],['description','Descripción'],['imageUrl','URL de imagen'],['grainType','Variedad'],['altitude','Altura msnm'],['humidity','Humedad %'],['harvestDate','Cosecha'],['producer','Productor'],['cupping','Puntaje taza']].map(([name,label]) => <input key={name} name={name} required type={['grams','price','stock','altitude','humidity','cupping'].includes(name) ? 'number' : name === 'harvestDate' ? 'date' : 'text'} placeholder={label} className="rounded border border-input p-2" />)}<input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="rounded border border-input p-2" /><select name="process" defaultValue="Lavado" className="rounded border border-input p-2"><option>Lavado</option><option>Honey</option><option>Natural</option></select><select name="roast" defaultValue="Medio" className="rounded border border-input p-2"><option>Claro</option><option>Medio</option><option>Oscuro</option></select><select name="grade" defaultValue="Premium" className="rounded border border-input p-2"><option>Premium</option><option>Exportacion</option><option>Estandar</option></select>{error && <p className="text-sm text-destructive">{error}</p>}<button className="rounded bg-primary py-2 font-semibold text-primary-foreground">Guardar</button></form></Dialog>
    </AdminLayout>
  )
}
