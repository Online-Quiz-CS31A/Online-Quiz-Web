import { reactive, watch, type ComputedRef } from 'vue'
import type { QuizQuestion } from '@/interfaces/interfaces'

export function useQuestionSettings(currentQuestion: ComputedRef<QuizQuestion | null>) {
  const questionSettings = reactive({
    type: 'multiple-choice',
    points: 1,
    mediaType: 'none',
    required: false
  })

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'fill-blank', label: 'Fill in the Blank' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'matching', label: 'Matching' },
    { value: 'enumeration', label: 'Enumeration' },
    { value: 'image-question', label: 'Image Question' },
    { value: 'essay', label: 'Essay' }
  ]

  function updateQuestionType() {
    if (!currentQuestion.value) return
    
    const newType = questionSettings.type
    if (currentQuestion.value.type === newType) return
    
    currentQuestion.value.type = newType
    currentQuestion.value.options = []
    currentQuestion.value.pairs = []
    currentQuestion.value.items = []
    currentQuestion.value.correctAnswer = ''
    
    switch(newType) {
      case 'multiple-choice':
        currentQuestion.value.options = [
          { text: 'Option 1', isCorrect: true, imageUrl: '' },
          { text: 'Option 2', isCorrect: false, imageUrl: '' },
          { text: 'Option 3', isCorrect: false, imageUrl: '' },
          { text: 'Option 4', isCorrect: false, imageUrl: '' }
        ]
        break
      case 'true-false':
        currentQuestion.value.options = [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ]
        break
      case 'matching':
        currentQuestion.value.pairs = [
          { left: 'Term 1', right: 'Definition 1' },
          { left: 'Term 2', right: 'Definition 2' }
        ]
        break
      case 'enumeration':
        currentQuestion.value.items = ['Item 1', 'Item 2']
        break
      case 'image-question':
        currentQuestion.value.mediaType = 'image'
        break
    }
  }

  function syncSettings() {
    if (currentQuestion.value) {
      questionSettings.type = currentQuestion.value.type
      questionSettings.points = currentQuestion.value.points
      questionSettings.mediaType = currentQuestion.value.mediaType
      questionSettings.required = currentQuestion.value.required
    }
  }

  watch(() => questionSettings.type, updateQuestionType)
  
  watch(() => questionSettings.points, (newPoints) => {
    if (currentQuestion.value) {
      currentQuestion.value.points = newPoints
    }
  })
  
  watch(() => questionSettings.mediaType, (newMediaType) => {
    if (currentQuestion.value) {
      currentQuestion.value.mediaType = newMediaType
    }
  })
  
  watch(() => questionSettings.required, (newRequired) => {
    if (currentQuestion.value) {
      currentQuestion.value.required = newRequired
    }
  })

  return {
    questionSettings,
    questionTypes,
    syncSettings
  }
}
