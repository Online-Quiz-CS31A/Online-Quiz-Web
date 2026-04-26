<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationsStore } from '@/stores/notificationsStore'

const NotificationDropdown = defineAsyncComponent(() => import('./NotificationDropdown.vue'))

// CONSTANTS
const router = useRouter()

// PROPS
const props = withDefaults(defineProps<{
  breadcrumb?: string
  showNotification?: boolean
  actionButtons?: boolean
  showQuizCreatorControls?: boolean
  published?: boolean
  archivedQuiz?: boolean
  readOnlyResultsOnly?: boolean
  saving?: boolean
  publishing?: boolean
}>(), {
  breadcrumb: '',
  showNotification: true,
  actionButtons: false,
  showQuizCreatorControls: false,
  published: false,
  archivedQuiz: false,
  readOnlyResultsOnly: false,
  saving: false,
  publishing: false,
})

// EMITS
const emit = defineEmits<{
  save: []
  publish: []
  content: []
  assign: []
  results: []
  preview: []
  segmentClick: [segment: string]
}>()

// REFS
const showProfileDropdown = ref(false)
const showPublishModal = ref(false)
const showNotificationDropdown = ref(false)

// REACTIVE
const store = useAuthStore()
const notificationsStore = useNotificationsStore()

// COMPUTED
const displayName = computed(() => store.currentUser?.name || 'Guest')
const initials = computed(() => {
  const name = displayName.value.trim()
  if (!name) return 'G'
  const parts = name.split(/\s+/)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || first.toUpperCase() || 'U'
})

const breadcrumbSegments = computed(() => {
  if (!props.breadcrumb) return [] as string[]
  return props.breadcrumb
    .split('>')
    .map(s => s.trim())
    .filter(Boolean)
})

const unreadCount = computed(() => notificationsStore.unreadCount)

// METHODS
function toggleProfileDropdown() {
  showProfileDropdown.value = !showProfileDropdown.value
}

function closeProfileDropdown() {
  showProfileDropdown.value = false
}

function logout() {
  store.logout()
  closeProfileDropdown()
  router.push({ name: 'login' })
}

function viewProfile() {
  closeProfileDropdown()
  const role = store.userRole
  if (role === 'teacher') {
    router.push({ name: 'teacher-profile' })
  } else {
    router.push({ name: 'student-profile' })
  }
}

function openPublishModal() {
  showPublishModal.value = true
}

function closePublishModal() {
  showPublishModal.value = false
}

function confirmPublish() {
  emit('publish')
  closePublishModal()
}

function handleBreadcrumbClick(segment: string) {
  const key = segment.toLowerCase()
  if (key === 'dashboard') {
    const role = store.currentUser?.role
    if (role === 'student') {
      router.push({ name: 'student' })
    } else {
      router.push({ name: 'teacher' })
    }
  } else if (key === 'courses') {
    router.push({ name: 'teacher', query: { section: 'courses' } })
  } else {
    emit('segmentClick', segment)
  }
}

function toggleNotificationDropdown() {
  showNotificationDropdown.value = !showNotificationDropdown.value
}

function closeNotificationDropdown() {
  showNotificationDropdown.value = false
}

function markAsRead(id: number) {
  notificationsStore.markAsRead(id)
}

