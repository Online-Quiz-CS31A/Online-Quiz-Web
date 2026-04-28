<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Clock, CheckCircle, AlertCircle, Edit2, ArrowLeft } from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import ConfirmUnansweredModal from '@/components/modals/ConfirmUnansweredModal.vue'
import type { QuizQuestion } from '@/interfaces/interfaces'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

// CONSTANTS
const router = useRouter()
const quizzesStore = useQuizzesStore()
const authStore = useAuthStore()

// TYPE DEFINITIONS
interface AttemptResponse {
  attemptId: number
  quizId: number
  startedAt: string
  submittedAt: string | null
  score?: number
}

interface AnswerResponse {
  questionId: number
  choiceId: number | null
  textAnswer: string | null
}

interface QuestionChoice {
  choiceId: number
  body?: string
  text?: string
}

interface QuestionOption {
  text: string
  isCorrect: boolean
  imageUrl?: string
  choiceId?: number
}

interface ApiQuestion {
  questionId?: number
  id?: number
  type?: string
  body?: string
  text?: string
  points?: number
  options?: QuestionOption[]
  choices?: QuestionChoice[]
}

// REFS
const currentDate = ref('')
const currentTime = ref('')
const timeInterval = ref<ReturnType<typeof setInterval> | null>(null)
const showConfirmModal = ref(false)
const isLoading = ref(true)
const isSubmitting = ref(false)
const attemptId = ref<number | null>(null)
const quizQuestions = ref<QuizQuestion[]>([])

// COMPUTED
const breadcrumb = computed(() => `Dashboard > Quizzes > ${quizzesStore.currentAttempt.quizTitle || 'Quiz'} > Review`)

const questions = computed(() => {
  if (!quizQuestions.value || quizQuestions.value.length === 0) {
    return []
  }

  return quizQuestions.value.map((q, idx) => {
    const userAnswer = quizzesStore.currentAttempt.answers[idx]

    let isAnswered = false
    const qType = (q.type || '').toLowerCase()

    if (qType === 'single-choice' || qType === 'true-false') {
      isAnswered = typeof userAnswer === 'number' && userAnswer >= 0
    } else if (qType === 'multiple-choice') {
      // Multiple-choice answers are stored as arrays
      isAnswered = Array.isArray(userAnswer) && userAnswer.length > 0
    } else if (qType === 'text' || qType === 'essay') {
      isAnswered = typeof userAnswer === 'string' && userAnswer.trim().length > 0
    } else if (qType === 'enumeration') {
      isAnswered = Array.isArray(userAnswer) && userAnswer.some(item => item && String(item).trim().length > 0)
    } else if (qType === 'matching') {
      isAnswered = typeof userAnswer === 'object' && userAnswer !== null && !Array.isArray(userAnswer) && Object.keys(userAnswer as object).length > 0
    } else if (qType === 'fillblank' || qType === 'fill-blank' || qType === 'fill_blank') {
      isAnswered = Array.isArray(userAnswer) && userAnswer.some(blank => blank && String(blank).trim().length > 0)
    } else {
      isAnswered = userAnswer !== null && userAnswer !== undefined
    }

    return {
      id: idx + 1,
      answered: isAnswered,
      questionText: (q as { body?: string }).body || q.text || '',
      questionType: q.type || ''
    }
  })
})

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
  const current = quizzesStore.currentAttempt
  const qid = current.quizId

  if (!qid) {
    router.push({ name: 'student' })
    return
  }

  const studentQuiz = quizzesStore.myStudentQuizzes.find(q => q.id === qid)
  const index = Math.max(0, Math.min(quizQuestions.value.length - 1, questionId - 1))

  router.push({
    name: 'quiz',
    params: {
      quizId: String(qid),
      questionIndex: String(index)
    },
    state: {
      quizId: qid,
      questions: quizQuestions.value,
      quizTitle: current.quizTitle || studentQuiz?.title || 'Quiz',
      quizSubject: studentQuiz?.subject || 'Quiz',
    },
  })
}

