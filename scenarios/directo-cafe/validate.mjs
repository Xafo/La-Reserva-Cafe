import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'

const scenario = JSON.parse(await readFile(new URL('./demo-v1.json', import.meta.url), 'utf8'))
assert.equal(scenario.mode, 'demo')
assert.equal(scenario.approvedForProduction, false)
assert.equal(scenario.products.length, 7)
const ids = new Set(scenario.products.map(p => p.id))
assert.equal(ids.size, 7, 'IDs de café duplicados')
for (const p of scenario.products) {
  assert.ok(p.name && p.description && p.imageAlt)
  assert.ok(p.priceLps > 0 && p.presentationGrams > 0)
  assert.ok(Number.isInteger(p.stock) && p.stock >= 0)
  assert.ok(['Lavado', 'Honey', 'Natural'].includes(p.process))
  assert.ok(['Claro', 'Medio', 'Oscuro'].includes(p.roast))
  assert.ok(p.quality.notes.length > 0 && p.quality.cuppingScore <= 100)
  assert.ok(Number.isFinite(Date.parse(p.quality.harvestDate)))
  assert.ok(p.imageUrl.startsWith('/marca/') && !p.imageUrl.includes('..'))
  await access(new URL(`../../frontend/public${p.imageUrl}`, import.meta.url))
}
assert.equal(scenario.contacts.sendExternally, false)
for (const role of ['advisor', 'roaster', 'sellerSupport']) {
  assert.ok(scenario.contacts[role].email.endsWith('@directocafe.example'))
  assert.equal(scenario.contacts[role].phone, null)
}
assert.equal(scenario.commercial.payment.chargeEnabled, false)
assert.equal(scenario.commercial.producer.sellingEnabled, false)
assert.equal(scenario.commercial.currency, 'HNL')
assert.equal(scenario.commercial.corporateBudgetCurrency, 'USD')
const profiles = { new: ['n', 5], enthusiast: ['a', 5], business: ['e', 4], cafe: ['c', 4], producer: ['p', 4] }
assert.equal(new Set(scenario.cases.map(c => c.profile)).size, 5)
for (const c of scenario.cases) {
  const [prefix, count] = profiles[c.profile]
  assert.deepEqual(Object.keys(c.answers).sort(), Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`).sort())
  assert.ok(Object.values(c.answers).every(v => typeof v === 'string' && v.length > 0))
  if (c.expected.kind === 'recommendation') assert.ok(ids.has(c.expected.productId))
  else {
    assert.equal(c.expected.calculateFlavorMatch, false)
    assert.ok(scenario.contacts[c.expected.contactRole])
  }
}
const wholesale = scenario.commercial.wholesale
wholesale.scopeProductIds.forEach(id => assert.ok(ids.has(id)))
assert.equal(wholesale.tiers[0].minKg, wholesale.minimumKg)
wholesale.tiers.forEach((tier, index) => {
  assert.ok(tier.discountPct >= 0 && tier.discountPct < 100)
  if (index < wholesale.tiers.length - 1) assert.equal(tier.maxKgExclusive, wholesale.tiers[index + 1].minKg)
  else assert.equal(tier.maxKgExclusive, null)
})
console.log(`Escenario válido: ${ids.size} cafés, ${scenario.cases.length} casos, 5 perfiles, imágenes locales y contactos sin envío externo.`)
console.log('Verifica la coherencia de los datos; no prueba todavía la implementación del quiz, los descuentos o los pedidos.')

const commerce = JSON.parse(await readFile(new URL('../../shared/commerce-scenario-v1.json', import.meta.url), 'utf8'))
assert.deepEqual(commerce.commercial, scenario.commercial, 'Las condiciones ejecutables deben coincidir con el escenario autorizado')
const products = JSON.parse(await readFile(new URL('../../shared/demo-products-v1.json', import.meta.url), 'utf8'))
assert.deepEqual(products.map(p => { const { productId, ...quality } = p.quality; assert.equal(productId, p.id); return { ...p, quality } }), scenario.products)
