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
  OnboardingProfile,
  CommercialRequest,
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
  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return api<Product>('/products', { method: 'POST', body: JSON.stringify({ ...product, id: '' }) }, 'team')
  },
  async uploadProductImage(id: string, file: File): Promise<Product> {
    const data = new FormData(); data.append('file', file)
    return api<Product>(`/products/${encodeURIComponent(id)}/image`, { method: 'POST', body: data }, 'team')
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
  async createManualOrder(customerName: string, items: { productId: string; quantity: number }[]): Promise<Order> {
    return api<Order>('/orders', { method: 'POST', body: JSON.stringify({ customerName, items }) }, 'team')
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
  async createCustomer(customer: Omit<Customer, 'id' | 'totalOrders'>): Promise<Customer> {
    return api<Customer>('/customers', { method: 'POST', body: JSON.stringify(customer) }, 'team')
  },
  async updateCustomer(customer: Customer): Promise<Customer> {
    return api<Customer>(`/customers/${encodeURIComponent(customer.id)}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    }, 'team')
  },
}

export const userService = {
  async getUsers(): Promise<User[]> {
    return api<User[]>('/users', undefined, 'team')
  },
  async createUser(user: Omit<User, 'id'> & { initialPassword: string }): Promise<User> {
    return api<User>('/users', { method: 'POST', body: JSON.stringify(user) }, 'team')
  },
  async updateUser(user: User & { initialPassword?: string }): Promise<User> {
    return api<User>(`/users/${encodeURIComponent(user.id)}`, { method: 'PUT', body: JSON.stringify(user) }, 'team')
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
  async updateOnboarding(accountId: string, onboarding: OnboardingProfile, recommendedProductId: string | null): Promise<CustomerAccount> {
    return api<CustomerAccount>(`/accounts/${encodeURIComponent(accountId)}/onboarding`, {
      method: 'PUT', body: JSON.stringify({ onboarding, recommendedProductId }),
    }, 'customer')
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

export const commercialService = {
  async assignees(): Promise<{ id: string; name: string; role: string }[]> {
    return api('/commercial-requests/assignees', undefined, 'team')
  },
  async updateWorkflow(id: string, update: { status: string; assignedUserId: string | null; version: string; note: string }): Promise<CommercialRequest> {
    return api(`/commercial-requests/${encodeURIComponent(id)}/workflow`, { method: 'PATCH', body: JSON.stringify(update) }, 'team')
  },
  async submit(accountId: string, profile: string): Promise<Pick<CommercialRequest, 'id' | 'profile' | 'status' | 'createdAt' | 'updatedAt' | 'externalMessageSent'>> {
    return api(`/accounts/${encodeURIComponent(accountId)}/commercial-requests/${encodeURIComponent(profile)}`, { method: 'PUT' }, 'customer')
  },
  async list(page = 1): Promise<{ items: CommercialRequest[]; hasMore: boolean }> {
    return api(`/commercial-requests?page=${page}`, undefined, 'team')
  },
}
