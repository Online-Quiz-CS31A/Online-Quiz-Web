<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'

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
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const emergencyContactName = ref('')
const emergencyContactNumber = ref('')
const department = ref('')
const yearLevel = ref('')
const program = ref('')

const fullName = computed(() => `${firstName.value} ${lastName.value}`.trim() || 'Guest')
const subtitle = computed(() => {
  return isTeacher.value
    ? (department.value || 'Department')
    : `${yearLevel.value || 'Year'}${program.value ? ' • ' : ''}${program.value || ''}`
})

// Generate initials for avatar
const initials = computed(() => {
  const first = firstName.value.charAt(0).toUpperCase()
  const last = lastName.value.charAt(0).toUpperCase()
  return first + last || 'U'
})

// METHODS
async function fetchCurrentUserProfile() {
  try {
    loading.value = true
    const response = await api.get('/Auth/verify-me')
    const userData = response.data

    // Parse full name
    const nameParts = (userData.fullName || '').split(' ')
    firstName.value = nameParts[0] || ''
    lastName.value = nameParts.slice(1).join(' ') || ''

    email.value = userData.email || ''
    phone.value = userData.contactNumber || ''
    emergencyContactName.value = userData.emergencyContactPerson || ''
    emergencyContactNumber.value = userData.emergencyContactNumber || ''

    // Handle teacher-specific data
    if (isTeacher.value && userData.teacher) {
      department.value = userData.teacher.department || ''
    }

    // Handle student-specific data
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
  } finally {
    loading.value = false
  }
}

function onCancel() {
  fetchCurrentUserProfile()
}

const { success, error: showError } = useToast()

async function onSubmit(e: Event) {
  e.preventDefault()
  try {
    const userId = auth.currentUser?.userId
    if (!userId) {
      showError('User not found')
      return
    }

    await api.put(`/User/${userId}`, {
      fullName: `${firstName.value} ${lastName.value}`.trim(),
      email: email.value,
      contactNumber: phone.value,
      emergencyContactPerson: emergencyContactName.value,
      emergencyContactNumber: emergencyContactNumber.value,
    })

    success('Profile changes saved successfully!')
  } catch (error) {
    console.error('Failed to update profile:', error)
    showError('Failed to save profile changes')
  }
}

// LIFECYCLE
onMounted(async () => {
  // Fetch user profile
  await fetchCurrentUserProfile()

  // Fetch courses data
  if (isTeacher.value) {
    await classesStore.fetchTeacherCourses()
    await quizzesStore.fetchTeacherQuizzesAsync()
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
                <input v-model="email" type="email" id="email" class="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5" for="phone">
                  <i class="fas fa-phone text-xs mr-1"></i>Phone Number
                </label>
                <input v-model="phone" type="tel" id="phone" placeholder="+63 XXX XXX XXXX" class="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
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
                <input v-model="emergencyContactName" type="text" id="emergency-name" placeholder="Full Name" class="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5" for="emergency-phone">
                  <i class="fas fa-phone-alt text-xs mr-1"></i>Contact Number
                </label>
                <input v-model="emergencyContactNumber" type="tel" id="emergency-phone" placeholder="+63 XXX XXX XXXX" class="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500" />
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Actions -->
      <div class="p-3 md:p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
        <button type="button" @click="onCancel" class="w-full sm:w-auto px-4 py-2 text-xs md:text-sm font-medium border border-gray-300 rounded text-gray-700 hover:bg-white transition-colors">
          <i class="fas fa-times mr-1.5"></i>Cancel
        </button>
        <button type="submit" @click="onSubmit" class="w-full sm:w-auto px-4 py-2 text-xs md:text-sm font-medium bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors">
          <i class="fas fa-save mr-1.5"></i>Save Changes
        </button>
      </div>
    </div>
  </div>
</template>