const backToQuiz = () => {
  const quizId = quizzesStore.currentAttempt.quizId
  
  if (!quizId) {
    console.error('No quizId in currentAttempt')
    router.push({ name: 'student' })
    return
  }

  // Navigate back to quiz with proper state
  router.push({
    name: 'quiz',
    params: { quizId: String(quizId) },
    state: {
      quizId: quizId,
      questions: quizQuestions.value,
      quizTitle: quizzesStore.currentAttempt.quizTitle
    }
  })
}

const submitQuiz = async () => {
  if (unansweredCount.value > 0) {
    showConfirmModal.value = true
    return
  }

  try {
    isSubmitting.value = true
    const userId = authStore.currentUser?.id
    if (!attemptId.value || !userId) {
      console.error('Missing attemptId or userId')
      alert('Cannot submit quiz: Missing attempt information.')
      return
    }

    const startTime = quizzesStore.currentAttempt.startAtISO
      ? new Date(quizzesStore.currentAttempt.startAtISO).getTime()
      : Date.now()
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    // Backend calculates score automatically
    await api.put(`/Attempt/${attemptId.value}/submit?studentId=${userId}`, {
      timeSpentSeconds: timeSpent
    })

    quizzesStore.currentAttempt.endAtISO = new Date().toISOString()
    quizzesStore.currentAttempt.isOngoing = false

    // Mark quiz as submitted in backend-backed store
    if (quizzesStore.currentAttempt.quizId) {
      quizzesStore.markQuizAsSubmitted(quizzesStore.currentAttempt.quizId)
      // Store quizId for score view
      localStorage.setItem('lastQuizId', quizzesStore.currentAttempt.quizId.toString())
    }

    router.push({
      name: 'quiz-score',
      params: { quizId: quizzesStore.currentAttempt.quizId?.toString() || '' }
    })
  } catch (error) {
    console.error('Failed to submit quiz:', error)
    alert('Failed to submit quiz. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const confirmSubmit = async () => {
  showConfirmModal.value = false

  try {
    isSubmitting.value = true
    const userId = authStore.currentUser?.id
    if (!attemptId.value || !userId) {
      console.error('Missing attemptId or userId')
      alert('Cannot submit quiz: Missing attempt information.')
      return
    }

    const startTime = quizzesStore.currentAttempt.startAtISO
      ? new Date(quizzesStore.currentAttempt.startAtISO).getTime()
      : Date.now()
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    // Backend calculates score automatically
    await api.put(`/Attempt/${attemptId.value}/submit?studentId=${userId}`, {
      timeSpentSeconds: timeSpent
    })

    quizzesStore.currentAttempt.endAtISO = new Date().toISOString()
    quizzesStore.currentAttempt.isOngoing = false

    // Mark quiz as submitted in backend-backed store
    if (quizzesStore.currentAttempt.quizId) {
      quizzesStore.markQuizAsSubmitted(quizzesStore.currentAttempt.quizId)
      // Store quizId for score view
      localStorage.setItem('lastQuizId', quizzesStore.currentAttempt.quizId.toString())
    }

    router.push({
      name: 'quiz-score',
      params: { quizId: quizzesStore.currentAttempt.quizId?.toString() || '' }
    })
  } catch (error) {
    console.error('Failed to submit quiz:', error)
    alert('Failed to submit quiz. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const cancelSubmit = () => {
  showConfirmModal.value = false
}

const fetchQuizQuestions = async () => {
  try {
    isLoading.value = true

    console.log('=== ReviewQuizView: fetchQuizQuestions called ===')
    console.log('quizzesStore.currentAttempt:', quizzesStore.currentAttempt)

    const quizId = quizzesStore.currentAttempt.quizId
    const userId = authStore.currentUser?.id

    console.log('quizId:', quizId, 'userId:', userId)

    if (!quizId || !userId) {
      console.error('Missing quizId or userId in ReviewQuizView')
      console.error('quizId:', quizId, 'userId:', userId)
      console.error('currentAttempt:', quizzesStore.currentAttempt)
      return
    }

    console.log('Fetching quiz questions for review, quizId:', quizId)

    const response = await api.get(`/Quiz/${quizId}`, {
      params: { userId }
    })

    console.log('Quiz response:', response.data)

    if (response.data) {
      const rawQuestions = response.data.questions || []
      console.log('Raw questions from API:', rawQuestions)

      // Map API questions to frontend format
      quizQuestions.value = rawQuestions.map((q: ApiQuestion) => quizzesStore.mapApiQuestionToFrontend(q))
      console.log('Mapped questions:', quizQuestions.value)

      if (quizQuestions.value.length > 0) {
        quizzesStore.currentAttempt.questionsLength = quizQuestions.value.length
      }
    }

    const attemptsResponse = await api.get(`/Attempt/student/${userId}`)
    console.log('All attempts for student:', attemptsResponse.data)

    if (attemptsResponse.data && Array.isArray(attemptsResponse.data)) {
      const ongoingAttempt = attemptsResponse.data.find((attempt: AttemptResponse) =>
        attempt.quizId === quizId && !attempt.submittedAt
      )

      console.log('Looking for ongoing attempt for quizId:', quizId)
      console.log('Found ongoing attempt:', ongoingAttempt)

      if (ongoingAttempt) {
        attemptId.value = ongoingAttempt.attemptId
        console.log('Using attemptId:', attemptId.value)

        const answersResponse = await api.get(`/Answer/attempt/${attemptId.value}?userId=${userId}`)
        console.log('Answers response:', answersResponse.data)

        if (answersResponse.data && Array.isArray(answersResponse.data)) {
          answersResponse.data.forEach((answer: AnswerResponse) => {
            const questionIndex = quizQuestions.value.findIndex((q: QuizQuestion) =>
              (q.questionId || q.id) === answer.questionId
            )

            if (questionIndex >= 0) {
              const question = quizQuestions.value[questionIndex]
              const qType = (question.type || '').toLowerCase()

              // Handle single-choice and true-false (radio buttons)
              if (answer.choiceId != null && Array.isArray(question.options) && (qType === 'single-choice' || qType === 'true-false')) {
                const choices = question.options as unknown as QuestionChoice[]
                const choiceIndex = choices.findIndex((c: QuestionChoice) =>
                  c.choiceId === answer.choiceId
                )
                if (choiceIndex >= 0) {
                  quizzesStore.setAnswer(questionIndex, choiceIndex)
                  quizzesStore.markAnswered(questionIndex)
                }
              }
              // Handle multiple-choice (checkboxes) - stored as JSON array of choiceIds in textAnswer
              else if (answer.textAnswer && qType === 'multiple-choice') {
                try {
                  const parsed = JSON.parse(answer.textAnswer)
                  if (Array.isArray(parsed)) {
                    // parsed is array of choiceIds, convert to array of indices
                    const selectedIndices: number[] = []
                    parsed.forEach((choiceId: number) => {
                      const idx = question.options?.findIndex((opt: QuestionOption) => opt.choiceId === choiceId)
                      if (idx != null && idx >= 0) {
                        selectedIndices.push(idx)
                      }
                    })
                    if (selectedIndices.length > 0) {
                      // For multiple-choice, store array directly in answers
                      quizzesStore.currentAttempt.answers[questionIndex] = selectedIndices
                      quizzesStore.markAnswered(questionIndex)
                    }
                  }
                } catch {
                  // If parsing fails, ignore
                }
              }
              else if (answer.textAnswer) {
                if (qType === 'text' || qType === 'essay') {
                  quizzesStore.setTextAnswer(questionIndex, answer.textAnswer)
                  quizzesStore.markAnswered(questionIndex)
                } else {
                  try {
                    const parsed = JSON.parse(answer.textAnswer)
                    if ((qType === 'enumeration') && Array.isArray(parsed)) {
                      quizzesStore.setEnumerationAnswer(questionIndex, parsed)
                      quizzesStore.markAnswered(questionIndex)
                    } else if (qType === 'matching' && typeof parsed === 'object' && !Array.isArray(parsed)) {
                      const map: Record<number, number> = {}
                      Object.entries(parsed).forEach(([k, v]) => { map[Number(k)] = Number(v) })
                      quizzesStore.setMatchingAnswer(questionIndex, map)
                      quizzesStore.markAnswered(questionIndex)
                    } else if ((qType === 'fill-blank' || qType === 'fillblank' || qType === 'fill_blank') && Array.isArray(parsed)) {
                      quizzesStore.setFillBlankAnswer(questionIndex, parsed)
                      quizzesStore.markAnswered(questionIndex)
                    }
                  } catch {
                    quizzesStore.setTextAnswer(questionIndex, answer.textAnswer)
                    quizzesStore.markAnswered(questionIndex)
                  }
                }
              }
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch quiz questions:', error)
  } finally {
    isLoading.value = false
  }
}

// LIFECYCLE
onMounted(async () => {
  updateDateTime()
  timeInterval.value = setInterval(updateDateTime, 1000)

  await fetchQuizQuestions()
})

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader :breadcrumb="breadcrumb" />

    <div class="max-w-5xl mx-auto px-4 py-12">
      <!-- AppHeader -->
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

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-3xl shadow-sm overflow-hidden border-2 border-[#4285f4] p-12 text-center">
        <div class="flex flex-col items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4285f4] mb-4"></div>
          <p class="text-gray-600">Loading quiz questions...</p>
        </div>
      </div>

      <!-- No Questions State -->
      <div v-else-if="questions.length === 0" class="bg-white rounded-3xl shadow-sm overflow-hidden border-2 border-[#4285f4] p-12 text-center">
        <AlertCircle class="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-800 mb-2">No Questions Available</h3>
        <p class="text-gray-600 mb-6">There are no questions to review for this quiz.</p>
        <button
          @click="backToQuiz"
          class="px-6 py-3 bg-[#4285f4] hover:bg-[#4866DA] text-white rounded-xl font-semibold transition-all"
        >
          Back to Quiz
        </button>
      </div>

      <!-- Questions Grid -->
      <div v-else class="bg-white rounded-3xl shadow-sm overflow-hidden border-2 border-[#4285f4]">
        <div class="divide-y divide-gray-200">
          <div
            v-for="question in questions"
            :key="question.id"
            class="p-6 hover:bg-[#F4F7F9] transition-all"
          >
            <div class="flex items-start">
              <div class="bg-[#4285f4] text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 font-semibold">
                {{ question.id }}
              </div>

              <div class="ml-4 flex-1">
                <h3 class="font-semibold text-gray-800 text-lg">Question #{{ question.id }}</h3>
                <p v-if="question.questionText" class="text-sm text-gray-600 mt-1">{{ question.questionText.substring(0, 100) }}{{ question.questionText.length > 100 ? '...' : '' }}</p>
                <div class="mt-2 flex gap-2 flex-wrap">
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
      <div v-if="!isLoading && questions.length > 0" class="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <button
          @click="backToQuiz"
          class="px-6 py-3 bg-[#F4F7F9] hover:bg-gray-200 text-gray-800 rounded-xl font-semibold flex items-center justify-center border border-[#7B90DF] transition-all"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          Back to Quiz
        </button>
        <button
          @click="submitQuiz"
          :disabled="isSubmitting"
          class="px-6 py-3 bg-[#4285f4] hover:bg-[#4866DA] text-white rounded-xl font-semibold flex items-center justify-center transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Submitting...
          </span>
          <span v-else class="flex items-center">
            Submit Quiz
            <CheckCircle class="w-5 h-5 ml-2" />
          </span>
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
