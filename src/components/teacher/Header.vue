<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  breadcrumb?: string
  showNotification?: boolean
  actionButtons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  breadcrumb: '',
  showNotification: true,
  actionButtons: false
})

const emit = defineEmits<{
  save: []
  publish: []
}>()

const showProfileDropdown = ref(false)

function toggleProfileDropdown() {
  showProfileDropdown.value = !showProfileDropdown.value
}

function closeProfileDropdown() {
  showProfileDropdown.value = false
}

function logout() {
  console.log('Logging out...')
  closeProfileDropdown()
}

function viewProfile() {
  console.log('Viewing profile...')
  closeProfileDropdown()
}

function settings() {
  console.log('Opening settings...')
  closeProfileDropdown()
}
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <!-- Breadcrumb -->
      <div class="flex items-center">
        <h1 class="text-lg font-medium text-gray-500" v-if="breadcrumb">{{ breadcrumb }}</h1>
      </div>
      
      <!-- Right side actions -->
      <div class="flex items-center space-x-4">
        <!-- Action buttons for quiz creator -->
        <div v-if="actionButtons" class="flex items-center space-x-2">
          <button @click="emit('save')" 
                  class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors">
            <i class="fas fa-save mr-2"></i>Save
          </button>
          <button @click="emit('publish')"
                  class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center transition-colors">
            <i class="fas fa-paper-plane mr-2"></i>Publish
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
              DF
            </div>
            <span class="text-gray-700 hidden md:inline">Donald Francisco</span>
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
  </header>
</template>
