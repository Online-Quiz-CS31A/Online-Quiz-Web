<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { StudentQuiz } from '@/interfaces/interfaces'
import { formatDueDate } from '@/utils/dateFormatter'
import quiz1 from '@/assets/image/quiz_bg/Screenshot 2025-08-21 103442.webp'
import quiz2 from '@/assets/image/quiz_bg/Screenshot 2025-08-21 103614.webp'
import quiz3 from '@/assets/image/quiz_bg/liquid-cheese.webp'
import quiz4 from '@/assets/image/quiz_bg/radiant-gradient.webp'
import quiz5 from '@/assets/image/quiz_bg/subtle-prism.webp'

// TYPES
interface Props {
  quizzes?: StudentQuiz[]
  hideAppHeader?: boolean
  viewMode?: 'cards' | 'rows'
  isLoading?: boolean
}

// CONSTANTS
const coverImages = [quiz1, quiz2, quiz3, quiz4, quiz5]
const router = useRouter()

// PROPS
const props = withDefaults(defineProps<Props>(), {
  hideAppHeader: false,
  viewMode: 'cards',
  isLoading: false,
})

// EMITS
const emit = defineEmits<{
  'view-all': []
}>()

// REACTIVE
const quizzesStore = useQuizzesStore()

// COMPUTED
const displayedQuizzes = computed(() => {
  const quizzes = props.quizzes ?? quizzesStore.myStudentQuizzes
  
  // Sort quizzes: unanswered first, then answered, both sorted by date (newest to oldest)
  return [...quizzes].sort((a, b) => {
    const aAnswered = isAnswered(a.id)
    const bAnswered = isAnswered(b.id)
    
    // If one is answered and the other is not, unanswered comes first
    if (aAnswered !== bAnswered) {
      return aAnswered ? 1 : -1
    }
    
    // Both have the same answered status, sort by due date (newest to oldest)
    const aDate = new Date(a.dueDate).getTime()
    const bDate = new Date(b.dueDate).getTime()
    return bDate - aDate
  })
})

onMounted(() => {
  if (!props.quizzes) {
    quizzesStore.fetchStudentQuizzesAsync()
  }
})

