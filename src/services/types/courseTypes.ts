/**
 * Course Service Types
 * Type definitions for course-related API operations
 */

export interface CourseEnrollment {
  enrollmentId?: number
  studentId?: number
  userId?: number
  studentName?: string
  email?: string
  studentNumber?: string
  courseId?: number
  courseName?: string
  courseCode?: string
  enrolledAt?: string
  section?: string          
  studentSection?: string  
  courseSection?: string
  enrolledBy?: number
  enrolledByName?: string
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
  studentSection?: string
}
