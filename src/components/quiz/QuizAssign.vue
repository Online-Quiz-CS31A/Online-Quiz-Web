<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const saving = ref(false)
const currentTab = ref<'class' | 'individual'>('class')

const quizDetails = reactive({
  title: 'Mathematics Midterm Exam',
  createdAt: 'May 15, 2023',
  type: 'Graded Quiz',
  points: 100,
})

const classes = reactive([
  { id: '3rdyear-a', name: '3rd Year - CS22A', students: 32, selected: false },
  { id: '3rdyear-b', name: '3rd Year - CS22B', students: 28, selected: false },
  { id: '4thyear-a', name: '4th Year - IT11B', students: 24, selected: false },
  { id: '4thyear-b', name: '4th Year - IT12C', students: 18, selected: false },
])

const individuals = reactive([
  { 
    id: 's1', 
    name: 'Neil Vallecer', 
    section: '3rd Year - CS22A', 
    selected: false,
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },
  { 
    id: 's2', 
    name: 'Edrian Mangubat', 
    section: '3rd Year - CS22B', 
    selected: false,
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },
  { 
    id: 's3', 
    name: 'Uzziah Lanz', 
    section: '4th Year - IT11B', 
    selected: false,
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },
  { 
    id: 's4', 
    name: 'Jan Rosa', 
    section: '4th Year - IT12C', 
    selected: false,
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },
])

const searchClass = ref('')
const searchStudent = ref('')

const deadline = reactive({
  date: '',
  time: '',
})

const options = reactive({
  timeLimit: 60,
  attempts: 1,
  shuffle: false,
  showResults: true,
})

const selectedClasses = computed(() => classes.filter(c => c.selected))
const selectedIndividuals = computed(() => individuals.filter(i => i.selected))

const summaryRecipients = computed(() => {
  if (currentTab.value === 'class') {
    const classCount = selectedClasses.value.length
    const students = selectedClasses.value.reduce((sum, c) => sum + c.students, 0)
    return `${classCount} classes, ${students} students`
  }
  return `${selectedIndividuals.value.length} students`
})

function selectAllClasses() {
  const filtered = filteredClasses.value
  const allSelected = filtered.every(c => c.selected)
  filtered.forEach(c => (c.selected = !allSelected))
}

function selectAllIndividuals() {
  const filtered = filteredIndividuals.value
  const allSelected = filtered.every(s => s.selected)
  filtered.forEach(s => (s.selected = !allSelected))
}

const filteredClasses = computed(() => {
  const term = searchClass.value.toLowerCase().trim()
  if (!term) return classes
  return classes.filter(c => c.name.toLowerCase().includes(term))
})

const filteredIndividuals = computed(() => {
  const term = searchStudent.value.toLowerCase().trim()
  if (!term) return individuals
  return individuals.filter(s => s.name.toLowerCase().includes(term) || s.section.toLowerCase().includes(term))
})

function quickAddDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  deadline.date = d.toISOString().slice(0, 10)
  deadline.time = '23:59'
}

async function saveAssignment() {
  saving.value = true
  await new Promise(r => setTimeout(r, 800))
  saving.value = false
  alert('Assignment saved!')
}
</script>

