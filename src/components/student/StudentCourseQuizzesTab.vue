<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { StudentQuiz } from '@/interfaces/interfaces'

const StudentQuizList = defineAsyncComponent(() => import('@/components/student/StudentQuiz.vue'))

const props = defineProps<{ 
  courseName: string
  isLoading?: boolean
}>()

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
        v-if="!props.isLoading && myCourseQuizzes.length > 0"
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

    <!-- Loading State with Skeleton -->
    <div v-if="props.isLoading" class="p-6">
      <!-- Cards View Skeleton -->
      <div v-if="quizViewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
          <!-- Header skeleton -->
          <div class="h-32 bg-gradient-to-br from-gray-200 to-gray-300"></div>
          
          <!-- Body skeleton -->
          <div class="p-4 space-y-3">
            <!-- Course info skeleton -->
            <div class="bg-gray-100 rounded-lg px-4 py-3">
              <div class="flex items-center gap-2.5">
                <div class="w-5 h-5 bg-gray-200 rounded"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>

            <!-- Due date skeleton -->
            <div class="flex items-center">
              <div class="w-5 h-5 bg-gray-200 rounded mr-2.5"></div>
              <div class="h-3 bg-gray-200 rounded w-32"></div>
            </div>

            <!-- Time limit skeleton -->
            <div class="flex items-center">
              <div class="w-5 h-5 bg-gray-200 rounded mr-2.5"></div>
              <div class="h-3 bg-gray-200 rounded w-24"></div>
            </div>

            <!-- Action buttons skeleton -->
            <div class="pt-2 flex items-center justify-between">
              <div class="h-4 bg-gray-200 rounded w-24"></div>
              <div class="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rows View Skeleton -->
      <div v-else class="space-y-3">
        <div
          v-for="i in 4"
          :key="i"
          class="rounded-lg border border-gray-200 bg-white overflow-hidden animate-pulse"
        >
          <div class="flex items-stretch min-h-[140px]">
            <!-- Image skeleton -->
            <div class="hidden md:block w-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
            
            <!-- Content skeleton -->
            <div class="flex-1 p-5 flex items-center">
              <div class="flex items-start justify-between w-full gap-4">
                <div class="flex-1 space-y-3">
                  <!-- Course info skeleton -->
                  <div class="bg-gray-100 rounded-lg px-4 py-2.5 inline-flex items-center gap-2.5 w-2/3">
                    <div class="w-5 h-5 bg-gray-200 rounded"></div>
                    <div class="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>

                  <!-- Title skeleton -->
                  <div class="h-5 bg-gray-200 rounded w-3/4"></div>

                  <!-- Meta info skeleton -->
                  <div class="flex items-center gap-6">
                    <div class="flex items-center gap-1.5">
                      <div class="w-4 h-4 bg-gray-200 rounded"></div>
                      <div class="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <div class="w-4 h-4 bg-gray-200 rounded"></div>
                      <div class="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <div class="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>

                <!-- Action button skeleton -->
                <div class="flex flex-col gap-2">
                  <div class="h-10 w-32 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!props.isLoading && myCourseQuizzes.length === 0"
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
