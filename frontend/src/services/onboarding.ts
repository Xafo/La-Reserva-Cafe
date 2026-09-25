import schema from '../../../shared/onboarding-v1.json' with { type: 'json' }
import type { ConsumerProfile, OnboardingProfileId, OnboardingProfile, Product, Recommendation } from '../types/index.ts'

export const onboardingSchema = schema
export const isConsumer = (value: string): value is ConsumerProfile => value === 'new' || value === 'enthusiast'
export const isProfile = (value: string): value is OnboardingProfileId => schema.profiles.some(p => p.value === value && p.enabled)
export function validOnboarding(value: OnboardingProfile): boolean {
  if (value.version !== 1 || !isProfile(value.profile) || !value.answers) return false
  const questions = schema.questions[value.profile]
  return Object.keys(value.answers).length === questions.length && questions.every(q => q.options.some(o => o.value === value.answers[q.key]))
}
const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Reglas editoriales versionadas. Afinidad ponderada, no probabilidad de satisfacción. */
export function recommendOnboarding(profile: OnboardingProfile, products: Product[]): Recommendation[] {
  if (!validOnboarding(profile) || !isConsumer(profile.profile)) throw new Error('Completá las preguntas de tu perfil con opciones válidas.')
  const a = profile.answers
  const novice = profile.profile === 'new'
  const flavor = norm(novice ? a.n2 : a.a3)
  const floral = flavor.includes('floral')
  const fruity = flavor.includes('frut')
  const fermented = flavor.includes('ferment')
  const intense = flavor.includes('intens')
  const coarse = !novice && ['Grueso', 'Extra grueso'].includes(a.a4)
  let target: string | null = null
  // La condición explícita de fermentado/molienda gruesa precede a floral.
  if (!novice && (fermented || coarse)) target = 'miguel angel'
  else if (!novice && flavor.includes('achocolatado') && a.a5 === 'Espresso') target = 'roberto lopez'
  else if (floral) target = 'carolina claros'
  else if (novice && flavor.includes('dulces') && a.n3 === 'Equilibrado') target = 'la reserva cafe blend'

  const roast = novice
    ? ({ 'Suave y ligero': 'Claro', Equilibrado: 'Medio', 'Fuerte e intenso': 'Oscuro', 'Complejo y memorable': 'Medio' }[a.n3])
    : ({ 'Tueste claro': 'Claro', 'Tueste medio': 'Medio', 'Tueste oscuro': 'Oscuro' }[a.a1])
  const keywords = floral ? ['flor', 'jazmin', 'te blanco', 'bergamota']
    : fruity ? ['frut', 'lima', 'citr', 'pina', 'mango', 'durazno']
      : fermented ? ['vino', 'espec', 'ferment', 'frutos rojos']
        : intense ? ['cacao', 'nuez', 'chocolate'] : ['chocolate', 'cacao', 'caramelo', 'panela', 'miel', 'nuez']
  const available = products.filter(p => p.active && p.stock > 0)
  const targetAvailable = target !== null && available.some(p => norm(p.name) === target)
  const method = novice ? a.n4 : a.a5
  const methodRoasts = method.includes('Espresso') ? ['Oscuro', 'Medio']
    : method.includes('V60') || method === 'Método manual' ? ['Claro', 'Medio'] : ['Medio', 'Claro']

  return available.map(product => {
    const curated = target !== null && norm(product.name) === target
    const sensory = curated || product.quality.notes.some(note => keywords.some(k => norm(note).includes(k)))
    const roastMatch = !roast || product.roast === roast
    const methodMatch = method === 'Quiero aprender' || methodRoasts.includes(product.roast)
    const reasons: string[] = []
    if (curated) reasons.push(`Las reglas de este recorrido asocian tus respuestas con ${product.name}.`)
    else if (sensory) reasons.push(`Sus notas de ${product.quality.notes.join(', ').toLowerCase()} se acercan al sabor que elegiste.`)
    if (roastMatch && roast) reasons.push(`Tueste ${product.roast.toLowerCase()}, acorde con tu preferencia de intensidad o tueste.`)
    if (methodMatch) reasons.push(method === 'Quiero aprender' ? 'Una opción para comenzar a explorar métodos.' : `Afinidad orientativa con ${method.toLowerCase()}.`)
    if (target && !targetAvailable) reasons.unshift('El café previsto por esta regla no está disponible; esta es una alternativa del catálogo.')
    if (novice && a.n5 === 'Un regalo especial' && curated && floral) reasons.push('El perfil floral coincide con tu intención de regalar un café delicado.')
    if (!reasons.length) reasons.push('Opción disponible para explorar; sus características no coinciden con tus preferencias principales.')
    const score = (sensory ? 60 : 0) + (roastMatch ? 25 : 0) + (methodMatch ? 15 : 0)
    return { product, matchPct: score, reasons, curated }
  }).sort((a, b) => Number(b.curated) - Number(a.curated) || b.matchPct - a.matchPct || a.product.id.localeCompare(b.product.id))
    .slice(0, 3).map(({ product, matchPct, reasons }) => ({ product, matchPct, reasons }))
}
