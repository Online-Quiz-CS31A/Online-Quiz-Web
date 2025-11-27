/**
 * API Configuration and Base HTTP Client
 * This service handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5201'

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  timestamp?: string
}

export interface ApiError {
  success: false
  message: string
  error?: string
}

/**
 * Base HTTP client using native fetch API
 */
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Client-Type': 'web',
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', 
    }

    try {
      const response = await fetch(url, config)
      
      let data: any
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        throw {
          success: false,
          message: data?.message || data?.title || 'Request failed',
          error: data?.error || response.statusText,
          status: response.status,
        }
      }

      // Return successful response
      return data
    } catch (error: any) {
      // Network error or fetch error
      if (error.success === false) {
        throw error
      }
      
      throw {
        success: false,
        message: error.message || 'Network error occurred',
        error: 'NETWORK_ERROR',
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Export API_BASE_URL for reference
export { API_BASE_URL }
