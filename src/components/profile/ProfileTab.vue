<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'

interface UpdateUserPayload {
  fullName: string
  email: string
  contactNumber: string
  emergencyContactPerson: string
  emergencyContactNumber: string
}

interface ApiValidationError {
  [key: string]: string[]
}

interface AxiosErrorLike {
  response?: {
    data?: {
      error?: string
      errors?: ApiValidationError
    }
  }
  message?: string
}

// REACTIVE
const auth = useAuthStore()
const classesStore = useCoursesStore()
const sectionsStore = useSectionsStore()
const quizzesStore = useQuizzesStore()

// COMPUTED
const isTeacher = computed(() => auth.userRole === 'teacher')

const coursesCount = computed(() => classesStore.myClasses.length)

const studentsCount = computed(() => {
  if (!isTeacher.value) return 0

  const teacherCourses = classesStore.myClasses
  let totalStudents = 0

  for (const course of teacherCourses) {
    const sections = sectionsStore.getSectionsByCourse(course.id)
    for (const section of sections) {
      totalStudents += section.studentUsernames.length
    }
  }

  return totalStudents
})

const quizzesCount = computed(() => (isTeacher.value ? quizzesStore.myTeacherQuizzes.length : quizzesStore.myStudentQuizzes.length))

// REFS
const loading = ref(true)
const submitting = ref(false)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const emergencyContactName = ref('')
const emergencyContactNumber = ref('')
const department = ref('')
const yearLevel = ref('')
const program = ref('')

// INITIAL VALUES — snapshot after profile load, used to detect changes
const initialEmail = ref('')
const initialPhone = ref('')
const initialEmergencyContactName = ref('')
const initialEmergencyContactNumber = ref('')

const hasChanges = computed(() => {
  return (
    email.value !== initialEmail.value ||
    phone.value !== initialPhone.value ||
    emergencyContactName.value !== initialEmergencyContactName.value ||
    emergencyContactNumber.value !== initialEmergencyContactNumber.value
  )
})

// ERROR HANDLING
interface FieldErrors {
  email: string
  phone: string
  emergencyContactName: string
  emergencyContactNumber: string
}

const errors = reactive<FieldErrors>({
  email: '',
  phone: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
})

const fullName = computed(() => `${firstName.value} ${lastName.value}`.trim() || 'Guest')
const subtitle = computed(() => {
  return isTeacher.value
    ? (department.value || 'Department')
    : `${yearLevel.value || 'Year'}${program.value ? ' • ' : ''}${program.value || ''}`
})

const initials = computed(() => {
  const first = firstName.value.charAt(0).toUpperCase()
  const last = lastName.value.charAt(0).toUpperCase()
  return first + last || 'U'
})

// PHONE NUMBER HELPERS
function sanitizePhoneInput(value: string): string {
  let sanitized = value.replace(/[^0-9+]/g, '')
  // Only allow '+' at the start
  if (sanitized.indexOf('+') > 0) {
    sanitized = sanitized[0] + sanitized.slice(1).replace(/\+/g, '')
  }
  // If user started with '0', strip any '+'
  if (sanitized.startsWith('0') && sanitized.includes('+')) {
    sanitized = sanitized.replace(/\+/g, '')
  }
  // If user started with '+', ensure it's only '+63'
  if (sanitized.startsWith('+')) {
    const afterPlus = sanitized.slice(1)
    if (afterPlus.length > 0 && !afterPlus.startsWith('63')) {
      // Strip the '+' if not followed by '63' (non-PH country code)
      sanitized = afterPlus
    }
  }
  return sanitized
}

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/[^0-9]/g, '')
  if (!digits) return ''
  if (value.startsWith('+63')) {
    const after63 = digits.slice(2).slice(0, 10)
    return `+63${after63}`
  }
  if (value.startsWith('0')) {
    const after0 = digits.slice(1).slice(0, 10)
    return `0${after0}`
  }
  return digits.slice(0, 10)
}

// Strict PH phone: +639xxxxxxxxx (13 chars) or 09xxxxxxxxx (11 digits)
const PH_PHONE_REGEX = /^(\+639\d{9}|09\d{9})$/

function isValidPhilippinePhone(value: string): boolean {
  if (!value.trim()) return true
  return PH_PHONE_REGEX.test(value.replace(/[\s\-]/g, ''))
}

// VALIDATION FUNCTIONS
function validateEmail(value: string): string {
  if (!value.trim()) {
    return 'Email is required'
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return 'Invalid email format'
  }
  if (value.length > 255) {
    return 'Email must not exceed 255 characters'
  }
  return ''
}

