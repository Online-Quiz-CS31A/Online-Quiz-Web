<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import { useStudentsStore } from '@/stores/studentsStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useCoursesStore } from '@/stores/coursesStore'
import type { StudentProfile, StudentViewModel, YearLevel } from '@/interfaces/interfaces'
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))

// CONSTANTS
const router = useRouter()

// REFS
const selectedStudents = ref<StudentViewModel[]>([])
const search = ref('')
const filters = ref<'All' | YearLevel>('All')
const dragOver = ref(false)

// COMPUTED
const classId = computed(() => String(route.params.id || '1'))
const teacherCourses = computed(() => classesStore.myClasses)
const currentCourse = computed(() => {
  const cid = Number(classId.value)
  return teacherCourses.value.find(c => c.id === cid) || teacherCourses.value[0]
})

const students = computed<StudentViewModel[]>(() => {
  return Object.entries(studentsStore.profiles).map(([username, profile]: [string, StudentProfile]) => ({
    username,
    name: `${profile.firstName} ${profile.lastName}`.trim(),
    email: profile.email,
    year: profile.yearLevel,
    major: profile.program ?? '',
    avatar: profile.photoUrl ?? '/assets/default-avatar.png'
  }))
})


const filteredStudents = computed(() => {
  const q = search.value.trim().toLowerCase()
  return students.value.filter(s => {
    const matchQuery = !q || 
      s.name.toLowerCase().includes(q) || 
      s.email.toLowerCase().includes(q) || 
      s.major.toLowerCase().includes(q)
    const matchFilter = filters.value === 'All' || s.year === filters.value
    return matchQuery && matchFilter
  })
})

// REACTIVE
const route = useRoute()
const studentsStore = useStudentsStore()
const sectionsStore = useSectionsStore()
const classesStore = useCoursesStore()
const form = reactive({
  className: '',
  subject: currentCourse.value?.name || 'Information Assurance',
  scheduleDay: 'Monday',
  scheduleTime: '',
  classroom: '',
})

// WATCHERS
watch(currentCourse, (newCourse) => {
  if (newCourse) {
    form.subject = newCourse.name
  }
}, { immediate: true })

// METHODS
function toggleStudent(s: StudentViewModel) {
  const idx = selectedStudents.value.findIndex(x => x.username === s.username)
  if (idx >= 0) selectedStudents.value.splice(idx, 1)
  else selectedStudents.value.push(s)
}

function isSelected(username: string) {
  return selectedStudents.value.some(s => s.username === username)
}

function removeStudent(username: string) {
  selectedStudents.value = selectedStudents.value.filter(s => s.username !== username)
}

function clearSelection() {
  selectedStudents.value = []
}

function showAlert(message: string) {
  alert(message)
}

function onDragStart(evt: DragEvent, s: StudentViewModel) {
  evt.dataTransfer?.setData('text/plain', s.username)
  evt.dataTransfer!.effectAllowed = 'copy'
}

