<script setup lang="ts">
import type { Student } from '@/interfaces/interfaces'

const props = defineProps<{
  teacherName: string | null
  students: Student[]
}>()
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
        <span class="text-sm text-gray-500">{{ props.students.length }} students</span>
      </div>
      <div class="divide-y divide-gray-100">
        <div
          v-for="s in props.students"
          :key="s.id"
          class="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
        >
          <img
            :src="(s as any).avatar || ''"
            :alt="s.name"
            class="h-10 w-10 rounded-full object-cover flex-shrink-0"
          />
          <div class="font-medium text-gray-900">{{ s.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
