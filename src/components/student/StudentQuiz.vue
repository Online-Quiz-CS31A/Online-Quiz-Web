<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { StudentQuiz } from '@/interfaces/interfaces'
import quiz1 from '@/assets/image/quiz_bg/Screenshot 2025-08-21 103442.png'
import quiz2 from '@/assets/image/quiz_bg/Screenshot 2025-08-21 103614.png'
import quiz3 from '@/assets/image/quiz_bg/liquid-cheese.png'
import quiz4 from '@/assets/image/quiz_bg/radiant-gradient.png'
import quiz5 from '@/assets/image/quiz_bg/subtle-prism.png'

// TYPES
interface Props {
  quizzes?: StudentQuiz[]
  hideHeader?: boolean
  viewMode?: 'cards' | 'rows'
}

// CONSTANTS
const coverImages = [quiz1, quiz2, quiz3, quiz4, quiz5]
const router = useRouter()

// PROPS
const props = withDefaults(defineProps<Props>(), {
  hideHeader: false,
  viewMode: 'cards',
})

// EMITS
const emit = defineEmits<{
  'view-all': []
}>()

// REACTIVE
const quizzesStore = useQuizzesStore()
const doneMap = reactive<Record<number, boolean>>({})

// COMPUTED
const displayedQuizzes = computed(() => props.quizzes ?? quizzesStore.myStudentQuizzes)


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
  const index = getDeterministicIndex(`${quiz.id}-${quiz.title}`)
  const url = coverImages[index % coverImages.length]
  return {
    backgroundImage: `url(${url})`
  }
}
</script>

<template>
  <div class="mb-8">
    <div v-if="!props.hideHeader" class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">My Quizzes</h2>
      <button @click="emit('view-all')" type="button" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button>
    </div>
    
    <div v-if="props.viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="quiz in displayedQuizzes" 
        :key="quiz.id"
        class="quiz-card rounded-xl shadow-md overflow-hidden cursor-pointer"
        :style="{ ...getCoverStyle(quiz), backgroundSize: 'cover', backgroundPosition: 'center' }"
        @click="router.push({ name: 'student-prequiz', params: { quizId: quiz.id } })"
      >
        <div class="p-5 text-white">
          <div class="flex justify-end items-start mb-3">
            <span class="text-xs text-white">Due: {{ quiz.dueDate }}</span>
          </div>
          <h3 class="text-lg font-bold text-white mb-4">{{ quiz.title }}</h3>
          <div class="flex items-center justify-between">
            <div></div>
            <button 
              @click.stop="doneMap[quiz.id] = true"
              :disabled="doneMap[quiz.id]"
              class="text-sm font-medium transition-colors"
              :class="doneMap[quiz.id] ? 'text-green-200 cursor-default' : 'text-white hover:opacity-90'"
            >
              {{ doneMap[quiz.id] ? 'Done' : 'Mark as done' }}
            </button>
          </div>
        </div>
        <div class="bg-white px-5 py-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Time: {{ quiz.timeLimit }}</span>
            <div class="flex items-center">
              <span class="text-xs text-gray-500 mr-2">Status:</span>
              <span class="text-xs font-medium" :class="doneMap[quiz.id] ? 'text-green-600' : 'text-yellow-600'">{{ doneMap[quiz.id] ? 'Done' : quiz.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="quiz in displayedQuizzes"
        :key="quiz.id"
        class="rounded-lg border border-gray-200 bg-white overflow-hidden"
      >
        <div class="flex items-stretch min-h-[120px]">
          <div class="hidden md:block w-48 bg-cover bg-center" :style="getCoverStyle(quiz)"></div>
          <div class="flex-1 p-4 flex items-center">
            <div class="flex items-start justify-between w-full">
              <div>
                <div class="text-xs text-gray-500 mb-1">Due: {{ quiz.dueDate }}</div>
                <div class="text-base font-semibold text-gray-900 mb-1">{{ quiz.title }}</div>
                
                <div class="mt-3 flex items-center gap-4 text-xs text-gray-600">
                  <span>Time: {{ quiz.timeLimit }}</span>
                  <span>
                    Status:
                    <span class="font-medium" :class="doneMap[quiz.id] ? 'text-green-700' : 'text-yellow-700'">
                      {{ doneMap[quiz.id] ? 'Done' : quiz.status }}
                    </span>
                  </span>
                </div>
              </div>
              <div class="ml-3">
                <button 
                  @click.stop="doneMap[quiz.id] = true"
                  :disabled="doneMap[quiz.id]"
                  class="px-3 py-1.5 rounded-md text-sm"
                  :class="doneMap[quiz.id] ? 'bg-green-100 text-green-700 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700'"
                >{{ doneMap[quiz.id] ? 'Done' : 'Mark as done' }}</button>
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
</style>
