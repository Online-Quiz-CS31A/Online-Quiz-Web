<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue'
import type { GradeRow, GradeCol, QuizBreakdown } from '@/interfaces/interfaces'

const props = defineProps<{ 
  rows: GradeRow[],
  getAvatarByEmail: (email: string) => string,
  breakdown: QuizBreakdown[],
}>()

const emit = defineEmits<{
  (e: 'export'): void,
  (e: 'sort', col: GradeCol): void,
  (e: 'view', row: GradeRow): void,
}>()

const selectedRow = ref<GradeRow | null>(null)

const isDetailView = computed(() => selectedRow.value !== null)

function openDetail(row: GradeRow) {
  selectedRow.value = row
  emit('view', row)
}

function goBackToList() {
  selectedRow.value = null
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow border border-gray-200">
      <div class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <button
            v-if="isDetailView"
            @click="goBackToList"
            class="inline-flex items-center px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            Back to Gradebook
          </button>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">
              <span v-if="!isDetailView">Gradebook</span>
              <span v-else>{{ selectedRow?.name }}'s Grades</span>
            </h2>
            <p v-if="isDetailView" class="text-xs text-gray-500 mt-0.5">
              {{ selectedRow?.email }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2" v-if="!isDetailView">
          <button @click="$emit('export')" class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">Export</button>
        </div>
      </div>
      <div v-if="isDetailView" class="px-6 py-5">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <img
              v-if="selectedRow"
              :src="props.getAvatarByEmail(selectedRow.email)"
              :alt="selectedRow.name"
              class="h-12 w-12 rounded-full object-cover ring-2 ring-blue-100"
            />
            <div>
              <div class="text-base font-semibold text-gray-900">{{ selectedRow?.name }}</div>
              <div class="text-xs text-gray-500">{{ selectedRow?.email }}</div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quiz</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mark</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="q in props.breakdown" :key="q.title">
                <td class="px-6 py-3 text-sm text-gray-900">{{ q.title }}</td>
                <td class="px-6 py-3 text-sm text-gray-600">{{ q.due }}</td>
                <td class="px-6 py-3 text-sm">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="q.status === 'Submitted'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'"
                  >
                    {{ q.status }}
                  </span>
                </td>
                <td class="px-6 py-3 text-sm font-medium text-gray-900">
                  {{ q.score }}/{{ q.total }}
                </td>
                <td class="px-6 py-3 text-sm text-gray-800">
                  {{ q.percent }}%
                </td>
              </tr>
              <tr v-if="props.breakdown.length === 0">
                <td colspan="5" class="px-6 py-4 text-sm text-gray-500 text-center">
                  No quiz scores available for this student yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="$emit('sort', 'name')">Student</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="$emit('sort', 'quizzes')">Quizzes</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="$emit('sort', 'final')">Progress</th>
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
                <button @click="openDetail(row)" class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
