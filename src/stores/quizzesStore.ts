import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { TeacherQuizItem, StudentQuizItem, QuizQuestion } from '../interfaces/interfaces'
import { useAuthStore } from './authStore'

export const useQuizzesStore = defineStore('quizzes', () => {
  const teacherQuizzesByUser = ref<Record<string, TeacherQuizItem[]>>({
    '0112345678': [
      { id: 1, subject: 'Information Assurance', title: 'Week 1 Quiz', description: '', dueDate: 'May 15', class: 'CS31A', submitted: 12, total: 24, color: 'blue' },
      { id: 2, subject: 'Information Assurance', title: 'Week 2 Quiz', description: '', dueDate: 'May 18', class: 'CS31A', submitted: 8, total: 24, color: 'green' },
      { id: 3, subject: 'Computer Architecture', title: 'Week 5 Quiz', description: '', dueDate: 'May 20', class: 'CS31A', submitted: 3, total: 24, color: 'purple' },
      { id: 4, subject: 'Operating Systems', title: 'Process Management Quiz', description: '', dueDate: 'May 25', class: 'CS31B', submitted: 17, total: 28, color: 'red' },
      { id: 5, subject: 'Automata', title: 'PDA and CFG Quiz', description: '', dueDate: 'May 28', class: 'CS31C', submitted: 9, total: 22, color: 'yellow' },
    ],
  })

  const studentQuizzesByUser = ref<Record<string, StudentQuizItem[]>>({
    '0212345678': [
      { id: 1, subject: 'Information Assurance', title: 'Week 1 Quiz', description: '', dueDate: 'May 15', class: 'CS31A', timeLimit: '45 min', status: 'Not Started', color: 'blue' },
      { id: 2, subject: 'Information Assurance', title: 'Week 2 Quiz', description: '', dueDate: 'May 18', class: 'CS31A', timeLimit: '30 min', status: 'Not Started', color: 'green' },
      { id: 3, subject: 'Computer Architecture', title: 'Week 5 Quiz', description: '', dueDate: 'May 20', class: 'CS31A', timeLimit: '25 min', status: 'Not Started', color: 'purple' },
      { id: 4, subject: 'Web Development', title: 'Flexbox & Grid Quiz', description: '', dueDate: 'May 22', class: 'WD101', timeLimit: '20 min', status: 'Not Started', color: 'indigo' },
    ],
  })

  const currentQuiz = reactive({
    title: '',
    subject: '',
    timeLimit: '',
    description: '',
    questions: [] as QuizQuestion[],
    currentQuestionIndex: -1
  })

  const auth = useAuthStore()

  const myTeacherQuizzes = computed<TeacherQuizItem[]>(() => {
    const uname = auth.currentUser?.username
    if (!uname) return []
    return teacherQuizzesByUser.value[uname] || []
  })

  const myStudentQuizzes = computed<StudentQuizItem[]>(() => {
    const uname = auth.currentUser?.username
    if (!uname) return []
    return studentQuizzesByUser.value[uname] || []
  })

  const currentQuestion = computed(() => {
    if (currentQuiz.currentQuestionIndex === -1) return null
    return currentQuiz.questions[currentQuiz.currentQuestionIndex]
  })

  const hasQuestions = computed(() => currentQuiz.questions.length > 0)

  function addQuestion(question: QuizQuestion) {
    currentQuiz.questions.push(question)
    selectQuestion(currentQuiz.questions.length - 1)
  }

  function selectQuestion(index: number) {
    currentQuiz.currentQuestionIndex = index
  }

  function deleteQuestion(index: number) {
    if (index < 0 || index >= currentQuiz.questions.length) return
    currentQuiz.questions.splice(index, 1)
    if (currentQuiz.questions.length === 0) {
      currentQuiz.currentQuestionIndex = -1
    } else if (currentQuiz.currentQuestionIndex >= index) {
      currentQuiz.currentQuestionIndex = Math.max(0, currentQuiz.currentQuestionIndex - 1)
    }
  }

  function duplicateQuestion(index: number) {
    const q = currentQuiz.questions[index]
    if (!q) return
    const clone = JSON.parse(JSON.stringify(q)) as QuizQuestion
    clone.id = Date.now()
    currentQuiz.questions.splice(index + 1, 0, clone)
    selectQuestion(index + 1)
  }

  function moveQuestion(direction: 'up' | 'down') {
    const idx = currentQuiz.currentQuestionIndex
    if (idx === -1) return
    const newIndex = direction === 'up' ? idx - 1 : idx + 1
    if (newIndex < 0 || newIndex >= currentQuiz.questions.length) return
    const [q] = currentQuiz.questions.splice(idx, 1)
    currentQuiz.questions.splice(newIndex, 0, q)
    selectQuestion(newIndex)
  }

  function shuffleOptions() {
    if (!currentQuestion.value || !currentQuestion.value.options) return
    currentQuestion.value.options = [...currentQuestion.value.options]
      .map(v => ({ sort: Math.random(), value: v }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }

  function updateQuestionProperty(key: keyof QuizQuestion, value: any) {
    if (!currentQuestion.value) return
    (currentQuestion.value as any)[key] = value
  }

  function updateCurrentQuestionType(newType: string) {
    if (!currentQuestion.value) return
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

  function saveQuiz(status: 'draft' | 'published' = 'draft') {
    if (!currentQuiz.title.trim()) {
      throw new Error('Quiz title is required')
    }
    if (currentQuiz.questions.length === 0) {
      throw new Error('Quiz must have at least one question')
    }

    const auth = useAuthStore()
    const username = auth.currentUser?.username
    if (!username) {
      throw new Error('User not authenticated')
    }

    const quizItem: TeacherQuizItem = {
      id: Date.now(),
      title: currentQuiz.title,
      subject: currentQuiz.subject,
      description: currentQuiz.description,
      dueDate: '',
      class: '',
      submitted: 0,
      total: 0,
      color: 'blue',
      status,
      questions: JSON.parse(JSON.stringify(currentQuiz.questions)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const quizzes = getAllQuizzes()
    quizzes.push(quizItem)
    saveQuizzesToStorage(quizzes)

    return quizItem
  }

  function deleteQuiz(quizId: number) {
    const quizzes = getAllQuizzes()
    const filtered = quizzes.filter(q => q.id !== quizId)
    saveQuizzesToStorage(filtered)
  }

  function loadQuizForEditing(quizId: number) {
    const quizzes = getAllQuizzes()
    const quiz = quizzes.find(q => q.id === quizId)
    if (!quiz) return false

    currentQuiz.title = quiz.title
    currentQuiz.subject = quiz.subject
    currentQuiz.description = quiz.description
    currentQuiz.timeLimit = ''
    currentQuiz.questions = quiz.questions ? JSON.parse(JSON.stringify(quiz.questions)) : []
    currentQuiz.currentQuestionIndex = currentQuiz.questions.length > 0 ? 0 : -1

    return true
  }

  function resetCurrentQuiz() {
    currentQuiz.title = ''
    currentQuiz.subject = ''
    currentQuiz.timeLimit = ''
    currentQuiz.description = ''
    currentQuiz.questions = []
    currentQuiz.currentQuestionIndex = -1
  }

  function getAllQuizzes(): TeacherQuizItem[] {
    try {
      const stored = localStorage.getItem('quizzes')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading quizzes from localStorage:', error)
      return []
    }
  }

  function loadQuizzesFromStorage(): TeacherQuizItem[] {
    return getAllQuizzes()
  }

  function saveQuizzesToStorage(quizzes: TeacherQuizItem[]) {
    try {
      localStorage.setItem('quizzes', JSON.stringify(quizzes))
    } catch (error) {
      console.error('Error saving quizzes to localStorage:', error)
      throw new Error('Failed to save quizzes')
    }
  }

  return {
    myTeacherQuizzes,
    myStudentQuizzes,
    currentQuiz,
    currentQuestion,
    hasQuestions,
    addQuestion,
    selectQuestion,
    deleteQuestion,
    duplicateQuestion,
    moveQuestion,
    shuffleOptions,
    updateQuestionProperty,
    updateCurrentQuestionType,
    saveQuiz,
    deleteQuiz,
    loadQuizForEditing,
    resetCurrentQuiz,
    getAllQuizzes,
    loadQuizzesFromStorage,
    saveQuizzesToStorage
  }
})
