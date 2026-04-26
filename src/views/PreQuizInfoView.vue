<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Book, Info, FileText, Clock, List, Award, AlertCircle, CheckCircle, XCircle, HelpCircle, Play, BarChart2, Tag, AlertTriangle } from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import type { QuizQuestion } from '@/interfaces/interfaces'

// Types
interface AttemptHistoryItem {
  attemptId: number
  quizId: number
  submittedAt: string
  startedAt: string
  score: number
  totalPoints: number
}

interface QuizHistoryDisplay {
  attempt: string
  attemptNumber: number
  attemptId: number
  date: string
  score: string
  mark: string
  isBest: boolean
  percentage: number
}

interface QuizData {
  id: number
  title: string
  subject: string
  duration: string
  questions: number
  correctAnswers: number
  passingScore: number
  passingPercentage: number
  attemptsAvailable: number
  maxAttempts: number
  currentScore: number
  improvement: number
  history: QuizHistoryDisplay[]
  basePoints: number
  hasScore: boolean
}

interface QuizApiResponse {
  quizId: number
  title: string
  courseId: number
  courseName?: string
  course?: { name: string }
  timeLimitMinutes: number
  questions: ApiQuestion[]
}

interface RouteParams {
  quizId: string
}

interface ApiAnswer {
  questionId: number
  choiceId?: number | null
  textAnswer?: string | null
}

interface ApiQuestion {
  questionId?: number
  id?: number
  type?: string
  choices?: Array<{
    choiceId: number
    body?: string
    text?: string
  }>
  options?: Array<{
    text: string
  }>
  pairs?: unknown[]
}

const route = useRoute()
const router = useRouter()
const quizzesStore = useQuizzesStore()
const authStore = useAuthStore()

const attemptHistory = ref<AttemptHistoryItem[]>([])
const isLoadingAttempts = ref(false)
const isLoadingQuiz = ref(false)
const quizQuestions = ref<QuizQuestion[]>([])
const isLoading = ref(true)
const showStartQuizModal = ref(false)
const quizMetadata = ref<QuizApiResponse | null>(null)

onMounted(async () => {
  try {
    isLoading.value = true
    const current = quizzesStore.currentAttempt
    const id = Number((route.params as unknown as RouteParams)?.quizId)

    if (current && current.isOngoing && current.quizId === id) {
      const remaining = quizzesStore.getRemainingSeconds()
      if (remaining <= 0 && current.durationSeconds > 0) {
        quizzesStore.finishAttempt()
        quizzesStore.clearAttemptStorage()
      }
    }

    await Promise.all([loadAttemptHistory(), loadQuizQuestions()])
  } finally {
    isLoading.value = false
  }
})

