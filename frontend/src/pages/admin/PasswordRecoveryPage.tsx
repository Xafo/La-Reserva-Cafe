import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '../../components/store/BrandMark'
import { authService } from '../../services'

export function PasswordRecoveryPage({ reset = false }: { reset?: boolean }) {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (reset && window.location.hash) window.history.replaceState(null, '', window.location.pathname)
  }, [reset])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') ?? '')
    setError('')
    if (reset && password !== data.get('confirmation')) {
      setError('Las contraseñas no coinciden. Revisa ambos campos.')
      return
    }
    setBusy(true)
    try {
      if (reset) await authService.resetPassword(token, password)
      else await authService.requestPasswordReset(String(data.get('email')))
      setDone(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos procesar la solicitud. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/25'
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-10 inline-block"><BrandMark /></Link>
        <h1 className="font-display text-3xl font-bold">{reset ? 'Elige una nueva contraseña' : 'Recupera tu acceso'}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {reset ? 'Usa al menos 12 caracteres. Al guardar, tendrás que volver a iniciar sesión.' : 'Ingresa el correo de tu cuenta del equipo. Te enviaremos un enlace válido por 30 minutos.'}
        </p>
        {done ? (
          <p role="status" className="mt-6 rounded-lg bg-primary/10 p-4 text-sm text-primary">
            {reset ? 'Tu contraseña se actualizó. Ya puedes iniciar sesión.' : 'Si hay una cuenta activa con ese correo, recibirás las instrucciones. Revisa también la carpeta de spam.'}
          </p>
        ) : reset && !token ? (
          <p role="alert" className="mt-6 text-sm text-destructive">Este enlace no contiene un código válido. Solicita uno nuevo.</p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            {reset ? <>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">Nueva contraseña</label>
                <input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="confirmation" className="mb-2 block text-sm font-medium">Confirmar contraseña</label>
                <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={12} required className={inputClass} />
              </div>
            </> : (
              <div>
                <label htmlFor="recovery-email" className="mb-2 block text-sm font-medium">Correo del equipo</label>
                <input id="recovery-email" name="email" type="email" autoComplete="email" required className={inputClass} />
              </div>
            )}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button disabled={busy} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60">
              {busy ? 'Procesando…' : reset ? 'Guardar contraseña' : 'Enviar enlace'}
            </button>
          </form>
        )}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-primary">
          <Link to="/admin/login" className="hover:underline">Volver al inicio de sesión</Link>
          {reset && !done && <Link to="/admin/forgot-password" className="hover:underline">Solicitar otro enlace</Link>}
        </div>
      </div>
    </main>
  )
}
