import { CommercialResult } from '../../components/store/CommercialResult'
import { commercialService } from '../../services'
import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import type { OnboardingProfile, Recommendation } from '../../types'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { catalogService } from '../../services'
import { isConsumer, recommendOnboarding } from '../../services/onboarding'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { OnboardingQuiz } from '../../components/store/OnboardingQuiz'
import { RecommendationResult } from '../../components/store/RecommendationResult'
import { Eye, EyeOff } from 'lucide-react'

// Registro publico: crear cuenta -> quiz de preferencias -> cafe recomendado.

type Phase = 'cuenta' | 'quiz' | 'resultado'

const FIELDS = [
  { name: 'nombre', label: 'Nombre completo', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Correo', type: 'email', autoComplete: 'email' },
  { name: 'telefono', label: 'Telefono', type: 'tel', autoComplete: 'tel' },
  { name: 'ciudad', label: 'Ciudad', type: 'text', autoComplete: 'address-level2' },
  { name: 'password', label: 'Contraseña', type: 'password', autoComplete: 'new-password' },
]

export function RegisterPage() {
  const { account, register, saveOnboarding } = useCustomerAuth()
  const [phase, setPhase] = useState<Phase>(account ? 'quiz' : 'cuenta')
  const [alreadyComplete] = useState(!!account?.onboarding)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Cuenta existente con preferencias completas: su lugar es /cuenta.
  if (alreadyComplete) return <Navigate to="/cuenta" replace />

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

  const handleQuizComplete = async (profile: OnboardingProfile) => {
    setSubmitting(true)
    setError(null)
    try {
      const products = isConsumer(profile.profile) ? await catalogService.getProducts(true) : []
      const recs = isConsumer(profile.profile) ? recommendOnboarding(profile, products) : []
      await saveOnboarding(profile, recs[0]?.product.id ?? null)
      setRecommendations(recs)
      setPhase('resultado')
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar tu perfil. Tus respuestas siguen aquí para reintentar.')
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
              Creá tu cuenta y contanos qué disfrutás. Tus respuestas nos ayudan a sugerirte un café.
            </p>
            <form onSubmit={handleRegister} className="mt-10 max-w-md space-y-5">
              {FIELDS.map((f) => (
                <div key={f.name}>
                  <label htmlFor={f.name} className="mb-1.5 block text-sm font-medium">
                    {f.label}
                  </label>
                  {f.name === 'password' ? (
                    <div className="relative">
                      <input id={f.name} name={f.name} type={showPassword ? 'text' : 'password'} required minLength={12} autoComplete={f.autoComplete} className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25" />
                      <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute inset-y-0 right-0 grid w-12 cursor-pointer place-items-center rounded-r-lg text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  ) : <input id={f.name} name={f.name} type={f.type} required autoComplete={f.autoComplete} className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25" />}
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
                  Iniciá sesión
                </Link>
              </p>
            </form>
          </>
        )}

        {phase === 'quiz' && (
          <>
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Tu perfil de café</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Elegí tu perfil y respondé las preguntas de tu recorrido para encontrar cafés afines a tus gustos.
            </p>
            <div className="mt-10">
              <OnboardingQuiz submitting={submitting} onComplete={handleQuizComplete} />
              {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
            </div>
          </>
        )}

        {phase === 'resultado' && (
          <>
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              Listo, {account?.name.split(' ')[0]}
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Guardamos tus respuestas. Este es el siguiente paso para tu perfil.
            </p>
            <div className="mt-10">
              {account?.onboarding && !isConsumer(account.onboarding.profile) ? <CommercialResult key={account.onboarding.updatedAt} profile={account.onboarding} onSubmit={async () => (await commercialService.submit(account.id, account.onboarding!.profile)).id} /> : <RecommendationResult recommendations={recommendations} />}
            </div>
          </>
        )}
      </section>
      <StoreFooter />
    </main>
  )
}
