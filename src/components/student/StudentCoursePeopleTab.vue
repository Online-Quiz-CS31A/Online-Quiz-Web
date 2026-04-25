<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ClassmateDto } from '@/services/types'

const props = defineProps<{
  teacherName: string | null
  classmates: ClassmateDto[]
}>()

const searchQuery = ref('')

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const filteredClassmates = computed(() => {
  if (!searchQuery.value) return props.classmates
  const query = searchQuery.value.toLowerCase()
  return props.classmates.filter(mate =>
    (mate.fullName || '').toLowerCase().includes(query) ||
    (mate.studentSection || '').toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="space-y-4">
    <!-- Instructor -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div class="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <i class="fas fa-chalkboard-teacher text-gray-500"></i>
          Instructor
        </h3>
      </div>
      <div class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-lg bg-gray-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
            {{ (props.teacherName || 'U').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() }}
          </div>
          <div class="text-sm font-medium text-gray-900">{{ props.teacherName }}</div>
        </div>
      </div>
    </div>

    <!-- Classmates -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div class="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <i class="fas fa-users text-gray-500"></i>
            Classmates
            <span class="text-xs font-normal text-gray-500">({{ props.classmates.length }})</span>
          </h3>
        </div>
      </div>

      <!-- Search -->
      <div class="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div class="relative">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search classmates..."
            class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="props.classmates.length === 0" class="px-6 py-12 text-center">
        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-user-friends text-xl text-gray-400"></i>
        </div>
        <p class="text-sm text-gray-500">No classmates enrolled</p>
      </div>

      <!-- Classmates Grid -->
      <div v-else-if="filteredClassmates.length > 0" class="p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="mate in filteredClassmates"
            :key="mate.userId"
            class="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'h-10 w-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm',
                  getAvatarColor(mate.fullName || '')
                ]"
              >
                {{ getInitials(mate.fullName || '??') }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">
                  {{ mate.fullName || 'Unknown' }}
                </div>
                <div v-if="mate.studentSection" class="text-xs text-gray-500 truncate flex items-center gap-1">
                  <i class="fas fa-tag text-gray-400"></i>
                  {{ mate.studentSection }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Search Results -->
      <div v-else class="px-6 py-12 text-center">
        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-search text-xl text-gray-400"></i>
        </div>
        <p class="text-sm text-gray-500 mb-2">No results for "{{ searchQuery }}"</p>
        <button
          @click="searchQuery = ''"
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear search
        </button>
      </div>
    </div>
  </div>
</template>
