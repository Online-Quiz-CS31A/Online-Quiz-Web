import api from './api'
import type {
  QuizPayload,
  QuizResponse,
  CourseQuizResponse
} from './types'

/**
 * Quiz Service
 * Handles all API calls related to quizzes
 */

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
  const response = await api.post(`/Quiz/${quizId}/archive`)
  return response.data
}

/**
 * Unarchive a quiz
 * @param quizId - The ID of the quiz to unarchive
 * @returns Promise with response data
 */
export async function unarchiveQuiz(quizId: number) {
  const response = await api.post(`/Quiz/${quizId}/unarchive`)
  return response.data
}

/**
 * Get archived quizzes for a course
 * @param courseId - The ID of the course
 * @returns Promise with archived quizzes data
 */
export async function getArchivedQuizzesForCourse(courseId: number) {
  const response = await api.get(`/Quiz/course/${courseId}/archived`)
  return response.data
}

/**
 * Get archived quizzes for a course (paginated)
 * @param courseId - The ID of the course
 * @param pageNumber - Page number (default: 1)
 * @param pageSize - Page size (default: 10)
 * @returns Promise with paginated archived quizzes data
 */
export async function getArchivedQuizzesForCoursePaginated(
  courseId: number,
  pageNumber: number = 1,
  pageSize: number = 10
) {
  const response = await api.get(`/Quiz/course/${courseId}/archived/paged`, {
    params: { pageNumber, pageSize }
  })
  return response.data
}

/**
 * Bulk archive quizzes
 * @param quizIds - Array of quiz IDs to archive
 * @returns Promise with bulk operation result
 */
export async function bulkArchiveQuizzes(quizIds: number[]) {
  const response = await api.post('/Quiz/bulk-archive', { ids: quizIds })
  return response.data
}

/**
 * Bulk unarchive quizzes
 * @param quizIds - Array of quiz IDs to unarchive
 * @returns Promise with bulk operation result
 */
export async function bulkUnarchiveQuizzes(quizIds: number[]) {
  const response = await api.post('/Quiz/bulk-unarchive', { ids: quizIds })
  return response.data
}

/**
 * Get quiz archive statistics
 * @param courseId - Optional course ID to filter statistics
 * @returns Promise with archive statistics
 */
export async function getQuizArchiveStatistics(courseId?: number) {
  const response = await api.get('/Quiz/archive-statistics', {
    params: courseId ? { courseId } : undefined
  })
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

/**
 * Fetch quiz attempts for a specific student
 * @param studentId - The ID of the student
 * @returns Promise with attempt data
 */
export async function getStudentAttempts(studentId: number) {
  const response = await api.get(`/Attempt/student/${studentId}`)
  return response.data
}

/**
 * Fetch all quiz attempts for students in a course
 * @param courseId - The ID of the course
 * @returns Promise with attempts data
 */
export async function getCourseAttempts(courseId: number) {
  const response = await api.get(`/Attempt/course/${courseId}`)
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
  getArchivedQuizzesForCourse,
  getArchivedQuizzesForCoursePaginated,
  bulkArchiveQuizzes,
  bulkUnarchiveQuizzes,
  getQuizArchiveStatistics,
  publishQuiz,
  unpublishQuiz,
  getStudentAttempts,
  getCourseAttempts,
}
