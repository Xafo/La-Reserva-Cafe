const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
export type SessionKind = 'team' | 'customer'

export async function api<T>(
  path: string,
  options?: RequestInit,
  session?: SessionKind,
): Promise<T> {
  const token = session ? sessionStorage.getItem(`${session}_access_token`) : null
  const headers = new Headers(options?.headers)
  if (options?.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' })

  if (res.status === 401 && session) {
    const refreshed = await refreshToken(session)
    if (refreshed) {
      headers.set('Authorization', `Bearer ${sessionStorage.getItem(`${session}_access_token`)}`)
      const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' })
      if (!retryRes.ok) throw await toApiError(retryRes)
      return parseResponse<T>(retryRes)
    }
    clearSession(session)
    window.location.href = session === 'team' ? '/admin/login' : '/ingresar'
    throw new Error('La sesion expiro')
  }

  if (!res.ok) throw await toApiError(res)
  return parseResponse<T>(res)
}

async function refreshToken(session: SessionKind): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ session }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { accessToken: string }
    saveSession(session, data.accessToken)
    return true
  } catch {
    return false
  }
}

export function saveSession(session: SessionKind, accessToken: string): void {
  sessionStorage.setItem(`${session}_access_token`, accessToken)
}

export function clearSession(session: SessionKind): void {
  sessionStorage.removeItem(`${session}_access_token`)
}

export async function revokeSession(session: SessionKind): Promise<void> {
  clearSession(session)
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session }),
  }).catch(() => undefined)
}

export async function downloadTeamFile(path: string): Promise<void> {
  const token = sessionStorage.getItem('team_access_token')
  const response = await fetch(`${API_BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: 'include' })
  if (!response.ok) throw await toApiError(response)
  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const name = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? 'reporte'
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a')
  anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url)
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

async function toApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null)
  return new ApiError(body, response.status)
}

export class ApiError extends Error {
  body: unknown
  status: number

  constructor(body: unknown, status: number) {
    const message = typeof body === 'object' && body !== null && 'error' in body
      ? String(body.error)
      : 'Ocurrio un error al procesar la solicitud'
    super(message)
    this.body = body
    this.status = status
  }
}
