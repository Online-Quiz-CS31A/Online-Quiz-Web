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
    <div
      v-if="archivedCourses.length === 0"
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
    <div v-else>
      <TeacherCourses :classes="archivedCourses" :show-AppHeader="false" mode="archived" />
    </div>
  </div>
</template>
