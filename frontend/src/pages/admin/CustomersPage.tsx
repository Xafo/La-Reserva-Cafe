import { useEffect, useState, type FormEvent } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { ExportCsvButton } from '../../components/ExportCsvButton'
import { Dialog } from '../../components/ui/dialog'
import { customerService, accountService, catalogService } from '../../services'
import { lps } from '../../lib/format'
import type { Customer, CustomerAccount, Product } from '../../types'
import { cn } from '../../lib/utils'

// Directorio de clientes/proveedores + inteligencia de ventas: para los
// clientes registrados en linea se muestran sus preferencias del quiz y el
// cafe que la plataforma les recomendo.

const FILTERS = ['Todos', 'Cliente', 'Proveedor', 'En linea'] as const
type Filter = (typeof FILTERS)[number]

function ChipGroup({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="rounded-full bg-primary/12 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {v}
          </span>
        ))}
      </div>
    </div>
  )
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [accounts, setAccounts] = useState<CustomerAccount[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('Todos')
  const [viewing, setViewing] = useState<CustomerAccount | null>(null)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([customerService.getCustomers(), accountService.getAccounts(), catalogService.getProducts()]).then(
      ([c, a, p]) => {
        setCustomers(c)
        setAccounts(a)
        setProducts(p)
        setLoading(false)
      },
    )
  }, [])

  const accountByEmail = new Map(accounts.map((a) => [a.email.toLowerCase(), a]))
  const filtered =
    filter === 'Todos'
      ? customers
      : filter === 'En linea'
        ? customers.filter((c) => accountByEmail.has(c.email.toLowerCase()))
        : customers.filter((c) => c.type === filter)

  const recommended = viewing?.recommendedProductId
    ? products.find((p) => p.id === viewing.recommendedProductId)
    : undefined

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(null)
    const form = new FormData(event.currentTarget)
    const payload = { name: String(form.get('name')), email: String(form.get('email')), phone: String(form.get('phone')), city: String(form.get('city')), type: String(form.get('type')) as Customer['type'] }
    try {
      const saved = editing ? await customerService.updateCustomer({ ...editing, ...payload }) : await customerService.createCustomer(payload)
      setCustomers((items) => editing ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved])
      setEditorOpen(false); setEditing(null)
    } catch { setError('No se pudo guardar el registro.') }
  }

  return (
    <AdminLayout title="Clientes y proveedores">
      <div className="rounded-lg border border-border bg-background">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn(
                  'cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
                  filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {f === 'Cliente' ? 'Clientes' : f === 'Proveedor' ? 'Proveedores' : f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ExportCsvButton items={customers} filename="clientes.csv" />
            <button onClick={() => { setEditing(null); setEditorOpen(true) }} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-forest">
              Nuevo registro
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
                <th className="px-5 py-2.5 font-medium">Nombre</th>
                <th className="px-5 py-2.5 font-medium">Tipo</th>
                <th className="px-5 py-2.5 font-medium">Correo</th>
                <th className="px-5 py-2.5 font-medium">Telefono</th>
                <th className="px-5 py-2.5 font-medium">Ciudad</th>
                <th className="px-5 py-2.5 font-medium">Historial</th>
                <th className="px-5 py-2.5 font-medium">Preferencias</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const account = accountByEmail.get(c.email.toLowerCase())
                return (
                  <tr key={c.id} onClick={() => { setEditing(c); setEditorOpen(true) }} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50">
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
                    <td className="px-5 py-3">
                      {account?.preferences ? (
                        <button
                          onClick={(event) => { event.stopPropagation(); setViewing(account) }}
                          className="cursor-pointer font-medium text-primary hover:underline"
                        >
                          Ver preferencias
                        </button>
                      ) : account ? (
                        <span className="text-muted-foreground">Sin quiz</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <form onSubmit={submit} className="space-y-3">
          <h2 className="font-display text-xl font-bold">{editing ? 'Editar registro' : 'Nuevo registro'}</h2>
          <input name="name" required defaultValue={editing?.name} placeholder="Nombre" className="w-full rounded border border-input p-2" />
          <input name="email" required type="email" defaultValue={editing?.email} placeholder="Correo" className="w-full rounded border border-input p-2" />
          <input name="phone" required defaultValue={editing?.phone} placeholder="Teléfono" className="w-full rounded border border-input p-2" />
          <input name="city" required defaultValue={editing?.city} placeholder="Ciudad" className="w-full rounded border border-input p-2" />
          <select name="type" defaultValue={editing?.type ?? 'Cliente'} className="w-full rounded border border-input p-2"><option>Cliente</option><option>Proveedor</option></select>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button className="w-full rounded bg-primary py-2 font-semibold text-primary-foreground">Guardar</button>
        </form>
      </Dialog>

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        {viewing?.preferences && (
          <div>
            <h2 className="font-display text-xl font-bold">{viewing.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Perfil del quiz · {viewing.email}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ChipGroup label="Que busca" values={viewing.preferences.goals} />
              <ChipGroup label="Metodo" values={viewing.preferences.brewMethods} />
              <ChipGroup label="Como lo toma" values={viewing.preferences.drinkStyles} />
              <ChipGroup label="Sabores" values={viewing.preferences.flavorFamilies} />
              <ChipGroup label="Intensidad" values={[viewing.preferences.intensity]} />
              <ChipGroup label="Presupuesto" values={[viewing.preferences.budget]} />
            </div>
            {recommended && (
              <div className="mt-6 flex items-center gap-4 rounded-lg border border-border p-4">
                <img src={recommended.imageUrl} alt="" className="h-14 w-14 rounded object-cover" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cafe recomendado</p>
                  <p className="font-semibold">{recommended.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {recommended.roast} · {recommended.process} · {lps(recommended.priceLps)}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setViewing(null)}
              className="mt-6 w-full cursor-pointer rounded-lg border border-border py-2.5 font-medium transition-colors hover:bg-muted"
            >
              Cerrar
            </button>
          </div>
        )}
      </Dialog>
    </AdminLayout>
  )
}
