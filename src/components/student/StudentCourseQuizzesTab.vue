<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { StudentQuiz } from '@/interfaces/interfaces'

const StudentQuizList = defineAsyncComponent(() => import('@/components/student/StudentQuiz.vue'))

const props = defineProps<{ courseName: string }>()

const quizzesStore = useQuizzesStore()

const quizViewMode = ref<'cards' | 'rows'>('rows')

const myCourseQuizzes = computed<StudentQuiz[]>(() => {
  const all = quizzesStore.myStudentQuizzes
  const courseName = props.courseName || ''
  return all.filter((q) => q.subject === courseName)
})
</script>

<template>
  <div class="rounded-lg overflow-hidden">
    <div class="px-6 flex justify-between items-center">
      <h2 class="text-xl font-semibold text-blue-800">My Quizzes</h2>
      <div
        v-if="myCourseQuizzes.length > 0"
        class="inline-flex items-center gap-2 bg-gray-100 p-1 rounded-lg"
      >
        <button
          class="relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out"
          :class="quizViewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          @click="quizViewMode = 'cards'"
          aria-label="Cards view"
          title="Cards view"
        >
          <i class="fas fa-grip"></i>
        </button>
        <button
          class="relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out"
          :class="quizViewMode === 'rows' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          @click="quizViewMode = 'rows'"
          aria-label="Rows view"
          title="Rows view"
        >
          <i class="fas fa-list"></i>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="myCourseQuizzes.length === 0"
      class="p-12 flex flex-col items-center justify-center text-center"
    >
      <div class="relative mb-6">
        <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
          <i class="fas fa-clipboard-list text-4xl text-blue-400"></i>
        </div>
        <div
          class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <i class="fas fa-clock text-white text-sm"></i>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No Quizzes Available Yet</h3>
      <p class="text-gray-500 max-w-md mb-6">
        There are currently no quizzes assigned for this course. Check back later or contact your
        instructor for more information.
      </p>
      <div class="flex items-center gap-2 text-sm text-gray-400">
        <i class="fas fa-info-circle"></i>
        <span>New quizzes will appear here when they're assigned</span>
      </div>
    </div>

    <!-- Quiz List -->
    <div v-else class="p-6">
      <StudentQuizList :quizzes="myCourseQuizzes" :hideAppHeader="true" :viewMode="quizViewMode" />
    </div>
  </div>
</template>
