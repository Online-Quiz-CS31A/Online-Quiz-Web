<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { MyScoreItem } from '@/interfaces/interfaces'

const props = defineProps<{ courseName: string }>()

const quizzesStore = useQuizzesStore()

const scoreFilter = ref<'all' | 'answered' | 'unanswered'>('all')

const myScores = computed<MyScoreItem[]>(() => {
  const courseName = props.courseName || ''
  const all = quizzesStore.myStudentQuizzes.filter((q) => q.subject === courseName)

  return all.map((q) => {
    let total = 0
    let score = 0

    // Get score from API only
    const apiScore = quizzesStore.attemptScores[q.id]
    if (apiScore) {
      score = apiScore.score
      total = apiScore.totalPoints
    }

    const percent = total > 0 ? Math.round((score / total) * 100) : 0

    // Check submission status
    const hasSubmitted = quizzesStore.hasSubmittedAttempt(q.id)
    const status: 'Answered' | 'Unanswered' = hasSubmitted ? 'Answered' : 'Unanswered'

    return {
      title: q.title,
      score,
      total,
      percent,
      due: q.dueDate,
      status,
    }
  })
})

const filteredScores = computed<MyScoreItem[]>(() => {
  if (scoreFilter.value === 'all') return myScores.value
  if (scoreFilter.value === 'answered') return myScores.value.filter((s) => s.status === 'Answered')
  return myScores.value.filter((s) => s.status === 'Unanswered')
})

onMounted(() => {
  // Scores are loaded from API via fetchStudentQuizzesAsync
})
</script>

<template>
  <div class="space-y-6">
    <!-- No Scores at All -->
    <div
      v-if="myScores.length === 0"
      class="bg-white rounded-lg shadow border border-gray-200 p-12 flex flex-col items-center justify-center text-center"
    >
      <div class="relative mb-6">
        <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
          <i class="fas fa-chart-line text-4xl text-blue-400"></i>
        </div>
        <div
          class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <i class="fas fa-star text-white text-sm"></i>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No Scores Yet</h3>
      <p class="text-gray-500 max-w-md mb-6">
        You haven't completed any quizzes for this course yet. Start taking quizzes to see your
        scores here!
      </p>
      <div class="flex items-center gap-2 text-sm text-gray-400">
        <i class="fas fa-info-circle"></i>
        <span>Your quiz scores and progress will be tracked here</span>
      </div>
    </div>

    <!-- Scores Available -->
    <div v-else class="bg-white rounded-lg shadow border border-gray-200">
      <!-- Filter dropdown -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="relative w-full max-w-sm">
          <label class="block text-xs text-gray-500 mb-2">Task filter</label>
          <select
            v-model="scoreFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="all">All</option>
            <option value="answered">Answered</option>
            <option value="unanswered">Unanswered</option>
          </select>
          <i class="fas fa-chevron-down absolute right-4 top-10 text-gray-400 pointer-events-none"></i>
        </div>
      </div>

      <!-- Scores list -->
      <div class="divide-y divide-gray-100">
        <div
          v-for="q in filteredScores"
          :key="q.title"
          class="px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div class="flex-1">
            <h4 class="font-medium text-gray-900 mb-1">{{ q.title }}</h4>
            <p class="text-sm text-gray-500">Due {{ q.due }}</p>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <div class="text-sm text-gray-500 mb-1">Status</div>
              <div
                class="text-sm font-medium"
                :class="q.status === 'Answered' ? 'text-gray-700' : 'text-red-600'"
              >
                {{ q.status }}
              </div>
            </div>
            <div class="text-right min-w-[80px]">
              <div class="text-2xl font-semibold text-gray-900">{{ q.score }}/{{ q.total }}</div>
            </div>
          </div>
        </div>

        <!-- Empty Filtered Results -->
        <div
          v-if="filteredScores.length === 0"
          class="px-6 py-12 flex flex-col items-center justify-center text-center"
        >
          <div class="relative mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center">
              <i class="fas fa-filter text-3xl text-gray-300"></i>
            </div>
          </div>
          <h4 class="text-lg font-semibold text-gray-700 mb-2">No Matching Scores</h4>
          <p class="text-gray-500 max-w-sm mb-4">
            No scores match your current filter. Try selecting a different filter option.
          </p>
          <button
            @click="scoreFilter = 'all'"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <i class="fas fa-undo mr-2"></i>Clear Filter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
