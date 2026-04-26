  <script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import type { QuizQuestion, QuestionOption } from '@/interfaces/interfaces'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const quizzesStore = useQuizzesStore()
const authStore = useAuthStore()

const quizId = ref<number | null>(
  Number(route.params.quizId) ||
  (history.state?.quizId as number) ||
  null
)
const attemptId = ref<number | null>(null)
const quizStateQuestions = (history.state?.questions || []) as QuizQuestion[]
const questions = ref<QuizQuestion[]>(quizStateQuestions)
const quizTitle = ref(history.state?.quizTitle || 'Quiz')
const hasValidQuestions = computed(() => questions.value.length > 0)

// TYPE DEFINITIONS
interface HistoryState {
  questionIndex?: number
  quizId?: number
  questions?: QuizQuestion[]
  quizTitle?: string
}

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

interface QuestionResponse {
  questionId?: number
  id?: number
  type?: string
  options?: QuestionOption[]
  choices?: { choiceId: number; body?: string; text?: string }[]
}

interface QuizMetadata {
  title?: string
  timeLimitMinutes?: number
  courseId?: number
  courseName?: string
}

// REFS
const initialQuestionIndex = typeof (history.state as HistoryState)?.questionIndex === 'number'
  ? (history.state as HistoryState).questionIndex
  : 0
  const currentQuestion = ref(initialQuestionIndex)
  const selectedOption = ref<number | null>(null)
  const selectedOptions = ref<Set<number>>(new Set()) // For multiple-choice checkboxes
  const textAnswer = ref('')
  const enumerationAnswers = ref<string[]>([])
  const matchingAnswers = ref<Record<number, number>>({})
  const fillBlankAnswers = ref<string[]>([])
  const timer = ref(0)
  const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const durationSeconds = ref(0)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const quizMetadata = ref<QuizMetadata>({})

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

  const selectOption = async (optionIndex: number) => {
    selectedOption.value = optionIndex
    quizzesStore.setAnswer(currentQuestion.value, optionIndex)
    quizzesStore.markAnswered(currentQuestion.value)

    await saveAnswerToBackend(currentQuestion.value, optionIndex)
  }

  const toggleOption = async (optionIndex: number) => {
    if (selectedOptions.value.has(optionIndex)) {
      selectedOptions.value.delete(optionIndex)
    } else {
      selectedOptions.value.add(optionIndex)
    }

    const selectedArray = Array.from(selectedOptions.value)
    quizzesStore.setAnswer(currentQuestion.value, selectedArray)

    if (selectedArray.length > 0) {
      quizzesStore.markAnswered(currentQuestion.value)
    }

    await saveAnswerToBackend(currentQuestion.value, selectedArray)
  }

  const isOptionSelected = (optionIndex: number): boolean => {
    return selectedOptions.value.has(optionIndex)
  }

  const updateTextAnswer = async () => {
    quizzesStore.setTextAnswer(currentQuestion.value, textAnswer.value)
    if (textAnswer.value.trim()) {
      quizzesStore.markAnswered(currentQuestion.value)
      await saveAnswerToBackend(currentQuestion.value, textAnswer.value)
    }
  }

  const updateEnumerationAnswer = async (index: number, value: string) => {
    enumerationAnswers.value[index] = value
    quizzesStore.setEnumerationAnswer(currentQuestion.value, enumerationAnswers.value)
    if (enumerationAnswers.value.some(item => item.trim())) {
      quizzesStore.markAnswered(currentQuestion.value)
      await saveAnswerToBackend(currentQuestion.value, enumerationAnswers.value)
    }
  }

  const updateMatchingAnswer = async (leftIndex: number, rightIndex: number) => {
    matchingAnswers.value[leftIndex] = rightIndex
    quizzesStore.setMatchingAnswer(currentQuestion.value, matchingAnswers.value)
    if (Object.keys(matchingAnswers.value).length > 0) {
      quizzesStore.markAnswered(currentQuestion.value)
      await saveAnswerToBackend(currentQuestion.value, matchingAnswers.value)
    }
  }

  const updateFillBlankAnswer = async (index: number, value: string) => {
    fillBlankAnswers.value[index] = value
    quizzesStore.setFillBlankAnswer(currentQuestion.value, fillBlankAnswers.value)
    if (fillBlankAnswers.value.some(blank => blank.trim())) {
      quizzesStore.markAnswered(currentQuestion.value)
      await saveAnswerToBackend(currentQuestion.value, fillBlankAnswers.value)
    }
  }

  const clearAnswers = () => {
    selectedOption.value = null
    selectedOptions.value.clear()
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

    if (q.type === 'single-choice' || q.type === 'true-false') {
      selectedOption.value = typeof answer === 'number' ? answer : null
    } else if (q.type === 'multiple-choice') {
      // Multiple-choice uses checkboxes - answer is array of indices
      if (Array.isArray(answer)) {
        selectedOptions.value = new Set(answer.filter((v): v is number => typeof v === 'number'))
      } else {
        selectedOptions.value.clear()
      }
    } else if (q.type === 'text') {
      textAnswer.value = typeof answer === 'string' ? answer : ''
    } else if (q.type === 'enumeration') {
      if (Array.isArray(answer)) {
        enumerationAnswers.value = answer
      } else {
        const items = (q.items || []) as string[]
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

  const startAttemptInBackend = async () => {
    try {
      const userId = authStore.currentUser?.id
      if (!quizId.value || !userId) {
        console.error('Missing quizId or userId:', { quizId: quizId.value, userId })
        return
      }

      console.log('Starting attempt for quiz:', quizId.value, 'user:', userId)

      const response = await api.post('/Attempt/start', {
        quizId: quizId.value,
        studentId: userId
      })

      console.log('Attempt start response:', response.data)

      if (response.data && response.data.attemptId) {
        attemptId.value = response.data.attemptId
        quizzesStore.currentAttempt.quizId = quizId.value
        quizzesStore.currentAttempt.quizTitle = response.data.quizTitle || quizTitle.value
        quizzesStore.currentAttempt.startAtISO = response.data.startedAt
        quizzesStore.currentAttempt.isOngoing = true
        // durationSeconds will be set in initDuration() after this function returns
        console.log('Attempt started successfully. AttemptId:', attemptId.value)
      } else {
        console.error('No attemptId in response:', response.data)
      }
    } catch (error) {
      console.error('Failed to start attempt:', error)
      alert('Failed to start quiz attempt. Please try again or contact support.')
    }
  }

  const saveAnswerToBackend = async (questionIndex: number, answer: number | number[] | string | string[] | Record<number, number> | null) => {
    try {
      if (!attemptId.value || !authStore.currentUser?.id) {
        console.warn('Cannot save answer: missing attemptId or userId')
        return
      }

      const question = questions.value[questionIndex]
      if (!question) return

      const questionId = question.questionId || question.id
      const qType = (question.type || '').toLowerCase()

      // Single-choice (radio button) - one answer with choiceId
      if (typeof answer === 'number' && (qType === 'single-choice' || qType === 'true-false')) {
        const choices = question.options
        if (Array.isArray(choices) && answer >= 0 && answer < choices.length) {
          const choiceId = choices[answer].choiceId || null

          await api.post(`/Answer?studentId=${authStore.currentUser.id}`, {
            attemptId: attemptId.value,
            questionId: questionId,
            choiceId: choiceId,
            textAnswer: null
          })
        }
      }
      // Multiple-choice (checkboxes) - multiple answers, one per selected choice
      // For now, save as JSON in textAnswer since backend doesn't support multiple answers per question easily
      else if (Array.isArray(answer) && qType === 'multiple-choice') {
        const choices = question.options
        if (Array.isArray(choices) && answer.length > 0) {
          // Convert indices to choiceIds
          const selectedChoiceIds = answer
            .filter(idx => idx >= 0 && idx < choices.length)
            .map(idx => choices[idx].choiceId)
            .filter(id => id != null)

          // Save as JSON array in textAnswer
          await api.post(`/Answer?studentId=${authStore.currentUser.id}`, {
            attemptId: attemptId.value,
            questionId: questionId,
            choiceId: null,
            textAnswer: JSON.stringify(selectedChoiceIds)
          })
        } else if (answer.length === 0) {
          // Clear answer if nothing selected
          await api.post(`/Answer?studentId=${authStore.currentUser.id}`, {
            attemptId: attemptId.value,
            questionId: questionId,
            choiceId: null,
            textAnswer: null
          })
        }
      }
      // Text/Essay questions
      else if (qType === 'text' || qType === 'essay') {
        await api.post(`/Answer?studentId=${authStore.currentUser.id}`, {
          attemptId: attemptId.value,
          questionId: questionId,
          choiceId: null,
          textAnswer: typeof answer === 'string' ? answer : null
        })
      }
      // Other complex types (enumeration, matching, fill-blank)
      else if (answer !== null && answer !== undefined) {
        await api.post(`/Answer?studentId=${authStore.currentUser.id}`, {
          attemptId: attemptId.value,
          questionId: questionId,
          choiceId: null,
          textAnswer: JSON.stringify(answer)
        })
      }

    } catch (error) {
      console.error('Failed to save answer:', error)
    }
  }

  const submitAttempt = async () => {
    try {
      if (!attemptId.value) {
        console.error('Cannot submit: attemptId is missing')
        alert('Cannot submit quiz: Attempt ID is missing. Please refresh and try again.')
        return
      }

      if (!authStore.currentUser?.id) {
        console.error('Cannot submit: user ID is missing')
        return
      }

      isSubmitting.value = true

      const startTime = quizzesStore.currentAttempt.startAtISO
        ? new Date(quizzesStore.currentAttempt.startAtISO).getTime()
        : Date.now()
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)

      console.log('Submitting attempt:', attemptId.value, 'timeSpent:', timeSpent)

      await api.put(`/Attempt/${attemptId.value}/submit?studentId=${authStore.currentUser.id}`, {
        timeSpentSeconds: timeSpent
      })

      quizzesStore.currentAttempt.endAtISO = new Date().toISOString()
      quizzesStore.currentAttempt.isOngoing = false

      // Mark quiz as submitted
      if (quizId.value) {
        quizzesStore.markQuizAsSubmitted(quizId.value)
      }

      console.log('Attempt submitted successfully')

    } catch (error) {
      console.error('Failed to submit attempt:', error)
      alert('Failed to submit quiz. Please try again.')
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  const loadAttemptFromBackend = async () => {
    try {
      const userId = authStore.currentUser?.id
      if (!userId || !quizId.value) return

      const response = await api.get(`/Attempt/student/${userId}`)

      if (response.data && Array.isArray(response.data)) {
        const ongoingAttempt = response.data.find((attempt: AttemptResponse) =>
          attempt.quizId === quizId.value && !attempt.submittedAt
        )

        if (ongoingAttempt) {
          attemptId.value = ongoingAttempt.attemptId

          const answersResponse = await api.get(`/Answer/attempt/${attemptId.value}?userId=${userId}`)

          if (answersResponse.data && Array.isArray(answersResponse.data)) {
            answersResponse.data.forEach((answer: AnswerResponse) => {
              const questionIndex = questions.value.findIndex((q: QuizQuestion) =>
                (q.questionId || q.id) === answer.questionId
              )

              if (questionIndex >= 0) {
                const question = questions.value[questionIndex]
                const qType = (question.type || '').toLowerCase()

                // Handle single-choice and true-false (radio buttons)
                if (answer.choiceId != null && Array.isArray(question.options) && (qType === 'single-choice' || qType === 'true-false')) {
                  const choiceIndex = question.options.findIndex((opt: QuestionOption) =>
                    opt.choiceId === answer.choiceId
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
                        quizzesStore.setAnswer(questionIndex, selectedIndices)
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
                      if (qType === 'enumeration' && Array.isArray(parsed)) {
                        quizzesStore.setEnumerationAnswer(questionIndex, parsed)
                        quizzesStore.markAnswered(questionIndex)
                      } else if (qType === 'matching' && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        const map: Record<number, number> = {}
                        Object.entries(parsed).forEach(([k, v]) => { map[Number(k)] = Number(v) })
                        quizzesStore.setMatchingAnswer(questionIndex, map)
                        quizzesStore.markAnswered(questionIndex)
                      } else if (qType === 'fill-blank' && Array.isArray(parsed)) {
                        quizzesStore.setFillBlankAnswer(questionIndex, parsed)
                        quizzesStore.markAnswered(questionIndex)
                      }
                    } catch {
                      if (qType === 'text' || qType === 'essay') {
                        quizzesStore.setTextAnswer(questionIndex, answer.textAnswer)
                        quizzesStore.markAnswered(questionIndex)
                      }
                    }
                  }
                }
              }
            })
          }

          return true
        }
      }

      return false
    } catch (error) {
      console.error('Failed to load attempt from backend:', error)
      return false
    }
  }

  const finishQuiz = async () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }

    try {
      console.log('=== finishQuiz called ===')
      console.log('quizId:', quizId.value)
      console.log('attemptId:', attemptId.value)
      console.log('questions.length:', questions.value.length)
      console.log('quizzesStore.currentAttempt before:', JSON.parse(JSON.stringify(quizzesStore.currentAttempt)))

      // Ensure the current attempt has all necessary data
      if (quizId.value) {
        quizzesStore.currentAttempt.quizId = quizId.value
        quizzesStore.currentAttempt.quizTitle = quizTitle.value
        quizzesStore.currentAttempt.questionsLength = questions.value.length
      }

      console.log('quizzesStore.currentAttempt after:', JSON.parse(JSON.stringify(quizzesStore.currentAttempt)))

      router.push({ name: 'quiz-review' })
    } catch (error) {
      console.error('Error finishing quiz:', error)
    }
  }

  const autoSubmitOnTimeout = async () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }

    await submitAttempt()
    quizzesStore.saveAttemptToHistory()

    // Mark quiz as submitted in backend-backed store
    if (quizzesStore.currentAttempt.quizId) {
      quizzesStore.markQuizAsSubmitted(quizzesStore.currentAttempt.quizId)
    }

    router.push({ name: 'quiz-score' })
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

  const initDuration = async () => {
    console.log('initDuration called, quizId:', quizId.value)
    console.log('quizMetadata:', quizMetadata.value)

    if (quizId.value == null) {
      console.warn('No quizId available')
      durationSeconds.value = 0
      timer.value = 0
      return
    }

    let sec = 0

    // First, try to use the metadata we fetched in onMounted
    if (quizMetadata.value.timeLimitMinutes) {
      sec = quizMetadata.value.timeLimitMinutes * 60
      console.log('Using timeLimitMinutes from quizMetadata:', quizMetadata.value.timeLimitMinutes, 'seconds:', sec)
    } else {
      // Try to get time limit from myStudentQuizzes
      const sq = quizzesStore.myStudentQuizzes.find(q => q.id === quizId.value)
      console.log('Found student quiz:', sq)
      sec = parseTimeLimitToSeconds(sq?.timeLimit)
      console.log('Parsed time limit from student quiz:', sec, 'from:', sq?.timeLimit)

      // If not found or zero, fetch from API
      if (sec === 0 && authStore.currentUser?.id) {
        try {
          console.log('Fetching quiz detail from API for quizId:', quizId.value)
          const detail = await quizzesStore.fetchQuizDetail(quizId.value, authStore.currentUser.id)
          console.log('Quiz detail from API:', detail)

          if (detail && detail.timeLimitMinutes) {
            sec = detail.timeLimitMinutes * 60
            quizMetadata.value.timeLimitMinutes = detail.timeLimitMinutes
            console.log('Got timeLimitMinutes from API:', detail.timeLimitMinutes, 'seconds:', sec)
          } else {
            console.warn('No timeLimitMinutes in API response')
          }
        } catch (error) {
          console.error('Failed to fetch quiz time limit:', error)
        }
      }
    }

    durationSeconds.value = sec > 0 ? sec : 0

    // Set durationSeconds in currentAttempt for ongoing attempts
    if (quizzesStore.currentAttempt.isOngoing && quizzesStore.currentAttempt.quizId === quizId.value) {
      // Update the durationSeconds if it wasn't set
      if (quizzesStore.currentAttempt.durationSeconds === 0) {
        quizzesStore.currentAttempt.durationSeconds = durationSeconds.value
      }
      timer.value = quizzesStore.getRemainingSeconds()
      console.log('Using ongoing attempt - duration:', durationSeconds.value, 'remaining:', timer.value)
      restoreAnswers()
    } else {
      timer.value = durationSeconds.value
      console.log('New attempt - duration:', durationSeconds.value, 'timer:', timer.value)
    }
  }

  const restoreAnswers = () => {
    const attempt = quizzesStore.currentAttempt
    Object.keys(attempt.answers).forEach(key => {
      const index = Number(key)
      const answer = attempt.answers[index]
      const q = questions.value[index]
      if (!q) return

      if (q.type === 'single-choice' || q.type === 'true-false') {
        if (typeof answer === 'number') {
          selectedOption.value = answer
        }
      } else if (q.type === 'multiple-choice') {
        if (Array.isArray(answer)) {
          selectedOptions.value = new Set(answer.filter((v): v is number => typeof v === 'number'))
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
          if (timerInterval.value) clearInterval(timerInterval.value)
          timerInterval.value = null
          autoSubmitOnTimeout()
        }
      }
    }, 1000)
  }

  // LIFECYCLE
  onMounted(async () => {
    isLoading.value = true

    try {
      if (questions.value.length === 0 && quizId.value != null) {
        const authLocal = useAuthStore()
        if (authLocal.currentUser?.id) {
          const detail = await quizzesStore.fetchQuizDetail(quizId.value, authLocal.currentUser.id)
          console.log('Fetched quiz detail in onMounted:', detail)

          if (detail && Array.isArray(detail.questions)) {
            questions.value = detail.questions.map((q: QuestionResponse) => quizzesStore.mapApiQuestionToFrontend(q))
            quizzesStore.currentAttempt.questionsLength = questions.value.length

            // Store quiz metadata for timer initialization
            quizMetadata.value = {
              title: detail.title,
              timeLimitMinutes: detail.timeLimitMinutes,
              courseId: detail.courseId,
              courseName: detail.courseName
            }

            console.log('Stored quiz metadata:', quizMetadata.value)

            // Set quiz title from API if not already set
            if (detail.title) {
              quizTitle.value = detail.title
            }
          }
        }
      }

      const hasOngoingAttempt = await loadAttemptFromBackend()

      if (!hasOngoingAttempt) {
        await startAttemptInBackend()
      }

      await initDuration()
      loadCurrentQuestionAnswers()

      // Only auto-submit if timer has actually run out during quiz-taking
      // Don't auto-submit when first loading the page
      if (durationSeconds.value > 0 && timer.value <= 0 && hasOngoingAttempt) {
        console.log('Timer expired for ongoing attempt - auto-submitting')
        autoSubmitOnTimeout()
      } else if (durationSeconds.value > 0 && timer.value > 0) {
        startTimer()
      }
    } finally {
      isLoading.value = false
    }
  })

  onUnmounted(() => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  })
  </script>

