import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// Shared type for class items that components can import
export interface ClassItem {
  id: number
  name: string
  teacher: string
  description: string
  students: number
  color: string
  studentUsernames?: string[]
}

// Calendar event type for store
export type CalendarEventType = 'quiz' | 'holiday' | 'other'
export interface CalendarEventItem {
  id: number
  title: string
  date: string
  type: CalendarEventType
  time?: string
  isDeadline?: boolean
}

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  // --- Quizzes ---
  // Teacher quizzes 
  interface TeacherQuizItem {
    id: number
    subject: string
    title: string
    description: string
    dueDate: string
    class: string
    submitted: number
    total: number
    color: string
  }
  // Student quizzes 
  interface StudentQuizItem {
    id: number
    subject: string
    title: string
    description: string
    dueDate: string
    class: string
    timeLimit: string
    status: string
    color: string
  }

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

  const myTeacherQuizzes = computed<TeacherQuizItem[]>(() => {
    const uname = currentUser.value?.username
    if (!uname) return []
    return teacherQuizzesByUser.value[uname] || []
  })
  const myStudentQuizzes = computed<StudentQuizItem[]>(() => {
    const uname = currentUser.value?.username
    if (!uname) return []
    return studentQuizzesByUser.value[uname] || []
  })

  type Role = 'teacher' | 'student'
  interface User {
    username: string
    password: string
    role: Role
    name?: string
  }

  const users = ref<User[]>([
    { username: '0112345678', password: 'teacher', role: 'teacher', name: 'Donald Francisco' },
    { username: '0212345678', password: 'student', role: 'student', name: 'Chitoge Kirisaki' },
  ])

  const currentUser = ref<User | null>(null)
  const isAuthenticated = computed(() => currentUser.value !== null)
  const userRole = computed<Role | null>(() => (currentUser.value ? currentUser.value.role : null))

  // --- Classes Data  ---
  const allClasses = ref<ClassItem[]>([
    // Teacher: Donald Francisco
    { id: 1, name: 'Information Assurance',  teacher: 'Donald Francisco', description: '', students: 24, color: 'red',    studentUsernames: ['0212345678'] },
    { id: 2, name: 'Automata',               teacher: 'Donald Francisco', description: '', students: 22, color: 'blue',   studentUsernames: ['0212345678'] },
    { id: 3, name: 'Computer Architecture',  teacher: 'Donald Francisco', description: '', students: 26, color: 'green',  studentUsernames: ['0212345678'] },
    { id: 4, name: 'Operating Systems',      teacher: 'Donald Francisco', description: '', students: 28, color: 'teal',   studentUsernames: [] },
    { id: 5, name: 'Web Development',        teacher: 'Jane Doe',          description: '', students: 30, color: 'purple', studentUsernames: ['0212345678'] },
    { id: 6, name: 'Data Structures',        teacher: 'Jane Doe',          description: '', students: 27, color: 'orange', studentUsernames: ['0212345678'] },
    { id: 7, name: 'Database Systems',       teacher: 'John Smith',        description: '', students: 25, color: 'pink',   studentUsernames: [] },
  ])

  const myClasses = computed<ClassItem[]>(() => {
    if (!currentUser.value) return []
    if (currentUser.value.role === 'teacher') {
      return allClasses.value.filter(c => c.teacher === (currentUser.value?.name || ''))
    } else {
      const uname = currentUser.value.username
      return allClasses.value.filter(c => (c.studentUsernames || []).includes(uname))
    }
  })

  function addClass(newClass: Omit<ClassItem, 'id'>) {
    const last = allClasses.value.length ? allClasses.value[allClasses.value.length - 1] : undefined
    const nextId = ((last?.id) || 0) + 1
    allClasses.value.push({ id: nextId, ...newClass })
  }

  // --- Calendar Events ---
  const calendarEventsByUser = ref<Record<string, CalendarEventItem[]>>({
    // Teacher: Donald
    '0112345678': [
      { id: 1, title: 'Quiz 1 Due', date: todayISOWithDayOffset(10), type: 'quiz', isDeadline: true },
      { id: 2, title: 'Automata Quiz 3 Due', date: todayISOWithDayOffset(15), type: 'quiz', isDeadline: true },
      { id: 3, title: 'Faculty Meeting', date: todayISOWithDayOffset(7), type: 'other', time: '14:00' },
      { id: 4, title: 'Osmeña Day', date: fixedMonthHolidayISO(9, 9), type: 'holiday' },
    ],
    // Student: Chitoge
    '0212345678': [
      { id: 1, title: 'IA Week 1 Quiz', date: todayISOWithDayOffset(10), type: 'quiz', isDeadline: true },
      { id: 2, title: 'Web Dev Assignment 2', date: todayISOWithDayOffset(12), type: 'other', time: '23:59', isDeadline: true },
      { id: 3, title: 'Study Group', date: todayISOWithDayOffset(6), type: 'other', time: '18:00' },
      { id: 4, title: 'School Holiday', date: fixedMonthHolidayISO(9, 30), type: 'holiday' },
    ],
  })

  function todayISOWithDayOffset(offset: number): string {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return d.toISOString().split('T')[0]
  }

  function fixedMonthHolidayISO(month: number, day: number): string {
    const d = new Date()
    const y = d.getFullYear()
    const iso = new Date(y, month - 1, day).toISOString()
    return iso.split('T')[0]
  }

  const myCalendarEvents = computed<CalendarEventItem[]>(() => {
    const uname = currentUser.value?.username
    if (!uname) return []
    return calendarEventsByUser.value[uname] || []
  })

  function addCalendarEvent(evt: Omit<CalendarEventItem, 'id'>) {
    const uname = currentUser.value?.username
    if (!uname) return
    const list = calendarEventsByUser.value[uname] || (calendarEventsByUser.value[uname] = [])
    const last = list.length ? list[list.length - 1] : undefined
    const nextId = ((last?.id) || 0) + 1
    list.push({ id: nextId, ...evt })
  }

  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
    if (saved) {
      const parsed = JSON.parse(saved) as User
      const expectedPrefix = parsed.role === 'teacher' ? '01' : '02'
      if (parsed.username?.startsWith(expectedPrefix)) {
        const found = users.value.find(u => u.username === parsed.username)
        if (found) {
          currentUser.value = { ...found }
        }
      }
    }
  } catch (e) {
  }

  function login(username: string, password: string): { success: boolean; message?: string; role?: Role } {
    const found = users.value.find(u => u.username === username)
    if (!found) return { success: false, message: 'Account not found' }
    if (found.password !== password) return { success: false, message: 'Invalid password' }
    currentUser.value = { ...found }
    return { success: true, role: found.role }
  }

  function logout() {
    currentUser.value = null
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser')
      }
    } catch {}
  }

  return {
    // counter
    count,
    doubleCount,
    increment,

    // auth
    users,
    currentUser,
    isAuthenticated,
    userRole,
    login,
    logout,

    // classes
    allClasses,
    myClasses,
    addClass,

    // calendar
    myCalendarEvents,
    addCalendarEvent,

    // quizzes
    myTeacherQuizzes,
    myStudentQuizzes,
  }
})
