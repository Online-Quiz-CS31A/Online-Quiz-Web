// PROFILE| TEACHER
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

// ENUMS| YEAR LEVEL
export type YearLevel = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'TESDA'

// PROFILE| STUDENT
export interface StudentProfile {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  yearLevel: YearLevel
  program: string
  bio: string
  photoUrl?: string
}

// VIEW MODELS| STUDENT
export interface StudentViewModel {
  username: string
  name: string
  email: string
  year: YearLevel
  major: string
  avatar: string
}

// CLASS AND SECTION MODELS
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

// COURSE-SECTION RELATIONSHIPS AND SCHEDULE
export interface CourseSectionMapping {
  courseId: number
  sectionId: number
}

export interface CourseSectionSchedule {
  courseId: number
  sectionId: number
  scheduleDay: string
  scheduleTime: string
  classroom: string
}

// CALENDAR EVENTS
export type CalendarEventType = 'quiz' | 'holiday' | 'other'
export interface CalendarEventItem {
  id: number
  title: string
  date: string
  type: CalendarEventType
  time?: string
  isDeadline?: boolean
}

// AUTHENTICATION AND USER ACCOUNT
export type Role = 'teacher' | 'student'
export interface User {
  username: string
  password: string
  role: Role
  name?: string
}

// QUIZ LIST ITEMS FOR TEACHERS
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

// QUIZ LIST ITEMS FOR STUDENTS
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

// ADMIN COURSE CATALOG & DETAILS INTERFACES
export interface CourseInstructor {
  teacherId: number
  section: string
  students: number
}

export interface Course {
  id: number
  title: string
  code: string
  status: 'Active' | 'Archived'
  subjectCode: string
  instructors: CourseInstructor[]
  description?: string
  units?: number
}

export interface Person {
  id: number
  name: string
  role: 'Teacher' | 'Student'
}

export interface AdminQuiz {
  id: number
  title: string
  dueDate: string
  status: 'Active' | 'Closed' | 'Draft'
  instructorId: number
}

// ADMIN DASHBOARD INTERFACES
export interface Stats {
  activeUsers: number
  activeCourses: number
  quizzesTaken: number
  systemHealth: string
}

export interface Activity {
  id: number
  title: string
  status: string
  icon: any
  user: string
  date: string
  timeAgo: string
}

// ADMIN USER MANAGEMENT INTERFACES
export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  status: string
  lastActive: string
  avatar: string
  username?: string
  password?: string
  course?: string
  year?: string
  section?: string
  department?: string
}

// QUIZ CONTENT INTERFACES
export interface QuestionOption {
  text: string
  isCorrect: boolean
  imageUrl?: string
}

export interface MatchingPair {
  left: string
  right: string
}

export interface QuizQuestion {
  id: number
  type: string
  text: string
  points: number
  mediaType: string
  mediaUrl: string
  required: boolean
  options: QuestionOption[]
  correctAnswer: string
  pairs: MatchingPair[]
  items: string[]
}

// QUIZ RESULTS INTERFACES
export interface QuizResultChoice {
  text: string
  correct: boolean
  percentage: number
}

export interface QuizResultQuestion {
  id: number
  title: string
  text: string
  points: number
  correctPercentage: string
  correctPercentageNum: number
  choices: QuizResultChoice[]
  correctResponses: number
  incorrectResponses: number
}

// STUDENT QUIZ INTERFACES
export interface StudentQuiz {
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

// HEADER INTERFACES
export interface HeaderProps {
  breadcrumb?: string
  showNotification?: boolean
  actionButtons?: boolean
  showQuizCreatorControls?: boolean
  published?: boolean
}

// CLASSROOM DASHBOARD INTERFACES
export interface Student {
  id: number
  name: string
  email: string
  grade: string
  progress: number
  initials: string
  avatar: string
}

// QUIZ VIEW INTERFACES
export interface QuizViewQuestion {
  question: string
  options: string[]
  correctAnswer: number
}
