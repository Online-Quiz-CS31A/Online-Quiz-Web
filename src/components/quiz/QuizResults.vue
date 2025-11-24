<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useStudentsStore } from '@/stores/studentsStore'
import type { QuizResultQuestion, Participant } from '@/interfaces/interfaces'

// CONSTANTS
const TOTAL_SEGMENTS = 5

// STORES
const quizzesStore = useQuizzesStore()
const sectionsStore = useSectionsStore()
const studentsStore = useStudentsStore()

// REFS
const activeTab = ref<'questions' | 'participants'>('questions')
const selectedQuestionId = ref<number>(1)
const selectedSection = ref('All Sections')
const search = ref('')

const currentQuizId = computed(() => quizzesStore.currentQuiz.id ?? null)

const quizMeta = computed(() => {
  const id = currentQuizId.value
  if (id == null) return null
  const fromDefaults = quizzesStore.myTeacherQuizzes.find(q => q.id === id)
  const fromStorage = quizzesStore.getAllQuizzes().find(q => q.id === id)
  return fromStorage || fromDefaults || null
})

const quizSectionName = computed(() => quizMeta.value?.class || '')

const quizSection = computed(() => {
  const name = quizSectionName.value
  if (!name) return null
  return sectionsStore.allSections.find(s => s.name === name) || null
})

const quizQuestions = computed(() => {
  const id = currentQuizId.value
  if (id == null) return []
  return quizzesStore.getStudentQuizQuestions(id)
})

const allAttempts = computed(() => {
  const id = currentQuizId.value
  if (id == null) return []
  return quizzesStore.getAllQuizAttemptHistory(id)
})

const totalSubmissions = computed(() => {
  const id = currentQuizId.value
  if (id == null) return 0
  return quizzesStore.getQuizUniqueSubmitterCount(id)
})

const totalStudents = computed(() => quizSection.value?.studentUsernames.length || 0)

const questions = computed<QuizResultQuestion[]>(() => {
  const baseQuestions = quizQuestions.value
  const attempts = allAttempts.value

  return baseQuestions.map((q, index) => {
    const isChoiceType = q.type === 'multiple-choice' || q.type === 'true-false'

    let correctResponses = 0
    let incorrectResponses = 0

    if (isChoiceType && Array.isArray(q.options) && q.options.length > 0) {
      const correctIndex = q.options.findIndex(opt => opt.isCorrect)
      const safeCorrectIndex = correctIndex >= 0 ? correctIndex : 0

      attempts.forEach(attempt => {
        const rawAnswer = attempt.answers[index]
        if (rawAnswer === undefined || rawAnswer === null) return
        if (rawAnswer === safeCorrectIndex) correctResponses++
        else incorrectResponses++
      })
    }

    const totalAnswers = correctResponses + incorrectResponses
    const totalParticipants = totalStudents.value || 0
    const percentDenominator = totalParticipants > 0 ? totalParticipants : totalAnswers

    const correctPercentageNum = percentDenominator > 0
      ? Math.round((correctResponses / percentDenominator) * 100)
      : 0

    const correctPercentage = `${correctPercentageNum}%`

    const choices = isChoiceType && Array.isArray(q.options)
      ? q.options.map((opt, optIndex) => {
          let choiceCount = 0
          attempts.forEach(attempt => {
            const rawAnswer = attempt.answers[index]
            if (rawAnswer === optIndex) {
              choiceCount++
            }
          })

          const percentage = percentDenominator > 0
            ? Math.round((choiceCount / percentDenominator) * 100)
            : 0

          return {
            text: opt.text,
            correct: !!opt.isCorrect,
            percentage,
          }
        })
      : []

    return {
      id: index + 1,
      title: `Question #${index + 1}`,
      text: q.text,
      points: q.points || 0,
      correctPercentage,
      correctPercentageNum,
      choices,
      correctResponses,
      incorrectResponses,
    }
  })
})

