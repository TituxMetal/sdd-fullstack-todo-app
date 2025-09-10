import type { ApiResponse } from '~/types/api.types'

const BASE_URL =
  typeof window !== 'undefined'
    ? import.meta.env.PUBLIC_API_URL || '/api' // Client-side: use relative URL
    : process.env.API_URL || 'http://localhost:3000' // Server-side: use full URL

const DEFAULT_TIMEOUT = 10000 // 10 seconds

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

const createTimeoutController = (timeoutMs: number): AbortController => {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<ApiResponse<T>> => {
  const url = `${BASE_URL}${endpoint}`
  const timeout = options.timeout || DEFAULT_TIMEOUT

  const headers = new Headers(options.headers)

  if (options.body && !headers.get('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = typeof window !== 'undefined' ? getCookie('auth_token') : null

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  try {
    const controller = createTimeoutController(timeout)

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal
    })

    // Clear timeout since request completed
    clearTimeout(controller.signal as any)

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // If response is not JSON, use text
        const errorText = await response.text()
        if (errorText) {
          errorMessage = errorText
        }
      }

      return {
        success: false,
        message: errorMessage,
        status: response.status
      }
    }

    const data = await response.json()
    return {
      success: true,
      data,
      status: response.status
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timeout',
          status: 408
        }
      }
      return {
        success: false,
        message: error.message,
        status: 0
      }
    }

    return {
      success: false,
      message: 'Network error',
      status: 0
    }
  }
}

export const api = {
  get: <T>(endpoint: string, config?: { timeout?: number }) =>
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, config?: { timeout?: number }) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    }),
  put: <T>(endpoint: string, body?: unknown, config?: { timeout?: number }) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    }),
  patch: <T>(endpoint: string, body?: unknown, config?: { timeout?: number }) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    }),
  delete: <T>(endpoint: string, config?: { timeout?: number }) =>
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' })
}
