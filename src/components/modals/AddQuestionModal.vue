<script setup lang="ts">
import type { QuizQuestion } from '@/interfaces/interfaces'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  add: [question: QuizQuestion]
}>()

const questionTypes = [
  { value: 'multiple-choice', label: 'Multiple Choice', icon: 'fas fa-list-ul' },
  { value: 'true-false', label: 'True/False', icon: 'fas fa-check' },
  { value: 'fill-blank', label: 'Fill in the Blank', icon: 'fas fa-pencil-alt' },
  { value: 'short-answer', label: 'Short Answer', icon: 'fas fa-align-left' },
  { value: 'matching', label: 'Matching', icon: 'fas fa-random' },
  { value: 'enumeration', label: 'Enumeration', icon: 'fas fa-list-ol' },
  { value: 'image-question', label: 'Image Question', icon: 'fas fa-image' },
  { value: 'essay', label: 'Essay', icon: 'fas fa-pen-fancy' }
]

function getQuestionTypeDescription(type: string) {
  const descriptions: Record<string, string> = {
    'multiple-choice': 'Question with multiple possible answers',
    'true-false': 'Question with true or false options',
    'fill-blank': 'Question with blank spaces to fill',
    'short-answer': 'Question requiring a short text answer',
    'matching': 'Question to match items from two columns',
    'enumeration': 'Question requiring a list of items',
    'image-question': 'Question based on an image',
    'essay': 'Question requiring a long-form answer'
  }
  return descriptions[type] || ''
}

function createQuestion(type: string): QuizQuestion {
  const newQuestion: QuizQuestion = {
    id: Date.now(),
    type: type,
    text: '',
    points: 1,
    mediaType: 'none',
    mediaUrl: '',
    required: false,
    options: [],
    correctAnswer: '',
    pairs: [],
    items: []
  }

  switch(type) {
    case 'multiple-choice':
      newQuestion.options = [
        { text: 'Option 1', isCorrect: true, imageUrl: '' },
        { text: 'Option 2', isCorrect: false, imageUrl: '' },
        { text: 'Option 3', isCorrect: false, imageUrl: '' },
        { text: 'Option 4', isCorrect: false, imageUrl: '' }
      ]
      break
    case 'true-false':
      newQuestion.options = [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false }
      ]
      break
    case 'matching':
      newQuestion.pairs = [
        { left: 'Term 1', right: 'Definition 1' },
        { left: 'Term 2', right: 'Definition 2' }
      ]
      break
    case 'enumeration':
      newQuestion.items = ['Item 1', 'Item 2']
      break
    case 'image-question':
      newQuestion.mediaType = 'image'
      break
  }

  return newQuestion
}

function handleQuestionTypeSelect(type: string) {
  const question = createQuestion(type)
  emit('add', question)
  emit('close')
}
</script>

<template>
  <!-- Add Question Modal -->
  <div v-if="open" 
       class="fixed inset-0 bg-black/40 backdrop-blur-sm backdrop-saturate-150 flex items-center justify-center z-50">
    <div class="bg-white/90 backdrop-blur-md rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
      <div class="bg-white p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-semibold text-blue-700">Add New Question</h3>
          <button @click="emit('close')" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="type in questionTypes" :key="type.value" 
               @click="handleQuestionTypeSelect(type.value)"
               class="bg-blue-50 border border-blue-100 rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center hover:bg-blue-100 hover:transform hover:scale-105 transition-all duration-200">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <i :class="type.icon" class="text-blue-600 text-xl"></i>
            </div>
            <h4 class="font-medium text-blue-800 mb-1">{{ type.label }}</h4>
            <p class="text-xs text-gray-500 text-center">
              {{ getQuestionTypeDescription(type.value) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
