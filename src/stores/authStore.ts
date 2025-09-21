import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Role, User } from './types'

export const useAuthStore = defineStore('auth', () => {
  const users = ref<User[]>([
    { username: '0112345678', password: 'teacher', role: 'teacher', name: 'Donald Francisco' },
    { username: '0212345678', password: 'student', role: 'student', name: 'Chitoge Kirisaki' },
  ])

  const currentUser = ref<User | null>(null)
  const isAuthenticated = computed(() => currentUser.value !== null)
  const userRole = computed<Role | null>(() => (currentUser.value ? currentUser.value.role : null))

  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
    if (saved) {
      const parsed = JSON.parse(saved) as User
      const expectedPrefix = parsed.role === 'teacher' ? '01' : '02'
      if (parsed.username?.startsWith(expectedPrefix)) {
        const found = users.value.find(u => u.username === parsed.username)
        if (found) {
          currentUser.value = { ...found }
        }
      }
    }
  } catch (e) {}

  function login(username: string, password: string): { success: boolean; message?: string; role?: Role } {
    const found = users.value.find(u => u.username === username)
    if (!found) return { success: false, message: 'Account not found' }
    if (found.password !== password) return { success: false, message: 'Invalid password' }
    currentUser.value = { ...found }
    try {
      if (typeof window !== 'undefined') localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    } catch {}
    return { success: true, role: found.role }
  }

  function logout() {
    currentUser.value = null
    try {
      if (typeof window !== 'undefined') localStorage.removeItem('currentUser')
    } catch {}
  }

  return {
    users,
    currentUser,
    isAuthenticated,
    userRole,
    login,
    logout,
  }
})
