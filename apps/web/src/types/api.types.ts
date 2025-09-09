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
