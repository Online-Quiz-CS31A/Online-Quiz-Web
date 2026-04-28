/**
 * User API Service
 * Handles all user-related API calls
 */

import { apiClient, type ApiResponse } from './api'

export interface UserDto {
  userId: number
  email: string
  fullName: string
  status: string
  contactNumber?: string
  emergencyContactNumber?: string
  createdAt: string
  updatedAt: string
  roles: string[]
}

export interface TeacherDto {
  userId: number
  department?: string
  user: UserDto
}

export interface StudentDto {
  userId: number
  studentNumber: string
  yearLevel?: number
  section?: string
  course?: string
  user: UserDto
}

export interface CreateUserDto {
  email: string
  password: string
  fullName: string
  contactNumber?: string
  emergencyContactNumber?: string
  roles: string[]
  department?: string
  studentNumber?: string
  yearLevel?: number
  section?: string
  course?: string
}

export interface UpdateUserDto {
  fullName?: string
  contactNumber?: string
  emergencyContactNumber?: string
  status?: string
}

export interface GetAllUsersResponse {
  success: boolean
  message: string
  data: UserDto[]
  count: number
  timestamp: string
}

export interface GetUserByIdResponse {
  success: boolean
  message: string
  data: UserDto
  timestamp: string
}

export interface GetUsersByRoleResponse {
  success: boolean
  message: string
  roleName: string
  dataType: string
  data: TeacherDto[] | StudentDto[] | UserDto[]
  count: number
  timestamp: string
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<ApiResponse<UserDto[]>> {
  return apiClient.get<UserDto[]>('/api/users')
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<ApiResponse<UserDto>> {
  return apiClient.get<UserDto>(`/api/users/${id}`)
}

/**
 * Get users by role (Student, Teacher, or Admin)
 */
export async function getUsersByRole(
  roleName: 'Student' | 'Teacher' | 'Admin'
): Promise<ApiResponse<TeacherDto[] | StudentDto[] | UserDto[]>> {
  return apiClient.get(`/api/users/role/${roleName}`)
}

/**
 * Create a new user
 */
export async function createUser(userData: CreateUserDto): Promise<ApiResponse<UserDto>> {
  return apiClient.post<UserDto>('/api/users', userData)
}

/**
 * Update an existing user
 */
export async function updateUser(id: number, userData: UpdateUserDto): Promise<ApiResponse<UserDto>> {
  return apiClient.put<UserDto>(`/api/users/${id}`, userData)
}

/**
 * Delete a user
 */
export async function deleteUser(id: number): Promise<ApiResponse<{ deletedUserId: number }>> {
  return apiClient.delete<{ deletedUserId: number }>(`/api/users/${id}`)
}

/**
 * Archive a user
 * @param userId - The ID of the user to archive
 * @returns Promise with response data
 */
export async function archiveUser(userId: number) {
  const response = await apiClient.post(`/user/${userId}/archive`)
  return response.data
}

/**
 * Unarchive a user
 * @param userId - The ID of the user to unarchive
 * @returns Promise with response data
 */
export async function unarchiveUser(userId: number) {
  const response = await apiClient.post(`/user/${userId}/unarchive`)
  return response.data
}

/**
 * Bulk archive users
 * @param ids - Array of user IDs to archive
 * @returns Promise with bulk operation result
 */
export async function bulkArchiveUsers(ids: number[]) {
  const response = await apiClient.post('/user/bulk-archive', { ids })
  return response.data
}

/**
 * Bulk unarchive users
 * @param ids - Array of user IDs to unarchive
 * @returns Promise with bulk operation result
 */
export async function bulkUnarchiveUsers(ids: number[]) {
  const response = await apiClient.post('/user/bulk-unarchive', { ids })
  return response.data
}

/**
 * Get archived users
 * @returns Promise with array of archived users
 */
export async function getArchivedUsers() {
  const response = await apiClient.get('/user/archived')
  return response.data || []
}

/**
 * Get archived users (paginated)
 * @param pageNumber - Page number
 * @param pageSize - Items per page
 * @returns Promise with paginated archived users
 */
export async function getArchivedUsersPaged(pageNumber = 1, pageSize = 10) {
  const response = await apiClient.get(`/user/archived/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  return response.data
}

/**
 * Get user archive statistics
 * @returns Promise with archive statistics
 */
export async function getUserArchiveStatistics() {
  const response = await apiClient.get('/user/archive-statistics')
  return response.data
}
