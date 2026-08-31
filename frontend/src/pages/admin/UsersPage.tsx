import { useEffect, useState, type FormEvent } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { Dialog } from '../../components/ui/dialog'
import { userService } from '../../services'
import type { Role, User } from '../../types'

const roleDescriptions: Record<string, string> = {
  Administrador: 'Acceso total, incluida la gestion de usuarios y roles.',
  Compras: 'Catalogo, calidad, ordenes y proveedores.',
  Ventas: 'Ordenes, clientes y reporteria de ventas.',
  Supervisor: 'Lectura de toda la operacion sin gestion de usuarios.',
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    userService.getUsers().then((u) => { setUsers(u); setLoading(false) })
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(null)
    const data = new FormData(event.currentTarget)
    const payload = { name: String(data.get('name')), email: String(data.get('email')), role: String(data.get('role')) as Role, active: data.get('active') === 'on', initialPassword: String(data.get('password') || '') }
    try {
      const saved = editing ? await userService.updateUser({ ...editing, ...payload, initialPassword: payload.initialPassword || undefined }) : await userService.createUser({ ...payload, initialPassword: payload.initialPassword })
      setUsers((items) => editing ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved])
      setOpen(false); setEditing(null)
    } catch { setError('No se pudo guardar el usuario.') }
  }

  return (
    <AdminLayout title="Usuarios y roles">
      <div className="rounded-lg border border-border bg-background">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">
            {/* TODO(backend): bitacora de acciones por usuario (GET /api/audit-log) */}
            Cuentas del equipo y permisos por rol.
          </p>
          <button onClick={() => { setEditing(null); setOpen(true) }} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-forest">
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
                <tr key={u.id} onClick={() => { setEditing(u); setOpen(true) }} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50">
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
      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={submit} className="space-y-3">
          <h2 className="font-display text-xl font-bold">{editing ? 'Editar usuario' : 'Invitar usuario'}</h2>
          <input name="name" required defaultValue={editing?.name} placeholder="Nombre" className="w-full rounded border border-input p-2" />
          <input name="email" required type="email" defaultValue={editing?.email} placeholder="Correo" className="w-full rounded border border-input p-2" />
          <select name="role" defaultValue={editing?.role ?? 'Ventas'} className="w-full rounded border border-input p-2">{(['Administrador', 'Compras', 'Ventas', 'Supervisor'] as Role[]).map((role) => <option key={role}>{role}</option>)}</select>
          <input name="password" type="password" minLength={12} required={!editing} placeholder={editing ? 'Nueva contraseña (opcional)' : 'Contraseña inicial (12+ caracteres)'} className="w-full rounded border border-input p-2" />
          <label className="flex gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={editing?.active ?? true} /> Cuenta activa</label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button className="w-full rounded bg-primary py-2 font-semibold text-primary-foreground">Guardar</button>
        </form>
      </Dialog>
    </AdminLayout>
  )
}