// METHODS
const getDeterministicIndex = (key: string) => {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getCoverStyle = (quiz: StudentQuiz) => {
  // Try to match quiz title/course to appropriate background
  const quizTitle = quiz.title.toLowerCase()
  const courseName = (quiz.courseName || '').toLowerCase()

  let imageIndex = 0

  // Computer Science / Programming quizzes
  if (quizTitle.includes('programming') ||
      quizTitle.includes('automata') ||
      quizTitle.includes('algorithm') ||
      quizTitle.includes('code') ||
      quizTitle.includes('software') ||
      courseName.includes('programming') ||
      courseName.includes('automata') ||
      courseName.includes('cs')) {
    imageIndex = 3 // radiant-gradient - tech theme
  }
  // Math / Science quizzes
  else if (quizTitle.includes('math') ||
           quizTitle.includes('calculus') ||
           quizTitle.includes('physics') ||
           courseName.includes('math') ||
           courseName.includes('science')) {
    imageIndex = 4 // subtle-prism
  }
  // Practice / Test quizzes
  else if (quizTitle.includes('practice') ||
           quizTitle.includes('test') ||
           quizTitle.includes('exam')) {
    imageIndex = 2 // liquid-cheese
  }
  // Default: use deterministic hash for other quizzes
  else {
    const hash = getDeterministicIndex(`${quiz.id}-${quiz.title}`)
    imageIndex = hash % coverImages.length
  }

  const url = coverImages[imageIndex]
  return {
    backgroundImage: `url(${url})`
  }
}

const isDone = (quizId: number) => quizzesStore.isQuizMarkedDone(quizId)

const toggleDone = (quizId: number) => {
  quizzesStore.toggleQuizDone(quizId)
}

const isAnswered = (quizId: number) => {
  // Check backend-backed submitted quiz IDs first (authoritative)
  if (quizzesStore.hasSubmittedAttempt(quizId)) {
    return true
  }
  // Fallback to localStorage for backwards compatibility
  const history = quizzesStore.getQuizAttemptHistory(quizId)
  return history.length > 0
}

const getStatusLabel = (quizId: number) => (isAnswered(quizId) ? 'Answered' : 'Unanswered')

const getStatusClass = (quizId: number) => (isAnswered(quizId) ? 'text-green-700' : 'text-yellow-700')
</script>

<template>
  <div class="mb-8">
    <div v-if="!props.hideAppHeader" class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">My Quizzes</h2>
      <button @click="emit('view-all')" type="button" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button>
    </div>

    <!-- Loading State -->
    <div v-if="props.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
        <div class="h-32 bg-gray-200"></div>
        <div class="p-4 space-y-3">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-gray-200 rounded"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-gray-200 rounded"></div>
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div class="flex items-center justify-between pt-2">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="displayedQuizzes.length === 0" class="p-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200">
      <div class="relative mb-6">
        <div class="w-24 h-24 bg-gradient-to-br from-purple-50 to-pink-100 rounded-full flex items-center justify-center">
          <i class="fas fa-file-lines text-4xl text-purple-400"></i>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No Quizzes Available</h3>
      <p class="text-gray-500 max-w-md">
        You don't have any quizzes at the moment. Check back later for new assignments from your teachers.
      </p>
    </div>

    <div v-else-if="props.viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="quiz in displayedQuizzes"
        :key="quiz.id"
        class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer"
        @click="router.push({ name: 'student-prequiz', params: { quizId: quiz.id } })"
      >
        <!-- AppHeader with background image -->
        <div class="relative h-32 overflow-hidden">
          <div
            class="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-300"
            :style="getCoverStyle(quiz)"
          ></div>
          <div class="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-800/50 to-transparent"></div>

          <!-- Status badge -->
          <div class="absolute top-3 right-3">
            <span
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
              :class="isAnswered(quiz.id)
                ? 'bg-green-500/90 text-white'
                : 'bg-yellow-500/90 text-white'"
            >
              <span class="w-1.5 h-1.5 rounded-full mr-1.5"
                :class="isAnswered(quiz.id) ? 'bg-green-200' : 'bg-yellow-200'">
              </span>
              {{ getStatusLabel(quiz.id) }}
            </span>
          </div>

          <!-- Quiz title -->
          <div class="absolute bottom-3 left-4 right-4">
            <h3 class="text-lg font-bold text-white line-clamp-2 drop-shadow-lg">
              {{ quiz.title }}
            </h3>
          </div>
        </div>

        <!-- Card body -->
        <div class="p-4 space-y-3">
          <!-- Course info -->
          <div class="bg-blue-50 rounded-lg px-4 py-3">
            <div class="flex items-center gap-2.5">
              <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div class="flex-1 min-w-0">
                <div class="text-base leading-relaxed">
                  <span class="font-semibold text-blue-700">{{ quiz.courseCode }}</span>
                  <span class="text-gray-700"> - {{ quiz.subject }}</span>
                  <span v-if="quiz.courseSection" class="text-gray-500 text-sm ml-2">
                    ({{ quiz.courseSection }})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Due date -->
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-5 h-5 mr-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="font-medium text-gray-700">Due:</span>
            <span class="ml-1.5">{{ formatDueDate(quiz.dueDate) }}</span>
          </div>

          <!-- Time limit -->
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-5 h-5 mr-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium text-gray-700">Time:</span>
            <span class="ml-1.5">{{ quiz.timeLimit }}</span>
          </div>

          <!-- Action button -->
          <div class="pt-2 flex items-center justify-between">
            <button
              @click.stop="toggleDone(quiz.id)"
              class="text-sm font-medium transition-colors"
              :class="isDone(quiz.id)
                ? 'text-gray-500 cursor-default flex items-center'
                : 'text-gray-500 hover:text-blue-600'"
            >
              <svg v-if="isDone(quiz.id)" class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              {{ isDone(quiz.id) ? 'Completed' : 'Mark as done' }}
            </button>

            <button
              class="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform"
            >
              {{ isAnswered(quiz.id) ? 'View Results' : 'Start Quiz' }}
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="quiz in displayedQuizzes"
        :key="quiz.id"
        class="rounded-lg border border-gray-200 bg-white overflow-hidden cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-300"
        @click="router.push({ name: 'student-prequiz', params: { quizId: quiz.id } })"
      >
        <div class="flex items-stretch min-h-[140px]">
          <div class="hidden md:block w-48 bg-cover bg-center" :style="getCoverStyle(quiz)"></div>
          <div class="flex-1 p-5 flex items-center">
            <div class="flex items-start justify-between w-full gap-4">
              <div class="flex-1">
                <!-- Course info -->
                <div class="bg-blue-50 rounded-lg px-4 py-2.5 mb-3 inline-flex items-center gap-2.5">
                  <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div class="text-base leading-relaxed">
                    <span class="font-semibold text-blue-700">{{ quiz.courseCode }}</span>
                    <span class="text-gray-700"> - {{ quiz.subject }}</span>
                    <span v-if="quiz.courseSection" class="text-gray-500 text-sm ml-2">
                      ({{ quiz.courseSection }})
                    </span>
                  </div>
                </div>

                <!-- Quiz title -->
                <div class="text-lg font-semibold text-gray-900 mb-3">{{ quiz.title }}</div>

                <!-- Meta info -->
                <div class="flex items-center gap-6 text-sm text-gray-600">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="font-medium">Due:</span>
                    <span class="ml-1">{{ formatDueDate(quiz.dueDate) }}</span>
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium">Time:</span>
                    <span class="ml-1">{{ quiz.timeLimit }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="font-medium">Status:</span>
                    <span class="ml-1.5 font-medium" :class="getStatusClass(quiz.id)">
                      {{ getStatusLabel(quiz.id) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Action button -->
              <div class="flex flex-col gap-2">
                <button
                  @click.stop="toggleDone(quiz.id)"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  :class="isDone(quiz.id) ? 'bg-gray-100 text-gray-600 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700'"
                >
                  {{ isDone(quiz.id) ? 'Completed' : 'Mark as done' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-card {
  transition: all 0.3s ease;
}

.quiz-card:hover {
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
