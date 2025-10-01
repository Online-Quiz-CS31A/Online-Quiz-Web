<script setup lang="ts">
import { ref } from 'vue'
import { Users, BookOpen, Clipboard, Activity, User, Book, Calendar, Clock } from 'lucide-vue-next'

interface Stats {
  activeUsers: number
  activeCourses: number
  quizzesTaken: number
  systemHealth: string
}

interface Activity {
  id: number
  title: string
  status: string
  icon: any
  user: string
  date: string
  timeAgo: string
}

defineEmits<{
  navigate: [section: string]
}>()

const stats = ref<Stats>({
  activeUsers: 1248,
  activeCourses: 87,
  quizzesTaken: 5342,
  systemHealth: 'Optimal'
})

const recentActivity = ref<Activity[]>([
  {
    id: 1,
    title: 'New user registration',
    status: 'Completed',
    icon: User,
    user: 'Sofia Dafirst',
    date: 'September 29, 2025',
    timeAgo: '2 minutes ago'
  },
  {
    id: 2,
    title: 'Course update',
    status: 'In progress',
    icon: Book,
    user: 'Calculus Physics',
    date: 'September 29, 2025',
    timeAgo: '15 minutes ago'
  },
  {
    id: 3,
    title: 'Quiz completion',
    status: 'Completed',
    icon: Clipboard,
    user: 'Automata Midterm',
    date: 'September 29, 2025',
    timeAgo: '1 day ago'
  }
])
</script>


<template>
  <div class="animate-fade-in">
    <h2 class="text-2xl font-semibold text-gray-900">System Overview</h2>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Active Users -->
      <div class="dashboard-card overflow-hidden bg-white rounded-lg shadow transition-all duration-300">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="p-3 bg-indigo-100 rounded-md">
                <Users class="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div class="flex-1 w-0 ml-5">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                <dd>
                  <div class="text-lg font-semibold text-gray-900">{{ stats.activeUsers }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-gray-50">
          <div class="text-sm">
            <a @click.prevent="$emit('navigate', 'users')" href="#" class="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">View all</a>
          </div>
        </div>
      </div>
      
      <!-- Courses -->
      <div class="dashboard-card overflow-hidden bg-white rounded-lg shadow transition-all duration-300">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="p-3 bg-blue-100 rounded-md">
                <BookOpen class="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div class="flex-1 w-0 ml-5">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Active Courses</dt>
                <dd>
                  <div class="text-lg font-semibold text-gray-900">{{ stats.activeCourses }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-gray-50">
          <div class="text-sm">
            <a @click.prevent="$emit('navigate', 'courses')" href="#" class="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">View all</a>
          </div>
        </div>
      </div>
      
      <!-- Quizzes -->
      <div class="dashboard-card overflow-hidden bg-white rounded-lg shadow transition-all duration-300">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="p-3 bg-green-100 rounded-md">
                <Clipboard class="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div class="flex-1 w-0 ml-5">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Quizzes Taken</dt>
                <dd>
                  <div class="text-lg font-semibold text-gray-900">{{ stats.quizzesTaken }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-gray-50">
          <div class="text-sm">
            <a @click.prevent="$emit('navigate', 'quiz-settings')" href="#" class="font-medium text-green-600 hover:text-green-500 cursor-pointer">View stats</a>
          </div>
        </div>
      </div>
      
      <!-- System Health -->
      <div class="dashboard-card overflow-hidden bg-white rounded-lg shadow transition-all duration-300">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="p-3 bg-purple-100 rounded-md">
                <Activity class="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div class="flex-1 w-0 ml-5">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">System Health</dt>
                <dd>
                  <div class="text-lg font-semibold text-gray-900">{{ stats.systemHealth }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-gray-50">
          <div class="text-sm">
            <a @click.prevent="$emit('navigate', 'analytics')" href="#" class="font-medium text-purple-600 hover:text-purple-500 cursor-pointer">View details</a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="mt-8">
      <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
      <div class="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="activity in recentActivity" :key="activity.id">
            <div class="block hover:bg-gray-50 transition-colors">
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-blue-600 truncate">{{ activity.title }}</p>
                  <div class="flex flex-shrink-0 ml-2">
                    <p :class="[
                      'inline-flex px-2 text-xs font-semibold leading-5 rounded-full',
                      activity.status === 'Completed' ? 'text-green-800 bg-green-100' : 'text-blue-800 bg-blue-100'
                    ]">
                      {{ activity.status }}
                    </p>
                  </div>
                </div>
                <div class="mt-2 sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-500">
                      <component :is="activity.icon" class="mr-1.5 w-4 h-4 text-gray-400" />
                      {{ activity.user }}
                    </p>
                    <p class="flex items-center mt-2 text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      <Calendar class="mr-1.5 w-4 h-4 text-gray-400" />
                      <time :datetime="activity.date">{{ activity.date }}</time>
                    </p>
                  </div>
                  <div class="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
                    <Clock class="mr-1.5 w-4 h-4 text-gray-400" />
                    {{ activity.timeAgo }}
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
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