<template>
    <div class="min-h-screen">
      <AppHeader :breadcrumb="breadcrumb" />
      <div class="max-w-6xl mx-auto p-4 mt-8">

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600">Loading quiz...</p>
        </div>
      </div>

      <!-- No Questions Available -->
      <div v-else-if="!hasValidQuestions" class="flex items-center justify-center min-h-[400px]">
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
              <p class="text-base text-gray-700 leading-relaxed mb-6">{{ questions[currentQuestion].text || (questions[currentQuestion] as any).body }}</p>
              <div v-if="questions[currentQuestion].mediaUrl" class="mb-6">
                <img
                  :src="questions[currentQuestion].mediaUrl"
                  alt="Question image"
                  class="w-full max-h-80 object-contain rounded-2xl border border-gray-200"
                />
              </div>
            </div>

            <!-- Single Choice / True-False (Radio Buttons) -->
            <div v-if="['single-choice', 'true-false'].includes(questions[currentQuestion].type)" class="space-y-3">
              <div
                v-for="(option, index) in (questions[currentQuestion].options || (questions[currentQuestion] as any).choices || [])"
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
                >{{ (option && 'text' in option) ? (option as any).text : (option && 'body' in option ? (option as any).body : option) }}</span>
              </div>
            </div>

            <!-- Multiple Choice (Checkboxes) -->
            <div v-else-if="questions[currentQuestion].type === 'multiple-choice'" class="space-y-3">
              <div
                v-for="(option, index) in (questions[currentQuestion].options || (questions[currentQuestion] as any).choices || [])"
                :key="index"
                :class="[
                  'flex items-center p-2 rounded-xl cursor-pointer transition-all border-1',
                  isOptionSelected(index)
                    ? 'bg-[#C9E4F6] border-[#7B90DF]'
                    : 'bg-[#F4F7F9] border-[#7B90DF] hover:bg-gray-100'
                ]"
                @click="toggleOption(index)"
              >
                <div class="mr-4 flex items-center justify-center w-8 h-8">
                  <div
                    :class="[
                      'w-6 h-6 rounded border-1 flex items-center justify-center text-sm font-semibold',
                      isOptionSelected(index)
                        ? 'bg-[#8B9EE3] border-[#7B90DF] text-[#C9E4F6]'
                        : 'bg-[#F4F7F9] border-[#7B90DF] text-black'
                    ]"
                  >
                    <i
                      v-if="isOptionSelected(index)"
                      class="fas fa-check text-xs"
                    ></i>
                    <span v-else>{{ String.fromCharCode(65 + index) }}</span>
                  </div>
                </div>
                <span
                  :class="[
                    'text-base font-medium',
                    isOptionSelected(index) ? 'text-[#4866DA]' : 'text-gray-800'
                  ]"
                >{{ (option && 'text' in option) ? (option as any).text : (option && 'body' in option ? (option as any).body : option) }}</span>
              </div>
            </div>

            <!-- Text -->
            <div v-else-if="questions[currentQuestion].type === 'text' || questions[currentQuestion].type === 'Text'" class="space-y-3">
              <textarea
                v-model="textAnswer"
                @input="updateTextAnswer"
                class="w-full p-4 border-2 border-[#7B90DF] rounded-xl focus:border-[#4285f4] focus:outline-none resize-none"
                rows="6"
                placeholder="Type your answer here... (minimum 3 sentences)"
              ></textarea>
            </div>

            <!-- Enumeration -->
            <div v-else-if="questions[currentQuestion].type === 'enumeration' || questions[currentQuestion].type === 'Enumeration'" class="space-y-3">
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
            <div v-else-if="questions[currentQuestion].type === 'matching' || questions[currentQuestion].type === 'Matching'" class="space-y-3">
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
                      v-model.number="matchingAnswers[leftIndex]"
                      @change="updateMatchingAnswer(leftIndex, matchingAnswers[leftIndex])"
                      class="w-full p-3 border-2 border-[#7B90DF] rounded-xl focus:border-[#4285f4] focus:outline-none"
                    >
                      <option :value="undefined">Select answer...</option>
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
            <div v-else-if="questions[currentQuestion].type === 'fill-blank' || questions[currentQuestion].type === 'FillBlank'" class="space-y-3">
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
              class="px-8 py-2 bg-[#C9E4F6] border border-[#7B90DF] text-[#4D74FF] rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              @click="finishQuiz"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">
                <i class="fas fa-spinner fa-spin"></i> Submitting...
              </span>
              <span v-else>Finish</span>
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
                :disabled="isSubmitting"
                class="w-full px-4 py-2 bg-white border border-[#7B90DF] text-[#4285f4] rounded-xl font-medium hover:bg-[#F4F7F9] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i> Submitting...
                </span>
                <template v-else>
                  <span>Finish Attempt</span>
                  <i class="fas fa-arrow-right text-sm"></i>
                </template>
              </button>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  </template>


