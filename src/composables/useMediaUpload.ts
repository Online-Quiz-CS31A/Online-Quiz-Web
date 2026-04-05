import { ref, watch, type ComputedRef } from 'vue'
import { useQuizzesStore } from '@/stores/quizzesStore'
import type { QuizQuestion } from '@/interfaces/interfaces'

export function useMediaUpload(currentQuestion: ComputedRef<QuizQuestion | null>, mediaType: ComputedRef<string>) {
  const quizzesStore = useQuizzesStore()
  const showMediaUpload = ref(false)

  watch(mediaType, (newMediaType) => {
    showMediaUpload.value = newMediaType !== 'none'
  })

  function onQuestionMediaChange(e: Event) {
    if (!currentQuestion.value) return
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = () => {
      if (currentQuestion.value) {
        quizzesStore.updateQuestionProperty('mediaUrl', String(reader.result))
      }
    }
    reader.readAsDataURL(file)
    input.value = ''
  }

  function clearQuestionMedia() {
    if (!currentQuestion.value) return
    quizzesStore.updateQuestionProperty('mediaUrl', '')
  }

  return {
    showMediaUpload,
    onQuestionMediaChange,
    clearQuestionMedia
  }
}
