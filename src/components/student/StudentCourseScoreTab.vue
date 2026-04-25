<script setup lang="ts">
import { ref, computed } from 'vue'
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

    const apiScore = quizzesStore.attemptScores[q.id]
    if (apiScore) {
      score = apiScore.score
      total = apiScore.totalPoints
    }

    const percent = total > 0 ? Math.round((score / total) * 100) : 0
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

const getScoreColor = (percent: number) => {
  if (percent >= 90) return 'text-green-600'
  if (percent >= 75) return 'text-blue-600'
  if (percent >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Empty State -->
    <div
      v-if="myScores.length === 0"
      class="bg-white border border-gray-200 rounded-lg p-16 text-center"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-clipboard-list text-2xl text-gray-400"></i>
      </div>
      <h3 class="text-base font-semibold text-gray-900 mb-1">No quiz scores yet</h3>
      <p class="text-sm text-gray-500">Complete quizzes to see your scores here</p>
    </div>

    <!-- Scores List -->
    <div v-else>
      <!-- Filter Tabs -->
      <div class="bg-white border border-gray-200 rounded-lg mb-4">
        <div class="border-b border-gray-200 px-6 py-3">
          <div class="flex gap-6">
            <button
              @click="scoreFilter = 'all'"
              :class="[
                'pb-3 border-b-2 text-sm font-medium transition-colors',
                scoreFilter === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              All
            </button>
            <button
              @click="scoreFilter = 'answered'"
              :class="[
                'pb-3 border-b-2 text-sm font-medium transition-colors',
                scoreFilter === 'answered'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Completed
            </button>
            <button
              @click="scoreFilter = 'unanswered'"
              :class="[
                'pb-3 border-b-2 text-sm font-medium transition-colors',
                scoreFilter === 'unanswered'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      <!-- Quiz Cards -->
      <div class="space-y-3">
        <div
          v-for="q in filteredScores"
          :key="q.title"
          class="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
        >
          <div class="px-6 py-4">
            <div class="flex items-center justify-between gap-4">
              <!-- Quiz Info -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-gray-900 mb-1">{{ q.title }}</h4>
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <span class="flex items-center gap-1">
                    <i class="far fa-calendar"></i>
                    {{ formatDate(q.due) }}
                  </span>
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium',
                      q.status === 'Answered'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    ]"
                  >
                    <i :class="q.status === 'Answered' ? 'fas fa-check-circle' : 'far fa-clock'"></i>
                    {{ q.status }}
                  </span>
                </div>
              </div>

              <!-- Score Display -->
              <div class="flex items-center gap-6">
                <!-- Percentage -->
                <div v-if="q.status === 'Answered'" class="text-right">
                  <div :class="['text-2xl font-bold', getScoreColor(q.percent)]">
                    {{ q.percent }}%
                  </div>
                </div>

                <!-- Points -->
                <div class="text-right">
                  <div class="text-xs text-gray-500 mb-0.5">Score</div>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ q.score }}<span class="text-gray-400">/{{ q.total }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="q.status === 'Answered'" class="h-1 bg-gray-100">
            <div
              :class="[
                'h-full transition-all',
                q.percent >= 90 ? 'bg-green-500' :
                q.percent >= 75 ? 'bg-blue-500' :
                q.percent >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              ]"
              :style="{ width: `${q.percent}%` }"
            ></div>
          </div>
        </div>

        <!-- Empty Filter Results -->
        <div
          v-if="filteredScores.length === 0"
          class="bg-white border border-gray-200 rounded-lg px-6 py-12 text-center"
        >
          <p class="text-sm text-gray-500 mb-3">No quizzes match the selected filter</p>
          <button
            @click="scoreFilter = 'all'"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
