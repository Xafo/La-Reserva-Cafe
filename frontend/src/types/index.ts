// Tipos compartidos. Deben mantenerse alineados con los DTOs del backend
// .NET Core 10 cuando exista (src/Application/DTOs).

export type CoffeeProcess = 'Lavado' | 'Honey' | 'Natural'
export type RoastLevel = 'Claro' | 'Medio' | 'Oscuro'
export type QualityGrade = 'Premium' | 'Exportacion' | 'Estandar'

export interface QualityProfile {
  grainType: string
  altitudeMasl: number
  humidityPct: number
  harvestDate: string
  producer: string
  grade: QualityGrade
  cuppingScore: number
  notes: string[]
}

export interface Product {
  id: string
  name: string
  origin: string
  region: string
  process: CoffeeProcess
  roast: RoastLevel
  presentationGrams: number
  priceLps: number
  stock: number
  active: boolean
  description: string
  imageUrl: string
  imageAlt: string
  quality: QualityProfile
}

export type OrderStatus = 'Pendiente' | 'Aprobada' | 'Cancelada' | 'Finalizada'

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPriceLps: number
}

export interface Order {
  id: string
  customerName: string
  items: OrderItem[]
  status: OrderStatus
  createdAt: string
  totalLps: number
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  type: 'Cliente' | 'Proveedor'
  city: string
  totalOrders: number
}

export type Role = 'Administrador' | 'Compras' | 'Ventas' | 'Supervisor'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface CartItem {
  product: Product
  quantity: number
}