const loadAttemptHistory = async () => {
  try {
    isLoadingAttempts.value = true
    const userId = authStore.currentUser?.id
    const qId = quizId.value

    if (!userId || !qId) {
      console.error('Missing userId or quizId')
      return
    }

    const response = await api.get(`/Attempt/student/${userId}`)

    if (response.data && Array.isArray(response.data)) {
      const quizAttempts = (response.data as AttemptHistoryItem[]).filter((attempt) =>
        attempt.quizId === qId && attempt.submittedAt
      )

      quizAttempts.sort((a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )

      attemptHistory.value = quizAttempts
    }
  } catch (error) {
    console.error('Failed to load attempt history:', error)
  } finally {
    isLoadingAttempts.value = false
  }
}

const loadQuizQuestions = async () => {
  try {
    isLoadingQuiz.value = true
    const userId = authStore.currentUser?.id
    const qId = quizId.value

    if (!userId || !qId) {
      console.error('Missing userId or quizId')
      return
    }

    const response = await api.get(`/Quiz/${qId}`, {
      params: { userId }
    })

    if (response.data) {
      quizMetadata.value = response.data

      // Fetch course name if we have courseId
      if (response.data.courseId) {
        try {
          const courseResponse = await api.get(`/Course/${response.data.courseId}`)
          if (courseResponse.data) {
            quizMetadata.value.courseName = courseResponse.data.name || courseResponse.data.title
          }
        } catch (error) {
          console.error('Failed to load course name:', error)
        }
      }

      if (response.data.questions) {
        const questions = (response.data.questions || []) as ApiQuestion[]
        quizQuestions.value = questions.map((q) => quizzesStore.mapApiQuestionToFrontend(q))
      }
    }
  } catch (error) {
    console.error('Failed to load quiz questions:', error)
  } finally {
    isLoadingQuiz.value = false
  }
}

// COMPUTED
const quizId = computed(() => Number((route.params as unknown as RouteParams).quizId))

const breadcrumb = computed(() => `Dashboard > Quizzes > ${quiz.value?.title || 'Quiz'} > Score`)

const studentQuizData = computed(() => {
  // Try to get from store first (if available)
  const storeData = quizzesStore.myStudentQuizzes.find(q => q.id === quizId.value)
  if (storeData) return storeData

  // Fallback to API data if store is empty (e.g., after refresh)
  if (quizMetadata.value) {
    return {
      id: quizMetadata.value.quizId,
      subject: quizMetadata.value.course?.name || quizMetadata.value.courseName || 'Course',
      title: quizMetadata.value.title,
      description: '',
      dueDate: '',
      class: '',
      timeLimit: `${quizMetadata.value.timeLimitMinutes} min`,
      status: 'Not Started',
      color: 'blue',
      maxAttempts: 1,
      courseCode: '',
      courseSection: ''
    }
  }

  return null
})

const quiz = computed((): QuizData => {
  const studentQuiz = studentQuizData.value
  if (!studentQuiz) {
    return {
      id: quizId.value,
      title: 'Quiz Not Found',
      subject: 'Unknown',
      duration: '0 minutes',
      questions: 0,
      correctAnswers: 0,
      passingScore: 0,
      passingPercentage: 50,
      attemptsAvailable: 0,
      maxAttempts: 1,
      currentScore: 0,
      improvement: 0,
      history: [],
      basePoints: 0,
      hasScore: false
    }
  }

  const questionCount = quizQuestions.value.length
  const maxAttempts = 1 // All quizzes can only be taken once
  const history = attemptHistory.value

  const overallTotalPoints = quizQuestions.value.reduce((sum: number, q: QuizQuestion) => {
    const base = typeof q.points === 'number' ? q.points : 1
    if (q.type === 'matching' && Array.isArray(q.pairs) && q.pairs.length > 0) {
      return sum + base * q.pairs.length
    }
    if (q.type === 'enumeration' && Array.isArray(q.items) && q.items.length > 0) {
      return sum + base * q.items.length
    }
    return sum + base
  }, 0)

  const bestAttempt = history.reduce<AttemptHistoryItem | null>((best, cur) => {
    if (!best) return cur
    const curScore = cur.score || 0
    const bestScore = best.score || 0
    return curScore > bestScore ? cur : best
  }, null)

  const correctAnswers = bestAttempt ? bestAttempt.score : 0

  const improvement = history.length >= 2
    ? ((history[0].score || 0) / (history[0].totalPoints || 1) * 100) - ((history[history.length - 1].score || 0) / (history[history.length - 1].totalPoints || 1) * 100)
    : 0

  const basePoints = bestAttempt ? (bestAttempt.totalPoints || overallTotalPoints) : overallTotalPoints
  const passingScore = Math.ceil(basePoints * 0.5)

  const bestPercentage = bestAttempt && bestAttempt.totalPoints
    ? Math.round((bestAttempt.score / bestAttempt.totalPoints) * 100)
    : 0

  return {
    id: studentQuiz.id,
    title: studentQuiz.title,
    subject: studentQuiz.subject,
    duration: studentQuiz.timeLimit,
    questions: questionCount,
    correctAnswers,
    passingScore,
    passingPercentage: 50,
    attemptsAvailable: maxAttempts - history.length,
    maxAttempts,
    currentScore: bestPercentage,
    improvement,
    history: history.map((h, index) => {
      const percentage = h.totalPoints ? Math.round((h.score / h.totalPoints) * 100) : 0
      return {
        attempt: (history.length - index).toString(),
        attemptNumber: history.length - index,
        attemptId: h.attemptId,
        date: new Date(h.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        score: `${h.score || 0}/${h.totalPoints || basePoints}`,
        mark: percentage.toString(),
        isBest: bestAttempt ? h.attemptId === bestAttempt.attemptId : false,
        percentage: percentage
      }
    }).sort((a, b) => a.attemptNumber - b.attemptNumber), // Sort by attempt number ascending
    basePoints,
    hasScore: history.length > 0
  }
})

const canStartQuiz = computed(() => {
  return quiz.value.attemptsAvailable > 0 && !hasOngoingAttempt.value
})

const hasOngoingAttempt = computed(() => {
  const attempt = quizzesStore.currentAttempt
  return Boolean(attempt && attempt.isOngoing && attempt.quizId === quizId.value)
})

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


// METHODS
const openStartQuizModal = () => {
  showStartQuizModal.value = true
}

const closeStartQuizModal = () => {
  showStartQuizModal.value = false
}

const confirmStartQuiz = () => {
  showStartQuizModal.value = false
  startQuiz()
}

const startQuiz = () => {
  const questions = quizQuestions.value
  const durationSec = parseTimeLimitToSeconds(quiz.value.duration)
  quizzesStore.startAttempt(quizId.value, quiz.value.title, questions.length, durationSec)
  router.push({
    name: 'quiz',
    params: { quizId: quizId.value.toString() },
    state: {
      quizId: quizId.value,
      quizTitle: quiz.value.title,
      quizSubject: quiz.value.subject,
      questions
    }
  })
}

const continueQuiz = () => {
  const questions = quizQuestions.value
  router.push({
    name: 'quiz',
    params: { quizId: quizId.value.toString() },
    state: {
      quizId: quizId.value,
      quizTitle: quiz.value.title,
      quizSubject: quiz.value.subject,
      questions
    }
  })
}

const isDone = computed(() => quizzesStore.isQuizMarkedDone(quizId.value))

const toggleMarkAsDone = () => {
  quizzesStore.toggleQuizDone(quizId.value)
}

const reviewAttempt = async (attemptId: number) => {
  try {
    const userId = authStore.currentUser?.id
    if (!userId || !attemptId) {
      console.error('Missing userId or attemptId')
      return
    }

    const attempt = attemptHistory.value.find(a => a.attemptId === attemptId)
    if (!attempt) {
      console.error('Attempt not found')
      return
    }

    const quizResponse = await api.get(`/Quiz/${quizId.value}`, {
      params: { userId }
    })

    if (quizResponse.data) {
      const questions = (quizResponse.data.questions || []) as ApiQuestion[]
      const mappedQuestions = questions.map((q) => quizzesStore.mapApiQuestionToFrontend(q))

      const username = authStore.currentUser?.username
      if (username) {
        quizzesStore.setQuizQuestionsForScore(
          quizId.value,
          quiz.value.title,
          mappedQuestions,
          username
        )
      }

      quizzesStore.currentAttempt.quizId = quizId.value
      quizzesStore.currentAttempt.quizTitle = quiz.value.title
      quizzesStore.currentAttempt.questionsLength = mappedQuestions.length
      quizzesStore.currentAttempt.startAtISO = attempt.startedAt
      quizzesStore.currentAttempt.endAtISO = attempt.submittedAt
      quizzesStore.currentAttempt.isOngoing = false
      quizzesStore.currentAttempt.isHistoricalReview = true

      const answersResponse = await api.get(`/Answer/attempt/${attemptId}?userId=${userId}`)

      if (answersResponse.data && Array.isArray(answersResponse.data)) {
        (answersResponse.data as ApiAnswer[]).forEach((answer) => {
          const questionIndex = mappedQuestions.findIndex((q) =>
            (q.questionId || q.id) === answer.questionId
          )

          if (questionIndex >= 0) {
            const question = mappedQuestions[questionIndex]
            const qType = (question.type || '').toLowerCase()

            if (answer.choiceId != null && Array.isArray(question.options)) {
              const choiceIndex = question.options.findIndex((opt) =>
                opt.choiceId === answer.choiceId
              )

              if (choiceIndex >= 0) {
                quizzesStore.setAnswer(questionIndex, choiceIndex)
                quizzesStore.markAnswered(questionIndex)
              }
            } else if (answer.textAnswer) {
              if (qType === 'text' || qType === 'essay') {
                quizzesStore.setTextAnswer(questionIndex, answer.textAnswer)
                quizzesStore.markAnswered(questionIndex)
              } else {
                try {
                  const parsed = JSON.parse(answer.textAnswer)
                  if (qType === 'enumeration' && Array.isArray(parsed)) {
                    quizzesStore.setEnumerationAnswer(questionIndex, parsed as string[])
                    quizzesStore.markAnswered(questionIndex)
                  } else if (qType === 'matching' && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    const map: Record<number, number> = {}
                    Object.entries(parsed as Record<string, unknown>).forEach(([k, v]) => {
                      map[Number(k)] = Number(v)
                    })
                    quizzesStore.setMatchingAnswer(questionIndex, map)
                    quizzesStore.markAnswered(questionIndex)
                  } else if ((qType === 'fill-blank' || qType === 'fillblank' || qType === 'fill_blank') && Array.isArray(parsed)) {
                    quizzesStore.setFillBlankAnswer(questionIndex, parsed as string[])
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

      router.push({ name: 'quiz-score' })
    }
  } catch (error) {
    console.error('Failed to load attempt for review:', error)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader :breadcrumb="breadcrumb" />

    <!-- Main -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-5xl mx-auto">

        <!-- Loading State -->
        <div v-if="isLoading" class="bg-white rounded-3xl shadow-sm p-8 border-2 border-[#4285f4]">
          <div class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-[#4285f4] mb-4"></div>
            <p class="text-gray-600 text-lg">Loading quiz information...</p>
          </div>
        </div>

        <!-- Content -->
        <div v-else class="bg-white rounded-3xl shadow-sm overflow-hidden border-2 border-[#4285f4]">
          <div class="bg-[white] p-6 text-[#4285f4] border-b-2 border-[#4285f4]">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold flex items-center">
                  <Info class="w-6 h-6 mr-2" /> Quiz Information
                </h2>
                <p class="mt-2 opacity-90">Before you begin, here's important information about this quiz</p>
              </div>
              <button
                @click="toggleMarkAsDone"
                :class="[
                  isDone
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-white border-2 border-[#4285f4] text-[#4285f4] hover:bg-[#e3f2fd]',
                  'font-semibold py-2 px-6 rounded-xl transition duration-200 flex items-center shadow-sm cursor-pointer'
                ]"
              >
                <CheckCircle class="w-4 h-4 mr-2" /> {{ isDone ? 'Done' : 'Mark as Done' }}
              </button>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Quiz Details -->
              <div class="bg-[#F4F7F9] p-4 rounded-xl border border-[#7B90DF]">
                <h3 class="font-semibold text-[#4285f4] flex items-center">
                  <FileText class="w-4 h-4 mr-2" /> Quiz Details
                </h3>
                <ul class="mt-3 space-y-2 text-gray-700">
                  <li class="flex items-start">
                    <Tag class="mr-2 mt-1 w-4 h-4" />
                    <span>Quiz Name: <span class="font-medium">{{ quiz.title }}</span></span>
                  </li>
                  <li class="flex items-start">
                    <Book class="mr-2 mt-1 w-4 h-4" />
                    <span>Course: <span class="font-medium">{{ quiz.subject }}</span></span>
                  </li>
                  <li class="flex items-start">
                    <Clock class="mr-2 mt-1 w-4 h-4" />
                    <span>Duration: <span class="font-medium">{{ quiz.duration }}</span></span>
                  </li>
                  <li class="flex items-start">
                    <List class="mr-2 mt-1 w-4 h-4" />
                    <span>Questions: <span class="font-medium">{{ quiz.questions }}</span></span>
                  </li>
                </ul>
              </div>

              <!-- Score -->
              <div class="bg-[#F4F7F9] p-4 rounded-xl border border-[#7B90DF]">
                <h3 class="font-semibold text-[#4285f4] flex items-center">
                  <Award class="w-4 h-4 mr-2" /> Your Score
                </h3>
                <div class="mt-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-700 font-medium">Passing Score</span>
                    <span class="font-bold text-[#1976d2] text-lg">{{ quiz.passingScore }}/{{ quiz.basePoints }}</span>
                  </div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-gray-700 font-medium">Your Score</span>
                    <span class="font-bold text-[#4285f4] text-2xl">{{ quiz.hasScore ? quiz.correctAnswers : 0 }}/{{ quiz.basePoints }}</span>
                  </div>
                  <div class="flex items-center gap-3 mt-1">
                    <div class="w-full bg-gray-200 rounded-full h-3">
                      <div class="bg-[#4285f4] h-3 rounded-full transition-all" :style="{ width: (quiz.hasScore ? quiz.currentScore : 0) + '%' }"></div>
                    </div>
                    <span class="min-w-[3rem] text-sm font-semibold text-[#4285f4] text-right">{{ quiz.hasScore ? Math.round(quiz.currentScore) : 0 }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Instructions -->
            <div class="bg-[#F4F7F9] p-4 rounded-xl border border-[#7B90DF]">
              <h3 class="font-semibold text-[#4285f4] flex items-center">
                <AlertCircle class="w-4 h-4 mr-2" /> Important Instructions
              </h3>
              <div class="mt-3 space-y-3 text-gray-700">
                <div class="flex items-start">
                  <Clock class="mr-2 mt-1 text-amber-500 w-4 h-4" />
                  <span>The quiz will automatically submit when time runs out.</span>
                </div>
                <div class="flex items-start">
                  <XCircle class="mr-2 mt-1 text-red-500 w-4 h-4" />
                  <span>If you switch tabs, the quiz will automatically end.</span>
                </div>
                <div class="flex items-start">
                  <HelpCircle class="mr-2 mt-1 text-blue-600 w-4 h-4" />
                  <span>This quiz can only be taken once. {{ quiz.attemptsAvailable > 0 ? 'You have not taken this quiz yet.' : 'You have already completed this quiz.' }}</span>
                </div>
              </div>
            </div>

            <!-- Footer actions -->
            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
              <div class="flex items-center text-gray-600">
                <HelpCircle class="w-4 h-4 mr-2" />
                <span>Need help? Contact your instructor</span>
              </div>
              <div class="flex flex-col items-end gap-2">
                <div v-if="!canStartQuiz && !hasOngoingAttempt" class="text-red-600 text-sm flex items-center">
                  <XCircle class="w-4 h-4 mr-2" />
                  Quiz already completed
                </div>
                <button
                  v-if="!hasOngoingAttempt"
                  @click="openStartQuizModal"
                  :disabled="!canStartQuiz"
                  class="bg-[#4285f4] hover:bg-[#1976d2] text-white font-semibold py-3 px-8 rounded-xl transition duration-200 flex items-center shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                >
                  <Play class="w-4 h-4 mr-2" /> Start Quiz
                </button>
                <button v-else @click="continueQuiz" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition duration-200 flex items-center shadow-sm">
                  <Play class="w-4 h-4 mr-2" /> Continue Ongoing Quiz
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Attempts History -->
        <div v-if="!isLoading" class="mt-8 bg-white rounded-3xl p-6 shadow-sm border-2 border-[#4285f4]">
          <h3 class="text-xl font-bold text-[#4285f4] flex items-center">
            <BarChart2 class="w-5 h-5 mr-2" /> Attempts History
          </h3>
          <div class="mt-4">
            <div class="grid grid-cols-5 gap-4 text-center mb-4 text-gray-700 font-semibold">
              <div>Attempts</div>
              <div>Date</div>
              <div>Score</div>
              <div>Mark</div>
              <div>Review</div>
            </div>
            <div class="space-y-3">
              <div v-if="quiz.history.length === 0" class="text-center py-8 text-gray-500">
                <p>No attempts yet. Start the quiz to see your history.</p>
              </div>
              <div v-for="item in quiz.history" :key="item.attempt + item.date" :class="[
                  'grid grid-cols-5 gap-4 text-center items-center p-3 rounded-xl border',
                  item.isBest ? 'bg-blue-50 border-blue-400' : 'bg-[#F4F7F9] border-[#7B90DF]'
                ]">
                <div :class="item.isBest ? 'text-blue-800 font-semibold' : 'text-gray-800'">{{ item.attempt }}</div>
                <div :class="item.isBest ? 'text-blue-700' : 'text-gray-600'">{{ item.date }}</div>
                <div :class="item.isBest ? 'font-extrabold text-blue-600' : 'font-bold text-[#4285f4]'">{{ item.score }}</div>
                <div :class="item.isBest ? 'font-extrabold text-blue-700' : 'font-bold text-[#1976d2]'">{{ item.mark }}%</div>
                <div>
                  <button
                    @click="reviewAttempt(item.attemptId)"
                    class="text-[#4285f4] hover:text-[#1976d2] font-medium hover:underline transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Start Quiz Confirmation Modal -->
    <div
      v-if="showStartQuizModal"
      class="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeStartQuizModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 transform transition-all max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-start sm:items-center gap-3 mb-4">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle class="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg sm:text-xl font-bold text-gray-900">Ready to Start?</h3>
            <p class="text-xs sm:text-sm text-gray-600">Please read these important reminders</p>
          </div>
        </div>

        <!-- Content -->
        <div class="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-2.5 sm:p-3 rounded">
            <div class="flex items-start gap-2">
              <Clock class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs sm:text-sm font-semibold text-blue-900">Time Limit</p>
                <p class="text-xs sm:text-sm text-blue-800">You have {{ quiz.duration }} to complete this quiz. The quiz will auto-submit when time runs out.</p>
              </div>
            </div>
          </div>

          <div class="bg-red-50 border-l-4 border-red-500 p-2.5 sm:p-3 rounded">
            <div class="flex items-start gap-2">
              <XCircle class="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs sm:text-sm font-semibold text-red-900">No Tab Switching</p>
                <p class="text-xs sm:text-sm text-red-800">Switching tabs or windows will automatically end your quiz attempt.</p>
              </div>
            </div>
          </div>

          <div class="bg-amber-50 border-l-4 border-amber-500 p-2.5 sm:p-3 rounded">
            <div class="flex items-start gap-2">
              <AlertCircle class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs sm:text-sm font-semibold text-amber-900">Single Attempt</p>
                <p class="text-xs sm:text-sm text-amber-800">This quiz can only be taken once. Make sure you're ready before starting.</p>
              </div>
            </div>
          </div>

          <div class="bg-green-50 border-l-4 border-green-500 p-2.5 sm:p-3 rounded">
            <div class="flex items-start gap-2">
              <CheckCircle class="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs sm:text-sm font-semibold text-green-900">Auto-Save</p>
                <p class="text-xs sm:text-sm text-green-800">Your answers are automatically saved as you progress through the quiz.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            @click="closeStartQuizModal"
            class="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            @click="confirmStartQuiz"
            class="flex-1 px-4 py-2.5 bg-[#4285f4] text-white rounded-xl font-semibold hover:bg-[#1976d2] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
          >
            <Play class="w-4 h-4" />
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
