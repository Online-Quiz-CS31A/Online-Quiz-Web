<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCounterStore } from '@/stores/counter'

interface Props {
  breadcrumb?: string
  showNotification?: boolean
  actionButtons?: boolean
  showQuizCreatorControls?: boolean
  published?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  breadcrumb: '',
  showNotification: true,
  actionButtons: false,
  showQuizCreatorControls: false,
  published: false,
})

const emit = defineEmits<{
  save: []
  publish: []
  content: []
  assign: []
  results: []
  preview: []
}>()

const showProfileDropdown = ref(false)
const showPublishModal = ref(false)

const store = useCounterStore()
const displayName = computed(() => store.currentUser?.name || 'Guest')
const initials = computed(() => {
  const name = displayName.value.trim()
  if (!name) return 'G'
  const parts = name.split(/\s+/)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || first.toUpperCase() || 'U'
})
const router = useRouter()

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
  console.log('Viewing profile...')
  closeProfileDropdown()
}

function settings() {
  console.log('Opening settings...')
  closeProfileDropdown()
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

const breadcrumbSegments = computed(() => {
  if (!props.breadcrumb) return [] as string[]
  return props.breadcrumb
    .split('>')
    .map(s => s.trim())
    .filter(Boolean)
})

function handleBreadcrumbClick(segment: string) {
  const key = segment.toLowerCase()
  if (key === 'dashboard') {
    router.push({ name: 'teacher' })
  } else if (key === 'courses') {
    router.push({ name: 'teacher', query: { section: 'courses' } })
  }
}
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center relative">
      <!-- Breadcrumb -->
      <div class="flex items-center">
        <h1 class="text-lg font-medium text-gray-500" v-if="breadcrumb">
          <template v-if="breadcrumbSegments.length">
            <template v-for="(seg, idx) in breadcrumbSegments" :key="idx">
              <span
                v-if="['dashboard','courses'].includes(seg.toLowerCase()) && idx < breadcrumbSegments.length - 1"
                @click="handleBreadcrumbClick(seg)"
                class="cursor-pointer"
              >
                {{ seg }}
              </span>
              <span v-else>{{ seg }}</span>
              <span v-if="idx < breadcrumbSegments.length - 1"> &gt; </span>
            </template>
          </template>
          <template v-else>
            {{ breadcrumb }}
          </template>
        </h1>
      </div>
      
      <!-- Center buttons for quiz creator -->
      <div v-if="showQuizCreatorControls" class="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2">
        <button 
          v-if="published"
          @click="emit('content')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          :class="{
            'bg-indigo-100 text-indigo-700 border border-indigo-300': $route.name === 'quiz-builder',
            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50': $route.name !== 'quiz-builder'
          }"
        >
          Content
        </button>
        <button 
          v-if="published"
          @click="emit('assign')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          :class="{
            'bg-indigo-100 text-indigo-700 border border-indigo-300': $route.name === 'quiz-assign',
            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50': $route.name !== 'quiz-assign'
          }"
        >
          Assign
        </button>
        <button 
          v-if="published"
          @click="emit('results')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          :class="{
            'bg-indigo-100 text-indigo-700 border border-indigo-300': $route.name === 'quiz-results',
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
          <!-- Save always visible -->
          <button @click="emit('save')" 
                  class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors">
            Save
          </button>
          
          <!-- Before publish: show Publish -->
          <button v-if="!published" @click="openPublishModal"
                  class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center transition-colors">
            Publish
          </button>
          
          <!-- After publish: show Preview -->
          <button v-if="published" @click="emit('preview')"
                  class="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center transition-colors">
            Preview
          </button>
        </div>
        
        <!-- Notification bell -->
        <div v-if="showNotification" class="relative">
          <button class="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i class="fas fa-bell text-gray-600"></i>
            <span class="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
        </div>
        
        <!-- Profile dropdown -->
        <div class="relative">
          <button @click="toggleProfileDropdown" 
                  class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
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
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
              <i class="fas fa-user mr-3"></i>
              View Profile
            </button>
            <button @click="settings" 
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
              <i class="fas fa-cog mr-3"></i>
              Settings
            </button>
            <hr class="my-1">
            <button @click="logout" 
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
              <i class="fas fa-sign-out-alt mr-3"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showProfileDropdown" 
         @click="closeProfileDropdown"
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
          <button @click="closePublishModal" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md">Cancel</button>
          <button @click="confirmPublish" class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md">Publish Quiz</button>
        </div>
      </div>
    </div>
  </header>
</template>
