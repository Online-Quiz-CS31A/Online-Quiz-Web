<script setup lang="ts">
import { computed } from 'vue'

// TYPES
interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
}

interface Props {
  notifications: Notification[]
  show: boolean
}

// PROPS
const props = defineProps<Props>()

// EMITS
const emit = defineEmits<{
  close: []
  markAsRead: [id: number]
  markAllAsRead: []
}>()

// COMPUTED
const unreadCount = computed(() => {
  return props.notifications.filter(n => !n.read).length
})
</script>

<template>
  <!-- Notification Dropdown -->
  <div 
    v-if="show" 
    class="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 max-h-[32rem] overflow-hidden flex flex-col border border-gray-100 animate-slideDown"
  >
    <!-- Header -->
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
    
    <!-- Notification List -->
    <div class="overflow-y-auto flex-1 divide-y divide-gray-50">
      <div 
        v-for="notif in notifications" 
        :key="notif.id"
        @click="emit('markAsRead', notif.id)"
        class="px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 cursor-pointer group"
        :class="{ 'bg-blue-50/30': !notif.read }"
      >
        <div class="flex items-start gap-4">
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3 mb-1">
              <h4 
                class="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1"
                :class="{ 'font-bold': !notif.read }"
              >
                {{ notif.title }}
              </h4>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ notif.time }}</span>
                <div class="w-2.5 h-2.5 flex-shrink-0">
                  <div 
                    v-if="!notif.read" 
                    class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"
                  ></div>
                </div>
              </div>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {{ notif.message }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="notifications.length === 0" class="px-5 py-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <i class="fas fa-bell-slash text-2xl text-gray-400"></i>
        </div>
        <h4 class="text-sm font-semibold text-gray-700 mb-1">All caught up!</h4>
        <p class="text-xs text-gray-500">You have no notifications at the moment</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="px-5 py-3 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
      <button class="text-sm text-blue-600 hover:text-blue-700 font-semibold w-full text-center py-2 rounded-lg hover:bg-blue-50 transition-all cursor-pointer">
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
