<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { TeacherQuizItem, StudentQuizItem } from '@/interfaces/interfaces'
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import { useToast } from '@/composables/useToast'

const StudentQuizList = defineAsyncComponent(() => import('@/components/student/StudentQuiz.vue'))
const TeacherQuizList = defineAsyncComponent(() => import('@/components/teacher/TeacherQuiz.vue'))

// REACTIVE
const auth = useAuthStore()
const quizzesStore = useQuizzesStore()

// REFS
const query = ref('')
const statusFilter = ref<'all' | 'draft' | 'published'>('all')
const { info: showInfo } = useToast()

function addQuiz() {
  showInfo('Add Quiz clicked')
}

// COMPUTED
const isTeacher = computed(() => auth.userRole === 'teacher')

const quizzes = computed<(TeacherQuizItem | StudentQuizItem)[]>(() => {
  if (isTeacher.value) {
    const stored = quizzesStore.loadQuizzesFromStorage()
    const combined = [...stored, ...quizzesStore.myTeacherQuizzes]
    return combined.filter((q) => !(q as TeacherQuizItem).archived)
  }
  return quizzesStore.myStudentQuizzes
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = quizzes.value || []
  
  if (statusFilter.value !== 'all' && isTeacher.value) {
    list = list.filter((qz) => {
      const teacherQuiz = qz as TeacherQuizItem
      return (teacherQuiz.status || 'published') === statusFilter.value
    })
  }
  
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
      :options="[
        { label: 'All', value: 'all' },
        { label: 'Drafts', value: 'draft' },
        { label: 'Published', value: 'published' }
      ]"
      placeholder="Search by title, subject, class, or due date..."
      :action-label="isTeacher ? 'Add Quiz' : undefined"
      no-border
      @update:modelValue="(v: string) => (query = v)"
      @update:filter="(v: string) => (statusFilter = v as 'all' | 'draft' | 'published')"
      @action="addQuiz"
    />

    <TeacherQuizList v-if="isTeacher" :quizzes="filtered as TeacherQuizItem[]" :hide-header="true" :show-filters="false" />
    <StudentQuizList v-else :quizzes="filtered as StudentQuizItem[]" :hide-header="true" />

    <div v-if="filtered.length === 0" class="text-center text-gray-500 py-12">
      No quizzes found for "{{ query }}".
    </div>
  </div>
</template>
