import api from './api'
import type { BiometricStatus, AvailableSlotsResponse, EnrollmentStatus, BiometricLogsResponse, BiometricLogFilter } from '../interfaces/interfaces'

export async function getDeviceStatus(): Promise<BiometricStatus> {
  const response = await api.get('/Biometric/status')
  return response.data
}

export async function getAvailableSlots(): Promise<AvailableSlotsResponse> {
  const response = await api.get('/Biometric/available-slots')
  return response.data
}

export async function isUserEnrolled(userId: number): Promise<EnrollmentStatus> {
  const response = await api.get(`/Biometric/is-enrolled/${userId}`)
  return response.data
}

export async function getBiometricLogs(filter?: BiometricLogFilter): Promise<BiometricLogsResponse> {
  const params = new URLSearchParams()
  if (filter) {
    if (filter.userId) params.append('UserId', filter.userId.toString())
    if (filter.actionType) params.append('ActionType', filter.actionType)
    if (filter.success !== undefined) params.append('Success', filter.success.toString())
    if (filter.startDate) params.append('StartDate', filter.startDate)
    if (filter.endDate) params.append('EndDate', filter.endDate)
    if (filter.page) params.append('Page', filter.page.toString())
    if (filter.pageSize) params.append('PageSize', filter.pageSize.toString())
  }
  const response = await api.get(`/Biometric/logs?${params.toString()}`)
  return response.data
}

export async function unenrollFingerprint(userId: number): Promise<{ success: boolean; message: string }> {
  const response = await api.delete(`/Biometric/unenroll/${userId}`)
  return response.data
}

export async function cancelOperation(): Promise<{ success: boolean; message: string }> {
  const response = await api.post('/Biometric/cancel')
  return response.data
}