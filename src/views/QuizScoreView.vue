<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import type { ScoreReviewQuestion } from '@/interfaces/interfaces'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

// CONSTANTS
const router = useRouter()
const route = useRoute()
const quizzesStore = useQuizzesStore()
const authStore = useAuthStore()

// TYPE DEFINITIONS
interface AttemptResponse {
  attemptId: number
  quizId: number
  startedAt: string
  submittedAt: string
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
  options?: { text: string }[]
  choices?: { choiceId: number; body?: string; text?: string }[]
}

// REFS
const currentQuestion = ref(0)
const isLoading = ref(true)
const attemptData = ref<{
  attemptId: number
  quizId: number
  startedAt: string
  submittedAt: string
  score?: number
} | null>(null)
const quizData = ref<{
  title: string
  course?: { name: string }
  questions?: unknown[]
} | null>(null)

// COMPUTED
const questions = computed(() => {
  if (isLoading.value) return []
  try {
    return quizzesStore.getScoreItems() as ScoreReviewQuestion[]
  } catch (error) {
    console.error('Error getting score items:', error)
    return []
  }
})

const breadcrumb = computed(() => `Dashboard > Quizzes > ${quizData.value?.title || 'Quiz'} > Score`)

const currentQuestionData = computed(() => {
  if (!questions.value || questions.value.length === 0) return null
  return questions.value[currentQuestion.value]
})

const scoreDetails = computed(() => quizzesStore.calculateScore())

const score = computed(() => {
  // Use backend score if available
  if (attemptData.value?.score != null) {
    return `${attemptData.value.score.toFixed(2)}%`
  }
  // Fallback to frontend calculation
  return `${scoreDetails.value.score}/${scoreDetails.value.totalPoints}`
})

const startedAtText = computed(() => {
  if (attemptData.value?.startedAt) {
    return new Date(attemptData.value.startedAt).toLocaleString()
  }
  const iso = quizzesStore.currentAttempt.startAtISO
  return iso ? new Date(iso).toLocaleString() : '-'
})

const completedAtText = computed(() => {
  if (attemptData.value?.submittedAt) {
    return new Date(attemptData.value.submittedAt).toLocaleString()
  }
  const iso = quizzesStore.currentAttempt.endAtISO
  return iso ? new Date(iso).toLocaleString() : '-'
})

// METHODS
const goToQuestion = (questionIndex: number) => {
  currentQuestion.value = questionIndex
}

const nextQuestion = () => {
  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++
  }
}

const previousQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
  }
}

const finishReview = () => {
  quizzesStore.clearAttemptStorage()

  const quizId = quizzesStore.currentAttempt.quizId
  if (quizId) {
    router.push({ name: 'student-prequiz', params: { quizId: quizId.toString() } })
  } else {
    router.push({ name: 'student' })
  }
}

const isQuestionUnanswered = (q: ScoreReviewQuestion | undefined | null): boolean => {
  if (!q) return true
  
  if (q.questionType === 'multiple-choice') {
    return !q.userAnswer || (q.userAnswer as unknown[]).length === 0
  }
  
  if (q.questionType === 'enumeration') {
    if (!Array.isArray(q.userAnswer) || q.userAnswer.length === 0) return true
    return (q.userAnswer as string[]).every((ans: string | null | undefined) => ans == null || String(ans).trim() === '')
  }
  
  if (q.questionType === 'matching') {
    if (!Array.isArray(q.matchingPairs) || q.matchingPairs.length === 0) return true
    return q.matchingPairs.every((pair) => !pair.userRight || String(pair.userRight).trim() === '')
  }
  
  return q.userAnswer == null || String(q.userAnswer).trim() === ''
}

const getQuestionButtonClass = (index: number) => {
  const question = questions.value[index]
  if (!question) return 'border-[#7B90DF] bg-[#F4F7F9] text-gray-800'

  const isActive = currentQuestion.value === index

  if (isActive) {
    return question.isCorrect
      ? 'border-[#4285f4] bg-[#e3f2fd] text-[#1976d2]'
      : 'border-[#4285f4] bg-[#e3f2fd] text-[#1976d2]'
  }

  return question.isCorrect
    ? 'border-[#4ade80] bg-[#86efac] text-green-800 hover:bg-green-300'
    : 'border-[#f87171] bg-[#fca5a5] text-red-800 hover:bg-red-300'
}

