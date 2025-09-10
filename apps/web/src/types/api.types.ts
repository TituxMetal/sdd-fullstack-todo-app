/**
 * Represents a standardized API response structure
 */
export type ApiResponse<T = unknown> = {
  /** Indicates whether the request was successful */
  success: boolean
  /** Optional error message in case of failure */
  message?: string
  /** Optional response data in case of success */
  data?: T
  /** Optional HTTP status code */
  status?: number
}

/**
 * Specific error type for better error handling
 */
export type ApiError = {
  message: string
  status: number
  code?: string
}

/**
 * Configuration options for API requests
 */
export type ApiConfig = {
  timeout?: number
  headers?: Record<string, string>
}
