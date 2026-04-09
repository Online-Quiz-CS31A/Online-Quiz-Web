<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { X, Book, Plus, Trash2, Search } from 'lucide-vue-next'
import AdminSearchFilterBar from '@/components/SearchFilterBar.vue'
import AdminCourseAddModal from '@/components/modals/AdminCourseAddModal.vue'
import AdminCourseEditModal from '@/components/modals/AdminCourseEditModal.vue'
import CourseArchiveModal from '@/components/modals/CourseArchiveModal.vue'
import AdminPagination from '@/components/admin/AdminPagination.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import { Archive } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/adminStore'
import type { Course, CourseInstructor, AdminUser } from '@/interfaces/interfaces'

import AdminCourseDetails from '@/components/admin/AdminCourseDetails.vue'

// STORE
const adminStore = useAdminStore()

// LOCAL STATE
const teachersMap = ref<Record<number, AdminUser>>({})
const allSections = ref<string[]>([])

// REACTIVE FORM
const form = reactive({
  id: 0,
  title: '',
  code: '',
  status: 'Active' as 'Active' | 'Archived',
  subjectCode: '',
  instructors: [] as CourseInstructor[],
  units: undefined as number | undefined,
  assignments: [] as { instructorId: number | null; sections: string[] }[]
})

const errors = reactive<Record<string, string>>({})

// REFS
const searchQuery = ref('')
const filterStatus = ref<'All Courses' | 'Active' | 'Archived'>('All Courses')
const filterCategory = ref('All Categories')
const pageSize = ref(1000) 
const currentPage = ref(1)
const showModal = ref(false)
const isEditing = ref(false)
const selectedCourseInline = ref<Course | null>(null)
const showArchiveModal = ref(false)
const courseToArchive = ref<Course | null>(null)
const originalCode = ref('')
const isSaving = ref(false)

// COMPUTED
const groupedCourses = computed(() => {
  const groups: Record<string, Course> = {}
  
  for (const c of adminStore.courses) {
    if (!groups[c.code]) {
      groups[c.code] = { ...c, instructors: [...(c.instructors || [])] }
    } else {
      if (c.instructors) {
        groups[c.code].instructors.push(...c.instructors)
      }
    }
  }
  return Object.values(groups)
})

const categoryOptions = computed(() => {
  const cats = new Set<string>()
  for (const c of groupedCourses.value) {
    if (c.subjectCode) cats.add(c.subjectCode)
  }
  return ['All Categories', ...Array.from(cats).sort()]
})

const filteredCourses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return groupedCourses.value.filter(c => {
    const matchesSearch = !q ||
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.subjectCode || '').toLowerCase().includes(q) ||
      (c.instructors || []).some(i => getPersonName(i.teacherId).toLowerCase().includes(q))
    const matchesCategory = filterCategory.value === 'All Categories' || c.subjectCode === filterCategory.value
    return matchesSearch && matchesCategory
  })
})

const hasActiveFilters = computed(() =>
  searchQuery.value.trim() !== '' ||
  filterStatus.value !== 'All Courses' ||
  filterCategory.value !== 'All Categories'
)

const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'All Courses'
  filterCategory.value = 'All Categories'
}

const totalItems = computed(() => adminStore.totalCourses)

// WATCHERS
watch([currentPage, pageSize, filterStatus, searchQuery], () => {
  loadCourses()
})

watch(() => showModal.value, (val) => {
  if (val) validateForm()
})

watch(() => form.title, () => { if (form.title.trim()) delete errors.title })
watch(() => form.code, () => { if (form.code.trim()) delete errors.code })
watch(() => form.subjectCode, () => { if (form.subjectCode.trim()) delete errors.subjectCode })
watch(() => form.assignments, () => { if (form.assignments.length > 0) delete errors.assignments }, { deep: true })

// METHODS
const loadCourses = async () => {
  await adminStore.fetchCourses(currentPage.value, pageSize.value, searchQuery.value, filterStatus.value)
  
  for (const course of adminStore.courses) {
    if (course.instructors) {
      for (const instructor of course.instructors) {
        if (instructor.section) {
          try {
            const students = await adminStore.fetchStudentsBySection(instructor.section)
            instructor.students = students.length
          } catch (e) {
            console.error(`Failed to fetch students for section ${instructor.section}`, e)
          }
        }
      }
    }
  }
}

const loadTeachersAndSections = async () => {
  await adminStore.fetchUsers(1, 100, '', 'Teacher')
  if (adminStore.users) {
    adminStore.users.forEach(u => {
      teachersMap.value[u.id] = u
    })
  }

  try {
    await adminStore.fetchUsers(1, 1000, '', 'Student')
    if (adminStore.users) {
      const sections = new Set<string>()
      adminStore.users.forEach(u => {
        if (u.role === 'Student' && u.section) {
          sections.add(u.section)
        }
      })
      allSections.value = Array.from(sections).sort()
    }
    
    await adminStore.fetchUsers(1, 100, '', 'Teacher')
  } catch (e) {
    console.error('Failed to load sections', e)
  }
}

