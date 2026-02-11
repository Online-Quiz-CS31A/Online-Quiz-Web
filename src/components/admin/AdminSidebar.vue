<script setup lang="ts">
import { BookOpen, Home, Users, BookOpenCheck, Settings, Database, BarChart2, Archive } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()
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
        <router-link
          to="/admin/dashboard"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            route.name === 'admin-dashboard'
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <Home
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              route.name === 'admin-dashboard' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Dashboard
        </router-link>
        
        <!-- User Management -->
        <router-link
          to="/admin/users"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            route.name === 'admin-users'
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <Users
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              route.name === 'admin-users' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          User Management
        </router-link>
        
        <!-- Course Catalog -->
        <router-link
          to="/admin/courses"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            route.name === 'admin-courses'
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <BookOpenCheck
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              route.name === 'admin-courses' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Course Catalog
        </router-link>
        
        <!-- Quiz Settings -->
        <router-link
          to="/admin/quiz-settings"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            route.name === 'admin-quiz-settings'
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <Settings
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              route.name === 'admin-quiz-settings' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Quiz Settings
        </router-link>
        
        <!-- Data Management -->
        <router-link
          to="/admin/data"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            route.name === 'admin-data'
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <Database
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              route.name === 'admin-data' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Data Management
        </router-link>
        
        <!-- Analytics -->
        <router-link
          to="/admin/analytics"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            route.name === 'admin-analytics'
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <BarChart2
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              route.name === 'admin-analytics' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Analytics
        </router-link>
        
        <!-- Archived -->
        <router-link
          to="/admin/archived"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            route.name === 'admin-archived'
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <Archive
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              route.name === 'admin-archived' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Archived
        </router-link>
      </div>
    </div>
    
    <!-- User Profile -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center">
        <img 
          class="w-10 h-10 rounded-full" 
          :src="authStore.currentUser?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'" 
          :alt="authStore.currentUser?.name"
        >
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-700">{{ authStore.currentUser?.name || 'Admin User' }}</p>
          <p class="text-xs font-medium text-gray-500">{{ authStore.currentUser?.role || 'Administrator' }}</p>
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