const getOptionClass = (optionIndex: number) => {
  const question = currentQuestionData.value
  if (!question) return 'bg-[#F4F7F9] border-[#7B90DF]'

  const isUserAnswer = question.userAnswer === optionIndex
  const isCorrectAnswer = question.correctAnswer === optionIndex

  if (isUserAnswer && isCorrectAnswer) {
    return 'bg-[#86efac] border-[#4ade80]'
  }
  if (isUserAnswer && !isCorrectAnswer) {
    return 'bg-[#fca5a5] border-[#f87171]'
  }
  if (isCorrectAnswer) {
    return 'bg-[#F4F7F9] border-[#4ade80]'
  }

  return 'bg-[#F4F7F9] border-[#7B90DF]'
}

const getOptionIconClass = (optionIndex: number) => {
  const question = currentQuestionData.value
  if (!question) return 'bg-[#F4F7F9] border-[#7B90DF] text-black'

  const isUserAnswer = question.userAnswer === optionIndex
  const isCorrectAnswer = question.correctAnswer === optionIndex

  if (isCorrectAnswer && isUserAnswer) {
    return 'bg-[#4ade80] border-[#4ade80] text-white'
  }
  if (isCorrectAnswer) {
    return 'bg-[#F4F7F9] border-[#4ade80] text-[#4ade80]'
  } else if (isUserAnswer) {
    return 'bg-[#f87171] border-[#f87171] text-white'
  }

  return 'bg-[#F4F7F9] border-[#7B90DF] text-black'
}

const showIcon = (optionIndex: number) => {
  const question = currentQuestionData.value
  if (!question) return false

  const isUserAnswer = question.userAnswer === optionIndex
  const isCorrectAnswer = question.correctAnswer === optionIndex

  return isUserAnswer || isCorrectAnswer
}

const getIconType = (optionIndex: number) => {
  const question = currentQuestionData.value
  if (!question) return 'times'

  const isCorrectAnswer = question.correctAnswer === optionIndex

  return isCorrectAnswer ? 'check' : 'times'
}

const isCorrectOption = (optionIndex: number) => {
  const question = currentQuestionData.value
  if (!question) return false
  return question.correctAnswer === optionIndex
}

const isShortAnswerCorrect = (answer: string | string[] | number | null | undefined) => {
  if (!answer) return false
  const text = String(answer).trim()
  if (!text) return false
  const sentences = text
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(Boolean)

  if (sentences.length < 3) return false

  const allSentencesLongEnough = sentences.every(sentence => {
    const words = sentence
      .split(/\s+/)
      .map(w => w.trim())
      .filter(Boolean)
    return words.length >= 3
  })

  return allSentencesLongEnough
}

const getQuestionScore = (index: number) => {
  const q = questions.value[index]
  if (!q) {
    return { earned: 0, total: 0 }
  }

  const basePoints = q.points || 0
  let total = basePoints
  let earned = 0

  if (q.questionType === 'matching' && Array.isArray(q.matchingPairs) && q.matchingPairs.length > 0) {
    total = basePoints * q.matchingPairs.length
    const correctCount = q.matchingPairs.filter(p => p.isCorrect).length
    earned = basePoints * correctCount
    return { earned, total }
  }

  if (q.questionType === 'enumeration' && Array.isArray(q.options) && q.options.length > 0) {
    const items = q.options
    total = basePoints * items.length

    const userItems: string[] = Array.isArray(q.userAnswer)
      ? (q.userAnswer as (string | number | null)[]).map(v => (v != null ? String(v) : ''))
      : []

    const normalize = (text: string) => text.trim().toLowerCase()
    const correctNormalized = items.map(item => normalize(String(item || ''))).filter(Boolean)
    const userNormalized = userItems.map(item => normalize(String(item || ''))).filter(Boolean)

    const userSet = new Set(userNormalized)

    let correctItemCount = 0
    const counted = new Set<string>()
    correctNormalized.forEach(val => {
      if (userSet.has(val) && !counted.has(val)) {
        correctItemCount += 1
        counted.add(val)
      }
    })

    earned = basePoints * correctItemCount
    return { earned, total }
  }

  if (q.questionType === 'fill-blank') {
    total = basePoints
    earned = q.isCorrect ? basePoints : 0
    return { earned, total }
  }

  if (q.questionType === 'text') {
    total = basePoints
    earned = isShortAnswerCorrect(q.userAnswer) ? basePoints : 0
    return { earned, total }
  }

  if ((q.questionType === 'multiple-choice' || q.questionType === 'true-false' || !q.questionType) && Array.isArray(q.options) && q.options.length > 0) {
    total = basePoints
    if (q.userAnswer !== null && q.userAnswer !== undefined && q.userAnswer === q.correctAnswer) {
      earned = basePoints
    }
    return { earned, total }
  }

  total = basePoints
  earned = q.isCorrect ? basePoints : 0
  return { earned, total }
}