const getPersonName = (id?: number) => {
  if (!id) return 'Unassigned'
  const t = teachersMap.value[id]
  const userInStore = adminStore.users.find(u => u.id === id)
  if (userInStore) return userInStore.name
  return t ? t.name : `Instructor ${id}`
}

const getTotalStudents = (c: Course) => (c.instructors || []).reduce((sum, i) => sum + (i.students || 0), 0)

const clearErrors = () => { Object.keys(errors).forEach(k => delete (errors as any)[k]) }

const validateForm = (): boolean => {
  clearErrors()
  if (!form.title.trim()) errors.title = 'Title is required.'
  if (!form.code.trim()) errors.code = 'Course code is required.'
  if (!form.subjectCode.trim()) errors.subjectCode = 'Category/Department is required.'
  
  if (form.assignments.length === 0) {
    errors.assignments = 'At least one instructor-section assignment is required.'
  } else {
    const hasInvalid = form.assignments.some(a => !a.instructorId || !a.sections || a.sections.length === 0)
    if (hasInvalid) errors.assignments = 'All assignments must have an instructor and at least one section selected.'
  }

  return Object.keys(errors).length === 0
}

const openAdd = () => {
  isEditing.value = false
  Object.assign(form, { 
    id: 0, 
    title: '', 
    code: '', 
    status: 'Active', 
    subjectCode: '', 
    instructors: [], 
    assignments: []
  })
  showModal.value = true
}

