import { type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, FlaskConical, ClipboardList, Users, BarChart3, ShieldCheck, LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { hasPermission, type Permission } from '../services'
import { BrandMark } from './store/BrandMark'
import { cn } from '../lib/utils'

const navItems: { path: string; label: string; icon: typeof Package; permission?: Permission }[] = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/productos', label: 'Productos', icon: Package, permission: 'productos' },
  { path: '/admin/calidad', label: 'Calidad', icon: FlaskConical, permission: 'calidad' },
  { path: '/admin/ordenes', label: 'Ordenes', icon: ClipboardList, permission: 'ordenes' },
  { path: '/admin/clientes', label: 'Clientes y proveedores', icon: Users, permission: 'clientes' },
  { path: '/admin/reportes', label: 'Reporteria', icon: BarChart3, permission: 'reportes' },
  { path: '/admin/usuarios', label: 'Usuarios y roles', icon: ShieldCheck, permission: 'usuarios' },
]

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (!user) return null
  const visible = navItems.filter((i) => !i.permission || hasPermission(user.role, i.permission))

  return (
    <div className="flex h-screen bg-muted/60">
      <aside className="flex w-64 shrink-0 flex-col bg-forest-deep text-forest-foreground">
        <div className="px-5 pb-5 pt-6">
          <Link to="/" title="Ver tienda publica">
            <BrandMark dark className="[&>span:last-child]:text-forest-foreground" />
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {visible.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                  active
                    ? 'bg-white/12 text-forest-foreground'
                    : 'text-forest-foreground/65 hover:bg-white/6 hover:text-forest-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="text-xs text-forest-foreground/60">{user.role}</p>
          <button
            onClick={() => { logout(); navigate('/admin/login') }}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-forest-foreground/65 transition-colors hover:text-forest-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Cerrar sesion
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center border-b border-border bg-background px-8">
          <h1 className="font-display text-lg font-bold">{title}</h1>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pendiente: 'bg-accent/20 text-accent-ink',
    Aprobada: 'bg-primary/12 text-primary',
    Finalizada: 'bg-forest/10 text-forest',
    Cancelada: 'bg-destructive/10 text-destructive',
    Premium: 'bg-accent/20 text-accent-ink',
    Exportacion: 'bg-primary/12 text-primary',
    Estandar: 'bg-muted text-muted-foreground',
  }
  return (
    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold', styles[status] ?? 'bg-muted text-muted-foreground')}>
      {status}
    </span>
  )
}
