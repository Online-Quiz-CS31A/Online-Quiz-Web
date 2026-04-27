import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Role, User } from '../interfaces/interfaces'
import * as authService from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isAuthenticated = computed(() => currentUser.value !== null)
  const userRole = computed<Role | null>(() => (currentUser.value ? currentUser.value.role : null))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const STORAGE_KEY = 'authUser'

  function loadUserFromStorage() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      const parsed = JSON.parse(stored) as User
      if (parsed && parsed.username && parsed.role) {
        currentUser.value = parsed
      }
    } catch (e) {
      console.warn('Failed to load auth user from storage', e)
    }
  }

  function saveUserToStorage(user: User | null) {
    try {
      if (!user) {
        window.localStorage.removeItem(STORAGE_KEY)
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      }
    } catch (e) {
      console.warn('Failed to persist auth user to storage', e)
    }
  }

  loadUserFromStorage()

  /**
   * Login user with email and password
   */
  async function login(email: string, password: string): Promise<{ success: boolean; message?: string; role?: Role }> {
    isLoading.value = true
    error.value = null

    try {
      const loginData = await authService.login(email, password)

      if (!loginData || !loginData.user) {
        throw new Error('Login failed')
      }

      const userSummary = loginData.user

      const backendRoleValue = userSummary.roleName
        ?? (userSummary.roles && userSummary.roles.length > 0 ? userSummary.roles[0] : undefined)
        ?? (userSummary.role)
        ?? (userSummary.teacher ? 'teacher' : undefined)
        ?? (userSummary.student ? 'student' : undefined)
        ?? 'student'

      const role = mapRoleToLocal(backendRoleValue)

      const user: User = {
        username: userSummary.email,
        password: '',
        role: role,
        name: userSummary.fullName ?? userSummary.name ?? '',
        id: (userSummary.userId ?? userSummary.id) as number,
        email: userSummary.email,
        roles: userSummary.roles ?? (userSummary.roleName ? [userSummary.roleName] : []),
      }

      currentUser.value = user
      saveUserToStorage(user)

      // Fetch notifications after successful login
      try {
        const { useNotificationsStore } = await import('./notificationsStore')
        const notificationsStore = useNotificationsStore()
        await notificationsStore.fetchNotifications()
      } catch (notifError) {
        console.warn('Failed to fetch notifications on login:', notifError)
        // Don't fail login if notifications fail
      }

      return { success: true, role }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Map backend role to local role type
   */
  function mapRoleToLocal(backendRole?: string): Role {
    const roleLower = (backendRole || 'student').toLowerCase()
    if (roleLower === 'teacher') return 'teacher'
    if (roleLower === 'student') return 'student'
    if (roleLower === 'admin') return 'admin'
    return 'student'
  }

  /**
   * Logout user
   */
  async function logout() {
    currentUser.value = null
    saveUserToStorage(null)
    try {
      const { useBiometricStore } = await import('./biometricStore')
      const biometricStore = useBiometricStore()
      await biometricStore.disposeBiometric()
    } catch {
      // biometric store may not be initialized
    }
    try {
      await authService.logout()
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err && err.status !== 401) {
        console.warn('Backend logout failed:', err)
      }
    }
  }

  /**
   * Verify current session with backend
   */
  async function verifySession(): Promise<boolean> {
    try {
      const result = await authService.verifyToken()
      return result?.valid === true
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err && err.status !== 401) {
        console.error('Unexpected session verification error:', err)
      }
      return false
    }
  }

  return {
    currentUser,
    isAuthenticated,
    userRole,
    isLoading,
    error,
    login,
    logout,
    verifySession,
  }
})
