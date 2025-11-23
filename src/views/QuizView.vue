  <script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import type { QuizQuestion } from '@/interfaces/interfaces'
import { useQuizzesStore } from '@/stores/quizzesStore'

const router = useRouter()
const quizzesStore = useQuizzesStore()

const quizId = ref<number | null>((history.state?.quizId as number) || null)
const quizStateQuestions = (history.state?.questions || []) as QuizQuestion[]
const questions = ref<QuizQuestion[]>(quizStateQuestions)
const quizTitle = ref(history.state?.quizTitle || 'Quiz')
const quizSubject = ref(history.state?.quizSubject || 'Quiz')
const hasValidQuestions = computed(() => questions.value.length > 0)
  
  // REFS
  const currentQuestion = ref(0)
  const selectedOption = ref<number | null>(null)
  const textAnswer = ref('')
  const enumerationAnswers = ref<string[]>([])
  const matchingAnswers = ref<Record<number, number>>({})
  const fillBlankAnswers = ref<string[]>([])
  const timer = ref(0)
  const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const durationSeconds = ref(0)
  
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
    quizzesStore.setAnswer(currentQuestion.value, optionIndex)
  }

  const updateTextAnswer = () => {
    quizzesStore.setTextAnswer(currentQuestion.value, textAnswer.value)
  }

  const updateEnumerationAnswer = (index: number, value: string) => {
    enumerationAnswers.value[index] = value
    quizzesStore.setEnumerationAnswer(currentQuestion.value, enumerationAnswers.value)
  }

  const updateMatchingAnswer = (leftIndex: number, rightIndex: number) => {
    matchingAnswers.value[leftIndex] = rightIndex
    quizzesStore.setMatchingAnswer(currentQuestion.value, matchingAnswers.value)
  }

  const updateFillBlankAnswer = (index: number, value: string) => {
    fillBlankAnswers.value[index] = value
    quizzesStore.setFillBlankAnswer(currentQuestion.value, fillBlankAnswers.value)
  }

  const clearAnswers = () => {
    selectedOption.value = null
    textAnswer.value = ''
    enumerationAnswers.value = []
    matchingAnswers.value = {}
    fillBlankAnswers.value = []
  }

  const loadCurrentQuestionAnswers = () => {
    const idx = currentQuestion.value
    const answer = quizzesStore.currentAttempt.answers[idx]
    const q = questions.value[idx]
    if (!q || answer === undefined) {
      clearAnswers()
      return
    }
    
    if (q.type === 'multiple-choice' || q.type === 'true-false') {
      selectedOption.value = typeof answer === 'number' ? answer : null
    } else if (q.type === 'text') {
      textAnswer.value = typeof answer === 'string' ? answer : ''
    } else if (q.type === 'enumeration') {
      if (Array.isArray(answer)) {
        enumerationAnswers.value = answer
      } else {
        const items = ((q as any)?.items || []) as string[]
        enumerationAnswers.value = Array(items.length).fill('')
      }
    } else if (q.type === 'matching') {
      matchingAnswers.value = (typeof answer === 'object' && !Array.isArray(answer)) ? answer : {}
    } else if (q.type === 'fill-blank') {
      fillBlankAnswers.value = Array.isArray(answer) ? answer : []
    } else {
      clearAnswers()
    }
  }
  
  const nextQuestion = () => {
    if (currentQuestion.value < questions.value.length - 1) {
      currentQuestion.value++
      loadCurrentQuestionAnswers()
    }
  }
  
  const previousQuestion = () => {
    if (currentQuestion.value > 0) {
      currentQuestion.value--
      loadCurrentQuestionAnswers()
    }
  }
  
  const goToQuestion = (questionIndex: number) => {
    currentQuestion.value = questionIndex
    loadCurrentQuestionAnswers()
  }
  
  const finishQuiz = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    quizzesStore.finishAttempt()
    router.push({ name: 'quiz-review' })
  }
  
  const parseTimeLimitToSeconds = (tl: string | undefined): number => {
    if (!tl) return 0
    const s = tl.trim().toLowerCase()
    const m = s.match(/(\d+)\s*(min|mins|minute|minutes)/)
    if (m) return Number(m[1]) * 60
    const h = s.match(/(\d+)\s*h/)
    const mm = s.match(/(\d+)\s*m/)
    if (h || mm) {
      return (h ? Number(h[1]) * 3600 : 0) + (mm ? Number(mm[1]) * 60 : 0)
    }
    const num = Number(s)
    if (!isNaN(num) && num > 0) return num * 60
    return 0
  }

  const initDuration = () => {
    quizzesStore.loadAttemptFromStorage()
    
    if (quizzesStore.currentAttempt.isOngoing && quizzesStore.currentAttempt.quizId === quizId.value) {
      durationSeconds.value = quizzesStore.currentAttempt.durationSeconds
      timer.value = quizzesStore.getRemainingSeconds()
      restoreAnswers()
    } else if (quizId.value != null) {
      const sq = quizzesStore.myStudentQuizzes.find(q => q.id === quizId.value)
      const sec = parseTimeLimitToSeconds(sq?.timeLimit)
      durationSeconds.value = sec > 0 ? sec : 0
      timer.value = durationSeconds.value
    } else {
      durationSeconds.value = 0
      timer.value = 0
    }
  }

  const restoreAnswers = () => {
    const attempt = quizzesStore.currentAttempt
    Object.keys(attempt.answers).forEach(key => {
      const index = Number(key)
      const answer = attempt.answers[index]
      const q = questions.value[index]
      if (!q) return
      
      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        if (typeof answer === 'number') {
          selectedOption.value = answer
        }
      } else if (q.type === 'text') {
        if (typeof answer === 'string') {
          textAnswer.value = answer
        }
      } else if (q.type === 'enumeration') {
        if (Array.isArray(answer)) {
          enumerationAnswers.value = answer
        }
      } else if (q.type === 'matching') {
        if (typeof answer === 'object' && !Array.isArray(answer)) {
          matchingAnswers.value = answer
        }
      } else if (q.type === 'fill-blank') {
        if (Array.isArray(answer)) {
          fillBlankAnswers.value = answer
        }
      }
    })
  }

  const startTimer = () => {
    if (timerInterval.value) clearInterval(timerInterval.value)
    timerInterval.value = setInterval(() => {
      if (timer.value > 0) {
        timer.value--
        if (timer.value === 0) {
          clearInterval(timerInterval.value as any)
          timerInterval.value = null
          finishQuiz()
        }
      }
    }, 1000)
  }
  
  // LIFECYCLE
  onMounted(() => {
    initDuration()
    loadCurrentQuestionAnswers()
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
              <p class="text-base text-gray-700 leading-relaxed mb-6">{{ questions[currentQuestion].text }}</p>
              <div v-if="questions[currentQuestion].mediaUrl" class="mb-6">
                <img
                  :src="questions[currentQuestion].mediaUrl"
                  alt="Question image"
                  class="w-full max-h-80 object-contain rounded-2xl border border-gray-200"
                />
              </div>
            </div>
            
            <!-- Multiple Choice / True-False -->
            <div v-if="questions[currentQuestion].type === 'multiple-choice' || questions[currentQuestion].type === 'true-false'" class="space-y-3">
              <div 
                v-for="(option, index) in (questions[currentQuestion].options || [])" 
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
                >{{ (option && 'text' in option) ? option.text : option }}</span>
              </div>
            </div>

            <!-- Text -->
            <div v-else-if="questions[currentQuestion].type === 'text'" class="space-y-3">
              <textarea
                v-model="textAnswer"
                @input="updateTextAnswer"
                class="w-full p-4 border-2 border-[#7B90DF] rounded-xl focus:border-[#4285f4] focus:outline-none resize-none"
                rows="6"
                placeholder="Type your answer here... (minimum 3 sentences)"
              ></textarea>
            </div>

            <!-- Enumeration -->
            <div v-else-if="questions[currentQuestion].type === 'enumeration'" class="space-y-3">
              <div
                v-for="(item, index) in (((questions[currentQuestion] as any)?.items) || [])"
                :key="index"
                class="flex items-center gap-3"
              >
                <span class="text-gray-600 font-medium">{{ index + 1 }}.</span>
                <input
                  type="text"
                  v-model="enumerationAnswers[index]"
                  @input="updateEnumerationAnswer(index, enumerationAnswers[index])"
                  class="flex-1 p-3 border-2 border-[#7B90DF] rounded-xl focus:border-[#4285f4] focus:outline-none"
                  :placeholder="`Item ${index + 1}`"
                />
              </div>
            </div>

            <!-- Matching Type -->
            <div v-else-if="questions[currentQuestion].type === 'matching'" class="space-y-3">
              <div class="grid grid-cols-2 gap-6">
                <!-- Column A -->
                <div>
                  <h3 class="font-semibold text-gray-700 mb-3">Column A</h3>
                  <div
                    v-for="(pair, index) in ((questions[currentQuestion] as any).pairs || [])"
                    :key="index"
                    class="mb-2 p-3 bg-[#F4F7F9] border border-[#7B90DF] rounded-lg"
                  >
                    {{ index + 1 }}. {{ pair.left }}
                  </div>
                </div>

                <!-- Column B -->
                <div>
                  <h3 class="font-semibold text-gray-700 mb-3">Column B</h3>
                  <div
                    v-for="(pair, leftIndex) in ((questions[currentQuestion] as any).pairs || [])"
                    :key="leftIndex"
                    class="mb-2"
                  >
                    <select
                      v-model="matchingAnswers[leftIndex]"
                      @change="updateMatchingAnswer(leftIndex, matchingAnswers[leftIndex])"
                      class="w-full p-3 border-2 border-[#7B90DF] rounded-xl focus:border-[#4285f4] focus:outline-none"
                    >
                      <option value="">Select answer...</option>
                      <option
                        v-for="(rightPair, rightIndex) in ((questions[currentQuestion] as any).pairs || [])"
                        :key="rightIndex"
                        :value="rightIndex"
                      >
                        {{ String.fromCharCode(65 + rightIndex) }}. {{ rightPair.right }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fill in the Blank -->
            <div v-else-if="questions[currentQuestion].type === 'fill-blank'" class="space-y-3">
              <div v-for="(blank, index) in (((questions[currentQuestion] as any)?.blanks) || Array(1).fill({}))" :key="index" class="flex items-center gap-3">
                <span class="text-gray-600 font-medium">Blank {{ index + 1 }}:</span>
                <input
                  type="text"
                  v-model="fillBlankAnswers[index]"
                  @input="updateFillBlankAnswer(index, fillBlankAnswers[index])"
                  class="flex-1 p-3 border-2 border-[#7B90DF] rounded-xl focus:border-[#4285f4] focus:outline-none"
                  :placeholder="`Fill in blank ${index + 1}`"
                />
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
                    : quizzesStore.isAnswered(questionIndex - 1)
                    ? 'border-[#8B9EE3] bg-[#C9E4F6] text-[#1976d2]'
                    : 'border-[#4D74FF] bg-[#F4F7F9] text-gray-600 hover:bg-gray-50'
                ]"
                @click="goToQuestion(questionIndex - 1)"
              >
                {{ questionIndex }}
              </button>
            </div>

            <!-- Finish Attempt Button -->
            <div class="mt-6 pt-4 border-t border-gray-300">
              <button 
                @click="finishQuiz"
                class="w-full px-4 py-2 bg-white border border-[#7B90DF] text-[#4285f4] rounded-xl font-medium hover:bg-[#F4F7F9] transition-all flex items-center justify-center gap-2"
              >
                <span>Finish Attempt</span>
                <i class="fas fa-arrow-right text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  </template>
  

  