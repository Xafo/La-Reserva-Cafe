import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { AdminLayout, StatusBadge } from '../../components/AdminLayout'
import { ExportCsvButton } from '../../components/ExportCsvButton'
import { orderService } from '../../services'
import { lps, shortDate } from '../../lib/format'
import type { Order, OrderStatus } from '../../types'

const STATUSES: OrderStatus[] = ['Pendiente', 'Aprobada', 'Cancelada', 'Finalizada']

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    orderService.getOrders().then((o) => { setOrders(o); setLoading(false) })
  }, [])

  const changeStatus = async (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    await orderService.updateStatus(id, status)
  }

  return (
    <AdminLayout title="Ordenes de compra">
      <div className="rounded-lg border border-border bg-background">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">Historial completo, mas reciente primero</p>
          <div className="flex items-center gap-2">
            <ExportCsvButton items={orders} filename="ordenes.csv" />
            {/* TODO(backend): creacion manual de orden de compra multiproducto */}
            <button className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-forest">
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
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {/* TODO(backend): GET /api/orders/{id}/pdf */}
                      <button
                        title="Generar PDF (requiere backend)"
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
    </AdminLayout>
  )
}
