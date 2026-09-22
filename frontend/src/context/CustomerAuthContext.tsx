import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { CustomerAccount, PreferenceProfile, OnboardingProfile } from '../types'
import { accountService, type RegisterData } from '../services'
import { revokeSession } from '../config/api'

// Sesion del cliente de la tienda, separada del AuthContext del portal admin.
// Conserva el DTO de la cuenta en localStorage para presentación; la API
// autoriza mediante access token y cookie HttpOnly, no mediante este objeto.

const SESSION_KEY = 'customer_session'

interface CustomerAuthContextType {
  account: CustomerAccount | null
  register: (data: RegisterData) => Promise<CustomerAccount>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  savePreferences: (preferences: PreferenceProfile, recommendedProductId: string | null) => Promise<void>
  saveOnboarding: (profile: OnboardingProfile, recommendedProductId: string | null) => Promise<void>
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

  const logout = useCallback(() => {
    void revokeSession('customer')
    persist(null)
  }, [])

  const savePreferences = useCallback(
    async (preferences: PreferenceProfile, recommendedProductId: string | null) => {
      const current = localStorage.getItem(SESSION_KEY)
      if (!current) return
      const { id } = JSON.parse(current) as CustomerAccount
      persist(await accountService.updatePreferences(id, preferences, recommendedProductId))
    },
    [],
  )

  const saveOnboarding = useCallback(async (profile: OnboardingProfile, recommendedProductId: string | null) => {
    if (!account) throw new Error('Iniciá sesión para guardar tu perfil.')
    persist(await accountService.updateOnboarding(account.id, profile, recommendedProductId))
  }, [account])

  return (
    <CustomerAuthContext.Provider value={{ account, register, login, logout, savePreferences, saveOnboarding }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

// El hook comparte el contexto con su Provider; no afecta el refresco de producción.
// eslint-disable-next-line react-refresh/only-export-components
export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider')
  return ctx
}
