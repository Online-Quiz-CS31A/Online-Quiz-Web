import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QuizQuestion, TeacherQuizItem } from '@/interfaces/interfaces'
import { useToast } from '@/composables/useToast'

export function useQuizEditor() {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  
  const showAddQuestionModal = ref(false)
  const openMenuIndex = ref<number | null>(null)

  const quiz = reactive({
    title: '',
    subject: '',
    timeLimit: '',
    description: '',
    questions: [] as QuizQuestion[],
    currentQuestionIndex: -1
  })

  const classId = computed(() => String(route.params.id || ''))
  
  const currentQuestion = computed(() => {
    if (quiz.currentQuestionIndex === -1) return null
    return quiz.questions[quiz.currentQuestionIndex]
  })

  const hasQuestions = computed(() => quiz.questions.length > 0)

  function openAddQuestionModal() {
    showAddQuestionModal.value = true
  }

  function closeAddQuestionModal() {
    showAddQuestionModal.value = false
  }

  function handleAddQuestion(question: QuizQuestion) {
    quiz.questions.push(question)
    selectQuestion(quiz.questions.length - 1)
  }

  function selectQuestion(index: number) {
    quiz.currentQuestionIndex = index
    openMenuIndex.value = null
  }

  function deleteCurrentQuestion() {
    if (quiz.currentQuestionIndex === -1) return
    
    if (confirm('Are you sure you want to delete this question?')) {
      quiz.questions.splice(quiz.currentQuestionIndex, 1)
      
      if (quiz.questions.length === 0) {
        quiz.currentQuestionIndex = -1
      } else {
        quiz.currentQuestionIndex = Math.max(0, quiz.currentQuestionIndex - 1)
      }
    }
  }

  function duplicateCurrentQuestion() {
    if (!currentQuestion.value) return
    const clone = JSON.parse(JSON.stringify(currentQuestion.value)) as QuizQuestion
    clone.id = Date.now()
    quiz.questions.splice(quiz.currentQuestionIndex + 1, 0, clone)
    selectQuestion(quiz.currentQuestionIndex + 1)
  }

  function toggleQuestionMenu(index: number) {
    openMenuIndex.value = openMenuIndex.value === index ? null : index
  }

  function duplicateQuestion(index: number) {
    const q = quiz.questions[index]
    if (!q) return
    const clone = JSON.parse(JSON.stringify(q)) as QuizQuestion
    clone.id = Date.now()
    quiz.questions.splice(index + 1, 0, clone)
    openMenuIndex.value = null
    selectQuestion(index + 1)
  }

  function deleteQuestion(index: number) {
    if (index < 0 || index >= quiz.questions.length) return
    if (confirm('Are you sure you want to delete this question?')) {
      quiz.questions.splice(index, 1)
      if (quiz.questions.length === 0) {
        quiz.currentQuestionIndex = -1
      } else if (quiz.currentQuestionIndex >= index) {
        quiz.currentQuestionIndex = Math.max(0, quiz.currentQuestionIndex - 1)
      }
    }
    openMenuIndex.value = null
  }

  function moveQuestion(direction: 'up' | 'down') {
    const idx = quiz.currentQuestionIndex
    if (idx === -1) return
    const newIndex = direction === 'up' ? idx - 1 : idx + 1
    if (newIndex < 0 || newIndex >= quiz.questions.length) return
    const [q] = quiz.questions.splice(idx, 1)
    quiz.questions.splice(newIndex, 0, q)
    selectQuestion(newIndex)
  }

  function shuffleOptions() {
    if (!currentQuestion.value || !currentQuestion.value.options) return
    currentQuestion.value.options = [...currentQuestion.value.options]
      .map(v => ({ sort: Math.random(), value: v }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }

  function goBack() {
    router.push(`/teacher/classes/${classId.value}/dashboard`)
  }

  function goToContent() {
    const el = document.querySelector('#quiz-main-content') as HTMLElement | null
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function saveQuizDraft() {
    if (!quiz.title.trim()) {
      toast.error('Please enter a quiz title')
      return
    }

    if (quiz.questions.length === 0) {
      toast.error('Please add at least one question')
      return
    }

    const quizData: TeacherQuizItem = {
      id: Date.now(),
      title: quiz.title,
      subject: quiz.subject || 'Not specified',
      description: quiz.description || '',
      dueDate: 'Not set',
      class: classId.value,
      submitted: 0,
      total: 0,
      color: 'blue',
      status: 'draft',
      questions: JSON.parse(JSON.stringify(quiz.questions)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const drafts = getStoredQuizzes()
    drafts.push(quizData)
    localStorage.setItem('quizzes', JSON.stringify(drafts))
    
    toast.success('Quiz saved as draft!')
    return quizData
  }

  function publishQuiz() {
    if (!quiz.title.trim()) {
      toast.error('Please enter a quiz title')
      return
    }

    if (quiz.questions.length === 0) {
      toast.error('Please add at least one question')
      return
    }

    const quizData: TeacherQuizItem = {
      id: Date.now(),
      title: quiz.title,
      subject: quiz.subject || 'Not specified',
      description: quiz.description || '',
      dueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      class: classId.value,
      submitted: 0,
      total: 0,
      color: 'blue',
      status: 'published',
      questions: JSON.parse(JSON.stringify(quiz.questions)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const quizzes = getStoredQuizzes()
    quizzes.push(quizData)
    localStorage.setItem('quizzes', JSON.stringify(quizzes))
    
    toast.success('Quiz published successfully!')
    return quizData
  }

  function getStoredQuizzes(): TeacherQuizItem[] {
    try {
      const stored = localStorage.getItem('quizzes')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading quizzes from localStorage:', error)
      return []
    }
  }

  return {
    quiz,
    classId,
    currentQuestion,
    hasQuestions,
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
    publishQuiz,
    getStoredQuizzes
  }
}
