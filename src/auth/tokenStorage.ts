const TOKEN_KEY = 'lookie.accessToken'
let memoryToken: string | null = null

// Tab-scoped persistence; restricted browser storage falls back to memory.
export function getAccessToken(): string | null {
  try { return window.sessionStorage.getItem(TOKEN_KEY) ?? memoryToken }
  catch { return memoryToken }
}
export function setAccessToken(token: string): void {
  memoryToken = token
  try { window.sessionStorage.setItem(TOKEN_KEY, token) }
  catch { /* In-memory authentication remains available. */ }
}
export function clearAccessToken(): void {
  memoryToken = null
  try { window.sessionStorage.removeItem(TOKEN_KEY) }
  catch { /* Browser storage may be disabled. */ }
}
// Used only for sign-out scheduling; validation remains the server's responsibility.
export function tokenExpiresAt(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded: unknown = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')))
    if (typeof decoded !== 'object' || decoded === null || !('exp' in decoded)) return null
    return typeof decoded.exp === 'number' && Number.isFinite(decoded.exp) ? decoded.exp * 1000 : null
  } catch { return null }
}

