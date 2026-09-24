import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../config/api'
import { catalogService, orderService } from '../../services'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { useCart } from '../../context/CartContext'
import { lps } from '../../lib/format'
import type { Product, OrderQuote } from '../../types'

interface Conditions { scenarioEnabled: boolean; scenario: { version: string; commercial: { wholesale: { scopeProductIds: string[]; tiers: { minKg: number; maxKgExclusive: number | null; discountPct: number }[] } } } }

export function BusinessCatalogPage() {
  const [conditions, setConditions] = useState<Conditions | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [city, setCity] = useState('Tegucigalpa')
  const [quote, setQuote] = useState<OrderQuote | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { add } = useCart()
  useEffect(() => { Promise.all([api<Conditions>('/commerce'), catalogService.getProducts(true)]).then(([c, p]) => { setConditions(c); setProducts(p.filter(x => c.scenario.commercial.wholesale.scopeProductIds.includes(x.id))) }).catch(() => setError('No se pudo cargar el catálogo. Recargá para reintentar.')) }, [])
  return <main><StoreNav /><section className="mx-auto max-w-4xl px-5 pb-24 pt-36">
    <h1 className="font-display text-4xl font-bold">Café para tu empresa</h1>
    <p className="mt-5 max-w-prose">Compará el abastecimiento por volumen y prepará una propuesta para tu oficina o cafetería. La atención se registra desde tu perfil comercial.</p>
    <p className="mt-4 font-semibold">Escenario demo-v1: precios HNL, mínimo 5 kg. No son tarifas oficiales.</p>
    <p className="mt-2 text-sm">Los rangos de presupuesto del quiz se interpretan como USD solo en este escenario; no se convierten a HNL. Facturación mensual, prioridad y exclusividad requieren acuerdo manual. No hay suscripción ni cobro automático.</p>
    {conditions && <><ul className="mt-5 flex flex-wrap gap-5">{conditions.scenario.commercial.wholesale.tiers.map(t => <li key={t.minKg}>{t.minKg}{t.maxKgExclusive ? ` a menos de ${t.maxKgExclusive}` : '+'} kg: {t.discountPct}%</li>)}</ul>
      {!conditions.scenarioEnabled && <p role="status" className="mt-4">La simulación comercial está desactivada en este entorno. Solicitá una propuesta desde tu cuenta.</p>}</>}
    <form className="mt-8 space-y-5" onChange={() => setQuote(null)} onSubmit={async event => { event.preventDefault(); setError(null); setBusy(true); try { setQuote(await orderService.quote(products.filter(p => quantities[p.id] > 0).map(p => ({ productId: p.id, quantity: quantities[p.id] })), city, true)) } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo cotizar.') } finally { setBusy(false) } }}>
      {products.map(p => <div key={p.id} className="grid gap-3 border-b border-border py-4 sm:grid-cols-[1fr_120px_auto]"><div><h2 className="font-semibold">{p.name}</h2><p>{p.presentationGrams} g · {lps(p.priceLps)} · {p.stock} disponibles</p></div><label className="text-sm">Bolsas<input type="number" min="0" max="1000" value={quantities[p.id] ?? 0} onChange={e => setQuantities(q => ({ ...q, [p.id]: Number(e.target.value) }))} className="mt-1 w-full rounded border border-input p-2" /></label><button type="button" disabled={!quantities[p.id]} onClick={() => add(p, quantities[p.id])} className="self-end rounded border border-input p-2">Agregar al carrito</button></div>)}
      {conditions && products.length === 0 && <p>No hay cafés empresariales disponibles en este catálogo.</p>}
      <label className="block">Ciudad<input required maxLength={120} value={city} onChange={e => setCity(e.target.value)} className="mt-1 block w-full rounded border border-input p-3" /></label>
      <button disabled={busy || !conditions?.scenarioEnabled} className="rounded bg-primary px-6 py-3 text-primary-foreground disabled:opacity-50">{busy ? 'Calculando…' : 'Simular propuesta mayorista'}</button>
    </form>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
    {quote && <div role="status" className="mt-5 border-t border-border pt-5"><p>{quote.terms.kilograms} kg · Subtotal {lps(quote.terms.subtotalLps)} · Descuento {lps(quote.terms.discountLps)}</p><p>Envío: {quote.terms.shippingLps === null ? 'Cotización manual' : lps(quote.terms.shippingLps)}. Importe conocido: {lps(quote.terms.totalLps)}.</p><p>En Tegucigalpa: escenario de 2–4 días hábiles desde aprobación, sujeto a confirmación. Al pasar al checkout, seleccioná la tarifa mayorista y revisá de nuevo.</p></div>}
    <div className="mt-8 flex gap-6"><Link to="/cuenta" className="underline">Mi solicitud comercial</Link><Link to="/checkout" className="underline">Revisar carrito</Link></div>
  </section><StoreFooter /></main>
}