function markAllAsRead() {
  notificationsStore.markAllAsRead()
}
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="px-4 py-4 sm:px-6 lg:px-8 flex items-center relative" :class="breadcrumb ? 'justify-between' : 'justify-end'">
      <!-- Breadcrumb -->
      <nav class="flex items-center" v-if="breadcrumb" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2">
          <template v-if="breadcrumbSegments.length">
            <li v-for="(seg, idx) in breadcrumbSegments" :key="idx" class="flex items-center">
              <!-- Clickable breadcrumb segment -->
              <button
                v-if="idx < breadcrumbSegments.length - 1"
                @click="handleBreadcrumbClick(seg)"
                class="group flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-150 rounded-md px-2 py-1 hover:bg-indigo-50"
                :title="`Go to ${seg}`"
              >
                <i v-if="idx === 0" class="fas fa-home mr-1.5 text-xs"></i>
                <span class="max-w-[150px] truncate">{{ seg }}</span>
              </button>

              <!-- Current/last breadcrumb segment -->
              <span
                v-else
                class="flex items-center text-sm font-semibold text-gray-900 px-2 py-1"
                :title="seg"
              >
                <span class="max-w-[200px] truncate">{{ seg }}</span>
              </span>

              <!-- Separator -->
              <svg
                v-if="idx < breadcrumbSegments.length - 1"
                class="flex-shrink-0 h-4 w-4 text-gray-400 mx-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
            </li>
          </template>
          <template v-else>
            <li class="text-sm font-semibold text-gray-900">{{ breadcrumb }}</li>
          </template>
        </ol>
      </nav>

      <!-- Center buttons for quiz creator -->
      <div
        v-if="showQuizCreatorControls && !props.archivedQuiz && !props.readOnlyResultsOnly"
        class="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2"
      >
        <button
          @click="emit('content')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer"
          :class="{
            'bg-indigo-100 text-blue-700 border border-indigo-300': $route.name === 'quiz-builder',
            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50': $route.name !== 'quiz-builder'
          }"
        >
          Content
        </button>
        <button
          @click="emit('assign')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer"
          :class="{
            'bg-indigo-100 text-blue-700 border border-indigo-300': $route.name === 'quiz-assign',
            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50': $route.name !== 'quiz-assign'
          }"
        >
          Assign
        </button>
        <button
          v-if="published"
          @click="emit('results')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer"
          :class="{
            'bg-indigo-100 text-blue-700 border border-indigo-300': $route.name === 'quiz-results',
            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50': $route.name !== 'quiz-results'
          }"
        >
          Results
        </button>
      </div>

      <div
        v-else-if="showQuizCreatorControls && props.readOnlyResultsOnly && !props.archivedQuiz && false"
        class="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2"
      >
        <button
          @click="emit('results')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer"
          :class="{
            'bg-indigo-100 text-blue-700 border border-indigo-300': $route.name === 'quiz-results',
            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50': $route.name !== 'quiz-results'
          }"
        >
          Results
        </button>
      </div>

      <!-- Right side actions -->
      <div class="flex items-center space-x-4">
        <!-- Action buttons for quiz creator -->
        <div v-if="actionButtons" class="flex items-center space-x-2">
          <button v-if="!props.archivedQuiz && !props.readOnlyResultsOnly" @click="emit('save')"
                  :disabled="props.saving || props.publishing"
                  class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            <i v-if="props.saving || (props.publishing && props.published)" class="fas fa-spinner fa-spin mr-2"></i>
            {{ (props.saving || (props.publishing && props.published)) ? 'Saving...' : 'Save' }}
          </button>

          <button v-if="!published && !props.archivedQuiz && !props.readOnlyResultsOnly" @click="openPublishModal"
                  :disabled="props.saving || props.publishing"
                  class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            <i v-if="props.publishing" class="fas fa-spinner fa-spin mr-2"></i>
            Publish
          </button>

          <button v-if="published && !props.archivedQuiz && !props.readOnlyResultsOnly" @click="emit('preview')"
                  class="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center transition-colors cursor-pointer">
            Preview
          </button>
        </div>

        <!-- Notification bell -->
        <div v-if="showNotification" class="relative">
          <button
            @click="toggleNotificationDropdown"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer relative"
            :title="unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'No new notifications'"
          >
            <i class="fas fa-bell text-gray-600"></i>
            <span
              v-if="unreadCount > 0"
              class="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- Notification Dropdown Component -->
          <NotificationDropdown
            :notifications="notificationsStore.notifications"
            :show="showNotificationDropdown"
            @close="closeNotificationDropdown"
            @mark-as-read="markAsRead"
            @mark-all-as-read="markAllAsRead"
          />
        </div>

        <!-- Profile dropdown -->
        <div class="relative">
          <button @click="toggleProfileDropdown"
                  class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {{ initials }}
            </div>
            <span class="text-gray-700 hidden md:inline">{{ displayName }}</span>
            <i class="fas fa-chevron-down text-gray-400 text-sm"></i>
          </button>

          <!-- Dropdown menu -->
          <div v-if="showProfileDropdown"
               @click="closeProfileDropdown"
               class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
            <button @click="viewProfile"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center cursor-pointer">
              <i class="fas fa-user mr-3"></i>
              View Profile
            </button>
            <hr class="my-1">
            <button @click="logout"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center cursor-pointer">
              <i class="fas fa-sign-out-alt mr-3"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for dropdowns -->
    <div v-if="showProfileDropdown"
         @click="closeProfileDropdown"
         class="fixed inset-0 z-40"></div>
    <div v-if="showNotificationDropdown"
         @click="closeNotificationDropdown"
         class="fixed inset-0 z-40"></div>

    <!-- Publish confirmation modal -->
    <div v-if="showPublishModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">Publish Quiz</h3>
          <button @click="closePublishModal" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4 space-y-3 text-sm text-gray-700">
          <p>Review your quiz information before publishing:</p>
          <slot name="publish-summary">
            <div class="bg-gray-50 rounded p-3 space-y-2">
              <div class="text-sm text-gray-600">Quiz information will be displayed here</div>
            </div>
          </slot>
          <p class="text-xs text-gray-500">Once published, students will be able to access this quiz.</p>
        </div>
        <div class="p-4 border-t border-gray-200 flex items-center justify-end space-x-2">
          <button @click="closePublishModal" :disabled="props.publishing" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md disabled:opacity-50">Cancel</button>
          <button @click="confirmPublish" :disabled="props.publishing" class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
            <i v-if="props.publishing" class="fas fa-spinner fa-spin mr-2"></i>
            {{ props.publishing ? 'Publishing...' : 'Publish Quiz' }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
