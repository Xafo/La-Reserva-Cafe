import { useEffect, useState, type FormEvent } from 'react'
import { FileText } from 'lucide-react'
import { AdminLayout, StatusBadge } from '../../components/AdminLayout'
import { ExportCsvButton } from '../../components/ExportCsvButton'
import { Dialog } from '../../components/ui/dialog'
import { downloadTeamFile } from '../../config/api'
import { catalogService, orderService } from '../../services'
import { lps, shortDate } from '../../lib/format'
import type { Order, OrderStatus, Product } from '../../types'

const transitions: Record<OrderStatus, OrderStatus[]> = {
  Pendiente: ['Pendiente', 'En revisión', 'Cancelada', 'Vencida'],
  'En revisión': ['En revisión', 'Confirmada', 'Cancelada', 'Vencida'],
  Confirmada: ['Confirmada', 'En preparación', 'Cancelada'],
  'En preparación': ['En preparación', 'Entregada', 'Cancelada'],
  Entregada: ['Entregada'],
  Cancelada: ['Cancelada'],
  Vencida: ['Vencida'],
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState([{ productId: '', quantity: 1 }])
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'Todas' | OrderStatus>('Todas')
  const [customerFilter, setCustomerFilter] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    Promise.all([orderService.getOrders(), catalogService.getProducts(true)]).then(([o, p]) => { setOrders(o); setProducts(p); setLoading(false) })
  }, [])

  const changeStatus = async (id: string, status: OrderStatus) => {
    const previous = orders.find((order) => order.id === id)?.status
    if (!previous || previous === status) return
    setStatusError(null)
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    try { await orderService.updateStatus(id, status, previous) }
    catch { setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: previous } : o))); setStatusError('No pudimos actualizar la orden. Revisá el inventario o intentá de nuevo.') }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const customerName = String(new FormData(event.currentTarget).get('customerName'))
    const order = await orderService.createManualOrder(customerName, lines.filter((line) => line.productId && line.quantity > 0))
    setOrders((items) => [order, ...items]); setOpen(false); setLines([{ productId: '', quantity: 1 }])
  }

  const visibleOrders = orders.filter((order) => {
    const day = order.createdAt.slice(0, 10)
    return (statusFilter === 'Todas' || order.status === statusFilter)
      && (!customerFilter || order.customerName.toLocaleLowerCase().includes(customerFilter.toLocaleLowerCase()))
      && (!from || day >= from) && (!to || day <= to)
  })

  return (
    <AdminLayout title="Ordenes de compra">
      <div className="rounded-lg border border-border bg-background">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">Historial completo, mas reciente primero</p>
          <div className="flex items-center gap-2">
            <ExportCsvButton items={orders} filename="ordenes.csv" />
            <button onClick={() => setOpen(true)} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-forest">
              Nueva orden
            </button>
          </div>
        </header>
        <div className="flex flex-wrap gap-2 border-b border-border px-5 py-3">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'Todas' | OrderStatus)} aria-label="Filtrar por estado" className="rounded border border-input bg-background px-2 py-1.5 text-sm">
            <option>Todas</option>{Object.keys(transitions).map((status) => <option key={status}>{status}</option>)}
          </select>
          <input value={customerFilter} onChange={(event) => setCustomerFilter(event.target.value)} placeholder="Filtrar por cliente" aria-label="Filtrar por cliente" className="rounded border border-input px-2 py-1.5 text-sm" />
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-label="Desde" className="rounded border border-input px-2 py-1.5 text-sm" />
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-label="Hasta" className="rounded border border-input px-2 py-1.5 text-sm" />
        </div>
        {statusError && <p role="alert" className="px-5 pt-4 text-sm text-destructive">{statusError}</p>}
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
              {visibleOrders.map((o) => (
                <>
                  <tr key={o.id} className="border-b border-border">
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
                          value={o.status}
                          onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                          aria-label={`Cambiar estado de ${o.id}`}
                          className="cursor-pointer rounded border border-input bg-background px-1.5 py-1 text-xs"
                        >
                          {transitions[o.status].map((s) => <option key={s}>{s}</option>)}
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
                        <ul className="space-y-1 text-sm">
                          {o.items.map((i) => (
                            <li key={i.productId} className="flex justify-between">
                              <span>{i.quantity} × {i.productName}</span>
                              <span className="text-muted-foreground">{lps(i.unitPriceLps * i.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}><form onSubmit={submit} className="space-y-3"><h2 className="font-display text-xl font-bold">Nueva orden</h2><input name="customerName" required placeholder="Cliente" className="w-full rounded border border-input p-2" />{lines.map((line, index) => <div key={index} className="flex gap-2"><select required value={line.productId} onChange={(event) => setLines((items) => items.map((item, i) => i === index ? { ...item, productId: event.target.value } : item))} className="min-w-0 flex-1 rounded border border-input p-2"><option value="">Producto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select><input type="number" min="1" value={line.quantity} onChange={(event) => setLines((items) => items.map((item, i) => i === index ? { ...item, quantity: Number(event.target.value) } : item))} className="w-20 rounded border border-input p-2" /></div>)}<button type="button" onClick={() => setLines((items) => [...items, { productId: '', quantity: 1 }])} className="text-sm font-medium text-primary">+ Agregar producto</button><button className="w-full rounded bg-primary py-2 font-semibold text-primary-foreground">Crear orden</button></form></Dialog>
    </AdminLayout>
  )
}
