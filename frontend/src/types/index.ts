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
  active: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

// --- Cuentas de cliente de la tienda (separadas de los usuarios admin) ---
// TODO(backend .NET 10): CustomerAccount mapea a las tablas CustomerAccounts +
// CustomerPreferences (ver docs/STORAGE.md).

export type PlatformGoal = 'Cafe de especialidad' | 'Cafe de todos los dias' | 'Regalar cafe' | 'Comprar para mi negocio'
export type BrewMethod = 'Espresso' | 'Prensa francesa' | 'V60 o chorreado' | 'Cafetera de goteo' | 'Cold brew'
export type DrinkStyle = 'Solo (negro)' | 'Con leche' | 'Frio'
export type FlavorFamily = 'Chocolate y nuez' | 'Frutal y tropical' | 'Floral y te' | 'Caramelo y panela' | 'Vino y frutos rojos'
export type Intensity = 'Suave' | 'Balanceado' | 'Intenso'
export type Budget = 'Hasta L400' | 'L400 a L600' | 'Sin limite'

export interface PreferenceProfile {
  goals: PlatformGoal[]
  brewMethods: BrewMethod[]
  drinkStyles: DrinkStyle[]
  flavorFamilies: FlavorFamily[]
  intensity: Intensity
  budget: Budget
  updatedAt: string
}

export interface CustomerAccount {
  id: string
  name: string
  email: string
  phone: string
  city: string
  createdAt: string
  preferences: PreferenceProfile | null
  recommendedProductId: string | null
}

export interface Recommendation {
  product: Product
  matchPct: number
  reasons: string[]
}