const participants = computed<Participant[]>(() => {
  const section = quizSection.value
  const id = currentQuizId.value
  if (!section || id == null) return []

  const usernames = section.studentUsernames || []
  const attempts = allAttempts.value

  const latestByStudent = new Map<string, { score: number; totalPoints: number; percentage: number; completedAt: string }>()

  usernames.forEach(username => {
    const history = attempts.filter(a => a.studentUsername === username)
    if (history.length === 0) return
    const latest = history.reduce((best, cur) =>
      cur.attemptNumber > best.attemptNumber ? cur : best
    )
    latestByStudent.set(username, {
      score: latest.score,
      totalPoints: latest.totalPoints,
      percentage: latest.percentage,
      completedAt: latest.completedAt,
    })
  })

  return usernames.map(username => {
    const profile = studentsStore.profiles[username]
    const latest = latestByStudent.get(username)

    const name = profile ? `${profile.firstName} ${profile.lastName}` : username
    const email = profile?.email || `${username}@example.com`
    const avatar = profile?.photoUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

    const score = latest ? latest.score : 0
    const totalPoints = latest ? latest.totalPoints : 0
    const percentage = latest ? latest.percentage : 0

    const time = latest
      ? new Date(latest.completedAt).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--'

    return {
      name,
      email,
      avatar,
      section: section.name,
      score,
      percentage,
      time,
    }
  })
})

// COMPUTED
const currentQuestion = computed(() => questions.value.find(q => q.id === selectedQuestionId.value))

const incorrectResponses = computed(() => {
  if (!currentQuestion.value) return 0
  return currentQuestion.value.incorrectResponses
})

const correctSegments = computed(() => {
  const total = totalStudents.value || 0
  const correct = currentQuestion.value ? currentQuestion.value.correctResponses : 0
  const ratio = total > 0 ? correct / total : 0
  return segmentize(ratio)
})

const incorrectSegments = computed(() => {
  const total = totalStudents.value || 0
  const incorrect = incorrectResponses.value
  const ratio = total > 0 ? incorrect / total : 0
  return segmentize(ratio)
})

const availableSections = computed(() => {
  const unique = new Set<string>()
  participants.value.forEach(p => {
    if (p.section) unique.add(p.section)
  })
  return ['All Sections', ...Array.from(unique)]
})

const filteredParticipants = computed(() => {
  return participants.value
    .filter(p => selectedSection.value === 'All Sections' || p.section === selectedSection.value)
    .filter(p =>
      [p.name, p.email, p.section]
        .join(' ')
        .toLowerCase()
        .includes(search.value.toLowerCase())
    )
})

// METHODS
function selectQuestion(id: number) {
  selectedQuestionId.value = id
}

function letter(index: number) {
  return String.fromCharCode(65 + index)
}

