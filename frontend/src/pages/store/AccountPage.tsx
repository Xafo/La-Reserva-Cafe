import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Pencil } from 'lucide-react'
import type { PreferenceProfile, Recommendation } from '../../types'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { catalogService, recommendationService } from '../../services'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { PreferenceQuiz } from '../../components/store/PreferenceQuiz'
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
  const { account, logout, savePreferences } = useCustomerAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [submitting, setSubmitting] = useState(false)

  const preferences = account?.preferences ?? null

  useEffect(() => {
    if (!preferences) return
    let cancelled = false
    catalogService.getProducts(true).then((products) => {
      if (!cancelled) setRecommendations(recommendationService.recommend(preferences, products))
    })
    return () => {
      cancelled = true
    }
  }, [preferences])

  if (!account) return null // CustomerRoute redirige a /ingresar

  const handleQuizComplete = async (profile: PreferenceProfile) => {
    setSubmitting(true)
    try {
      const products = await catalogService.getProducts(true)
      const recs = recommendationService.recommend(profile, products)
      await savePreferences(profile, recs[0]?.product.id ?? null)
      setRecommendations(recs)
      setEditing(false)
      window.scrollTo(0, 0)
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

        {editing ? (
          <div className="mt-12 max-w-3xl">
            <h2 className="font-display text-2xl font-bold">Actualizar mis preferencias</h2>
            <div className="mt-8">
              <PreferenceQuiz
                initial={preferences}
                submitLabel="Recalcular mi cafe"
                submitting={submitting}
                onComplete={handleQuizComplete}
              />
            </div>
          </div>
        ) : preferences ? (
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
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <PreferenceChips label="Que busco" values={preferences.goals} />
                <PreferenceChips label="Como lo preparo" values={preferences.brewMethods} />
                <PreferenceChips label="Como lo tomo" values={preferences.drinkStyles} />
                <PreferenceChips label="Sabores" values={preferences.flavorFamilies} />
                <PreferenceChips label="Intensidad" values={[preferences.intensity]} />
                <PreferenceChips label="Presupuesto" values={[preferences.budget]} />
              </div>
            </div>
            <div className="mt-14">
              <RecommendationResult recommendations={recommendations} />
            </div>
          </>
        ) : (
          <div className="mt-12 rounded-lg border border-border p-8 text-center">
            <h2 className="font-display text-2xl font-bold">Aun no conocemos tu gusto</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Responde seis preguntas rapidas y te decimos cual de nuestros cafes es para vos.
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
