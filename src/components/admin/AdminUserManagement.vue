<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import AdminUserAddModal from '@/components/modals/AdminUserAddModal.vue'
import AdminUserEditModal from '@/components/modals/AdminUserEditModal.vue'
import DangerConfirmModal from '@/components/modals/DangerConfirmModal.vue'
import ArchiveUserModal from '@/components/modals/ArchiveUserModal.vue'
import { Trash2, Archive } from 'lucide-vue-next'
import { Pencil } from 'lucide-vue-next'
import AdminSearchFilterBar from '@/components/SearchFilterBar.vue'
import AdminPagination from '@/components/admin/AdminPagination.vue'
import SkeletonTable from '@/components/skeletons/SkeletonTable.vue'
import type { AdminUser, User } from '@/interfaces/interfaces'
import { useAdminStore } from '@/stores/adminStore'
import api from '@/services/api'
import { sendPasswordEmail } from '@/services/emailService'

// STORE
const adminStore = useAdminStore()

// CONSTANTS / TYPRS
const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

// REACTIVE
const form = reactive<any>({
  id: 0,
  fullName: '',
  email: '',
  role: 'Student',
  status: 'Active',
  lastActive: '',
  avatar: defaultAvatar,
  username: '',
  password: '',
  course: '',
  year: '',
  section: '',
  department: '',
  contactNumber: '',
  emergencyContactNumber: ''
})

const errors = reactive<Record<string, string>>({})

// REFS
const searchQuery = ref('')
const filterRole = ref('All Users')
const pageSize = ref(10)
const currentPage = ref(1)
const showModal = ref(false)
const isEditing = ref(false)
const showDeleteModal = ref(false)
const userToDelete = ref<AdminUser | null>(null)
const showArchiveModal = ref(false)
const userToArchive = ref<AdminUser | null>(null)

// DROPDOWN DATA
const departments = ref<string[]>([])
const years = ref<string[]>([])
const courses = ref<string[]>([])

// COMPUTED
const totalItems = computed(() => adminStore.totalUsers)

// WATCHERS
watch([currentPage, pageSize, filterRole, searchQuery], () => {
  loadUsers()
})

// METHODS
const loadUsers = () => {
  adminStore.fetchUsers(currentPage.value, pageSize.value, searchQuery.value, filterRole.value)
}

const fetchDropdownData = async () => {
  try {
    const response = await api.get('/user/paged?pageNumber=1&pageSize=1000')
    const allUsers = response.data.items || []
    
    const uniqueDepartments = new Set<string>()
    allUsers
      .filter((u: any) => u.roleName === 'Teacher' && u.teacher?.department)
      .forEach((u: any) => uniqueDepartments.add(u.teacher.department))
    departments.value = Array.from(uniqueDepartments).sort()
    
    const uniqueYears = new Set<string>()
    allUsers
      .filter((u: any) => u.roleName === 'Student' && u.student?.yearLevel)
      .forEach((u: any) => uniqueYears.add(u.student.yearLevel.toString()))
    years.value = Array.from(uniqueYears).sort()
    
    const uniqueCourses = new Set<string>()
    allUsers
      .filter((u: any) => u.roleName === 'Student' && u.student?.course)
      .forEach((u: any) => uniqueCourses.add(u.student.course))
    courses.value = Array.from(uniqueCourses).sort()
  } catch (error) {
    console.error('Failed to fetch dropdown data:', error)
  }
}

const normalizeRole = (val: string): 'Student' | 'Teacher' | 'Administrator' => {
  const v = (val || '').toLowerCase()
  if (v.startsWith('teach')) return 'Teacher'
  if (v.startsWith('admin')) return 'Administrator'
  return 'Student'
}

const parseCSV = (text: string): Record<string, string>[] => {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] || '').trim()
    })
    rows.push(obj)
  }
  return rows
}

const onImport = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files && input.files[0]
  if (!file) return
  const text = await file.text()
  let records: any[] = []
  if (file.name.toLowerCase().endsWith('.json')) {
    try { records = JSON.parse(text) } catch { records = [] }
  } else {
    records = parseCSV(text)
  }
  
  for (const r of records) {
    const role = normalizeRole(r.role || r.type || r.userrole || '')
    const newUser = {
      email: r.email || '',
      name: r.name || r.fullname || '',
      password: genPassword(),
      roleId: role === 'Student' ? 3 : role === 'Teacher' ? 2 : 1, 
      studentId: r.studentId || genUsernameByRole(role),
      yearLevel: Number(r.year) || 1,
      section: r.section || 'A',
      course: r.course || 'CS',
      department: r.department || 'General',
      contactNumber: '0000000000',
      createdBy: 1 
    }
    await adminStore.createUser(newUser)
  }
  loadUsers()
  if (input) input.value = ''
}

