import api from './api'
import type { TeacherCourseDto } from '@/interfaces/interfaces'

/**
 * Course Service
 * Handles all API calls related to courses
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
}

/**
 * Fetch all courses for a specific teacher
 * @param teacherId - The ID of the teacher
 * @returns Promise with array of teacher courses
 */
export async function getTeacherCourses(teacherId: number) {
  const response = await api.get<TeacherCourseDto[]>(`/Course/teacher/${teacherId}`)
  return response.data || []
}

/**
 * Fetch enrollments for a specific course
 * @param courseId - The ID of the course
 * @param teacherId - The ID of the teacher
 * @returns Promise with array of enrollments
 */
export async function getCourseEnrollments(courseId: number, teacherId: number) {
  const response = await api.get<CourseEnrollment[]>(
    `/Course/${courseId}/enrollments?teacherId=${teacherId}`
  )
  return response.data || []
}

/**
 * Fetch all courses for a specific student
 * @param studentId - The ID of the student
 * @returns Promise with array of student courses
 */
export async function getStudentCourses(studentId: number) {
  const response = await api.get<StudentCourseDto[]>(`/Course/student/${studentId}`)
  return response.data || []
}

/**
 * Create a new course
 * @param courseData - The course data to create
 * @returns Promise with created course data
 */
export async function createCourse(courseData: Partial<TeacherCourseDto>) {
  const response = await api.post('/Course', courseData)
  return response.data
}

/**
 * Update an existing course
 * @param courseId - The ID of the course to update
 * @param courseData - The updated course data
 * @returns Promise with updated course data
 */
export async function updateCourse(courseId: number, courseData: Partial<TeacherCourseDto>) {
  const response = await api.put(`/Course/${courseId}`, courseData)
  return response.data
}

/**
 * Archive a course
 * @param courseId - The ID of the course to archive
 * @returns Promise with response data
 */
export async function archiveCourse(courseId: number) {
  const response = await api.patch(`/Course/${courseId}/archive`)
  return response.data
}

/**
 * Unarchive a course
 * @param courseId - The ID of the course to unarchive
 * @returns Promise with response data
 */
export async function unarchiveCourse(courseId: number) {
  const response = await api.patch(`/Course/${courseId}/unarchive`)
  return response.data
}

/**
 * Delete a course
 * @param courseId - The ID of the course to delete
 * @returns Promise with response data
 */
export async function deleteCourse(courseId: number) {
  const response = await api.delete(`/Course/${courseId}`)
  return response.data
}

export default {
  getTeacherCourses,
  getCourseEnrollments,
  getStudentCourses,
  createCourse,
  updateCourse,
  archiveCourse,
  unarchiveCourse,
  deleteCourse,
}
