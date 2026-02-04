import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QuizQuestion } from '@/interfaces/interfaces'
import { useToast } from '@/composables/useToast'
import { useQuizzesStore } from '@/stores/quizzesStore'

export function useQuizEditor() {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const store = useQuizzesStore()

  const showAddQuestionModal = ref(false)
  const openMenuIndex = ref<number | null>(null)

  const classId = computed(() => String(route.params.id || ''))

  function openAddQuestionModal() {
    showAddQuestionModal.value = true
  }

  function closeAddQuestionModal() {
    showAddQuestionModal.value = false
  }

  function handleAddQuestion(question: QuizQuestion) {
    store.addQuestion(question)
  }

  function selectQuestion(index: number) {
    store.selectQuestion(index)
    openMenuIndex.value = null
  }

  function deleteCurrentQuestion() {
    if (store.currentQuiz.currentQuestionIndex === -1) return

    if (confirm('Are you sure you want to delete this question?')) {
      store.deleteQuestion(store.currentQuiz.currentQuestionIndex)
    }
  }

  function duplicateCurrentQuestion() {
    if (!store.currentQuestion) return
    store.duplicateQuestion(store.currentQuiz.currentQuestionIndex)
  }

  function toggleQuestionMenu(index: number) {
    openMenuIndex.value = openMenuIndex.value === index ? null : index
  }

  function duplicateQuestion(index: number) {
    openMenuIndex.value = null
    store.duplicateQuestion(index)
  }

  function deleteQuestion(index: number) {
    if (confirm('Are you sure you want to delete this question?')) {
      store.deleteQuestion(index)
    }
    openMenuIndex.value = null
  }

  function moveQuestion(direction: 'up' | 'down') {
    store.moveQuestion(direction)
  }

  function shuffleOptions() {
    store.shuffleOptions()
  }

  function goBack() {
    router.push(`/teacher/classes/${classId.value}/dashboard`)
  }

  function goToContent() {
    const el = document.querySelector('#quiz-main-content') as HTMLElement | null
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function saveQuizDraft() {
    try {
      store.saveQuiz('draft')
      toast.success('Quiz saved as draft!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save quiz')
    }
  }

  function isCurrentQuizPublished(): boolean {
    const id = store.currentQuiz.id
    if (id == null) return false
    const fromDefaults = store.myTeacherQuizzes.find(q => q.id === id)
    const fromStorage = store.getAllQuizzes().find(q => q.id === id)
    return (fromDefaults?.status === 'published') || (fromStorage?.status === 'published')
  }

  function saveQuiz() {
    try {
      const keepPublished = isCurrentQuizPublished()
      store.saveQuiz(keepPublished ? 'published' : 'draft')
      toast.success(keepPublished ? 'Quiz saved!' : 'Quiz saved as draft!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save quiz')
    }
  }

  function publishQuiz() {
    try {
      store.saveQuiz('published')
      toast.success('Quiz published successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to publish quiz')
    }
  }

  function getStoredQuizzes() {
    return store.getAllQuizzes()
  }

  return {
    quiz: store.currentQuiz,
    classId,
    currentQuestion: store.currentQuestion,
    hasQuestions: store.hasQuestions,
    showAddQuestionModal,
    openMenuIndex,
    openAddQuestionModal,
    closeAddQuestionModal,
    handleAddQuestion,
    selectQuestion,
    deleteCurrentQuestion,
    duplicateCurrentQuestion,
    toggleQuestionMenu,
    duplicateQuestion,
    deleteQuestion,
    moveQuestion,
    shuffleOptions,
    goBack,
    goToContent,
    saveQuizDraft,
    saveQuiz,
    publishQuiz,
    getStoredQuizzes
  }
}
