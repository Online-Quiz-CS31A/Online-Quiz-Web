<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notificationsStore'
import type { NotificationDisplay } from '@/interfaces/interfaces'

const router = useRouter()
const notificationsStore = useNotificationsStore()

// State
const selectedTab = ref<'all' | 'unread'>('all')
const selectedNotifications = ref<Set<number>>(new Set())
const isSelectMode = ref(false)

// Computed
const filteredNotifications = computed(() => {
  if (selectedTab.value === 'unread') {
    return notificationsStore.notifications.filter(n => !n.isRead)
  }
  return notificationsStore.notifications
})

const allSelected = computed(() => {
  return filteredNotifications.value.length > 0 &&
    filteredNotifications.value.every(n => selectedNotifications.value.has(n.notificationId))
})

const hasSelection = computed(() => selectedNotifications.value.size > 0)

// Notification icon mapping
const notificationIcons: Record<string, string> = {
  Quiz: 'fa-clipboard-question',
  Course: 'fa-book',
  System: 'fa-cog',
  Reminder: 'fa-clock',
  Announcement: 'fa-bullhorn'
}

const notificationColors: Record<string, string> = {
  Quiz: 'bg-blue-100 text-blue-600',
  Course: 'bg-green-100 text-green-600',
  System: 'bg-gray-100 text-gray-600',
  Reminder: 'bg-orange-100 text-orange-600',
  Announcement: 'bg-purple-100 text-purple-600'
}

// Methods
function getNotificationIcon(type: string): string {
  return notificationIcons[type] || 'fa-bell'
}

function getNotificationColor(type: string): string {
  return notificationColors[type] || 'bg-gray-100 text-gray-600'
}

function goBack() {
  router.back()
}

function toggleSelectMode() {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value) {
    selectedNotifications.value.clear()
  }
}

function toggleSelection(id: number) {
  if (selectedNotifications.value.has(id)) {
    selectedNotifications.value.delete(id)
  } else {
    selectedNotifications.value.add(id)
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedNotifications.value.clear()
  } else {
    filteredNotifications.value.forEach(n => {
      selectedNotifications.value.add(n.notificationId)
    })
  }
}

async function handleMarkAsRead(notification: NotificationDisplay) {
  if (!notification.isRead) {
    await notificationsStore.markAsRead(notification.notificationId)
  }
}

async function handleDelete(id: number) {
  await notificationsStore.removeNotification(id)
  selectedNotifications.value.delete(id)
}

async function handleBulkDelete() {
  if (selectedNotifications.value.size === 0) return

  const ids = Array.from(selectedNotifications.value)
  await notificationsStore.bulkRemove(ids)
  selectedNotifications.value.clear()
  isSelectMode.value = false
}

async function handleMarkAllAsRead() {
  await notificationsStore.markAllAsRead()
}

onMounted(() => {
  if (notificationsStore.notifications.length === 0) {
    notificationsStore.fetchNotifications()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <button
              @click="goBack"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
            >
              <i class="fas fa-arrow-left text-gray-600"></i>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
              <p class="text-sm text-gray-500">
                {{ notificationsStore.unreadCount }} unread
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="!isSelectMode && notificationsStore.unreadCount > 0"
              @click="handleMarkAllAsRead"
              class="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i class="fas fa-check-double mr-2"></i>
              Mark all read
            </button>

            <button
              v-if="!isSelectMode"
              @click="toggleSelectMode"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-check-square mr-2"></i>
              Select
            </button>

            <button
              v-if="isSelectMode"
              @click="toggleSelectAll"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas" :class="allSelected ? 'fa-square-check' : 'fa-square'" />
              <span class="ml-2">{{ allSelected ? 'Deselect all' : 'Select all' }}</span>
            </button>

            <button
              v-if="isSelectMode && hasSelection"
              @click="handleBulkDelete"
              class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <i class="fas fa-trash mr-2"></i>
              Delete ({{ selectedNotifications.size }})
            </button>

            <button
              v-if="isSelectMode"
              @click="toggleSelectMode"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-6 -mb-px">
          <button
            @click="selectedTab = 'all'"
            class="pb-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="selectedTab === 'all'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            All
            <span class="ml-2 px-2 py-0.5 rounded-full text-xs"
              :class="selectedTab === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'">
              {{ notificationsStore.notifications.length }}
            </span>
          </button>
          <button
            @click="selectedTab = 'unread'"
            class="pb-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="selectedTab === 'unread'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Unread
            <span class="ml-2 px-2 py-0.5 rounded-full text-xs"
              :class="selectedTab === 'unread' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'">
              {{ notificationsStore.unreadCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Loading State -->
      <div v-if="notificationsStore.isLoading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
        <p class="text-gray-500">Loading notifications...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="notificationsStore.error" class="max-w-md mx-auto">
        <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div class="flex items-start">
            <i class="fas fa-exclamation-circle text-red-500 text-xl mt-0.5 mr-3"></i>
            <div>
              <h3 class="text-sm font-semibold text-red-800 mb-1">Error loading notifications</h3>
              <p class="text-sm text-red-700">{{ notificationsStore.error }}</p>
              <button
                @click="notificationsStore.fetchNotifications()"
                class="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div v-else-if="filteredNotifications.length > 0" class="space-y-2">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.notificationId"
          class="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 group"
          :class="{ 'ring-2 ring-blue-500': !notification.isRead }"
        >
          <div class="p-5 flex items-start gap-4">
            <!-- Checkbox (Select Mode) -->
            <div v-if="isSelectMode" class="flex-shrink-0 pt-1">
              <input
                type="checkbox"
                :checked="selectedNotifications.has(notification.notificationId)"
                @change="toggleSelection(notification.notificationId)"
                class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <!-- Icon -->
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              :class="getNotificationColor(notification.type)"
            >
              <i class="fas text-lg" :class="getNotificationIcon(notification.type)"></i>
            </div>

            <!-- Content -->
            <div
              class="flex-1 min-w-0 cursor-pointer"
              @click="handleMarkAsRead(notification)"
            >
              <div class="flex items-start justify-between gap-3 mb-2">
                <h3
                  class="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
                  :class="{ 'font-bold': !notification.isRead }"
                >
                  {{ notification.title }}
                </h3>
                <div class="flex items-center gap-3 flex-shrink-0">
                  <span class="text-sm text-gray-500 whitespace-nowrap">
                    {{ notification.timeAgo }}
                  </span>
                  <div class="w-2.5 h-2.5">
                    <div
                      v-if="!notification.isRead"
                      class="w-2.5 h-2.5 rounded-full bg-blue-500"
                    ></div>
                  </div>
                </div>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed mb-2">
                {{ notification.message }}
              </p>
              <div class="flex items-center gap-3">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getNotificationColor(notification.type)"
                >
                  {{ notification.type }}
                </span>
              </div>
            </div>

            <!-- Delete Button -->
            <button
              v-if="!isSelectMode"
              @click.stop="handleDelete(notification.notificationId)"
              class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 flex-shrink-0"
              title="Delete notification"
            >
              <i class="fas fa-trash text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <i class="fas fa-bell-slash text-4xl text-gray-400"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">
          {{ selectedTab === 'unread' ? 'No unread notifications' : 'No notifications yet' }}
        </h3>
        <p class="text-gray-500 max-w-sm mx-auto">
          {{ selectedTab === 'unread'
            ? 'All caught up! You have no unread notifications.'
            : 'When you receive notifications, they will appear here.'
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
