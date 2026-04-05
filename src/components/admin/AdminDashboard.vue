<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Users, BookOpen, Clipboard, Activity as ActivityIcon, User, Book, Calendar, Clock } from 'lucide-vue-next'
import type { Stats, Activity } from '@/interfaces/interfaces'
import { useAdminStore } from '@/stores/adminStore'
import { storeToRefs } from 'pinia'
import SkeletonStats from '@/components/skeletons/SkeletonStats.vue'
import SkeletonList from '@/components/skeletons/SkeletonList.vue'

// EMITS
defineEmits<{
  navigate: [section: string]
}>()

// STORE
const adminStore = useAdminStore()
const { stats, recentActivity, isLoading } = storeToRefs(adminStore)

// LIFECYCLE
onMounted(() => {
  adminStore.fetchDashboardStats()
  adminStore.fetchActivityLogs()
})
</script>


<template>
  <div class="p-6 space-y-6">
    <!-- Stats Cards -->
    <SkeletonStats v-if="isLoading" />
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Active Users -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" @click="$emit('navigate', 'users')">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-600">Active Users</p>
            <p class="text-3xl font-bold text-blue-900 mt-2">{{ stats.activeUsers }}</p>
            <p class="text-xs font-medium text-blue-700 mt-2">Click to manage</p>
          </div>
          <div class="p-3 bg-blue-200 rounded-xl">
            <Users class="w-7 h-7 text-blue-700" />
          </div>
        </div>
      </div>
      
      <!-- Courses -->
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" @click="$emit('navigate', 'courses')">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-600">Active Courses</p>
            <p class="text-3xl font-bold text-green-900 mt-2">{{ stats.activeCourses }}</p>
            <p class="text-xs font-medium text-green-700 mt-2">Click to view all</p>
          </div>
          <div class="p-3 bg-green-200 rounded-xl">
            <BookOpen class="w-7 h-7 text-green-700" />
          </div>
        </div>
      </div>
      
      <!-- Quizzes -->
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" @click="$emit('navigate', 'quiz-settings')">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-purple-600">Quizzes Taken</p>
            <p class="text-3xl font-bold text-purple-900 mt-2">{{ stats.quizzesTaken }}</p>
            <p class="text-xs font-medium text-purple-700 mt-2">View statistics</p>
          </div>
          <div class="p-3 bg-purple-200 rounded-xl">
            <Clipboard class="w-7 h-7 text-purple-700" />
          </div>
        </div>
      </div>
      
      <!-- System Health -->
      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" @click="$emit('navigate', 'analytics')">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-orange-600">System Health</p>
            <p class="text-3xl font-bold text-orange-900 mt-2">{{ stats.systemHealth }}</p>
            <p class="text-xs font-medium text-orange-700 mt-2">View analytics</p>
          </div>
          <div class="p-3 bg-orange-200 rounded-xl">
            <ActivityIcon class="w-7 h-7 text-orange-700" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <SkeletonList v-if="isLoading" />
      <div v-else class="space-y-3">
        <div v-if="recentActivity.length === 0" class="text-center text-gray-500 py-4">No recent activity</div>
        <div v-for="activity in recentActivity" :key="activity.id" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white rounded-lg border border-gray-200">
                <component :is="activity.icon" class="w-4 h-4 text-gray-600" />
              </div>
              <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
            </div>
            <span :class="[
              'inline-flex px-3 py-1 text-xs font-semibold rounded-full border',
              activity.status === 'Completed' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
            ]">
              {{ activity.status }}
            </span>
          </div>
          <div class="flex items-center gap-4 ml-11 text-xs text-gray-500">
            <span class="flex items-center gap-1">
              <User :size="12" />
              {{ activity.user }}
            </span>
            <span class="flex items-center gap-1">
              <Calendar :size="12" />
              {{ activity.date }}
            </span>
            <span class="flex items-center gap-1">
              <Clock :size="12" />
              {{ activity.timeAgo }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.dashboard-card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}
</style>
