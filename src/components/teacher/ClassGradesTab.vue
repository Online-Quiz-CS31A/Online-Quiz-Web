<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { GradeRow, GradeCol } from '@/interfaces/interfaces'

const props = defineProps<{ 
  rows: GradeRow[],
  getAvatarByEmail: (email: string) => string,
}>()

const emit = defineEmits<{
  (e: 'export'): void,
  (e: 'sort', col: GradeCol): void,
  (e: 'view', row: GradeRow): void,
}>()
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow border border-gray-200">
      <div class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-200">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">Gradebook</h2>
        </div>
        <div class="flex items-center gap-2">
          <button @click="$emit('export')" class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">Export</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="$emit('sort', 'name')">Student</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="$emit('sort', 'quizzes')">Quizzes</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="$emit('sort', 'final')">Final</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="row in props.rows" :key="row.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img :src="props.getAvatarByEmail(row.email)" :alt="row.name" class="h-8 w-8 rounded-full object-cover ring-2 ring-blue-100" />
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ row.name }}</div>
                    <div class="text-xs text-gray-500">{{ row.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ row.quizzes }}%</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500" :style="{ width: row.final + '%' }"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-800">{{ row.final }}%</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm">
                <button @click="$emit('view', row)" class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
