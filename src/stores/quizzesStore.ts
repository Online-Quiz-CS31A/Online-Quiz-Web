import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { TeacherQuizItem, StudentQuizItem, QuizQuestion, ReviewQuestion, QuizAttemptHistory } from '../interfaces/interfaces'
import { useAuthStore } from './authStore'
import { useCoursesStore } from './coursesStore'
import * as quizService from '../services/quizService'
import type { QuizPayload, StudentQuizDto } from '../services/types'

export const useQuizzesStore = defineStore('quizzes', () => {
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isPublishing = ref(false)
  const teacherQuizzesByUser = ref<Record<string, TeacherQuizItem[]>>({})

  const currentQuiz = reactive({
    id: null as number | null,
    title: '',
    subject: '',
    timeLimit: '',
    description: '',
    questions: [] as QuizQuestion[],
    currentQuestionIndex: -1,
    assignedSections: [] as string[],
    assignedCourseIds: [] as number[],
    quizIdsGroup: [] as number[],
  })

  const currentAttempt = reactive({
    quizId: null as number | null,
    quizTitle: '',
    questionsLength: 0,
    answeredSet: new Set<number>() as Set<number>,
    answers: {} as Record<number, unknown>,
    startAtISO: null as string | null,
    endAtISO: null as string | null,
    durationSeconds: 0,
    isOngoing: false,
    isHistoricalReview: false
  })

  const quizAttemptHistory = ref<QuizAttemptHistory[]>([])
  const quizDoneMap = ref<Record<string, boolean>>({})
  const quizzesVersion = ref(0)
  const archivedSeedQuizIds = ref<number[]>([])
  const submittedQuizIds = ref<Set<number>>(new Set())
  let quizDoneLoaded = false
  let attemptHistoryLoaded = false

  const auth = useAuthStore()

  loadArchivedSeedQuizzesFromStorage()

  const myTeacherQuizzes = computed<TeacherQuizItem[]>(() => {
    const uname = auth.currentUser?.username
    if (!uname) return []
    return teacherQuizzesByUser.value[uname] || []
  })

  const myTeacherSubjects = computed<string[]>(() => {
    const uname = auth.currentUser?.username
    if (!uname) return []

    const subjects = new Set<string>()

    const defaultQuizzes = teacherQuizzesByUser.value[uname] || []
    defaultQuizzes.forEach(q => {
      if (q.subject) {
        subjects.add(q.subject)
      }
    })

    return Array.from(subjects)
  })

  const studentQuizzesFromApi = ref<StudentQuizItem[]>([])

  const myStudentQuizzes = computed<StudentQuizItem[]>(() => {
    return studentQuizzesFromApi.value
  })

  async function fetchStudentQuizzesAsync() {
    const authLocal = useAuthStore()
    const user = authLocal.currentUser
    if (!user || user.role !== 'student' || !user.id) return

    const coursesStoreLocal = useCoursesStore()
    const courses = coursesStoreLocal.allCourses.filter(c => c.status !== 'Archived')

    // Fetch submitted attempts from backend to determine quiz status
    try {
      const api = await import('../services/api')
      const attemptsResponse = await api.default.get(`/Attempt/student/${user.id}`)
      if (attemptsResponse.data && Array.isArray(attemptsResponse.data)) {
        const newSubmittedIds = new Set<number>()
        attemptsResponse.data.forEach((attempt: { quizId: number; submittedAt: string | null }) => {
          if (attempt.submittedAt) {
            newSubmittedIds.add(attempt.quizId)
          }
        })
        submittedQuizIds.value = newSubmittedIds
      }
    } catch (error) {
      console.error('Failed to fetch student attempts:', error)
    }

    // Fetch student's enrolled sections to get section information
    const studentSections: Record<number, string> = {}
    try {
      const api = await import('../services/api')
      const enrollmentsResponse = await api.default.get(`/Enrollment/student/${user.id}`)
      if (enrollmentsResponse.data && Array.isArray(enrollmentsResponse.data)) {
        // Map courseId to section name
        enrollmentsResponse.data.forEach((enrollment: { courseId: number; section?: string; sectionName?: string }) => {
          // The section is a direct string property, not nested
          const sectionName = enrollment.section || enrollment.sectionName || ''
          studentSections[enrollment.courseId] = sectionName
        })
      }
    } catch (error) {
      console.error('Failed to fetch student enrollments:', error)
    }

    const results = await Promise.all(
      courses.map(async (course) => {
        try {
          const response = await quizService.getQuizzesForCourse(course.id, user.id!, true)
          const quizzesData = response.data || response || []

          const arr = Array.isArray(quizzesData) ? quizzesData : []
          return arr.map((quiz: StudentQuizDto) => {
            if (!quiz) return null

            // Get section from student's enrollment or from quiz data
            const sectionName = studentSections[course.id] ||
                               quiz.sectionName ||
                               (quiz.section && quiz.section.name) ||
                               ''

            return {
              id: quiz.quizId || quiz.id || 0,
              subject: course.name,
              title: quiz.title,
              description: quiz.description || '',
              dueDate: quiz.dueAt || quiz.dueDate || '',
              class: '',
              timeLimit: quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : '30 min',
              status: 'Not Started',
              color: 'blue',
              maxAttempts: quiz.maxAttempts || 3,
              courseCode: course.code || '',
              courseSection: sectionName
            }
          }).filter(Boolean) as StudentQuizItem[]
        } catch (e) {
          console.error(`Failed to load quizzes for course ${course.id}`, e)
          return []
        }
      })
    )

    studentQuizzesFromApi.value = results.flat()
  }

  function loadArchivedSeedQuizzesFromStorage() {
    try {
      const stored = localStorage.getItem('archivedSeedQuizzes')
      const ids = stored ? (JSON.parse(stored) as number[]) : []
      archivedSeedQuizIds.value = ids

      Object.values(teacherQuizzesByUser.value).forEach(list => {
        list.forEach(q => {
          if (q.archived) {
            q.archived = false
          }
        })
      })

      if (ids.length > 0) {
        Object.values(teacherQuizzesByUser.value).forEach(list => {
          list.forEach(q => {
            if (ids.includes(q.id)) {
              q.archived = true
            }
          })
        })
      }
    } catch (e) {
      console.error('Failed to load archivedSeedQuizzes from localStorage:', e)
      archivedSeedQuizIds.value = []
    }
  }

  function saveArchivedSeedQuizzesToStorage() {
    try {
      localStorage.setItem('archivedSeedQuizzes', JSON.stringify(archivedSeedQuizIds.value))
    } catch (e) {
      console.error('Failed to save archivedSeedQuizzes to localStorage:', e)
    }
  }

  function loadQuizDoneFromStorage() {
    if (quizDoneLoaded) return
    quizDoneLoaded = true
  }

  function saveQuizDoneToStorage() {

  }

  function getQuizDoneKey(quizId: number): string | null {
    const auth = useAuthStore()
    const username = auth.currentUser?.username
    if (!username) return null
    return `${username}:${quizId}`
  }

  function isQuizMarkedDone(quizId: number): boolean {
    loadQuizDoneFromStorage()
    const key = getQuizDoneKey(quizId)
    if (!key) return false
    return !!quizDoneMap.value[key]
  }

  function toggleQuizDone(quizId: number) {
    loadQuizDoneFromStorage()
    const key = getQuizDoneKey(quizId)
    if (!key) return
    quizDoneMap.value[key] = !quizDoneMap.value[key]
    saveQuizDoneToStorage()
  }

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

  function updateQuestionProperty(key: keyof QuizQuestion, value: unknown) {
    if (!currentQuestion.value) return
    (currentQuestion.value as Record<string, unknown>)[key] = value
  }

  function updateCurrentQuestionType(newType: string) {
    if (!currentQuestion.value) return
    currentQuestion.value.type = newType
    currentQuestion.value.options = []
    currentQuestion.value.pairs = []
    currentQuestion.value.items = []
    currentQuestion.value.correctAnswer = ''

    switch (newType) {
      case 'multiple-choice':
        currentQuestion.value.options = [
          { text: '', isCorrect: true, imageUrl: '' },
          { text: '', isCorrect: false, imageUrl: '' },
          { text: '', isCorrect: false, imageUrl: '' },
          { text: '', isCorrect: false, imageUrl: '' }
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
          { left: '', right: '' },
          { left: '', right: '' }
        ]
        break
      case 'enumeration':
        currentQuestion.value.items = ['', '']
        break
    }
  }

  async function saveQuiz(status: 'draft' | 'published' = 'draft', courseIdsOverride?: number[]) {
    if (status === 'published') {
      isPublishing.value = true
    } else {
      isSaving.value = true
    }

    try {
      if (!currentQuiz.title.trim()) {
        throw new Error('Quiz title is required')
      }
      if (currentQuiz.questions.length === 0) {
        throw new Error('Quiz must have at least one question')
      }

      for (let i = 0; i < currentQuiz.questions.length; i++) {
        const q = currentQuiz.questions[i]

        if (!q.text || !q.text.trim()) {
          throw new Error(`Question ${i + 1} cannot be empty`)
        }

        if (q.type === 'multiple-choice') {
          if (!q.options || q.options.length < 2) {
            throw new Error(`Multiple choice question ${i + 1} must have at least 2 options`)
          }

          const hasEmptyOption = q.options.some(opt => !opt.text || !opt.text.trim())
          if (hasEmptyOption) {
            throw new Error(`All options in question ${i + 1} must have text`)
          }
        }

        if (q.type === 'enumeration') {
          if (!q.items || q.items.length < 2) {
            throw new Error(`Enumeration question ${i + 1} must have at least 2 items`)
          }

          const hasEmptyItem = q.items.some(item => !item || !item.trim())
          if (hasEmptyItem) {
            throw new Error(`All items in enumeration question ${i + 1} must have text`)
          }
        }

        if (q.type === 'matching') {
          if (!q.pairs || q.pairs.length < 2) {
            throw new Error(`Matching question ${i + 1} must have at least 2 pairs`)
          }

          const hasEmptyPair = q.pairs.some(p => !p.left || !p.left.trim() || !p.right || !p.right.trim())
          if (hasEmptyPair) {
            throw new Error(`All pairs in matching question ${i + 1} must have both sides filled`)
          }
        }
      }

      const auth = useAuthStore()
      const username = auth.currentUser?.username
      const userId = auth.currentUser?.id
      if (!username || !userId) {
        throw new Error('User not authenticated')
      }

      const coursesStoreLocal = useCoursesStore()
      const rawSubject = (currentQuiz.subject || '').trim().toLowerCase()

      let targetCourseIds = courseIdsOverride && courseIdsOverride.length > 0 ? courseIdsOverride : []

      if (targetCourseIds.length === 0) {
        const matchingRawCourses = coursesStoreLocal.rawTeacherCourses.filter(c =>
          (c.name || '').trim().toLowerCase() === rawSubject ||
          (c.code || '').trim().toLowerCase() === rawSubject
        )

        if (currentQuiz.assignedSections && currentQuiz.assignedSections.length > 0) {
          const selectedSections = currentQuiz.assignedSections.map(s => s.trim().toLowerCase())
          targetCourseIds = matchingRawCourses
            .filter(c => c.section && selectedSections.includes(c.section.trim().toLowerCase()))
            .map(c => c.courseId)
        } else if (matchingRawCourses.length > 0) {
          targetCourseIds = [matchingRawCourses[0].courseId]
        }
      }

      if (status === 'published') {
        if (!rawSubject) {
          throw new Error('Please select a valid course before publishing')
        }
        if (targetCourseIds.length === 0) {
          throw new Error('Please select at least one section before publishing')
        }
      }

      const timeLimitValue = currentQuiz.timeLimit ? String(currentQuiz.timeLimit) : '30'
      const timeLimitMatch = timeLimitValue.match(/\d+/)
      const timeLimitMinutes = timeLimitMatch ? parseInt(timeLimitMatch[0], 10) : 30

      const mappedQuestions = currentQuiz.questions.map((q, idx) => {
        let mappedType = q.type
        if (q.type === 'multiple-choice') {
          mappedType = 'Multiple'
        } else if (q.type === 'true-false') {
          mappedType = 'Single'
        }

        return {
          questionId: typeof q.id === 'string' ? 0 : (q.id > 1000000 ? 0 : q.id),
          quizId: currentQuiz.id ?? 0,
          type: mappedType,
          body: q.text,
          points: q.points || 1,
          sortOrder: idx + 1,
          choices: q.options ? q.options.map((opt) => ({
            choiceId: 0,
            questionId: typeof q.id === 'string' ? 0 : (q.id > 1000000 ? 0 : q.id),
            body: opt.text,
            isCorrect: opt.isCorrect
          })) : []
        }
      })

      const payloadTemplate: Omit<QuizPayload, 'courseId' | 'quizId'> & { createdBy?: number } = {
        title: currentQuiz.title,
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        timeLimitMinutes: timeLimitMinutes,
        isPublished: status === 'published',
        createdAt: new Date().toISOString(),
        questions: mappedQuestions
      }

      const isCreatingNew = !currentQuiz.id;

      for (let i = 0; i < targetCourseIds.length; i++) {
        const cid = targetCourseIds[i]

        if (isCreatingNew) {
          const currentPayload: QuizPayload = { ...payloadTemplate, courseId: cid, quizId: 0, createdBy: userId }
          const response = await quizService.createQuiz(currentPayload)

          if (i === 0 && response && (response.quizId || response.id)) {
            currentQuiz.id = response.quizId || response.id || null
          }
          if (response && (response.quizId || response.id)) {
            if (!currentQuiz.quizIdsGroup) currentQuiz.quizIdsGroup = []
            const newId = response.quizId || response.id
            if (newId && !currentQuiz.quizIdsGroup.includes(newId)) {
              currentQuiz.quizIdsGroup.push(newId)
            }
          }
        } else {
          const existingQuizId = (currentQuiz.quizIdsGroup && currentQuiz.quizIdsGroup.length > i)
            ? currentQuiz.quizIdsGroup[i]
            : (i === 0 ? currentQuiz.id : null)

          if (existingQuizId) {
            const currentPayload: QuizPayload = { ...payloadTemplate, courseId: cid, quizId: existingQuizId }
            await quizService.updateQuiz(existingQuizId, userId, currentPayload)
          } else {
            const currentPayload: QuizPayload = { ...payloadTemplate, courseId: cid, quizId: 0, createdBy: userId }
            const response = await quizService.createQuiz(currentPayload)
            if (response && (response.quizId || response.id)) {
              if (!currentQuiz.quizIdsGroup) currentQuiz.quizIdsGroup = []
              const newId = response.quizId || response.id
              if (newId && !currentQuiz.quizIdsGroup.includes(newId)) {
                currentQuiz.quizIdsGroup.push(newId)
              }
            }
          }
        }
      }

      const id = currentQuiz.id != null ? currentQuiz.id : Date.now()
      const allSeedQuizzes = Object.values(teacherQuizzesByUser.value).flat()
      const seedQuiz = allSeedQuizzes.find(q => q.id === id)

      const quizItem: TeacherQuizItem = {
        id,
        title: currentQuiz.title,
        subject: currentQuiz.subject,
        description: currentQuiz.description,
        dueDate: seedQuiz ? seedQuiz.dueDate : payloadTemplate.dueAt,
        class: seedQuiz ? seedQuiz.class : '',
        submitted: seedQuiz ? seedQuiz.submitted : 0,
        total: seedQuiz ? seedQuiz.total : 0,
        color: seedQuiz ? seedQuiz.color : 'blue',
        status,
        questions: JSON.parse(JSON.stringify(currentQuiz.questions)),
        createdAt: seedQuiz ? seedQuiz.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerUsername: username
      }

      currentQuiz.id = quizItem.id

      if (!teacherQuizzesByUser.value[username]) {
        teacherQuizzesByUser.value[username] = []
      }
      const userQuizzes = teacherQuizzesByUser.value[username]
      const mIdx = userQuizzes.findIndex(q => q.id === quizItem.id)
      if (mIdx !== -1) {
        userQuizzes[mIdx] = quizItem
      } else {
        userQuizzes.push(quizItem)
      }

      return quizItem
    } finally {
      isSaving.value = false
      isPublishing.value = false
    }
  }

  async function deleteQuiz(quizId: number) {
    try {
      await quizService.deleteQuiz(quizId)
    } catch (e) {
      console.error('Failed to delete quiz:', e)
    }

    Object.keys(teacherQuizzesByUser.value).forEach(list => {
      teacherQuizzesByUser.value[list] = teacherQuizzesByUser.value[list].filter(q => q.id !== quizId)
    })
  }

  function archiveQuiz(quizId: number) {
    let seedMutated = false
    Object.values(teacherQuizzesByUser.value).forEach(list => {
      list.forEach(q => {
        if (q.id === quizId) {
          q.archived = true
          if (!archivedSeedQuizIds.value.includes(quizId)) {
            archivedSeedQuizIds.value.push(quizId)
            seedMutated = true
          }
        }
      })
    })
    if (seedMutated) {
      saveArchivedSeedQuizzesToStorage()
      quizzesVersion.value++
    }
  }

  function saveQuizAssignment(
    quizId: number,
    payload: {
      dueDate?: string
      sectionName?: string
      sectionNames?: string[]
      timeLimitMinutes?: number
      maxAttempts?: number
    }
  ) {
    if (!quizId) return

    const allSeed = Object.values(teacherQuizzesByUser.value).flat()
    const seedQuiz = allSeed.find(q => q.id === quizId)

    if (seedQuiz) {
      if (payload.dueDate != null) {
        seedQuiz.dueDate = payload.dueDate
      }

      if (payload.sectionNames && Array.isArray(payload.sectionNames)) {
        const unique = Array.from(new Set(payload.sectionNames.filter(Boolean)))
        seedQuiz.assignedSections = unique
        if (unique.length > 0) {
          seedQuiz.class = unique[0]
        }
      } else if (payload.sectionName != null) {
        seedQuiz.class = payload.sectionName
        seedQuiz.assignedSections = payload.sectionName ? [payload.sectionName] : []
      }

      if (payload.timeLimitMinutes != null) {
        seedQuiz.timeLimit = `${payload.timeLimitMinutes} min`
      }
      if (payload.maxAttempts != null) {
        seedQuiz.maxAttempts = payload.maxAttempts
      }
    }
  }

  function unarchiveQuizzesForCourse(courseName: string) {
    if (!courseName) return

    const ids = new Set<number>()

    Object.values(teacherQuizzesByUser.value).forEach(list => {
      list.forEach(q => {
        if (q.subject === courseName && q.archived) ids.add(q.id)
      })
    })

    ids.forEach(id => unarchiveQuiz(id))
  }

  function archiveQuizzesForCourse(courseName: string) {
    if (!courseName) return

    const ids = new Set<number>()

    Object.values(teacherQuizzesByUser.value).forEach(list => {
      list.forEach(q => {
        if (q.subject === courseName) ids.add(q.id)
      })
    })

    ids.forEach(id => archiveQuiz(id))
  }

  function unarchiveQuiz(quizId: number) {
    let seedMutated = false
    Object.values(teacherQuizzesByUser.value).forEach(list => {
      list.forEach(q => {
        if (q.id === quizId && q.archived) {
          q.archived = false
          seedMutated = true
        }
      })
    })

    if (archivedSeedQuizIds.value.includes(quizId)) {
      archivedSeedQuizIds.value = archivedSeedQuizIds.value.filter(id => id !== quizId)
      seedMutated = true
    }

    if (seedMutated) {
      saveArchivedSeedQuizzesToStorage()
      quizzesVersion.value++
    }
  }

  function loadQuizForEditing(quizId: number) {
    const quiz = myTeacherQuizzes.value.find(q => q.id === quizId)

    if (!quiz) return false

    currentQuiz.id = quiz.id
    currentQuiz.title = quiz.title
    currentQuiz.subject = quiz.subject
    currentQuiz.description = quiz.description || ''
    currentQuiz.timeLimit = quiz.timeLimit || ''
    currentQuiz.assignedSections = Array.isArray(quiz.assignedSections)
      ? [...quiz.assignedSections]
      : (quiz.class ? [quiz.class] : [])

    const rawQuestions = quiz.questions ? JSON.parse(JSON.stringify(quiz.questions)) : []
    currentQuiz.questions = rawQuestions.map((q: QuizQuestion | Record<string, unknown>) => {
      if ('text' in q && q.text !== undefined) return q as QuizQuestion
      return mapApiQuestionToFrontend(q)
    })
    currentQuiz.currentQuestionIndex = currentQuiz.questions.length > 0 ? 0 : -1

    return true
  }

  async function loadQuizForEditingAsync(quizId: number): Promise<boolean> {
    if (loadQuizForEditing(quizId)) {
      return true
    }

    const authLocal = useAuthStore()
    const userId = authLocal.currentUser?.id
    if (userId) {
      try {
        const detail = await fetchQuizDetail(quizId, userId)
        if (detail) {
          const coursesStoreLocal = useCoursesStore()
          const course = coursesStoreLocal.allCourses.find(c => c.id === detail.courseId)

          currentQuiz.id = detail.quizId || detail.id || quizId
          currentQuiz.title = detail.title || ''
          currentQuiz.subject = course?.name || detail.courseName || (detail.course && detail.course.name) || ''
          currentQuiz.description = detail.description || ''
          currentQuiz.timeLimit = detail.timeLimitMinutes ? `${detail.timeLimitMinutes} min` : ''
          const rawQs = Array.isArray(detail.questions) ? detail.questions : []
          currentQuiz.questions = rawQs.map(mapApiQuestionToFrontend)
          currentQuiz.currentQuestionIndex = currentQuiz.questions.length > 0 ? 0 : -1
          return true
        }
      } catch (e) {
        console.error(`Failed to load full quiz from API for ID ${quizId}`, e)
      }
    }

    return false
  }

  function resetCurrentQuiz() {
    currentQuiz.id = null
    currentQuiz.title = ''
    currentQuiz.subject = ''
    currentQuiz.timeLimit = ''
    currentQuiz.description = ''
    currentQuiz.questions = []
    currentQuiz.currentQuestionIndex = -1
    currentQuiz.assignedSections = []
  }

  function getAllQuizzes(): TeacherQuizItem[] {
    return []
  }

  function loadQuizzesFromStorage(): TeacherQuizItem[] {
    return []
  }

  function saveQuizzesToStorage() {
    // Placeholder for future implementation
  }

  function getStudentQuizQuestions(quizId: number): QuizQuestion[] {
    try {
      const allSeedQuizzes = Object.values(teacherQuizzesByUser.value).flat()
      const seedQuiz = allSeedQuizzes.find(q => q.id === quizId)

      if (seedQuiz && seedQuiz.questions) {
        return JSON.parse(JSON.stringify(seedQuiz.questions))
      }

      console.warn('Quiz not found in teacherQuizzesByUser for ID:', quizId)
      return []
    } catch (error) {
      console.error('Error in getStudentQuizQuestions:', error)
      return []
    }
  }

  function startAttempt(quizId: number, quizTitle: string, questionsLength: number, durationSeconds: number = 0) {
    currentAttempt.quizId = quizId
    currentAttempt.quizTitle = quizTitle
    currentAttempt.questionsLength = questionsLength
    currentAttempt.answeredSet = new Set<number>()
    currentAttempt.answers = {}
    currentAttempt.startAtISO = new Date().toISOString()
    currentAttempt.endAtISO = null
    currentAttempt.durationSeconds = durationSeconds
    currentAttempt.isOngoing = true
    currentAttempt.isHistoricalReview = false
    // No longer saving to localStorage - data is managed via backend API
  }

  function markAnswered(index: number) {
    if (index >= 0 && index < currentAttempt.questionsLength) {
      currentAttempt.answeredSet.add(index)
    }
  }

  function isAnswered(index: number): boolean {
    return currentAttempt.answeredSet.has(index)
  }

  function setAnswer(index: number, optionIndex: number) {
    if (index >= 0 && index < currentAttempt.questionsLength) {
      currentAttempt.answers[index] = optionIndex
      markAnswered(index)
      // No longer saving to localStorage - data is saved via backend API in QuizView
    }
  }

  function setTextAnswer(index: number, text: string) {
    if (index >= 0 && index < currentAttempt.questionsLength) {
      currentAttempt.answers[index] = text
      if (text.trim()) {
        markAnswered(index)
      }
      // No longer saving to localStorage - data is saved via backend API in QuizView
    }
  }

  function setEnumerationAnswer(index: number, items: string[]) {
    if (index >= 0 && index < currentAttempt.questionsLength) {
      currentAttempt.answers[index] = items
      if (items.some(item => item.trim())) {
        markAnswered(index)
      }
    }
  }

  function setMatchingAnswer(index: number, pairs: Record<number, number>) {
    if (index >= 0 && index < currentAttempt.questionsLength) {
      currentAttempt.answers[index] = pairs
      if (Object.keys(pairs).length > 0) {
        markAnswered(index)
      }
    }
  }

  function setFillBlankAnswer(index: number, blanks: string[]) {
    if (index >= 0 && index < currentAttempt.questionsLength) {
      currentAttempt.answers[index] = blanks
      if (blanks.some(blank => blank.trim())) {
        markAnswered(index)
      }
    }
  }

  function getReviewQuestions(): ReviewQuestion[] {
    const scoreItems = getScoreItems()
    return Array.from({ length: currentAttempt.questionsLength }, (_, i) => ({
      id: i + 1,
      answered: isAnswered(i),
      isCorrect: scoreItems[i]?.isCorrect ?? false
    }))
  }

  interface ScoreItem {
    question: string
    options: string[]
    correctAnswer: number
    userAnswer: unknown
    isCorrect: boolean
    points: number
    questionType?: string
    correctAnswerText?: string
    userAnswerText?: string
    matchingPairs?: Array<{
      left: string
      right: string
      userIndex?: number
      userRight?: string
      isCorrect: boolean
    }>
  }

  function getScoreItems(): ScoreItem[] {
    if (currentAttempt.quizId == null) {
      return []
    }

    const quizQuestions = getStudentQuizQuestions(currentAttempt.quizId)

    if (!quizQuestions || quizQuestions.length === 0) {
      console.warn('No quiz questions found for quiz ID:', currentAttempt.quizId)
      return []
    }

    return quizQuestions.map((q, i) => {
      const rawUserAnswer = (i in currentAttempt.answers) ? currentAttempt.answers[i] : null

      if ((q.type === 'multiple-choice' || q.type === 'true-false') && q.options && q.options.length > 0) {
        const options = q.options.map(opt => opt.text)
        const idx = q.options.findIndex(opt => opt.isCorrect)
        const correctIndex = idx >= 0 ? idx : 0
        const isCorrect = rawUserAnswer !== null && rawUserAnswer === correctIndex

        return {
          question: q.text,
          options,
          correctAnswer: correctIndex,
          userAnswer: rawUserAnswer,
          isCorrect,
          points: q.points ?? 0,
          questionType: q.type
        }
      }

      if (q.type === 'fill-blank') {
        const correctTextRaw = q.correctAnswer || ''
        const correctText = correctTextRaw.trim().toLowerCase()

        let userText = ''
        if (Array.isArray(rawUserAnswer) && rawUserAnswer.length > 0) {
          userText = String(rawUserAnswer[0] ?? '')
        } else if (typeof rawUserAnswer === 'string') {
          userText = rawUserAnswer
        }

        const normalizedUser = userText.trim().toLowerCase()
        const isCorrect = !!correctText && normalizedUser === correctText

        return {
          question: q.text,
          options: [],
          correctAnswer: 0,
          userAnswer: userText,
          isCorrect,
          points: q.points ?? 0,
          questionType: q.type,
          correctAnswerText: correctTextRaw,
          userAnswerText: userText
        }
      }

      if (q.type === 'text') {
        const userText = rawUserAnswer != null ? String(rawUserAnswer) : ''
        const trimmed = userText.trim()
        const sentences = trimmed
          ? trimmed
            .split(/[.!?\n]+/)
            .map(s => s.trim())
            .filter(Boolean)
          : []
        let isCorrect = false
        if (sentences.length >= 3) {
          const allSentencesLongEnough = sentences.every(sentence => {
            const words = sentence
              .split(/\s+/)
              .map(w => w.trim())
              .filter(Boolean)
            return words.length >= 3
          })
          isCorrect = allSentencesLongEnough
        }

        return {
          question: q.text,
          options: [],
          correctAnswer: 0,
          userAnswer: userText,
          isCorrect,
          points: q.points ?? 0,
          questionType: 'text',
          correctAnswerText: 'answer must be at least 3 sentences'
        }
      }

      if (q.type === 'matching' && Array.isArray(q.pairs) && q.pairs.length > 0) {
        const pairs = q.pairs
        const userMap: Record<number, number> =
          rawUserAnswer && typeof rawUserAnswer === 'object' && !Array.isArray(rawUserAnswer)
            ? (rawUserAnswer as Record<number, number>)
            : {}

        const matchingPairs = pairs.map((pair, leftIndex) => {
          const userIndex = userMap[leftIndex]
          const isPairCorrect = userIndex !== undefined && userIndex === leftIndex
          const userRight =
            userIndex !== undefined && userIndex >= 0 && userIndex < pairs.length
              ? pairs[userIndex].right
              : ''

          return {
            left: pair.left,
            right: pair.right,
            userIndex,
            userRight,
            isCorrect: isPairCorrect
          }
        })

        const isCorrect = matchingPairs.length > 0 && matchingPairs.every(p => p.isCorrect)

        return {
          question: q.text,
          options: [],
          correctAnswer: 0,
          userAnswer: userMap,
          isCorrect,
          points: (q.points ?? 0) * pairs.length,
          questionType: q.type,
          matchingPairs
        }
      }

      if (q.type === 'enumeration') {
        const items = Array.isArray(q.items) ? q.items : []
        const userItems = Array.isArray(rawUserAnswer)
          ? (rawUserAnswer as unknown[]).map(v => (v != null ? String(v) : ''))
          : Array(items.length).fill('')

        const normalize = (text: string) => text.trim().toLowerCase()
        const correctNormalized = items.map(i => normalize(String(i || ''))).filter(Boolean)
        const userNormalized = userItems.map(i => normalize(String(i || ''))).filter(Boolean)

        const correctSet = new Set(correctNormalized)
        const userSet = new Set(userNormalized)

        let allCorrect = correctSet.size > 0
        correctSet.forEach(val => {
          if (!userSet.has(val)) {
            allCorrect = false
          }
        })

        return {
          question: q.text,
          options: items,
          correctAnswer: 0,
          userAnswer: userItems,
          isCorrect: allCorrect,
          points: q.points ?? 0,
          questionType: q.type,
          correctAnswerText: undefined,
          userAnswerText: undefined
        }
      }

      return {
        question: q.text,
        options: ['Answer not displayed in quiz view'],
        correctAnswer: 0,
        userAnswer: rawUserAnswer,
        isCorrect: false,
        points: q.points ?? 0,
        questionType: q.type
      }
    })
  }

  function finishAttempt() {
    currentAttempt.endAtISO = new Date().toISOString()
    currentAttempt.isOngoing = false
    saveAttemptToStorage()
  }

  function saveAttemptToStorage() {
  }

  function loadAttemptFromStorage(): boolean {
    return false
  }

  function clearAttemptStorage() {
    currentAttempt.quizId = null
    currentAttempt.quizTitle = ''
    currentAttempt.questionsLength = 0
    currentAttempt.answeredSet = new Set<number>()
    currentAttempt.answers = {}
    currentAttempt.startAtISO = null
    currentAttempt.endAtISO = null
    currentAttempt.durationSeconds = 0
    currentAttempt.isOngoing = false
    currentAttempt.isHistoricalReview = false
  }

  function getRemainingSeconds(): number {
    if (!currentAttempt.startAtISO || !currentAttempt.isOngoing) return 0
    const start = new Date(currentAttempt.startAtISO).getTime()
    const now = Date.now()
    const elapsed = Math.floor((now - start) / 1000)
    const remaining = currentAttempt.durationSeconds - elapsed
    return Math.max(0, remaining)
  }

  function calculateScore(): { score: number; totalPoints: number; percentage: number } {
    if (currentAttempt.quizId == null) return { score: 0, totalPoints: 0, percentage: 0 }

    const quizQuestions = getStudentQuizQuestions(currentAttempt.quizId)
    let score = 0
    let totalPoints = 0

    quizQuestions.forEach((q, i) => {
      const basePoints = q.points || 0

      if (q.type === 'matching' && Array.isArray(q.pairs) && q.pairs.length > 0) {
        totalPoints += basePoints * q.pairs.length
      } else if (q.type === 'enumeration' && Array.isArray(q.items) && q.items.length > 0) {
        totalPoints += basePoints * q.items.length
      } else {
        totalPoints += basePoints
      }

      const userAnswer = currentAttempt.answers[i]

      if ((q.type === 'multiple-choice' || q.type === 'true-false') && q.options && q.options.length > 0) {
        const correctIndex = q.options.findIndex(opt => opt.isCorrect)
        if (userAnswer !== undefined && userAnswer === correctIndex) {
          score += q.points || 0
        }
      } else if (q.type === 'fill-blank') {
        const correctText = (q.correctAnswer || '').trim().toLowerCase()
        let userText = ''
        if (Array.isArray(userAnswer) && userAnswer.length > 0) {
          userText = String(userAnswer[0] ?? '')
        } else if (typeof userAnswer === 'string') {
          userText = userAnswer
        }
        const normalizedUser = userText.trim().toLowerCase()
        if (correctText && normalizedUser === correctText) {
          score += q.points || 0
        }
      } else if (q.type === 'text') {
        const userText = userAnswer != null ? String(userAnswer) : ''
        const trimmed = userText.trim()
        const sentences = trimmed
          ? trimmed
            .split(/[.!?\n]+/)
            .map(s => s.trim())
            .filter(Boolean)
          : []

        if (sentences.length >= 2 && sentences.length <= 3) {
          const allSentencesLongEnough = sentences.every(sentence => {
            const words = sentence
              .split(/\s+/)
              .map(w => w.trim())
              .filter(Boolean)
            return words.length >= 3
          })

          if (allSentencesLongEnough) {
            score += q.points || 0
          }
        }
      } else if (q.type === 'enumeration' && Array.isArray(q.items) && q.items.length > 0) {
        const items = q.items
        const userItems: string[] = Array.isArray(userAnswer)
          ? (userAnswer as unknown[]).map((v) => (v != null ? String(v) : ''))
          : []

        const normalize = (text: string) => text.trim().toLowerCase()
        const correctNormalized = items.map(item => normalize(String(item || ''))).filter(Boolean)
        const userNormalized = userItems.map(item => normalize(String(item || ''))).filter(Boolean)

        const userSet = new Set(userNormalized)

        let correctItemCount = 0
        const counted = new Set<string>()
        correctNormalized.forEach(val => {
          if (userSet.has(val) && !counted.has(val)) {
            correctItemCount += 1
            counted.add(val)
          }
        })

        if (correctItemCount > 0) {
          score += basePoints * correctItemCount
        }
      } else if (q.type === 'matching' && Array.isArray(q.pairs) && q.pairs.length > 0) {
        const pairs = q.pairs
        const userMap: Record<number, number> =
          userAnswer && typeof userAnswer === 'object' && !Array.isArray(userAnswer)
            ? (userAnswer as Record<number, number>)
            : {}

        const correctPairCount = pairs.reduce((count, _pair, leftIndex) => {
          const selectedIndex = userMap[leftIndex]
          if (selectedIndex !== undefined && selectedIndex === leftIndex) {
            return count + 1
          }
          return count
        }, 0)

        if (correctPairCount > 0) {
          score += basePoints * correctPairCount
        }
      }
    })

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
    return { score, totalPoints, percentage }
  }

  function saveAttemptToHistory() {
    const auth = useAuthStore()
    const username = auth.currentUser?.username

    if (!username || currentAttempt.quizId == null) return

    if (currentAttempt.isHistoricalReview) return

    loadAttemptHistoryFromStorage()

    const existingAttempts = quizAttemptHistory.value.filter(
      a => a.quizId === currentAttempt.quizId && a.studentUsername === username
    )
    const attemptNumber = existingAttempts.length + 1

    const { score, totalPoints, percentage } = calculateScore()

    const historyEntry: QuizAttemptHistory = {
      attemptNumber,
      quizId: currentAttempt.quizId,
      studentUsername: username,
      score,
      totalPoints,
      percentage,
      completedAt: new Date().toISOString(),
      answers: JSON.parse(JSON.stringify(currentAttempt.answers)),
      durationSeconds: currentAttempt.durationSeconds || undefined
    }

    quizAttemptHistory.value.push(historyEntry)
    saveAttemptHistoryToStorage()
  }

  function getQuizAttemptHistory(quizId: number): QuizAttemptHistory[] {
    const auth = useAuthStore()
    const username = auth.currentUser?.username

    if (!username) return []

    loadAttemptHistoryFromStorage()

    return quizAttemptHistory.value.filter(
      a => a.quizId === quizId && a.studentUsername === username
    ).sort((a, b) => a.attemptNumber - b.attemptNumber)
  }

  function getQuizAttemptHistoryForStudent(quizId: number, studentUsername: string): QuizAttemptHistory[] {
    if (!studentUsername) return []

    loadAttemptHistoryFromStorage()

    return quizAttemptHistory.value
      .filter(a => a.quizId === quizId && a.studentUsername === studentUsername)
      .sort((a, b) => a.attemptNumber - b.attemptNumber)
  }

  function getQuizUniqueSubmitterCount(quizId: number): number {
    loadAttemptHistoryFromStorage()

    const submitters = new Set<string>()
    quizAttemptHistory.value.forEach(a => {
      if (a.quizId === quizId) {
        submitters.add(a.studentUsername)
      }
    })

    return submitters.size
  }

  function getAllQuizAttemptHistory(quizId: number): QuizAttemptHistory[] {
    loadAttemptHistoryFromStorage()
    return quizAttemptHistory.value
      .filter(a => a.quizId === quizId)
      .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
  }

  function saveAttemptHistoryToStorage() {
    localStorage.setItem('quizAttemptHistory', JSON.stringify(quizAttemptHistory.value))
  }

  function loadAttemptHistoryFromStorage() {
    if (attemptHistoryLoaded) return
    const stored = localStorage.getItem('quizAttemptHistory')
    if (stored) {
      try {
        quizAttemptHistory.value = JSON.parse(stored)
      } catch {
        // Ignore parse errors
      }
    }
    attemptHistoryLoaded = true
  }

  function loadAttemptForReview(quizId: number, attemptNumber: number) {
    const auth = useAuthStore()
    const username = auth.currentUser?.username
    if (!username) return false

    loadAttemptHistoryFromStorage()

    const attempt = quizAttemptHistory.value.find(
      a => a.quizId === quizId && a.studentUsername === username && a.attemptNumber === attemptNumber
    )

    if (!attempt) return false

    const quiz = myStudentQuizzes.value.find(q => q.id === quizId)
    if (!quiz) return false

    currentAttempt.quizId = attempt.quizId
    currentAttempt.quizTitle = quiz.title
    currentAttempt.questionsLength = getStudentQuizQuestions(quizId).length
    currentAttempt.answers = JSON.parse(JSON.stringify(attempt.answers))
    currentAttempt.answeredSet = new Set(Object.keys(attempt.answers).map(k => Number(k)))
    currentAttempt.startAtISO = attempt.completedAt
    currentAttempt.endAtISO = attempt.completedAt
    currentAttempt.durationSeconds = 0
    currentAttempt.isOngoing = false
    currentAttempt.isHistoricalReview = true

    return true
  }

  interface ApiQuestion {
    questionId?: number
    id?: number
    type?: string
    body?: string
    text?: string
    points?: number
    mediaType?: string
    mediaUrl?: string
    required?: boolean
    choices?: Array<{
      body?: string
      text?: string
      isCorrect?: boolean
      imageUrl?: string
    }>
    options?: unknown[]
    correctAnswer?: string
    pairs?: unknown[]
    items?: unknown[]
  }

  function mapApiQuestionToFrontend(q: ApiQuestion | Record<string, unknown>): QuizQuestion {
    const question = q as ApiQuestion
    let type = (question.type || '').toLowerCase()
    if (type === 'multiple') type = 'multiple-choice'
    else if (type === 'single') type = 'true-false'
    else if (type === 'text' || type === 'essay') type = 'text'
    else if (type === 'matching') type = 'matching'
    else if (type === 'enumeration') type = 'enumeration'
    else if (type === 'fillblank' || type === 'fill-blank' || type === 'fill_blank') type = 'fill-blank'

    const options = Array.isArray(question.choices)
      ? question.choices.map((c) => ({
        text: c.body || c.text || '',
        isCorrect: !!c.isCorrect,
        imageUrl: c.imageUrl || ''
      }))
      : Array.isArray(question.options)
        ? question.options as QuizQuestion['options']
        : []

    return {
      id: question.questionId || question.id || Date.now(),
      type,
      text: question.body || question.text || '',
      points: question.points || 1,
      mediaType: question.mediaType || 'none',
      mediaUrl: question.mediaUrl || '',
      required: question.required !== false,
      options,
      correctAnswer: question.correctAnswer || '',
      pairs: Array.isArray(question.pairs) ? question.pairs as QuizQuestion['pairs'] : [],
      items: Array.isArray(question.items) ? question.items as string[] : []
    }
  }

  async function fetchQuizDetail(quizId: number, userId: number) {
    try {
      const response = await quizService.getQuizById(quizId, userId)
      return response || null
    } catch {
      return null
    }
  }

  async function fetchQuizzesForCourse(courseId: number, userId: number, isStudent: boolean = false, courseName: string = ''): Promise<TeacherQuizItem[]> {
    try {
      const response = await quizService.getQuizzesForCourse(courseId, userId, isStudent)

      const quizzes = response.data || response
      if (quizzes && Array.isArray(quizzes)) {
        return quizzes.map((quiz: StudentQuizDto) => {
          const rawQuestions = Array.isArray(quiz.questions) ? quiz.questions : []
          const mappedQuestions = rawQuestions.map((q) => mapApiQuestionToFrontend(q as ApiQuestion | Record<string, unknown>))

          return {
            id: quiz.quizId || quiz.id || 0,
            subject: courseName || quiz.courseName || (quiz.course && quiz.course.name) || quiz.subject || '',
            title: quiz.title || 'Untitled Quiz',
            description: quiz.description || '',
            dueDate: quiz.dueAt || quiz.dueDate || '',
            class: quiz.sectionName || quiz.class || (quiz.section && quiz.section.name) || '',
            submitted: quiz.submittedCount || quiz.submitted || 0,
            total: quiz.totalStudents || quiz.total || 0,
            color: quiz.color || 'blue',
            status: quiz.isPublished ? 'published' : 'draft',
            timeLimit: quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : (quiz.timeLimit || '30 min'),
            questions: mappedQuestions,
            createdAt: quiz.createdAt || new Date().toISOString(),
            updatedAt: quiz.updatedAt || new Date().toISOString(),
          } as TeacherQuizItem
        })
      }

      return []
    } catch (error) {
      console.error('Failed to fetch quizzes for course:', error)
      return []
    }
  }

  function setQuizQuestionsForScore(quizId: number, quizTitle: string, questions: QuizQuestion[], username: string) {
    const tempQuiz = {
      id: quizId,
      title: quizTitle,
      subject: '',
      description: '',
      dueDate: '',
      class: '',
      submitted: 0,
      total: 0,
      color: 'blue',
      status: 'published' as const,
      questions: JSON.parse(JSON.stringify(questions)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerUsername: username
    }

    if (!teacherQuizzesByUser.value[username]) {
      teacherQuizzesByUser.value[username] = []
    }

    const existingIndex = teacherQuizzesByUser.value[username].findIndex(q => q.id === quizId)
    if (existingIndex >= 0) {
      teacherQuizzesByUser.value[username][existingIndex] = tempQuiz
    } else {
      teacherQuizzesByUser.value[username].push(tempQuiz)
    }
  }

  function hasSubmittedAttempt(quizId: number): boolean {
    return submittedQuizIds.value.has(quizId)
  }

  function markQuizAsSubmitted(quizId: number) {
    submittedQuizIds.value.add(quizId)
  }

  async function fetchTeacherQuizzes() {
    const authLocal = useAuthStore()
    const user = authLocal.currentUser
    if (!user || user.role !== 'teacher' || !user.id) return

    const hasExisting = myTeacherQuizzes.value.length > 0
    if (hasExisting) {
      return
    }

    isLoading.value = true

    try {
      const coursesStoreLocal = useCoursesStore()
      if (coursesStoreLocal.rawTeacherCourses.length === 0) {
        await coursesStoreLocal.fetchTeacherCourses()
      }
      const courses = coursesStoreLocal.rawTeacherCourses

      const quizzesByCourseResults = await Promise.all(
        courses.map(course => fetchQuizzesForCourse(course.courseId, user.id as number, false, course.name))
      )

      const allBriefQuizzes: TeacherQuizItem[] = []
      quizzesByCourseResults.forEach((qs, idx) => {
        const course = courses[idx]
        qs.forEach(q => {
          if (!q.subject) q.subject = course.name || ''
          q.ownerUsername = user.username

          const sectionNames = [q.class, course.section].filter(Boolean) as string[]

          const existing = allBriefQuizzes.find(e => {
            if (e.id === q.id) return true
            if (e.title && q.title && e.title.trim() === q.title.trim() && e.subject === q.subject) {
              const timeDiff = Math.abs(new Date(e.createdAt || 0).getTime() - new Date(q.createdAt || 0).getTime())
              if (timeDiff < 10000) return true
            }
            return false
          })

          if (!existing) {
            q.assignedSections = [...new Set(sectionNames)]
            q.quizIdsGroup = [q.id]
            if (!q.class && sectionNames.length > 0) q.class = sectionNames[0]
            allBriefQuizzes.push(q)
          } else {
            const existingSections = existing.assignedSections || []
            sectionNames.forEach(sec => {
              if (!existingSections.includes(sec)) {
                existingSections.push(sec)
              }
            })
            existing.assignedSections = existingSections

            if (!existing.quizIdsGroup) existing.quizIdsGroup = [existing.id]
            if (!existing.quizIdsGroup.includes(q.id)) {
              existing.quizIdsGroup.push(q.id)
            }

            if (existing.class && sectionNames.length > 0 && !existing.class.includes(sectionNames[0])) {
              existing.class = `${existing.class}, ${sectionNames[0]}`
            } else if (!existing.class && sectionNames.length > 0) {
              existing.class = sectionNames[0]
            }
          }
        })
      })

      const detailedQuizzes = await Promise.all(
        allBriefQuizzes.map(async (q) => {
          try {
            const detail = await fetchQuizDetail(q.id, user.id!)
            if (detail) {
              const rawQs = Array.isArray(detail.questions) ? detail.questions : []
              const detailCourse = detail.course as { name?: string } | undefined
              const detailSection = detail.section as { name?: string } | undefined
              const className = detail.sectionName || (detailSection && detailSection.name) || q.class || ''
              return {
                ...q,
                questions: rawQs.map((rawQ) => mapApiQuestionToFrontend(rawQ as ApiQuestion | Record<string, unknown>)),
                description: detail.description || q.description || '',
                subject: detail.courseName || (detailCourse && detailCourse.name) || q.subject,
                class: className,
                dueDate: q.dueDate || detail.dueAt,
                assignedSections: q.assignedSections,
                quizIdsGroup: q.quizIdsGroup
              } as TeacherQuizItem
            }
          } catch {
            console.error(`Failed to fetch quiz details for quiz ${q.id}`)
          }
          return q
        })
      )

      teacherQuizzesByUser.value[user.username] = detailedQuizzes
      loadArchivedSeedQuizzesFromStorage()
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    myTeacherQuizzes,
    myTeacherSubjects,
    myStudentQuizzes,
    currentQuiz,
    currentAttempt,
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
    resetCurrentQuiz,
    isSaving,
    isPublishing,
    saveQuiz,
    deleteQuiz,
    archiveQuiz,
    unarchiveQuiz,
    archiveQuizzesForCourse,
    unarchiveQuizzesForCourse,
    saveQuizAssignment,
    loadQuizForEditing,
    getAllQuizzes,
    loadQuizzesFromStorage,
    saveQuizzesToStorage,
    quizzesVersion,
    getStudentQuizQuestions,
    startAttempt,
    markAnswered,
    isAnswered,
    setAnswer,
    getReviewQuestions,
    getScoreItems,
    finishAttempt,
    setTextAnswer,
    setEnumerationAnswer,
    setMatchingAnswer,
    setFillBlankAnswer,
    saveAttemptToStorage,
    loadAttemptFromStorage,
    clearAttemptStorage,
    getRemainingSeconds,
    calculateScore,
    saveAttemptToHistory,
    getQuizAttemptHistory,
    loadAttemptHistoryFromStorage,
    loadAttemptForReview,
    getQuizAttemptHistoryForStudent,
    getQuizUniqueSubmitterCount,
    getAllQuizAttemptHistory,
    isQuizMarkedDone,
    toggleQuizDone,
    loadQuizDoneFromStorage,
    fetchQuizzesForCourse,
    fetchTeacherQuizzes,
    loadQuizForEditingAsync,
    fetchQuizDetail,
    fetchStudentQuizzesAsync,
    mapApiQuestionToFrontend,
    setQuizQuestionsForScore,
    hasSubmittedAttempt,
    markQuizAsSubmitted
  }
})
