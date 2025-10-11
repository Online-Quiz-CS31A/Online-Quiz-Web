<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useStudentsStore } from '@/stores/studentsStore'
import { useAuthStore } from '@/stores/authStore'
import type { Student } from '@/interfaces/interfaces'
const ActiveQuizzes = defineAsyncComponent(() => import('@/components/teacher/TeacherQuiz.vue'))
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))

// TYPE
type TabKey = 'dashboard' | 'people' | 'grades'
interface GradeRow { 
  id: number; 
  name: string; 
  email: string; 
  assignments: number; 
  quizzes: number; 
  exams: number; 
  final: number 
}

type GradeCol = keyof Omit<GradeRow, 'id' | 'email'>

interface QuizBreakdown { 
  title: string; 
  score: number; 
  total: number; 
  percent: number; 
  due: string; 
  status: 'Submitted' | 'Missing' 
}

interface ActiveQuiz {
  id: number
  subject: string
  title: string
  description: string
  dueDate: string
  class: string
  submitted: number
  total: number
  color: string
}

// CONSTANT
const router = useRouter()
const pageSize = 3
const AVATAR_URL = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

// REFS
const activeTab = ref<TabKey>('dashboard')
const searchTerm = ref('')
const currentPage = ref(1)
const sortCol = ref<GradeCol>('final')
const sortAsc = ref(false)
const showGradesModal = ref(false)
const selectedStudent = ref<GradeRow | null>(null)
const breakdown = ref<QuizBreakdown[]>([])

// COMPUTED
const sectionId = computed(() => Number(route.params.id || 0))


const currentSection = computed(() => {
  return sectionsStore.allSections.find(s => s.id === sectionId.value)
})

const currentCourseId = computed(() => {
  const mapping = sectionsStore.courseSectionMappings.find(m => m.sectionId === sectionId.value)
  return mapping?.courseId
})

const currentCourse = computed(() => {
  if (!currentCourseId.value) return null
  return classesStore.allCourses.find(c => c.id === currentCourseId.value)
})

const schedule = computed(() => {
  if (!currentCourseId.value || !sectionId.value) return null
  return sectionsStore.getSchedule(currentCourseId.value, sectionId.value)
})

const professorInitials = computed(() => {
  const parts = classMeta.professor.trim().split(/\s+/)
  const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '')
  return initials.join('')
})

const breadcrumbText = computed(() => {
  const courseName = currentCourse.value?.name || 'Course'
  const sectionName = currentSection.value?.name || 'Section'
  return `Dashboard > Courses > ${courseName} > ${sectionName}`
})


const students = computed<Student[]>(() => {
  if (!currentSection.value) return []
  
  const studentUsernames = currentSection.value.studentUsernames || []
  
  return studentUsernames.map((username, i) => {
    const profile = studentsStore.profiles[username]
    if (!profile) {
      return {
        id: i + 1,
        name: username,
        email: `${username}@unknown.com`,
        grade: 'N/A',
        progress: 0,
        initials: username.substring(0, 2).toUpperCase(),
        avatar: AVATAR_URL,
      }
    }
    
    const fullName = `${profile.firstName} ${profile.lastName}`.trim()
    return {
      id: i + 1,
      name: fullName,
      email: profile.email,
      grade: ['A', 'A-', 'B+'][i % 3],
      progress: 75 + ((i * 7) % 25),
      initials: initialsOf(fullName),
      avatar: profile.photoUrl || AVATAR_URL,
    }
  })
})

const filteredStudents = computed(() => {
  const q = searchTerm.value.trim().toLowerCase()
  if (!q) return students.value
  return students.value.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredStudents.value.length / pageSize)))
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredStudents.value.slice(start, start + pageSize)
})

const gradeRows = computed<GradeRow[]>(() => {
  return students.value.slice(0, 10).map((s, idx) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    assignments: 80 + ((idx * 5) % 20),
    quizzes: 75 + ((idx * 9) % 20),
    exams: 70 + ((idx * 11) % 25),
    final: 78 + ((idx * 8) % 20),
  }))
})

const sortedGrades = computed(() => {
  const rows = [...gradeRows.value]
  rows.sort((a, b) => {
    const va = a[sortCol.value] as number | string
    const vb = b[sortCol.value] as number | string
    if (typeof va === 'string' && typeof vb === 'string') return sortAsc.value ? va.localeCompare(vb) : vb.localeCompare(va)
    return sortAsc.value ? Number(va) - Number(vb) : Number(vb) - Number(va)
  })
  return rows
})

const totalStudents = computed(() => students.value.length)

