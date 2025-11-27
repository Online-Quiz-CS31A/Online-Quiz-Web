import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Role, User } from '../interfaces/interfaces'
import * as authService from '../services/authService'
import type { LoginResponse, UserSummary } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isAuthenticated = computed(() => currentUser.value !== null)
  const userRole = computed<Role | null>(() => (currentUser.value ? currentUser.value.role : null))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
    if (saved) {
      const parsed = JSON.parse(saved) as User
      currentUser.value = parsed
    }
  } catch (e) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser')
    }
  }

  /**
   * Login user with email and password
   */
  async function login(email: string, password: string): Promise<{ success: boolean; message?: string; role?: Role }> {
    isLoading.value = true
    error.value = null

    try {
      const teacherUsernames = ['0112345678', '0111111111']
      const studentUsernames = ['0212345678']
      const adminUsernames = ['admin']

      let matchedRole: Role | null = null
      if (teacherUsernames.includes(email) && password === 'teacher') {
        matchedRole = 'teacher'
      } else if (studentUsernames.includes(email) && password === 'student') {
        matchedRole = 'student'
      } else if (adminUsernames.includes(email) && password === 'admin') {
        matchedRole = 'admin'
      }

      if (matchedRole) {
        const user: User = {
          username: email,
          password: '',
          role: matchedRole,
          name: matchedRole === 'teacher' ? 'Teacher User' : 'Student User',
          id: Number(email),
          email: email,
          roles: [matchedRole],
        }

        currentUser.value = user

        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('currentUser', JSON.stringify(user))
          }
        } catch (e) {
          console.error('Failed to save user to localStorage:', e)
        }

        return { success: true, role: matchedRole }
      }

      const response = await authService.login(email, password)
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed')
      }

      const loginData = response.data
      const userSummary = loginData.user
      
      const role = mapRoleToLocal(userSummary.roles[0])
      
      const user: User = {
        username: userSummary.email,
        password: '', 
        role: role,
        name: userSummary.fullName,
        id: userSummary.id,
        email: userSummary.email,
        roles: userSummary.roles,
      }

      currentUser.value = user
      
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(user))
        }
      } catch (e) {
        console.error('Failed to save user to localStorage:', e)
      }

      return { success: true, role }
    } catch (err: any) {
      const errorMessage = err.message || 'Invalid email or password'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Map backend role to local role type
   */
  function mapRoleToLocal(backendRole: string): Role {
    const roleLower = backendRole.toLowerCase()
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
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser')
      }
    } catch (e) {
      console.error('Failed to clear localStorage:', e)
    }
    
    try {
      await authService.logout()
    } catch (err: any) {
      if (err.status !== 401) {
        console.warn('Backend logout failed:', err)
      }
    }
  }

  /**
   * Verify current session with backend
   */
  async function verifySession(): Promise<boolean> {
    try {
      const response = await authService.verifyToken()
      return response.success && response.data?.valid === true
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