<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useStudentsStore } from '@/stores/studentsStore'
import { useAuthStore } from '@/stores/authStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { Student } from '@/interfaces/interfaces'
import { useToast } from '@/composables/useToast'
import RemoveStudentConfirmModal from '@/components/modals/RemoveStudentConfirmModal.vue'
import ClassDashboardTab from '@/components/teacher/ClassDashboardTab.vue'
import ClassPeopleTab from '@/components/teacher/ClassPeopleTab.vue'
import ClassGradesTab from '@/components/teacher/ClassGradesTab.vue'
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
const quizViewMode = ref<'cards' | 'rows'>('cards')
const showRemoveConfirm = ref(false)
const removeTarget = ref<{ name: string; email: string } | null>(null)

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
const quizzesStore = useQuizzesStore()

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
  quizzesStore.resetCurrentQuiz()
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

const { success } = useToast()

function exportGrades() {
  success('Grades exported')
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

function removeStudentFromSection(email: string) {
  if (!currentSection.value) return
  const entry = Object.entries(studentsStore.profiles).find(([, p]) => p.email === email)
  const username = entry?.[0]
  if (!username) return
  const existing = currentSection.value.studentUsernames || []
  if (!existing.includes(username)) return
  const updated = existing.filter(u => u !== username)
  sectionsStore.updateSection(currentSection.value.id, {
    studentUsernames: updated,
    students: updated.length,
  })
  success('Student removed from section')
}

function openRemoveConfirm(student: { name: string; email: string }) {
  removeTarget.value = { name: student.name, email: student.email }
  showRemoveConfirm.value = true
}

function confirmRemove() {
  if (!removeTarget.value) return
  removeStudentFromSection(removeTarget.value.email)
  showRemoveConfirm.value = false
  removeTarget.value = null
}

function cancelRemove() {
  showRemoveConfirm.value = false
  removeTarget.value = null
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
      <div v-show="activeTab === 'dashboard'">
        <ClassDashboardTab
          :quizzes="activeQuizzes"
          :viewMode="quizViewMode"
          @update:viewMode="(v) => (quizViewMode = v)"
          @create-quiz="navigateToQuizCreator"
        />
      </div>

      <!-- People tab -->
      <div v-show="activeTab === 'people'">
        <ClassPeopleTab
          :searchTerm="searchTerm"
          :students="paginatedStudents"
          :currentPage="currentPage"
          :totalPages="totalPages"
          @update:searchTerm="(v) => (searchTerm = v)"
          @prev-page="prevPage"
          @next-page="nextPage"
          @remove="openRemoveConfirm"
        />
      </div>

      <!-- Grades tab -->
      <div v-show="activeTab === 'grades'">
        <ClassGradesTab
          :rows="sortedGrades"
          :getAvatarByEmail="getAvatarByEmail"
          @export="exportGrades"
          @sort="sortBy"
          @view="openGrades"
        />
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

<RemoveStudentConfirmModal
  :open="showRemoveConfirm"
  :name="removeTarget?.name || undefined"
  @cancel="cancelRemove"
  @confirm="confirmRemove"
/>
</template>

<style scoped>
.classroom-banner {
  background-image: linear-gradient(rgba(30, 58, 138, 0.7), rgba(30, 58, 138, 0.7)), url('https://img.pikbest.com/background/20180829/blue-cartoon-school-season-classroom-background-design_2745940.jpg!bw700');
  background-size: cover;
  background-position: center;
  height: 250px;
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