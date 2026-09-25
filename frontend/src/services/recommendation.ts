import type {
  Product,
  PreferenceProfile,
  Recommendation,
  FlavorFamily,
  BrewMethod,
  DrinkStyle,
  RoastLevel,
  Intensity,
} from '../types'
import { lps } from '../lib/format'

// =============================================================================
// Motor de recomendacion: cruza el perfil de preferencias del cliente con los
// atributos de calidad del catalogo y devuelve el mejor match con razones.
// Modulo puro (sin estado) para poder testearlo y moverlo al backend tal cual.
// TODO(backend .NET 10): POST /api/recommendations — misma logica en C#.
// =============================================================================

const WEIGHTS = {
  intensity: 25,
  flavor: 30,
  brew: 20,
  style: 10,
  budget: 15,
  goals: 5,
}
const MAX_SCORE = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const FAMILY_KEYWORDS: Record<FlavorFamily, string[]> = {
  'Chocolate y nuez': ['chocolate', 'cacao', 'nuez', 'almendra'],
  'Frutal y tropical': ['maracuya', 'naranja', 'durazno', 'mango', 'pina', 'tropical'],
  'Floral y te': ['jazmin', 'flor', 'bergamota', 'te blanco', 'te verde'],
  'Caramelo y panela': ['caramelo', 'panela', 'miel', 'azucar'],
  'Vino y frutos rojos': ['vino', 'fresa', 'cereza', 'frutos rojos', 'mora'],
}

const INTENSITY_ROAST: Record<Intensity, RoastLevel> = {
  Suave: 'Claro',
  Balanceado: 'Medio',
  Intenso: 'Oscuro',
}

const INTENSITY_PHRASE: Record<Intensity, string> = {
  Suave: 'suave y aromatico',
  Balanceado: 'balanceado',
  Intenso: 'fuerte y con cuerpo',
}

const ROAST_ORDER: RoastLevel[] = ['Claro', 'Medio', 'Oscuro']

// Afinidad metodo de preparacion -> tueste (0 a 1).
const BREW_ROAST_AFFINITY: Record<BrewMethod, Partial<Record<RoastLevel, number>>> = {
  Espresso: { Oscuro: 1, Medio: 0.5 },
  'Prensa francesa': { Medio: 1, Claro: 0.6 },
  'V60 o chorreado': { Claro: 1, Medio: 0.5 },
  'Cafetera de goteo': { Medio: 1, Oscuro: 0.5 },
  'Cold brew': { Medio: 0.6, Oscuro: 0.6, Claro: 0.3 },
}

const BREW_LABELS: Record<BrewMethod, string> = {
  Espresso: 'espresso',
  'Prensa francesa': 'prensa francesa',
  'V60 o chorreado': 'V60 y chorreado',
  'Cafetera de goteo': 'cafetera de goteo',
  'Cold brew': 'cold brew',
}

function flavorScore(profile: PreferenceProfile, product: Product) {
  if (profile.flavorFamilies.length === 0) return { score: 0, matchedNotes: [] as string[] }
  const notes = product.quality.notes
  const matchedNotes = new Set<string>()
  let matchedFamilies = 0
  for (const family of profile.flavorFamilies) {
    const hits = notes.filter((note) => FAMILY_KEYWORDS[family].some((kw) => norm(note).includes(kw)))
    if (hits.length > 0) {
      matchedFamilies++
      hits.forEach((h) => matchedNotes.add(h))
    }
  }
  return {
    score: (matchedFamilies / profile.flavorFamilies.length) * WEIGHTS.flavor,
    matchedNotes: [...matchedNotes],
  }
}

function brewScore(profile: PreferenceProfile, product: Product) {
  let best = 0
  let bestMethod: BrewMethod | null = null
  for (const method of profile.brewMethods) {
    let affinity = BREW_ROAST_AFFINITY[method][product.roast] ?? 0
    // El cold brew premia los procesos frutales (Natural) sobre el tueste.
    if (method === 'Cold brew' && product.process === 'Natural') affinity = 1
    if (affinity > best) {
      best = affinity
      bestMethod = method
    }
  }
  return { score: best * WEIGHTS.brew, bestMethod, full: best === 1 }
}

