<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import type { QuizQuestion } from '@/interfaces/interfaces'

const MultipleChoiceEditor = defineAsyncComponent(() => import('@/components/quiz/question-types/MultipleChoiceEditor.vue'))
const TrueFalseEditor = defineAsyncComponent(() => import('@/components/quiz/question-types/TrueFalseEditor.vue'))
const FillBlankEditor = defineAsyncComponent(() => import('@/components/quiz/question-types/FillBlankEditor.vue'))
const ShortAnswerEditor = defineAsyncComponent(() => import('@/components/quiz/question-types/ShortAnswerEditor.vue'))
const MatchingEditor = defineAsyncComponent(() => import('@/components/quiz/question-types/MatchingEditor.vue'))
const EnumerationEditor = defineAsyncComponent(() => import('@/components/quiz/question-types/EnumerationEditor.vue'))
const EssayEditor = defineAsyncComponent(() => import('@/components/quiz/question-types/EssayEditor.vue'))

interface Props {
  question: QuizQuestion | null
}

const props = defineProps<Props>()

function autoResizeTextarea(e: Event) {
  const target = e.target as HTMLTextAreaElement
  if (!target) return
  target.style.height = 'auto'
  target.style.height = `${target.scrollHeight}px`
}
</script>

<template>
  <div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/20">
    <div v-if="!question" class="flex-1 flex items-center justify-center">
      <div class="text-center text-gray-400">
        <i class="fas fa-edit text-6xl mb-4 opacity-20"></i>
        <p class="text-lg font-medium">Select or add a question to start editing</p>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto pb-4 pretty-scroll">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
          <div class="mb-6">
            <div class="flex items-center gap-2 mb-3">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                Q
              </span>
              <span class="text-sm font-medium text-gray-700">Question Text</span>
            </div>
            <textarea 
              v-model="question.text"
              @input="autoResizeTextarea($event)"
              class="w-full px-4 py-3 rounded-lg bg-gray-50 focus:bg-white border-0 ring-1 ring-transparent focus:ring-2 focus:ring-blue-100 focus:outline-none placeholder-gray-400 shadow-inner resize-none overflow-hidden"
              rows="1"
              placeholder="Type your question here..."
            ></textarea>
          </div>

          <!-- Question Type Editors -->
          <MultipleChoiceEditor 
            v-if="question.type === 'multiple-choice'"
            v-model:options="question.options"
            :questionId="question.id"
          />
          
          <TrueFalseEditor 
            v-else-if="question.type === 'true-false'"
            v-model:options="question.options"
            :questionId="question.id"
          />
          
          <FillBlankEditor 
            v-else-if="question.type === 'fill-blank'"
            v-model:correctAnswer="question.correctAnswer"
          />

          <EssayEditor 
            v-else-if="question.type === 'text'"
            v-model:correctAnswer="question.correctAnswer"
          />
          
          <MatchingEditor 
            v-else-if="question.type === 'matching'"
            v-model:pairs="question.pairs"
          />
          
          <EnumerationEditor 
            v-else-if="question.type === 'enumeration'"
            v-model:items="question.items"
          />
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
