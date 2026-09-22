import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { recommendOnboarding, validOnboarding, onboardingSchema } from './onboarding.ts'
import type { OnboardingProfile, Product } from '../types/index.ts'
import { commercialSummary } from './commercial.ts'

const fixture = JSON.parse(await readFile(new URL('../../../scenarios/directo-cafe/demo-v1.json', import.meta.url), 'utf8'))
const products = fixture.products as Product[]
for (const id of ['business', 'cafe', 'producer'] as const) {
  test(`Recorrido comercial ${id}: resumen completo, sin recomendación sensorial`, () => {
    let combinations: Record<string, string>[] = [{}]
    for (const question of onboardingSchema.questions[id]) {
      combinations = combinations.flatMap(answers => question.options.map(option => ({ ...answers, [question.key]: option.value })))
    }
    for (const answers of combinations) {
      const value: OnboardingProfile = { version: 1, profile: id, answers, updatedAt: '2026-09-22T00:00:00Z' }
      assert.equal(validOnboarding(value), true)
      assert.equal(commercialSummary(value).details.length, 4)
      assert.deepEqual(commercialSummary(value).details.map(d => d.value), Object.values(answers))
      assert.throws(() => recommendOnboarding(value, products))
      assert.equal(validOnboarding({ ...value, answers: { ...answers, n1: 'Solo negro' } }), false)
    }
  })
}
for (const sample of fixture.cases.filter((value: { expected: { kind: string } }) => value.expected.kind === 'recommendation')) {
  test(`Ejemplo del PDF: ${sample.id}`, () => {
    const profile: OnboardingProfile = { version: 1, profile: sample.profile, answers: sample.answers, updatedAt: '2026-09-21T00:00:00Z' }
    assert.equal(validOnboarding(profile), true)
    assert.equal(recommendOnboarding(profile, products)[0].product.id, sample.expected.productId)
  })
}
const sample = fixture.cases[0]
const profile: OnboardingProfile = { version: 1, profile: sample.profile, answers: sample.answers, updatedAt: '2026-09-21T00:00:00Z' }
test('Excluye agotados e inactivos y explica alternativa', () => {
  const changed = products.map(product => ({ ...product, stock: product.id === 'demo-carolina-claros' ? 0 : product.stock, active: product.id !== 'p-blend' }))
  const result = recommendOnboarding(profile, changed)
  assert.ok(result.length > 0)
  assert.ok(result.every(r => r.product.stock > 0 && r.product.active))
  assert.ok(result[0].reasons.some(r => r.includes('alternativa')))
})
test('Catálogo vacío y orden determinista', () => {
  assert.deepEqual(recommendOnboarding(profile, []), [])
  assert.deepEqual(recommendOnboarding(profile, products), recommendOnboarding(profile, [...products].reverse()))
})
test('Rechaza respuestas incompletas, ajenas, desconocidas y versión incorrecta', () => {
  assert.equal(validOnboarding({ ...profile, answers: { n1: 'Solo negro' } }), false)
  assert.equal(validOnboarding({ ...profile, answers: { ...profile.answers, a1: 'Tueste claro' } }), false)
  assert.equal(validOnboarding({ ...profile, answers: { ...profile.answers, n2: 'No existe' } }), false)
  assert.equal(validOnboarding({ ...profile, version: 2 } as unknown as OnboardingProfile), false)
})
test('Todas las combinaciones habilitadas producen resultados finitos y disponibles', () => {
  for (const id of ['new', 'enthusiast'] as const) {
    let combinations: Record<string, string>[] = [{}]
    for (const question of onboardingSchema.questions[id]) {
      combinations = combinations.flatMap(answers => question.options.map(option => ({ ...answers, [question.key]: option.value })))
    }
    for (const answers of combinations) {
      const result = recommendOnboarding({ version: 1, profile: id, answers, updatedAt: profile.updatedAt }, products)
      assert.ok(result.length > 0 && result.length <= 3)
      assert.ok(result.every(r => Number.isInteger(r.matchPct) && r.matchPct >= 0 && r.matchPct <= 100 && r.reasons.length > 0))
    }
  }
})
