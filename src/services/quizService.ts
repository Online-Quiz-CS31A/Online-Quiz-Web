import api from './api'

/**
 * Quiz Service
 * Handles all API calls related to quizzes
 */

// ==================== INTERFACES ====================

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

// ==================== API FUNCTIONS ====================

/**
 * Fetch quizzes for a specific course
 * @param courseId - The ID of the course
 * @param userId - The ID of the user
 * @param isStudent - Whether the user is a student
 * @returns Promise with quiz data
 */
export async function getQuizzesForCourse(
  courseId: number,
  userId: number,
  isStudent: boolean = false
) {
  const response = await api.get<CourseQuizResponse>(
    `/Quiz/course/${courseId}`,
    {
      params: { userId, isStudent }
    }
  )
  return response.data
}

/**
 * Fetch a specific quiz by ID
 * @param quizId - The ID of the quiz
 * @param userId - The ID of the user
 * @returns Promise with quiz details
 */
export async function getQuizById(quizId: number, userId: number) {
  const response = await api.get<QuizResponse>(
    `/Quiz/${quizId}`,
    { params: { userId } }
  )
  return response.data || null
}

/**
 * Create a new quiz
 * @param quizData - The quiz data to create
 * @returns Promise with created quiz data
 */
export async function createQuiz(quizData: QuizPayload) {
  const response = await api.post<QuizResponse>('/Quiz', quizData)
  return response.data
}

/**
 * Update an existing quiz
 * @param quizId - The ID of the quiz to update
 * @param userId - The ID of the user
 * @param quizData - The updated quiz data
 * @returns Promise with updated quiz data
 */
export async function updateQuiz(
  quizId: number,
  userId: number,
  quizData: QuizPayload
) {
  const response = await api.put<QuizResponse>(
    `/Quiz/${quizId}?userId=${userId}`,
    quizData
  )
  return response.data
}

/**
 * Delete a quiz
 * @param quizId - The ID of the quiz to delete
 * @returns Promise with response data
 */
export async function deleteQuiz(quizId: number) {
  const response = await api.delete(`/Quiz/${quizId}`)
  return response.data
}

/**
 * Archive a quiz
 * @param quizId - The ID of the quiz to archive
 * @returns Promise with response data
 */
export async function archiveQuiz(quizId: number) {
  const response = await api.patch(`/Quiz/${quizId}/archive`)
  return response.data
}

/**
 * Unarchive a quiz
 * @param quizId - The ID of the quiz to unarchive
 * @returns Promise with response data
 */
export async function unarchiveQuiz(quizId: number) {
  const response = await api.patch(`/Quiz/${quizId}/unarchive`)
  return response.data
}

/**
 * Publish a quiz
 * @param quizId - The ID of the quiz to publish
 * @returns Promise with response data
 */
export async function publishQuiz(quizId: number) {
  const response = await api.patch(`/Quiz/${quizId}/publish`)
  return response.data
}

/**
 * Unpublish a quiz
 * @param quizId - The ID of the quiz to unpublish
 * @returns Promise with response data
 */
export async function unpublishQuiz(quizId: number) {
  const response = await api.patch(`/Quiz/${quizId}/unpublish`)
  return response.data
}

export default {
  getQuizzesForCourse,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  archiveQuiz,
  unarchiveQuiz,
  publishQuiz,
  unpublishQuiz,
}
