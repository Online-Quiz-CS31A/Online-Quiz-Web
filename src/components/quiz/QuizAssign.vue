<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useStudentsStore } from '@/stores/studentsStore'

// STORES
const quizzesStore = useQuizzesStore()
const coursesStore = useCoursesStore()
const sectionsStore = useSectionsStore()
const studentsStore = useStudentsStore()

// REFS
const saving = ref(false)
const currentTab = ref<'class' | 'individual'>('class')
const searchClass = ref('')
const searchStudent = ref('')
const courseIdRef = ref<number | null>(null)


// REACTIVE
const quizDetails = reactive({
  title: '',
  createdAt: '',
  type: '',
  points: 0,
})

const classes = reactive<{ id: string; name: string; students: number; selected: boolean }[]>([])

const individuals = reactive<{
  id: string
  name: string
  section: string
  selected: boolean
  avatar: string
}[]>([])

const deadline = reactive({
  date: '',
  time: '',
})

const timePresets = [30, 60, 90, 120, 180]

const options = reactive({
  timeLimit: 60,
  attempts: 1,
  shuffle: false,
  showResults: true,
})

// LIFECYCLE
onMounted(async () => {
  // Capture initial assigned sections before any reactive changes (like pushing to classes) trigger the watcher
  const initialStoreAssigned = [...(quizzesStore.currentQuiz.assignedSections || [])]

  sectionsStore.loadArchivedSectionsFromStorage()

  await coursesStore.fetchTeacherCourses()
  await studentsStore.fetchAllStudentsFromApi()

  const current = quizzesStore.currentQuiz

  quizDetails.title = current.title || 'Untitled Quiz'

  const allStored = quizzesStore.getAllQuizzes()
  const fromDefaults = quizzesStore.myTeacherQuizzes.find(q => q.id === current.id)
  const fromStorage = allStored.find(q => q.id === current.id)
  const meta = fromStorage || fromDefaults

  if (meta && meta.createdAt) {
    quizDetails.createdAt = new Date(meta.createdAt).toLocaleDateString()
  } else {
    quizDetails.createdAt = new Date().toLocaleDateString()
  }

  if (Array.isArray(current.questions)) {
    quizDetails.points = current.questions.reduce((total, q: any) => {
      const basePoints = q.points || 0

      if (q.type === 'matching' && Array.isArray(q.pairs) && q.pairs.length > 0) {
        return total + basePoints * q.pairs.length
      }

      if (q.type === 'enumeration' && Array.isArray(q.items) && q.items.length > 0) {
        return total + basePoints * q.items.length
      }

      return total + basePoints
    }, 0)
  } else {
    quizDetails.points = 0
  }

  if (meta && typeof meta.dueDate === 'string' && meta.dueDate.trim()) {
    const raw = meta.dueDate.trim()
    let parsed: Date | null = null

    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?:\s*(am|pm))?)?/i)
    if (isoMatch) {
      const year = Number(isoMatch[1])
      const month = Number(isoMatch[2]) - 1
      const day = Number(isoMatch[3])
      let hours = isoMatch[4] != null ? Number(isoMatch[4]) : 23
      const minutes = isoMatch[5] != null ? Number(isoMatch[5]) : 59
      const ampm = isoMatch[6]
      if (ampm) {
        const lower = ampm.toLowerCase()
        if (lower === 'pm' && hours < 12) hours += 12
        if (lower === 'am' && hours === 12) hours = 0
      }
      parsed = new Date(year, month, day, hours, minutes)
    } else {
      const tryParsed = new Date(raw)
      if (!Number.isNaN(tryParsed.getTime())) {
        parsed = tryParsed
      }
    }

    if (parsed) {
      const yyyy = String(parsed.getFullYear()).padStart(4, '0')
      const mm = String(parsed.getMonth() + 1).padStart(2, '0')
      const dd = String(parsed.getDate()).padStart(2, '0')
      deadline.date = `${yyyy}-${mm}-${dd}`

      const hasExplicitTime = /(\d{1,2}:\d{2})|\b(am|pm)\b/i.test(raw)
      if (hasExplicitTime) {
        const h = String(parsed.getHours()).padStart(2, '0')
        const m = String(parsed.getMinutes()).padStart(2, '0')
        deadline.time = `${h}:${m}`
      } else {
        deadline.time = '23:59'
      }
    }
  }

  let timeLimitMinutes = 60
  if (current.timeLimit && typeof current.timeLimit === 'string') {
    const match = current.timeLimit.match(/(\d+)/)
    if (match) {
      const parsed = Number(match[1])
      if (!Number.isNaN(parsed) && parsed > 0) {
        timeLimitMinutes = parsed
      }
    }
  }
  // Map to nearest preset
  const nearest = timePresets.reduce((prev, curr) =>
    Math.abs(curr - timeLimitMinutes) < Math.abs(prev - timeLimitMinutes) ? curr : prev
  , timePresets[0])
  options.timeLimit = nearest

  // Retake policy: all quizzes can only be taken once
  options.attempts = 1

  const subject = (current.subject || '').trim().toLowerCase()
  
  let targetCourseIds: number[] = []

  if (subject) {
    targetCourseIds = coursesStore.rawTeacherCourses
      .filter(c => (c.name || '').trim().toLowerCase() === subject || (c.code || '').trim().toLowerCase() === subject)
      .map(c => c.courseId)
  }

  courseIdRef.value = targetCourseIds.length > 0 ? targetCourseIds[0] : null

  const enrichedSections = []
  const seenIds = new Set<number>()

  if (targetCourseIds.length > 0) {
    for (const cid of targetCourseIds) {
      const cidSections = sectionsStore.getSectionsByCourse(cid)
      for (const s of cidSections) {
        if (!seenIds.has(s.id)) {
          enrichedSections.push(s)
          seenIds.add(s.id)
        }
      }
    }

    const assignedSectionNames = coursesStore.rawTeacherCourses
      .filter(c => targetCourseIds.includes(c.courseId) && c.section)
      .map(c => c.section.trim())

    const apiSections = sectionsStore.allSections.filter(s => assignedSectionNames.includes(s.name))
    for (const s of apiSections) {
      if (!seenIds.has(s.id)) {
        enrichedSections.push(s)
        seenIds.add(s.id)
      }
    }
  }

  const archivedMappings = sectionsStore.archivedSectionMappings

  const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

  enrichedSections.forEach(section => {
    const isArchivedForCourse = targetCourseIds.length > 0
      ? archivedMappings.some(m => m.sectionId === section.id && targetCourseIds.some(cid => m.courseIds.includes(cid)))
      : false

    if (isArchivedForCourse) return

    classes.push({
      id: String(section.id),
      name: section.name,
      students: Array.isArray(section.studentUsernames) ? section.studentUsernames.length : section.students,
      selected: false,
    })

    if (Array.isArray(section.studentUsernames)) {
      section.studentUsernames.forEach(username => {
        const profile = studentsStore.profiles[username]
        const fullName = profile ? `${profile.firstName} ${profile.lastName}` : username

        individuals.push({
          id: username,
          name: fullName,
          section: section.name,
          selected: false,
          avatar: profile?.photoUrl || defaultAvatar,
        })
      })
    }
  })

  const metaAssigned = (meta && Array.isArray((meta as any).assignedSections)) 
      ? (meta as any).assignedSections 
      : []

  const fallbackClass = (meta && (meta as any).class) || ''

  const combinedAssigned = new Set([...initialStoreAssigned, ...metaAssigned, fallbackClass].filter(Boolean))

  const effectiveAssignedSections = Array.from(combinedAssigned)

  if (effectiveAssignedSections.length > 0) {
    classes.forEach(c => {
      if (effectiveAssignedSections.includes(c.name)) {
        c.selected = true
      }
    })

    individuals.forEach(student => {
      if (effectiveAssignedSections.includes(student.section)) {
        student.selected = true
      }
    })
  }

  quizzesStore.currentQuiz.assignedSections = classes.filter(c => c.selected).map(c => c.name)
})

