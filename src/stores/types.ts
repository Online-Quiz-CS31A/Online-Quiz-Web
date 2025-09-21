export interface ClassItem {
  id: number
  name: string
  teacher: string
  description: string
  students: number
  color: string
  studentUsernames?: string[]
}

export type CalendarEventType = 'quiz' | 'holiday' | 'other'
export interface CalendarEventItem {
  id: number
  title: string
  date: string
  type: CalendarEventType
  time?: string
  isDeadline?: boolean
}

export type Role = 'teacher' | 'student'
export interface User {
  username: string
  password: string
  role: Role
  name?: string
}

export interface TeacherQuizItem {
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

export interface StudentQuizItem {
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
