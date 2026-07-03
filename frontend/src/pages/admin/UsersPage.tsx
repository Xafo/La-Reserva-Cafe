import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { userService } from '../../services'
import type { User } from '../../types'

const roleDescriptions: Record<string, string> = {
  Administrador: 'Acceso total, incluida la gestion de usuarios y roles.',
  Compras: 'Catalogo, calidad, ordenes y proveedores.',
  Ventas: 'Ordenes, clientes y reporteria de ventas.',
  Supervisor: 'Lectura de toda la operacion sin gestion de usuarios.',
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userService.getUsers().then((u) => { setUsers(u); setLoading(false) })
  }, [])

  return (
    <AdminLayout title="Usuarios y roles">
      <div className="rounded-lg border border-border bg-background">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">
            {/* TODO(backend): bitacora de acciones por usuario (GET /api/audit-log) */}
            Cuentas del equipo y permisos por rol.
          </p>
          {/* TODO(backend): invitacion de usuarios y asignacion de rol */}
          <button className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-forest">
            Invitar usuario
          </button>
        </header>
        {loading ? (
          <div className="space-y-2 p-5" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Usuario</th>
                <th className="px-5 py-2.5 font-medium">Correo</th>
                <th className="px-5 py-2.5 font-medium">Rol</th>
                <th className="px-5 py-2.5 font-medium">Alcance</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{u.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3 font-medium text-primary">{u.role}</td>
                  <td className="px-5 py-3 text-muted-foreground">{roleDescriptions[u.role]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
