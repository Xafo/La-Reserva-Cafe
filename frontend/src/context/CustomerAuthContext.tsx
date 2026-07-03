import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { CustomerAccount, PreferenceProfile } from '../types'
import { accountService, type RegisterData } from '../services'

// Sesion del cliente de la tienda, separada del AuthContext del portal admin.
// Persiste en localStorage para que el demo sobreviva cerrar la pestana.
// TODO(backend .NET 10): al conectar /api/accounts, guardar tokens en lugar
// de la cuenta completa.

const SESSION_KEY = 'customer_session'

interface CustomerAuthContextType {
  account: CustomerAccount | null
  register: (data: RegisterData) => Promise<CustomerAccount>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  savePreferences: (preferences: PreferenceProfile, recommendedProductId: string | null) => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<CustomerAccount | null>(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  })

  const persist = (next: CustomerAccount | null) => {
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    else localStorage.removeItem(SESSION_KEY)
    setAccount(next)
  }

  const register = useCallback(async (data: RegisterData) => {
    const created = await accountService.register(data)
    persist(created)
    return created
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    persist(await accountService.login(email, password))
  }, [])

  const logout = useCallback(() => persist(null), [])

  const savePreferences = useCallback(
    async (preferences: PreferenceProfile, recommendedProductId: string | null) => {
      const current = localStorage.getItem(SESSION_KEY)
      if (!current) return
      const { id } = JSON.parse(current) as CustomerAccount
      persist(await accountService.updatePreferences(id, preferences, recommendedProductId))
    },
    [],
  )

  return (
    <CustomerAuthContext.Provider value={{ account, register, login, logout, savePreferences }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider')
  return ctx
}
