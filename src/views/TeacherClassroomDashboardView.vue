<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useStudentsStore } from '@/stores/studentsStore'
import { useAuthStore } from '@/stores/authStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { Student, TabKey, GradeRow, GradeCol, QuizBreakdown, TeacherQuizItem } from '@/interfaces/interfaces'
import { useToast } from '@/composables/useToast'
import RemoveStudentConfirmModal from '@/components/modals/RemoveStudentConfirmModal.vue'
import ClassDashboardTab from '@/components/teacher/TeacherClassQuizzesTab.vue'
import ClassPeopleTab from '@/components/teacher/TeacherClassPeopleTab.vue'
import ClassGradesTab from '@/components/teacher/TeacherClassGradesTab.vue'
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))


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
  const archived = sectionsStore.archivedSectionMappings.find(m => m.sectionId === sectionId.value)
  if (archived) return archived.courseId

  const active = sectionsStore.courseSectionMappings.find(m => m.sectionId === sectionId.value)
  return active?.courseId
})

const currentCourse = computed(() => {
  if (!currentCourseId.value) return null
  return classesStore.allCourses.find(c => c.id === currentCourseId.value)
})

const schedule = computed(() => {
  if (!currentCourseId.value || !sectionId.value) return null
  return sectionsStore.getSchedule(currentCourseId.value, sectionId.value)
})

const isArchivedSection = computed(() => {
  return sectionsStore.archivedSectionMappings.some(m => m.sectionId === sectionId.value)
})

const isArchivedCourse = computed(() => currentCourse.value?.status === 'Archived')

const isArchivedForQuizzes = computed(() => {
  return !!isArchivedCourse.value || !!isArchivedSection.value
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
        initials: username.substring(0, 2).toUpperCase(),
        avatar: AVATAR_URL,
      }
    }
    
    const fullName = `${profile.firstName} ${profile.lastName}`.trim()
    return {
      id: i + 1,
      name: fullName,
      email: profile.email,
      initials: initialsOf(fullName),
      avatar: profile.photoUrl || AVATAR_URL,
    }
  })
})

function getUsernameForStudentId(studentId: number): string | null {
  if (!currentSection.value) return null
  const usernames = currentSection.value.studentUsernames || []
  const index = studentId - 1
  if (index < 0 || index >= usernames.length) return null
  return usernames[index]
}

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

function buildQuizBreakdown(studentId: number): QuizBreakdown[] {
  const quizzesForClass = activeQuizzes.value
  const username = getUsernameForStudentId(studentId)

  if (!username) return quizzesForClass.map((quiz) => {
    const totalPoints = (quiz.questions || []).reduce((sum, q: any) => sum + (q.points || 0), 0)
    return {
      title: quiz.title,
      score: 0,
      total: totalPoints,
      percent: 0,
      due: quiz.dueDate,
      status: 'Missing',
    }
  })

  return quizzesForClass.map((quiz) => {
    const totalPoints = (quiz.questions || []).reduce((sum, q: any) => sum + (q.points || 0), 0)
    const history = quizzesStore.getQuizAttemptHistoryForStudent(quiz.id, username)

    if (!history.length) {
      return {
        title: quiz.title,
        score: 0,
        total: totalPoints,
        percent: 0,
        due: quiz.dueDate,
        status: 'Missing',
      }
    }

    const bestAttempt = history.reduce((best, cur) => {
      if (!best) return cur
      return cur.percentage > best.percentage ? cur : best
    }, history[0])

    return {
      title: quiz.title,
      score: bestAttempt.score,
      total: totalPoints,
      percent: bestAttempt.percentage,
      due: quiz.dueDate,
      status: 'Submitted',
    }
  })
}

const gradeRows = computed<GradeRow[]>(() => {
  return students.value.slice(0, 10).map((s, idx) => {
    const quizzesBreakdown = buildQuizBreakdown(s.id)
    const overallQuizPercent = quizzesBreakdown.length
      ? Math.round(quizzesBreakdown.reduce((sum, q) => sum + q.percent, 0) / quizzesBreakdown.length)
      : 0
    const answeredCount = quizzesBreakdown.filter(q => q.status === 'Submitted').length
    const progress = quizzesBreakdown.length
      ? Math.round((answeredCount / quizzesBreakdown.length) * 100)
      : 0

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      assignments: 80 + ((idx * 5) % 20),
      quizzes: overallQuizPercent,
      exams: 70 + ((idx * 11) % 25),
      final: progress,
    }
  })
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

// REACTIVE
const route = useRoute()
const sectionsStore = useSectionsStore()
const classesStore = useCoursesStore()
const studentsStore = useStudentsStore()
const authStore = useAuthStore()
const quizzesStore = useQuizzesStore()

const activeQuizzes = computed<TeacherQuizItem[]>(() => {
  const storedQuizzes = quizzesStore.loadQuizzesFromStorage()
  const allQuizzes = [...storedQuizzes, ...quizzesStore.myTeacherQuizzes]
  const courseName = currentCourse.value?.name || ''

  return allQuizzes
    .filter(q => (q.status || 'published') !== 'draft')
    .filter(q => (!courseName || q.subject === courseName))
    .sort((a, b) => {
      const aDate = new Date(a.createdAt || 0).getTime()
      const bDate = new Date(b.createdAt || 0).getTime()
      return bDate - aDate
    })
})

const classMeta = reactive({
  title: currentSection.value?.name || 'Section',
  professor: currentCourse.value?.teacher || authStore.currentUser?.name || 'Unknown',
  term: 'Academic Year 2024-2025',
  code: currentCourse.value?.code || '',
})

onMounted(() => {
  sectionsStore.loadArchivedSectionsFromStorage()
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
  if (!activeQuizzes.value.length || !students.value.length) {
    success('No grades available to export')
    return
  }

  const quizTitles = activeQuizzes.value.map(q => q.title)

  const quizTotals = new Map<string, number>()
  activeQuizzes.value.forEach(q => {
    const totalPoints = (q.questions || []).reduce((sum, question: any) => sum + (question.points || 0), 0)
    quizTotals.set(q.title, totalPoints)
  })

  const headers = ['Student Name', ...quizTitles.map(title => {
    const total = quizTotals.get(title) || 0
    return total ? `${title} (${total}/${total})` : title
  })]

  const dataRows = students.value.map(s => {
    const breakdown = buildQuizBreakdown(s.id)
    const byTitle = new Map<string, QuizBreakdown>()
    breakdown.forEach(q => {
      byTitle.set(q.title, q)
    })

    const row: (string | number)[] = [s.name]
    quizTitles.forEach(title => {
      const q = byTitle.get(title)
      row.push(q ? q.score : '')
    })

    return row
  })

  const escapeCell = (value: string | number) => {
    const str = String(value)
    const escaped = str.replace(/"/g, '""')
    return `"${escaped}"`
  }

  const csvContent = [headers, ...dataRows]
    .map(row => row.map(escapeCell).join(','))
    .join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${classMeta.title || 'grades'}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  success('Grades exported as CSV')
}

function openGrades(row: GradeRow) {
  selectedStudent.value = row
  breakdown.value = buildQuizBreakdown(row.id)
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
          :isArchived="isArchivedForQuizzes"
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
          :isArchived="isArchivedSection"
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
          :breakdown="breakdown"
          @export="exportGrades"
          @sort="sortBy"
          @view="openGrades"
        />
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