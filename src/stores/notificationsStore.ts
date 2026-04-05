import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Notification } from '@/interfaces/interfaces'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([
    { id: 1, title: 'New quiz assigned', message: 'Math Quiz 1 has been assigned', time: '5 min ago', read: false },
    { id: 2, title: 'Grade posted', message: 'Your Science Quiz grade is available', time: '1 hour ago', read: false },
    { id: 3, title: 'Reminder', message: 'Quiz due tomorrow', time: '2 hours ago', read: false },
    { id: 4, title: 'Class updated', message: 'Schedule changed for CS101', time: '1 day ago', read: true },
  ])

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  function markAsRead(id: number) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
  }

  function addNotification(notification: Omit<Notification, 'id'>) {
    const newId = notifications.value.length > 0 
      ? Math.max(...notifications.value.map(n => n.id)) + 1 
      : 1
    notifications.value.unshift({
      ...notification,
      id: newId
    })
  }

  function removeNotification(id: number) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification
  }
})
