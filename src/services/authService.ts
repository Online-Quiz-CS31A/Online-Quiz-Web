/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { apiClient, type ApiResponse } from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface UserSummary {
  id: number
  email: string
  fullName: string
  roles: string[]
}

export interface LoginResponse {
  accessToken?: string | null
  refreshToken?: string | null
  tokenType: string
  expiresIn: number
  refreshExpiresIn?: number | null
  user: UserSummary
}

export interface VerifyTokenResponse {
  valid: boolean
  user: {
    id: string
    email: string
    name: string
    roles: string[]
  }
  tokenExpiry: string
  timestamp: string
}

export interface LogoutResponse {
  message: string
  user?: {
    id: string
    email: string
  }
  timestamp: string
}

/**
 * Login user with email and password
 */
export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  return apiClient.post<LoginResponse>('/api/Auth/login', {
    email,
    password,
  })
}

/**
 * Logout current user
 */
export async function logout(): Promise<ApiResponse<LogoutResponse>> {
  return apiClient.post<LogoutResponse>('/api/Auth/logout')
}

/**
 * Verify current authentication token
 */
export async function verifyToken(): Promise<ApiResponse<VerifyTokenResponse>> {
  return apiClient.get<VerifyTokenResponse>('/api/Auth/verify')
}

/**
 * Refresh authentication token
 */
export async function refreshToken(): Promise<ApiResponse<LoginResponse>> {
  return apiClient.post<LoginResponse>('/api/Auth/refresh')
}
