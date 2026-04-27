import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Notification, NotificationDisplay } from '@/interfaces/interfaces'
import * as notificationService from '@/services/notificationService'

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchTime = ref<Date | null>(null)
  let pollingInterval: number | null = null

  // Computed
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length
  })

  const notificationsWithTimeAgo = computed<NotificationDisplay[]>(() => {
    return notifications.value.map(n => ({
      ...n,
      timeAgo: formatTimeAgo(n.createdAt)
    }))
  })

  // Helper: Format time ago
  function formatTimeAgo(dateString: string): string {
    try {
      const now = new Date()
      const past = new Date(dateString)
      const diffMs = now.getTime() - past.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} min ago`
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      return past.toLocaleDateString()
    } catch {
      return 'Recently'
    }
  }

  // Actions
  async function fetchNotifications(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const data = await notificationService.getMyNotifications()
      notifications.value = data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      lastFetchTime.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load notifications'
      console.error('Fetch notifications error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function markAsRead(id: number): Promise<void> {
    const notification = notifications.value.find(n => n.notificationId === id)
    if (!notification) return

    // Optimistic update
    const wasRead = notification.isRead
    notification.isRead = true

    try {
      await notificationService.markNotificationAsRead(id)
    } catch (err) {
      // Rollback on error
      notification.isRead = wasRead
      error.value = 'Failed to mark notification as read'
      console.error('Mark as read error:', err)
    }
  }

  async function markAllAsRead(): Promise<void> {
    // Optimistic update
    const previousStates = notifications.value.map(n => ({ id: n.notificationId, isRead: n.isRead }))
    notifications.value.forEach(n => n.isRead = true)

    try {
      await notificationService.markAllNotificationsAsRead()
    } catch (err) {
      // Rollback on error
      previousStates.forEach(prev => {
        const notification = notifications.value.find(n => n.notificationId === prev.id)
        if (notification) {
          notification.isRead = prev.isRead
        }
      })
      error.value = 'Failed to mark all notifications as read'
      console.error('Mark all as read error:', err)
    }
  }

  async function removeNotification(id: number): Promise<void> {
    const index = notifications.value.findIndex(n => n.notificationId === id)
    if (index === -1) return

    // Optimistic update
    const removed = notifications.value.splice(index, 1)[0]

    try {
      await notificationService.deleteNotification(id)
    } catch (err) {
      // Rollback on error
      notifications.value.splice(index, 0, removed)
      error.value = 'Failed to delete notification'
      console.error('Delete notification error:', err)
    }
  }

  async function bulkRemove(ids: number[]): Promise<void> {
    if (!ids.length) return

    // Optimistic update
    const removed = notifications.value.filter(n => ids.includes(n.notificationId))
    notifications.value = notifications.value.filter(n => !ids.includes(n.notificationId))

    try {
      await notificationService.bulkDeleteNotifications(ids)
    } catch (err) {
      // Rollback on error
      notifications.value.push(...removed)
      notifications.value.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      error.value = 'Failed to delete notifications'
      console.error('Bulk delete error:', err)
    }
  }

  // Polling
  function startPolling(intervalMs: number = 60000): void {
    if (pollingInterval) return

    // Only poll when document is visible
    const poll = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications()
      }
    }

    pollingInterval = window.setInterval(poll, intervalMs)
  }

  function stopPolling(): void {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  return {
    notifications: notificationsWithTimeAgo,
    rawNotifications: notifications,
    isLoading,
    error,
    unreadCount,
    lastFetchTime,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    bulkRemove,
    startPolling,
    stopPolling
  }
})
