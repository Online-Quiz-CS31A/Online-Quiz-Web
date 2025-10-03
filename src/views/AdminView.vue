<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell } from 'lucide-vue-next'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminDashboard from '@/components/admin/AdminDashboard.vue'
import AdminUserManagement from '@/components/admin/AdminUserManagement.vue'
import AdminCourseCatalog from '@/components/admin/AdminCourseCatalog.vue'

const activeSection = ref('dashboard')

const componentMap: Record<string, any> = {
  dashboard: AdminDashboard,
  users: AdminUserManagement,
  courses: AdminCourseCatalog,
  'quiz-settings': AdminDashboard,
  data: AdminDashboard,
  analytics: AdminDashboard
}

const titleMap: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  courses: 'Course Catalog',
  'quiz-settings': 'Quiz Settings',
  data: 'Data Management',
  analytics: 'Analytics'
}

const currentComponent = computed(() => {
  return componentMap[activeSection.value] || AdminDashboard
})

const pageTitle = computed(() => {
  return titleMap[activeSection.value] || 'Dashboard'
})

const navigateToSection = (section: string) => {
  activeSection.value = section
}
</script>


<template>
  <div class="flex h-screen overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <AdminSidebar 
      :active-section="activeSection" 
      @update:active-section="activeSection = $event"
    />
    
    <!-- Main content -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Top navigation -->
      <div class="relative z-10 flex flex-shrink-0 h-16 bg-white shadow">
        <div class="flex justify-between flex-1 px-4">
          <div class="flex flex-1">
            <div class="flex items-center flex-shrink-0 ml-3 md:ml-0">
              <h1 class="text-xl font-semibold text-gray-900">{{ pageTitle }}</h1>
            </div>
          </div>
          <div class="flex items-center ml-4 space-x-4 md:ml-6">
            <button class="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Bell class="w-6 h-6" />
            </button>
            <div class="relative ml-3">
              <button 
                type="button" 
                class="flex items-center max-w-xs text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span class="sr-only">Open user menu</span>
                <img 
                  class="w-8 h-8 rounded-full" 
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" 
                  alt="Admin profile"
                >
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main content area -->
      <main class="flex-1 overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <Transition name="fade" mode="out-in">
              <component 
                :is="currentComponent" 
                @navigate="navigateToSection"
              />
            </Transition>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

:deep(*) {
  font-family: 'Inter', sans-serif;
}
</style>