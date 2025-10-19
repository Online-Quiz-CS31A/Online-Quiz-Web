<script setup lang="ts">
import type { QuestionOption } from '@/interfaces/interfaces'

interface Props {
  options: QuestionOption[]
  questionId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:options': [options: QuestionOption[]]
}>()

function getOptionLetter(index: number) {
  const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return base[index] || String(index + 1)
}

function addOption() {
  const newOptions = [...props.options, {
    text: `Option ${props.options.length + 1}`,
    isCorrect: false,
    imageUrl: ''
  }]
  emit('update:options', newOptions)
}

function removeOption(index: number) {
  const newOptions = props.options.filter((_, i) => i !== index)
  emit('update:options', newOptions)
}

function updateOption(index: number, field: keyof QuestionOption, value: any) {
  const newOptions = [...props.options]
  newOptions[index] = { ...newOptions[index], [field]: value }
  emit('update:options', newOptions)
}

function onOptionImageChange(index: number, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = () => {
    updateOption(index, 'imageUrl', String(reader.result))
  }
  reader.readAsDataURL(file)
  input.value = ''
}
</script>

<template>
  <div class="mb-6">
    <label class="block text-sm font-medium text-gray-700 mb-2">Options</label>
    <div class="space-y-3">
      <div v-for="(option, index) in options" :key="index" class="flex items-center">
        <!-- Option Card -->
        <div class="flex-1 group">
          <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-2.5 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
            <input 
              :checked="option.isCorrect" 
              @change="updateOption(index, 'isCorrect', true)"
              type="radio" 
              :name="`correct-${questionId}`"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
            />

            <!-- Option index chip -->
            <span class="min-w-6 h-6 inline-flex items-center justify-center text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
              {{ getOptionLetter(index) }}
            </span>

            <!-- Thumbnail image -->
            <div v-if="option.imageUrl" class="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
              <img :src="option.imageUrl" alt="option image" class="w-full h-full object-cover" />
            </div>

            <!-- Option Text -->
            <input 
              :value="option.text"
              @input="updateOption(index, 'text', ($event.target as HTMLInputElement).value)"
              type="text" 
              :placeholder="`Option ${index + 1}`"
              class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400" 
            />
          </div>
        </div>

        <div class="ml-3 flex items-center gap-2 self-stretch">
          <!-- Image upload -->
          <input 
            :id="`opt-img-${questionId}-${index}`" 
            type="file" 
            accept="image/*" 
            class="hidden"
            @change="onOptionImageChange(index, $event)" 
          />
          <label 
            :for="`opt-img-${questionId}-${index}`" 
            title="Add image"
            class="inline-flex items-center justify-center w-9 h-9 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 cursor-pointer transition"
          >
            <i class="fas fa-image"></i>
          </label>

          <!-- Delete -->
          <button 
            @click="removeOption(index)" 
            title="Remove option"
            class="inline-flex items-center justify-center w-9 h-9 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
    <button 
      @click="addOption"
      class="mt-3 bg-blue-50 text-blue-600 text-sm py-2 px-3 rounded-md hover:bg-blue-100 transition-colors"
    >
      <i class="fas fa-plus mr-1"></i> Add Option
    </button>
  </div>
</template>
