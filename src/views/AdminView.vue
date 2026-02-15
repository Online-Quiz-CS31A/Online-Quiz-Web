<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, LogOut, User } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
const AdminSidebar = defineAsyncComponent(() => import('@/components/admin/AdminSidebar.vue'))

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const showProfileDropdown = ref(false)

// CONSTANTS
const titleMap: Record<string, string> = {
  'admin-dashboard': 'Dashboard',
  'admin-users': 'User Management',
  'admin-courses': 'Course Catalog',
  'admin-quiz-settings': 'Quiz Settings',
  'admin-data': 'Data Management',
  'admin-analytics': 'Analytics',
  'admin-archived': 'Archived Courses'
}

// COMPUTED
const pageTitle = computed(() => {
  return titleMap[route.name as string] || 'Dashboard'
})

const userName = computed(() => authStore.currentUser?.name || 'Admin')

// METHODS
function toggleProfileDropdown() {
  showProfileDropdown.value = !showProfileDropdown.value
}

function closeProfileDropdown() {
  showProfileDropdown.value = false
}

async function logout() {
  await authStore.logout()
  closeProfileDropdown()
  router.push({ name: 'login' })
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (showProfileDropdown.value && !target.closest('.relative')) {
    closeProfileDropdown()
  }
}

// LIFECYCLE
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>


<template>
  <div class="flex h-screen overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <AdminSidebar />
    
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
            <button class="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
              <Bell class="w-6 h-6" />
            </button>
            <div class="relative ml-3">
              <button 
                @click="toggleProfileDropdown"
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
              <!-- Profile Dropdown -->
              <Transition name="dropdown">
                <div 
                  v-if="showProfileDropdown"
                  @click.stop
                  class="absolute right-0 z-50 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                >
                  <div class="px-4 py-3">
                    <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ authStore.currentUser?.email }}</p>
                  </div>
                  <div class="py-1">
                    <button
                      @click="logout"
                      class="flex items-center w-full px-4 py-2 text-sm text-left text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <LogOut class="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main content area -->
      <main class="flex-1 overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <router-view v-slot="{ Component }">
              <Transition name="fade" mode="out-in">
                <component :is="Component" :key="route.name" />
              </Transition>
            </router-view>
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

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

:deep(*) {
  font-family: 'Inter', sans-serif;
}
</style>