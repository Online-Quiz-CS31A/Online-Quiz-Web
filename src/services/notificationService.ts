import api from './api'
import type { Notification } from '@/interfaces/interfaces'
import { AxiosError } from 'axios'

interface ApiErrorResponse {
  message?: string
}

function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined
    return data?.message || defaultMessage
  }
  if (error instanceof Error) {
    return error.message
  }
  return defaultMessage
}

/**
 * Get all notifications for the current user
 */
export async function getMyNotifications(): Promise<Notification[]> {
  try {
    const response = await api.get<Notification[]>('/Notification')
    return response.data
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    throw new Error(getErrorMessage(error, 'Failed to load notifications'))
  }
}

/**
 * Get a specific notification by ID
 */
export async function getNotificationById(id: number): Promise<Notification> {
  try {
    const response = await api.get<Notification>(`/Notification/${id}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch notification:', error)
    throw new Error(getErrorMessage(error, 'Failed to load notification'))
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(id: number): Promise<Notification> {
  try {
    const response = await api.put<Notification>(`/Notification/${id}/read`)
    return response.data
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    throw new Error(getErrorMessage(error, 'Failed to mark notification as read'))
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await api.put('/Notification/read-all')
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    throw new Error(getErrorMessage(error, 'Failed to mark all notifications as read'))
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: number): Promise<void> {
  try {
    await api.delete(`/Notification/${id}`)
  } catch (error) {
    console.error('Failed to delete notification:', error)
    throw new Error(getErrorMessage(error, 'Failed to delete notification'))
  }
}

/**
 * Bulk delete notifications
 */
export async function bulkDeleteNotifications(ids: number[]): Promise<void> {
  try {
    await api.delete('/Notification/bulk', {
      data: { notificationIds: ids }
    })
  } catch (error) {
    console.error('Failed to bulk delete notifications:', error)
    throw new Error(getErrorMessage(error, 'Failed to delete notifications'))
  }
}
