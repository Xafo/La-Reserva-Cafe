import type { OnboardingProfile } from '../types/index.ts'
import { isConsumer, validOnboarding, onboardingSchema } from './onboarding.ts'

export function commercialSummary(profile: OnboardingProfile) {
  if (!validOnboarding(profile) || isConsumer(profile.profile)) throw new Error('Se requiere un perfil comercial completo.')
  const content = {
    business: { title: 'Tu plan corporativo comienza aquí', action: 'Solicitar asesoría', role: 'Asesor comercial',
      description: 'Preparamos tu resumen para evaluar un abastecimiento acorde al tamaño de tu equipo.',
      conditions: 'Entrega programada y facturación mensual son opciones sujetas a propuesta y aprobación. El presupuesto conserva los rangos $ del formulario; confirmaremos la moneda antes de cotizar.' },
    cafe: { title: 'Una propuesta para tu cafetería', action: 'Solicitar contacto con tostador', role: 'Equipo de tostaduría',
      description: 'Tu volumen, métodos y prioridades orientan la propuesta mayorista.',
      conditions: 'Precios por volumen, entrega prioritaria y soporte barista se evalúan con el equipo. Pedir exclusividad no la concede automáticamente.' },
    producer: { title: 'Tu interés en la futura apertura', action: 'Registrar candidatura', role: 'Equipo de productores',
      description: 'Queremos conocer tu operación para la futura incorporación de productores y tostadurías.',
      conditions: 'Esta candidatura no habilita ventas. La apertura comienza con productores de Honduras; otros países quedan como interés futuro. Comisiones, visibilidad y apoyo de marca se definirán antes de incorporar vendedores.' },
  }[profile.profile as 'business' | 'cafe' | 'producer']
  return { ...content, details: onboardingSchema.questions[profile.profile].map(q => ({ label: q.question, value: profile.answers[q.key] })) }
}
