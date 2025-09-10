import { atom, computed } from 'nanostores'
import type { User } from '~/types/user.types'
import type { LoginSchema, SignupSchema } from '~/schemas/auth.schema'
import { login, register, logout, getCurrentUser } from '~/services/auth.service'

// State atoms
export const $user = atom<User | null>(null)
export const $isLoading = atom<boolean>(false)
export const $error = atom<string | null>(null)

// Computed values
export const $isAuthenticated = computed($user, user => !!user)
export const $hasError = computed($error, error => !!error)
export const $userDisplayName = computed($user, user =>
  user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Guest'
)

export const authActions = {
  async refresh() {
    try {
      $isLoading.set(true)
      $error.set(null)
      const user = await getCurrentUser()
      $user.set(user)
    } catch (error) {
      $user.set(null)
      // Don't set error for expected auth failures (401, etc.)
      if (!(error instanceof Error) || !error.message.includes('401')) {
        $error.set(error instanceof Error ? error.message : 'Failed to refresh user')
      }
    } finally {
      $isLoading.set(false)
    }
  },

  async login(credentials: LoginSchema) {
    try {
      $isLoading.set(true)
      $error.set(null)
      const user = await login(credentials)
      $user.set(user)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      $error.set(errorMessage)
      throw error // Re-throw for component handling
    } finally {
      $isLoading.set(false)
    }
  },

  async register(data: SignupSchema) {
    try {
      $isLoading.set(true)
      $error.set(null)
      const user = await register(data)
      $user.set(user)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      $error.set(errorMessage)
      throw error // Re-throw for component handling
    } finally {
      $isLoading.set(false)
    }
  },

  async logout() {
    try {
      $isLoading.set(true)
      $error.set(null)
      await logout()
    } catch (error) {
      // Log but don't set error state for logout failures
      console.warn('Logout error:', error)
    } finally {
      $user.set(null)
      $error.set(null)
      $isLoading.set(false)
    }
  },

  // Utility actions
  clearError() {
    $error.set(null)
  },

  setInitialUser(user: User | null) {
    $user.set(user)
    $error.set(null)
  },

  async silentRefresh() {
    try {
      const user = await getCurrentUser()
      $user.set(user)
      $error.set(null)
    } catch (error) {
      $user.set(null)
      // Silent failure - don't set error state
    }
  },

  updateUser: (updates: Partial<User>) => {
    const currentUser = $user.get()
    if (currentUser) {
      $user.set({ ...currentUser, ...updates })
    }
  }
}
