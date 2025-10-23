  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import Header from '@/components/Header.vue'
  import type { QuizViewQuestion, QuizQuestion } from '@/interfaces/interfaces'
  
const router = useRouter()

const convertToViewFormat = (quizQuestions: QuizQuestion[]): QuizViewQuestion[] => {
  return quizQuestions.map(q => {
    if (q.type === 'multiple-choice' && q.options && q.options.length > 0) {
      const options = q.options.map(opt => opt.text)
      const correctAnswer = q.options.findIndex(opt => opt.isCorrect)
      return {
        question: q.text,
        options: options,
        correctAnswer: correctAnswer >= 0 ? correctAnswer : 0
      }
    }
    else if (q.type === 'true-false' && q.options && q.options.length > 0) {
      const options = q.options.map(opt => opt.text)
      const correctAnswer = q.options.findIndex(opt => opt.isCorrect)
      return {
        question: q.text,
        options: options,
        correctAnswer: correctAnswer >= 0 ? correctAnswer : 0
      }
    }
    else {
      return {
        question: q.text,
        options: ['Answer not displayed in quiz view'],
        correctAnswer: 0
      }
    }
  })
}

const quizStateQuestions = (history.state?.questions || []) as QuizQuestion[]
const questions = ref<QuizViewQuestion[]>(convertToViewFormat(quizStateQuestions))
const quizTitle = ref(history.state?.quizTitle || 'Quiz')
const quizSubject = ref(history.state?.quizSubject || 'Quiz')
const hasValidQuestions = computed(() => questions.value.length > 0)
  
  // REFS
  const currentQuestion = ref(0)
  const selectedOption = ref<number | null>(null)
  const timer = ref(0)
  const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const answeredQuestions = ref<Set<number>>(new Set())
  
  // COMPUTED
  const breadcrumb = computed(() => `Dashboard > Quizzes > ${quizTitle.value}`)
  const progress = computed(() => {
    return ((currentQuestion.value + 1) / questions.value.length) * 100
  })
  
  // METHODS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const selectOption = (optionIndex: number) => {
    selectedOption.value = optionIndex
    answeredQuestions.value.add(currentQuestion.value)
  }
  
  const nextQuestion = () => {
    if (currentQuestion.value < questions.value.length - 1) {
      currentQuestion.value++
      selectedOption.value = null
    }
  }
  
  const previousQuestion = () => {
    if (currentQuestion.value > 0) {
      currentQuestion.value--
      selectedOption.value = null
    }
  }
  
  const goToQuestion = (questionIndex: number) => {
    currentQuestion.value = questionIndex
    selectedOption.value = null
  }
  
  const finishQuiz = () => {
    router.push({ name: 'quiz-review' })
  }
  
  const startTimer = () => {
    timerInterval.value = setInterval(() => {
      timer.value++
    }, 1000)
  }
  
  // LIFECYCLE
  onMounted(() => {
    startTimer()
  })
  
  onUnmounted(() => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  })
  </script>

<template>
    <div class="min-h-screen">
      <Header :breadcrumb="breadcrumb" />
      <div class="max-w-6xl mx-auto p-4 mt-8">
      
      <!-- No Questions Available -->
      <div v-if="!hasValidQuestions" class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">No Questions Available</h2>
          <p class="text-gray-600 mb-4">This quiz doesn't have any questions yet.</p>
          <button @click="router.push({ name: 'student-home' })" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <main v-else class="grid grid-cols-3 gap-6">
        <!-- Left Panel-->
        <div class="col-span-2">
          <div class="bg-white rounded-3xl shadow-sm p-8 border-2 border-[#4285f4] relative">
            <!-- Timer -->
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div class="bg-[#4285f4] text-white px-6 py-2 rounded-full text-sm font-semibold">
                {{ formatTime(timer) }}
              </div>
            </div>
            
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">Question {{ currentQuestion + 1 }}</h2>
              <p class="text-base text-gray-700 leading-relaxed mb-6">{{ questions[currentQuestion].question }}</p>
            </div>
            
            <div class="space-y-3">
              <div 
                v-for="(option, index) in questions[currentQuestion].options" 
                :key="index"
                :class="[
                  'flex items-center p-2 rounded-xl cursor-pointer transition-all border-1',
                  selectedOption === index 
                    ? 'bg-[#C9E4F6] border-[#7B90DF]' 
                    : 'bg-[#F4F7F9] border-[#7B90DF] hover:bg-gray-100'
                ]"
                @click="selectOption(index)"
              >
                <div class="mr-4 flex items-center justify-center w-8 h-8">
                  <div 
                    :class="[
                      'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                      selectedOption === index 
                        ? 'bg-[#8B9EE3] border-[#7B90DF] text-[#C9E4F6]' 
                        : 'bg-[#F4F7F9] border-[#7B90DF] text-black'
                    ]"
                  >
                    <i 
                      v-if="selectedOption === index" 
                      class="fas fa-check text-xs"
                    ></i>
                    <span v-else>{{ String.fromCharCode(65 + index) }}</span>
                  </div>
                </div>
                <span 
                  :class="[
                    'text-base font-medium',
                    selectedOption === index ? 'text-[#4866DA]' : 'text-gray-800'
                  ]"
                >{{ option }}</span>
              </div>
            </div>
          </div>
          
          <!-- Navigation buttons below quiz container -->
          <div class="flex gap-3 justify-center mt-6">
            <button 
              class="px-8 py-2 bg-[#F4F7F9] text-black border border-[#7B90DF] rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
              @click="previousQuestion"
              :disabled="currentQuestion === 0"
            >
              Previous
            </button>
            <button 
              v-if="currentQuestion < questions.length - 1"
              class="px-8 py-2 bg-[#C9E4F6] border border-[#7B90DF] text-[#4D74FF] rounded-xl font-medium transition-all disabled:opacity-50"
              @click="nextQuestion"
            >
              Next
            </button>
            
            <button 
              v-else
              class="px-8 py-2 bg-[#C9E4F6] border border-[#7B90DF] text-[#4D74FF] rounded-xl font-medium transition-all disabled:opacity-50"
              @click="finishQuiz"
            >
              Finish
            </button>
          </div>
        </div>
  
        <!-- Right Panel-->
        <div class="col-span-1">
          <div class="bg-[#F4F7F9] rounded-xl shadow-sm p-4">
            <div class="mb-4">
                   <p class="text-sm text-gray-600 mb-2 text-right font-medium">Question {{ currentQuestion + 1 }} of {{ questions.length }}</p>
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div 
                  class="h-full bg-[#4285f4] rounded-full transition-all duration-300" 
                  :style="{ width: progress + '%' }"
                ></div>
              </div>
         
            </div>
            <div class="grid grid-cols-5 gap-3">
              <button 
                v-for="questionIndex in questions.length" 
                :key="questionIndex"
                :class="[
                  'w-10 h-10 border-2 rounded-lg font-semibold text-sm cursor-pointer transition-all',
                  currentQuestion === questionIndex - 1
                    ? 'border-[#4285f4] bg-[#e3f2fd] text-[#1976d2]'
                    : answeredQuestions.has(questionIndex - 1)
                    ? 'border-[#8B9EE3] bg-[#C9E4F6] text-[#1976d2]'
                    : 'border-[#4D74FF] bg-[#F4F7F9] text-gray-600 hover:bg-gray-50'
                ]"
                @click="goToQuestion(questionIndex - 1)"
              >
                {{ questionIndex }}
              </button>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  </template>
  

  