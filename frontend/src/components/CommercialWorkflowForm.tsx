import { useState, type FormEvent } from 'react'
import { commercialService } from '../services'
import type { CommercialRequest } from '../types'

const transitions: Record<string, string[]> = {
  Nueva: ['Nueva', 'En contacto', 'Cerrada'],
  'En contacto': ['En contacto', 'Propuesta enviada', 'Cerrada'],
  'Propuesta enviada': ['Propuesta enviada', 'En contacto', 'Cerrada'],
  Cerrada: ['Cerrada', 'Nueva'],
}

export function CommercialWorkflowForm({ item, assignees, onSaved }: {
  item: CommercialRequest
  assignees: { id: string; name: string; role: string }[]
  onSaved: (item: CommercialRequest) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy(true); setError(null)
    try {
      onSaved(await commercialService.updateWorkflow(item.id, {
        status: String(data.get('status')), assignedUserId: String(data.get('assignee')) || null,
        version: item.version, note: String(data.get('note')),
      }))
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar el seguimiento.') }
    finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="mt-6 border-t border-border pt-5">
    <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
      <legend className="mb-3 font-semibold">Actualizar seguimiento</legend>
      <label className="text-sm">Responsable<select name="assignee" defaultValue={item.assignedUserId ?? ''} className="mt-2 block w-full rounded-md border border-input bg-background p-2.5">
        <option value="">Sin asignar</option>
        {item.assignedUserId && !assignees.some(a => a.id === item.assignedUserId) && <option value={item.assignedUserId} disabled>Responsable anterior no disponible; reasigná</option>}
        {assignees.map(a => <option key={a.id} value={a.id}>{a.name} · {a.role}</option>)}
      </select></label>
      <label className="text-sm">Estado<select name="status" defaultValue={item.status} className="mt-2 block w-full rounded-md border border-input bg-background p-2.5">{(transitions[item.status] ?? [item.status]).map(status => <option key={status}>{status}</option>)}</select></label>
      <label className="text-sm sm:col-span-2">Nota de seguimiento<textarea required maxLength={1000} name="note" rows={3} className="mt-2 block w-full rounded-md border border-input bg-background p-3" /></label>
      <p className="text-sm text-muted-foreground sm:col-span-2">El estado registra trabajo realizado por el equipo. Guardarlo no envía una propuesta ni contacta al cliente.</p>
      <button className="w-fit rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50" type="submit">{busy ? 'Guardando…' : 'Guardar seguimiento'}</button>
    </fieldset>
    {error && <p role="alert" className="mt-3 text-destructive">{error} Si hubo un conflicto, copiá tu nota y usá «Actualizar listado».</p>}
  </form>
}
