<script setup lang="ts">
import type { QuestionOption } from '@/interfaces/interfaces'

interface Props {
  options: QuestionOption[]
  questionId: number
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false
})

const emit = defineEmits<{
  'update:options': [options: QuestionOption[]]
}>()

function getOptionLetter(index: number) {
  const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return base[index] || String(index + 1)
}

function updateOption(index: number, field: keyof QuestionOption, value: any) {
  const newOptions = [...props.options]
  newOptions[index] = { ...newOptions[index], [field]: value }
  emit('update:options', newOptions)
}
</script>

<template>
  <div class="mb-6">
    <label class="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
    <div class="space-y-3">
      <div v-for="(option, index) in options" :key="index" class="flex items-center">
        <div class="flex-1 group">
          <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-2.5 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
            <input 
              :checked="option.isCorrect"
              @change="updateOption(index, 'isCorrect', true)"
              :disabled="props.readOnly"
              type="radio" 
              :name="`correct-${questionId}`"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50" 
            />
            <span class="min-w-6 h-6 inline-flex items-center justify-center text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
              {{ getOptionLetter(index) }}
            </span>
            <input 
              :value="option.text"
              @input="updateOption(index, 'text', ($event.target as HTMLInputElement).value)"
              :disabled="props.readOnly"
              type="text"
              class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400 disabled:opacity-80" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
