<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { defineAsyncComponent } from 'vue'

interface ActiveQuiz {
  id: number
  subject: string
  title: string
  description: string
  dueDate: string
  class: string
  submitted: number
  total: number
  color: string
}

const ActiveQuizzes = defineAsyncComponent(() => import('@/components/teacher/TeacherQuiz.vue'))

const props = defineProps<{ 
  quizzes: ActiveQuiz[],
  viewMode: 'cards' | 'rows'
}>()

const emit = defineEmits<{ 
  (e: 'update:viewMode', value: 'cards' | 'rows'): void,
  (e: 'create-quiz'): void,
}>()
</script>

<template>
  <div class="rounded-lg overflow-hidden">
    <div class="px-6 flex justify-between items-center">
      <h2 class="text-xl font-semibold text-blue-800">Quizzes</h2>
      <div class="flex items-center gap-3">
        <div class="inline-flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            class="relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out"
            :class="props.viewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            @click="$emit('update:viewMode', 'cards')"
            aria-label="Cards view"
            title="Cards view"
          >
            <i class="fas fa-grip"></i>
          </button>
          <button
            class="relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out"
            :class="props.viewMode === 'rows' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            @click="$emit('update:viewMode', 'rows')"
            aria-label="Rows view"
            title="Rows view"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
        <button @click="$emit('create-quiz')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center cursor-pointer transition-colors duration-200">
          <i class="fas fa-plus mr-2"></i> Create Quiz
        </button>
      </div>
    </div>
    <div class="p-6">
      <div v-if="props.quizzes.length === 0" class="p-12 flex flex-col items-center justify-center text-center">
        <div class="relative mb-6">
          <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
            <i class="fas fa-clipboard-list text-4xl text-blue-400"></i>
          </div>
          <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <i class="fas fa-plus text-white text-sm"></i>
          </div>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">No Quizzes Created Yet</h3>
        <p class="text-gray-500 max-w-md mb-6">
          You haven't created any quizzes for this class yet. Click the "Create Quiz" button above to get started and engage your students.
        </p>
        <button 
          @click="$emit('create-quiz')"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 cursor-pointer"
        >
          <i class="fas fa-plus"></i>
          <span>Create Your First Quiz</span>
        </button>
        <div class="flex items-center gap-2 text-sm text-gray-400 mt-6">
          <i class="fas fa-info-circle"></i>
          <span>Quizzes help you assess student understanding and track progress</span>
        </div>
      </div>

      <ActiveQuizzes v-else :quizzes="props.quizzes" :hideHeader="true" :viewMode="props.viewMode" />
    </div>
  </div>
</template>
