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
  status?: 'Active' | 'Archived'
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
export type Role = 'teacher' | 'student' | 'admin'
export interface User {
  username: string
  password: string
  role: Role
  name?: string
  id?: number
  email?: string
  roles?: string[]
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
  status?: 'draft' | 'published'
  questions?: any[]
  createdAt?: string
  updatedAt?: string
  ownerUsername?: string
  archived?: boolean
  timeLimit?: string
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
  maxAttempts?: number
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
  section?: string
  instructorId?: number
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
  contactNumber?: string
  emergencyContactNumber?: string
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

export interface QuizAttempt {
  attempt: string
  date: string
  score: string
  mark: string
}

export interface QuizAttemptHistory {
  attemptNumber: number
  quizId: number
  studentUsername: string
  score: number
  totalPoints: number
  percentage: number
  completedAt: string
  answers: Record<number, any>
  durationSeconds?: number
}

// HEADER INTERFACES
export interface HeaderProps {
  breadcrumb?: string
  showNotification?: boolean
  actionButtons?: boolean
  showQuizCreatorControls?: boolean
  published?: boolean
  archivedQuiz?: boolean
}

// CLASSROOM DASHBOARD INTERFACES
export interface Student {
  id: number
  name: string
  email: string
  initials: string
  avatar: string
}

// QUIZ VIEW INTERFACES
export interface QuizViewQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

// STUDENT COURSE SCORE ITEMS
export interface MyScoreItem {
  title: string
  score: number
  total: number
  percent: number
  due: string
  status: 'Answered' | 'Unanswered'
}

// ANALYTICS INTERFACES
export interface LogEntry {
  id: string
  timestamp: string
  type: 'login' | 'quiz_created' | 'quiz_submitted' | 'warning' | 'user_created' | 'data_export'
  user: string
  action: string
  details: string
  severity: 'info' | 'warning' | 'error' | 'success'
}

export interface AnalyticsSummary {
  totalLogins: number
  quizzesCreated: number
  warningsIssued: number
  activeUsers: number
}

// QUIZ SETTINGS INTERFACES
export interface QuizSettings {
  defaultTimeLimit: number
  allowRetakes: boolean
  maxRetakes: number
  retakeCooldown: number
  tabSwitchWarningThreshold: number
  tabSwitchAutoSubmit: boolean
  showCorrectAnswers: boolean
  showScoreImmediately: boolean
  passingScore: number
  randomizeQuestions: boolean
  randomizeOptions: boolean
  allowReview: boolean
}

export interface Participant {
  name: string
  email: string
  avatar: string
  section: string
  score: number
  totalPoints: number
  percentage: number
  time: string
}

export interface ReviewQuestion {
  id: number
  answered: boolean
}

export interface ScoreReviewQuestion {
  question: string
  options: string[]
  correctAnswer: number
  userAnswer: any
  isCorrect: boolean
  points: number
  questionType?: string
  correctAnswerText?: string
  userAnswerText?: string
  matchingPairs?: {
    left: string
    right: string
    userIndex?: number
    userRight?: string
    isCorrect: boolean
  }[]
}

export interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
}

// CLASSROOM DASHBOARD/TABS SHARED TYPES
export type TabKey = 'dashboard' | 'people' | 'grades'

export interface QuizBreakdown {
  title: string
  score: number
  total: number
  percent: number
  due: string
  status: 'Submitted' | 'Missing'
}

export interface GradeRow {
  id: number
  name: string
  email: string
  assignments: number
  quizzes: number
  exams: number
  final: number
}

export type GradeCol = 'name' | 'quizzes' | 'final'

export interface StudentItem {
  id: number
  name: string
  email: string
  avatar: string
}

export interface TeacherCourseDto {
  courseId: number
  code: string
  name: string
  instructorId: number
  instructorName: string
  status: string
  category: string
  section: string
  createdAt: string
  students?: number
}
