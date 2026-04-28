/**
 * Manual Grading Service
 * Handles essay question grading API calls
 */

import api from './api'

export interface PendingEssayAnswer {
  attemptAnswerId: number
  attemptId: number
  questionId: number
  questionBody: string
  questionPoints: number
  studentAnswer: string
  isCorrect: boolean | null
  pointsAwarded: number | null
  feedback: string | null
  studentName: string
  answeredAt: string
}

export interface PendingEssayQuiz {
  quizId: number
  quizTitle: string
  courseId: number
  courseName: string
  pendingCount: number
  pendingAnswers: PendingEssayAnswer[]
}

export interface PendingEssaysResponse {
  message: string
  totalPending: number
  quizCount: number
  data: PendingEssayQuiz[]
}

export interface GradeEssayRequest {
  isCorrect: boolean
  pointsAwarded?: number
  feedback?: string
}

export interface BulkGradeRequest {
  grades: Array<{
    attemptAnswerId: number
    isCorrect: boolean
    pointsAwarded?: number
    feedback?: string
  }>
}

export interface GradeEssayResponse {
  message: string
  data: {
    answerId: number
    attemptId: number
    questionId: number
    choiceId: number | null
    textAnswer: string
    answeredAt: string
    isCorrect: boolean
  }
}

/**
 * Get all pending essay answers across all courses taught by the teacher
 */
export async function getPendingEssays(): Promise<PendingEssaysResponse> {
  const response = await api.get('/manualgrading/pending')
  return response.data
}

/**
 * Get pending essay answers for a specific quiz
 */
export async function getPendingEssaysByQuiz(quizId: number): Promise<PendingEssaysResponse> {
  const response = await api.get(`/manualgrading/quiz/${quizId}/pending`)
  return response.data
}

/**
 * Grade a single essay answer
 */
export async function gradeEssayAnswer(
  attemptAnswerId: number,
  grade: GradeEssayRequest
): Promise<GradeEssayResponse> {
  const response = await api.post(`/manualgrading/answers/${attemptAnswerId}/grade`, grade)
  return response.data
}

/**
 * Grade multiple essay answers for a single attempt
 */
export async function bulkGradeEssays(
  attemptId: number,
  grades: BulkGradeRequest
): Promise<{ message: string; data: any[] }> {
  const response = await api.post(`/manualgrading/attempts/${attemptId}/grade-bulk`, grades)
  return response.data
}

/**
 * Manually recalculate attempt score (usually automatic)
 */
export async function recalculateAttemptScore(attemptId: number): Promise<{ message: string }> {
  const response = await api.post(`/manualgrading/attempts/${attemptId}/recalculate-score`)
  return response.data
}
