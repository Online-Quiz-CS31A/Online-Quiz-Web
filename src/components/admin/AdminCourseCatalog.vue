<script setup lang="ts">
import { ref, reactive, computed, watchEffect, onMounted } from 'vue'
import { defineAsyncComponent } from 'vue'
import { Search, Plus, ChevronLeft, ChevronRight, X, Book } from 'lucide-vue-next'
import { useClassesStore } from '@/stores/coursesStore'
const AdminCourseDetails = defineAsyncComponent(() => import('@/components/admin/AdminCourseDetails.vue'))


interface CourseInstructor {
  teacherId: number
  section: string
  students: number
}

interface Course {
  id: number
  title: string
  code: string
  status: 'Active' | 'Archived'
  subjectCode: string
  instructors: CourseInstructor[]
  description?: string
  units?: number
}

interface Person {
  id: number
  name: string
  role: 'Teacher' | 'Student'
}

const searchQuery = ref('')
const filterStatus = ref<'All Courses' | 'Active' | 'Archived'>('All Courses')

const courses = ref<Course[]>([])
const classesStore = useClassesStore()

const nameToId = (name: string): number => people.value.find(p => p.name === name)?.id || 0

onMounted(() => {
  courses.value = (classesStore.allClasses || []).map((c) => {
    const code = `CLS-${String(c.id).padStart(3,'0')}`
    const subjectCode = (c.name.split(' ')[0] || 'GEN').toUpperCase()
    const instructorId = c.teacher ? nameToId(c.teacher) : 0
    const instructors = instructorId ? [{ teacherId: instructorId, section: 'IT11D', students: c.students || 0 }] : []
    if (c.name === 'Information Assurance') {
      const extraId = nameToId('Angel Mangubat') || nameToId('Ada Wong') || nameToId('Gojo Satoru')
      if (extraId && !instructors.find(i => i.teacherId === extraId)) {
        instructors.push({ teacherId: extraId, section: instructors.length ? 'IT12C' : 'A', students: 0 })
      }
    }
    return {
      id: c.id,
      title: c.name,
      code,
      status: 'Active',
      subjectCode,
      instructors,
      description: c.description || '',
      units: undefined,
    }
  })
})

const people = ref<Person[]>([
  { id: 101, name: 'Donald Francisco', role: 'Teacher' },
  { id: 103, name: 'Ada Wong', role: 'Teacher' },
  { id: 105, name: 'Angel Mangubat', role: 'Teacher' },
  { id: 106, name: 'Gojo Satoru', role: 'Teacher' },
  { id: 102, name: 'Neil Vallecer', role: 'Student' },
  { id: 104, name: 'Jan Rosalijos', role: 'Student' },
])

const teachers = computed(() => people.value.filter(p => p.role === 'Teacher'))
const studentsDir = computed(() => people.value.filter(p => p.role === 'Student'))
const getPersonName = (id?: number) => people.value.find(p => p.id === id)?.name || ''
const getTotalStudents = (c: Course) => (c.instructors || []).reduce((sum, i) => sum + (i.students || 0), 0)

// IMPORT COURSES
const importInput = ref<HTMLInputElement | null>(null)

const parseCSV = (text: string): Record<string, string>[] => {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) return []
  const headers = lines[0].split(',').map(h => h.trim())
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => (obj[h.trim().toLowerCase()] = (cols[idx] || '').trim()))
    rows.push(obj)
  }
  return rows
}

const normalizeStatus = (s: string): Course['status'] => {
  const v = (s || '').toLowerCase()
  if (v.startsWith('arch')) return 'Archived'
  return 'Active'
}

const onImport = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files && input.files[0]
  if (!file) return
  const text = await file.text()
  let records: any[] = []
  if (file.name.toLowerCase().endsWith('.json')) {
    try { records = JSON.parse(text) } catch { records = [] }
  } else {
    records = parseCSV(text)
  }

  for (const r of records) {
    const instructors: CourseInstructor[] = []
    if (Array.isArray(r.instructors)) {
      for (const x of r.instructors) {
        const teacher = teachers.value.find(t => t.name.toLowerCase() === String(x.name || x.teacher || '').toLowerCase())
        if (!teacher) continue
        instructors.push({ teacherId: teacher.id, section: String(x.section || '').trim() || '-', students: Number(x.students || 0) || 0 })
      }
    } else if (r.instructor) {
      const teacher = teachers.value.find(t => t.name.toLowerCase() === String(r.instructor).toLowerCase())
      if (teacher) instructors.push({ teacherId: teacher.id, section: String(r.section || '').trim() || '-', students: Number(r.students || r.enrolled || 0) || 0 })
    }

    const newCourse: Course = {
      id: 0,
      title: r.title || r.name || '',
      code: r.code || '',
      status: normalizeStatus(r.status || ''),
      subjectCode: r.subjectCode || r.subject_code || r.department || '',
      instructors,
      description: r.description || ''
    }

    if (!validateIncoming(newCourse)) continue
    const codeTaken = courses.value.some(c => c.code.toLowerCase() === newCourse.code.toLowerCase())
    if (codeTaken) continue
    newCourse.id = courses.value.length ? Math.max(...courses.value.map(c => c.id)) + 1 : 1
    courses.value.push(newCourse)
  }

  if (importInput.value) importInput.value.value = ''
}