const isEnumerationItemCorrect = (itemIndex: number) => {
  const q = currentQuestionData.value
  if (!q || !Array.isArray(q.options)) return false

  const items = q.options
  const userItems: string[] = Array.isArray(q.userAnswer)
    ? (q.userAnswer as (string | number | null)[]).map(v => (v != null ? String(v) : ''))
    : []

  const normalize = (text: string) => text.trim().toLowerCase()
  const correctSet = new Set(items.map(item => normalize(String(item || ''))).filter(Boolean))

  const raw = userItems[itemIndex] != null ? String(userItems[itemIndex]) : ''
  const userTrim = normalize(raw)

  if (!userTrim) return false
  if (correctSet.size === 0) return false

  return correctSet.has(userTrim)
}

const loadScoreData = async () => {
  try {
    isLoading.value = true
    const userId = authStore.currentUser?.id

    // Try to get quizId from multiple sources
    let quizId = quizzesStore.currentAttempt.quizId

    // If not in store, try route params
    if (!quizId && route.params.quizId) {
      quizId = Number(route.params.quizId)
    }

    // If not in route, try localStorage
    if (!quizId) {
      const stored = localStorage.getItem('lastQuizId')
      if (stored) {
        quizId = Number(stored)
      }
    }

    console.log('=== QuizScoreView: loadScoreData ===')
    console.log('userId:', userId, 'quizId:', quizId)

    if (!userId || !quizId) {
      console.error('Missing userId or quizId')
      isLoading.value = false
      return
    }

    const attemptsResponse = await api.get(`/Attempt/student/${userId}`)
    console.log('Attempts response:', attemptsResponse.data)

    if (attemptsResponse.data && Array.isArray(attemptsResponse.data)) {
      const submittedAttempts = attemptsResponse.data.filter((attempt: AttemptResponse) =>
        attempt.quizId === quizId && attempt.submittedAt
      )

      console.log('Submitted attempts for quiz:', submittedAttempts)

      if (submittedAttempts.length > 0) {
        submittedAttempts.sort((a: AttemptResponse, b: AttemptResponse) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        )
        attemptData.value = submittedAttempts[0]
        console.log('Using attempt:', attemptData.value)

        const quizResponse = await api.get(`/Quiz/${quizId}`, {
          params: { userId }
        })

        console.log('Quiz response:', quizResponse.data)

        if (quizResponse.data) {
          quizData.value = quizResponse.data

          const questions = quizResponse.data.questions || []
          console.log('Raw questions from API:', questions)

          const mappedQuestions = questions.map((q: QuestionResponse) => quizzesStore.mapApiQuestionToFrontend(q))
          console.log('Mapped questions:', mappedQuestions)

          const username = authStore.currentUser?.username
          if (username) {
            quizzesStore.setQuizQuestionsForScore(
              quizId,
              quizData.value.title,
              mappedQuestions,
              username
            )
          }

          if (mappedQuestions.length > 0) {
            quizzesStore.currentAttempt.questionsLength = mappedQuestions.length
          }

          const answersResponse = await api.get(`/Answer/attempt/${attemptData.value.attemptId}?userId=${userId}`)
          console.log('Answers response:', answersResponse.data)

          let answersList: AnswerResponse[] = []
          if (answersResponse.data) {
            if (Array.isArray(answersResponse.data)) {
              answersList = answersResponse.data
            } else if (Array.isArray(answersResponse.data.answers)) {
              answersList = answersResponse.data.answers
            }
          }

          if (answersList.length > 0) {
            answersList.forEach((answer: AnswerResponse) => {
              const questionIndex = mappedQuestions.findIndex((q: QuestionResponse) =>
                (q.questionId || q.id) === answer.questionId
              )

              console.log(`Processing answer for questionId ${answer.questionId}:`, answer, 'questionIndex:', questionIndex)

              if (questionIndex >= 0) {
                const question = mappedQuestions[questionIndex]
                const qType = (question.type || '').toLowerCase()
                console.log(`Question type: ${qType}`)

                // Handle single-choice and true-false (radio buttons) - uses choiceId
                if (answer.choiceId != null && (qType === 'single-choice' || qType === 'true-false')) {
                  const choiceIndex = question.options?.findIndex((opt: { text: string; choiceId?: number }) =>
                    opt.choiceId === answer.choiceId
                  )

                  console.log(`Single-choice: choiceId=${answer.choiceId}, choiceIndex=${choiceIndex}`)

                  if (choiceIndex != null && choiceIndex >= 0) {
                    quizzesStore.setAnswer(questionIndex, choiceIndex)
                    quizzesStore.markAnswered(questionIndex)
                  }
                }
                // Handle multiple-choice (checkboxes) - stored as JSON array of choiceIds in textAnswer
                else if (answer.textAnswer && qType === 'multiple-choice') {
                  try {
                    const parsed = JSON.parse(answer.textAnswer)
                    console.log('Multiple-choice parsed:', parsed)
                    if (Array.isArray(parsed)) {
                      // parsed is array of choiceIds, convert to array of indices
                      const selectedIndices: number[] = []
                      parsed.forEach((choiceId: number) => {
                        const idx = question.options?.findIndex((opt: { text: string; choiceId?: number }) => opt.choiceId === choiceId)
                        if (idx != null && idx >= 0) {
                          selectedIndices.push(idx)
                        }
                      })
                      console.log('Multiple-choice selectedIndices:', selectedIndices)
                      if (selectedIndices.length > 0) {
                        quizzesStore.setAnswer(questionIndex, selectedIndices)
                        quizzesStore.markAnswered(questionIndex)
                      }
                    }
                  } catch (e) {
                    console.error('Failed to parse multiple-choice answer:', e)
                  }
                }
                // Handle text/essay questions
                else if (answer.textAnswer && (qType === 'text' || qType === 'essay')) {
                  console.log('Text/essay answer:', answer.textAnswer)
                  quizzesStore.setTextAnswer(questionIndex, answer.textAnswer)
                  quizzesStore.markAnswered(questionIndex)
                }
                // Handle other question types with JSON answers
                else if (answer.textAnswer) {
                  try {
                    const parsed = JSON.parse(answer.textAnswer)
                    console.log('Parsed JSON answer:', parsed)
                    if (qType === 'enumeration' && Array.isArray(parsed)) {
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
                  } catch (e) {
                    // If JSON parsing fails, treat as plain text
                    console.warn('Failed to parse answer as JSON, treating as text:', e)
                    quizzesStore.setTextAnswer(questionIndex, answer.textAnswer)
                    quizzesStore.markAnswered(questionIndex)
                  }
                }
              }
            })
          }

          quizzesStore.currentAttempt.quizId = quizId
          quizzesStore.currentAttempt.quizTitle = quizData.value.title
          quizzesStore.currentAttempt.startAtISO = attemptData.value.startedAt
          quizzesStore.currentAttempt.endAtISO = attemptData.value.submittedAt
          quizzesStore.currentAttempt.isOngoing = false

          console.log('Final currentAttempt:', quizzesStore.currentAttempt)
          console.log('Final questions from getScoreItems:', quizzesStore.getScoreItems())
        }
      } else {
        console.warn('No submitted attempts found for this quiz')
      }
    }
  } catch (error) {
    console.error('Failed to load score data:', error)
  } finally {
    isLoading.value = false
  }
}

// LIFECYCLE
onMounted(async () => {
  await loadScoreData()
})
</script>

<template>
  <div class="min-h-screen">
    <AppHeader :breadcrumb="breadcrumb" />

    <div class="max-w-6xl mx-auto p-4 mt-8">
      <!-- Quiz AppHeader Info -->
      <div class="mb-6 flex items-start gap-6">
        <!-- Title Block -->
        <div class="shrink-0">
          <h1 class="text-3xl font-bold text-[#4285f4] leading-tight">{{ quizData?.title || 'Quiz' }}</h1>
          <p class="text-base text-gray-800">{{ quizData?.course?.name || 'Course' }}</p>
        </div>

        <!-- Info Box -->
        <div class="flex-1 min-w-[420px]">
          <div class="rounded-2xl border border-[#D7E8FF] overflow-hidden">
            <!-- Row 1 -->
            <div class="grid grid-cols-2 divide-x divide-[#D7E8FF]">
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Status:</span>
                <span class="ml-2 text-gray-800">Finished</span>
              </div>
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Started:</span>
                <span class="ml-2 text-gray-800">{{ startedAtText }}</span>
              </div>
            </div>
            <!-- Row 2 -->
            <div class="grid grid-cols-2 divide-x divide-[#D7E8FF] border-t border-[#D7E8FF]">
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Score:</span>
                <span class="ml-2 text-gray-800">{{ score }}</span>
              </div>
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Completed:</span>
                <span class="ml-2 text-gray-800">{{ completedAtText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="grid grid-cols-3 gap-6">
        <!-- Left Panel -->
        <div class="col-span-2">
          <!-- Loading State -->
          <div v-if="isLoading" class="bg-white rounded-3xl shadow-sm p-8 border-2 border-[#4285f4] text-center">
            <div class="flex flex-col items-center justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4285f4] mb-4"></div>
              <p class="text-gray-600">Loading quiz results...</p>
            </div>
          </div>

          <!-- No Data State -->
          <div v-else-if="!currentQuestionData" class="bg-white rounded-3xl shadow-sm p-8 border-2 border-[#4285f4] text-center">
            <p class="text-gray-600">No quiz data available. Please complete a quiz first.</p>
          </div>

          <!-- Question Display -->
          <div v-else class="bg-white rounded-3xl shadow-sm p-8 border-2 border-[#4285f4] relative">
            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800">Question {{ currentQuestion + 1 }}</h2>
                <span class="text-sm font-semibold text-[#4285f4]">
                  Score:
                  {{ getQuestionScore(currentQuestion).earned }}
                  /
                  {{ getQuestionScore(currentQuestion).total }}
                </span>
              </div>
              <p class="text-base text-gray-700 leading-relaxed mb-6">{{ currentQuestionData.question }}</p>
            </div>

            <div v-if="isQuestionUnanswered(currentQuestionData)" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 font-semibold flex items-center gap-2">
              <i class="fas fa-exclamation-circle"></i>
              <span>Unanswered</span>
            </div>

            <div class="space-y-3">
              <!-- Single Choice / True-False Rendering -->
              <template v-if="currentQuestionData.questionType === 'single-choice' || currentQuestionData.questionType === 'true-false' || (!currentQuestionData.questionType && !Array.isArray(currentQuestionData.userAnswer))">
                <div
                  v-for="(option, index) in currentQuestionData.options"
                  :key="index"
                  :class="[
                    'relative flex items-center p-2 rounded-xl transition-all border-1',
                    getOptionClass(index)
                  ]"
                >
                  <div
                    v-if="isCorrectOption(index) && currentQuestionData.userAnswer !== index"
                    class="absolute -top-3 left-3 bg-white text-[#16a34a] border border-[#4ade80] rounded-md px-2 py-0.5 text-xs font-semibold"
                  >
                    Correct
                  </div>
                  <div class="mr-4 flex items-center justify-center w-8 h-8">
                    <div
                      :class="[
                        'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                        getOptionIconClass(index)
                      ]"
                    >
                      <i
                        v-if="showIcon(index)"
                        :class="['fas', `fa-${getIconType(index)}`,'text-xs']"
                      ></i>
                      <span v-else>{{ String.fromCharCode(65 + index) }}</span>
                    </div>
                  </div>
                  <span
                    :class="[
                      'text-base font-medium',
                      currentQuestionData.userAnswer === index ? 'text-[#4866DA]' : 'text-gray-800'
                    ]"
                  >{{ option }}</span>
                </div>
              </template>

              <!-- Multiple Choice Rendering (checkboxes) -->
              <template v-else-if="currentQuestionData.questionType === 'multiple-choice' || Array.isArray(currentQuestionData.userAnswer)">
                <div
                  v-for="(option, index) in currentQuestionData.options"
                  :key="index"
                  :class="[
                    'relative flex items-center p-2 rounded-xl transition-all border-1',
                    Array.isArray(currentQuestionData.userAnswer) && currentQuestionData.userAnswer.includes(index)
                      ? (Array.isArray(currentQuestionData.correctAnswer) && currentQuestionData.correctAnswer.includes(index)
                        ? 'bg-[#86efac] border-[#4ade80]'
                        : 'bg-[#fca5a5] border-[#f87171]')
                      : (Array.isArray(currentQuestionData.correctAnswer) && currentQuestionData.correctAnswer.includes(index)
                        ? 'bg-[#F4F7F9] border-[#4ade80]'
                        : 'bg-[#F4F7F9] border-[#7B90DF]')
                  ]"
                >
                  <div
                    v-if="Array.isArray(currentQuestionData.correctAnswer) && currentQuestionData.correctAnswer.includes(index) && !(Array.isArray(currentQuestionData.userAnswer) && currentQuestionData.userAnswer.includes(index))"
                    class="absolute -top-3 left-3 bg-white text-[#16a34a] border border-[#4ade80] rounded-md px-2 py-0.5 text-xs font-semibold"
                  >
                    Correct
                  </div>
                  <div class="mr-4 flex items-center justify-center w-8 h-8">
                    <div
                      :class="[
                        'w-6 h-6 rounded-sm border-1 flex items-center justify-center text-sm font-semibold',
                        (Array.isArray(currentQuestionData.correctAnswer) && currentQuestionData.correctAnswer.includes(index) && Array.isArray(currentQuestionData.userAnswer) && currentQuestionData.userAnswer.includes(index))
                          ? 'bg-[#4ade80] border-[#4ade80] text-white'
                          : (Array.isArray(currentQuestionData.correctAnswer) && currentQuestionData.correctAnswer.includes(index))
                          ? 'bg-[#F4F7F9] border-[#4ade80] text-[#4ade80]'
                          : (Array.isArray(currentQuestionData.userAnswer) && currentQuestionData.userAnswer.includes(index))
                          ? 'bg-[#f87171] border-[#f87171] text-white'
                          : 'bg-[#F4F7F9] border-[#7B90DF] text-black'
                      ]"
                    >
                      <i
                        v-if="(Array.isArray(currentQuestionData.userAnswer) && currentQuestionData.userAnswer.includes(index)) || (Array.isArray(currentQuestionData.correctAnswer) && currentQuestionData.correctAnswer.includes(index))"
                        :class="[
                          'fas',
                          (Array.isArray(currentQuestionData.correctAnswer) && currentQuestionData.correctAnswer.includes(index)) ? 'fa-check' : 'fa-times',
                          'text-xs'
                        ]"
                      ></i>
                      <span v-else>{{ String.fromCharCode(65 + index) }}</span>
                    </div>
                  </div>
                  <span
                    :class="[
                      'text-base font-medium',
                      (Array.isArray(currentQuestionData.userAnswer) && currentQuestionData.userAnswer.includes(index)) ? 'text-[#4866DA]' : 'text-gray-800'
                    ]"
                  >{{ option }}</span>
                </div>
              </template>

              <!-- Enumeration Rendering -->
              <template v-else-if="currentQuestionData.questionType === 'enumeration'">
                <div class="space-y-3">
                  <div
                    v-for="(_, index) in (currentQuestionData.options || [])"
                    :key="index"
                    class="flex items-center gap-3"
                  >
                    <span class="text-gray-600 font-medium">{{ index + 1 }}.</span>
                    <div
                      :class="[
                        'flex-1 p-3 rounded-xl border-2 flex items-center',
                        isEnumerationItemCorrect(index)
                          ? 'bg-[#86efac] border-[#4ade80] text-green-900'
                          : 'bg-[#fca5a5] border-[#f87171] text-black'
                      ]"
                    >
                      <div class="mr-4 flex items-center justify-center w-8 h-8">
                        <div
                          :class="[
                            'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                            isEnumerationItemCorrect(index)
                              ? 'bg-[#4ade80] border-[#4ade80] text-white'
                              : 'bg-[#f87171] border-[#f87171] text-white'
                          ]"
                        >
                          <i
                            :class="[
                              'fas',
                              isEnumerationItemCorrect(index) ? 'fa-check' : 'fa-times',
                              'text-xs'
                            ]"
                          ></i>
                        </div>
                      </div>

                      <div class="flex flex-col text-sm">
                        <span class="font-medium text-gray-800">
                          Your answer:
                          <span
                            v-if="
                              (currentQuestionData.userAnswer || [])[index] &&
                              String((currentQuestionData.userAnswer || [])[index]).trim() !== ''
                            "
                          >
                            {{ (currentQuestionData.userAnswer || [])[index] }}
                          </span>
                          <span v-else class="italic">(unanswered)</span>
                        </span>
                        <span
                          v-if="!isEnumerationItemCorrect(index) && (currentQuestionData.options || [])[index]"
                          class="text-xs text-[#16a34a] mt-1"
                        >
                          Correct: {{ (currentQuestionData.options || [])[index] || '' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Fill in the Blank Rendering -->
              <template v-else-if="currentQuestionData.questionType === 'fill-blank'">
                <div
                  v-if="!currentQuestionData.isCorrect"
                  class="mt-3 text-sm"
                >
                  <span class="font-semibold text-[#16a34a]">Correct answer: </span>
                  <span class="font-semibold text-gray-800">
                    {{ currentQuestionData.correctAnswerText || '' }}
                  </span>
                </div>
                <div
                  :class="[
                    'flex items-center p-2 rounded-xl transition-all border-1',
                    currentQuestionData.isCorrect
                      ? 'bg-[#86efac] border-[#4ade80]'
                      : 'bg-[#fca5a5] border-[#f87171]'
                  ]"
                >

                  <div class="mr-4 flex items-center justify-center w-8 h-8">
                    <div
                      :class="[
                        'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                        currentQuestionData.isCorrect
                          ? 'bg-[#4ade80] border-[#4ade80] text-white'
                          : 'bg-[#f87171] border-[#f87171] text-white'
                      ]"
                    >
                      <i
                        :class="[
                          'fas',
                          currentQuestionData.isCorrect ? 'fa-check' : 'fa-times',
                          'text-xs'
                        ]"
                      ></i>
                    </div>
                  </div>


                  <span class="text-base font-medium text-gray-800">
                    {{
                      currentQuestionData.userAnswer &&
                      String(currentQuestionData.userAnswer).trim() !== ''
                        ? currentQuestionData.userAnswer
                        : ''
                    }}
                    <span
                      v-if="!(currentQuestionData.userAnswer && String(currentQuestionData.userAnswer).trim() !== '')"
                      class="italic"
                    >(unanswered)</span>
                  </span>
                </div>
              </template>

              <!-- Text Rendering -->
              <template v-else-if="currentQuestionData.questionType === 'text'">
                <div
                  v-if="!isShortAnswerCorrect(currentQuestionData.userAnswer)"
                  class="mb-2 text-sm"
                >
                  <span class="font-semibold text-[#16a34a]">Correct answer:</span>
                  <span class="font-semibold text-gray-800">
                    answer must be at least 3 sentences
                  </span>
                </div>

                <div
                  :class="[
                    'flex items-center p-2 rounded-xl transition-all border-1',
                    isShortAnswerCorrect(currentQuestionData.userAnswer)
                      ? 'bg-[#86efac] border-[#4ade80]'
                      : 'bg-[#fca5a5] border-[#f87171]'
                  ]"
                >
                  <div class="mr-4 flex items-center justify-center w-8 h-8">
                    <div
                      :class="[
                        'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                        isShortAnswerCorrect(currentQuestionData.userAnswer)
                          ? 'bg-[#4ade80] border-[#4ade80] text-white'
                          : 'bg-[#f87171] border-[#f87171] text-white'
                      ]"
                    >
                      <i
                        :class="[
                          'fas',
                          isShortAnswerCorrect(currentQuestionData.userAnswer)
                            ? 'fa-check'
                            : 'fa-times',
                          'text-xs'
                        ]"
                      ></i>
                    </div>
                  </div>
                  <span class="text-base font-medium text-gray-800">
                    <template
                      v-if="
                        currentQuestionData.userAnswer &&
                        String(currentQuestionData.userAnswer).trim() !== ''
                      "
                    >
                      {{ currentQuestionData.userAnswer }}
                    </template>
                    <span
                      v-else
                      class="italic"
                    >(unanswered)</span>
                  </span>
                </div>
              </template>

              <!-- Matching Rendering -->
              <template v-else-if="currentQuestionData.questionType === 'matching'">
                <div>
                  <div class="grid grid-cols-2 gap-6 mb-3">
                    <h3 class="font-semibold text-gray-700">Column A</h3>
                    <h3 class="font-semibold text-gray-700">Match with</h3>
                  </div>

                  <div
                    v-for="(pair, index) in (currentQuestionData.matchingPairs || [])"
                    :key="index"
                    class="grid grid-cols-2 gap-6 mb-2 items-stretch"
                  >
                    <!-- Column A -->
                    <div class="h-full">
                      <div class="h-full flex items-center p-3 bg-[#F4F7F9] border border-[#7B90DF] rounded-lg">
                        {{ index + 1 }}. {{ pair.left }}
                      </div>
                    </div>

                    <!-- Column B -->
                    <div class="h-full">
                      <div
                        :class="[
                          'h-full flex items-center p-2 rounded-xl transition-all border-1',
                          pair.isCorrect
                            ? 'bg-[#86efac] border-[#4ade80]'
                            : 'bg-[#fca5a5] border-[#f87171]'
                        ]"
                      >
                        <div class="mr-4 flex items-center justify-center w-8 h-8">
                          <div
                            :class="[
                              'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                              pair.isCorrect
                                ? 'bg-[#4ade80] border-[#4ade80] text-white'
                                : 'bg-[#f87171] border-[#f87171] text-white'
                            ]"
                          >
                            <i
                              :class="[
                                'fas',
                                pair.isCorrect ? 'fa-check' : 'fa-times',
                                'text-xs'
                              ]"
                            ></i>
                          </div>
                        </div>

                        <div class="flex flex-col text-sm">
                          <span class="font-medium text-gray-800">
                            Your answer:
                            <span v-if="pair.userRight && pair.userRight.trim() !== ''">
                              {{ pair.userRight }}
                            </span>
                            <span v-else class="italic">(unanswered)</span>
                          </span>
                          <span v-if="!pair.isCorrect" class="text-xs text-[#16a34a] mt-1">
                            Correct: {{ pair.right }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Fallback for other types -->
              <template v-else>
                <div class="flex items-center p-2 rounded-xl transition-all border-1 bg-[#F4F7F9] border-[#7B90DF]">
                  <span class="text-base font-medium text-gray-800">
                    {{ currentQuestionData.options[0] || '(answer recorded)' }}
                  </span>
                </div>
              </template>
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
              class="px-8 py-2 bg-[#C9E4F6] border border-[#7B90DF] text-[#4D74FF] rounded-xl font-medium transition-all disabled:opacity-50"
              @click="nextQuestion"
              :disabled="currentQuestion === questions.length - 1"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="col-span-1">
          <div v-if="!isLoading" class="bg-[#F4F7F9] rounded-xl shadow-sm p-4">
            <div class="mb-4">
              <p class="text-sm font-medium text-gray-600 text-right">Question {{ currentQuestion + 1 }} of {{ questions.length }}</p>
            </div>
            <div class="grid grid-cols-5 gap-3">
              <button
                v-for="(question, index) in questions"
                :key="index"
                :class="[
                  'w-10 h-10 border-2 rounded-lg font-semibold text-sm cursor-pointer transition-all',
                  getQuestionButtonClass(index)
                ]"
                @click="goToQuestion(index)"
              >
                {{ index + 1 }}
              </button>
            </div>

            <!-- Finish Review Button -->
            <div class="mt-6 pt-4 border-t border-gray-300">
              <button
                @click="finishReview"
                class="w-full px-4 py-2 bg-white border border-[#7B90DF] text-[#4285f4] rounded-xl font-medium hover:bg-[#F4F7F9] transition-all flex items-center justify-center gap-2"
              >
                <span>Finish Review</span>
                <i class="fas fa-arrow-right text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
