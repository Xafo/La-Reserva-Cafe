import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout, StatusBadge } from '../../components/AdminLayout'
import { reportService } from '../../services'
import { lps, shortDate } from '../../lib/format'
import type { Order, Product } from '../../types'

interface Summary {
  salesLps: number
  pendingOrders: number
  activeProducts: number
  lowStock: Product[]
  recentOrders: Order[]
  topProducts: { name: string; units: number }[]
  recentActivity: { id: number; actorId: string; action: string; entity: string; entityId: string; occurredAt: string }[]
}

export function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    reportService.getSummary().then(setSummary)
  }, [])

  return (
    <AdminLayout title="Dashboard">
      {!summary ? (
        <div className="grid gap-4 md:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Ventas operativas (mes)', value: lps(summary.salesLps) },
              { label: 'Ordenes pendientes', value: String(summary.pendingOrders) },
              { label: 'Productos activos', value: String(summary.activeProducts) },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-background p-5">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-extrabold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="rounded-lg border border-border bg-background">
              <header className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-display font-bold">Ordenes recientes</h2>
                <Link to="/admin/ordenes" className="text-sm font-medium text-primary hover:underline">Ver todas</Link>
              </header>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-5 py-2.5 font-medium">Orden</th>
                    <th className="px-5 py-2.5 font-medium">Cliente</th>
                    <th className="px-5 py-2.5 font-medium">Fecha</th>
                    <th className="px-5 py-2.5 font-medium">Total</th>
                    <th className="px-5 py-2.5 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-medium">{o.id}</td>
                      <td className="px-5 py-3">{o.customerName}</td>
                      <td className="px-5 py-3 text-muted-foreground">{shortDate(o.createdAt)}</td>
                      <td className="px-5 py-3">{lps(o.totalLps)}</td>
                      <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <div className="space-y-8">
              <section className="rounded-lg border border-border bg-background p-5">
                <h2 className="font-display font-bold">Mas vendidos</h2>
                <ul className="mt-4 space-y-3">
                  {summary.topProducts.map((p) => {
                    const max = summary.topProducts[0].units
                    return (
                      <li key={p.name} className="text-sm">
                        <div className="flex justify-between">
                          <span>{p.name}</span>
                          <span className="font-medium text-muted-foreground">{p.units} uds</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(p.units / max) * 100}%` }} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>

              <section className="rounded-lg border border-border bg-background p-5">
                <h2 className="font-display font-bold">Actividad reciente</h2>
                <ul className="mt-3 space-y-2 text-sm">{summary.recentActivity.length ? summary.recentActivity.map((entry) => <li key={entry.id}><span className="font-medium">{entry.action}</span><span className="text-muted-foreground"> · {shortDate(entry.occurredAt)}</span></li>) : <li className="text-muted-foreground">Sin actividad registrada.</li>}</ul>
              </section>

              <section className="rounded-lg border border-border bg-background p-5">
                <h2 className="font-display font-bold">Inventario bajo</h2>
                {summary.lowStock.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">Sin alertas de stock.</p>
                ) : (
                  <ul className="mt-4 space-y-2.5">
                    {summary.lowStock.map((p) => (
                      <li key={p.id} className="flex items-center justify-between text-sm">
                        <Link to="/admin/productos" className="hover:text-primary">{p.name}</Link>
                        <span className="font-semibold text-destructive">{p.stock} uds</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
