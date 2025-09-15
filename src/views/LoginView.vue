<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCounterStore } from '@/stores/counter'

const router = useRouter()
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const store = useCounterStore()

const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Basic username validation: starts with 01 or 02 and exactly 10 digits total
    const usernamePattern = /^0[12]\d{8}$/
    if (!usernamePattern.test(form.username)) {
      errorMessage.value = 'Username must start with 01 (teacher) or 02 (student) and be exactly 10 digits.'
      return
    }

    // Simulate a short delay (optional)
    await new Promise(resolve => setTimeout(resolve, 600))

    const result = store.login(form.username, form.password)
    if (!result.success) {
      errorMessage.value = result.message || 'Login failed'
      return
    }

    // Persist session regardless of Remember Me for now
    if (store.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(store.currentUser))
    }

    // Navigate based on role
    if (result.role === 'teacher') {
      router.push({ name: 'teacher' })
    } else if (result.role === 'student') {
      router.push({ name: 'student' })
    } else {
      // Fallback to login
      router.push({ name: 'login' })
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
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
          <div class="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
            <font-awesome-icon icon="graduation-cap" class="w-10 h-10 text-white" />
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

        <!-- Error Alert -->
        <div v-if="errorMessage" class="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {{ errorMessage }}
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <font-awesome-icon icon="envelope" class="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Enter your username (01******** or 02********)"
            />
          </div>

          <!-- Password Field -->
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <font-awesome-icon icon="lock" class="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Enter your password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition duration-200"
            >
              <font-awesome-icon v-if="!showPassword" icon="eye" class="h-5 w-5" />
              <font-awesome-icon v-else icon="eye-slash" class="h-5 w-5" />
            </button>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" class="text-sm text-blue-600 hover:text-blue-500 font-medium transition duration-200">
              Forgot password?
            </a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-[1.02]"
          >
            <font-awesome-icon v-if="isLoading" icon="spinner" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <!-- Support Link -->
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-600">
            Need help? Contact your instructor or
            <a href="#" class="text-blue-600 hover:text-blue-500 font-medium transition duration-200">IT Support</a>
          </p>
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-500">
            © 2025 ACLC College of Mandaue. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

