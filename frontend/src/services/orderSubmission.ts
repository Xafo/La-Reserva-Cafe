import { api, ApiError, type SessionKind } from '../config/api'
import type { Order } from '../types'

const storageKey = 'directo.pending-order.v1'
interface PendingOrder { body: string; session?: SessionKind }
export function hasPendingOrder() { return sessionStorage.getItem(storageKey) !== null }

export async function recoverOrder(): Promise<Order> {
  const stored = sessionStorage.getItem(storageKey)
  if (!stored) throw new Error('No hay un envío pendiente de verificar.')
  const pending = JSON.parse(stored) as PendingOrder
  try {
    const order = await api<Order>('/orders', { method: 'POST', body: pending.body }, pending.session)
    sessionStorage.removeItem(storageKey)
    return order
  } catch (error) {
    if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 401 && error.status !== 429)
      sessionStorage.removeItem(storageKey)
    throw error
  }
}

export async function submitOrder(payload: object, session?: SessionKind): Promise<Order> {
  if (hasPendingOrder()) throw new Error('Hay un envío pendiente de verificar. Usá «Verificar envío anterior» antes de crear otro.')
  sessionStorage.setItem(storageKey, JSON.stringify({ body: JSON.stringify({ ...payload, requestId: crypto.randomUUID() }), session }))
  return recoverOrder()
}
