import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { TeacherQuizItem, StudentQuizItem, QuizQuestion } from '../interfaces/interfaces'
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
    
    const enrollments = studentCourseEnrollments.value[uname] || []
    if (enrollments.length === 0) return []
    
    const studentQuizzes: StudentQuizItem[] = []
    
    enrollments.forEach(enrollment => {
      const teacherQuizzes = teacherQuizzesByUser.value[enrollment.teacherUsername] || []
      
      teacherQuizzes.forEach(quiz => {
        if (enrollment.subjects.includes(quiz.subject)) {
          studentQuizzes.push({
            id: quiz.id,
            subject: quiz.subject,
            title: quiz.title,
            description: quiz.description,
            dueDate: quiz.dueDate,
            class: quiz.class,
            timeLimit: '30 min',
            status: 'Not Started',
            color: quiz.color
          })
        }
      })
    })
    
    return studentQuizzes
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
    let quiz = myTeacherQuizzes.value.find(q => q.id === quizId)
    
    if (!quiz) {
      const quizzes = getAllQuizzes()
      quiz = quizzes.find(q => q.id === quizId)
    }
    
    if (!quiz) return false

    currentQuiz.title = quiz.title
    currentQuiz.subject = quiz.subject
    currentQuiz.description = quiz.description || ''
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

  function getStudentQuizQuestions(quizId: number): QuizQuestion[] {
    const auth = useAuthStore()
    const username = auth.currentUser?.username
    
    const allTeacherQuizzes = Object.values(teacherQuizzesByUser.value).flat()
    const quiz = allTeacherQuizzes.find(q => q.id === quizId)
    
    if (quiz && quiz.questions) {
      return JSON.parse(JSON.stringify(quiz.questions))
    }
    
    return []
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
    saveQuizzesToStorage,
    getStudentQuizQuestions
  }
})
