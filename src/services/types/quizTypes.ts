/**
 * Quiz Service Types
 * Type definitions for quiz-related API operations
 */

export interface QuizChoice {
  choiceId: number
  questionId: number
  body: string
  isCorrect: boolean
}

export interface QuizQuestionDto {
  questionId: number
  quizId: number
  type: string
  body: string
  points: number
  sortOrder: number
  choices: QuizChoice[]
}

export interface QuizPayload {
  quizId: number
  courseId: number
  title: string
  dueAt: string
  timeLimitMinutes: number
  isPublished: boolean
  createdAt: string
  createdBy?: number
  questions: QuizQuestionDto[]
}

export interface QuizResponse {
  quizId?: number
  id?: number
  title?: string
  description?: string
  courseId?: number
  courseName?: string
  course?: {
    name?: string
  }
  timeLimitMinutes?: number
  questions?: QuizQuestionDto[]
  [key: string]: unknown
}

export interface StudentQuizDto {
  quizId?: number
  id?: number
  title: string
  description?: string
  dueAt?: string
  dueDate?: string
  timeLimitMinutes?: number
  maxAttempts?: number
  courseName?: string
  course?: {
    name?: string
  }
  subject?: string
  sectionName?: string
  class?: string
  section?: {
    name?: string
  }
  submittedCount?: number
  submitted?: number
  totalStudents?: number
  total?: number
  color?: string
  isPublished?: boolean
  timeLimit?: string
  questions?: unknown[]
  createdAt?: string
  updatedAt?: string
}

export interface CourseQuizResponse {
  data?: StudentQuizDto[]
  [key: string]: unknown
}
