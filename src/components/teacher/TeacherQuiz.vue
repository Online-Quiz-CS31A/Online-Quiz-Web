<script setup lang="ts">
 import { ref } from 'vue'
import quiz1 from '@/assets/image/quiz_bg/Screenshot 2025-08-21 103442.png'
import quiz2 from '@/assets/image/quiz_bg/Screenshot 2025-08-21 103614.png'
import quiz3 from '@/assets/image/quiz_bg/liquid-cheese.png'
import quiz4 from '@/assets/image/quiz_bg/radiant-gradient.png'
import quiz5 from '@/assets/image/quiz_bg/subtle-prism.png'
interface Quiz {
  id: number
  subject: string
  title: string
  description: string
  dueDate: string
  class: string
  submitted: number
  total: number
  color: string
}

interface Props {
  quizzes: Quiz[]
  hideHeader?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'view-all': []
}>()
 
const coverImages = [quiz1, quiz2, quiz3, quiz4, quiz5]

const getDeterministicIndex = (key: string) => {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getCoverStyle = (quiz: Quiz) => {
  const index = getDeterministicIndex(`${quiz.id}-${quiz.title}`)
  const url = coverImages[index % coverImages.length]
  return {
    backgroundImage: `url(${url})`
  }
}


const getCardColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-200 text-blue-900',
    green: 'bg-green-200 text-green-900',
    purple: 'bg-purple-200 text-purple-900',
    red: 'bg-red-200 text-red-900',
    yellow: 'bg-yellow-200 text-yellow-900',
    indigo: 'bg-indigo-200 text-indigo-900',
    pink: 'bg-pink-200 text-pink-900',
    teal: 'bg-teal-200 text-teal-900',
    orange: 'bg-orange-200 text-orange-900',
    cyan: 'bg-cyan-200 text-cyan-900'
  }
  return colorMap[color] || colorMap.blue
}

const openMenuId = ref<number | null>(null)

const toggleMenu = (quizId: number) => {
  openMenuId.value = openMenuId.value === quizId ? null : quizId
}

const closeMenu = () => {
  openMenuId.value = null
}


const handleEditQuiz = (quiz: Quiz) => {
  console.log(`Editing quiz: ${quiz.title}`)
  closeMenu()
}

const handleDeleteQuiz = (quiz: Quiz) => {
  if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
    console.log(`Deleting quiz: ${quiz.title}`)
  }
  closeMenu()
}
</script>

<template>
  <div class="mb-8">
    <div v-if="!props.hideHeader" class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">Quizzes</h2>
      <button @click="emit('view-all')" type="button" class="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer">View All</button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
      <div 
        v-for="quiz in quizzes" 
        :key="quiz.id"
        class="quiz-card rounded-xl shadow-md overflow-hidden"
        :class="getCardColorClasses(quiz.color)"
        :style="{ ...getCoverStyle(quiz), backgroundSize: 'cover', backgroundPosition: 'center' }"
      >
        <div class="p-5">
          <div class="flex justify-between items-start mb-3">
            <span class="text-xs text-white">Due: {{ quiz.dueDate }}</span>
            <div class="relative">
              <button
                @click.stop="toggleMenu(quiz.id)"
                class="text-white hover:text-gray-200 text-lg transition-colors cursor-pointer"
                title="More options"
              >
                <i class="fas fa-ellipsis-vertical"></i>
              </button>
              <div
                v-if="openMenuId === quiz.id"
                class="absolute right-0 mt-2 w-36 bg-white text-gray-800 rounded-md shadow-lg border border-gray-200 py-1 z-10"
                @click.stop
              >
                <button
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                  @click="handleEditQuiz(quiz)"
                >Edit 
                </button>
                <button
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  @click="handleDeleteQuiz(quiz)"
                >Delete
                </button>
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">{{ quiz.title }}</h3>
          <p class="text-white/90 text-sm mb-4">{{ quiz.subject }}</p>
        </div>
        <div class="bg-white px-5 py-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">{{ quiz.submitted }}/{{ quiz.total }} submitted</span>
            <div class="w-full bg-gray-200 rounded-full h-1.5 ml-2">
              <div 
                class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                :style="{ width: `${(quiz.submitted / quiz.total) * 100}%` }"
              ></div>
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
