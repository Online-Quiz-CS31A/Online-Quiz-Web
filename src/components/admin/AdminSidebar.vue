<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Home, Users, BookOpenCheck, Settings, Database, BarChart2, Archive, ChevronDown, Fingerprint } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

const archivedOpen = ref(false)

const isArchivedActive = computed(() =>
  route.name === 'admin-archived-courses' || route.name === 'admin-archived-users'
)

if (isArchivedActive.value) {
  archivedOpen.value = true
}

watch(isArchivedActive, (val) => {
  if (val) archivedOpen.value = true
})

const toggleArchived = () => {
  archivedOpen.value = !archivedOpen.value
}
</script>


<template>
  <div class="flex flex-col w-64 bg-white border-r border-gray-200">
    <!-- AppHeader -->
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

        <!-- Biometric -->
        <router-link
          to="/admin/biometric"
          :class="[
            'flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
            route.name === 'admin-biometric'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          ]"
        >
          <Fingerprint
            :class="[
              'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
              route.name === 'admin-biometric' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            ]"
          />
          Biometrics
        </router-link>

        <!-- Archived Dropdown -->
        <div>
          <button
            @click="toggleArchived"
            :class="[
              'flex items-center justify-between w-full px-2 py-3 text-sm font-medium rounded-md cursor-pointer transition-all sidebar-item group',
              isArchivedActive
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            ]"
          >
            <div class="flex items-center">
              <Archive
                :class="[
                  'w-5 h-5 mr-3 transition-all duration-200 sidebar-icon',
                  isArchivedActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
                ]"
              />
              Archived
            </div>
            <ChevronDown
              :class="[
                'w-4 h-4 transition-transform duration-200',
                archivedOpen ? 'rotate-180' : '',
                isArchivedActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
              ]"
            />
          </button>

          <!-- Dropdown Sub-items -->
          <div
            v-show="archivedOpen"
            class="ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-200"
          >
            <router-link
              to="/admin/archived/courses"
              :class="[
                'flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer transition-all group',
                route.name === 'admin-archived-courses'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              ]"
            >
              <BookOpenCheck
                :class="[
                  'w-4 h-4 mr-2 transition-all duration-200',
                  route.name === 'admin-archived-courses' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
                ]"
              />
              Courses
            </router-link>
            <router-link
              to="/admin/archived/users"
              :class="[
                'flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer transition-all group',
                route.name === 'admin-archived-users'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              ]"
            >
              <Users
                :class="[
                  'w-4 h-4 mr-2 transition-all duration-200',
                  route.name === 'admin-archived-users' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
                ]"
              />
              Users
            </router-link>
          </div>
        </div>
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
