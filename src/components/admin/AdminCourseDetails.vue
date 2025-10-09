<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { Clock, BookOpen, Users, Book, ChevronDown, Edit2, Mail, FileText, Plus, Search, X } from 'lucide-vue-next'
import type { Course, CourseInstructor, AdminQuiz } from '@/interfaces/interfaces'

const showAddTeacherModal = ref(false)
const teacherSearchQuery = ref('')
const currentTeacherPage = ref(1)
const teacherPageSize = 5

const teachers = reactive([
  { id: 1, name: 'Jovelyn Comaingking', email: 'jovelyn@gmail.com', department: 'Computer Studies', status: 'Active' },
  { id: 2, name: 'Winslie Dada', email: 'winslie@gmail.com', department: 'HM', status: 'Active' },
  { id: 3, name: 'Jeniffer Lopez', email: 'jeniffer@gmail.com', department: 'Accounting', status: 'Active' },
])

const filteredTeachers = computed(() => {
  return teachers.filter(t =>
    t.name.toLowerCase().includes(teacherSearchQuery.value.toLowerCase()) ||
    t.email.toLowerCase().includes(teacherSearchQuery.value.toLowerCase()) ||
    t.department.toLowerCase().includes(teacherSearchQuery.value.toLowerCase())
  )
})

const totalTeacherPages = computed(() => Math.ceil(filteredTeachers.value.length / teacherPageSize))

const paginatedTeachers = computed(() => {
  const start = (currentTeacherPage.value - 1) * teacherPageSize
  return filteredTeachers.value.slice(start, start + teacherPageSize)
})

const goToTeacherPage = (page: number) => {
  if (page >= 1 && page <= totalTeacherPages.value) {
    currentTeacherPage.value = page
  }
}

