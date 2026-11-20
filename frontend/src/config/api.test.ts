import assert from 'node:assert/strict'
import test from 'node:test'
import { api, saveSession } from './api.ts'

class MemoryStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

test('una sola renovación atiende solicitudes concurrentes de la misma sesión', async () => {
  const originalFetch = globalThis.fetch
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: new MemoryStorage() })
  let refreshes = 0

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)
    if (url.endsWith('/auth/refresh')) {
      refreshes += 1
      return new Response(JSON.stringify({ accessToken: 'renewed' }), { status: 200 })
    }
    const authorization = new Headers(init?.headers).get('Authorization')
    return authorization === 'Bearer renewed'
      ? new Response(JSON.stringify({ ok: true }), { status: 200 })
      : new Response(null, { status: 401 })
  }) as typeof fetch

  try {
    saveSession('customer', 'expired')
    await Promise.all([
      api<{ ok: boolean }>('/orders', undefined, 'customer'),
      api<{ ok: boolean }>('/accounts/me', undefined, 'customer'),
    ])
    assert.equal(refreshes, 1)
  } finally {
    globalThis.fetch = originalFetch
    if (originalStorage) Object.defineProperty(globalThis, 'sessionStorage', originalStorage)
    else delete (globalThis as { sessionStorage?: Storage }).sessionStorage
  }
})
