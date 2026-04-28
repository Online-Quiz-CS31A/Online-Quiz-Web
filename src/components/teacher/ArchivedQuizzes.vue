<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useAuthStore } from '@/stores/authStore'
import { useCoursesStore } from '@/stores/coursesStore'
import TeacherQuiz from '@/components/teacher/TeacherQuiz.vue'
import type { TeacherQuizItem } from '@/interfaces/interfaces'
import * as quizService from '@/services/quizService'

const props = defineProps<{ tab: 'published' | 'draft' }>()
const emit = defineEmits<{ 'update:tab': [value: 'published' | 'draft'] }>()

const quizzesStore = useQuizzesStore()
const authStore = useAuthStore()
const coursesStore = useCoursesStore()

const apiArchivedQuizzes = ref<TeacherQuizItem[]>([])
const isLoading = ref(false)

async function fetchArchivedQuizzes() {
  if (!authStore.currentUser?.id) return

  isLoading.value = true
  try {
    const courses = coursesStore.allCourses

    const results = await Promise.all(
      courses.map(async (course) => {
        try {
          const archivedQuizzes = await quizService.getArchivedQuizzesForCourse(course.id)

          if (Array.isArray(archivedQuizzes)) {
            return archivedQuizzes.map((quiz: any) => ({
              id: quiz.quizId || quiz.id,
              subject: course.name || '',
              title: quiz.title || 'Untitled Quiz',
              description: quiz.description || '',
              dueDate: quiz.dueAt || '',
              class: '',
              submitted: 0,
              total: 0,
              color: 'blue',
              status: (quiz.isPublished ? 'published' : 'draft') as 'published' | 'draft',
              timeLimit: quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : '30 min',
              questions: quiz.questions || [],
              createdAt: quiz.createdAt || new Date().toISOString(),
              updatedAt: quiz.updatedAt || new Date().toISOString(),
              archived: true,
              archivedAt: quiz.archivedAt,
              archivedBy: quiz.archivedBy,
              archivedByName: quiz.archivedByName,
            } as TeacherQuizItem))
          }
          return []
        } catch (error) {
          console.error(`Failed to fetch archived quizzes for course ${course.id}:`, error)
          return []
        }
      })
    )

    apiArchivedQuizzes.value = results.flat()
  } catch (error) {
    console.error('Failed to fetch archived quizzes:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchArchivedQuizzes()
})

watch(() => props.tab, () => {
})

const archivedQuizzes = computed(() => {
  void quizzesStore.quizzesVersion
  
  const stored = quizzesStore.getAllQuizzes()
  const combined = [...stored, ...quizzesStore.myTeacherQuizzes, ...apiArchivedQuizzes.value]

  let list = combined.filter(q => q.archived)
  list = list.filter(q => (q.status || 'published') === props.tab)

  const seen = new Set<number>()
  return list.filter(q => {
    if (seen.has(q.id)) return false
    seen.add(q.id)
    return true
  })
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold text-gray-800">Archived Quizzes</h2>
      <div class="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden text-sm">
        <button
          class="px-4 py-1.5 border-r border-gray-200 cursor-pointer"
          :class="props.tab === 'published' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'"
          @click="emit('update:tab', 'published')"
        >
          Published
        </button>
        <button
          class="px-4 py-1.5 cursor-pointer"
          :class="props.tab === 'draft' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'"
          @click="emit('update:tab', 'draft')"
        >
          Draft
        </button>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200">
      <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p class="text-gray-500">Loading archived quizzes...</p>
    </div>
    
    <!-- Empty State -->
    <div
      v-else-if="archivedQuizzes.length === 0"
      class="p-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200"
    >
      <div class="relative mb-6">
        <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
          <i class="fas fa-box-archive text-4xl text-blue-400"></i>
        </div>
        <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <i class="fas fa-inbox text-white text-sm"></i>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No Archived Quizzes</h3>
      <p class="text-gray-500 max-w-md mb-6">
        There are no archived quizzes yet. When you archive a quiz, it will appear here.
      </p>
    </div>
    
    <!-- Quiz List -->
    <div v-else>
      <TeacherQuiz
        :quizzes="archivedQuizzes"
        :hide-AppHeader="true"
        :show-filters="false"
        :archived-mode="true"
        archived-context-type="course"
        @quiz-unarchived="fetchArchivedQuizzes"
      />
    </div>
  </div>
</template>
