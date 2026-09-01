import { Download } from 'lucide-react'
import { AdminLayout } from '../../components/AdminLayout'
import { downloadTeamFile } from '../../config/api'

const reports = [
  { type: 'productos', name: 'Productos registrados', desc: 'Catalogo completo con precios, stock y estado.' },
  { type: 'ordenes', name: 'Ordenes de compra', desc: 'Historial de ordenes por estado y rango de fechas.' },
  { type: 'ventas', name: 'Ventas', desc: 'Ventas finalizadas por periodo, cliente y producto.' },
  { type: 'inventario', name: 'Inventario', desc: 'Existencias actuales y alertas de stock bajo.' },
  { type: 'mas-vendidos', name: 'Productos mas vendidos', desc: 'Ranking de unidades vendidas por periodo.' },
  { type: 'movimientos', name: 'Movimientos por fecha', desc: 'Bitacora de entradas y salidas en el rango elegido.' },
]

export function ReportsPage() {
  return (
    <AdminLayout title="Reporteria">
      <div className="rounded-lg border border-border bg-background">
        <header className="border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Exportaciones en PDF y Excel calculadas desde la base de datos.
          </p>
        </header>
        <ul className="divide-y divide-border">
          {reports.map((r) => (
            <li key={r.name} className="flex items-center justify-between gap-6 px-5 py-4">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {['PDF', 'Excel'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => downloadTeamFile(`/reports/export?type=${r.type}&format=${fmt === 'PDF' ? 'pdf' : 'xlsx'}`).catch(() => undefined)}
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