const props = defineProps<{
  course: Course
  getPersonName: (id?: number) => string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const activeTab = ref<'instructors' | 'quizzes' | 'settings'>('instructors')
const expandedSections = ref<string[]>([])

const groupedInstructors = computed(() => {
  const map = new Map<number, { teacherId: number; sections: { section: string; students: number }[] }>()
  for (const i of props.course.instructors || []) {
    if (!map.has(i.teacherId)) map.set(i.teacherId, { teacherId: i.teacherId, sections: [] })
    map.get(i.teacherId)!.sections.push({ section: i.section, students: i.students })
  }
  const grouped = Array.from(map.values())
  const don = grouped.find(g => g.teacherId === 101)
  if (don) {
    const labels = new Set(don.sections.map(s => s.section))
    const candidates = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const next = candidates.find(l => !labels.has(l)) || `${don.sections.length + 1}`
    don.sections.push({ section: next, students: 0 })
  }
  return grouped
})

const quizzesByInstructor = computed<Record<number, AdminQuiz[]>>(() => {
  const result: Record<number, AdminQuiz[]> = {}
  for (const gi of groupedInstructors.value) {
    result[gi.teacherId] = [
      { id: Number(`${gi.teacherId}01`), title: 'Quiz 1', dueDate: 'Sep 15, 2025', status: 'Active', instructorId: gi.teacherId },
      { id: Number(`${gi.teacherId}02`), title: 'Quiz', dueDate: 'Sep 29, 2025', status: 'Draft', instructorId: gi.teacherId },
    ]
  }
  return result
})

const toggleSection = (key: string) => {
  const idx = expandedSections.value.indexOf(key)
  if (idx > -1) expandedSections.value.splice(idx, 1)
  else expandedSections.value.push(key)
}

const pageSize = 5
const sectionPage = reactive<Record<string, number>>({})
const makeKey = (teacherId: number, sIdx: number) => `${teacherId}-${sIdx}`
const sectionStudentsMap = computed<Record<string, { id: string; name: string; email: string; status: 'Active' | 'Inactive' }[]>>(() => {
  const result: Record<string, { id: string; name: string; email: string; status: 'Active' | 'Inactive' }[]> = {}
  const humanNames = [
    'Neil Vallecer',
    'Jose Betonio',
    'James Maguinda',
    'Jan Rosalijos',
    'John Cez Casupanan',
    'Nicole Inot',
    'Uzziah Lanz',
    'Weah Jacionto',
    'Elian Inot',
    'Chitoge Kirisaki',
  ]
  for (const gi of groupedInstructors.value) {
    gi.sections.forEach((sec, sIdx) => {
      const key = makeKey(gi.teacherId, sIdx)
      const count = Math.max(5, Number(sec.students || 0))
      result[key] = Array.from({ length: count }, (_, i) => {
        const n = i + 1
        const name = humanNames[i % humanNames.length]
        const emailSlug = name.toLowerCase().replace(/[^a-z]+/g, '.')
        return {
          id: `S${String(n).padStart(3, '0')}`,
          name,
          email: `${emailSlug}@gmail.com`,
          status: (n % 3 === 0) ? 'Inactive' as const : 'Active' as const,
        }
      })
    })
  }
  return result
})

const totalPagesFor = (key: string) => Math.max(1, Math.ceil(((sectionStudentsMap.value[key] || []).length) / pageSize))
const pagedStudents = (key: string) => {
  const page = sectionPage[key] || 1
  const start = (page - 1) * pageSize
  return (sectionStudentsMap.value[key] || []).slice(start, start + pageSize)
}
const goToPage = (key: string, page: number) => {
  const tp = totalPagesFor(key)
  if (page < 1 || page > tp) return
  sectionPage[key] = page
}

const detailsForm = reactive<Pick<Course, 'title' | 'status' | 'subjectCode' | 'units' | 'description'>>({
  title: props.course.title,
  status: props.course.status,
  subjectCode: props.course.subjectCode,
  units: props.course.units,
  description: props.course.description || ''
})

watch(() => props.course, (c) => {
  detailsForm.title = c.title
  detailsForm.status = c.status
  detailsForm.subjectCode = c.subjectCode
  detailsForm.units = c.units
  detailsForm.description = c.description || ''
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-8">
      <div class="flex flex-col md:flex-row">
        <div class="md:w-1/4 flex justify-center mb-6 md:mb-0">
          <div
            class="w-40 h-40 rounded-full bg-gradient-to-r from-blue-500 to-blue-300 flex items-center justify-center">
            <BookOpen class="h-16 w-16 text-white" />
          </div>
        </div>
        <div class="md:w-3/4">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-800">{{ props.course.title }}</h1>
              <p class="text-gray-600 mt-1">{{ props.course.code }} | {{ props.course.subjectCode }}</p>
            </div>
            <div class="flex space-x-2">
              <span
                :class="['px-3 py-1 rounded-full text-sm', props.course.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700']">{{
                  props.course.status }}</span>
            </div>
          </div>
          <p class="mt-4 text-gray-700">
            {{ props.course.description || 'No description provided.' }}
          </p>
          <div class="mt-6 flex flex-wrap gap-4">
            <div class="flex items-center">
              <BookOpen class="text-gray-500 mr-2 h-4 w-4" />
              <span class="text-gray-700">4 Quizzes</span>
            </div>
            <div class="flex items-center">
              <Users class="text-gray-500 mr-2 h-4 w-4" />
              <span class="text-gray-700">{{ (props.course.instructors || []).length }} Instructors</span>
            </div>
            <div class="flex items-center">
              <Book class="text-gray-500 mr-2 h-4 w-4" />
              <span class="text-gray-700">{{ (props.course.instructors || []).length }} Sections</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-8">
      <nav class="flex -mb-px">
        <button @click="activeTab = 'instructors'"
          :class="{ 'border-blue-500 text-blue-600': activeTab === 'instructors', 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'instructors' }"
          class="whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm">
          Instructors & Sections
        </button>
        <button @click="activeTab = 'quizzes'"
          :class="{ 'border-blue-500 text-blue-600': activeTab === 'quizzes', 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'quizzes' }"
          class="whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm">
          Course Quizzes
        </button>
        <button @click="activeTab = 'settings'"
          :class="{ 'border-blue-500 text-blue-600': activeTab === 'settings', 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'settings' }"
          class="whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm">
          Course Settings
        </button>
        <div class="flex-1"></div>
        <button class="text-sm text-gray-600 hover:text-gray-900 px-6" @click="emit('back')">Back to Catalog</button>
      </nav>
    </div>

    <!-- Instructors & Sections Tab -->
    <div v-if="activeTab === 'instructors'">
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Instructors</h2>
          <button @click="showAddTeacherModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm">
            <Plus class="mr-2 h-4 w-4" /> Add Instructor
          </button>
        </div>
        <div class="space-y-6">
          <div v-for="gi in groupedInstructors" :key="gi.teacherId"
            class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center">
                  <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                    alt="Instructor" class="w-16 h-16 rounded-full mr-4">
                  <div>
                    <h3 class="font-bold text-gray-800">{{ props.getPersonName(gi.teacherId) || 'Instructor' }}</h3>
                    <div class="flex items-center text-xs text-gray-600 mt-1">
                      <Mail class="h-3.5 w-3.5 mr-2" /> instructor{{ gi.teacherId }}@gmail.com
                    </div>
                    <p class="text-gray-600 text-sm mt-1">{{ gi.sections.length }} Section(s)</p>
                  </div>
                </div>
                <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
              </div>



              <!-- Sections -->
              <div class="mt-6 border rounded-xl overflow-hidden">
                <div v-for="(sec, sIdx) in gi.sections" :key="`${gi.teacherId}-${sIdx}`"
                  class="border-b last:border-b-0 border-gray-200">
                  <div @click="toggleSection(`${gi.teacherId}-${sIdx}`)"
                    class="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                    <div>
                      <h3 class="font-medium text-gray-800">Section {{ sec.section }}</h3>
                      <p class="text-sm text-gray-600 mt-1">{{ props.getPersonName(gi.teacherId) || 'Instructor' }} |
                        Room 105 | {{ sec.students }} Students</p>
                    </div>
                    <ChevronDown class="text-gray-500 transition-transform duration-200"
                      :class="{ 'rotate-180': expandedSections.includes(`${gi.teacherId}-${sIdx}`) }" />
                  </div>
                  <div v-if="expandedSections.includes(`${gi.teacherId}-${sIdx}`)" class="px-6 py-4 bg-gray-50">
                    <div class="flex justify-between items-center mb-4">
                      <h4 class="font-medium text-gray-800">Students ({{ sec.students }})</h4>
                      <div class="relative">
                        <Search class="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                        <input type="text" placeholder="Search students..."
                          class="pl-10 pr-4 py-2 text-sm w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      </div>
                    </div>
                    <div class="overflow-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-100">
                          <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="stu in pagedStudents(makeKey(gi.teacherId, sIdx))" :key="stu.id"
                            class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ stu.id }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                  <img class="h-10 w-10 rounded-full"
                                    src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                                    alt="">
                                </div>
                                <div class="ml-4">
                                  <div class="text-sm font-medium text-gray-900">{{ stu.name }}</div>
                                </div>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ stu.email }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <span
                                :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', stu.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">{{
                                stu.status }}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button class="text-blue-600 hover:text-blue-700 mr-3">View</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <!-- Pagination controls -->
                    <div class="mt-4 flex items-center justify-between">
                      <button class="px-3 py-1 text-sm border rounded-md text-gray-700 hover:bg-gray-50"
                        @click="goToPage(makeKey(gi.teacherId, sIdx), (sectionPage[makeKey(gi.teacherId, sIdx)] || 1) - 1)">Prev</button>
                      <div class="text-sm text-gray-600">Page {{ sectionPage[makeKey(gi.teacherId, sIdx)] || 1 }} of {{
                        totalPagesFor(makeKey(gi.teacherId, sIdx)) }}</div>
                      <button class="px-3 py-1 text-sm border rounded-md text-gray-700 hover:bg-gray-50"
                        @click="goToPage(makeKey(gi.teacherId, sIdx), (sectionPage[makeKey(gi.teacherId, sIdx)] || 1) + 1)">Next</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quizzes Tab -->
    <div v-else-if="activeTab === 'quizzes'" class="bg-white rounded-xl shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Course Quizzes</h2>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm">
          <Plus class="mr-2 h-4 w-4" /> Create Quiz
        </button>
      </div>

      <div class="space-y-6">
        <div v-for="gi in groupedInstructors" :key="`quiz-${gi.teacherId}`" class="border rounded-xl overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div class="flex items-center">
              <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                class="w-10 h-10 rounded-full mr-3" />
              <div>
                <h3 class="font-semibold text-gray-800">{{ props.getPersonName(gi.teacherId) || 'Instructor' }}</h3>
                <p class="text-xs text-gray-500">{{ (quizzesByInstructor[gi.teacherId] || []).length }} quiz(es)</p>
              </div>
            </div>
          </div>
          <div class="divide-y divide-gray-200">
            <div v-for="q in quizzesByInstructor[gi.teacherId] || []" :key="q.id"
              class="px-6 py-4 flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">{{ q.title }}</h4>
                <p class="text-xs text-gray-500">Due: {{ q.dueDate }}</p>
              </div>
              <div class="flex items-center gap-4">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  q.status === 'Active' ? 'bg-green-100 text-green-800'
                    : q.status === 'Draft' ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                ]">{{ q.status }}</span>
                <button class="text-blue-600 hover:text-blue-700 text-sm">Open</button>
              </div>
            </div>
            <div v-if="(quizzesByInstructor[gi.teacherId] || []).length === 0"
              class="px-6 py-8 text-center text-gray-500 text-sm">
              No quizzes yet.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Tab -->
    <div v-else class="bg-white rounded-xl shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Course Settings</h2>
      <form @submit.prevent>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Title -->
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Title</label>
            <input v-model="detailsForm.title" type="text"
              class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>

          <!-- Status  -->
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <div class="mt-2 flex items-center gap-6">
              <label class="inline-flex items-center text-sm text-gray-700">
                <input type="radio" value="Active" v-model="detailsForm.status" class="text-blue-600" />
                <span class="ml-2">Active</span>
              </label>
              <label class="inline-flex items-center text-sm text-gray-700">
                <input type="radio" value="Archived" v-model="detailsForm.status" class="text-blue-600" />
                <span class="ml-2">Archived</span>
              </label>
            </div>
          </div>

          <!-- Subject Code (left) -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Subject Code</label>
            <input v-model="detailsForm.subjectCode" type="text"
              class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>

          <!-- Units (right) -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Units</label>
            <input v-model.number="detailsForm.units" type="number" min="0"
              class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>

          <!-- Description full width -->
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea v-model="detailsForm.description" rows="3"
              class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button type="button"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 mr-2 hover:bg-gray-50">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save
            Changes</button>
        </div>
      </form>
    </div>

    <!-- Add Teacher Modal -->
    <Teleport to="body">
      <div v-if="showAddTeacherModal"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div class="w-full max-w-5xl max-h-[80vh] overflow-hidden bg-white rounded-lg shadow-lg flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h3 class="text-lg font-semibold text-gray-900">Add Instructor to Course</h3>
            <button @click="showAddTeacherModal = false" class="text-gray-500 hover:text-gray-700">
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="px-6 py-4 overflow-y-auto">
            <!-- Header: Teachers + Search -->
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-medium text-gray-800">Teachers ({{ filteredTeachers.length }})</h4>
              <div class="relative w-full max-w-sm">
                <Search class="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                <input v-model="teacherSearchQuery" type="text" placeholder="Search teachers..."
                  class="pl-10 pr-4 py-2 text-sm w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            </div>

            <!-- Teachers Table -->
            <div class="overflow-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="teacher in paginatedTeachers" :key="teacher.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <img class="h-10 w-10 rounded-full"
                            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                            alt="">
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ teacher.name }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ teacher.email }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ teacher.department }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', teacher.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                        {{ teacher.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="text-blue-600 hover:text-blue-700">Assign to Course</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t">
            <div class="text-sm text-gray-600">Page {{ currentTeacherPage }} of {{ totalTeacherPages }}</div>
            <div class="flex items-center gap-3">
              <button class="px-3 py-1 text-sm border rounded-md text-gray-700 hover:bg-gray-50"
                :disabled="currentTeacherPage === 1" @click="goToTeacherPage(currentTeacherPage - 1)">Prev</button>
              <button class="px-3 py-1 text-sm border rounded-md text-gray-700 hover:bg-gray-50"
                :disabled="currentTeacherPage === totalTeacherPages"
                @click="goToTeacherPage(currentTeacherPage + 1)">Next</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
