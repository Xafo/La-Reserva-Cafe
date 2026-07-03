import type { Product, Order, OrderStatus, Customer, User, Role, CartItem } from '../types'
import { productsRepo, ordersRepo, customersRepo, usersRepo } from '../storage'

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
    if (!user) throw new Error('Credenciales invalidas. Use admin@altura.hn / demo')
    return user
  },
  // TODO(backend): POST /api/auth/forgot-password — recuperacion de contrasena
  // TODO(backend): GET /api/audit-log — bitacora de acciones por usuario
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
        { name: 'Copan Clasico', units: 84 },
        { name: 'Marcala Reserva', units: 40 },
        { name: 'Comayagua Espresso', units: 12 },
        { name: 'Santa Barbara Honey', units: 8 },
      ],
    }
  },
  // TODO(backend): GET /api/reports/export?format=pdf|xlsx
}

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
