<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Clock, CheckCircle, AlertCircle, Edit2, ArrowLeft } from 'lucide-vue-next'
import Header from '@/components/Header.vue'
import ConfirmUnansweredModal from '@/components/modals/ConfirmUnansweredModal.vue'
import type { ReviewQuestion } from '@/interfaces/interfaces'
import { useQuizzesStore } from '@/stores/quizzesStore'

// CONSTANTS
const router = useRouter()
const quizzesStore = useQuizzesStore()

// REFS
const currentDate = ref('')
const currentTime = ref('')
const timeInterval = ref<ReturnType<typeof setInterval> | null>(null)
const showConfirmModal = ref(false)

// COMPUTED
const breadcrumb = computed(() => `Dashboard > Quizzes > ${quizzesStore.currentAttempt.quizTitle || 'Quiz'} > Review`)

const questions = computed<ReviewQuestion[]>(() => quizzesStore.getReviewQuestions())

const unansweredCount = computed(() => questions.value.filter(q => !q.answered).length)

// METHODS
const updateDateTime = () => {
  const now = new Date()
  
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  currentDate.value = now.toLocaleDateString('en-US', dateOptions)
  
  const timeOptions: Intl.DateTimeFormatOptions = { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  }
  currentTime.value = now.toLocaleTimeString('en-US', timeOptions)
}

const editQuestion = (questionId: number) => {
  router.push({ name: 'quiz', query: { question: questionId } })
}

const backToQuiz = () => {
  router.push({ name: 'quiz' })
}

const submitQuiz = () => {
  if (unansweredCount.value > 0) {
    showConfirmModal.value = true
    return
  }
  router.push({ name: 'quiz-score' })
}

const confirmSubmit = () => {
  showConfirmModal.value = false
  router.push({ name: 'quiz-score' })
}

const cancelSubmit = () => {
  showConfirmModal.value = false
}

// LIFECYCLE
onMounted(() => {
  updateDateTime()
  timeInterval.value = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header :breadcrumb="breadcrumb" />

    <div class="max-w-5xl mx-auto px-4 py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-[#4285f4] mb-2">Review Your Answers</h1>
        <p class="text-gray-600">Please verify your answers before final submission</p>
        
        <!-- Date & Time -->
        <div class="mt-4 flex items-center justify-center space-x-6">
          <div class="flex items-center">
            <Calendar class="w-5 h-5 text-[#4285f4] mr-2" />
            <span class="text-gray-700">{{ currentDate }}</span>
          </div>
          <div class="flex items-center">
            <Clock class="w-5 h-5 text-[#4285f4] mr-2" />
            <span class="text-gray-700">{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- Questions Grid -->
      <div class="bg-white rounded-3xl shadow-sm overflow-hidden border-2 border-[#4285f4]">
        <div class="divide-y divide-gray-200">
          <div 
            v-for="question in questions" 
            :key="question.id"
            class="p-6 hover:bg-[#F4F7F9] transition-all cursor-pointer"
          >
            <div class="flex items-start">
              <div class="bg-[#4285f4] text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 font-semibold">
                {{ question.id }}
              </div>
              
              <div class="ml-4 flex-1">
                <h3 class="font-semibold text-gray-800 text-lg">Question #{{ question.id }}</h3>
                <div class="mt-2">
                  <span 
                    v-if="question.answered"
                    class="inline-flex items-center px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium"
                  >
                    <CheckCircle class="w-4 h-4 mr-1" />
                    Answered
                  </span>
                  <span 
                    v-else
                    class="inline-flex items-center px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 font-medium"
                  >
                    <AlertCircle class="w-4 h-4 mr-1" />
                    Unanswered
                  </span>
                </div>
              </div>
              
              <button 
                @click="editQuestion(question.id)"
                class="text-[#4285f4] hover:text-[#4866DA] transition-colors p-2 rounded-lg hover:bg-[#C9E4F6]"
              >
                <Edit2 class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <button 
          @click="backToQuiz"
          class="px-6 py-3 bg-[#F4F7F9] hover:bg-gray-200 text-gray-800 rounded-xl font-semibold flex items-center justify-center border border-[#7B90DF] transition-all"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          Back to Quiz
        </button>
        <button 
          @click="submitQuiz"
          class="px-6 py-3 bg-[#4285f4] hover:bg-[#4866DA] text-white rounded-xl font-semibold flex items-center justify-center transition-all shadow-md"
        >
          Submit Quiz
          <CheckCircle class="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  </div>
  <ConfirmUnansweredModal
    :open="showConfirmModal"
    :unanswered-count="unansweredCount"
    @confirm="confirmSubmit"
    @cancel="cancelSubmit"
  />
</template>
