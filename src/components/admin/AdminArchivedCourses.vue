<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Archive, RotateCcw, AlertCircle, Search } from 'lucide-vue-next'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import AdminPagination from '@/components/admin/AdminPagination.vue'
import ConfirmUnarchiveModal from '@/components/modals/ConfirmUnarchiveModal.vue'
import { useAdminStore } from '@/stores/adminStore'
import type { Course } from '@/interfaces/interfaces'

// STATE
const archivedCourses = ref<Course[]>([])
const searchQuery = ref('')
const filterStatus = ref<'All' | 'Recent' | 'Older'>('All')
const isLoading = ref(true)
const currentPage = ref(1)
const pageSize = ref(1000)
const showRestoreModal = ref(false)
const courseToRestore = ref<Course | null>(null)

const adminStore = useAdminStore()

const filteredCourses = computed(() => {
  let result = archivedCourses.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => 
      c.title.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.subjectCode?.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value === 'Recent') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    result = result.filter(c => c.archivedAt && new Date(c.archivedAt) > weekAgo)
  } else if (filterStatus.value === 'Older') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    result = result.filter(c => c.archivedAt && new Date(c.archivedAt) <= weekAgo)
  }

  return result
})

const groupedCourses = computed(() => {
  const groups: Record<string, Course> = {}
  for (const c of filteredCourses.value) {
    if (!groups[c.code]) {
      groups[c.code] = { ...c, instructors: [...(c.instructors || [])] }
    } else {
      if (c.instructors) {
        groups[c.code].instructors?.push(...c.instructors)
      }
    }
  }
  return Object.values(groups)
})

const totalItems = computed(() => groupedCourses.value.length)

const skeletonCount = computed(() => {
  const count = archivedCourses.value.length
  if (count === 0) return 3
  if (count <= 3) return 3  
  return Math.min(count, 6) 
})

// METHODS
const loadArchivedCourses = async () => {
  isLoading.value = true
  try {
    const archived = await adminStore.fetchArchivedCourses()
    archivedCourses.value = archived
  } catch (e) {
    console.error('Failed to load archived courses:', e)
    archivedCourses.value = []
  } finally {
    isLoading.value = false
  }
}

const confirmRestore = (course: Course) => {
  courseToRestore.value = course
  showRestoreModal.value = true
}

const restoreCourse = async () => {
  if (!courseToRestore.value) return
  const course = courseToRestore.value
  try {
    const coursesToRestore = archivedCourses.value.filter(c => c.code === course.code)
    const courseIds = coursesToRestore.map(c => c.id)
    
    await adminStore.bulkUnarchiveCourses(courseIds)
    
    showRestoreModal.value = false
    courseToRestore.value = null
    await loadArchivedCourses()
  } catch (e) {
    console.error('Failed to restore course:', e)
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// LIFECYCLE
onMounted(() => {
  loadArchivedCourses()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Search and Filters -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search class="w-4 h-4 text-gray-400" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search archived courses..."
            class="block w-full py-2.5 pl-10 pr-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          />
        </div>
        <div class="relative sm:w-48">
          <select
            v-model="filterStatus"
            class="block w-full py-2.5 pl-3 pr-10 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          >
            <option value="All">All</option>
            <option value="Recent">Recent</option>
            <option value="Older">Older</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Course Cards -->
    <div v-if="isLoading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard v-for="i in skeletonCount" :key="i" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="archivedCourses.length === 0"
      class="overflow-hidden border-2 border-dashed border-gray-300 rounded-lg"
    >
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <Archive class="w-16 h-16 text-gray-300 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-1">No Archived Courses</h3>
        <p class="text-sm text-gray-500">Deleted courses will appear here for recovery</p>
      </div>
    </div>

    <!-- No Search Results -->
    <div
      v-else-if="groupedCourses.length === 0"
      class="bg-white rounded-xl border border-gray-200 p-12 text-center"
    >
      <AlertCircle class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-1">No Results Found</h3>
      <p class="text-sm text-gray-500">Try adjusting your search query or filter</p>
    </div>

    <!-- Course Cards -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="course in groupedCourses"
        :key="course.code"
        class="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
      >
        <div class="p-5">
          <div class="flex items-center justify-between h-20">
            <div class="flex items-center">
              <div class="flex-shrink-0 p-3 bg-gray-100 rounded-md">
                <Archive class="h-6 w-6 text-gray-500" />
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">{{ course.title }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ course.code }}</p>
              </div>
            </div>
            <div class="flex-shrink-0">
              <span class="inline-flex px-2 text-xs font-semibold leading-5 rounded-full bg-gray-100 text-gray-600">
                Archived
              </span>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clip-rule="evenodd"/>
              </svg>
              <span>{{ course.category || 'No category' }}</span>
            </div>
            <div class="flex items-center mt-2 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <span>Archived: {{ formatDate(course.archivedAt) }}</span>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-gray-50">
          <div class="flex">
            <span class="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer" @click="confirmRestore(course)">
              <RotateCcw class="w-4 h-4 inline mr-1" />
              Restore
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <AdminPagination
      v-if="groupedCourses.length > 0"
      v-model:current-page="currentPage"
      :total-items="totalItems"
      :page-size="pageSize"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmUnarchiveModal
      :open="showRestoreModal"
      title="Restore Course"
      :item-name="courseToRestore?.title"
      @confirm="restoreCourse"
      @cancel="showRestoreModal = false"
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