function validatePhone(value: string): string {
  if (!value.trim()) {
    return ''
  }
  if (value.length > 50) {
    return 'Phone number must not exceed 50 characters'
  }
  if (!isValidPhilippinePhone(value)) {
    return 'Enter a valid Philippine number (e.g., +639xxxxxxxxx or 09xxxxxxxxx)'
  }
  return ''
}

function validateEmergencyContactName(value: string): string {
  if (!value.trim()) {
    return ''
  }
  if (value.length > 255) {
    return 'Emergency contact name must not exceed 255 characters'
  }
  if (value.trim().length < 2) {
    return 'Emergency contact name must be at least 2 characters'
  }
  return ''
}

function validateEmergencyContactNumber(value: string): string {
  if (!value.trim()) {
    return ''
  }
  if (value.length > 50) {
    return 'Emergency contact number must not exceed 50 characters'
  }
  if (!isValidPhilippinePhone(value)) {
    return 'Enter a valid Philippine number (e.g., +639xxxxxxxxx or 09xxxxxxxxx)'
  }
  return ''
}

// REACTIVE VALIDATION
function onEmailBlur() {
  errors.email = validateEmail(email.value)
}

function onPhoneBlur() {
  errors.phone = validatePhone(phone.value)
}

function onEmergencyContactNameBlur() {
  errors.emergencyContactName = validateEmergencyContactName(emergencyContactName.value)
}

function onEmergencyContactNumberBlur() {
  errors.emergencyContactNumber = validateEmergencyContactNumber(emergencyContactNumber.value)
}

function onEmailInput() {
  if (errors.email) {
    errors.email = ''
  }
}

function onPhoneInput() {
  phone.value = sanitizePhoneInput(phone.value)
  if (errors.phone) {
    errors.phone = ''
  }
}

function onEmergencyContactNameInput() {
  if (errors.emergencyContactName) {
    errors.emergencyContactName = ''
  }
}

function onEmergencyContactNumberInput() {
  emergencyContactNumber.value = sanitizePhoneInput(emergencyContactNumber.value)
  if (errors.emergencyContactNumber) {
    errors.emergencyContactNumber = ''
  }
}

