import { useState } from 'react'
import { Download } from 'lucide-react'
import { AdminLayout } from '../../components/AdminLayout'
import { downloadTeamFile } from '../../config/api'

const reports = [
  { type: 'productos', name: 'Productos registrados', desc: 'Catalogo completo con precios, stock y estado.' },
  { type: 'ordenes', name: 'Ordenes de compra', desc: 'Historial de ordenes por estado y rango de fechas.' },
  { type: 'ventas', name: 'Ventas', desc: 'Ventas finalizadas por periodo, cliente y producto.' },
  { type: 'inventario', name: 'Inventario', desc: 'Existencias actuales y alertas de stock bajo.' },
  { type: 'mas-vendidos', name: 'Productos mas vendidos', desc: 'Ranking de unidades vendidas por periodo.' },
  { type: 'movimientos', name: 'Historial de pedidos', desc: 'Registro de estados y acuerdos de entrega; no incluye entradas manuales de almacén.' },
]

export function ReportsPage() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Tegucigalpa', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const [from, setFrom] = useState(today.slice(0, 8) + '01')
  const [to, setTo] = useState(today)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const download = async (type: string, format: string) => {
    setError(null); setBusy(true)
    try { await downloadTeamFile(`/reports/export?${new URLSearchParams({ type, format, from, to, ...(status && type === 'ordenes' ? { status } : {}) })}`) }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo exportar.') }
    finally { setBusy(false) }
  }
  return (
    <AdminLayout title="Reporteria">
      <div className="mb-6 flex flex-wrap gap-4"><label>Desde<input type="date" value={from} onChange={e => setFrom(e.target.value)} className="ml-2 rounded border border-input p-2" /></label><label>Hasta<input type="date" value={to} onChange={e => setTo(e.target.value)} className="ml-2 rounded border border-input p-2" /></label><label>Estado (reporte de órdenes)<select value={status} onChange={e => setStatus(e.target.value)} className="ml-2 rounded border border-input p-2"><option value="">Todos</option>{['Pendiente', 'Aprobada', 'Cancelada', 'Finalizada'].map(s => <option key={s}>{s}</option>)}</select></label></div>
      <p className="mb-4 text-sm">Ventas según fecha de finalización, en Honduras (UTC−6). Los históricos sin esa fecha quedan excluidos. Inventario y catálogo muestran el estado actual.</p>
      {error && <p role="alert" className="mb-4 text-destructive">{error}</p>}
      <div className="rounded-lg border border-border bg-background">
        <header className="border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Exportaciones en PDF y Excel calculadas desde la base de datos.
          </p>
        </header>
        <ul className="divide-y divide-border">
          {reports.map((r) => (
            <li key={r.name} className="flex flex-wrap items-center justify-between gap-6 px-5 py-4">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {['PDF', 'Excel'].map((fmt) => (
                  <button
                    key={fmt}
                    disabled={busy || !from || !to || from > to}
                    onClick={() => download(r.type, fmt === 'PDF' ? 'pdf' : 'xlsx')}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                  >
                    <Download className="h-3.5 w-3.5" /> {fmt}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  )
}
