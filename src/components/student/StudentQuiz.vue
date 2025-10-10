<script setup lang="ts">
import { computed } from 'vue'
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
}

// CONSTANTS
const coverImages = [quiz1, quiz2, quiz3, quiz4, quiz5]
const router = useRouter()

// PROPS
const props = defineProps<Props>()

// EMITS
const emit = defineEmits<{
  'view-all': []
}>()

// REACTIVE
const quizzesStore = useQuizzesStore()

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
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="quiz in displayedQuizzes" 
        :key="quiz.id"
        class="quiz-card rounded-xl shadow-md overflow-hidden cursor-pointer"
        :style="{ ...getCoverStyle(quiz), backgroundSize: 'cover', backgroundPosition: 'center' }"
        @click="router.push({ name: 'quiz' })"
      >
        <div class="p-5 text-white">
          <div class="flex justify-end items-start mb-3">

            <span class="text-xs text-white">Due: {{ quiz.dueDate }}</span>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">{{ quiz.title }}</h3>
          <p class="text-white text-sm mb-4">{{ quiz.subject }}</p>
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs text-white">Class:</span>
              <span class="text-xs font-medium ml-1">{{ quiz.class }}</span>
            </div>
            <button 
              @click="router.push({ name: 'quiz' })"
              class="text-white hover:opacity-90 text-sm font-medium transition-colors"
            >
              Start Quiz
            </button>
          </div>
        </div>
        <div class="bg-white px-5 py-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Time: {{ quiz.timeLimit }}</span>
            <div class="flex items-center">
              <span class="text-xs text-gray-500 mr-2">Status:</span>
              <span class="text-xs font-medium text-yellow-600">{{ quiz.status }}</span>
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