// METHODS
async function fetchCurrentUserProfile() {
  try {
    loading.value = true
    const response = await api.get('/Auth/verify-me')
    const userData = response.data

    const nameParts = (userData.fullName || '').split(' ')
    firstName.value = nameParts[0] || ''
    lastName.value = nameParts.slice(1).join(' ') || ''

    email.value = userData.email || ''
    phone.value = userData.contactNumber || ''
    emergencyContactName.value = userData.emergencyContactPerson || ''
    emergencyContactNumber.value = userData.emergencyContactNumber || ''

    initialEmail.value = email.value
    initialPhone.value = phone.value
    initialEmergencyContactName.value = emergencyContactName.value
    initialEmergencyContactNumber.value = emergencyContactNumber.value

    if (isTeacher.value && userData.teacher) {
      department.value = userData.teacher.department || ''
    }

    if (!isTeacher.value && userData.student) {
      const yearLevelMap: Record<number, string> = {
        1: '1st Year',
        2: '2nd Year',
        3: '3rd Year',
        4: '4th Year',
      }
      yearLevel.value = yearLevelMap[userData.student.yearLevel] || '1st Year'
      program.value = userData.student.course || ''
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    showError('Failed to load profile data')
  } finally {
    loading.value = false
  }
}

function onCancel() {
  errors.email = ''
  errors.phone = ''
  errors.emergencyContactName = ''
  errors.emergencyContactNumber = ''

  fetchCurrentUserProfile()
}

const { success, error: showError } = useToast()

async function onSubmit(e: Event) {
  e.preventDefault()

  // Validate all fields
  errors.email = validateEmail(email.value)
  errors.phone = validatePhone(phone.value)
  errors.emergencyContactName = validateEmergencyContactName(emergencyContactName.value)
  errors.emergencyContactNumber = validateEmergencyContactNumber(emergencyContactNumber.value)

  const hasErrors = Object.values(errors).some(err => err !== '')
  if (hasErrors) {
    showError('Please fix all validation errors before submitting')
    return
  }

  try {
    submitting.value = true
    const userId = auth.currentUser?.id
    if (!userId) {
      showError('User not found')
      return
    }

    const updatePayload: UpdateUserPayload = {
      fullName: `${firstName.value} ${lastName.value}`.trim(),
      email: email.value.trim(),
      contactNumber: formatPhoneNumber(phone.value),
      emergencyContactPerson: emergencyContactName.value.trim(),
      emergencyContactNumber: formatPhoneNumber(emergencyContactNumber.value),
    }

    await api.put(`/User/${userId}`, updatePayload)

    success('Profile updated successfully!')

    initialEmail.value = email.value
    initialPhone.value = phone.value
    initialEmergencyContactName.value = emergencyContactName.value
    initialEmergencyContactNumber.value = emergencyContactNumber.value

    await fetchCurrentUserProfile()
  } catch (err: unknown) {
    console.error('Failed to update profile:', err)

    const error = err as AxiosErrorLike

    if (error.response?.data?.error) {
      showError(error.response.data.error)
    } else if (error.response?.data?.errors) {
      const validationErrors = error.response.data.errors
      Object.keys(validationErrors).forEach(key => {
        const fieldName = key.toLowerCase()
        if (fieldName.includes('email')) {
          errors.email = validationErrors[key][0]
        } else if (fieldName.includes('contactnumber')) {
          errors.phone = validationErrors[key][0]
        } else if (fieldName.includes('emergencycontactperson')) {
          errors.emergencyContactName = validationErrors[key][0]
        } else if (fieldName.includes('emergencycontactnumber')) {
          errors.emergencyContactNumber = validationErrors[key][0]
        }
      })
      showError('Please fix the validation errors')
    } else {
      showError('Failed to update profile. Please try again.')
    }
  } finally {
    submitting.value = false
  }
}

// LIFECYCLE
onMounted(async () => {
  await fetchCurrentUserProfile()

  if (isTeacher.value) {
    await classesStore.fetchTeacherCourses()
    await quizzesStore.fetchTeacherQuizzes()
  } else {
    await classesStore.fetchStudentCourses()
    await quizzesStore.fetchStudentQuizzesAsync()
  }
})
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center h-full">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
  </div>
  <div v-else class="h-full flex flex-col lg:flex-row gap-4 md:gap-6">
    <!-- Left Sidebar -->
    <div class="w-full lg:w-80 flex-shrink-0 space-y-4">
      <!-- Profile Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div class="flex flex-row lg:flex-col items-center gap-4 lg:gap-0">
          <div class="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-md lg:mb-4 flex-shrink-0">
            {{ initials }}
          </div>
          <div class="flex-1 lg:text-center">
            <h3 class="text-base md:text-lg font-semibold text-gray-900">{{ fullName }}</h3>
            <p class="text-xs md:text-sm text-gray-600 mt-1">{{ subtitle }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
        <h4 class="text-xs md:text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <i class="fas fa-chart-bar text-sky-600 mr-2"></i>
          Quick Stats
        </h4>
        <div class="grid grid-cols-3 lg:grid-cols-1 gap-2 md:gap-3">
          <div class="flex flex-col lg:flex-row items-center lg:justify-between p-2 bg-blue-50 rounded">
            <span class="text-xs md:text-sm text-gray-700 flex items-center">
              <i class="fas fa-book text-blue-600 mr-1 md:mr-2 w-4"></i>
              <span class="hidden sm:inline">Courses</span>
            </span>
            <span class="text-xs md:text-sm font-semibold text-blue-700 mt-1 lg:mt-0">{{ coursesCount }}</span>
          </div>
          <div v-if="isTeacher" class="flex flex-col lg:flex-row items-center lg:justify-between p-2 bg-green-50 rounded">
            <span class="text-xs md:text-sm text-gray-700 flex items-center">
              <i class="fas fa-users text-green-600 mr-1 md:mr-2 w-4"></i>
              <span class="hidden sm:inline">Students</span>
            </span>
            <span class="text-xs md:text-sm font-semibold text-green-700 mt-1 lg:mt-0">{{ studentsCount }}</span>
          </div>
          <div class="flex flex-col lg:flex-row items-center lg:justify-between p-2 bg-purple-50 rounded">
            <span class="text-xs md:text-sm text-gray-700 flex items-center">
              <i class="fas fa-clipboard-list text-purple-600 mr-1 md:mr-2 w-4"></i>
              <span class="hidden sm:inline">Quizzes</span>
            </span>
            <span class="text-xs md:text-sm font-semibold text-purple-700 mt-1 lg:mt-0">{{ quizzesCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0">
      <div class="p-4 md:p-6 border-b border-gray-200">
        <h2 class="text-base md:text-lg font-semibold text-gray-900 flex items-center">
          <i class="fas fa-user-circle text-sky-600 mr-2"></i>
          Profile Information
        </h2>
      </div>

      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        <form @submit="onSubmit" class="space-y-4 md:space-y-6">
          <!-- Personal Details -->
          <div>
            <h3 class="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
              <i class="fas fa-id-card text-gray-500 mr-2"></i>
              Personal Details
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5" for="first-name">
                  First Name <span class="text-gray-400 text-xs">(Read-only)</span>
                </label>
                <input v-model="firstName" type="text" id="first-name" disabled class="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5" for="last-name">
                  Last Name <span class="text-gray-400 text-xs">(Read-only)</span>
                </label>
                <input v-model="lastName" type="text" id="last-name" disabled class="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed" />
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div>
            <h3 class="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
              <i class="fas fa-address-book text-gray-500 mr-2"></i>
              Contact Information
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5" for="email">
                  <i class="fas fa-envelope text-xs mr-1"></i>Email Address
                </label>
                <input
                  v-model="email"
                  type="text"
                  id="email"
                  @blur="onEmailBlur"
                  @input="onEmailInput"
                  :class="[
                    'w-full px-3 py-2 text-xs md:text-sm border rounded transition-colors',
                    errors.email
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500'
                  ]"
                />
                <p v-if="errors.email" class="mt-1 text-xs text-red-600">
                  <i class="fas fa-exclamation-circle mr-1"></i>{{ errors.email }}
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5" for="phone">
                  <i class="fas fa-phone text-xs mr-1"></i>Phone Number
                </label>
                <input
                  v-model="phone"
                  type="tel"
                  inputmode="tel"
                  id="phone"
                  placeholder="+639xxxxxxxxx"
                  @blur="onPhoneBlur"
                  @input="onPhoneInput"
                  :class="[
                    'w-full px-3 py-2 text-xs md:text-sm border rounded transition-colors',
                    errors.phone
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500'
                  ]"
                />
                <p v-if="errors.phone" class="mt-1 text-xs text-red-600">
                  <i class="fas fa-exclamation-circle mr-1"></i>{{ errors.phone }}
                </p>
              </div>
            </div>
          </div>

          <!-- Academic Information -->
          <div v-if="isTeacher">
            <h3 class="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
              <i class="fas fa-building text-gray-500 mr-2"></i>
              Academic Information
            </h3>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5" for="department">
                Department <span class="text-gray-400 text-xs">(Read-only)</span>
              </label>
              <input v-model="department" type="text" id="department" disabled class="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed" />
            </div>
          </div>

          <div v-else>
            <h3 class="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
              <i class="fas fa-graduation-cap text-gray-500 mr-2"></i>
              Academic Information
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5" for="year">
                  Year Level <span class="text-gray-400 text-xs">(Read-only)</span>
                </label>
                <select v-model="yearLevel" id="year" disabled class="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed">
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5" for="program">
                  Course/Program <span class="text-gray-400 text-xs">(Read-only)</span>
                </label>
                <input v-model="program" type="text" id="program" disabled class="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed" />
              </div>
            </div>
          </div>

          <!-- Emergency Contact -->
          <div>
            <h3 class="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
              <i class="fas fa-exclamation-triangle text-red-600 mr-2"></i>
              Emergency Contact
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5" for="emergency-name">
                  <i class="fas fa-user-shield text-xs mr-1"></i>Contact Person
                </label>
                <input
                  v-model="emergencyContactName"
                  type="text"
                  id="emergency-name"
                  placeholder="Full Name"
                  @blur="onEmergencyContactNameBlur"
                  @input="onEmergencyContactNameInput"
                  :class="[
                    'w-full px-3 py-2 text-xs md:text-sm border rounded transition-colors',
                    errors.emergencyContactName
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  ]"
                />
                <p v-if="errors.emergencyContactName" class="mt-1 text-xs text-red-600">
                  <i class="fas fa-exclamation-circle mr-1"></i>{{ errors.emergencyContactName }}
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5" for="emergency-phone">
                  <i class="fas fa-phone-alt text-xs mr-1"></i>Contact Number
                </label>
                <input
                  v-model="emergencyContactNumber"
                  type="tel"
                  inputmode="tel"
                  id="emergency-phone"
                  placeholder="+639xxxxxxxxx"
                  @blur="onEmergencyContactNumberBlur"
                  @input="onEmergencyContactNumberInput"
                  :class="[
                    'w-full px-3 py-2 text-xs md:text-sm border rounded transition-colors',
                    errors.emergencyContactNumber
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  ]"
                />
                <p v-if="errors.emergencyContactNumber" class="mt-1 text-xs text-red-600">
                  <i class="fas fa-exclamation-circle mr-1"></i>{{ errors.emergencyContactNumber }}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Actions -->
      <div class="p-3 md:p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
        <button
          type="button"
          @click="onCancel"
          :disabled="submitting"
          class="w-full sm:w-auto px-4 py-2 text-xs md:text-sm font-medium border border-gray-300 rounded text-gray-700 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-times mr-1.5"></i>Cancel
        </button>
        <button
          type="submit"
          @click="onSubmit"
          :disabled="submitting || !hasChanges"
          class="w-full sm:w-auto px-4 py-2 text-xs md:text-sm font-medium bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <i v-if="!submitting" class="fas fa-save mr-1.5"></i>
          <i v-else class="fas fa-spinner fa-spin mr-1.5"></i>
          {{ submitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>
