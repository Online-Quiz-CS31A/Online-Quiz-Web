<script setup lang="ts">
import { computed } from 'vue'
import { useQuizzesStore } from '@/stores/quizzesStore'
import TeacherQuiz from '@/components/teacher/TeacherQuiz.vue'

const props = defineProps<{ tab: 'published' | 'draft' }>()
const emit = defineEmits<{ 'update:tab': [value: 'published' | 'draft'] }>()

const quizzesStore = useQuizzesStore()

const archivedQuizzes = computed(() => {
  const stored = quizzesStore.getAllQuizzes()
  const combined = [...stored, ...quizzesStore.myTeacherQuizzes]
  let list = combined.filter(q => q.archived)
  list = list.filter(q => (q.status || 'published') === props.tab)
  return list
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
    <TeacherQuiz :quizzes="archivedQuizzes" :hide-header="true" :show-filters="false" />
  </div>
</template>
