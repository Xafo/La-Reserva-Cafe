import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { Eye, EyeOff } from 'lucide-react'

// Inicio de sesion de clientes de la tienda (los usuarios del equipo entran
// por /admin/login).

export function CustomerLoginPage() {
  const { login } = useCustomerAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setLoading(true)
    setError(null)
    try {
      await login(String(data.get('email')), String(data.get('password')))
      navigate('/cuenta')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <StoreNav />
      <section className="mx-auto max-w-md px-5 pb-28 pt-28 md:pt-36">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Iniciar sesión</h1>
        <p className="mt-3 text-muted-foreground">
          Accede a tus preferencias y recomendaciones guardadas.
        </p>
        <form onSubmit={handleSubmit} className="mt-9 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Correo</label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Contraseña</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute inset-y-0 right-0 grid w-12 cursor-pointer place-items-center rounded-r-lg text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full cursor-pointer rounded-full bg-primary py-4 font-semibold text-primary-foreground transition-colors hover:bg-forest disabled:opacity-60"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
          <p className="text-sm text-muted-foreground">
            Aun no tenes cuenta?{' '}
            <Link to="/registro" className="font-medium text-primary hover:underline">
              Creá la tuya y descubrí tu café ideal
            </Link>
          </p>
        </form>
      </section>
      <StoreFooter />
    </main>
  )
}
