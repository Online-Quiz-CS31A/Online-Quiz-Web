<script setup lang="ts">
import { BookOpen, Home, Users, BookOpenCheck, Settings, Database, BarChart2 } from 'lucide-vue-next'

// PROPS
defineProps<{
  activeSection: string
}>()

// EMITS
const emit = defineEmits<{
  'update:activeSection': [value: string]
}>()


// METHODS
const setActiveSection = (section: string) => {
  emit('update:activeSection', section)
}
</script>


<template>
  <div class="flex flex-col w-64 bg-white border-r border-gray-200">
    <!-- Header -->
    <div class="flex items-center justify-center h-16 px-4 bg-white">
      <div class="flex items-center">
        <span class="text-xl font-semibold text-blue-600">Quiz Portal Admin</span>
      </div>
    </div>
    
    <!-- Navigation -->
    <div class="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
      <div class="space-y-1">
        <!-- Dashboard -->
        <a 
          @click.prevent="setActiveSection('dashboard')"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            activeSection === 'dashboard' 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <Home
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              activeSection === 'dashboard' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Dashboard
        </a>
        
        <!-- User Management -->
        <a 
          @click.prevent="setActiveSection('users')"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            activeSection === 'users' 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <Users
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              activeSection === 'users' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          User Management
        </a>
        
        <!-- Course Catalog -->
        <a 
          @click.prevent="setActiveSection('courses')"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            activeSection === 'courses' 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <BookOpenCheck
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              activeSection === 'courses' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Course Catalog
        </a>
        
        <!-- Quiz Settings -->
        <a 
          @click.prevent="setActiveSection('quiz-settings')"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            activeSection === 'quiz-settings' 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <Settings
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              activeSection === 'quiz-settings' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Quiz Settings
        </a>
        
        <!-- Data Management -->
        <a 
          @click.prevent="setActiveSection('data')"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            activeSection === 'data' 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <Database
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              activeSection === 'data' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Data Management
        </a>
        
        <!-- Analytics -->
        <a 
          @click.prevent="setActiveSection('analytics')"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            activeSection === 'analytics' 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <BarChart2
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              activeSection === 'analytics' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Analytics
        </a>
      </div>
    </div>
    
    <!-- User Profile -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center">
        <img 
          class="w-10 h-10 rounded-full" 
          src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" 
          alt="Admin profile"
        >
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-700">Admin User</p>
          <p class="text-xs font-medium text-gray-500">Super Administrator</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-item:hover .sidebar-icon {
  transform: translateX(3px);
}
</style>
