const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface ApiResponse<T> {
  status: number
  data: T | null
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const text = await response.text()

  let data: T | null = null

  if (text) {
    try {
      data = JSON.parse(text) as T
    } catch {
      data = text as T
    }
  }

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}\n${
        typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      }`,
    )
  }

  return {
    status: response.status,
    data,
  }
}