const filteredCourses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const f = filterStatus.value
  return courses.value.filter(c => {
    const instructorText = (c.instructors || []).map(i => getPersonName(i.teacherId)).join(' ')
    const matchesSearch = !q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.subjectCode || '').toLowerCase().includes(q) || instructorText.toLowerCase().includes(q)
    const matchesStatus = f === 'All Courses' || c.status === f
    return matchesSearch && matchesStatus
  })
})

const pageSize = ref(10)
const currentPage = ref(1)
const totalItems = computed(() => filteredCourses.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))
const displayStart = computed(() => (totalItems.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1))
const displayEnd = computed(() => Math.min(currentPage.value * pageSize.value, totalItems.value))
const paginatedCourses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredCourses.value.slice(start, start + pageSize.value)
})
watchEffect(() => { currentPage.value = 1 })
const goToPage = (n: number) => { if (n >= 1 && n <= totalPages.value) currentPage.value = n }
const prevPage = () => goToPage(currentPage.value - 1)
const nextPage = () => goToPage(currentPage.value + 1)
const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const tp = totalPages.value
  if (tp <= 6) { for (let i = 1; i <= tp; i++) pages.push(i); return pages }
  pages.push(1, 2, 3, '...', tp - 2, tp - 1, tp)
  return pages
})

const showModal = ref(false)
const isEditing = ref(false)

const form = reactive<Course>({
  id: 0,
  title: '',
  code: '',
  status: 'Active',
  subjectCode: '',
  instructors: [],
  description: '',
  units: undefined
})

const errors = reactive<Record<string, string>>({})
const clearErrors = () => { Object.keys(errors).forEach(k => delete (errors as any)[k]) }
const validateIncoming = (c: Course) => {
  return !!(c.title && c.code && c.subjectCode)
}
const getComparable = (c: Course) => ({
  title: c.title.trim().toLowerCase(),
  code: c.code.trim().toLowerCase(),
  status: c.status,
  subjectCode: c.subjectCode.trim().toLowerCase(),
  instructors: (c.instructors || []).map(i => ({ teacherId: i.teacherId, section: i.section.trim().toLowerCase(), students: i.students })).sort((a,b) => a.teacherId - b.teacherId),
  description: (c.description || '').trim().toLowerCase(),
  units: Number.isFinite(Number(c.units)) ? Number(c.units) : undefined
})
const isExactDuplicate = (a: Course, b: Course) => JSON.stringify(getComparable(a)) === JSON.stringify(getComparable(b))

const validateForm = (): boolean => {
  clearErrors()
  if (!form.title.trim()) errors.title = 'Title is required.'
  if (!form.subjectCode.trim()) errors.subjectCode = 'Subject code is required.'

  if (form.units != null && Number(form.units) < 0) errors.units = 'Units must be 0 or greater.'

  const dup = courses.value.some(c => c.id !== form.id && isExactDuplicate(c, form))
  if (dup) errors._form = 'A course with the same information already exists.'

  return Object.keys(errors).length === 0
}

const openAdd = () => {
  isEditing.value = false
  Object.assign(form, { id: 0, title: '', code: '', status: 'Active', subjectCode: '', instructors: [], description: '', units: undefined })
  showModal.value = true
}
const openEdit = (c: Course) => {
  isEditing.value = true
  Object.assign(form, { ...c })
  showModal.value = true
}
const closeModal = () => { showModal.value = false }

watchEffect(() => { if (showModal.value) validateForm() })

const saveCourse = () => {
  if (!validateForm()) return
  if (isEditing.value) {
    const idx = courses.value.findIndex(c => c.id === form.id)
    if (idx !== -1) courses.value[idx] = { ...form }
  } else {
    const newId = courses.value.length ? Math.max(...courses.value.map(c => c.id)) + 1 : 1
    courses.value.push({ ...form, id: newId })
  }
  showModal.value = false
}

