import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { BrandMark } from '../../components/store/BrandMark'
import { IMG } from '../../data/images'

export function LoginPage() {
  const { login } = useAuth()
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
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-experience grid min-h-svh bg-forest-deep lg:grid-cols-[minmax(0,1fr)_46%]">
      <section className="login-panel relative flex min-h-svh flex-col justify-between overflow-hidden px-6 py-7 text-forest-foreground sm:px-12 sm:py-10 lg:px-[clamp(3rem,8vw,9rem)]">
        <div className="login-panel-orbit login-panel-orbit-one" aria-hidden="true" />
        <div className="login-panel-orbit login-panel-orbit-two" aria-hidden="true" />
        <Link to="/" className="relative z-10 w-fit"><BrandMark dark /></Link>
        <div className="relative z-10 my-auto max-w-md py-14">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-forest-foreground/20 bg-forest-foreground/10 px-3 py-1.5 text-xs font-medium tracking-wide">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Acceso del equipo
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.035em] sm:text-5xl">Que cada detalle llegue a la taza.</h1>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-7 text-forest-foreground/78">
            Ingresá al espacio de operación de Directo Cafe para atender pedidos, inventario y clientes.
          </p>
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">Correo de trabajo</label>
            <div className="login-field"><Mail aria-hidden="true" className="h-4 w-4" /><input id="email" name="email" type="email" required autoComplete="username" placeholder="nombre@directocafe.hn" /></div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="password" className="text-sm font-medium">Contraseña</label><Link to="/admin/forgot-password" className="text-sm font-medium text-accent transition-colors hover:text-forest-foreground">¿Olvidaste tu contraseña?</Link></div>
            <div className="login-field"><LockKeyhole aria-hidden="true" className="h-4 w-4" /><input id="password" name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" placeholder="Tu contraseña" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          </div>
          {error && <p role="alert" className="rounded-lg bg-destructive/15 px-3 py-2 text-sm font-medium text-red-100">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="login-submit group w-full rounded-xl bg-accent py-3.5 font-semibold text-forest-deep transition-colors duration-200 hover:bg-forest-foreground disabled:opacity-60"
          >
            <span>{loading ? 'Verificando...' : 'Entrar al portal'}</span><ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </form>
        </div>
        <p className="relative z-10 text-xs text-forest-foreground/55">Acceso protegido · Directo Cafe, Honduras</p>
      </section>
      <aside className="login-photo relative hidden min-h-svh overflow-hidden lg:block">
        <img src={IMG.beansSack} alt="Granos de café durante una sesión de catación" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-forest-deep/35" />
        <div className="absolute inset-x-8 bottom-8 border border-white/25 bg-forest-deep/80 p-5 text-forest-foreground backdrop-blur-sm">
          <p className="font-display text-2xl font-bold">Operación con origen.</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-forest-foreground/75">Inventario, calidad y atención conectados para cuidar cada pedido.</p>
        </div>
      </aside>
    </main>
  )
}