watch(classes, (newClasses) => {
  quizzesStore.currentQuiz.assignedSections = newClasses.filter(c => c.selected).map(c => c.name)
}, { deep: true })

// COMPUTED
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

const filteredClasses = computed(() => {
  const term = searchClass.value.toLowerCase().trim()
  const base = term
    ? classes.filter(c => c.name.toLowerCase().includes(term))
    : [...classes]

  return base.sort((a, b) => {
    if (a.selected === b.selected) return 0
    return a.selected ? -1 : 1
  })
})

const filteredIndividuals = computed(() => {
  const term = searchStudent.value.toLowerCase().trim()
  if (!term) return individuals
  return individuals.filter(s => s.name.toLowerCase().includes(term) || s.section.toLowerCase().includes(term))
})

// METHODS
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

function quickAddDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  deadline.date = d.toISOString().slice(0, 10)
  deadline.time = '23:59'
}

const { success, info } = useToast()

async function saveAssignment() {
  if (!quizDetails.type) {
    info('Please choose a checking type before saving the assignment.')
    return
  }

  if (!quizzesStore.currentQuiz.id) {
    success('Assignment saved!')
    return
  }

  saving.value = true

  const quizId = quizzesStore.currentQuiz.id as number

  const selectedClassNames = selectedClasses.value.map(c => c.name)
  const primarySectionName = selectedClassNames[0] || ''

  let dueDateStr = ''
  if (deadline.date) {
    if (deadline.time) {
      dueDateStr = `${deadline.date} ${deadline.time}`
    } else {
      dueDateStr = `${deadline.date} 23:59`
    }
  }

  quizzesStore.saveQuizAssignment(quizId, {
    dueDate: dueDateStr || undefined,
    sectionNames: selectedClassNames,
    sectionName: primarySectionName || undefined,
    timeLimitMinutes: options.timeLimit,
    maxAttempts: options.attempts,
  })

  if (selectedClassNames.length > 0) {
    let course: any = null

    const cid = courseIdRef.value
    if (cid) {
      course = coursesStore.allCourses.find(c => c.id === cid)
    }

    if (!course) {
      const current = quizzesStore.currentQuiz
      const subject = current.subject || ''
      if (subject) {
        course = coursesStore.allCourses.find(c => c.name === subject)
      }
    }

    if (course) {
      selectedClassNames.forEach(name => {
        const section = sectionsStore.allSections.find(s => s.name === name)
        if (section) {
          sectionsStore.addSectionToCourse(section.id, course.id)
        }
      })
    }
  }

  await new Promise(r => setTimeout(r, 400))
  saving.value = false
  success('Assignment saved!')
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
          <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
          <i v-else class="fas fa-save w-4 h-4"></i>
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
                  <label class="block text-sm font-medium text-gray-700 mb-1">Checking Type</label>
                  <select
                    v-model="quizDetails.type"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose checking type</option>
                    <option value="automatic">Automatically check every question</option>
                    <option value="manual">I will manually check the text question parts</option>
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

              <!-- Missing Course Warning -->
              <div v-if="!courseIdRef" class="py-12 flex flex-col items-center justify-center text-center">
                <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <i class="fas fa-book text-2xl text-red-400"></i>
                </div>
                <h4 class="text-lg font-medium text-gray-800 mb-2">No Course Selected</h4>
                <p class="text-sm text-gray-500 max-w-sm">
                  Please go back to the <strong>Quiz Content</strong> tab and select a course to load its sections.
                </p>
              </div>

              <!-- Class Selection -->
              <div v-else-if="currentTab === 'class'" class="space-y-4">
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
              <div v-else-if="currentTab === 'individual'" class="space-y-4">
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
                  <p class="text-xs text-gray-500">Select quiz duration</p>
                </div>
                <select v-model.number="options.timeLimit" class="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option v-for="preset in timePresets" :key="preset" :value="preset">{{ preset }} min</option>
                </select>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Attempts Allowed</label>
                  <p class="text-xs text-gray-500">All quizzes can only be taken once</p>
                </div>
                <input v-model.number="options.attempts" type="number" min="1" readonly class="w-20 px-3 py-1 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed">
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