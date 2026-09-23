import { Fragment, useEffect, useState, type FormEvent } from 'react'
import { FileText } from 'lucide-react'
import { AdminLayout, StatusBadge } from '../../components/AdminLayout'
import { ExportCsvButton } from '../../components/ExportCsvButton'
import { Dialog } from '../../components/ui/dialog'
import { downloadTeamFile } from '../../config/api'
import { catalogService, orderService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import { lps, shortDate } from '../../lib/format'
import { GRINDS, type Grind, type Order, type OrderStatus, type Product } from '../../types'

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  Pendiente: ['Pendiente', 'Aprobada', 'Cancelada'], Aprobada: ['Aprobada', 'Finalizada', 'Cancelada'],
  Cancelada: ['Cancelada'], Finalizada: ['Finalizada'],
}

export function OrdersPage() {
  const { user } = useAuth()
  const canWrite = !!user && ['Administrador', 'Compras', 'Ventas'].includes(user.role)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<{ productId: string; quantity: number; grind: Grind }[]>([{ productId: '', quantity: 1, grind: 'En grano' }])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([orderService.getOrders(), catalogService.getProducts(true)]).then(([o, p]) => { setOrders(o); setProducts(p); setLoading(false) }).catch(() => { setError('No pudimos cargar las órdenes. Recargá para intentarlo de nuevo.'); setLoading(false) })
  }, [])

  const changeStatus = async (id: string, status: OrderStatus) => {
    setSaving(true); setError(null)
    try {
      const current = orders.find(o => o.id === id)
      if (!current) return
      await orderService.updateStatus(id, status, current.status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se guardó el estado.') }
    finally { setSaving(false) }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSaving(true); setError(null)
    try {
      const order = await orderService.createManualOrder({
        customerName: String(data.get('customerName')), phone: String(data.get('phone')),
        deliveryAddress: String(data.get('deliveryAddress')), city: String(data.get('city')),
        deliveryNotes: String(data.get('deliveryNotes')),
      }, lines)
      setOrders(items => [order, ...items]); setOpen(false)
      setLines([{ productId: '', quantity: 1, grind: 'En grano' }])
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo crear la orden.') }
    finally { setSaving(false) }
  }

  return (
    <AdminLayout title="Ordenes de compra">
      <p className="mb-4 text-sm text-muted-foreground">Aprobar reserva existencias. Cancelar devuelve la reserva registrada. Los pedidos finalizados o cancelados no se reabren.</p>
      {error && !open && <div className="mb-4"><p role="alert" className="text-destructive">{error}</p><button onClick={() => window.location.reload()} className="mt-2 underline">Recargar pedidos</button></div>}
      <div className="rounded-lg border border-border bg-background">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">Historial completo, mas reciente primero</p>
          <div className="flex items-center gap-2">
            <ExportCsvButton items={orders} filename="ordenes.csv" />
            <button disabled={!canWrite} onClick={() => setOpen(true)} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-forest">
              Nueva orden
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
                <th className="px-5 py-2.5 font-medium">Orden</th>
                <th className="px-5 py-2.5 font-medium">Cliente</th>
                <th className="px-5 py-2.5 font-medium">Fecha</th>
                <th className="px-5 py-2.5 font-medium">Articulos</th>
                <th className="px-5 py-2.5 font-medium">Total</th>
                <th className="px-5 py-2.5 font-medium">Estado</th>
                <th className="px-5 py-2.5 font-medium">PDF</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o.id}>
                  <tr className="border-b border-border">
                    <td className="px-5 py-3 font-medium">{o.id}</td>
                    <td className="px-5 py-3">{o.customerName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{shortDate(o.createdAt)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        className="cursor-pointer font-medium text-primary hover:underline"
                        aria-expanded={expanded === o.id}
                      >
                        {o.items.reduce((s, i) => s + i.quantity, 0)} uds
                      </button>
                    </td>
                    <td className="px-5 py-3 font-medium">{lps(o.totalLps)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={o.status} />
                        <select
                          disabled={saving || !canWrite || NEXT_STATUSES[o.status].length === 1}
                          value={o.status}
                          onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                          aria-label={`Cambiar estado de ${o.id}`}
                          className="cursor-pointer rounded border border-input bg-background px-1.5 py-1 text-xs"
                        >
                          {NEXT_STATUSES[o.status].map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => downloadTeamFile(`/orders/${encodeURIComponent(o.id)}/pdf`).catch(() => undefined)}
                        title="Descargar PDF"
                        className="cursor-pointer rounded p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr className="border-b border-border bg-muted/50">
                      <td colSpan={7} className="px-5 py-3">
                        <div className="mb-3 space-y-1 break-words">
                          <p>Teléfono: {o.phone ?? 'No registrado (pedido anterior)'}</p>
                          <p>Entrega: {o.deliveryAddress ?? 'No registrada'} · {o.city ?? 'Ciudad no registrada'}</p>
                          {o.deliveryNotes && <p>Notas: {o.deliveryNotes}</p>}
                          <p className="text-muted-foreground">{o.accountId ? 'Cliente con cuenta' : 'Sin cuenta vinculada'}</p>
                        </div>
                        <ul className="space-y-1 text-sm">
                          {o.items.map((i, index) => (
                            <li key={`${i.productId}-${index}`} className="flex justify-between">
                              <span>{i.quantity} × {i.productName}<span className="block text-xs text-muted-foreground">{i.presentationGrams ? `${i.presentationGrams} g` : 'Presentación no registrada'} · {i.roast ?? 'Tueste no registrado'} · {i.grind ?? 'Molienda no registrada'}</span></span>
                              <span className="text-muted-foreground">{lps(i.unitPriceLps * i.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Dialog open={open} onOpenChange={value => { if (!saving) setOpen(value) }}>
        <form onSubmit={submit} className="max-h-[80vh] space-y-4 overflow-y-auto p-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Nueva orden</h2>
            <button type="button" disabled={saving} onClick={() => setOpen(false)} className="rounded border border-input px-3 py-1 text-sm">Cerrar</button>
          </div>
          <fieldset disabled={saving} className="space-y-3">
            {[
              { name: 'customerName', label: 'Nombre del cliente', max: 150 },
              { name: 'phone', label: 'Teléfono', max: 40 },
              { name: 'deliveryAddress', label: 'Dirección de entrega', max: 500 },
              { name: 'city', label: 'Ciudad', max: 120 },
            ].map(field => <label key={field.name} className="block text-sm">{field.label}
              <input name={field.name} type={field.name === 'phone' ? 'tel' : 'text'} required maxLength={field.max} className="mt-1 w-full rounded border border-input p-2" />
            </label>)}
            <label className="block text-sm">Notas de entrega (opcional)<textarea name="deliveryNotes" maxLength={1000} className="mt-1 w-full rounded border border-input p-2" /></label>
            {lines.map((line, index) => <div key={index} className="space-y-2 border-t border-border pt-3">
              <label className="block text-sm">Café {index + 1}<select required value={line.productId} onChange={event => setLines(items => items.map((item, i) => i === index ? { ...item, productId: event.target.value } : item))} className="mt-1 w-full rounded border border-input p-2"><option value="">Seleccionar producto</option>{products.map(product => <option key={product.id} value={product.id}>{product.name} · {product.presentationGrams} g</option>)}</select></label>
              <div className="flex gap-3">
                <label className="text-sm">Cantidad<input required type="number" min="1" max="1000" value={line.quantity} onChange={event => setLines(items => items.map((item, i) => i === index ? { ...item, quantity: Number(event.target.value) } : item))} className="mt-1 block w-24 rounded border border-input p-2" /></label>
                <label className="flex-1 text-sm">Molienda<select value={line.grind} onChange={event => setLines(items => items.map((item, i) => i === index ? { ...item, grind: event.target.value as Grind } : item))} className="mt-1 w-full rounded border border-input p-2">{GRINDS.map(grind => <option key={grind}>{grind}</option>)}</select></label>
              </div>
              {lines.length > 1 && <button type="button" onClick={() => setLines(items => items.filter((_, i) => i !== index))} className="text-sm text-destructive">Quitar café {index + 1}</button>}
            </div>)}
            <button type="button" disabled={lines.length >= 50} onClick={() => setLines(items => [...items, { productId: '', quantity: 1, grind: 'En grano' }])} className="text-sm font-medium text-primary">+ Agregar producto</button>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button className="w-full rounded bg-primary py-2 font-semibold text-primary-foreground disabled:opacity-60">{saving ? 'Guardando…' : 'Crear orden pendiente'}</button>
          </fieldset>
        </form>
      </Dialog>
    </AdminLayout>
  )
}
