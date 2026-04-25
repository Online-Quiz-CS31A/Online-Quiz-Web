<script setup lang="ts">
import type { ClassmateDto } from '@/services/types'

const props = defineProps<{
  teacherName: string | null
  classmates: ClassmateDto[]
}>()

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}
</script>

<template>
  <div class="space-y-8">
    <!-- Teachers Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-2xl font-semibold text-gray-900">Teachers</h2>
      </div>
      <div class="px-6 py-5">
        <div
          class="flex items-center gap-4 hover:bg-gray-50 -mx-6 px-6 py-3 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0"
          >
            {{ (props.teacherName || 'U').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() }}
          </div>
          <div class="font-medium text-gray-900">{{ props.teacherName }}</div>
        </div>
      </div>
    </div>

    <!-- Classmates Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-900">Classmates</h2>
        <span class="text-sm text-gray-500">{{ props.classmates.length }} students</span>
      </div>
      <div v-if="props.classmates.length === 0" class="px-6 py-8 text-center text-gray-400">
        No classmates found.
      </div>
      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="mate in props.classmates"
          :key="mate.userId"
          class="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm"
          >
            {{ getInitials(mate.fullName || '??') }}
          </div>
          <div>
            <div class="font-medium text-gray-900">{{ mate.fullName || 'Unknown' }}</div>
            <div v-if="mate.studentSection" class="text-xs text-gray-500">{{ mate.studentSection }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>