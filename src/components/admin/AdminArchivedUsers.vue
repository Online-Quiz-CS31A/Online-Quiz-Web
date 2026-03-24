<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Archive, RotateCcw, AlertCircle, Users } from 'lucide-vue-next'
import AdminSearchFilterBar from '@/components/SearchFilterBar.vue'
import SkeletonTable from '@/components/skeletons/SkeletonTable.vue'
import AdminPagination from '@/components/admin/AdminPagination.vue'
import ConfirmUnarchiveModal from '@/components/modals/ConfirmUnarchiveModal.vue'
import api from '@/services/api'

interface ArchivedUser {
  id: number
  name: string
  email: string
  role: string
  status: string
  lastActive: string
  avatar: string
  username?: string
  course?: string
  year?: string
  section?: string
  department?: string
  contactNumber?: string
  emergencyContactNumber?: string
  archivedAt: string
  archiveReason?: string
}

const STORAGE_KEY = 'archivedUsers'

// STATE
const archivedUsers = ref<ArchivedUser[]>([])
const searchQuery = ref('')
const filterRole = ref('All Roles')
const isLoading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const showRestoreModal = ref(false)
const userToRestore = ref<ArchivedUser | null>(null)

// COMPUTED
const filteredUsers = computed(() => {
  let result = archivedUsers.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    )
  }

  if (filterRole.value !== 'All Roles') {
    const roleMap: Record<string, string> = {
      'Students': 'Student',
      'Teachers': 'Teacher',
      'Administrators': 'Administrator'
    }
    result = result.filter(u => u.role === roleMap[filterRole.value])
  }

  return result
})

const hasActiveFilters = computed(() =>
  searchQuery.value.trim() !== '' || filterRole.value !== 'All Roles'
)

const clearFilters = () => {
  searchQuery.value = ''
  filterRole.value = 'All Roles'
  currentPage.value = 1
}

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
})

const totalItems = computed(() => filteredUsers.value.length)

// METHODS
const loadArchivedUsers = () => {
  isLoading.value = true
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const raw: ArchivedUser[] = stored ? JSON.parse(stored) : []

    const seen = new Map<string, ArchivedUser>()
    for (const u of raw) {
      const existing = seen.get(u.email)
      if (!existing || new Date(u.archivedAt) > new Date(existing.archivedAt)) {
        seen.set(u.email, u)
      }
    }
    const deduped = Array.from(seen.values())

    if (deduped.length !== raw.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped))
    }

    archivedUsers.value = deduped
    setTimeout(() => { isLoading.value = false }, 300)
  } catch (e) {
    console.error('Failed to load archived users:', e)
    archivedUsers.value = []
    isLoading.value = false
  }
}

const confirmRestore = (user: ArchivedUser) => {
  userToRestore.value = user
  showRestoreModal.value = true
}

const restoreUser = async () => {
  if (!userToRestore.value) return

  const u = userToRestore.value

  try {
    await api.put(`/user/${u.id}`, { status: 'Active' })
  } catch (e) {
    console.error('Failed to restore user status via API:', e)
  }

  const remaining = archivedUsers.value.filter(au => au.email !== u.email)
  archivedUsers.value = remaining
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining))

  showRestoreModal.value = false
  userToRestore.value = null
}

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'Teacher':
      return 'bg-green-100 text-green-800'
    case 'Student':
      return 'bg-blue-100 text-blue-800'
    case 'Administrator':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// LIFECYCLE
onMounted(() => {
  loadArchivedUsers()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Search and Filters -->
    <AdminSearchFilterBar
      v-model="searchQuery"
      v-model:filter="filterRole"
      :options="['All Roles', 'Students', 'Teachers', 'Administrators']"
      placeholder="Search archived users..."
      :result-count="totalItems"
      result-label="user"
      :has-active-filters="hasActiveFilters"
      @clear-filters="clearFilters"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-200">
      <SkeletonTable :rows="6" :columns="6" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="archivedUsers.length === 0"
      class="overflow-hidden border-2 border-dashed border-gray-300 rounded-lg"
    >
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <Users class="w-16 h-16 text-gray-300 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-1">No Archived Users</h3>
        <p class="text-sm text-gray-500">Archived users will appear here for recovery</p>
      </div>
    </div>

    <!-- No Search Results -->
    <div
      v-else-if="filteredUsers.length === 0"
      class="bg-white rounded-xl border border-gray-200 p-12 text-center"
    >
      <AlertCircle class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-1">No Results Found</h3>
      <p class="text-sm text-gray-500">Try adjusting your search query or filter</p>
    </div>

    <!-- Users Table -->
    <div v-else class="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 data-table">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Name
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Email
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Role
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Reason
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">
                Archived Date
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in paginatedUsers" :key="user.id" class="transition-colors hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 w-10 h-10">
                    <img class="w-10 h-10 rounded-full" :src="user.avatar" :alt="user.name">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex px-2 text-xs font-semibold leading-5 rounded-full', getRoleBadgeClass(user.role)]">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 text-xs font-semibold leading-5 rounded-full bg-amber-100 text-amber-800">
                  {{ user.archiveReason || 'No reason' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                {{ formatDate(user.archivedAt) }}
              </td>
              <td class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                <button
                  @click="confirmRestore(user)"
                  class="inline-flex items-center text-blue-600 hover:text-blue-900"
                  title="Restore User"
                >
                  <RotateCcw class="w-4 h-4 mr-1" />
                  <span class="text-xs">Restore</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <AdminPagination
      v-if="filteredUsers.length > 0"
      v-model:current-page="currentPage"
      :total-items="totalItems"
      :page-size="pageSize"
    />

    <!-- Restore Confirmation Modal -->
    <ConfirmUnarchiveModal
      :open="showRestoreModal"
      title="Restore User"
      description="Are you sure you want to restore this user? Their status will be set back to Active."
      @confirm="restoreUser"
      @cancel="showRestoreModal = false"
    />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }

.data-table tr {
  transition: background-color 0.2s ease;
}

.data-table tr:hover {
  background-color: rgba(59, 130, 246, 0.05);
}
</style>
