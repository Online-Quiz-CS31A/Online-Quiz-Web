import { reactive, watch, type ComputedRef } from 'vue'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { QuizQuestion } from '@/interfaces/interfaces'

export function useQuestionSettings(currentQuestion: ComputedRef<QuizQuestion | null>) {
  const quizzesStore = useQuizzesStore()
  const questionSettings = reactive({
    type: 'multiple-choice',
    points: 1,
    mediaType: 'none',
    required: false
  })

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    // { value: 'fill-blank', label: 'Fill in the Blank' },
    // { value: 'text', label: 'Text' },
    // { value: 'matching', label: 'Matching' },
    // { value: 'enumeration', label: 'Enumeration' }
  ]

  function updateQuestionType() {
    if (!currentQuestion.value) return
    
    const newType = questionSettings.type
    if (currentQuestion.value.type === newType) return
    
    quizzesStore.updateCurrentQuestionType(newType)
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
      quizzesStore.updateQuestionProperty('points', newPoints)
    }
  })
  
  watch(() => questionSettings.mediaType, (newMediaType) => {
    if (currentQuestion.value) {
      quizzesStore.updateQuestionProperty('mediaType', newMediaType)
    }
  })
  
  watch(() => questionSettings.required, (newRequired) => {
    if (currentQuestion.value) {
      quizzesStore.updateQuestionProperty('required', newRequired)
    }
  })

  return {
    questionSettings,
    questionTypes,
    syncSettings
  }
}
