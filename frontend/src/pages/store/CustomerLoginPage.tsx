import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'

// Inicio de sesion de clientes de la tienda (los usuarios del equipo entran
// por /admin/login).

export function CustomerLoginPage() {
  const { login } = useCustomerAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setLoading(true)
    setError(null)
    try {
      await login(String(data.get('email')), String(data.get('password')))
      navigate('/cuenta')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <StoreNav />
      <section className="mx-auto max-w-md px-5 pb-28 pt-28 md:pt-36">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Iniciar sesion</h1>
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
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Contrasena</label>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
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
              Crea la tuya y descubri tu cafe ideal
            </Link>
          </p>
        </form>
      </section>
      <StoreFooter />
    </main>
  )
}
