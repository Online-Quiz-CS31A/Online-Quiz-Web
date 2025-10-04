<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
import StudentQuizList from '@/components/student/StudentQuiz.vue'
import TeacherQuizList from '@/components/teacher/TeacherQuiz.vue'

const auth = useAuthStore()
const quizzesStore = useQuizzesStore()

const isTeacher = computed(() => auth.userRole === 'teacher')
const quizzes = computed(() => (isTeacher.value ? quizzesStore.myTeacherQuizzes : quizzesStore.myStudentQuizzes))

const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = quizzes.value || []
  if (!q) return list
  return list.filter((qz: any) =>
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

    <div>
      <div class="relative">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          v-model="query"
          type="text"
          placeholder="Search by title, subject, class, or due date..."
          class="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>
    </div>

    <TeacherQuizList v-if="isTeacher" :quizzes="filtered as any" :hide-header="true" />
    <StudentQuizList v-else :quizzes="filtered as any" :hide-header="true" />

    <div v-if="filtered.length === 0" class="text-center text-gray-500 py-12">
      No quizzes found for "{{ query }}".
    </div>
  </div>
</template>
