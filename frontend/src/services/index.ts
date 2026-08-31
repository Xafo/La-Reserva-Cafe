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
import { api, saveSession } from '../config/api'

interface TeamAuthResponse {
  user: User
  accessToken: string
}

interface AccountAuthResponse {
  account: CustomerAccount
  accessToken: string
}

export const catalogService = {
  async getProducts(activeOnly = false): Promise<Product[]> {
    return api<Product[]>(`/products?activeOnly=${activeOnly}`)
  },
  async getProduct(id: string): Promise<Product | undefined> {
    try {
      return await api<Product>(`/products/${encodeURIComponent(id)}`)
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error && error.status === 404) return undefined
      throw error
    }
  },
  async updateProduct(updated: Product): Promise<Product> {
    return api<Product>(`/products/${encodeURIComponent(updated.id)}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
    }, 'team')
  },
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    return api<Order[]>('/orders', undefined, 'team')
  },
  async createOrder(customerName: string, items: CartItem[]): Promise<Order> {
    return api<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      }),
    })
  },
  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    return api<void>(`/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, 'team')
  },
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    return api<Customer[]>('/customers', undefined, 'team')
  },
}

export const userService = {
  async getUsers(): Promise<User[]> {
    return api<User[]>('/users', undefined, 'team')
  },
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await api<TeamAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    saveSession('team', response.accessToken)
    return response.user
  },
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  city: string
}

export const accountService = {
  async register(data: RegisterData): Promise<CustomerAccount> {
    await api<CustomerAccount>('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return this.login(data.email, data.password)
  },
  async login(email: string, password: string): Promise<CustomerAccount> {
    const response = await api<AccountAuthResponse>('/accounts/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    saveSession('customer', response.accessToken)
    return response.account
  },
  async updatePreferences(
    accountId: string,
    preferences: PreferenceProfile,
    recommendedProductId: string | null,
  ): Promise<CustomerAccount> {
    return api<CustomerAccount>(`/accounts/${encodeURIComponent(accountId)}/preferences`, {
      method: 'PUT',
      body: JSON.stringify({ preferences, recommendedProductId }),
    }, 'customer')
  },
  async getAccounts(): Promise<CustomerAccount[]> {
    return api<CustomerAccount[]>('/accounts', undefined, 'team')
  },
}

export const reportService = {
  async getSummary() {
    return api<{
      salesLps: number
      pendingOrders: number
      activeProducts: number
      lowStock: Product[]
      recentOrders: Order[]
      topProducts: { name: string; units: number }[]
    }>('/reports/summary', undefined, 'team')
  },
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