const randomAlnum = (len: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

const randomDigits = (len: number) => {
  let out = ''
  for (let i = 0; i < len; i++) out += Math.floor(Math.random() * 10)
  return out
}

const genUsernameByRole = (role: string) => {
  const prefix = role === 'Teacher' ? '01' : role === 'Student' ? '02' : '00'
  return prefix + randomDigits(8)
}

const genPassword = () => randomAlnum(10)

const openAdd = () => {
  isEditing.value = false
  clearErrors()
  Object.assign(form, {
    id: 0,
    fullName: '',
    email: '',
    role: 'Student',
    status: 'Active',
    lastActive: '',
    avatar: defaultAvatar,
    username: genUsernameByRole('Student'),
    password: genPassword(),
    course: '',
    year: '',
    section: '',
    department: '',
    contactNumber: '',
    emergencyContactNumber: ''
  })
  showModal.value = true
}

const openEdit = (u: AdminUser) => {
  isEditing.value = true
  clearErrors()
  Object.assign(form, {
    id: u.id,
    fullName: u.name, 
    email: u.email,
    role: u.role,
    status: u.status,
    lastActive: u.lastActive,
    avatar: u.avatar || defaultAvatar,
    username: u.username || genUsernameByRole(u.role),
    password: u.password || genPassword(),
    course: u.course || '',
    year: u.year || '',
    section: u.section || '',
    department: u.department || '',
    contactNumber: u.contactNumber || '',
    emergencyContactNumber: u.emergencyContactNumber || ''
  })
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const onRoleChange = () => {
  form.username = genUsernameByRole(form.role)
}

const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/

const clearErrors = () => {
  Object.keys(errors).forEach(k => delete (errors as any)[k])
}

const validateForm = (): boolean => {
  clearErrors()
  if (!form.fullName || !form.fullName.trim()) errors.fullName = 'Name is required.'
  if (!form.email || !form.email.trim()) errors.email = 'Email is required.'
  else if (!gmailRegex.test(form.email.trim())) errors.email = 'Only Gmail addresses (@gmail.com) are accepted.'
  if (!form.role) errors.role = 'Role is required.'
  
  if (form.role === 'Student') {
    if (!form.course || !form.course.trim()) errors.course = 'Course is required for students.'
  }
  if (form.role === 'Teacher') {
    if (!form.department || !form.department.trim()) errors.department = 'Department is required for teachers.'
  }

  return Object.keys(errors).length === 0
}

const saveUser = async () => {
  if (!validateForm()) return

  let success = false

  if (isEditing.value) {
    const userData = {
      email: form.email,
      fullName: form.fullName,
      roleId: form.role === 'Student' ? 3 : form.role === 'Teacher' ? 2 : 1,
      studentId: form.username,
      yearLevel: Number(form.year) || null,
      section: form.section || null,
      course: form.course || null,
      department: form.department || null,
      contactNumber: form.contactNumber || null,
      emergencyContactNumber: form.emergencyContactNumber || null,
      status: form.status
    }
    success = await adminStore.updateUser(form.id, userData)
  } else {
    const generatedPassword = genPassword()
    console.log('Generated password for new user:', generatedPassword)

    const userData = {
      email: form.email,
      fullName: form.fullName,
      password: generatedPassword,
      roleId: form.role === 'Student' ? 3 : form.role === 'Teacher' ? 2 : 1,
      studentId: form.username,
      yearLevel: Number(form.year) || null,
      section: form.section || null,
      course: form.course || null,
      department: form.department || null,
      contactNumber: form.contactNumber || null,
      emergencyContactNumber: form.emergencyContactNumber || null,
      status: form.status,
      createdBy: 1
    }
    success = await adminStore.createUser(userData)
    console.log('Create user result:', success)

    console.log('Sending password email to:', form.email)
    const emailSent = await sendPasswordEmail(form.email, form.fullName, generatedPassword)
    console.log('Email send result:', emailSent)
    if (!emailSent) {
      console.warn('Password email could not be sent.')
    }
  }

  if (success) {
    showModal.value = false
    loadUsers()
  } else {
    errors._form = adminStore.error || 'Failed to save user. Please try again.'
  }
}

const confirmDelete = (u: AdminUser) => {
  userToDelete.value = u
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  const success = await adminStore.deleteUser(userToDelete.value.id)
  if (success) {
    showDeleteModal.value = false
    userToDelete.value = null
    loadUsers()
  }
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

const getStatusBadgeClass = (status: string) => {
  if (status === 'Active') return 'bg-green-100 text-green-800'
  if (status === 'Archived') return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
}

const confirmArchive = (u: AdminUser) => {
  userToArchive.value = u
  showArchiveModal.value = true
}

const archiveUser = (reason: string) => {
  if (!userToArchive.value) return
  const u = userToArchive.value

  //localstorage
  const STORAGE_KEY = 'archivedUsers'
  const stored = localStorage.getItem(STORAGE_KEY)
  const archivedUsers = stored ? JSON.parse(stored) : []
  
  if (!archivedUsers.find((au: any) => au.id === u.id)) {
    archivedUsers.push({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: 'Archived',
      lastActive: u.lastActive,
      avatar: u.avatar,
      username: u.username,
      course: u.course,
      year: u.year,
      section: u.section,
      department: u.department,
      contactNumber: u.contactNumber,
      emergencyContactNumber: u.emergencyContactNumber,
      archivedAt: new Date().toISOString(),
      archiveReason: reason
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(archivedUsers))
  }

  showArchiveModal.value = false
  userToArchive.value = null
  loadUsers()
}

// LIFECYCLE
onMounted(() => {
  loadUsers()
  fetchDropdownData()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- User controls -->
    <AdminSearchFilterBar
      v-model="searchQuery"
      v-model:filter="filterRole"
      :options="['All Users', 'Students', 'Teachers', 'Administrators', 'Inactive', 'Archived']"
      placeholder="Search users..."
      action-label="Add User"
      import-label="Import Users"
      import-accept=".csv,.json"
      @action="openAdd"
      @import="onImport"
    />
    
    <!-- User table -->
    <div class="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-200">
      <SkeletonTable v-if="adminStore.isLoading" :rows="10" :columns="6" />
      <div v-else class="overflow-x-auto">
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
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Last Active
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in adminStore.users" :key="user.id" class="transition-colors hover:bg-gray-50">
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
                <span :class="['inline-flex px-2 text-xs font-semibold leading-5 rounded-full', getStatusBadgeClass(user.status)]">
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                <time :datetime="user.lastActive">{{ user.lastActive }}</time>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                <button @click.prevent="openEdit(user)" class="text-blue-600 hover:text-blue-900 mr-3" title="Edit">
                  <Pencil class="w-4 h-4" />
                </button>
                <button v-if="user.status !== 'Archived'" @click="confirmArchive(user)" class="text-amber-600 hover:text-amber-900 mr-3" title="Archive">
                  <Archive class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(user)" class="text-red-600 hover:text-red-900" title="Delete">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="adminStore.users.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Pagination -->
    <AdminPagination
      v-model:current-page="currentPage"
      :total-items="totalItems"
      :page-size="pageSize"
    />
    
    <AdminUserAddModal
      v-if="showModal && !isEditing"
      :open="true"
      :model-value="form"
      :errors="errors"
      :departments="departments"
      :years="years"
      :courses="courses"
      @close="closeModal"
      @save="saveUser"
      @role-change="onRoleChange"
      @update:modelValue="val => Object.assign(form, val)"
    />
    <AdminUserEditModal
      v-if="showModal && isEditing"
      :open="true"
      :model-value="form"
      :errors="errors"
      :departments="departments"
      :years="years"
      :courses="courses"
      @close="closeModal"
      @save="saveUser"
      @role-change="onRoleChange"
      @update:modelValue="val => Object.assign(form, val)"
    />
    <DangerConfirmModal
      :open="showDeleteModal"
      title="Delete User"
      message="Are you sure you want to delete this user? This action cannot be undone."
      confirm-label="Delete"
      cancel-label="Cancel"
      @confirm="deleteUser"
      @cancel="showDeleteModal = false"
    />
    <ArchiveUserModal
      :open="showArchiveModal"
      :user-name="userToArchive?.name"
      @confirm="archiveUser"
      @cancel="showArchiveModal = false"
    />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.data-table tr {
  transition: background-color 0.2s ease;
}

.data-table tr:hover {
  background-color: rgba(59, 130, 246, 0.05);
}
</style>