<template>
  <div class="min-h-screen">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Assign Quiz</h2>
          <p class="text-gray-600">Select recipients and set deadlines for your quiz</p>
        </div>
        <button @click="saveAssignment" :disabled="saving"
                class="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-4 py-2 rounded-lg transition duration-200">
          <i class="fas fa-save w-4 h-4"></i>
          <span>{{ saving ? 'Saving...' : 'Save Assignment' }}</span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Panel -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Quiz Details -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-800">Quiz Details</h3>
            </div>
            <div class="p-6">
              <div class="flex items-center space-x-4 mb-6">
                <div class="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                  <i class="fas fa-file-alt text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h4 class="font-medium text-gray-800">{{ quizDetails.title }}</h4>
                  <p class="text-sm text-gray-500">Created: {{ quizDetails.createdAt }}</p>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Quiz Type</label>
                  <select v-model="quizDetails.type" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                    <option>Graded Quiz</option>
                    <option>Practice Quiz</option>
                    <option>Survey</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input v-model.number="quizDetails.points" type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>
            </div>
          </div>

          <!-- Recipient Selection -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-800">Select Recipients</h3>
            </div>
            <div class="p-6">
              <div class="flex space-x-4 mb-6">
                <button @click="currentTab = 'class'" :class="currentTab === 'class' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'" class="px-4 py-2 font-medium">By Class</button>
                <button @click="currentTab = 'individual'" :class="currentTab === 'individual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'" class="px-4 py-2 font-medium">By Individual</button>
              </div>

              <!-- Class Selection -->
              <div v-if="currentTab === 'class'" class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <i class="fas fa-search text-gray-400"></i>
                    <input v-model="searchClass" type="text" placeholder="Search classes..." class="border-0 focus:ring-0 text-sm">
                  </div>
                  <button @click="selectAllClasses" class="text-sm text-blue-600 hover:text-blue-800 font-medium">Toggle All</button>
                </div>
                <div class="h-64 overflow-y-auto custom-scrollbar">
                  <div class="space-y-3">
                    <label v-for="c in filteredClasses" :key="c.id" class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input v-model="c.selected" type="checkbox" class="h-4 w-4 text-blue-600">
                      <div class="flex-1">
                        <h4 class="font-medium text-gray-800">{{ c.name }}</h4>
                        <p class="text-xs text-gray-500">{{ c.students }} students</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Individual Selection -->
              <div v-else class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <i class="fas fa-search text-gray-400"></i>
                    <input v-model="searchStudent" type="text" placeholder="Search students..." class="border-0 focus:ring-0 text-sm">
                  </div>
                  <button @click="selectAllIndividuals" class="text-sm text-blue-600 hover:text-blue-800 font-medium">Toggle All</button>
                </div>
                <div class="h-64 overflow-y-auto custom-scrollbar">
                  <div class="space-y-3">
                    <label v-for="s in filteredIndividuals" :key="s.id" class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input v-model="s.selected" type="checkbox" class="h-4 w-4 text-blue-600">
                      <div class="flex-1 flex items-center space-x-3">
                        <img :src="s.avatar" :alt="s.name" class="w-8 h-8 rounded-full object-cover">
                        <div>
                          <h4 class="font-medium text-gray-800">{{ s.name }}</h4>
                          <p class="text-xs text-gray-500">{{ s.section }}</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="space-y-6">
          <!-- Deadline -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-800">Set Deadline</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center space-x-3">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input v-model="deadline.date" type="date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input v-model="deadline.time" type="time" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>
              <div class="pt-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Quick Options</label>
                <div class="grid grid-cols-3 gap-2">
                  <button @click="quickAddDays(1)" class="text-xs py-2 px-1 bg-gray-100 hover:bg-blue-100 text-gray-700 rounded transition duration-150">1 Day</button>
                  <button @click="quickAddDays(3)" class="text-xs py-2 px-1 bg-gray-100 hover:bg-blue-100 text-gray-700 rounded transition duration-150">3 Days</button>
                  <button @click="quickAddDays(7)" class="text-xs py-2 px-1 bg-gray-100 hover:bg-blue-100 text-gray-700 rounded transition duration-150">1 Week</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Options -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-800">Additional Options</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Time Limit</label>
                  <p class="text-xs text-gray-500">Set quiz duration in minutes</p>
                </div>
                <input v-model.number="options.timeLimit" type="number" placeholder="60" class="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <label class="block text sm font-medium text-gray-700 mb-1">Attempts Allowed</label>
                  <p class="text-xs text-gray-500">Number of attempts per student</p>
                </div>
                <input v-model.number="options.attempts" type="number" min="1" class="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              </div>

              <div class="pt-2">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input v-model="options.shuffle" type="checkbox" class="h-4 w-4 text-blue-600">
                  <span class="text-sm font-medium text-gray-700">Shuffle Questions</span>
                </label>
              </div>

              <div class="pt-2">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input v-model="options.showResults" type="checkbox" class="h-4 w-4 text-blue-600">
                  <span class="text-sm font-medium text-gray-700">Show Results</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-800">Assignment Summary</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Quiz Title:</span>
                <span class="text-sm font-medium text-gray-800">{{ quizDetails.title }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Recipients:</span>
                <span class="text-sm font-medium text-gray-800">{{ summaryRecipients }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Due Date:</span>
                <span class="text-sm font-medium text-gray-800">{{ deadline.date && deadline.time ? `${deadline.date} at ${deadline.time}` : '—' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Time Limit:</span>
                <span class="text-sm font-medium text-gray-800">{{ options.timeLimit }} minutes</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Attempts:</span>
                <span class="text-sm font-medium text-gray-800">{{ options.attempts }} attempt(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #7dd3fc;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #0ea5e9;
}
</style>
