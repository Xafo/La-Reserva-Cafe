import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BrandMark } from '../../components/store/BrandMark'
import { IMG } from '../../data/images'

export function LoginPage() {
  const { login } = useAuth()
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
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-svh lg:grid-cols-[1fr_44%]">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-24">
        <Link to="/" className="mb-12 w-fit"><BrandMark /></Link>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Portal interno</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acceso para el equipo de Directo Cafe.
        </p>
        <form onSubmit={handleSubmit} className="mt-9 max-w-sm space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Correo</label>
            <input
              id="email" name="email" type="email" required autoComplete="username"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Contrasena</label>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
            <Link to="/admin/forgot-password" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
          </div>
          {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors duration-150 hover:bg-forest disabled:opacity-60"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
      <div className="relative hidden lg:block">
        <img src={IMG.beansSack} alt="Granos de cafe en saco de yute" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-forest-deep/55" />
      </div>
    </main>
  )
}
