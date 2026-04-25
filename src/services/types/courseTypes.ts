/**
 * Course Service Types
 * Type definitions for course-related API operations
 */

export interface CourseEnrollment {
  section?: string
  studentSection?: string
  courseSection?: string
  [key: string]: unknown
}

export interface StudentCourseDto {
  courseId: number
  code: string
  name: string
  instructorName?: string
  instructorUsername?: string
  status: string
  category?: string
  enrollmentCount?: number
  sectionCount?: number
  quizCount?: number
}

export interface ClassmateDto {
  userId: number
  fullName?: string
  email?: string
  studentSection?: string
}
