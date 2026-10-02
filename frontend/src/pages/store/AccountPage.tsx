import { CommercialResult } from '../../components/store/CommercialResult'
import { commercialService } from '../../services'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, PackageCheck, Pencil, RotateCcw } from 'lucide-react'
import type { OnboardingProfile, Order, Recommendation } from '../../types'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { catalogService, orderService, recommendationService } from '../../services'
import { useCart } from '../../context/CartContext'
import { lps, shortDate } from '../../lib/format'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { OnboardingQuiz } from '../../components/store/OnboardingQuiz'
import { isConsumer, recommendOnboarding, onboardingSchema } from '../../services/onboarding'
import { RecommendationResult } from '../../components/store/RecommendationResult'

// Cuenta del cliente: datos, preferencias editables y su cafe recomendado.

function PreferenceChips({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="rounded-full bg-primary/8 px-3 py-1 text-sm font-medium text-primary">
            {v}
          </span>
        ))}
      </div>
    </div>
  )
}

export function AccountPage() {
  const { account, logout, saveOnboarding } = useCustomerAuth()
  const { replace } = useCart()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [reordering, setReordering] = useState<string | null>(null)

  const preferences = account?.preferences ?? null
  const onboarding = account?.onboarding ?? null

  useEffect(() => {
    if ((!preferences && !onboarding) || (onboarding && !isConsumer(onboarding.profile))) return
    let cancelled = false
    catalogService.getProducts(true).then((products) => {
      if (!cancelled) setRecommendations(onboarding ? recommendOnboarding(onboarding, products) : recommendationService.recommend(preferences!, products))
    }).catch(() => { if (!cancelled) setError('No pudimos cargar tus recomendaciones. Podés editar tu perfil para reintentar.') })
    return () => {
      cancelled = true
    }
  }, [preferences, onboarding])

  useEffect(() => {
    if (!account) return
    let cancelled = false
    orderService.getAccountOrders(account.id)
      .then((saved) => { if (!cancelled) setOrders(saved) })
      .catch(() => { if (!cancelled) setError('No pudimos cargar tu historial de pedidos. Intentá de nuevo.') })
      .finally(() => { if (!cancelled) setOrdersLoading(false) })
    return () => { cancelled = true }
  }, [account])

  if (!account) return null // CustomerRoute redirige a /ingresar

  const handleQuizComplete = async (profile: OnboardingProfile) => {
    setSubmitting(true)
    setError(null)
    try {
      const products = isConsumer(profile.profile) ? await catalogService.getProducts(true) : []
      const recs = isConsumer(profile.profile) ? recommendOnboarding(profile, products) : []
      await saveOnboarding(profile, recs[0]?.product.id ?? null)
      setRecommendations(recs)
      setEditing(false)
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar tu perfil. Volvé a intentarlo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReorder = async (order: Order) => {
    setReordering(order.id)
    setError(null)
    try {
      const products = await Promise.all(order.items.map((item) => catalogService.getProduct(item.productId)))
      const available = products.flatMap((product, index) => product && product.active && product.stock > 0
        ? [{ product, quantity: order.items[index].quantity }]
        : [])
      if (available.length === 0) throw new Error('Los productos de este pedido ya no están disponibles.')
      replace(available)
      if (available.length !== order.items.length) setError('Agregamos los productos que siguen disponibles. Revisá tu carrito antes de confirmar.')
      navigate('/checkout')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos preparar la recompra. Intentá de nuevo.')
    } finally {
      setReordering(null)
    }
  }

  return (
    <main>
      <StoreNav />
      <section className="mx-auto max-w-5xl px-5 pb-28 pt-28 md:px-8 md:pt-36">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Hola, {account.name.split(' ')[0]}</h1>
            <p className="mt-2 text-muted-foreground">
              {account.email} · {account.phone} · {account.city}
            </p>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-5 py-2.5 font-medium transition-colors hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>

        {error && <p role="alert" className="mt-6 text-destructive">{error}</p>}
        <section className="mt-12" aria-labelledby="orders-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">Seguimiento de compra</p>
              <h2 id="orders-heading" className="mt-1 font-display text-2xl font-bold">Mis pedidos</h2>
            </div>
            {!ordersLoading && orders.length > 0 && <p className="text-sm text-muted-foreground">{orders.length} {orders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}</p>}
          </div>
          {ordersLoading ? (
            <div className="mt-6 space-y-3" aria-busy="true" aria-label="Cargando pedidos">
              {[0, 1].map((item) => <div key={item} className="h-36 animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-border px-6 py-10 text-center">
              <PackageCheck className="mx-auto h-7 w-7 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-bold">Aún no tenés pedidos</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Cuando confirmés una compra con esta cuenta, podrás seguir su estado y volver a pedirla desde aquí.</p>
              <Link to="/tienda" className="mt-5 inline-block font-medium text-primary hover:underline">Explorar la carta</Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="rounded-lg border border-border p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg font-bold">Pedido {order.id}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Registrado el {shortDate(order.createdAt)}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{order.status}</span>
                  </div>
                  <ul className="mt-5 divide-y divide-border border-y border-border text-sm">
                    {order.items.map((item) => <li key={item.productId} className="flex items-center justify-between gap-4 py-3"><span>{item.quantity} × {item.productName}</span><span className="font-medium">{lps(item.unitPriceLps * item.quantity)}</span></li>)}
                  </ul>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <p><span className="font-medium text-foreground">Entrega:</span> {order.deliveryAddress ? `${order.deliveryAddress}${order.deliveryCity ? `, ${order.deliveryCity}` : ''}` : 'Por coordinar'}</p>
                    {order.deliveryNotes && <p><span className="font-medium text-foreground">Notas:</span> {order.deliveryNotes}</p>}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <p className="font-display text-lg font-bold">Total {lps(order.totalLps)}</p>
                    <button onClick={() => void handleReorder(order)} disabled={reordering === order.id} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-wait disabled:opacity-60"><RotateCcw className="h-4 w-4" /> {reordering === order.id ? 'Preparando…' : 'Volver a pedir'}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        {editing ? (
          <div className="mt-12 max-w-3xl">
            <h2 className="font-display text-2xl font-bold">Actualizar mis preferencias</h2>
            <div className="mt-8">
              <OnboardingQuiz
                initial={onboarding}
                submitting={submitting}
                onComplete={handleQuizComplete}
              />
            </div>
          </div>
        ) : onboarding || preferences ? (
          <>
            <div className="mt-12 rounded-lg border border-border p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold">Mis preferencias</h2>
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </button>
              </div>
              {onboarding ? (
                <dl className="mt-6 grid gap-5 md:grid-cols-2">
                  {onboardingSchema.questions[onboarding.profile].map(question => (
                    <div key={question.key}><dt className="text-sm text-muted-foreground">{question.question}</dt><dd className="mt-1 font-semibold">{onboarding.answers[question.key]}</dd></div>
                  ))}
                </dl>
              ) : preferences && <><p className="mt-4 text-sm text-muted-foreground">Conservamos tus preferencias anteriores. Al editar podrás elegir uno de los nuevos perfiles.</p><div className="mt-6 grid gap-5 md:grid-cols-2">
                <PreferenceChips label="Que busco" values={preferences.goals} />
                <PreferenceChips label="Como lo preparo" values={preferences.brewMethods} />
                <PreferenceChips label="Como lo tomo" values={preferences.drinkStyles} />
                <PreferenceChips label="Sabores" values={preferences.flavorFamilies} />
                <PreferenceChips label="Intensidad" values={[preferences.intensity]} />
                <PreferenceChips label="Presupuesto" values={[preferences.budget]} />
              </div></>}
            </div>
            <div className="mt-14">
              {onboarding && !isConsumer(onboarding.profile) ? <CommercialResult key={onboarding.updatedAt} profile={onboarding} onSubmit={async () => (await commercialService.submit(account.id, onboarding.profile)).id} /> : <RecommendationResult recommendations={recommendations} />}
            </div>
          </>
        ) : (
          <div className="mt-12 rounded-lg border border-border p-8 text-center">
            <h2 className="font-display text-2xl font-bold">Aun no conocemos tu gusto</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Elegí tu perfil y respondé las preguntas de tu recorrido para descubrir cafés afines a tus gustos.
            </p>
            <button
              onClick={() => setEditing(true)}
              className="mt-7 cursor-pointer rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-forest"
            >
              Descubrir mi café ideal
            </button>
          </div>
        )}

        {!editing && (
          <p className="mt-14 text-sm text-muted-foreground">
            Buscas algo distinto hoy?{' '}
            <Link to="/tienda" className="font-medium text-primary hover:underline">
              Explora toda la carta
            </Link>
          </p>
        )}
      </section>
      <StoreFooter />
    </main>
  )
}
