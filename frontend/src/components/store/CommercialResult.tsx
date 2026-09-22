import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { OnboardingProfile } from '../../types'
import { commercialSummary } from '../../services/commercial'

export function CommercialResult({ profile, onSubmit, demo = false, children }: {
  profile: OnboardingProfile
  onSubmit: () => Promise<string>
  demo?: boolean
  children?: ReactNode
}) {
  const summary = commercialSummary(profile)
  const [reference, setReference] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return <section aria-label="Resumen comercial">
    <h2 className="font-display text-2xl font-bold">{summary.title}</h2>
    <p className="mt-3 max-w-prose text-muted-foreground">{summary.description}</p>
    <dl className="mt-6 grid gap-5 border-y border-border py-6 sm:grid-cols-2">
      {summary.details.map(detail => <div key={detail.label}><dt className="text-sm text-muted-foreground">{detail.label}</dt><dd className="mt-1 font-semibold">{detail.value}</dd></div>)}
    </dl>
    <p className="mt-6 max-w-prose text-sm">{summary.conditions}</p>
    {children}
    <p className="mt-5 text-sm text-muted-foreground">{demo ? 'La solicitud se guardará solo en este navegador.' : 'Al confirmar, el equipo podrá consultar este resumen y los datos de contacto de tu cuenta.'} No se envían correos ni mensajes automáticamente.</p>
    <p className="mt-2 text-sm">Atención: {summary.role}.</p>
    {reference ? <p role="status" className="mt-6 rounded-lg bg-primary/10 p-4 break-words">{demo ? 'Solicitud simulada guardada.' : 'Solicitud registrada para revisión.'} Referencia: {reference}. No implica aprobación comercial.</p> : <button type="button" disabled={busy} onClick={async () => {
      setBusy(true); setError(null)
      try { setReference(await onSubmit()) }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'No pudimos registrar la solicitud. Reintentá.') }
      finally { setBusy(false) }
    }} className="mt-6 cursor-pointer rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50">{busy ? 'Guardando…' : summary.action}</button>}
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
    <div className="mt-5"><Link className="font-medium text-primary underline underline-offset-4" to={profile.profile === 'producer' ? '/origen' : '/tienda'}>{profile.profile === 'producer' ? 'Conocer el proyecto y sus etapas' : 'Ver catálogo disponible'}</Link></div>
  </section>
}
