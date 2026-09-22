import { CommercialResult } from '../../components/store/CommercialResult'
import { commercialService } from '../../services'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Pencil } from 'lucide-react'
import type { OnboardingProfile, Recommendation } from '../../types'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { catalogService, recommendationService } from '../../services'
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
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
            <LogOut className="h-4 w-4" /> Cerrar sesion
          </button>
        </div>

        {error && <p role="alert" className="mt-6 text-destructive">{error}</p>}
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
              Descubrir mi cafe ideal
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
