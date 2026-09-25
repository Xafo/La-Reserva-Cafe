import type {
  Product,
  Order,
  OrderItem,
  OrderStatus,
  Customer,
  User,
  Role,
  CoffeeProcess,
  RoastLevel,
  QualityGrade,
} from '../types'
import type { EntityCodec } from './repository'

// Reglas de aplanado (ver docs/STORAGE.md):
// - Objetos anidados -> columnas con prefijo (quality_grainType, pref_goals).
// - Arrays de texto -> valores unidos por '|' (Cacao|Nuez tostada|Panela).
// - Items de orden -> productId~productName~cantidad~precioUnitario, unidos por '|'.

const SEP = '|'
const ITEM_SEP = '~'

const joinList = (values: string[]) => values.join(SEP)
const splitList = (value: string) => (value === '' ? [] : value.split(SEP))

export const productCodec: EntityCodec<Product> = {
  headers: [
    'id', 'name', 'origin', 'region', 'process', 'roast', 'presentationGrams',
    'priceLps', 'stock', 'active', 'description', 'imageUrl', 'imageAlt',
    'quality_grainType', 'quality_altitudeMasl', 'quality_humidityPct',
    'quality_harvestDate', 'quality_producer', 'quality_grade',
    'quality_cuppingScore', 'quality_notes',
  ],
  fromRow: (r) => ({
    id: r.id,
    name: r.name,
    origin: r.origin,
    region: r.region,
    process: r.process as CoffeeProcess,
    roast: r.roast as RoastLevel,
    presentationGrams: Number(r.presentationGrams),
    priceLps: Number(r.priceLps),
    stock: Number(r.stock),
    active: r.active === 'true',
    description: r.description,
    imageUrl: r.imageUrl,
    imageAlt: r.imageAlt,
    quality: {
      grainType: r.quality_grainType,
      altitudeMasl: Number(r.quality_altitudeMasl),
      humidityPct: Number(r.quality_humidityPct),
      harvestDate: r.quality_harvestDate,
      producer: r.quality_producer,
      grade: r.quality_grade as QualityGrade,
      cuppingScore: Number(r.quality_cuppingScore),
      notes: splitList(r.quality_notes),
    },
  }),
  toRow: (p) => ({
    id: p.id,
    name: p.name,
    origin: p.origin,
    region: p.region,
    process: p.process,
    roast: p.roast,
    presentationGrams: String(p.presentationGrams),
    priceLps: String(p.priceLps),
    stock: String(p.stock),
    active: String(p.active),
    description: p.description,
    imageUrl: p.imageUrl,
    imageAlt: p.imageAlt,
    quality_grainType: p.quality.grainType,
    quality_altitudeMasl: String(p.quality.altitudeMasl),
    quality_humidityPct: String(p.quality.humidityPct),
    quality_harvestDate: p.quality.harvestDate,
    quality_producer: p.quality.producer,
    quality_grade: p.quality.grade,
    quality_cuppingScore: String(p.quality.cuppingScore),
    quality_notes: joinList(p.quality.notes),
  }),
}

const encodeItems = (items: OrderItem[]) =>
  items
    .map((i) => [i.productId, i.productName, i.quantity, i.unitPriceLps].join(ITEM_SEP))
    .join(SEP)

const decodeItems = (value: string): OrderItem[] =>
  splitList(value).map((chunk) => {
    const [productId, productName, quantity, unitPriceLps] = chunk.split(ITEM_SEP)
    return { productId, productName, quantity: Number(quantity), unitPriceLps: Number(unitPriceLps) }
  })

export const orderCodec: EntityCodec<Order> = {
  headers: ['id', 'customerName', 'customerEmail', 'customerPhone', 'deliveryAddress', 'deliveryCity', 'deliveryNotes', 'items', 'status', 'createdAt', 'totalLps'],
  fromRow: (r) => ({
    id: r.id,
    customerName: r.customerName,
    customerEmail: r.customerEmail || null,
    customerPhone: r.customerPhone || null,
    deliveryAddress: r.deliveryAddress || null,
    deliveryCity: r.deliveryCity || null,
    deliveryNotes: r.deliveryNotes || null,
    items: decodeItems(r.items),
    status: r.status as OrderStatus,
    createdAt: r.createdAt,
    totalLps: Number(r.totalLps),
  }),
  toRow: (o) => ({
    id: o.id,
    customerName: o.customerName,
    customerEmail: o.customerEmail ?? '',
    customerPhone: o.customerPhone ?? '',
    deliveryAddress: o.deliveryAddress ?? '',
    deliveryCity: o.deliveryCity ?? '',
    deliveryNotes: o.deliveryNotes ?? '',
    items: encodeItems(o.items),
    status: o.status,
    createdAt: o.createdAt,
    totalLps: String(o.totalLps),
  }),
}

export const customerCodec: EntityCodec<Customer> = {
  headers: ['id', 'name', 'email', 'phone', 'type', 'city', 'totalOrders'],
  fromRow: (r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    type: r.type as Customer['type'],
    city: r.city,
    totalOrders: Number(r.totalOrders),
  }),
  toRow: (c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    type: c.type,
    city: c.city,
    totalOrders: String(c.totalOrders),
  }),
}

export const userCodec: EntityCodec<User> = {
  headers: ['id', 'name', 'email', 'role', 'active'],
  fromRow: (r) => ({ id: r.id, name: r.name, email: r.email, role: r.role as Role, active: r.active !== 'false' }),
  toRow: (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: String(u.active) }),
}
