import { clearAccessToken, getAccessToken } from '../auth/tokenStorage'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
export const SESSION_EXPIRED_EVENT = 'lookie:session-expired'
export interface ApiResponse<T> { status: number; data: T | null }

export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly data: unknown
  constructor(status: number, data: unknown) {
    const body = typeof data === 'object' && data !== null ? data as Record<string, unknown> : null
    super(typeof body?.message === 'string' ? body.message
      : typeof body?.detail === 'string' ? body.detail
      : status === 401 ? '로그인이 만료되었어요. 다시 로그인해주세요.'
      : status === 403 ? '접근 권한이 없어요.'
      : `요청을 처리하지 못했어요. (HTTP ${status})`)
    this.name = 'ApiError'
    this.status = status
    this.code = typeof body?.code === 'string' ? body.code : null
    this.data = data
  }
}
export interface ApiRequestOptions extends RequestInit { auth?: boolean }

export async function apiRequest<T>(
  endpoint: string, options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  if (!endpoint.startsWith('/') || endpoint.startsWith('//')) {
    throw new Error('API 경로는 /로 시작하는 상대 경로여야 합니다.')
  }
  const { auth = true, ...requestOptions } = options
  const token = auth ? getAccessToken() : null
  const headers = new Headers(requestOptions.headers)
  if (requestOptions.body != null && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const timeout = AbortSignal.timeout(15_000)
  const signal = requestOptions.signal ? AbortSignal.any([requestOptions.signal, timeout]) : timeout
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...requestOptions, headers, signal })
  const text = await response.text()
  let data: unknown = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }
  if (!response.ok) {
    // A stale request must not clear a more recent login.
    if (response.status === 401 && token && getAccessToken() === token) {
      clearAccessToken()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    throw new ApiError(response.status, data)
  }
  return { status: response.status, data: data as T | null }
}
export function requireResponseData<T>(response: ApiResponse<T>): T {
  if (response.data === null) throw new Error('서버 응답이 비어 있어요. 다시 시도해주세요.')
  return response.data
}
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof DOMException && error.name === 'TimeoutError') return '서버 응답이 늦어지고 있어요. 잠시 후 다시 시도해주세요.'
  if (error instanceof TypeError) return '서버에 연결할 수 없어요. 연결 상태를 확인하고 다시 시도해주세요.'
  return error instanceof Error ? error.message : '요청 중 문제가 발생했어요. 다시 시도해주세요.'
}
