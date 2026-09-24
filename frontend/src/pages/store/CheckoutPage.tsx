import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { orderService } from '../../services'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { lps } from '../../lib/format'
import { GRINDS, type Grind, type OrderQuote } from '../../types'

export function CheckoutPage() {
  const { items, totalLps, clear } = useCart()
  const { account } = useCustomerAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [quote, setQuote] = useState<OrderQuote | null>(null)
  const [wholesale, setWholesale] = useState(false)
  const [grinds, setGrinds] = useState<Record<string, Grind>>({})

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setSubmitting(true)
    setError(null)
    try {
      if (!quote) {
        setQuote(await orderService.quote(items.map(i => ({ productId: i.product.id, quantity: i.quantity })), String(data.get('ciudad')), wholesale))
        return
      }
      const order = await orderService.createOrder({
        customerName: String(data.get('nombre')), phone: String(data.get('telefono')),
        deliveryAddress: String(data.get('direccion')), city: String(data.get('ciudad')),
        deliveryNotes: String(data.get('notas')), accountId: account?.id,
      }, items, grinds, quote)
      clear()
      setOrderId(order.id)
    } catch (failure) {
      setQuote(null)
      setError(failure instanceof Error ? failure.message : 'No pudimos registrar tu pedido. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (orderId) {
    return (
      <main>
        <StoreNav />
        <div className="mx-auto max-w-2xl px-5 pb-32 pt-40 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-8 w-8" />
          </span>
          <h1 className="mt-7 font-display text-4xl font-extrabold tracking-tight">Pedido recibido</h1>
          <p className="mt-4 text-muted-foreground">
            Registramos tu pedido <span className="font-semibold text-foreground">{orderId}</span> como pendiente.
            Esta confirmación no acredita un pago ni confirma una fecha de entrega.
          </p>
          <Link to="/tienda" className="mt-9 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-forest">
            Seguir explorando
          </Link>
        </div>
        <StoreFooter />
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main>
        <StoreNav />
        <div className="mx-auto max-w-2xl px-5 pb-32 pt-40 text-center">
          <h1 className="font-display text-3xl font-extrabold">Tu pedido esta vacio</h1>
          <p className="mt-3 text-muted-foreground">Elegi tu cafe en la tienda antes de confirmar.</p>
          <button onClick={() => navigate('/tienda')} className="mt-7 cursor-pointer rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-forest">
            Ir a la tienda
          </button>
        </div>
        <StoreFooter />
      </main>
    )
  }

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <StoreNav />
      <section className="mx-auto max-w-5xl px-5 pb-28 pt-28 md:px-8 md:pt-36">
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Confirmar pedido</h1>

        {orderService.hasPendingOrder() && <div className="mt-6 rounded border border-border p-4"><p>Hay un envío anterior por verificar. Se recuperará con sus datos originales.</p><button disabled={submitting} className="mt-2 underline" onClick={async () => { setSubmitting(true); try { const order = await orderService.recoverOrder(); clear(); setOrderId(order.id) } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo verificar.') } finally { setSubmitting(false) } }}>Verificar envío anterior</button></div>}
        <div className="mt-12 grid gap-14 md:grid-cols-[1fr_380px]">
          <aside className="h-fit md:col-start-2 md:row-start-1 rounded-lg border border-border p-6">
            <h2 className="font-display text-lg font-bold">Resumen</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="space-y-2 border-b border-border pb-3">
                  <div className="flex justify-between gap-3"><span>
                    {quantity} × {product.name}
                    <span className="block text-xs text-muted-foreground">{product.presentationGrams} g · {product.roast}</span>
                  </span>
                  <span className="font-medium">{lps(product.priceLps * quantity)}</span></div>
                  <label htmlFor={`grind-${product.id}`} className="block text-sm">Preparación de {product.name}</label>
                  <select id={`grind-${product.id}`} form="checkout" disabled={submitting}
                    value={grinds[product.id] ?? 'En grano'}
                    onChange={event => { setQuote(null); setGrinds(current => ({ ...current, [product.id]: event.target.value as Grind })) }}
                    className="w-full rounded border border-input bg-background px-3 py-2">
                    {GRINDS.map(grind => <option key={grind}>{grind}</option>)}
                  </select>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-between border-t border-border pt-4 font-display text-lg font-bold">
              <span>Productos</span>
              <span>{lps(totalLps)}</span>
            </div>
            <label className="mt-4 flex items-start gap-2 text-sm"><input type="checkbox" checked={wholesale} disabled={submitting} onChange={event => { setWholesale(event.target.checked); setQuote(null) }} />Solicitar tarifa mayorista del escenario (mínimo 5 kg; cafés empresariales).</label>
            {quote && <div role="status" className="mt-4 space-y-2 border-t border-border pt-4 text-sm"><p className="font-semibold">{quote.terms.scenario ? 'ESCENARIO DE PRUEBA · ' : ''}{quote.terms.version}</p><p>Subtotal: {lps(quote.terms.subtotalLps)}</p><p>Descuento: {lps(quote.terms.discountLps)}</p><p>Envío: {quote.terms.shippingLps === null ? 'Por cotizar antes de aprobar' : lps(quote.terms.shippingLps)}</p><p className="font-bold">{quote.terms.shippingLps === null ? 'Importe conocido' : 'Total'}: {lps(quote.terms.totalLps)}</p></div>}
            <p className="mt-3 text-sm text-muted-foreground">Envío y disponibilidad sujetos a confirmación. El importe mostrado corresponde a los productos.</p>
          </aside>
          <form id="checkout" onChange={() => setQuote(null)} onSubmit={handleSubmit} className="space-y-5 md:col-start-1 md:row-start-1">
            {[
              { name: 'nombre', label: 'Nombre completo', type: 'text', autoComplete: 'name', defaultValue: account?.name },
              { name: 'telefono', label: 'Telefono', type: 'tel', autoComplete: 'tel', defaultValue: account?.phone },
              { name: 'direccion', label: 'Direccion de entrega', type: 'text', autoComplete: 'street-address', defaultValue: undefined },
              { name: 'ciudad', label: 'Ciudad', type: 'text', autoComplete: 'address-level2', defaultValue: account?.city },
            ].map((f) => (
              <div key={f.name}>
                <label htmlFor={f.name} className="mb-1.5 block text-sm font-medium">
                  {f.label}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  required
                  maxLength={f.name === 'direccion' ? 500 : f.name === 'telefono' ? 40 : f.name === 'ciudad' ? 120 : 150}
                  disabled={submitting}
                  autoComplete={f.autoComplete}
                  defaultValue={f.defaultValue}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25"
                />
              </div>
            ))}
            <div>
              <label htmlFor="notas" className="mb-1.5 block text-sm font-medium">
                Notas para la entrega <span className="text-muted-foreground">(opcional)</span>
              </label>
              <textarea
                id="notas"
                name="notas"
                rows={3}
                maxLength={1000}
                disabled={submitting}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </div>
            {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={submitting || orderService.hasPendingOrder()}
              className="w-full cursor-pointer rounded-full bg-primary py-4 font-semibold text-primary-foreground transition-colors hover:bg-forest disabled:opacity-60"
            >
              {submitting ? 'Procesando…' : quote ? `Confirmar pedido — ${lps(quote.terms.totalLps)}` : 'Revisar importes y condiciones'}
            </button>
            <p className="text-xs text-muted-foreground">
              El pago se coordina fuera de la plataforma. Este formulario registra tu pedido, no realiza un cobro.
            </p>
          </form>


        </div>
      </section>
      <StoreFooter />
    </main>
  )
}
