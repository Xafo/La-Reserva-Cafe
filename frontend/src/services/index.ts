import type {
  Product,
  Order,
  OrderStatus,
  Customer,
  User,
  Role,
  CartItem,
  CustomerAccount,
  PreferenceProfile,
} from '../types'
import { productsRepo, ordersRepo, customersRepo, usersRepo, accountsRepo } from '../storage'

// =============================================================================
// Capa de servicios — UNICA frontera entre la UI y los datos.
//
// Los datos viven en repositorios CSV (src/storage): semilla en public/data/*.csv,
// mutaciones en localStorage. Es el placeholder de la base de datos real.
// TODO(backend .NET 10): sustituir cada implementacion por una llamada a
// `api<T>()` de src/config/api.ts contra el endpoint indicado en cada funcion.
// Las firmas (parametros y tipos de retorno) son el contrato esperado de los
// DTOs en src/Application/DTOs del backend; no cambiarlas sin actualizar ambos lados.
// =============================================================================

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms))

export const catalogService = {
  // TODO(backend): GET /api/products?activeOnly=true
  async getProducts(activeOnly = false): Promise<Product[]> {
    await delay()
    const products = await productsRepo.getAll()
    return activeOnly ? products.filter((p) => p.active) : products
  },
  // TODO(backend): GET /api/products/{id}
  async getProduct(id: string): Promise<Product | undefined> {
    await delay()
    return productsRepo.getById(id)
  },
  // TODO(backend): PUT /api/products/{id}
  async updateProduct(updated: Product): Promise<Product> {
    await delay()
    return productsRepo.update(updated)
  },
}

export const orderService = {
  // TODO(backend): GET /api/orders
  async getOrders(): Promise<Order[]> {
    await delay()
    return ordersRepo.getAll()
  },
  // TODO(backend): POST /api/orders
  async createOrder(customerName: string, items: CartItem[]): Promise<Order> {
    await delay(400)
    const orders = await ordersRepo.getAll()
    const maxSeq = orders.reduce((max, o) => {
      const seq = Number(o.id.split('-').pop())
      return Number.isFinite(seq) && seq > max ? seq : max
    }, 0)
    const order: Order = {
      id: `OC-2026-${String(maxSeq + 1).padStart(4, '0')}`,
      customerName,
      items: items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        unitPriceLps: i.product.priceLps,
      })),
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
      totalLps: items.reduce((s, i) => s + i.product.priceLps * i.quantity, 0),
    }
    return ordersRepo.create(order)
  },
  // TODO(backend): PATCH /api/orders/{id}/status
  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    await delay()
    const order = await ordersRepo.getById(id)
    if (order) await ordersRepo.update({ ...order, status })
  },
  // TODO(backend): GET /api/orders/{id}/pdf — generacion de PDF imprimible
}

export const customerService = {
  // TODO(backend): GET /api/customers
  async getCustomers(): Promise<Customer[]> {
    await delay()
    return customersRepo.getAll()
  },
}

export const userService = {
  // TODO(backend): GET /api/users (solo rol Administrador)
  async getUsers(): Promise<User[]> {
    await delay()
    return usersRepo.getAll()
  },
}

export const authService = {
  // TODO(backend): POST /api/auth/login — JWT + refresh token (ver config/api.ts,
  // que ya implementa el flujo Bearer/refresh del template DotForge).
  async login(email: string, _password: string): Promise<User> {
    await delay(500)
    const users = await usersRepo.getAll()
    const user = users.find((u) => u.email === email)
    if (!user) throw new Error('Credenciales invalidas. Use admin@lareserva.hn / demo')
    return user
  },
  // TODO(backend): POST /api/auth/forgot-password — recuperacion de contrasena
  // TODO(backend): GET /api/audit-log — bitacora de acciones por usuario
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  city: string
}

export const accountService = {
  // TODO(backend): POST /api/accounts — registro de cliente de la tienda
  async register(data: RegisterData): Promise<CustomerAccount> {
    await delay(400)
    const accounts = await accountsRepo.getAll()
    if (accounts.some((a) => a.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Ya existe una cuenta con ese correo. Inicia sesion.')
    }
    const account: CustomerAccount = {
      id: `a-${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      city: data.city,
      createdAt: new Date().toISOString(),
      preferences: null,
      recommendedProductId: null,
    }
    await accountsRepo.create(account)
    // El registro alimenta el CRM: ventas ve al cliente en /admin/clientes.
    const customers = await customersRepo.getAll()
    if (!customers.some((c) => c.email.toLowerCase() === data.email.toLowerCase())) {
      await customersRepo.create({
        id: `c-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: 'Cliente',
        city: data.city,
        totalOrders: 0,
      })
    }
    return account
  },
  // TODO(backend): POST /api/accounts/login
  async login(email: string, password: string): Promise<CustomerAccount> {
    await delay(500)
    const accounts = await accountsRepo.getAll()
    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
    )
    if (!account) throw new Error('Correo o contrasena incorrectos.')
    return account
  },
  // TODO(backend): PUT /api/accounts/{id}/preferences
  async updatePreferences(
    accountId: string,
    preferences: PreferenceProfile,
    recommendedProductId: string | null,
  ): Promise<CustomerAccount> {
    await delay()
    const account = await accountsRepo.getById(accountId)
    if (!account) throw new Error('La cuenta no existe.')
    return accountsRepo.update({ ...account, preferences, recommendedProductId })
  },
  // TODO(backend): GET /api/accounts (solo roles con permiso de clientes)
  async getAccounts(): Promise<CustomerAccount[]> {
    await delay()
    return accountsRepo.getAll()
  },
}

export const reportService = {
  // TODO(backend): GET /api/reports/summary
  async getSummary() {
    await delay()
    const [orders, products] = await Promise.all([ordersRepo.getAll(), productsRepo.getAll()])
    const finalized = orders.filter((o) => o.status === 'Finalizada')
    return {
      salesLps: finalized.reduce((s, o) => s + o.totalLps, 0),
      pendingOrders: orders.filter((o) => o.status === 'Pendiente').length,
      activeProducts: products.filter((p) => p.active).length,
      lowStock: products.filter((p) => p.stock < 25),
      recentOrders: orders.slice(0, 5),
      topProducts: [
        { name: 'La Reserva Blend', units: 84 },
        { name: 'Espresso de Casa', units: 60 },
        { name: 'Nahun Vidal Sanchez', units: 14 },
        { name: 'Josue Galo', units: 9 },
      ],
    }
  },
  // TODO(backend): GET /api/reports/export?format=pdf|xlsx
}

export { recommendationService } from './recommendation'

export type Permission = 'productos' | 'calidad' | 'ordenes' | 'clientes' | 'reportes' | 'usuarios'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Administrador: ['productos', 'calidad', 'ordenes', 'clientes', 'reportes', 'usuarios'],
  Compras: ['productos', 'calidad', 'ordenes', 'clientes'],
  Ventas: ['ordenes', 'clientes', 'reportes'],
  Supervisor: ['productos', 'calidad', 'ordenes', 'clientes', 'reportes'],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}
