import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { TeacherQuizItem, StudentQuizItem, QuizQuestion, ReviewQuestion, QuizAttemptHistory } from '../interfaces/interfaces'
import { useAuthStore } from './authStore'

export const useQuizzesStore = defineStore('quizzes', () => {
  const teacherQuizzesByUser = ref<Record<string, TeacherQuizItem[]>>({
    '0111111111': [
      { 
        id: 101, 
        subject: 'Web Development', 
        title: 'HTML & CSS Fundamentals', 
        description: 'Basic HTML structure and CSS styling', 
        dueDate: 'June 1', 
        class: 'WD101', 
        submitted: 5, 
        total: 15, 
        color: 'purple',
        status: 'published',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'What does HTML stand for?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Hyper Text Markup Language', isCorrect: true }, { text: 'High Tech Modern Language', isCorrect: false }, { text: 'Home Tool Markup Language', isCorrect: false }, { text: 'Hyperlinks and Text Markup Language', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'CSS stands for Cascading Style Sheets.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'Which HTML tag is used for the largest heading?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: '<heading>', isCorrect: false }, { text: '<h6>', isCorrect: false }, { text: '<h1>', isCorrect: true }, { text: '<head>', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'short-answer', text: 'What is the purpose of the <div> tag in HTML?', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: [] },
          { id: 5, type: 'multiple-choice', text: 'Which CSS property is used to change text color?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'text-color', isCorrect: false }, { text: 'color', isCorrect: true }, { text: 'font-color', isCorrect: false }, { text: 'text-style', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 6, type: 'enumeration', text: 'List three ways to include CSS in an HTML document.', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: ['Inline CSS', 'Internal CSS', 'External CSS'] }
        ],
        createdAt: '2024-05-10T10:00:00Z',
        updatedAt: '2024-05-10T10:00:00Z'
      },
      { 
        id: 102, 
        subject: 'Data Structures', 
        title: 'Arrays and Linked Lists', 
        description: 'Fundamental data structures and their operations', 
        dueDate: 'June 5', 
        class: 'CS201', 
        submitted: 8, 
        total: 20, 
        color: 'orange',
        status: 'published',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'What is the time complexity of accessing an element in an array by index?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'O(1)', isCorrect: true }, { text: 'O(n)', isCorrect: false }, { text: 'O(log n)', isCorrect: false }, { text: 'O(n²)', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'A linked list requires contiguous memory allocation.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: true }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'Which data structure uses LIFO principle?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Queue', isCorrect: false }, { text: 'Stack', isCorrect: true }, { text: 'Array', isCorrect: false }, { text: 'Linked List', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'matching', text: 'Match the data structure with its primary operation.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [{ left: 'Stack', right: 'Push/Pop' }, { left: 'Queue', right: 'Enqueue/Dequeue' }, { left: 'Array', right: 'Index Access' }], items: [] },
          { id: 5, type: 'short-answer', text: 'What is the advantage of a doubly linked list over a singly linked list?', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: [] },
          { id: 6, type: 'essay', text: 'Compare and contrast arrays and linked lists in terms of memory usage and access time.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: [] }
        ],
        createdAt: '2024-05-12T10:00:00Z',
        updatedAt: '2024-05-12T10:00:00Z'
      },
    ],
    '0112345678': [
      { 
        id: 1, 
        subject: 'Information Assurance', 
        title: 'Week 1 Quiz', 
        description: 'Fundamentals of Information Security', 
        dueDate: 'May 15', 
        class: 'CS31A', 
        submitted: 12, 
        total: 24, 
        color: 'blue',
        status: 'published',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'What is the CIA triad in information security?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Confidentiality, Integrity, Availability', isCorrect: true }, { text: 'Control, Integration, Authentication', isCorrect: false }, { text: 'Cryptography, Identity, Authorization', isCorrect: false }, { text: 'Code, Implementation, Access', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'Encryption is the process of converting plaintext to ciphertext.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'Which of the following is NOT a type of malware?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Virus', isCorrect: false }, { text: 'Worm', isCorrect: false }, { text: 'Firewall', isCorrect: true }, { text: 'Trojan', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'short-answer', text: 'Define what a firewall is and its primary purpose.', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: [] },
          { id: 5, type: 'multiple-choice', text: 'What is the primary goal of a DDoS attack?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Steal data', isCorrect: false }, { text: 'Make services unavailable', isCorrect: true }, { text: 'Delete files', isCorrect: false }, { text: 'Install malware', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 6, type: 'enumeration', text: 'List three common authentication factors.', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: ['Something you know', 'Something you have', 'Something you are'] }
        ],
        createdAt: '2024-05-01T10:00:00Z',
        updatedAt: '2024-05-01T10:00:00Z'
      },
      { 
        id: 2, 
        subject: 'Information Assurance', 
        title: 'Week 2 Quiz', 
        description: 'Cryptography and Network Security', 
        dueDate: 'May 18', 
        class: 'CS31A', 
        submitted: 8, 
        total: 24, 
        color: 'green',
        status: 'published',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'Which encryption algorithm is symmetric?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'RSA', isCorrect: false }, { text: 'AES', isCorrect: true }, { text: 'ECC', isCorrect: false }, { text: 'DSA', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'Public key cryptography uses the same key for encryption and decryption.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: true }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'What is a digital signature used for?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Authentication and non-repudiation', isCorrect: true }, { text: 'Encryption only', isCorrect: false }, { text: 'Compression', isCorrect: false }, { text: 'Storage', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'matching', text: 'Match the security concept with its description.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [{ left: 'Hash Function', right: 'One-way function' }, { left: 'Salt', right: 'Random data for passwords' }, { left: 'SSL/TLS', right: 'Secure communication protocol' }], items: [] },
          { id: 5, type: 'short-answer', text: 'Explain the difference between symmetric and asymmetric encryption.', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: [] },
          { id: 6, type: 'essay', text: 'Discuss the importance of key management in cryptographic systems.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: [] }
        ],
        createdAt: '2024-05-02T10:00:00Z',
        updatedAt: '2024-05-02T10:00:00Z'
      },
      { 
        id: 3, 
        subject: 'Computer Architecture', 
        title: 'Week 5 Quiz', 
        description: 'Memory Hierarchy and Cache', 
        dueDate: 'May 20', 
        class: 'CS31A', 
        submitted: 3, 
        total: 24, 
        color: 'purple',
        status: 'published',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'Which memory is fastest?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Hard Disk', isCorrect: false }, { text: 'RAM', isCorrect: false }, { text: 'Cache', isCorrect: true }, { text: 'ROM', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'Cache memory is located between CPU and RAM.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'What is the principle of locality?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Programs tend to access same memory locations', isCorrect: true }, { text: 'Memory is organized locally', isCorrect: false }, { text: 'Cache is local to CPU', isCorrect: false }, { text: 'All data is stored locally', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'short-answer', text: 'Explain the difference between temporal and spatial locality.', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: [] },
          { id: 5, type: 'multiple-choice', text: 'What does a cache miss mean?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Data found in cache', isCorrect: false }, { text: 'Data not found in cache', isCorrect: true }, { text: 'Cache is full', isCorrect: false }, { text: 'Cache error', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 6, type: 'enumeration', text: 'List three cache replacement policies.', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: ['LRU (Least Recently Used)', 'FIFO (First In First Out)', 'LFU (Least Frequently Used)'] }
        ],
        createdAt: '2024-05-03T10:00:00Z',
        updatedAt: '2024-05-03T10:00:00Z'
      },
      { 
        id: 4, 
        subject: 'Operating Systems', 
        title: 'Process Management Quiz', 
        description: 'Process Scheduling and Synchronization', 
        dueDate: 'May 25', 
        class: 'CS31B', 
        submitted: 17, 
        total: 28, 
        color: 'red',
        status: 'published',
        archived: true,
        questions: [
          { id: 1, type: 'multiple-choice', text: 'Which scheduling algorithm can cause starvation?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Round Robin', isCorrect: false }, { text: 'Priority Scheduling', isCorrect: true }, { text: 'FCFS', isCorrect: false }, { text: 'SJF', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'A process in the ready state is currently executing on the CPU.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: true }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'What is a race condition?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Two processes competing for CPU', isCorrect: false }, { text: 'Multiple processes accessing shared data', isCorrect: true }, { text: 'Fast process execution', isCorrect: false }, { text: 'Process scheduling conflict', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'matching', text: 'Match the process state with its description.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [{ left: 'New', right: 'Process being created' }, { left: 'Running', right: 'Instructions being executed' }, { left: 'Waiting', right: 'Waiting for I/O' }], items: [] },
          { id: 5, type: 'short-answer', text: 'What is a critical section in process synchronization?', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: [] },
          { id: 6, type: 'essay', text: 'Compare and contrast preemptive and non-preemptive scheduling.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: [] }
        ],
        createdAt: '2024-05-04T10:00:00Z',
        updatedAt: '2024-05-04T10:00:00Z'
      },
      { 
        id: 5, 
        subject: 'Automata', 
        title: 'PDA and CFG Quiz', 
        description: 'Pushdown Automata and Context-Free Grammars', 
        dueDate: 'May 28', 
        class: 'CS31C', 
        submitted: 9, 
        total: 22, 
        color: 'yellow',
        status: 'published',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'What type of language does a PDA accept?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Regular', isCorrect: false }, { text: 'Context-Free', isCorrect: true }, { text: 'Context-Sensitive', isCorrect: false }, { text: 'Recursive', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'A context-free grammar can generate any regular language.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'Which component is NOT part of a PDA?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Input tape', isCorrect: false }, { text: 'Stack', isCorrect: false }, { text: 'Queue', isCorrect: true }, { text: 'States', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'short-answer', text: 'What is the pumping lemma for context-free languages used for?', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: [] },
          { id: 5, type: 'multiple-choice', text: 'What does CFG stand for?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Context-Free Grammar', isCorrect: true }, { text: 'Computational Finite Grammar', isCorrect: false }, { text: 'Complete Formal Grammar', isCorrect: false }, { text: 'Complex Function Generator', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 6, type: 'enumeration', text: 'List the four components of a formal grammar.', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [], items: ['Variables (Non-terminals)', 'Terminals', 'Production Rules', 'Start Symbol'] }
        ],
        createdAt: '2024-05-05T10:00:00Z',
        updatedAt: '2024-05-05T10:00:00Z'
      },
    ],
  })

  const studentCourseEnrollments = ref<Record<string, { teacherUsername: string, subjects: string[] }[]>>({
    '0212345678': [
      { teacherUsername: '0112345678', subjects: ['Information Assurance', 'Automata', 'Computer Architecture'] },
      { teacherUsername: '0111111111', subjects: ['Web Development', 'Data Structures'] }
    ],
    '0221111111': [
      { teacherUsername: '0112345678', subjects: ['Information Assurance', 'Automata'] },
      { teacherUsername: '0111111111', subjects: ['Web Development'] }
    ],
    '0222222222': [
      { teacherUsername: '0112345678', subjects: ['Computer Architecture', 'Operating Systems'] }
    ],
    '0223333333': [
      { teacherUsername: '0111111111', subjects: ['Data Structures', 'Web Development'] }
    ],
    '0224444444': [
      { teacherUsername: '0112345678', subjects: ['Information Assurance', 'Automata', 'Computer Architecture', 'Operating Systems'] }
    ]
  })

  const currentQuiz = reactive({
    id: null as number | null,
    title: '',
    subject: '',
    timeLimit: '',
    description: '',
    questions: [] as QuizQuestion[],
    currentQuestionIndex: -1
  })

  const currentAttempt = reactive({
    quizId: null as number | null,
    quizTitle: '',
    questionsLength: 0,
    answeredSet: new Set<number>() as Set<number>,
    answers: {} as Record<number, any>,
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

    const storedQuizzes = loadQuizzesFromStorage()
    storedQuizzes.forEach(q => {
      if ((q as any).ownerUsername === uname && q.subject) {
        subjects.add(q.subject)
      }
    })

    return Array.from(subjects)
  })

  const myStudentQuizzes = computed<StudentQuizItem[]>(() => {
    const uname = auth.currentUser?.username
    if (!uname) return []
    
    const enrollments = studentCourseEnrollments.value[uname] || []
    if (enrollments.length === 0) return []
    
    const studentQuizzes: StudentQuizItem[] = []
    
    enrollments.forEach(enrollment => {
      const teacherQuizzes = teacherQuizzesByUser.value[enrollment.teacherUsername] || []
      
      teacherQuizzes.forEach(quiz => {
        if (enrollment.subjects.includes(quiz.subject) && !quiz.archived) {
          let maxAttempts = 3
          if (quiz.id === 1) maxAttempts = 2
          else if (quiz.id === 2) maxAttempts = 1
          
          studentQuizzes.push({
            id: quiz.id,
            subject: quiz.subject,
            title: quiz.title,
            description: quiz.description,
            dueDate: quiz.dueDate,
            class: quiz.class,
            timeLimit: '30 min',
            status: 'Not Started',
            color: quiz.color,
            maxAttempts
          })
        }
      })
    })
    
    return studentQuizzes
  })

  function loadArchivedSeedQuizzesFromStorage() {
    try {
      const stored = localStorage.getItem('archivedSeedQuizzes')
      const ids = stored ? (JSON.parse(stored) as number[]) : []
      archivedSeedQuizIds.value = ids

      if (ids.length > 0) {
        Object.values(teacherQuizzesByUser.value).forEach(list => {
          list.forEach(q => {
            if (ids.includes(q.id)) {
              ;(q as any).archived = true
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
    try {
      const stored = localStorage.getItem('quizDoneMap')
      if (stored) {
        quizDoneMap.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load quiz done map from localStorage:', e)
      quizDoneMap.value = {}
    }
  }

  function saveQuizDoneToStorage() {
    try {
      localStorage.setItem('quizDoneMap', JSON.stringify(quizDoneMap.value))
    } catch (e) {
      console.error('Failed to save quiz done map to localStorage:', e)
    }
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

    const quizzes = getAllQuizzes()
    const existingIndex = currentQuiz.id ? quizzes.findIndex(q => q.id === currentQuiz.id) : -1

    if (existingIndex !== -1) {
      const existingQuiz = quizzes[existingIndex]
      quizzes[existingIndex] = {
        ...existingQuiz,
        title: currentQuiz.title,
        subject: currentQuiz.subject,
        description: currentQuiz.description,
        status,
        questions: JSON.parse(JSON.stringify(currentQuiz.questions)),
        updatedAt: new Date().toISOString(),
        ownerUsername: existingQuiz.ownerUsername || username
      }
      saveQuizzesToStorage(quizzes)
      return quizzes[existingIndex]
    } else {
      const id = currentQuiz.id != null ? currentQuiz.id : Date.now()
      const quizItem: TeacherQuizItem = {
        id,
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
        updatedAt: new Date().toISOString(),
        ownerUsername: username
      }
      currentQuiz.id = quizItem.id
      quizzes.push(quizItem)
      saveQuizzesToStorage(quizzes)
      return quizItem
    }
  }

  function deleteQuiz(quizId: number) {
    const quizzes = getAllQuizzes()
    const filtered = quizzes.filter(q => q.id !== quizId)
    saveQuizzesToStorage(filtered)
  }

  function archiveQuiz(quizId: number) {
    const stored = getAllQuizzes()
    let mutated = false
    stored.forEach(q => {
      if (q.id === quizId) {
        ;(q as any).archived = true
        mutated = true
      }
    })
    if (mutated) {
      saveQuizzesToStorage(stored)
    }

    let seedMutated = false
    Object.values(teacherQuizzesByUser.value).forEach(list => {
      list.forEach(q => {
        if (q.id === quizId) {
          ;(q as any).archived = true
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

  function loadQuizForEditing(quizId: number) {
    const quizzes = getAllQuizzes()
    let quiz = quizzes.find(q => q.id === quizId)

    if (!quiz) {
      quiz = myTeacherQuizzes.value.find(q => q.id === quizId)
    }

    if (!quiz) return false

    currentQuiz.id = quiz.id
    currentQuiz.title = quiz.title
    currentQuiz.subject = quiz.subject
    currentQuiz.description = quiz.description || ''
    currentQuiz.timeLimit = ''
    currentQuiz.questions = quiz.questions ? JSON.parse(JSON.stringify(quiz.questions)) : []
    currentQuiz.currentQuestionIndex = currentQuiz.questions.length > 0 ? 0 : -1

    return true
  }

  function resetCurrentQuiz() {
    currentQuiz.id = null
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
    const auth = useAuthStore()
    const username = auth.currentUser?.username
    const all = getAllQuizzes()
    if (!username) return []
    let mutated = false
    all.forEach(q => {
      if ((q.status === 'draft') && !q.ownerUsername) {
        q.ownerUsername = username
        mutated = true
      }
    })
    if (mutated) {
      saveQuizzesToStorage(all)
    }
    return all.filter(q => (q.status !== 'draft') || q.ownerUsername === username)
  }

  function saveQuizzesToStorage(quizzes: TeacherQuizItem[]) {
    try {
      localStorage.setItem('quizzes', JSON.stringify(quizzes))
      quizzesVersion.value++
    } catch (error) {
      console.error('Error saving quizzes to localStorage:', error)
      throw new Error('Failed to save quizzes')
    }
  }

  function getStudentQuizQuestions(quizId: number): QuizQuestion[] {
    const stored = getAllQuizzes().find(q => q.id === quizId)
    if (stored && stored.questions) {
      return JSON.parse(JSON.stringify(stored.questions))
    }

    const allSeedQuizzes = Object.values(teacherQuizzesByUser.value).flat()
    const seedQuiz = allSeedQuizzes.find(q => q.id === quizId)

    if (seedQuiz && seedQuiz.questions) {
      return JSON.parse(JSON.stringify(seedQuiz.questions))
    }

    return []
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
    saveAttemptToStorage()
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
      saveAttemptToStorage()
    }
  }

  function setTextAnswer(index: number, text: string) {
    if (index >= 0 && index < currentAttempt.questionsLength) {
      currentAttempt.answers[index] = text
      if (text.trim()) {
        markAnswered(index)
      }
      saveAttemptToStorage()
    }
  }

  function setEnumerationAnswer(index: number, items: string[]) {
    if (index >= 0 && index < currentAttempt.questionsLength) {
      currentAttempt.answers[index] = items
      if (items.some(item => item.trim())) {
        markAnswered(index)
      }
      saveAttemptToStorage()
    }
  }

  function setMatchingAnswer(index: number, pairs: Record<number, number>) {
    if (index >= 0 && index < currentAttempt.questionsLength) {
      currentAttempt.answers[index] = pairs
      if (Object.keys(pairs).length > 0) {
        markAnswered(index)
      }
      saveAttemptToStorage()
    }
  }

  function setFillBlankAnswer(index: number, blanks: string[]) {
    if (index >= 0 && index < currentAttempt.questionsLength) {
      currentAttempt.answers[index] = blanks
      if (blanks.some(blank => blank.trim())) {
        markAnswered(index)
      }
      saveAttemptToStorage()
    }
  }

  function getReviewQuestions(): ReviewQuestion[] {
    return Array.from({ length: currentAttempt.questionsLength }, (_, i) => ({
      id: i + 1,
      answered: isAnswered(i)
    }))
  }

  function getScoreItems() {
    if (currentAttempt.quizId == null) {
      return [] as {
        question: string
        options: string[]
        correctAnswer: number
        userAnswer: any
        isCorrect: boolean
        points: number
        questionType?: string
        correctAnswerText?: string
        userAnswerText?: string
      }[]
    }

    const quizQuestions = getStudentQuizQuestions(currentAttempt.quizId)

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

      if (q.type === 'short-answer') {
        const userText = rawUserAnswer != null ? String(rawUserAnswer) : ''
        const trimmed = userText.trim()
        const sentences = trimmed
          ? trimmed
              .split(/[.!?\n]+/)
              .map(s => s.trim())
              .filter(Boolean)
          : []

        let isCorrect = false
        if (sentences.length >= 2 && sentences.length <= 3) {
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
          questionType: q.type,
          correctAnswerText: 'answer must be 2-3 sentences'
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
        const items = Array.isArray((q as any).items) ? ((q as any).items as string[]) : []
        const userItems = Array.isArray(rawUserAnswer)
          ? (rawUserAnswer as any[]).map(v => (v != null ? String(v) : ''))
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
    try {
      const attemptData = {
        quizId: currentAttempt.quizId,
        quizTitle: currentAttempt.quizTitle,
        questionsLength: currentAttempt.questionsLength,
        answeredSet: Array.from(currentAttempt.answeredSet),
        answers: currentAttempt.answers,
        startAtISO: currentAttempt.startAtISO,
        endAtISO: currentAttempt.endAtISO,
        durationSeconds: currentAttempt.durationSeconds,
        isOngoing: currentAttempt.isOngoing
      }
      localStorage.setItem('currentQuizAttempt', JSON.stringify(attemptData))
    } catch (e) {
      console.error('Failed to save attempt to localStorage:', e)
    }
  }

  function loadAttemptFromStorage(): boolean {
    try {
      const stored = localStorage.getItem('currentQuizAttempt')
      if (!stored) return false
      const data = JSON.parse(stored)
      if (!data.isOngoing) return false
      
      currentAttempt.quizId = data.quizId
      currentAttempt.quizTitle = data.quizTitle
      currentAttempt.questionsLength = data.questionsLength
      currentAttempt.answeredSet = new Set(data.answeredSet || [])
      currentAttempt.answers = data.answers || {}
      currentAttempt.startAtISO = data.startAtISO
      currentAttempt.endAtISO = data.endAtISO
      currentAttempt.durationSeconds = data.durationSeconds || 0
      currentAttempt.isOngoing = data.isOngoing
      return true
    } catch (e) {
      console.error('Failed to load attempt from localStorage:', e)
      return false
    }
  }

  function clearAttemptStorage() {
    try {
      localStorage.removeItem('currentQuizAttempt')
    } catch (e) {
      console.error('Failed to clear attempt storage:', e)
    }
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
      } else if (q.type === 'short-answer') {
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
          ? userAnswer.map((v: any) => (v != null ? String(v) : ''))
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
      answers: JSON.parse(JSON.stringify(currentAttempt.answers))
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

  function saveAttemptHistoryToStorage() {
    try {
      localStorage.setItem('quizAttemptHistory', JSON.stringify(quizAttemptHistory.value))
    } catch (e) {
      console.error('Failed to save attempt history to localStorage:', e)
    }
  }

  function loadAttemptHistoryFromStorage() {
    if (attemptHistoryLoaded) return
    try {
      const stored = localStorage.getItem('quizAttemptHistory')
      if (stored) {
        quizAttemptHistory.value = JSON.parse(stored)
      }
      attemptHistoryLoaded = true
    } catch (e) {
      console.error('Failed to load attempt history from localStorage:', e)
      quizAttemptHistory.value = []
      attemptHistoryLoaded = true
    }
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

  return {
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
    saveQuiz,
    deleteQuiz,
    archiveQuiz,
    loadQuizForEditing,
    resetCurrentQuiz,
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
    isQuizMarkedDone,
    toggleQuizDone,
    loadQuizDoneFromStorage
  }
})
