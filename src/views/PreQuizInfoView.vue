<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Book, Info, FileText, Clock, List, Award, AlertCircle, CheckCircle, XCircle, HelpCircle, Play, BarChart2, Tag } from 'lucide-vue-next'
import Header from '@/components/Header.vue'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { QuizAttempt } from '@/interfaces/interfaces'


const route = useRoute()
const router = useRouter()
const quizzesStore = useQuizzesStore()

onMounted(() => {
  quizzesStore.loadAttemptFromStorage()
  quizzesStore.loadAttemptHistoryFromStorage()
})

interface RouteParams {
  quizId: string
}

// COMPUTED
const quizId = computed(() => Number((route.params as unknown as RouteParams).quizId))

const breadcrumb = computed(() => `Dashboard > Quizzes > ${quiz.value?.title || 'Quiz'}`)

const studentQuizData = computed(() => {
  return quizzesStore.myStudentQuizzes.find(q => q.id === quizId.value)
})

const attemptHistory = computed(() => {
  return quizzesStore.getQuizAttemptHistory(quizId.value)
})

const quiz = computed(() => {
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
      attemptsAvailable: 1,
      maxAttempts: 1,
      currentScore: 0,
      improvement: 0,
      history: [] as QuizAttempt[]
    }
  }
  
  const quizQuestions = quizzesStore.getStudentQuizQuestions(quizId.value)
  const questionCount = quizQuestions.length
  const maxAttempts = studentQuiz.maxAttempts || 1
  const history = attemptHistory.value
  
  const latestAttempt = history.length > 0 ? history[history.length - 1] : null
  const correctAnswers = latestAttempt ? latestAttempt.score : 0
  
  const improvement = history.length >= 2 
    ? history[history.length - 1].percentage - history[0].percentage 
    : 0
  
  return {
    id: studentQuiz.id,
    title: studentQuiz.title,
    subject: studentQuiz.subject,
    duration: studentQuiz.timeLimit,
    questions: questionCount,
    correctAnswers,
    passingScore: Math.ceil(questionCount * 0.5), 
    passingPercentage: 50,
    attemptsAvailable: maxAttempts - history.length,
    maxAttempts,
    currentScore: latestAttempt ? latestAttempt.percentage : 0,
    improvement,
    history: history.map(h => ({
      attempt: `Attempt ${h.attemptNumber}`,
      date: new Date(h.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      score: `${h.score}/${h.totalPoints}`,
      mark: h.percentage.toString()
    }))
  }
})

const canStartQuiz = computed(() => {
  return quiz.value.attemptsAvailable > 0 && !hasOngoingAttempt.value
})

const hasOngoingAttempt = computed(() => {
  const attempt = (quizzesStore as any).currentAttempt
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
const startQuiz = () => {
  const questions = quizzesStore.getStudentQuizQuestions(quizId.value)
  const durationSec = parseTimeLimitToSeconds(quiz.value.duration)
  quizzesStore.startAttempt(quizId.value, quiz.value.title, questions.length, durationSec)
  router.push({ 
    name: 'quiz',
    state: {
      quizId: quizId.value,
      quizTitle: quiz.value.title,
      quizSubject: quiz.value.subject,
      questions
    }
  } as any)
}

const continueQuiz = () => {
  const questions = quizzesStore.getStudentQuizQuestions(quizId.value)
  router.push({ 
    name: 'quiz',
    state: {
      quizId: quizId.value,
      quizTitle: quiz.value.title,
      quizSubject: quiz.value.subject,
      questions
    }
  } as any)
}

const markAsDone = () => {
  console.log('Quiz marked as done')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header :breadcrumb="breadcrumb" />

    <!-- Main -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-5xl mx-auto">
        <div class="bg-white rounded-3xl shadow-sm overflow-hidden border-2 border-[#4285f4]">
          <div class="bg-[white] p-6 text-[#4285f4] border-b-2 border-[#4285f4]">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold flex items-center">
                  <Info class="w-6 h-6 mr-2" /> Quiz Information
                </h2>
                <p class="mt-2 opacity-90">Before you begin, here's important information about this quiz</p>
              </div>
              <button @click="markAsDone" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-xl transition duration-200 flex items-center shadow-sm">
                <CheckCircle class="w-4 h-4 mr-2" /> Mark as Done
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
                    <span>Subject: <span class="font-medium">{{ quiz.subject }}</span></span>
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
                    <span class="font-bold text-[#1976d2] text-lg">{{ quiz.passingScore }}/{{ quiz.questions }}</span>
                  </div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-gray-700 font-medium">Your Score</span>
                    <span class="font-bold text-[#4285f4] text-2xl">{{ quiz.correctAnswers }}/{{ quiz.questions }}</span>
                  </div>
                  <div class="flex items-center gap-3 mt-1">
                    <div class="w-full bg-gray-200 rounded-full h-3">
                      <div class="bg-[#4285f4] h-3 rounded-full transition-all" :style="{ width: (quiz.correctAnswers / quiz.questions * 100) + '%' }"></div>
                    </div>
                    <span class="min-w-[3rem] text-sm font-semibold text-[#4285f4] text-right">{{ Math.round((quiz.correctAnswers / quiz.questions) * 100) }}%</span>
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
                  <span>You have {{ quiz.attemptsAvailable }} of {{ quiz.maxAttempts }} attempt(s) remaining for this quiz.</span>
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
                  Maximum attempts reached
                </div>
                <button 
                  v-if="!hasOngoingAttempt" 
                  @click="startQuiz" 
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
        <div class="mt-8 bg-white rounded-3xl p-6 shadow-sm border-2 border-[#4285f4]">
          <h3 class="text-xl font-bold text-[#4285f4] flex items-center">
            <BarChart2 class="w-5 h-5 mr-2" /> Attempts History
          </h3>
          <div class="mt-4">
            <div class="grid grid-cols-4 gap-4 text-center mb-4 text-gray-700 font-semibold">
              <div>Attempts</div>
              <div>Date</div>
              <div>Score</div>
              <div>Mark</div>
            </div>
            <div class="space-y-3">
              <div v-if="quiz.history.length === 0" class="text-center py-8 text-gray-500">
                <p>No attempts yet. Start the quiz to see your history.</p>
              </div>
              <div v-for="item in quiz.history" :key="item.attempt + item.date" class="grid grid-cols-4 gap-4 text-center items-center bg-[#F4F7F9] p-3 rounded-xl border border-[#7B90DF]">
                <div class="text-gray-800">{{ item.attempt }}</div>
                <div class="text-gray-600">{{ item.date }}</div>
                <div class="font-bold text-[#4285f4]">{{ item.score }}</div>
                <div class="font-bold text-[#1976d2]">{{ item.mark }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>