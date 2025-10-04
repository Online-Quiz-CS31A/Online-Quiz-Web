export interface TeacherProfile {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  bio: string
  photoUrl?: string
}

export interface StudentProfile {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  yearLevel: string
  program: string
  bio: string
  photoUrl?: string
}

export interface ClassItem {
  id: number
  code: string
  name: string
  teacher: string
  description: string
  students: number
  color: string
  studentUsernames?: string[]
}

export interface ClassSection {
  id: number
  name: string
  students: number
  studentUsernames: string[]
}

export interface CourseSectionMapping {
  courseId: number
  sectionId: number
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
