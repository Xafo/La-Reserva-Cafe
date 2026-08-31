import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import type { PreferenceProfile, Recommendation } from '../../types'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { catalogService, recommendationService } from '../../services'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { PreferenceQuiz } from '../../components/store/PreferenceQuiz'
import { RecommendationResult } from '../../components/store/RecommendationResult'

// Registro publico: crear cuenta -> quiz de preferencias -> cafe recomendado.

type Phase = 'cuenta' | 'quiz' | 'resultado'

const FIELDS = [
  { name: 'nombre', label: 'Nombre completo', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Correo', type: 'email', autoComplete: 'email' },
  { name: 'telefono', label: 'Telefono', type: 'tel', autoComplete: 'tel' },
  { name: 'ciudad', label: 'Ciudad', type: 'text', autoComplete: 'address-level2' },
  { name: 'password', label: 'Contrasena', type: 'password', autoComplete: 'new-password' },
]

export function RegisterPage() {
  const { account, register, savePreferences } = useCustomerAuth()
  const [phase, setPhase] = useState<Phase>(account ? 'quiz' : 'cuenta')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Cuenta existente con preferencias completas: su lugar es /cuenta.
  if (account?.preferences && phase !== 'resultado') return <Navigate to="/cuenta" replace />

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setSubmitting(true)
    setError(null)
    try {
      await register({
        name: String(data.get('nombre')),
        email: String(data.get('email')),
        password: String(data.get('password')),
        phone: String(data.get('telefono')),
        city: String(data.get('ciudad')),
      })
      setPhase('quiz')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear tu cuenta. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuizComplete = async (profile: PreferenceProfile) => {
    setSubmitting(true)
    try {
      const products = await catalogService.getProducts(true)
      const recs = recommendationService.recommend(profile, products)
      await savePreferences(profile, recs[0]?.product.id ?? null)
      setRecommendations(recs)
      setPhase('resultado')
      window.scrollTo(0, 0)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <StoreNav />
      <section className="mx-auto max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-36">
        {phase === 'cuenta' && (
          <>
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Crear cuenta</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Contanos que buscas y te decimos exactamente que cafe es para vos. Toma menos de un minuto.
            </p>
            <form onSubmit={handleRegister} className="mt-10 max-w-md space-y-5">
              {FIELDS.map((f) => (
                <div key={f.name}>
                  <label htmlFor={f.name} className="mb-1.5 block text-sm font-medium">
                    {f.label}
                  </label>
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    required
                    minLength={f.type === 'password' ? 12 : undefined}
                    autoComplete={f.autoComplete}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25"
                  />
                </div>
              ))}
              {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full cursor-pointer rounded-full bg-primary py-4 font-semibold text-primary-foreground transition-colors hover:bg-forest disabled:opacity-60"
              >
                {submitting ? 'Creando cuenta...' : 'Continuar'}
              </button>
              <p className="text-sm text-muted-foreground">
                Ya tenes cuenta?{' '}
                <Link to="/ingresar" className="font-medium text-primary hover:underline">
                  Inicia sesion
                </Link>
              </p>
            </form>
          </>
        )}

        {phase === 'quiz' && (
          <>
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Tu perfil de cafe</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Seis preguntas rapidas para encontrar la opcion mas exacta de nuestra carta.
            </p>
            <div className="mt-10">
              <PreferenceQuiz submitting={submitting} onComplete={handleQuizComplete} />
            </div>
          </>
        )}

        {phase === 'resultado' && (
          <>
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              Listo, {account?.name.split(' ')[0]}
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Cruzamos tus respuestas con los perfiles de taza de nuestra carta. Este es tu match.
            </p>
            <div className="mt-10">
              <RecommendationResult recommendations={recommendations} />
            </div>
          </>
        )}
      </section>
      <StoreFooter />
    </main>
  )
}
