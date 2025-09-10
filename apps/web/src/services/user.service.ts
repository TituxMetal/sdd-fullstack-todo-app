import type { UpdateProfileSchema } from '~/schemas/user.schema'
import type { User } from '~/types/user.types'
import { api } from '~/lib/apiRequest'
import type { ApiResponse } from '~/types/api.types'

/**
 * Helper function for consistent API response handling
 */
const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.message || 'API request failed')
}

/**
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileSchema): Promise<User> => {
  const response = await api.patch<User>('/users/me', data)
  return handleApiResponse(response)
}
