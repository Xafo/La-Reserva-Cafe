import { useEffect, useState } from 'react'
import { api } from '../config/api'
import type { Order } from '../types'
import { lps } from '../lib/format'

export function OrderFollowUp({ order, canWrite, onSaved }: { order: Order; canWrite: boolean; onSaved: (order: Order) => void }) {
  const [history, setHistory] = useState<{ events: { at: string; actor: string; status: string; note: string }[]; deliveryToken: string | null } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { let active = true; api<typeof history>(`/orders/${encodeURIComponent(order.id)}/history`, undefined, 'team').then(h => { if (active) setHistory(h) }).catch(() => { if (active) setError('No se pudo cargar el historial. Recargá los pedidos.') }); return () => { active = false } }, [order])
  return <div className="mt-4 space-y-3 border-t border-border pt-3">
    {order.terms && <p>{order.terms.scenario ? 'ESCENARIO · ' : ''}{order.terms.version} · Productos {lps(order.terms.subtotalLps)} · Descuento {lps(order.terms.discountLps)} · Envío {order.terms.shippingLps === null ? 'Por cotizar' : lps(order.terms.shippingLps)}</p>}
    {canWrite && order.status === 'Pendiente' && order.terms?.shippingLps === null && <form className="space-y-3" onSubmit={async e => {
      e.preventDefault(); const data = new FormData(e.currentTarget); setBusy(true); setError(null)
      try { onSaved(await api<Order>(`/orders/${encodeURIComponent(order.id)}/delivery`, { method: 'PATCH', body: JSON.stringify({ shippingLps: Number(data.get('fee')), note: String(data.get('note')), expectedToken: history?.deliveryToken }) }, 'team')) }
      catch (failure) { setError(failure instanceof Error ? failure.message : 'No se guardó la cotización.') } finally { setBusy(false) }
    }}><label className="block">Envío acordado (HNL)<input name="fee" type="number" min="0" max="100000" step="0.01" required className="ml-3 rounded border border-input p-2" /></label><label className="block">Evidencia del acuerdo con el cliente<textarea name="note" required maxLength={1000} className="mt-1 block w-full rounded border border-input p-2" /></label><button disabled={busy || !history} className="rounded bg-primary px-4 py-2 text-primary-foreground">Registrar cotización de entrega</button></form>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <details><summary className="cursor-pointer">Historial del pedido</summary><ul className="mt-2 space-y-2">{history?.events.map((e, i) => <li key={i}>{new Date(e.at).toLocaleString('es-HN')} · {e.actor} · {e.status}: {e.note}</li>)}</ul>{history?.events.length === 0 && <p>Pedido anterior sin historial registrado.</p>}</details>
  </div>
}
