import { apiRequest, requireResponseData } from './apiClient'
import type { LoginRequest, LoginResponse } from '../types/backend'

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const result = requireResponseData(await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST', auth: false, body: JSON.stringify(credentials),
  }))
  if (typeof result.accessToken !== 'string' || !result.accessToken.trim() || typeof result.userId !== 'number') {
    throw new Error('로그인 응답 형식이 올바르지 않아요. 다시 시도해주세요.')
  }
  return result
}

export async function signUp(payload: LoginRequest & { nickname: string }) {
  return requireResponseData(await apiRequest<{ userId: number }>('/api/auth/signup', {
    method: 'POST', auth: false, body: JSON.stringify(payload),
  }))
}

