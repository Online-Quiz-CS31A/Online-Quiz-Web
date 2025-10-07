<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCoursesStore } from '@/stores/coursesStore'
const TeacherCourses = defineAsyncComponent(() => import('@/components/teacher/TeacherCourses.vue'))
const StudentClasses = defineAsyncComponent(() => import('@/components/student/StudentCourses.vue'))

const auth = useAuthStore()
const classesStore = useCoursesStore()
const isTeacher = computed(() => auth.userRole === 'teacher')

const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = classesStore.myClasses
  if (!q) return list
  return list.filter(c =>
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

    <div>
      <div class="relative">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          v-model="query"
          type="text"
          placeholder="Search by course name, code, teacher, or students..."
          class="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>
    </div>

    <TeacherCourses v-if="isTeacher" :classes="filtered" :show-header="false" />
    <StudentClasses v-else :classes="filtered" :show-header="false" />

    <div v-if="filtered.length === 0" class="text-center text-gray-500 py-12">
      No courses found for "{{ query }}".
    </div>
  </div>
</template>

<style scoped>
:deep(.student-classes-header) {
  display: none;
}
</style>
