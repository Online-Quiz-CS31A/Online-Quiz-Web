import api from '@/services/api'

export async function login(email: string, password: string) {
  const response = await api.post('/Auth/login', { email, password })
  return response.data
}

export async function logout() {
  await api.post('/Auth/logout')
}

export async function verifyToken() {
  const response = await api.get('/Auth/verify-me')
  return response.data
}

export default {
  login,
  logout,
  verifyToken,
}
