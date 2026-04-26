<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCoursesStore } from '@/stores/coursesStore'
import SearchFilterBar from '@/components/SearchFilterBar.vue'
const TeacherCourses = defineAsyncComponent(() => import('@/components/teacher/TeacherCourses.vue'))
const StudentClasses = defineAsyncComponent(() => import('@/components/student/StudentCourses.vue'))

// REACTIVE
const auth = useAuthStore()
const classesStore = useCoursesStore()

// REFS
const query = ref('')
const filter = ref('All')

// COMPUTED
const isTeacher = computed(() => auth.userRole === 'teacher')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = classesStore.myClasses
  const result = list.filter(c => c.status !== 'Archived')
  if (filter.value && filter.value !== 'All') {
  }
  if (!q) return result
  return result.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q) ||
    c.teacher.toLowerCase().includes(q) ||
    String(c.students).includes(q)
  )
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-800">All Courses</h2>
    </div>

    <SearchFilterBar
      :model-value="query"
      :filter="filter"
      :options="['All']"
      placeholder="Search by course name, code, teacher, or students..."
      no-border
      @update:modelValue="(v: string) => (query = v)"
      @update:filter="(v: string) => (filter = v)"
    />

    <TeacherCourses v-if="isTeacher" :classes="filtered" :show-AppHeader="false" />
    <StudentClasses v-else :classes="filtered" :show-AppHeader="false" />

    <div v-if="filtered.length === 0" class="text-center text-gray-500 py-12">
      No courses found for "{{ query }}".
    </div>
  </div>
</template>

<style scoped>
:deep(.student-classes-AppHeader) {
  display: none;
}
</style>
