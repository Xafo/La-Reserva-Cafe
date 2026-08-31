import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User } from '../types'
import { authService } from '../services'
import { revokeSession } from '../config/api'

// TODO(backend .NET 10): al conectar /api/auth este contexto vuelve al patron
// DotForge original (accessToken + refresh en localStorage via config/api.ts).

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('auth_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (email: string, password: string) => {
    const logged = await authService.login(email, password)
    sessionStorage.setItem('auth_user', JSON.stringify(logged))
    setUser(logged)
  }, [])

  const logout = useCallback(() => {
    void revokeSession('team')
    sessionStorage.removeItem('auth_user')
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
