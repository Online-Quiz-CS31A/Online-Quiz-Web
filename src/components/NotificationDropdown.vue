<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { NotificationDisplay } from '@/interfaces/interfaces'

// TYPES
interface Props {
  notifications: NotificationDisplay[]
  show: boolean
  isLoading?: boolean
  error?: string | null
}

// PROPS
const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null
})

// EMITS
const emit = defineEmits<{
  close: []
  markAsRead: [id: number]
  markAllAsRead: []
  delete: [id: number]
}>()

// ROUTER & STORE
const router = useRouter()
const authStore = useAuthStore()

// COMPUTED
const unreadCount = computed(() => {
  return props.notifications.filter(n => !n.isRead).length
})

// Notification icon mapping
const notificationIcons: Record<string, string> = {
  Quiz: 'fa-clipboard-question',
  Course: 'fa-book',
  System: 'fa-cog',
  Reminder: 'fa-clock',
  Announcement: 'fa-bullhorn'
}

const notificationColors: Record<string, string> = {
  Quiz: 'text-blue-600',
  Course: 'text-green-600',
  System: 'text-gray-600',
  Reminder: 'text-orange-600',
  Announcement: 'text-purple-600'
}

function getNotificationIcon(type: string): string {
  return notificationIcons[type] || 'fa-bell'
}

function getNotificationColor(type: string): string {
  return notificationColors[type] || 'text-gray-600'
}

function viewAllNotifications() {
  emit('close')
  const role = authStore.userRole
  if (role === 'admin') {
    router.push({ name: 'admin-notifications' })
  } else if (role === 'teacher') {
    router.push({ name: 'teacher-notifications' })
  } else {
    router.push({ name: 'student-notifications' })
  }
}
</script>

<template>
  <!-- Notification Dropdown -->
  <div
    v-if="show"
    class="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 max-h-[32rem] overflow-hidden flex flex-col border border-gray-100 animate-slideDown"
  >
    <!-- AppHeader -->
    <div class="px-5 py-4 flex items-center justify-between border-b border-gray-100">
      <div>
        <h3 class="text-lg font-bold text-gray-900">Notifications</h3>
        <p class="text-xs text-gray-500 mt-0.5">You have {{ unreadCount }} unread message{{ unreadCount !== 1 ? 's' : '' }}</p>
      </div>
      <button
        v-if="unreadCount > 0"
        @click="emit('markAllAsRead')"
        class="text-xs text-blue-600 hover:text-blue-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
      >
        Clear all
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="px-5 py-12 text-center">
      <i class="fas fa-spinner fa-spin text-3xl text-blue-500 mb-3"></i>
      <p class="text-sm text-gray-500">Loading notifications...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-5 py-6">
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div class="flex items-start">
          <i class="fas fa-exclamation-circle text-red-500 mt-0.5 mr-3"></i>
          <div>
            <p class="text-sm font-semibold text-red-800">Error loading notifications</p>
            <p class="text-xs text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification List -->
    <div v-else class="overflow-y-auto flex-1 divide-y divide-gray-50">
      <div
        v-for="notif in notifications"
        :key="notif.notificationId"
        class="px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group relative"
        :class="{ 'bg-blue-50/30': !notif.isRead }"
      >
        <div class="flex items-start gap-4">
          <!-- Icon -->
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="notif.isRead ? 'bg-gray-100' : 'bg-blue-100'"
          >
            <i
              class="fas text-sm"
              :class="[getNotificationIcon(notif.type), getNotificationColor(notif.type)]"
            ></i>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 cursor-pointer" @click="emit('markAsRead', notif.notificationId)">
            <div class="flex items-start justify-between gap-3 mb-1">
              <h4
                class="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1"
                :class="{ 'font-bold': !notif.isRead }"
              >
                {{ notif.title }}
              </h4>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ notif.timeAgo }}</span>
                <div class="w-2.5 h-2.5 flex-shrink-0">
                  <div
                    v-if="!notif.isRead"
                    class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"
                  ></div>
                </div>
              </div>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {{ notif.message }}
            </p>
          </div>

          <!-- Delete Button -->
          <button
            @click.stop="emit('delete', notif.notificationId)"
            class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
            title="Delete notification"
          >
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="notifications.length === 0 && !isLoading && !error" class="px-5 py-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <i class="fas fa-bell-slash text-2xl text-gray-400"></i>
        </div>
        <h4 class="text-sm font-semibold text-gray-700 mb-1">All caught up!</h4>
        <p class="text-xs text-gray-500">You have no notifications at the moment</p>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="!isLoading && !error" class="px-5 py-3 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
      <button
        @click="viewAllNotifications"
        class="text-sm text-blue-600 hover:text-blue-700 font-semibold w-full text-center py-2 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
      >
        View all notifications →
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.2s ease-out;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
