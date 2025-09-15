<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActiveQuizzes from '@/components/teacher/TeacherQuiz.vue'
import Header from '@/components/Header.vue'

const route = useRoute()
const router = useRouter()
const classId = computed(() => String(route.params.id || ''))

const classMeta = reactive({
  title: 'Automata',
  professor: 'Donald Francisco',
  term: 'Spring Semester 2023',
  code: 'MTH101-23',
})

const classNameMap: Record<string, string> = {
  '1': 'CS31A',
  '2': 'IT11B',
  '3': 'CS22A',
}

watch(classId, (id) => {
  const clsName = classNameMap[id] || `Class ${id}`
  classMeta.title = clsName
  classMeta.code = clsName
}, { immediate: true })

const professorInitials = computed(() => {
  const parts = classMeta.professor.trim().split(/\s+/)
  const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '')
  return initials.join('')
})

function navigateToQuizCreator() {
  router.push(`/teacher/create-quiz`)
}

const breadcrumbText = computed(() => `Dashboard > Courses > ${classMeta.title}`)

interface Student { id: number; name: string; email: string; grade: string; progress: number; initials: string }
const students = ref<Student[]>([
  { id: 1001, name: 'John Doe', email: 'john.doe@university.edu', grade: 'A',  progress: 92, initials: 'JD' },
  { id: 1002, name: 'Alice Smith', email: 'alice.smith@university.edu', grade: 'B+', progress: 87, initials: 'AS' },
  { id: 1003, name: 'Robert Johnson', email: 'robert.j@university.edu', grade: 'A-', progress: 90, initials: 'RJ' },
])

const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = 3

const filteredStudents = computed(() => {
  const q = searchTerm.value.trim().toLowerCase()
  if (!q) return students.value
  return students.value.filter(s => s.name.toLowerCase().includes(q))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredStudents.value.length / pageSize)))
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredStudents.value.slice(start, start + pageSize)
})

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}

function prevPage() { goToPage(currentPage.value - 1) }
function nextPage() { goToPage(currentPage.value + 1) }

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

const activeQuizzes = ref<ActiveQuiz[]>([
  {
    id: 1,
    subject: 'Automata',
    title: 'Quiz 2',
    description: 'Basic algebraic equations and expressions quiz covering chapters 1-3.',
    dueDate: 'May 15',
    class: classMeta.code,
    submitted: 18,
    total: 24,
    color: 'blue',
  },
  {
    id: 2,
    subject: 'Automata',
    title: 'Quiz 3',
    description: 'Comprehensive geometry midterm covering all concepts from the first half.',
    dueDate: 'May 22',
    class: classMeta.code,
    submitted: 12,
    total: 24,
    color: 'indigo',
  },
  {
    id: 3,
    subject: 'Automata',
    title: 'Quiz 4',
    description: 'Basic trigonometric functions and identities quiz.',
    dueDate: 'May 30',
    class: classMeta.code,
    submitted: 3,
    total: 24,
    color: 'purple',
  },
])
</script>

<template>
  <div class="bg-white min-h-screen">
    <Header :breadcrumb="breadcrumbText" />
    <div class="classroom-banner w-full flex items-end text-white">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-3">{{ classMeta.title }}</h1>
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
      <div class="flex border-b border-blue-200 mb-8">
        <button class="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600">Dashboard</button>
        <button class="px-4 py-2 font-medium text-blue-400 hover:text-blue-600">People</button>
        <button class="px-4 py-2 font-medium text-blue-400 hover:text-blue-600">Grades</button>
      </div>

      <div class="rounded-lg overflow-hidden">
        <div class="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-blue-800">Quizzes</h2>
          <button @click="navigateToQuizCreator" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <i class="fas fa-plus mr-2"></i> Create Quiz
          </button>
        </div>

        <div class="p-6">
          <ActiveQuizzes :quizzes="activeQuizzes" :hideHeader="true" />
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
