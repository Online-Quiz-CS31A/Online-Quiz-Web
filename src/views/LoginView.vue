<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// CONSTANTS
const router = useRouter()

// REFS
const showPassword = ref(false)
const isLoading = ref(false)

// REACTIVE
const store = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

// METHODS
const validateEmail = (): boolean => {
  errors.email = ''

  if (!form.email.trim()) {
    errors.email = 'Please enter your email address'
    return false
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    return false
  }

  return true
}

const validatePassword = (): boolean => {
  errors.password = ''

  if (!form.password) {
    errors.password = 'Please enter your password'
    return false
  }

  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long'
    return false
  }

  return true
}

const handleLogin = async () => {
  // Validate all fields
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()

  if (!isEmailValid || !isPasswordValid) {
    return
  }

  isLoading.value = true

  try {
    const result = await store.login(form.email, form.password)
    if (!result.success) {
      // Log the technical error for debugging
      console.error('Login failed:', {
        email: form.email,
        message: result.message,
        timestamp: new Date().toISOString()
      })

      // Show user-friendly error message
      errors.email = 'Unable to sign in. Please check your email and password.'
      return
    }

    if (result.role === 'teacher') {
      router.push({ name: 'teacher' })
    } else if (result.role === 'student') {
      router.push({ name: 'student' })
    } else if (result.role === 'admin') {
      router.push({ name: 'admin-dashboard' })
    } else {
      router.push({ name: 'login' })
    }
  } catch (error) {
    // Log the technical error with full details for debugging
    console.error('Login error:', {
      error,
      email: form.email,
      timestamp: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    // Show user-friendly error message
    errors.email = 'Something went wrong. Please try again in a moment.'
  } finally {
    isLoading.value = false
  }
}

const clearEmailError = () => {
  errors.email = ''
}

const clearPasswordError = () => {
  errors.password = ''
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Left Side - Welcome Content -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
        <!-- Logo -->
        <div class="mb-8">
          <div class="w-20 h-20 bg-white bg-opacity-20 rounded-[50%] flex items-center justify-center mb-6 backdrop-blur-sm">
            <!-- <font-awesome-icon icon="graduation-cap" class="w-10 h-10 text-white" /> -->
            <img src="/src/assets/image/ACLC.png"/>
          </div>
          <h1 class="text-4xl font-bold mb-2">ACLC College of Mandaue</h1>
          <p class="text-xl text-blue-100 font-medium">Online Quiz System</p>
        </div>

        <!-- Welcome Text -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">Welcome Back!</h2>
          <p class="text-lg text-blue-100 leading-relaxed">
            Access your personalized learning dashboard and take your quizzes with confidence.
          </p>
          <div class="space-y-2 text-blue-100">
            <div class="flex items-center space-x-3">
              <font-awesome-icon icon="check" class="w-5 h-5" />
              <span>Secure and reliable platform</span>
            </div>
            <div class="flex items-center space-x-3">
               <font-awesome-icon icon="check" class="w-5 h-5" />
               <span>Real-time progress tracking</span>
             </div>
             <div class="flex items-center space-x-3">
               <font-awesome-icon icon="check" class="w-5 h-5" />
               <span>Instant feedback and results</span>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
      <div class="w-full max-w-md">
        <!-- Mobile Logo (visible on small screens) -->
        <div class="lg:hidden text-center mb-8">
          <div class="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <font-awesome-icon icon="graduation-cap" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-1">ACLC College of Mandaue</h1>
          <p class="text-blue-600 font-medium">Online Quiz System</p>
        </div>

        <!-- Login Form Header -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p class="text-gray-600">Enter your credentials to access your account</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6" novalidate>
          <!-- Email Field -->
          <div>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <font-awesome-icon icon="envelope" :class="['h-5 w-5', errors.email ? 'text-red-400' : 'text-gray-400']" />
              </div>
              <input
                id="email"
                v-model="form.email"
                type="text"
                @blur="validateEmail"
                @input="clearEmailError"
                :class="[
                  'w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200',
                  errors.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                ]"
                placeholder="Enter your email address"
              />
            </div>
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <font-awesome-icon icon="lock" :class="['h-5 w-5', errors.password ? 'text-red-400' : 'text-gray-400']" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                @blur="validatePassword"
                @input="clearPasswordError"
                :class="[
                  'w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200',
                  errors.password
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                ]"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition duration-200"
              >
                <font-awesome-icon v-if="!showPassword" icon="eye" class="h-5 w-5 cursor-pointer" />
                <font-awesome-icon v-else icon="eye-slash" class="h-5 w-5 cursor-pointer" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <!-- <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" class="text-sm text-blue-600 hover:text-blue-500 font-medium transition duration-200">
              Forgot password?
            </a>
          </div> -->

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-[1.02] cursor-pointer"
          >
            <font-awesome-icon v-if="isLoading" icon="spinner" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <!-- Support Link -->
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-600">
            Need help? Contact School Administration or your Instructor.
          </p>
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-500">
            © 2026 ACLC College of Mandaue. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