const showCourseDetails = ref(false) // kept for backward compatibility (modal not used on card click)
const selectedCourseForDetails = ref<Course | null>(null)
const selectedCourseInline = ref<Course | null>(null)
const openCourseDetails = (c: Course) => { selectedCourseForDetails.value = c; showCourseDetails.value = true }
const openCourseDetailsInline = (c: Course) => { selectedCourseInline.value = c }
const backToCatalog = () => { selectedCourseInline.value = null }
</script>

<template>
  <div class="animate-fade-in">
    <div v-if="!selectedCourseInline" class="flex flex-col mt-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center space-x-4">
        <div class="relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search class="w-4 h-4 text-gray-400" />
          </div>
          <input v-model="searchQuery" type="text" class="block w-full py-2 pl-10 pr-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Search courses..." />
        </div>
        <div class="relative">
          <select v-model="filterStatus" class="block w-full py-2 pl-3 pr-10 text-base bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option>All Courses</option>
            <option>Active</option>
            <option>Archived</option>
          </select>
        </div>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center gap-3">
        <button type="button" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" @click="openAdd">
          <Plus class="w-5 h-5 mr-2 -ml-1" />
          New Course
        </button>
        <label for="import-courses" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer">
          Import
        </label>
        <input id="import-courses" ref="importInput" type="file" accept=".csv,.json" class="hidden" @change="onImport" />
      </div>
    </div>

    <!-- Course Details -->
    <AdminCourseDetails
      v-if="selectedCourseInline"
      :course="selectedCourseInline"
      :get-person-name="getPersonName"
      @back="backToCatalog"
    />

    <!-- Course Cards -->
    <div v-else class="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="c in paginatedCourses" :key="c.id" class="overflow-hidden bg-white rounded-lg shadow cursor-pointer hover:shadow-lg transition" @click="openCourseDetailsInline(c)">
        <div class="p-5">
          <div class="flex items-center justify-between h-20">
            <div class="flex items-center">
              <div class="flex-shrink-0 p-3 bg-blue-100 rounded-md">
                <Book class="h-6 w-6 text-blue-600" />
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">{{ c.title }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ c.code }}</p>
              </div>
            </div>
            <div class="flex-shrink-0">
              <span :class="['inline-flex px-2 text-xs font-semibold leading-5 rounded-full', c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">{{ c.status }}</span>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm text-gray-600">{{ c.description }}</p>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M6 6a3 3 0 116 0v1h1a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1V6z"/><path d="M8 7V6a2 2 0 114 0v1H8z"/></svg>
              <span v-if="(c.instructors && c.instructors.length)" class="truncate">{{ (c.instructors || []).map(i => getPersonName(i.teacherId)).join(', ') }}</span>
              <span v-else>Unassigned</span>
            </div>
            <div class="flex items-center mt-2 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7H7v6h6V7z"/><path fill-rule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm2 4a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V7z" clip-rule="evenodd"/></svg>
              {{ getTotalStudents(c) }} students across sections
            </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-gray-50">
          <div class="flex justify-between">
            <span class="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer" @click.stop="openCourseDetailsInline(c)">View details</span>
            <div class="flex space-x-3">
              <button type="button" class="text-gray-400 hover:text-gray-500" @click.stop="openEdit(c)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-8.486 8.486a1 1 0 01-.293.195l-4 1a1 1 0 01-1.237-1.237l1-4a1 1 0 01.195-.293l8.486-8.486z"/><path d="M5 13l4 4"/></svg>
              </button>
              
            </div>
          </div>
        </div>
      </div>

      <!-- Add new course -->
      <div class="overflow-hidden border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500">
        <div class="flex flex-col items-center justify-center p-12 text-center">
          <Plus class="w-10 h-10 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Add new course</h3>
          <p class="mt-1 text-sm text-gray-500">Click to create a new course</p>
          <button type="button" class="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" @click="openAdd">
            New Course
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!selectedCourseInline" class="flex items-center justify-between px-4 py-3 mt-6 bg-white border-t border-gray-200 sm:px-6">
      <div class="flex justify-between flex-1 sm:hidden">
        <a href="#" @click.prevent="prevPage" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Previous</a>
        <a href="#" @click.prevent="nextPage" class="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Next</a>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">Showing <span class="font-medium">{{ displayStart }}</span> to <span class="font-medium">{{ displayEnd }}</span> of <span class="font-medium">{{ totalItems }}</span> results</p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <a href="#" @click.prevent="prevPage" class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50">
              <ChevronLeft class="w-5 h-5" />
            </a>
            <template v-for="p in pageNumbers" :key="p + '-' + currentPage">
              <a v-if="typeof p === 'number'" href="#" @click.prevent="goToPage(p)"
                 :class="[
                   'relative inline-flex items-center px-4 py-2 text-sm font-medium border',
                   p === currentPage ? 'text-blue-600 border-blue-500 bg-blue-50 z-10' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                 ]">
                {{ p }}
              </a>
              <span v-else class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">...</span>
            </template>
            <a href="#" @click.prevent="nextPage" class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50">
              <ChevronRight class="w-5 h-5" />
            </a>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal: Add/Edit Course -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div class="w-full max-w-lg max-h-[75vh] overflow-hidden bg-white rounded-lg shadow-lg flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h3 class="text-lg font-semibold">{{ isEditing ? 'Edit Course' : 'New Course' }}</h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700"><X class="w-5 h-5" /></button>
          </div>
          <div class="px-6 py-4 overflow-y-auto">
            <p v-if="errors._form" class="mb-3 text-sm text-red-600">{{ errors._form }}</p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <!-- Title -->
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Title</label>
                <input v-model="form.title" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                <p v-if="errors.title" class="mt-1 text-xs text-red-600">{{ errors.title }}</p>
              </div>

              <!-- Status  -->
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <div class="mt-2 flex items-center gap-6">
                  <label class="inline-flex items-center text-sm text-gray-700">
                    <input type="radio" value="Active" v-model="form.status" class="text-blue-600" />
                    <span class="ml-2">Active</span>
                  </label>
                  <label class="inline-flex items-center text-sm text-gray-700">
                    <input type="radio" value="Archived" v-model="form.status" class="text-blue-600" />
                    <span class="ml-2">Archived</span>
                  </label>
                </div>
              </div>

              <!-- Subject Code (left) -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Subject Code</label>
                <input v-model="form.subjectCode" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                <p v-if="errors.subjectCode" class="mt-1 text-xs text-red-600">{{ errors.subjectCode }}</p>
              </div>

              <!-- Units (right) -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Units</label>
                <input v-model.number="form.units" type="number" min="0" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                <p v-if="errors.units" class="mt-1 text-xs text-red-600">{{ errors.units }}</p>
              </div>

              <!-- Description  -->
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea v-model="form.description" rows="3" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t">
            <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button @click="saveCourse" :disabled="Object.keys(errors).length > 0" :class="['px-4 py-2 text-sm font-medium text-white rounded-md', Object.keys(errors).length > 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700']">Save</button>
          </div>
        </div>
      </div>
    </Teleport>


    <!-- Modal: Course Details -->
    <Teleport to="body">
      <div v-if="showCourseDetails" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div class="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-white rounded-lg shadow-lg flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h3 class="text-lg font-semibold">Course Details</h3>
            <button @click="showCourseDetails = false" class="text-gray-500 hover:text-gray-700"><X class="w-5 h-5" /></button>
          </div>
          <div class="px-6 py-4 overflow-y-auto">
            <div v-if="selectedCourseForDetails">
              <h4 class="text-lg font-semibold text-gray-900">{{ selectedCourseForDetails.title }} <span class="text-sm text-gray-500">({{ selectedCourseForDetails.code }})</span></h4>
              <p class="mt-1 text-sm text-gray-600">Subject Code: {{ selectedCourseForDetails.subjectCode }}</p>
              <p class="mt-1 text-sm text-gray-600">Status: {{ selectedCourseForDetails.status }}</p>
              <p class="mt-3 text-sm text-gray-700">{{ selectedCourseForDetails.description }}</p>
              <div class="mt-5">
                <h5 class="text-sm font-semibold text-gray-900">Instructors & Sections</h5>
                <div v-if="selectedCourseForDetails.instructors && selectedCourseForDetails.instructors.length" class="mt-2 divide-y divide-gray-200 bg-gray-50 rounded">
                  <div v-for="(i, idx) in selectedCourseForDetails.instructors" :key="idx" class="flex items-center justify-between px-4 py-3">
                    <div>
                      <p class="text-sm text-gray-900">{{ getPersonName(i.teacherId) }}</p>
                      <p class="text-xs text-gray-500">Section: {{ i.section }}</p>
                    </div>
                    <div class="text-sm text-gray-700">{{ i.students }} students</div>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-500 mt-2">No instructors assigned.</p>
                <p class="mt-3 text-sm text-gray-700">Total students: <span class="font-medium">{{ getTotalStudents(selectedCourseForDetails) }}</span></p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t">
            <button @click="showCourseDetails = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Close</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
</style>
