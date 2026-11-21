import { apiRequest, requireResponseData } from './apiClient'

export async function aiRequest<T>(
    path: string,
    body?: unknown,
    signal?: AbortSignal,
    method?: 'GET' | 'POST',
): Promise<T> {
 // Spring forwards /api/ai/** to the AI engine and receives the user's JWT.
 const response = await apiRequest<T>(`/api/ai${path}`, {
  auth: true,
  method: method ?? (body === undefined ? 'GET' : 'POST'),
  signal: signal ?? null,
  body: body === undefined ? null : (JSON.stringify(body) ?? null),
  timeoutMs: 20_000,
 })

 return requireResponseData(response)
}
