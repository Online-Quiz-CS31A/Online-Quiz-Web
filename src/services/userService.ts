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