function styleScore(profile: PreferenceProfile, product: Product) {
  let best = 0
  let bestStyle: DrinkStyle | null = null
  for (const style of profile.drinkStyles) {
    let affinity = 0
    if (style === 'Con leche') affinity = product.roast === 'Oscuro' ? 1 : product.roast === 'Medio' ? 0.6 : 0.2
    if (style === 'Solo (negro)') affinity = product.quality.cuppingScore >= 87 ? 1 : 0.5
    if (style === 'Frio') affinity = product.process === 'Natural' ? 1 : product.process === 'Honey' ? 0.6 : 0.3
    if (affinity > best) {
      best = affinity
      bestStyle = style
    }
  }
  return { score: best * WEIGHTS.style, bestStyle, full: best === 1 }
}

function budgetScore(profile: PreferenceProfile, product: Product) {
  const price = product.priceLps
  const within =
    profile.budget === 'Sin limite' ||
    (profile.budget === 'Hasta L400' && price <= 400) ||
    (profile.budget === 'L400 a L600' && price <= 600)
  return { score: within ? WEIGHTS.budget : 0, within }
}

function goalsScore(profile: PreferenceProfile, product: Product) {
  if (profile.goals.length === 0) return 0
  let matched = 0
  for (const goal of profile.goals) {
    if (goal === 'Café de especialidad' && product.quality.grade === 'Premium') matched++
    if (goal === 'Café de todos los días' && product.presentationGrams >= 454 && product.priceLps <= 400) matched++
    if (goal === 'Regalar café' && product.quality.cuppingScore >= 88) matched++
    if (goal === 'Comprar para mi negocio' && product.stock >= 60) matched++
  }
  return (matched / profile.goals.length) * WEIGHTS.goals
}

function scoreProduct(profile: PreferenceProfile, product: Product): Recommendation {
  const reasons: string[] = []
  let score = 0

  const targetRoast = INTENSITY_ROAST[profile.intensity]
  const distance = Math.abs(ROAST_ORDER.indexOf(product.roast) - ROAST_ORDER.indexOf(targetRoast))
  const intensityPts = distance === 0 ? WEIGHTS.intensity : distance === 1 ? 10 : 0
  score += intensityPts
  if (distance === 0) {
    reasons.push(`Tueste ${product.roast.toLowerCase()}, ${INTENSITY_PHRASE[profile.intensity]} como lo pedis`)
  }

  const flavor = flavorScore(profile, product)
  score += flavor.score
  if (flavor.matchedNotes.length > 0) {
    reasons.push(`Notas de ${flavor.matchedNotes.map((n) => n.toLowerCase()).join(', ')}, justo en tu perfil de sabor`)
  }

  const brew = brewScore(profile, product)
  score += brew.score
  if (brew.full && brew.bestMethod) {
    reasons.push(`Rinde al maximo en ${BREW_LABELS[brew.bestMethod]}, tu metodo de preparacion`)
  }

  const style = styleScore(profile, product)
  score += style.score
  if (style.full && style.bestStyle === 'Con leche') reasons.push('Cuerpo pesado que no se pierde con la leche')
  if (style.full && style.bestStyle === 'Solo (negro)') {
    reasons.push(`Taza de ${product.quality.cuppingScore.toFixed(1)} puntos para tomarlo solo`)
  }
  if (style.full && style.bestStyle === 'Frio') reasons.push('Proceso natural, dulce y frutal para bebidas frias')

  const budget = budgetScore(profile, product)
  score += budget.score
  if (budget.within && profile.budget !== 'Sin limite') {
    reasons.push(`Dentro de tu presupuesto: ${lps(product.priceLps)}`)
  }

  score += goalsScore(profile, product)

  return {
    product,
    matchPct: Math.round((score / MAX_SCORE) * 100),
    reasons: reasons.slice(0, 4),
  }
}

export const recommendationService = {
  /** Devuelve el mejor match primero, con hasta 2 alternativas. */
  recommend(profile: PreferenceProfile, products: Product[]): Recommendation[] {
    return products
      .filter((p) => p.active && p.stock > 0)
      .map((p) => scoreProduct(profile, p))
      .sort((a, b) => b.matchPct - a.matchPct || b.product.quality.cuppingScore - a.product.quality.cuppingScore)
      .slice(0, 3)
  },
}