function segmentize(ratio: number): number[] {
  const clamped = Math.max(0, Math.min(1, ratio))
  const filled = clamped * TOTAL_SEGMENTS
  const arr: number[] = []
  for (let i = 0; i < TOTAL_SEGMENTS; i++) {
    const fill = Math.max(0, Math.min(1, filled - i))
    arr.push(fill)
  }
  return arr
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- Stats Dashboard -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <i class="fas fa-users"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Students</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalStudents }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Submissions</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalSubmissions }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <i class="fas fa-question-circle"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Questions</p>
              <p class="text-2xl font-semibold text-gray-900">{{ questions.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex">
            <button
              @click="activeTab = 'questions'"
              class="tab-button py-4 px-6 border-b-2 font-medium text-sm cursor-pointer"
              :class="activeTab === 'questions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Questions Analysis
            </button>
            <button
              @click="activeTab = 'participants'"
              class="tab-button py-4 px-6 border-b-2 font-medium text-sm cursor-pointer"
              :class="activeTab === 'participants' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Participants
            </button>
          </nav>
        </div>
      </div>

      <!-- Questions Tab Content -->
      <div v-show="activeTab === 'questions'" id="questions" class="tab-content">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Question List -->
          <div class="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Questions</h2>
            </div>
            <div class="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              <div
                v-for="q in questions"
                :key="q.id"
                class="p-4 hover:bg-gray-50 cursor-pointer"
                :class="q.id === selectedQuestionId ? 'bg-gray-50' : ''"
                @click="selectQuestion(q.id)"
              >
                <div class="flex justify-between items-center">
                  <p class="text-sm font-medium text-gray-900">Question #{{ q.id }}</p>
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="q.correctPercentageNum >= 80 ? 'bg-green-100 text-green-800' : q.correctPercentageNum >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ q.correctPercentage }} correct
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1 truncate">{{ q.text }}</p>
              </div>
            </div>
          </div>

          <!-- Question Detail -->
          <div class="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div class="p-6" v-if="currentQuestion">
              <div class="flex justify-between items-start">
                <div>
                  <h2 class="text-xl font-bold text-gray-900" id="question-title">Question #{{ currentQuestion.id }}</h2>
                  <p class="text-sm text-gray-500 mt-1">{{ currentQuestion.points }} points</p>
                </div>
                <div class="flex items-center">
                  <span class="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                    {{ currentQuestion.correctPercentage }} correct
                  </span>
                </div>
              </div>

              <div class="mt-6">
                <p class="text-gray-800 font-medium" id="question-text">{{ currentQuestion.text }}</p>

                <div class="mt-6 space-y-3" id="choices-container">
                  <div
                    v-for="(choice, index) in currentQuestion.choices"
                    :key="index"
                    class="p-4 rounded border"
                    :class="choice.correct ? 'choice-correct border-transparent' : 'choice-incorrect border-transparent'"
                  >
                    <div class="flex items-center">
                      <span class="font-medium" :class="choice.correct ? 'text-green-600' : 'text-red-700'">{{ letter(index) }}.</span>
                      <span class="ml-3">{{ choice.text }}</span>
                      <span class="ml-auto text-xs" :class="choice.correct ? 'text-green-600' : 'text-red-700'">
                        {{ Math.round(totalSubmissions * (choice.percentage / 100)) }} answered
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Response Analysis</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Correct</span>
                      <span>{{ currentQuestion.correctResponses }} students</span>
                    </div>
                    <div class="segmented-bar" aria-label="Correct segmented bar">
                      <div
                        v-for="(fill, i) in correctSegments"
                        :key="'c-' + i"
                        class="segment"
                      >
                        <div class="segment-inner bg-green-500" :style="{ width: (fill * 100) + '%' }"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Incorrect</span>
                      <span>{{ incorrectResponses }} students</span>
                    </div>
                    <div class="segmented-bar" aria-label="Incorrect segmented bar">
                      <div
                        v-for="(fill, i) in incorrectSegments"
                        :key="'i-' + i"
                        class="segment"
                      >
                        <div class="segment-inner bg-red-500" :style="{ width: (fill * 100) + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Participants Tab Content -->
      <div v-show="activeTab === 'participants'" id="participants" class="tab-content">
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-900">Participants</h2>
            <div class="flex items-center space-x-4">
              <div class="relative">
                <select
                  v-model="selectedSection"
                  class="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
                >
                  <option
                    v-for="section in availableSections"
                    :key="section"
                    :value="section"
                  >
                    {{ section }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i class="fas fa-chevron-down h-4 w-4"></i>
                </div>
              </div>
              <div class="relative">
                <input
                  v-model="search"
                  type="text"
                  placeholder="Search..."
                  class="border border-gray-300 rounded-md py-2 px-4 pl-10 focus:outline-none focus:border-blue-500"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-search h-4 w-4 text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(p, idx) in filteredParticipants" :key="p.email" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ idx + 1 }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-8 w-8 rounded-full object-cover" :src="p.avatar" :alt="p.name" />
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ p.name }}</div>
                        <div class="text-sm text-gray-500">{{ p.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ p.section }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ p.score }}/50</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div class="bg-green-500 h-2.5 rounded-full" :style="{ width: p.percentage + '%' }"></div>
                      </div>
                      <span class="text-sm font-medium text-gray-700">{{ p.percentage }}%</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ p.time }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div class="text-sm text-gray-700">
              Showing
              <span class="font-medium">1</span>
              to
              <span class="font-medium">{{ Math.min(5, filteredParticipants.length) }}</span>
              of
              <span class="font-medium">{{ filteredParticipants.length }}</span>
              results
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-end">
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Previous</span>
                  <i class="fas fa-chevron-left h-5 w-5"></i>
                </a>
                <a href="#" class="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">1</a>
                <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">2</a>
                <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">3</a>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
                <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">8</a>
                <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Next</span>
                  <i class="fas fa-chevron-right h-5 w-5"></i>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.progress-bar {
  height: 8px;
  border-radius: 4px;
  background-color: #e5e7eb;
}
.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}
.correct-fill {
  background-color: #10b981;
}
.incorrect-fill {
  background-color: #ef4444;
}
.choice-correct {
  background-color: #d1fae5;
  border-left: 4px solid #10b981;
}
.choice-incorrect {
  background-color: #fee2e2;
  border-left: 4px solid #ef4444;
}
.tab-content {
  display: block;
}

.segmented-bar {
  display: flex;
  gap: 6px; 
}
.segment {
  flex: 1 1 0%;
  background-color: #f3f4f6; 
  border-radius: 4px;
  height: 12px;
  overflow: hidden;
  position: relative;
}
.segment-inner {
  height: 100%;
  width: 0%;
  transition: width 0.3s ease;
}
</style>
