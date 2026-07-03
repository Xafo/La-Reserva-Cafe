import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { customerService } from '../../services'
import type { Customer } from '../../types'
import { cn } from '../../lib/utils'

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'Todos' | 'Cliente' | 'Proveedor'>('Todos')

  useEffect(() => {
    customerService.getCustomers().then((c) => { setCustomers(c); setLoading(false) })
  }, [])

  const filtered = filter === 'Todos' ? customers : customers.filter((c) => c.type === filter)

  return (
    <AdminLayout title="Clientes y proveedores">
      <div className="rounded-lg border border-border bg-background">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex gap-1.5">
            {(['Todos', 'Cliente', 'Proveedor'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn(
                  'cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
                  filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {f === 'Todos' ? 'Todos' : `${f}s`}
              </button>
            ))}
          </div>
          {/* TODO(backend): alta y edicion de clientes/proveedores */}
          <button className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-forest">
            Nuevo registro
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
                <th className="px-5 py-2.5 font-medium">Nombre</th>
                <th className="px-5 py-2.5 font-medium">Tipo</th>
                <th className="px-5 py-2.5 font-medium">Correo</th>
                <th className="px-5 py-2.5 font-medium">Telefono</th>
                <th className="px-5 py-2.5 font-medium">Ciudad</th>
                <th className="px-5 py-2.5 font-medium">Historial</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      c.type === 'Cliente' ? 'bg-primary/12 text-primary' : 'bg-accent/20 text-accent-ink'
                    )}>
                      {c.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-5 py-3">{c.phone}</td>
                  <td className="px-5 py-3">{c.city}</td>
                  <td className="px-5 py-3">{c.totalOrders} ordenes</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