const scheduleInfo = computed(() => {
  if (!schedule.value) return 'Schedule not set'
  const day = schedule.value.scheduleDay
  const time = schedule.value.scheduleTime
  const room = schedule.value.classroom
  
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  const formattedTime = `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  
  return `${day}, ${formattedTime} - ${room}`
})

const activeQuizzes = computed<ActiveQuiz[]>(() => {
  const courseName = currentCourse.value?.name || 'Course'
  const sectionName = currentSection.value?.name || 'Section'
  const total = totalStudents.value
  
  return [
    {
      id: 1,
      subject: courseName,
      title: 'Quiz 2',
      description: 'Basic algebraic equations and expressions quiz covering chapters 1-3.',
      dueDate: 'May 15',
      class: sectionName,
      submitted: Math.floor(total * 0.75),
      total: total,
      color: 'blue',
    },
    {
      id: 2,
      subject: courseName,
      title: 'Quiz 3',
      description: 'Comprehensive geometry midterm covering all concepts from the first half.',
      dueDate: 'May 22',
      class: sectionName,
      submitted: Math.floor(total * 0.5),
      total: total,
      color: 'indigo',
    },
    {
      id: 3,
      subject: courseName,
      title: 'Quiz 4',
      description: 'Basic trigonometric functions and identities quiz.',
      dueDate: 'May 30',
      class: sectionName,
      submitted: Math.floor(total * 0.125),
      total: total,
      color: 'purple',
    },
  ]
})

// REACTIVE
const route = useRoute()
const sectionsStore = useSectionsStore()
const classesStore = useCoursesStore()
const studentsStore = useStudentsStore()
const authStore = useAuthStore()

const classMeta = reactive({
  title: currentSection.value?.name || 'Section',
  professor: currentCourse.value?.teacher || authStore.currentUser?.name || 'Unknown',
  term: 'Academic Year 2024-2025',
  code: currentCourse.value?.code || '',
})

// WATCHERS
watch([currentSection, currentCourse], () => {
  classMeta.title = currentSection.value?.name || 'Section'
  classMeta.professor = currentCourse.value?.teacher || authStore.currentUser?.name || 'Unknown'
  classMeta.code = currentCourse.value?.code || ''
}, { immediate: true })


// METHODS
function navigateToQuizCreator() {
  router.push(`/teacher/create-quiz`)
}

function handleBreadcrumbSegment(segment: string) {
  const courseName = currentCourse.value?.name
  if (segment === courseName && currentCourseId.value) {
    router.push({ name: 'teacher-class', params: { id: String(currentCourseId.value) } })
  }
}

function initialsOf(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarByEmail(email: string): string {
  const s = students.value.find(st => st.email === email)
  return s?.avatar || AVATAR_URL
}

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}

function prevPage() { goToPage(currentPage.value - 1) }
function nextPage() { goToPage(currentPage.value + 1) }


function sortBy(col: GradeCol) {
  if (sortCol.value === col) sortAsc.value = !sortAsc.value
  else { sortCol.value = col; sortAsc.value = true }
}
function exportGrades() {
  alert('Grades exported')
}

function openGrades(row: GradeRow) {
  selectedStudent.value = row
  const base = row.id % 5
  const quizzes = Array.from({ length: 5 }).map((_, i) => {
    const total = 20
    const score = Math.max(0, Math.min(total, 12 + ((base + i) * 2) % 9))
    const percent = Math.round((score / total) * 100)
    return {
      title: `Quiz ${i + 1}`,
      score,
      total,
      percent,
      due: `May ${10 + i}`,
      status: percent > 0 ? 'Submitted' as const : 'Missing' as const,
    }
  })
  breakdown.value = quizzes
  showGradesModal.value = true
}
function closeGrades() {
  showGradesModal.value = false
}
</script>

<template>
  <div class="bg-white min-h-screen">
    <Header :breadcrumb="breadcrumbText" @segment-click="handleBreadcrumbSegment" />
    <div class="classroom-banner w-full flex items-end text-white">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-2">{{ classMeta.title }}</h1>
            <div class="mt-3 text-blue-100 text-sm flex items-center gap-2 mb-4">
              <i class="fas fa-clock"></i>
              <span>{{ scheduleInfo }}</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold ring-2 ring-white/20">
                  {{ professorInitials }}
                </div>
              </div>
              <div class="leading-tight">
                <div class="text-white font-medium">{{ classMeta.professor }}</div>
                <div class="text-blue-100 text-sm">{{ students.length }} students</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <!-- Tabs -->
      <div class="flex border-b border-blue-200 mb-8 space-x-2">
        <button
          class="px-4 py-2 font-medium transition-colors cursor-pointer"
          :class="activeTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blue-400 hover:text-blue-600'"
          @click="activeTab = 'dashboard'"
        >Dashboard</button>
        <button
          class="px-4 py-2 font-medium transition-colors cursor-pointer"
          :class="activeTab === 'people' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blue-400 hover:text-blue-600'"
          @click="activeTab = 'people'"
        >People</button>
        <button
          class="px-4 py-2 font-medium transition-colors cursor-pointer"
          :class="activeTab === 'grades' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blue-400 hover:text-blue-600'"
          @click="activeTab = 'grades'"
        >Grades</button>
      </div>

      <!-- Dashboard tab -->
      <div v-show="activeTab === 'dashboard'" class="rounded-lg overflow-hidden">
        <div class="px-6 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-blue-800">Quizzes</h2>
          <button @click="navigateToQuizCreator" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center cursor-pointer">
            <i class="fas fa-plus mr-2"></i> Create Quiz
          </button>
        </div>
        <div class="p-6">
          <ActiveQuizzes :quizzes="activeQuizzes" :hideHeader="true" />
        </div>
      </div>

      <!-- People tab -->
      <div v-show="activeTab === 'people'" class="space-y-6">
        <div class="bg-white rounded-lg shadow border border-gray-200">
          <div class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-200">
            <div>
              <h2 class="text-lg font-semibold text-gray-800">Class Roster</h2>
              <p class="text-sm text-gray-500">Manage enrolled students and invite new members</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="relative">
                <input v-model="searchTerm" type="text" placeholder="Search students..." class="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64" />
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <button class="px-3 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-100 cursor-pointer">Invite</button>
            </div>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-for="s in paginatedStudents" :key="s.id" class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <img :src="s.avatar" :alt="s.name" class="h-10 w-10 rounded-full object-cover ring-2 ring-blue-100" />
                <div>
                  <div class="font-medium text-gray-900">{{ s.name }}</div>
                  <div class="text-sm text-gray-500">{{ s.email }}</div>
                </div>
              </div>
              <div class="hidden md:flex items-center gap-8">
                <div class="flex items-center gap-2 w-28 justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span class="font-medium text-gray-800 whitespace-nowrap">{{ s.progress }}%</span>
                </div>
                <div class="w-40 shrink-0 grade-progress"><div class="grade-progress-fill" :style="{ width: s.progress + '%' }"></div></div>
                <span class="inline-flex items-center text-xs px-2 py-1 rounded-full"
                      :class="s.grade.startsWith('A') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">Grade {{ s.grade }}</span>
                <button class="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer">Message</button>
              </div>
            </div>
          </div>
          <div class="px-6 py-3 flex items-center justify-between bg-gray-50 border-t border-gray-200">
            <div class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</div>
            <div class="flex items-center gap-1">
              <button @click="prevPage" class="px-2 py-1 border rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer" :disabled="currentPage === 1">Prev</button>
              <button @click="nextPage" class="px-2 py-1 border rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer" :disabled="currentPage === totalPages">Next</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grades tab -->
      <div v-show="activeTab === 'grades'" class="space-y-6">
        <div class="bg-white rounded-lg shadow border border-gray-200">
          <div class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-200">
            <div>
              <h2 class="text-lg font-semibold text-gray-800">Gradebook</h2>
              <!-- <p class="text-sm text-gray-500">Sorted by {{ sortCol }} ({{ sortAsc ? 'asc' : 'desc' }})</p> -->
            </div>
            <div class="flex items-center gap-2">
              <button @click="exportGrades" class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">Export</button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortBy('name')">Student</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortBy('quizzes')">Quizzes</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortBy('final')">Final</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="row in sortedGrades" :key="row.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img :src="getAvatarByEmail(row.email)" :alt="row.name" class="h-8 w-8 rounded-full object-cover ring-2 ring-blue-100" />
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ row.name }}</div>
                        <div class="text-xs text-gray-500">{{ row.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-700">{{ row.quizzes }}%</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-green-500" :style="{ width: row.final + '%' }"></div>
                      </div>
                      <span class="text-sm font-medium text-gray-800">{{ row.final }}%</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <button @click="openGrades(row)" class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

<div v-if="showGradesModal">
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="closeGrades"></div>
    <div class="relative bg-white w-full max-w-3xl rounded-lg shadow-xl overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Grades — {{ selectedStudent?.name }}</h3>
          <p class="text-sm text-gray-500">{{ selectedStudent?.email }}</p>
        </div>
        <button @click="closeGrades" class="p-2 rounded-md hover:bg-gray-100" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="q in breakdown" :key="q.title" class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h4 class="font-medium text-gray-900">{{ q.title }}</h4>
                <p class="text-xs text-gray-500">Due {{ q.due }}</p>
              </div>
              <span class="text-xs px-2 py-1 rounded-full" :class="q.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">{{ q.status }}</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-blue-600" :style="{ width: q.percent + '%' }"></div>
              </div>
              <div class="text-sm text-gray-800">{{ q.score }}/{{ q.total }} ({{ q.percent }}%)</div>
            </div>
          </div>
        </div>
      </div>
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
        <button @click="closeGrades" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100">Close</button>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.classroom-banner {
  background-image: linear-gradient(rgba(30, 58, 138, 0.7), rgba(30, 58, 138, 0.7)), url('https://img.pikbest.com/background/20180829/blue-cartoon-school-season-classroom-background-design_2745940.jpg!bw700');
  background-size: cover;
  background-position: center;
  height: 250px;
}

.grade-progress {
  height: 8px;
  border-radius: 4px;
  background-color: #e0e7ff;
}

.grade-progress-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.5s ease;
}

.quiz-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.student-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .classroom-banner { height: 180px; }
}
</style>