function onDragOver(evt: DragEvent) {
  evt.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(evt: DragEvent) {
  evt.preventDefault()
  dragOver.value = false
  const username = evt.dataTransfer?.getData('text/plain')
  const s = students.value.find(x => x.username === username)
  if (s && !isSelected(s.username)) selectedStudents.value.push(s)
}

function onImportMasterList(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  selectedStudents.value = [...students.value]
  alert('Master list imported successfully! All students have been added to the class.')
}

function saveClass() {
  if (!form.className) return alert('Please enter a class name')
  
  const studentUsernames = selectedStudents.value.map(s => s.username)
  
  const selectedCourse = teacherCourses.value.find(c => c.name === form.subject)
  const courseId = selectedCourse ? selectedCourse.id : Number(classId.value)
  
  const newSectionId = sectionsStore.addSection({
    name: form.className,
    students: studentUsernames.length,
    studentUsernames: studentUsernames
  }, courseId)
  
  sectionsStore.setSchedule(courseId, newSectionId, {
    scheduleDay: form.scheduleDay,
    scheduleTime: form.scheduleTime,
    classroom: form.classroom
  })
  
  alert('Class saved successfully!')
  router.back()
}

function goBack() {
  router.back()
}

function yearPillClass(year: YearLevel) {
  const map: Record<YearLevel, string> = {
    '1st Year': 'bg-purple-100 text-purple-800',
    '2nd Year': 'bg-green-100 text-green-800',
    '3rd Year': 'bg-yellow-100 text-yellow-800',
    '4th Year': 'bg-red-100 text-red-800',
    'TESDA': 'bg-indigo-100 text-indigo-800',
  }
  return map[year]
}
</script>

<template>
  <div class="bg-blue-50 min-h-screen font-sans flex flex-col">
    <!-- Header -->
    <Header breadcrumb="Dashboard > Class Management" />

    <main class="flex-grow container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Left Sidebar - Class Info -->
        <div class="w-full lg:w-1/3 space-y-6">
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-xl font-bold text-blue-800">Create New Class</h2>
              <button class="text-sm text-gray-500 hover:text-gray-700" @click="goBack">Back</button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input v-model="form.className" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. CS31A" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select v-model="form.subject" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option v-for="course in teacherCourses" :key="course.id" :value="course.name">
                    {{ course.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                <div class="grid grid-cols-2 gap-2">
                  <select v-model="form.scheduleDay" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                  </select>
                  <input v-model="form.scheduleTime" type="time" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Classroom</label>
                <input v-model="form.classroom" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Room 205" />
              </div>
              <button @click="saveClass" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all flex items-center justify-center space-x-2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>
                <span>Save Class</span>
              </button>
            </div>
          </div>

          <!-- Current Class Members -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-bold text-blue-800">Class Members</h2>
              <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{{ selectedStudents.length }} selected</span>
            </div>
            <div
              class="space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar p-2 border-2 border-dashed border-gray-200 rounded-lg"
              :class="{ 'drag-enter': dragOver }"
              @dragover="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
            >
              <p v-if="selectedStudents.length === 0" class="text-sm text-gray-500 text-center py-8">Drag students here or click to add</p>
              <div v-else v-for="s in selectedStudents" :key="s.username" class="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                <div class="flex items-center space-x-2">
                  <img :src="s.avatar" :alt="s.name" class="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">{{ s.name }}</h4>
                    <p class="text-xs text-gray-500">{{ s.email }}</p>
                  </div>
                </div>
                <button class="p-1 rounded-full hover:bg-blue-100 text-gray-400 hover:text-red-500 transition" @click="removeStudent(s.username)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div class="mt-4 flex justify-between">
              <button @click="clearSelection" class="text-sm text-red-500 hover:text-red-700 font-medium flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                <span>Clear All</span>
              </button>
              <button @click="() => showAlert(`Roster with ${selectedStudents.length} students generated successfully!`)" class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Export Roster</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Content - Student List -->
        <div class="w-full lg:w-2/3">
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-blue-800">Student Directory</h2>
              <div class="relative">
                <input v-model="search" type="text" placeholder="Search students..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64" />
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>

            <!-- Filter Options -->
            <div class="flex flex-wrap gap-2 mb-6">
              <button @click="filters = 'All'" class="px-3 py-1 text-sm rounded-full transition" :class="filters === 'All' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'">All Students</button>
              <button @click="filters = '1st Year'" class="px-3 py-1 text-sm rounded-full transition" :class="filters === '1st Year' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'">1st Year</button>
              <button @click="filters = '2nd Year'" class="px-3 py-1 text-sm rounded-full transition" :class="filters === '2nd Year' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'">2nd Year</button>
              <button @click="filters = '3rd Year'" class="px-3 py-1 text-sm rounded-full transition" :class="filters === '3rd Year' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'">3rd Year</button>
              <button @click="filters = '4th Year'" class="px-3 py-1 text-sm rounded-full transition" :class="filters === '4th Year' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'">4th Year</button>
              <button @click="filters = 'TESDA'" class="px-3 py-1 text-sm rounded-full transition" :class="filters === 'TESDA' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'">TESDA</button>
            </div>

            <div class="mb-6">
              <label class="relative cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium py-2 px-4 rounded-md transition inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Import Master List</span>
                <input type="file" class="hidden" accept=".csv,.xlsx,.xls" @change="onImportMasterList" />
              </label>
              <span class="text-xs text-gray-500 ml-2">CSV or Excel format</span>
            </div>

            <!-- Student Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div v-for="s in filteredStudents" :key="s.username" class="student-card bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                   :class="{ 'ring-2 ring-blue-500': isSelected(s.username) }"
                   draggable="true"
                   @dragstart="(e) => onDragStart(e, s)">
                <div class="p-4 flex items-start space-x-3">
                  <img :src="s.avatar" :alt="s.name" class="w-12 h-12 rounded-full object-cover" />
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-semibold text-gray-900 truncate">{{ s.name }}</h3>
                    <p class="text-xs text-gray-500 truncate">{{ s.email }}</p>
                    <div class="mt-1 flex flex-wrap gap-1">
                      <span class="px-2 py-0.5 text-xs rounded-full" :class="yearPillClass(s.year)">{{ s.year }}</span>
                      <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">{{ s.major }}</span>
                    </div>
                  </div>
                  <button class="p-1 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition cursor-pointer" @click="toggleStudent(s)">
                    <svg v-if="!isSelected(s.username)" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="mt-6 flex justify-between items-center">
              <div class="text-sm text-gray-500">
                Showing <span class="font-medium">1</span> to <span class="font-medium">12</span> of <span class="font-medium">{{ students.length }}</span> students
              </div>
              <div class="flex space-x-1">
                <button class="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition" aria-label="Previous">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button class="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">1</button>
                <button class="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition">2</button>
                <button class="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition">3</button>
                <button class="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition" aria-label="Next">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
.student-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
.drag-enter { border: 2px dashed #3b82f6; background-color: #eff6ff; }
</style>
