<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCoursesStore } from '@/stores/coursesStore'
import { useAuthStore } from '@/stores/authStore'
import TeacherCourses from '@/components/teacher/TeacherCourses.vue'
import type { ClassItem } from '@/interfaces/interfaces'

const coursesStore = useCoursesStore()
const authStore = useAuthStore()
const archivedCourses = ref<ClassItem[]>([])
const isLoading = ref(true)

const loadArchivedCourses = async () => {
  isLoading.value = true
  try {
    const user = authStore.currentUser
    if (!user || !user.id) {
      archivedCourses.value = []
      return
    }

    const archived = await coursesStore.fetchArchivedCourses()
    
    const teacherCourseIds = coursesStore.rawTeacherCourses
      .filter(tc => tc.instructorId === user.id)
      .map(tc => tc.courseId)
    
    const teacherArchivedCourses = archived
      .filter((c: any) => {
        return c.instructorId === user.id || teacherCourseIds.includes(c.courseId)
      })
      .map((c: any) => ({
        id: c.courseId,
        code: c.code,
        name: c.name,
        teacher: c.instructorName || c.instructorUsername || user.username || 'Teacher',
        description: c.category || '',
        students: c.enrollmentCount ?? 0,
        color: 'blue',
        status: 'Archived' as const,
        studentUsernames: []
      }))
    
    const grouped = new Map<string, ClassItem>()
    for (const course of teacherArchivedCourses) {
      const key = `${course.code}-${course.name}`
      if (!grouped.has(key)) {
        grouped.set(key, course)
      } else {
        const existing = grouped.get(key)!
        existing.students += course.students
      }
    }
    
    archivedCourses.value = Array.from(grouped.values())
  } catch (e) {
    console.error('Failed to load archived courses:', e)
    archivedCourses.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadArchivedCourses()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold text-gray-800">Archived Courses</h2>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p class="text-gray-500">Loading archived courses...</p>
    </div>
    
    <!-- Empty State -->
    <div
      v-else-if="archivedCourses.length === 0"
      class="p-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200"
    >
      <div class="relative mb-6">
        <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
          <i class="fas fa-box-archive text-4xl text-blue-400"></i>
        </div>
        <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <i class="fas fa-book-open text-white text-sm"></i>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No Archived Courses</h3>
      <p class="text-gray-500 max-w-md mb-6">
        There are no archived courses yet. When you archive a course, it will appear here.
      </p>
    </div>
    
    <!-- Courses List -->
    <div v-else>
      <TeacherCourses :classes="archivedCourses" :show-AppHeader="false" mode="archived" />
    </div>
  </div>
</template>
