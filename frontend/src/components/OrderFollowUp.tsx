import type { Order } from '../types'

export function OrderFollowUp({ order }: { order: Order; canWrite?: boolean; onSaved?: (order: Order) => void }) {
  return <div className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
    <p>La confirmación de disponibilidad, entrega y condiciones comerciales se registra manualmente por el equipo.</p>
    {order.deliveryNotes && <p className="mt-2"><span className="font-medium text-foreground">Notas de entrega:</span> {order.deliveryNotes}</p>}
  </div>
}
