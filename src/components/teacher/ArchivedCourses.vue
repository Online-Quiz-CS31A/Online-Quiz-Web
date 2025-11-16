<script setup lang="ts">
import { computed } from 'vue'
import { useCoursesStore } from '@/stores/coursesStore'
import TeacherCourses from '@/components/teacher/TeacherCourses.vue'

const coursesStore = useCoursesStore()

const archivedCourses = computed(() => coursesStore.allCourses.filter(c => c.status === 'Archived'))
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold text-gray-800">Archived Courses</h2>
    </div>
    <TeacherCourses :classes="archivedCourses" :show-header="false" />
  </div>
</template>
