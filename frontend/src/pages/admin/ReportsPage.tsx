import { Download } from 'lucide-react'
import { AdminLayout } from '../../components/AdminLayout'

const reports = [
  { name: 'Productos registrados', desc: 'Catalogo completo con precios, stock y estado.' },
  { name: 'Ordenes de compra', desc: 'Historial de ordenes por estado y rango de fechas.' },
  { name: 'Ventas', desc: 'Ventas finalizadas por periodo, cliente y producto.' },
  { name: 'Inventario', desc: 'Existencias actuales y alertas de stock bajo.' },
  { name: 'Productos mas vendidos', desc: 'Ranking de unidades vendidas por periodo.' },
  { name: 'Movimientos por fecha', desc: 'Bitacora de entradas y salidas en el rango elegido.' },
]

export function ReportsPage() {
  return (
    <AdminLayout title="Reporteria">
      <div className="rounded-lg border border-border bg-background">
        <header className="border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Exportaciones en PDF y Excel. La generacion se habilita al conectar el backend.
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
                {/* TODO(backend): GET /api/reports/export?type={r}&format=pdf|xlsx */}
                {['PDF', 'Excel'].map((fmt) => (
                  <button
                    key={fmt}
                    disabled
                    title="Disponible al conectar el backend .NET"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground opacity-60"
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
