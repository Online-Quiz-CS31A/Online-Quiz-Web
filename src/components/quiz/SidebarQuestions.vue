<script setup lang="ts">
import type { QuizQuestion } from '@/interfaces/interfaces'

interface Props {
  questions: QuizQuestion[]
  currentQuestionIndex: number
  openMenuIndex: number | null
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false
})

const emit = defineEmits<{
  select: [index: number]
  toggleMenu: [index: number]
  duplicate: [index: number]
  delete: [index: number]
}>()

function getQuestionIcon(type: string) {
  const map: Record<string, string> = {
    'multiple-choice': 'fas fa-list-ul',
    'true-false': 'fas fa-check',
    'fill-blank': 'fas fa-pencil-alt',
    'text': 'fas fa-align-left',
    'matching': 'fas fa-random',
    'enumeration': 'fas fa-list-ol',
  }
  return map[type] || 'fas fa-question'
}
</script>

<template>
  <div class="w-72 bg-gradient-to-br from-blue-50/40 to-purple-50/30 flex flex-col p-4 backdrop-blur-sm">
    <div class="flex-1 overflow-y-auto pretty-scroll space-y-2">
      <div v-if="questions.length === 0" class="text-center text-gray-400 py-12">
        <i class="fas fa-clipboard-list text-4xl mb-3 opacity-30"></i>
        <p class="text-sm">No questions yet</p>
      </div>

      <div v-for="(question, index) in questions" :key="question.id" class="relative">
        <div @click="emit('select', index)"
             :class="[
               'p-3 rounded-xl transition-all cursor-pointer border',
               currentQuestionIndex === index
                 ? 'bg-gradient-to-br from-white to-blue-50/80 border-blue-200 shadow-md ring-2 ring-blue-100'
                 : 'bg-white/60 hover:bg-white/90 border-gray-200 hover:shadow-sm'
             ]">
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                {{ index + 1 }}
              </span>
              <i :class="getQuestionIcon(question.type)" class="text-blue-600 text-sm"></i>
            </div>

            <div class="relative" v-if="!props.readOnly">
              <button @click.stop="emit('toggleMenu', index)"
                      class="p-1 hover:bg-gray-100 rounded transition">
                <i class="fas fa-ellipsis-v text-gray-400"></i>
              </button>

              <div v-if="openMenuIndex === index"
                   class="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button @click.stop="emit('duplicate', index)"
                        class="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2">
                  <i class="fas fa-copy text-blue-500"></i>
                  Duplicate
                </button>
                <button @click.stop="emit('delete', index)"
                        class="w-full text-left px-4 py-2 hover:bg-red-50 text-sm flex items-center gap-2 text-red-600">
                  <i class="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>

          <p class="text-sm text-gray-700 truncate">
            {{ question.text || 'Untitled question' }}
          </p>
          
          <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span class="inline-flex items-center gap-1">
              <i class="fas fa-star"></i>
              {{ question.points }} pt{{ question.points > 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pretty-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.6) transparent;
}
.pretty-scroll::-webkit-scrollbar {
  width: 10px;
}
.pretty-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.pretty-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.5);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.pretty-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.7);
}
</style>
