<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const activeTab = ref<'questions' | 'participants'>('questions')
const totalStudents = ref(142)
const totalSubmissions = ref(128)

interface Choice {
  text: string
  correct: boolean
  percentage: number
}
interface Question {
  id: number
  title: string
  text: string
  points: number
  correctPercentage: string
  correctPercentageNum: number
  choices: Choice[]
  correctResponses: number
  incorrectResponses: number
}

const questions = reactive<Question[]>([
  {
    id: 1,
    title: 'Question #1',
    text: 'John sells each slice at Php15.50. Assume that he sells at a constant rate of 3 slices per 10 minutes. If a pizza is sliced in eight parts, how many pizzas will be sold within 3 hours?',
    points: 3,
    correctPercentage: '45%',
    correctPercentageNum: 45,
    choices: [
      { text: '6.75', correct: true, percentage: 45 },
      { text: '8', correct: false, percentage: 20 },
      { text: '11.25', correct: false, percentage: 25 },
      { text: '720', correct: false, percentage: 10 },
    ],
    correctResponses: 58,
    incorrectResponses: 70,
  },
  {
    id: 2,
    title: 'Question #2',
    text: 'What is 25% of 80?',
    points: 2,
    correctPercentage: '75%',
    correctPercentageNum: 75,
    choices: [
      { text: '15', correct: false, percentage: 15 },
      { text: '20', correct: true, percentage: 75 },
      { text: '25', correct: false, percentage: 5 },
      { text: '30', correct: false, percentage: 5 },
    ],
    correctResponses: 96,
    incorrectResponses: 32,
  },
  {
    id: 3,
    title: 'Question #3',
    text: 'If a shirt costs $45 and is discounted by 20%, what is the final price?',
    points: 2,
    correctPercentage: '68%',
    correctPercentageNum: 68,
    choices: [
      { text: '$9', correct: false, percentage: 10 },
      { text: '$36', correct: true, percentage: 68 },
      { text: '$54', correct: false, percentage: 15 },
      { text: '$45', correct: false, percentage: 7 },
    ],
    correctResponses: 87,
    incorrectResponses: 41,
  },
  {
    id: 4,
    title: 'Question #4',
    text: 'What is the sum of 1/4 + 1/3?',
    points: 2,
    correctPercentage: '52%',
    correctPercentageNum: 52,
    choices: [
      { text: '2/7', correct: false, percentage: 20 },
      { text: '7/12', correct: true, percentage: 52 },
      { text: '1/2', correct: false, percentage: 18 },
      { text: '2/3', correct: false, percentage: 10 },
    ],
    correctResponses: 67,
    incorrectResponses: 61,
  },
  {
    id: 5,
    title: 'Question #5',
    text: 'If 3x + 7 = 22, what is the value of x?',
    points: 2,
    correctPercentage: '81%',
    correctPercentageNum: 81,
    choices: [
      { text: '3', correct: false, percentage: 10 },
      { text: '5', correct: true, percentage: 81 },
      { text: '7', correct: false, percentage: 6 },
      { text: '15', correct: false, percentage: 3 },
    ],
    correctResponses: 100,
    incorrectResponses: 28,
  },
])

const selectedQuestionId = ref<number>(questions[0]?.id ?? 1)
const currentQuestion = computed(() => questions.find((q) => q.id === selectedQuestionId.value))

function selectQuestion(id: number) {
  selectedQuestionId.value = id
}

function letter(index: number) {
  return String.fromCharCode(65 + index)
}

const correctWidth = computed(() => {
  if (!currentQuestion.value) return '0%'
  return `${(currentQuestion.value.correctResponses / totalSubmissions.value) * 100}%`
})

const incorrectResponses = computed(() => {
  if (!currentQuestion.value) return 0
  return currentQuestion.value.incorrectResponses
})

const incorrectWidth = computed(() => {
  if (!currentQuestion.value) return '0%'
  return `${(currentQuestion.value.incorrectResponses / totalSubmissions.value) * 100}%`
})

const TOTAL_SEGMENTS = 5
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

const correctSegments = computed(() => {
  const ratio = currentQuestion.value ? currentQuestion.value.correctResponses / totalSubmissions.value : 0
  return segmentize(ratio)
})

const incorrectSegments = computed(() => {
  const ratio = currentQuestion.value ? currentQuestion.value.incorrectResponses / totalSubmissions.value : 0
  return segmentize(ratio)
})

interface Participant {
  name: string
  email: string
  avatar: string
  section: string
  score: number
  percentage: number
  time: string
}

const sections = ['IT11A', 'IT11B', 'CS22A', 'CS22B', 'CS23A']
const names = [
  'Neil Vallecer', 'Jose Betonio', 'James Maguinda', 'Jan Rosalijos', 'John Cez Casupanan',
  'Nicole Inot', 'Uzziah Lanz', 'Weah Jacionto', 'Elian Inot', 'Chitoge Kirisaki'
]

const participants = reactive<Participant[]>(names.map((name, index) => ({
  name,
  email: `${name.split(' ')[0].toLowerCase()}.${name.split(' ')[1].toLowerCase()}@example.com`,
  avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  section: sections[Math.floor(Math.random() * sections.length)],
  score: Math.floor(Math.random() * 21), // Random score between 0-20
  percentage: Math.floor(Math.random() * 101), // Random percentage between 0-100
  time: Math.random() > 0.3 ? `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : '--:--'
})))

const selectedSection = ref('All Sections')
const search = ref('')

const filteredParticipants = computed(() => {
  return participants
    .filter((p) => selectedSection.value === 'All Sections' || p.section === selectedSection.value)
    .filter((p) =>
      [p.name, p.email, p.section]
        .join(' ')
        .toLowerCase()
        .includes(search.value.toLowerCase())
    )
})
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
              class="tab-button py-4 px-6 border-b-2 font-medium text-sm"
              :class="activeTab === 'questions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Questions Analysis
            </button>
            <button
              @click="activeTab = 'participants'"
              class="tab-button py-4 px-6 border-b-2 font-medium text-sm"
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
                  <option value="All Sections">All Sections</option>
                  <option value="IT11A">IT11A</option>
                  <option value="IT11B">IT11B</option>
                  <option value="CS22A">CS22A</option>
                  <option value="CS22B">CS22B</option>
                  <option value="CS23A">CS23A</option>
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
