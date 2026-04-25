<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { TeacherQuizItem, StudentQuizItem } from '@/interfaces/interfaces'
import SearchFilterBar from '@/components/SearchFilterBar.vue'

const StudentQuizList = defineAsyncComponent(() => import('@/components/student/StudentQuiz.vue'))
const TeacherQuizList = defineAsyncComponent(() => import('@/components/teacher/TeacherQuiz.vue'))

// REACTIVE
const auth = useAuthStore()
const quizzesStore = useQuizzesStore()
const router = useRouter()

// REFS
const query = ref('')
const statusFilter = ref<'all' | 'draft' | 'published' | 'answered' | 'unanswered'>('all')

// LIFECYCLE
onMounted(async () => {
  if (isTeacher.value) {
    await quizzesStore.fetchTeacherQuizzes()
  }
})

function addQuiz() {
  if (!isTeacher.value) return
  quizzesStore.resetCurrentQuiz()
  router.push({
    name: 'quiz-builder',
    params: { id: 'default' },
  })
}

// COMPUTED
const isTeacher = computed(() => auth.userRole === 'teacher')

const filterOptions = computed(() => {
  if (isTeacher.value) {
    return [
      { label: 'All', value: 'all' },
      { label: 'Drafts', value: 'draft' },
      { label: 'Published', value: 'published' }
    ]
  } else {
    return [
      { label: 'All', value: 'all' },
      { label: 'Answered', value: 'answered' },
      { label: 'Unanswered', value: 'unanswered' }
    ]
  }
})

const quizzes = computed<(TeacherQuizItem | StudentQuizItem)[]>(() => {
  if (isTeacher.value) {
    return quizzesStore.myTeacherQuizzes.filter(q => !(q as any).archived)
  }
  return quizzesStore.myStudentQuizzes
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = quizzes.value || []

  // Apply status filter
  if (statusFilter.value !== 'all') {
    if (isTeacher.value) {
      list = list.filter((qz) => {
        const teacherQuiz = qz as TeacherQuizItem
        return (teacherQuiz.status || 'published') === statusFilter.value
      })
    } else {
      // Student filters
      list = list.filter((qz) => {
        const studentQuiz = qz as StudentQuizItem
        const history = quizzesStore.getQuizAttemptHistory(studentQuiz.id)
        const isAnswered = history.length > 0

        if (statusFilter.value === 'answered') {
          return isAnswered
        } else if (statusFilter.value === 'unanswered') {
          return !isAnswered
        }
        return true
      })
    }
  }

  // Apply search filter
  if (!q) return list
  return list.filter((qz) =>
    (qz.title || '').toLowerCase().includes(q) ||
    (qz.subject || '').toLowerCase().includes(q) ||
    (qz.class || '').toLowerCase().includes(q) ||
    String(qz.dueDate || '').toLowerCase().includes(q)
  )
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-800">All Quizzes</h2>
    </div>

    <SearchFilterBar
      :model-value="query"
      :filter="statusFilter"
      :options="filterOptions"
      placeholder="Search by title, subject, class, or due date..."
      :action-label="isTeacher ? 'Add Quiz' : undefined"
      no-border
      @update:modelValue="(v: string) => (query = v)"
      @update:filter="(v: string) => (statusFilter = v as 'all' | 'draft' | 'published' | 'answered' | 'unanswered')"
      @action="addQuiz"
    />

    <TeacherQuizList v-if="isTeacher" :quizzes="filtered as TeacherQuizItem[]" :hide-header="true" :show-filters="false" />
    <StudentQuizList v-else :quizzes="filtered as StudentQuizItem[]" :hide-header="true" />

    <div v-if="filtered.length === 0 && !quizzesStore.isLoading" class="text-center text-gray-500 py-12">
      <span v-if="query">No quizzes found for "{{ query }}".</span>
      <span v-else>No quizzes found.</span>
    </div>
  </div>
</template>