const openEdit = (c: Course) => {
  isEditing.value = true
  originalCode.value = c.code
  
  const instructorMap = new Map<number, string[]>()
  for (const i of c.instructors || []) {
    if (!instructorMap.has(i.teacherId)) {
      instructorMap.set(i.teacherId, [])
    }
    instructorMap.get(i.teacherId)!.push(i.section)
  }
  
  const assignments = Array.from(instructorMap.entries()).map(([instructorId, sections]) => ({
    instructorId,
    sections
  }))

  Object.assign(form, { 
    ...c,
    assignments
  })
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const saveCourse = async () => {
  if (isSaving.value) return
  if (!validateForm()) return
  
  isSaving.value = true
  adminStore.isLoading = true
  try {
    if (isEditing.value) {
      const existingCourses = adminStore.courses.filter(c => c.code === form.code)
      
      const newPairs: Array<{ instructorId: number; section: string }> = []
      for (const assignment of form.assignments) {
        for (const section of assignment.sections) {
          newPairs.push({ instructorId: assignment.instructorId!, section })
        }
      }
      
      const usedExistingIds = new Set<number>()
      const promises = []
      
      for (const newPair of newPairs) {
        const matchingExisting = existingCourses.find(ec => 
          ec.instructors?.[0]?.teacherId === newPair.instructorId &&
          ec.instructors?.[0]?.section === newPair.section &&
          !usedExistingIds.has(ec.id)
        )
        
        if (matchingExisting) {
          usedExistingIds.add(matchingExisting.id)
          const updatePayload = {
            name: form.title,
            status: form.status,
            category: form.subjectCode,
            section: newPair.section,
            instructorId: newPair.instructorId
          }
          promises.push(adminStore.updateCourse(matchingExisting.id, updatePayload))
        } else {
          const createPayload = {
            name: form.title,
            code: form.code,
            category: form.subjectCode,
            section: newPair.section,
            instructorId: newPair.instructorId,
            status: form.status,
            createdBy: 1
          }
          promises.push(adminStore.createCourse(createPayload))
        }
      }
      
      for (const existing of existingCourses) {
        if (!usedExistingIds.has(existing.id)) {
          promises.push(adminStore.deleteCourse(existing.id))
        }
      }
      
      await Promise.all(promises)
    } else {
      const promises = []
      for (const assignment of form.assignments) {
        for (const section of assignment.sections) {
          const payload = {
            name: form.title,
            code: form.code,
            category: form.subjectCode,
            section: section,
            instructorId: assignment.instructorId,
            status: form.status,
            createdBy: 1
          }
          promises.push(adminStore.createCourse(payload))
        }
      }
      await Promise.all(promises)
    }
    
    showModal.value = false
    await loadCourses()
    
  } catch (e) {
    console.error('Failed to save course', e)
  } finally {
    adminStore.isLoading = false
    isSaving.value = false
  }
}

const confirmArchive = (c: Course) => {
  courseToArchive.value = c
  showArchiveModal.value = true
}

const archiveCourse = async () => {
  if (!courseToArchive.value) return
  
  const coursesToArchive = adminStore.courses.filter(c => c.code === courseToArchive.value?.code)
  
  const STORAGE_KEY = 'archivedCourses'
  try {
    const existingArchived = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const newArchived = coursesToArchive.map(c => ({
      id: c.id,
      code: c.code,
      title: c.title,
      category: c.subjectCode,
      status: 'Archived',
      deletedAt: new Date().toISOString(),
      instructors: c.instructors || []
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existingArchived, ...newArchived]))
  } catch (e) {
    console.error('Failed to localStorage archive course:', e)
  }
  
  const promises = coursesToArchive.map(c => {
    const updatePayload = {
      name: c.title,
      status: 'Archived',
      category: c.subjectCode,
      section: c.instructors?.[0]?.section,
      instructorId: c.instructors?.[0]?.teacherId
    }
    return adminStore.updateCourse(c.id, updatePayload)
  })
  
  await Promise.all(promises)
  
  showArchiveModal.value = false
  courseToArchive.value = null
  await loadCourses()
}

const openCourseDetailsInline = (c: Course) => { selectedCourseInline.value = c }
const backToCatalog = () => { selectedCourseInline.value = null }

// LIFECYCLE
onMounted(() => {
  loadCourses()
  loadTeachersAndSections()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Search and Filters -->
    <AdminSearchFilterBar
      v-if="!selectedCourseInline"
      v-model="searchQuery"
      v-model:filter="filterStatus"
      :options="['All Courses', 'Active', 'Archived']"
      v-model:filter2="filterCategory"
      :options2="categoryOptions"
      placeholder="Search by title, code, category or instructor..."
      action-label="New Course"
      :result-count="filteredCourses.length"
      result-label="course"
      :has-active-filters="hasActiveFilters"
      @action="openAdd"
      @clear-filters="clearFilters"
    />

    <!-- Course Details -->
    <AdminCourseDetails
      v-if="selectedCourseInline"
      :course="selectedCourseInline"
      :get-person-name="getPersonName"
      @back="backToCatalog"
    />

    <!-- Course Cards -->
    <div v-else>
      <div v-if="adminStore.isLoading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>
      <div v-else-if="filteredCourses.length === 0 && !adminStore.isLoading" class="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <Search class="w-12 h-12 text-gray-300 mb-3" />
        <p class="text-gray-500 font-medium">No courses match your search</p>
        <p class="text-sm text-gray-400 mt-1">Try adjusting your filters or search term</p>
        <button @click="clearFilters" class="mt-4 text-sm text-blue-600 hover:underline">Clear all filters</button>
      </div>
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="c in filteredCourses" :key="c.code" class="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all group" @click="openCourseDetailsInline(c)">
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
              <div class="flex items-center text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M6 6a3 3 0 116 0v1h1a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1V6z"/><path d="M8 7V6a2 2 0 114 0v1H8z"/></svg>
                <span v-if="(c.instructors && c.instructors.length)" class="truncate">{{ Array.from(new Set((c.instructors || []).map(i => i.teacherId))).map(id => getPersonName(id)).join(', ') }}</span>
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
              <div v-if="c.status !== 'Archived'" class="flex space-x-3">
                <button type="button" class="text-gray-400 hover:text-gray-500" @click.stop="openEdit(c)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-8.486 8.486a1 1 0 01-.293.195l-4 1a1 1 0 01-1.237-1.237l1-4a1 1 0 01.195-.293l8.486-8.486z"/><path d="M5 13l4 4"/></svg>
                </button>
                <button type="button" class="text-amber-400 hover:text-amber-500 ml-2" @click.stop="confirmArchive(c)">
                  <Archive class="w-5 h-5" />
                </button>
              </div>
              <div v-else>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                  <Archive class="w-3 h-3" /> Archived
                </span>
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
    </div>

    <!-- Pagination -->
    <AdminPagination
      v-if="!selectedCourseInline"
      v-model:current-page="currentPage"
      :total-items="totalItems"
      :page-size="pageSize"
    />

    <AdminCourseAddModal
      v-if="showModal && !isEditing"
      :open="true"
      :model-value="form"
      :errors="errors"
      :teachers="adminStore.users.filter(u => u.role === 'Teacher')"
      :all-sections="allSections"
      @close="closeModal"
      @save="saveCourse"
      @update:modelValue="val => Object.assign(form, val)"
    />
    <AdminCourseEditModal
      v-if="showModal && isEditing"
      :open="true"
      :model-value="form"
      :errors="errors"
      :teachers="adminStore.users.filter(u => u.role === 'Teacher')"
      :all-sections="allSections"
      @close="closeModal"
      @save="saveCourse"
      @update:modelValue="val => Object.assign(form, val)"
    />
    <CourseArchiveModal
      :open="showArchiveModal"
      :course-name="courseToArchive?.title || ''"
      :course-code="courseToArchive?.code || ''"
      @confirm="archiveCourse"
      @cancel="showArchiveModal = false"
    />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
</style>
