import { CommercialResult } from '../../components/store/CommercialResult'
import { useState } from 'react'
import scenario from '../../../../scenarios/directo-cafe/demo-v1.json'
import type { OnboardingProfile, Product } from '../../types'
import { OnboardingQuiz } from '../../components/store/OnboardingQuiz'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { isConsumer, recommendOnboarding, validOnboarding } from '../../services/onboarding'
import { lps } from '../../lib/format'

const KEY = 'directo-cafe:demo:onboarding:v1'
function readSaved(): OnboardingProfile | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? 'null') as OnboardingProfile | null
    return value && validOnboarding(value) ? value : null
  } catch { return null }
}

export default function OnboardingDemoPage() {
  const [saved, setSaved] = useState(readSaved)
  const [editing, setEditing] = useState(!saved)
  const [error, setError] = useState<string | null>(null)
  const recommendations = saved && isConsumer(saved.profile) ? recommendOnboarding(saved, scenario.products as Product[]) : []
  return (
    <main>
      <StoreNav />
      <section className="mx-auto max-w-3xl px-5 pb-16 pt-32 md:pb-24 md:pt-36">
        <p className="rounded-lg bg-accent/20 p-4 text-sm font-semibold">Demostración · Siete cafés de prueba. Sin cobros, pedidos ni mensajes reales.</p>
        <h1 className="mt-8 font-display text-3xl font-extrabold md:text-4xl">Descubrí tu perfil de café</h1>
        <p className="mt-3 text-muted-foreground">Tus respuestas se guardan solo en este navegador, separadas de tu cuenta.</p>
        {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
        <div className="mt-10">
          {editing ? <OnboardingQuiz initial={saved} onComplete={value => {
            try {
              localStorage.setItem(KEY, JSON.stringify(value))
              setSaved(value); setEditing(false); setError(null)
            } catch { setError('El navegador no permitió guardar. Tus respuestas siguen aquí; habilitá almacenamiento y reintentá.') }
          }} /> : <>
            {saved && !isConsumer(saved.profile) ? <CommercialResult key={saved.updatedAt} profile={saved} demo onSubmit={async () => {
              const reference = `demo-${saved.profile}`
              localStorage.setItem(`directo-cafe:demo:request:${saved.profile}`, JSON.stringify({ reference, onboarding: saved, status: 'Pendiente de revisión', externalMessageSent: false }))
              return reference
            }}>
              <details className="mt-6 border-y border-border py-4"><summary className="cursor-pointer font-semibold">Ver condiciones del escenario</summary>
                <p className="mt-3 text-sm">Supuestos de demostración; no constituyen una oferta comercial.</p>
                {saved.profile === 'business' && <p className="mt-3 text-sm">Presupuesto interpretado como USD solo para este escenario. Abastecimiento según frecuencia elegida, sin suscripción automática ni conversión a lempiras.</p>}
                {saved.profile === 'cafe' && <p className="mt-3 text-sm">Mínimo 5 kg. Descuentos de escenario: 5% desde 5 kg, 8% desde 15 kg y 10% desde 30 kg, sobre Blend, Espresso de Casa y Roberto López. Se requiere cantidad exacta para cotizar; no se aplica descuento por elegir un rango.</p>}
                {saved.profile === 'producer' && <p className="mt-3 text-sm">Candidatura para fase 2. No se habilitan ventas ni exención de comisiones.</p>}
                <p className="mt-3 break-words text-sm">Contacto simulado: {scenario.contacts[saved.profile === 'business' ? 'advisor' : saved.profile === 'cafe' ? 'roaster' : 'sellerSupport'].email}. No operativo.</p>
              </details>
            </CommercialResult> : <><h2 className="font-display text-2xl font-bold">Tu recomendación de demostración</h2>
            {recommendations.map((recommendation, index) => (
              <article key={recommendation.product.id} className="mt-6 border-t border-border py-6">
                <p className="text-sm text-primary">{index === 0 ? 'Primera sugerencia' : 'Alternativa'} · {recommendation.matchPct}% de afinidad orientativa</p>
                <h3 className="mt-2 font-display text-2xl font-bold">{recommendation.product.name}</h3>
                <p className="mt-2">{recommendation.product.quality.notes.join(' · ')} · {lps(recommendation.product.priceLps)} / 340 g</p>
                <p className="mt-3 text-sm text-muted-foreground">{recommendation.product.description}</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{recommendation.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
              </article>
            ))}
            <p className="mt-3 text-sm text-muted-foreground">La afinidad refleja reglas de sabor, tueste y método. No es una probabilidad ni una garantía de satisfacción.</p></>}
            <button type="button" onClick={() => setEditing(true)} className="mt-6 cursor-pointer rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Editar respuestas o cambiar perfil</button>
          </>}
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}
