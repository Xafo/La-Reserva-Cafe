import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { commercialService, hasPermission } from '../../services'
import { commercialSummary } from '../../services/commercial'
import { useAuth } from '../../context/AuthContext'
import type { CommercialRequest } from '../../types'
import { CommercialWorkflowForm } from '../../components/CommercialWorkflowForm'

export function CommercialRequestsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<CommercialRequest[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [assignees, setAssignees] = useState<{ id: string; name: string; role: string }[]>([])
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const permitted = !!user && hasPermission(user.role, 'clientes')
  const canWrite = !!user && ['Administrador', 'Compras', 'Ventas'].includes(user.role)
  useEffect(() => {
    if (!permitted) return
    let cancelled = false
    Promise.all([commercialService.list(page), canWrite ? commercialService.assignees() : Promise.resolve([])]).then(([result, people]) => {
      if (!cancelled) { setItems(result.items); setAssignees(people); setHasMore(result.hasMore); setLoading(false) }
    }).catch(() => { if (!cancelled) { setError('No pudimos cargar las solicitudes. Reintentá.'); setLoading(false) } })
    return () => { cancelled = true }
  }, [page, attempt, permitted, canWrite])
  const changePage = (value: number) => { setPage(value); setLoading(true); setError(null) }
  return <AdminLayout title="Solicitudes comerciales">
    <p className="max-w-prose text-sm text-muted-foreground">Resúmenes registrados por clientes y seguimiento del equipo. Esta bandeja no envía mensajes ni aprueba condiciones comerciales.</p>
    {!permitted ? <p role="alert" className="mt-6">No tenés permiso para consultar solicitudes.</p> : <>
      <button type="button" disabled={loading} className="mt-4 rounded-md border px-4 py-2 disabled:opacity-50" onClick={() => { setLoading(true); setError(null); setAttempt(n => n + 1) }}>Actualizar listado</button>
      {savedMessage && <p role="status" className="mt-4">{savedMessage}</p>}
      {error && <div role="alert" className="mt-6"><p>{error}</p><button className="mt-3 underline" onClick={() => { setLoading(true); setError(null); setAttempt(n => n + 1) }}>Reintentar</button></div>}
      {loading ? <p role="status" className="mt-8">Cargando solicitudes…</p> : !error && <>
        {!items.length && <p className="mt-8 rounded-lg border border-border p-6">Todavía no hay solicitudes en esta página. Aparecen cuando un cliente confirma el registro desde su resumen.</p>}
        <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-background">
          {items.map(item => {
            const summary = commercialSummary(item.onboarding)
            return <article key={item.id} className="p-5">
              <div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold">{item.name} · {summary.role}</h2><span className="text-sm text-muted-foreground">{item.status}</span></div>
              <p className="mt-2 break-words text-sm">{item.email} · {item.phone} · {item.city}</p>
              <p className="mt-2 text-sm text-muted-foreground">Actualizada: {new Date(item.updatedAt).toLocaleString('es-HN')} · Referencia: {item.id}</p>
              <dl className="mt-5 grid gap-4 lg:grid-cols-2">{summary.details.map(detail => <div key={detail.label}><dt className="text-sm text-muted-foreground">{detail.label}</dt><dd className="mt-1 font-medium">{detail.value}</dd></div>)}</dl>
              <p className="mt-5 max-w-prose text-sm">{summary.conditions}</p>
              <p className="mt-4 text-sm">Responsable: {assignees.find(a => a.id === item.assignedUserId)?.name ?? item.assignedUserId ?? 'Sin asignar'}</p>
              <details className="mt-5"><summary className="cursor-pointer font-medium">Historial de seguimiento ({item.history.length})</summary>
                {!item.history.length && <p className="mt-3 text-sm">Solicitud anterior al registro de historial.</p>}
                <ol className="mt-3 space-y-4">{item.history.map((entry, index) => <li key={`${entry.at}-${index}`} className="border-t border-border pt-3 text-sm">
                  <p>{new Date(entry.at).toLocaleString('es-HN')} · {entry.actorType === 'team' ? 'Equipo' : 'Cliente'}: {entry.actorId}</p>
                  <p className="mt-1">{entry.previousStatus} → {entry.status} · Responsable: {entry.assignee ?? 'Sin asignar'}</p>
                  <p className="mt-2 whitespace-pre-wrap break-words">{entry.note}</p>
                  {entry.previousOnboarding && <details className="mt-2"><summary className="cursor-pointer">Respuestas anteriores</summary><dl className="mt-2 space-y-2">{commercialSummary(entry.previousOnboarding).details.map(detail => <div key={detail.label}><dt>{detail.label}</dt><dd className="font-medium">{detail.value}</dd></div>)}</dl></details>}
                </li>)}</ol>
              </details>
              {canWrite && <CommercialWorkflowForm key={item.version} item={item} assignees={assignees} onSaved={saved => { setItems(rows => rows.map(row => row.id === saved.id ? saved : row)); setSavedMessage('Seguimiento guardado. No se enviaron mensajes al cliente.') }} />}
            </article>
          })}
        </div>
        <div className="mt-6 flex items-center gap-4"><button disabled={page === 1} className="rounded-md border px-4 py-2 disabled:opacity-40" onClick={() => changePage(page - 1)}>Anterior</button><span>Página {page}</span><button disabled={!hasMore} className="rounded-md border px-4 py-2 disabled:opacity-40" onClick={() => changePage(page + 1)}>Siguiente</button></div>
      </>}
    </>}
  </AdminLayout>
}
