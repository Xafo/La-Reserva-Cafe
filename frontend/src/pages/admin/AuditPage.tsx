import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AdminLayout } from '../../components/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import { auditService, type AuditEntry } from '../../services'

export function AuditPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (user?.role !== 'Administrador') return
    let current = true
    auditService.getEntries().then(values => {
      if (current) setEntries(values)
    }).catch(cause => {
      if (current) setError(cause instanceof Error ? cause.message : 'No pudimos cargar la actividad.')
    }).finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [user?.role, attempt])

  if (user?.role !== 'Administrador') return <Navigate to="/admin" replace />
  const filtered = entries.filter(entry => `${entry.actorId} ${entry.action} ${entry.entity} ${entry.entityId}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  return (
    <AdminLayout title="Auditoría">
      <p className="mb-6 text-sm text-muted-foreground">Las últimas 100 acciones del equipo, de más reciente a más antigua.</p>
      <label htmlFor="audit-search" className="mb-2 block text-sm font-medium">Buscar por usuario, acción o registro</label>
      <input id="audit-search" type="search" value={query} onChange={event => setQuery(event.target.value)} className="mb-6 w-full max-w-lg rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-ring" />
      {loading ? <p role="status">Cargando actividad…</p> : error ? (
        <div role="alert"><p className="text-destructive">{error}</p><button className="mt-3 text-sm font-medium text-primary underline" onClick={() => { setError(''); setLoading(true); setAttempt(value => value + 1) }}>Volver a intentar</button></div>
      ) : !filtered.length ? <p className="text-sm text-muted-foreground">{entries.length ? 'No hay acciones que coincidan con la búsqueda.' : 'Las acciones del equipo aparecerán aquí cuando se realicen cambios.'}</p> : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted"><tr>{['Fecha y hora', 'Usuario', 'Acción', 'Registro'].map(label => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead>
            <tbody>{filtered.map(entry => <tr key={entry.id} className="border-t border-border">
              <td className="whitespace-nowrap px-4 py-3"><time dateTime={entry.occurredAt}>{new Date(entry.occurredAt).toLocaleString('es-HN')}</time></td>
              <td className="px-4 py-3">{entry.actorId}</td><td className="px-4 py-3">{entry.action}</td>
              <td className="px-4 py-3">{entry.entity}<span className="block text-xs text-muted-foreground">{entry.entityId}</span></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
