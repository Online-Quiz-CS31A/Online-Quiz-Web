import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { TeacherQuizItem, StudentQuizItem, QuizQuestion, ReviewQuestion, QuizAttemptHistory, User } from '../interfaces/interfaces'
import { useAuthStore } from './authStore'
import { useCoursesStore } from './coursesStore'
import { useSectionsStore } from './sectionsStore'
import api from '../services/api'

export const useQuizzesStore = defineStore('quizzes', () => {
  const isLoading = ref(false)
  const teacherQuizzesByUser = ref<Record<string, TeacherQuizItem[]>>({
    '0111111111': [
      {
        id: 101,
        subject: 'Web Development',
        title: 'HTML & CSS Fundamentals',
        description: 'Basic HTML structure and CSS styling',
        dueDate: '2025-06-01 23:59',
        class: 'CS22A',
        submitted: 5,
        total: 15,
        color: 'purple',
        status: 'published',
        timeLimit: '30 min',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'What does HTML stand for?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Hyper Text Markup Language', isCorrect: true }, { text: 'High Tech Modern Language', isCorrect: false }, { text: 'Home Tool Markup Language', isCorrect: false }, { text: 'Hyperlinks and Text Markup Language', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'CSS stands for Cascading Style Sheets.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'Which HTML tag is used for the largest heading?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: '<heading>', isCorrect: false }, { text: '<h6>', isCorrect: false }, { text: '<h1>', isCorrect: true }, { text: '<head>', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'text', text: 'What is the purpose of the <div> tag in HTML?', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: 'The <div> tag is a generic block-level container used to group content for layout or styling with CSS.', pairs: [], items: [] },
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
        dueDate: '2025-06-05 23:59',
        class: 'CS33A',
        submitted: 8,
        total: 20,
        color: 'orange',
        status: 'published',
        timeLimit: '30 min',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'What is the time complexity of accessing an element in an array by index?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'O(1)', isCorrect: true }, { text: 'O(n)', isCorrect: false }, { text: 'O(log n)', isCorrect: false }, { text: 'O(n²)', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'A linked list requires contiguous memory allocation.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: true }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'Which data structure uses LIFO principle?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Queue', isCorrect: false }, { text: 'Stack', isCorrect: true }, { text: 'Array', isCorrect: false }, { text: 'Linked List', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'matching', text: 'Match the data structure with its primary operation.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [{ left: 'Stack', right: 'Push/Pop' }, { left: 'Queue', right: 'Enqueue/Dequeue' }, { left: 'Array', right: 'Index Access' }], items: [] },
          { id: 5, type: 'text', text: 'What is the advantage of a doubly linked list over a singly linked list?', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: 'A doubly linked list allows traversal in both directions and makes insertion and deletion easier because each node keeps references to both its previous and next nodes.', pairs: [], items: [] },
          { id: 6, type: 'text', text: 'Compare and contrast arrays and linked lists in terms of memory usage and access time.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: 'Arrays use contiguous memory and provide fast O(1) indexed access but can be expensive to resize, while linked lists use non-contiguous memory with O(n) access time but allow efficient insertions and deletions at arbitrary positions.', pairs: [], items: [] }
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
        dueDate: '2025-05-15 23:59',
        class: 'CS31A',
        submitted: 12,
        total: 24,
        color: 'blue',
        status: 'published',
        timeLimit: '30 min',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'What is the CIA triad in information security?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Confidentiality, Integrity, Availability', isCorrect: true }, { text: 'Control, Integration, Authentication', isCorrect: false }, { text: 'Cryptography, Identity, Authorization', isCorrect: false }, { text: 'Code, Implementation, Access', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'Encryption is the process of converting plaintext to ciphertext.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'Which of the following is NOT a type of malware?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Virus', isCorrect: false }, { text: 'Worm', isCorrect: false }, { text: 'Firewall', isCorrect: true }, { text: 'Trojan', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'text', text: 'Define what a firewall is and its primary purpose.', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: 'A firewall is a network security system that monitors and controls incoming and outgoing traffic based on predefined security rules, acting as a barrier between a trusted internal network and untrusted external networks such as the internet.', pairs: [], items: [] },
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
        dueDate: '2025-05-18 23:59',
        class: 'CS31A',
        submitted: 8,
        total: 24,
        color: 'green',
        status: 'published',
        timeLimit: '30 min',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'Which encryption algorithm is symmetric?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'RSA', isCorrect: false }, { text: 'AES', isCorrect: true }, { text: 'ECC', isCorrect: false }, { text: 'DSA', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'Public key cryptography uses the same key for encryption and decryption.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: true }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'What is a digital signature used for?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Authentication and non-repudiation', isCorrect: true }, { text: 'Encryption only', isCorrect: false }, { text: 'Compression', isCorrect: false }, { text: 'Storage', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'matching', text: 'Match the security concept with its description.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [{ left: 'Hash Function', right: 'One-way function' }, { left: 'Salt', right: 'Random data for passwords' }, { left: 'SSL/TLS', right: 'Secure communication protocol' }], items: [] },
          { id: 5, type: 'text', text: 'Explain the difference between symmetric and asymmetric encryption.', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: 'Symmetric encryption uses the same key for both encryption and decryption, while asymmetric encryption uses a public key to encrypt data and a separate private key to decrypt it.', pairs: [], items: [] },
          { id: 6, type: 'text', text: 'Discuss the importance of key management in cryptographic systems.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: 'Key management is critical because the security of cryptographic systems depends on generating, distributing, storing, rotating, and revoking keys securely to prevent unauthorized access or key compromise.', pairs: [], items: [] }
        ],
        createdAt: '2024-05-02T10:00:00Z',
        updatedAt: '2024-05-02T10:00:00Z'
      },
      {
        id: 3,
        subject: 'Computer Architecture',
        title: 'Week 5 Quiz',
        description: 'Memory Hierarchy and Cache',
        dueDate: '2025-05-20 23:59',
        class: 'CS22A',
        submitted: 3,
        total: 24,
        color: 'purple',
        status: 'published',
        timeLimit: '30 min',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'Which memory is fastest?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Hard Disk', isCorrect: false }, { text: 'RAM', isCorrect: false }, { text: 'Cache', isCorrect: true }, { text: 'ROM', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'Cache memory is located between CPU and RAM.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'What is the principle of locality?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Programs tend to access same memory locations', isCorrect: true }, { text: 'Memory is organized locally', isCorrect: false }, { text: 'Cache is local to CPU', isCorrect: false }, { text: 'All data is stored locally', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'text', text: 'Explain the difference between temporal and spatial locality.', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: 'Temporal locality means a program tends to reuse the same data or instructions within a short time period, while spatial locality means it tends to access data locations that are close to each other in memory.', pairs: [], items: [] },
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
        dueDate: '2025-05-25 23:59',
        class: 'IT22A',
        submitted: 17,
        total: 28,
        color: 'red',
        status: 'published',
        archived: true,
        timeLimit: '30 min',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'Which scheduling algorithm can cause starvation?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Round Robin', isCorrect: false }, { text: 'Priority Scheduling', isCorrect: true }, { text: 'FCFS', isCorrect: false }, { text: 'SJF', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'A process in the ready state is currently executing on the CPU.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: true }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'What is a race condition?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Two processes competing for CPU', isCorrect: false }, { text: 'Multiple processes accessing shared data', isCorrect: true }, { text: 'Fast process execution', isCorrect: false }, { text: 'Process scheduling conflict', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'matching', text: 'Match the process state with its description.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: '', pairs: [{ left: 'New', right: 'Process being created' }, { left: 'Running', right: 'Instructions being executed' }, { left: 'Waiting', right: 'Waiting for I/O' }], items: [] },
          { id: 5, type: 'text', text: 'What is a critical section in process synchronization?', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: 'A critical section is a part of a program where shared resources are accessed and that must not be executed by more than one process or thread at the same time to avoid data races.', pairs: [], items: [] },
          { id: 6, type: 'text', text: 'Compare and contrast preemptive and non-preemptive scheduling.', points: 20, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: 'Preemptive scheduling allows the operating system to interrupt and switch out a running process, while non-preemptive scheduling lets a process run until it finishes or blocks; preemptive systems improve responsiveness but add overhead and complexity.', pairs: [], items: [] }
        ],
        createdAt: '2024-05-04T10:00:00Z',
        updatedAt: '2024-05-04T10:00:00Z'
      },
      {
        id: 5,
        subject: 'Automata',
        title: 'PDA and CFG Quiz',
        description: 'Pushdown Automata and Context-Free Grammars',
        dueDate: '2025-05-28 23:59',
        class: 'IT11B',
        submitted: 9,
        total: 22,
        color: 'yellow',
        status: 'published',
        timeLimit: '30 min',
        questions: [
          { id: 1, type: 'multiple-choice', text: 'What type of language does a PDA accept?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Regular', isCorrect: false }, { text: 'Context-Free', isCorrect: true }, { text: 'Context-Sensitive', isCorrect: false }, { text: 'Recursive', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 2, type: 'true-false', text: 'A context-free grammar can generate any regular language.', points: 5, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 3, type: 'multiple-choice', text: 'Which component is NOT part of a PDA?', points: 10, mediaType: 'none', mediaUrl: '', required: true, options: [{ text: 'Input tape', isCorrect: false }, { text: 'Stack', isCorrect: false }, { text: 'Queue', isCorrect: true }, { text: 'States', isCorrect: false }], correctAnswer: '', pairs: [], items: [] },
          { id: 4, type: 'text', text: 'What is the pumping lemma for context-free languages used for?', points: 15, mediaType: 'none', mediaUrl: '', required: true, options: [], correctAnswer: 'The pumping lemma for context-free languages is used to prove that certain languages are not context-free by showing that all sufficiently long strings in the language cannot be pumped while still remaining in the language.', pairs: [], items: [] },
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
    currentQuestionIndex: -1,
    assignedSections: [] as string[],
    assignedCourseIds: [] as number[],
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
  const coursesStore = useCoursesStore()
  const sectionsStore = useSectionsStore()

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

    const studentQuizzes: StudentQuizItem[] = []

    for (const course of courses) {
      try {
        const response = await api.get(`/Quiz/course/${course.id}?userId=${user.id}&isStudent=true`)
        const quizzesData = response.data?.data || response.data || []

        const arr = Array.isArray(quizzesData) ? quizzesData : []
        arr.forEach((quiz: any) => {
          if (!quiz) return
          studentQuizzes.push({
            id: quiz.quizId || quiz.id,
            subject: course.name,
            title: quiz.title,
            description: quiz.description || '',
            dueDate: quiz.dueAt || quiz.dueDate || '',
            class: '',
            timeLimit: quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : '30 min',
            status: 'Not Started',
            color: 'blue',
            maxAttempts: quiz.maxAttempts || 3
          })
        })
      } catch (e) {
        console.error(`Failed to load quizzes for course ${course.id}`, e)
      }
    }

    studentQuizzesFromApi.value = studentQuizzes
  }

  function loadArchivedSeedQuizzesFromStorage() {
    try {
      const stored = localStorage.getItem('archivedSeedQuizzes')
      const ids = stored ? (JSON.parse(stored) as number[]) : []
      archivedSeedQuizIds.value = ids

      Object.values(teacherQuizzesByUser.value).forEach(list => {
        list.forEach(q => {
          if ((q as any).archived) {
            ; (q as any).archived = false
          }
        })
      })

      if (ids.length > 0) {
        Object.values(teacherQuizzesByUser.value).forEach(list => {
          list.forEach(q => {
            if (ids.includes(q.id)) {
              ; (q as any).archived = true
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

    const payloadTemplate: any = {
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
      const currentPayload = { ...payloadTemplate, courseId: cid, quizId: isCreatingNew ? 0 : currentQuiz.id }

      if (isCreatingNew) {
        currentPayload.createdBy = userId
        const response = await api.post('/Quiz', currentPayload)
        
        if (i === 0 && response.data && (response.data.quizId || response.data.id)) {
          currentQuiz.id = response.data.quizId || response.data.id
        }
      } else {
        if (i === 0) {
          await api.put(`/Quiz/${currentQuiz.id}?userId=${userId}`, currentPayload)
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
  }

  async function deleteQuiz(quizId: number) {
    try {
      await api.delete(`/Quiz/${quizId}`)
    } catch (e) {
      console.error('Failed to delete quiz:', e)
    }

    // Also remove from teacherQuizzesByUser
    Object.keys(teacherQuizzesByUser.value).forEach(list => {
      teacherQuizzesByUser.value[list] = teacherQuizzesByUser.value[list].filter(q => q.id !== quizId)
    })
  }

  function archiveQuiz(quizId: number) {
    let seedMutated = false
    Object.values(teacherQuizzesByUser.value).forEach(list => {
      list.forEach(q => {
        if (q.id === quizId) {
          ; (q as any).archived = true
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
        ; (seedQuiz as any).dueDate = payload.dueDate
      }

      if (payload.sectionNames && Array.isArray(payload.sectionNames)) {
        const unique = Array.from(new Set(payload.sectionNames.filter(Boolean)))
          ; (seedQuiz as any).assignedSections = unique
        if (unique.length > 0) {
          ; (seedQuiz as any).class = unique[0]
        }
      } else if (payload.sectionName != null) {
        ; (seedQuiz as any).class = payload.sectionName
          ; (seedQuiz as any).assignedSections = payload.sectionName ? [payload.sectionName] : []
      }

      if (payload.timeLimitMinutes != null) {
        ; (seedQuiz as any).timeLimit = `${payload.timeLimitMinutes} min`
      }
      if (payload.maxAttempts != null) {
        ; (seedQuiz as any).maxAttempts = payload.maxAttempts
      }
    }
  }

  function unarchiveQuizzesForCourse(courseName: string) {
    if (!courseName) return

    const ids = new Set<number>()

    Object.values(teacherQuizzesByUser.value).forEach(list => {
      list.forEach(q => {
        if (q.subject === courseName && (q as any).archived) ids.add(q.id)
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
        if (q.id === quizId && (q as any).archived) {
          ; (q as any).archived = false
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
    let quiz = myTeacherQuizzes.value.find(q => q.id === quizId)

    if (!quiz) return false

    currentQuiz.id = quiz.id
    currentQuiz.title = quiz.title
    currentQuiz.subject = quiz.subject
    currentQuiz.description = quiz.description || ''
    currentQuiz.timeLimit = (quiz as any).timeLimit || ''
    currentQuiz.assignedSections = Array.isArray((quiz as any).assignedSections)
      ? [...(quiz as any).assignedSections]
      : ((quiz as any).class ? [(quiz as any).class] : [])

    const rawQuestions = quiz.questions ? JSON.parse(JSON.stringify(quiz.questions)) : []
    currentQuiz.questions = rawQuestions.map((q: any) => {
      if (q.text !== undefined) return q
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

  function saveQuizzesToStorage(quizzes: TeacherQuizItem[]) {

  }

  function getStudentQuizQuestions(quizId: number): QuizQuestion[] {
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

  }

  function loadAttemptFromStorage(): boolean {
    return false
  }

  function clearAttemptStorage() {

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

  }

  function loadAttemptHistoryFromStorage() {
    if (attemptHistoryLoaded) return
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

  function mapApiQuestionToFrontend(q: any): any {
    let type = (q.type || '').toLowerCase()
    if (type === 'multiple') type = 'multiple-choice'
    else if (type === 'single') type = 'true-false'
    else if (type === 'text' || type === 'essay') type = 'text'
    else if (type === 'matching') type = 'matching'
    else if (type === 'enumeration') type = 'enumeration'
    else if (type === 'fillblank' || type === 'fill-blank' || type === 'fill_blank') type = 'fill-blank'

    const options = Array.isArray(q.choices)
      ? q.choices.map((c: any) => ({
        text: c.body || c.text || '',
        isCorrect: !!c.isCorrect,
        imageUrl: c.imageUrl || ''
      }))
      : Array.isArray(q.options)
        ? q.options
        : []

    return {
      id: q.questionId || q.id || Date.now(),
      type,
      text: q.body || q.text || '',
      points: q.points || 1,
      mediaType: q.mediaType || 'none',
      mediaUrl: q.mediaUrl || '',
      required: q.required !== false,
      options,
      correctAnswer: q.correctAnswer || '',
      pairs: Array.isArray(q.pairs) ? q.pairs : [],
      items: Array.isArray(q.items) ? q.items : []
    }
  }

  async function fetchQuizDetail(quizId: number, userId: number): Promise<any | null> {
    try {
      const response = await api.get(`/Quiz/${quizId}`, { params: { userId } })
      return response.data || null
    } catch {
      return null
    }
  }

  async function fetchQuizzesForCourse(courseId: number, userId: number, isStudent: boolean = false, courseName: string = ''): Promise<TeacherQuizItem[]> {
    try {
      const response = await api.get(`/Quiz/course/${courseId}`, {
        params: { userId, isStudent }
      })

      if (response.data && Array.isArray(response.data)) {
        return response.data.map((quiz: any) => {
          const rawQuestions = Array.isArray(quiz.questions) ? quiz.questions : []
          const mappedQuestions = rawQuestions.map(mapApiQuestionToFrontend)

          return {
            id: quiz.quizId || quiz.id,
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

      const quizzesByCourseResults = []
      for (const course of courses) {
        const result = await fetchQuizzesForCourse(course.courseId, user.id as number, false, course.name)
        quizzesByCourseResults.push(result)
      }

      const allBriefQuizzes: TeacherQuizItem[] = []
      quizzesByCourseResults.forEach((qs, idx) => {
        const course = courses[idx]
        qs.forEach(q => {
          if (!q.subject) q.subject = course.name || ''
          q.ownerUsername = user.username

          const sectionNames = [q.class, course.section].filter(Boolean) as string[]

          const existing = allBriefQuizzes.find(e => e.id === q.id)
          if (!existing) {
            (q as any).assignedSections = [...new Set(sectionNames)]
            if (!q.class && sectionNames.length > 0) q.class = sectionNames[0]
            allBriefQuizzes.push(q)
          } else {
            const existingSections = ((existing as any).assignedSections || []) as string[]
            sectionNames.forEach(sec => {
              if (!existingSections.includes(sec)) {
                existingSections.push(sec)
              }
            })
              ; (existing as any).assignedSections = existingSections

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
            const detail = await fetchQuizDetail(q.id, user.id as number)
            if (detail) {
              const rawQs = Array.isArray(detail.questions) ? detail.questions : []
              return {
                ...q,
                questions: rawQs.map(mapApiQuestionToFrontend),
                description: detail.description || q.description || '',
                subject: detail.courseName || (detail.course && detail.course.name) || q.subject,
                class: detail.sectionName || (detail.section && detail.section.name) ? (detail.sectionName || (detail.section && detail.section.name)) : q.class,
                dueDate: q.dueDate || detail.dueAt,
                assignedSections: (q as any).assignedSections
              }
            }
          } catch (e) {
            console.error(`Failed to fetch quiz details for quiz ${q.id}`, e)
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
    saveQuiz,
    deleteQuiz,
    archiveQuiz,
    unarchiveQuiz,
    archiveQuizzesForCourse,
    unarchiveQuizzesForCourse,
    saveQuizAssignment,
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
    getAllQuizAttemptHistory,
    isQuizMarkedDone,
    toggleQuizDone,
    loadQuizDoneFromStorage,
    fetchQuizzesForCourse,
    fetchTeacherQuizzes,
    loadQuizForEditingAsync,
    fetchQuizDetail,
    fetchStudentQuizzesAsync,
    mapApiQuestionToFrontend
  }
})
