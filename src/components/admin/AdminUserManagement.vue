<script setup lang="ts">
import { ref, reactive, computed, watchEffect } from 'vue'
import { Search, Plus, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import type { AdminUser } from '@/interfaces/interfaces'

// CONSTANTS / TYPRS
const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'


// REFS
const searchQuery = ref('')
const filterRole = ref('All Users')
const users = ref<AdminUser[]>([
  {
    id: 1,
    name: 'Donald Francisco',
    email: 'donald.francisco@gmail.com',
    role: 'Teacher',
    status: 'Active',
    lastActive: 'October 15, 2024',
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },
  {
    id: 2,
    name: 'Neil Vallecer',
    email: 'neil.vallecer@gmail.com',
    role: 'Student',
    status: 'Active',
    lastActive: 'October 5, 2025',
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },
  {
    id: 3,
    name: 'Ada Wong',
    email: 'ada.wong@gmail.com',
    role: 'Administrator',
    status: 'Active',
    lastActive: 'September 14, 2025',
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },
  {
    id: 4,
    name: 'Jan Rosalijos',
    email: 'jan.rosalijos@gmail.com',
    role: 'Student',
    status: 'Inactive',
    lastActive: 'September 28, 2025',
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  }
])
const importInput = ref<HTMLInputElement | null>(null)
const pageSize = ref(10)
const currentPage = ref(1)
const showModal = ref(false)
const isEditing = ref(false)

// REACTIVE
const form = reactive<User>({
  id: 0,
  name: '',
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
  department: ''
})

const errors = reactive<Record<string, string>>({})

// COMPUTED
const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const role = filterRole.value
  return users.value.filter(u => {
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchesRole =
      role === 'All Users' ||
      (role === 'Students' && u.role === 'Student') ||
      (role === 'Teachers' && u.role === 'Teacher') ||
      (role === 'Administrators' && u.role === 'Administrator') ||
      (role === 'Inactive' && u.status === 'Inactive')
    return matchesSearch && matchesRole
  })
})

const totalItems = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))
const displayStart = computed(() => (totalItems.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1))
const displayEnd = computed(() => Math.min(currentPage.value * pageSize.value, totalItems.value))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
})

const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const tp = totalPages.value
  if (tp <= 6) {
    for (let i = 1; i <= tp; i++) pages.push(i)
    return pages
  }
  pages.push(1, 2, 3)
  pages.push('...')
  pages.push(tp - 2, tp - 1, tp)
  return pages
})


// WATCHERS
watchEffect(() => {
  currentPage.value = 1
})

watchEffect(() => {
  if (showModal.value) validateForm()
})

// METHODS
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
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  for (const r of records) {
    const role = normalizeRole(r.role || r.type || r.userrole || '')
    const newUser: AdminUser = {
      id: 0,
      name: r.name || r.fullname || '',
      email: r.email || '',
      role,
      status: (r.status && r.status.toLowerCase().startsWith('inact')) ? 'Inactive' : 'Active',
      lastActive: r.lastActive || today,
      avatar: defaultAvatar,
      username: genUsernameByRole(role),
      password: genPassword(),
      course: r.course || '',
      year: r.year || '',
      section: r.section || '',
      department: r.department || ''
    }
    const newId = users.value.length ? Math.max(...users.value.map(u => u.id)) + 1 : 1
    newUser.id = newId
    users.value.push(newUser)
  }
  if (importInput.value) importInput.value.value = ''
}

const goToPage = (n: number) => {
  if (n < 1 || n > totalPages.value) return
  currentPage.value = n
}
const prevPage = () => goToPage(currentPage.value - 1)
const nextPage = () => goToPage(currentPage.value + 1)

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
  Object.assign(form, {
    id: 0,
    name: '',
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
    department: ''
  })
  showModal.value = true
}

const openEdit = (u: AdminUser) => {
  isEditing.value = true
  Object.assign(form, {
    id: u.id,
    name: u.name,
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
    department: u.department || ''
  })
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const onRoleChange = () => {
  form.username = genUsernameByRole(form.role)
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const clearErrors = () => {
  Object.keys(errors).forEach(k => delete (errors as any)[k])
}

const usernameMatchesRole = (username: string, role: string) => {
  const isDigits = /^\d{10}$/.test(username)
  const prefix = role === 'Teacher' ? '01' : role === 'Student' ? '02' : '00'
  return isDigits && username.startsWith(prefix)
}

const getComparable = (u: AdminUser) => ({
  name: u.name.trim().toLowerCase(),
  email: u.email.trim().toLowerCase(),
  role: u.role,
  status: u.status,
  username: (u.username || '').trim(),
  course: (u.course || '').trim().toLowerCase(),
  year: (u.year || '').trim().toLowerCase(),
  section: (u.section || '').trim().toLowerCase(),
  department: (u.department || '').trim().toLowerCase(),
})

const isExactDuplicate = (a: AdminUser, b: AdminUser) => {
  const ca = getComparable(a)
  const cb = getComparable(b)
  return JSON.stringify(ca) === JSON.stringify(cb)
}

const validateForm = (): boolean => {
  clearErrors()
  if (!form.name || !form.name.trim()) errors.name = 'Name is required.'
  if (!form.email || !form.email.trim()) errors.email = 'Email is required.'
  else if (!emailRegex.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  if (!form.role) errors.role = 'Role is required.'
  if (!form.status) errors.status = 'Status is required.'

  if (!form.username || !usernameMatchesRole(form.username, form.role)) {
    errors.username = `Username must be 10 digits and start with ${form.role === 'Teacher' ? '01' : form.role === 'Student' ? '02' : '00'}.`
  }
  if (!form.password || form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  if (form.role === 'Student') {
    if (!form.course || !form.course.trim()) errors.course = 'Course is required for students.'
    if (!form.year || !form.year.trim()) errors.year = 'Year is required for students.'
    if (!form.section || !form.section.trim()) errors.section = 'Section is required for students.'
  }
  if (form.role === 'Teacher') {
    if (!form.department || !form.department.trim()) errors.department = 'Department is required for teachers.'
  }

  const emailTaken = users.value.some(u => u.id !== form.id && u.email.trim().toLowerCase() === form.email.trim().toLowerCase())
  if (emailTaken) errors.email = 'Email is already in use.'
  const usernameTaken = users.value.some(u => u.id !== form.id && (u.username || '').trim() === (form.username || '').trim())
  if (usernameTaken) errors.username = 'Username is already in use.'
  const exactDup = users.value.some(u => u.id !== form.id && isExactDuplicate(u, form))
  if (exactDup) errors._form = 'A user with the same information already exists.'

  return Object.keys(errors).length === 0
}

const saveUser = () => {
  if (!form.username) form.username = genUsernameByRole(form.role)
  if (!form.password) form.password = genPassword()
  if (!form.lastActive) {
    const d = new Date()
    form.lastActive = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  }

  if (!validateForm()) return

  if (isEditing.value) {
    const idx = users.value.findIndex(u => u.id === form.id)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], ...form }
  } else {
    const newId = users.value.length ? Math.max(...users.value.map(u => u.id)) + 1 : 1
    users.value.push({ ...form, id: newId })
  }
  showModal.value = false
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
  return status === 'Active' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800'
}
</script>


<template>
  <div class="animate-fade-in">
    <!-- User controls -->
    <div class="flex flex-col mt-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center space-x-4">
        <div class="relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search class="w-4 h-4 text-gray-400" />
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            name="search" 
            id="search" 
            class="block w-full py-2 pl-10 pr-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
            placeholder="Search users..."
          >
        </div>
        <div class="relative">
          <select 
            v-model="filterRole"
            id="filter" 
            name="filter" 
            class="block w-full py-2 pl-3 pr-10 text-base bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option>All Users</option>
            <option>Students</option>
            <option>Teachers</option>
            <option>Administrators</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center gap-3">
        <button 
          type="button" 
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="openAdd"
        >
          <Plus class="w-5 h-5 mr-2 -ml-1" />
          Add User
        </button>
        <label for="import-users" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer">
          Import Users
        </label>
        <input id="import-users" ref="importInput" type="file" accept=".csv,.json" class="hidden" @change="onImport" />
      </div>
    </div>
    
    <!-- User table -->
    <div class="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
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
                <span :class="['inline-flex px-2 text-xs font-semibold leading-5 rounded-full', getStatusBadgeClass(user.status)]">
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                <time :datetime="user.lastActive">{{ user.lastActive }}</time>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                <a href="#" @click.prevent="openEdit(user)" class="text-blue-600 hover:text-blue-900">Edit</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Pagination -->
    <div class="flex items-center justify-between px-4 py-3 mt-6 bg-white border-t border-gray-200 sm:px-6">
      <div class="flex justify-between flex-1 sm:hidden">
        <a href="#" @click.prevent="prevPage" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Previous
        </a>
        <a href="#" @click.prevent="nextPage" class="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Next
        </a>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ displayStart }}</span>
            to
            <span class="font-medium">{{ displayEnd }}</span>
            of
            <span class="font-medium">{{ totalItems }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <a href="#" @click.prevent="prevPage" class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50">
              <span class="sr-only">Previous</span>
              <ChevronLeft class="w-5 h-5" />
            </a>
            <template v-for="p in pageNumbers" :key="p + '-' + currentPage">
              <a v-if="typeof p === 'number'" href="#" @click.prevent="goToPage(p)"
                 :class="[
                   'relative inline-flex items-center px-4 py-2 text-sm font-medium border',
                   p === currentPage ? 'text-blue-600 border-blue-500 bg-blue-50 z-10' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                 ]">
                {{ p }}
              </a>
              <span v-else class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">...</span>
            </template>
            <a href="#" @click.prevent="nextPage" class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50">
              <span class="sr-only">Next</span>
              <ChevronRight class="w-5 h-5" />
            </a>
          </nav>
        </div>
      </div>
    </div>
    
    <!-- Modal: Add/Edit User -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div class="w-full max-w-lg max-h-[70vh] overflow-hidden bg-white rounded-lg shadow-lg flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h3 class="text-lg font-semibold">{{ isEditing ? 'Edit User' : 'Add User' }}</h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700"><X class="w-5 h-5" /></button>
          </div>
          <div class="px-6 py-4 overflow-y-auto">
            <p v-if="errors._form" class="mb-3 text-sm text-red-600">{{ errors._form }}</p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input v-model="form.name" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Full name" />
                <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="form.email" type="email" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="email@example.com" />
                <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select v-model="form.role" @change="onRoleChange" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option>Student</option>
                  <option>Teacher</option>
                  <option>Administrator</option>
                </select>
                <p v-if="errors.role" class="mt-1 text-xs text-red-600">{{ errors.role }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <select v-model="form.status" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <p v-if="errors.status" class="mt-1 text-xs text-red-600">{{ errors.status }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Username</label>
                <input v-model="form.username" type="text" readonly class="block w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-300 rounded-md focus:outline-none sm:text-sm" />
                <p v-if="errors.username" class="mt-1 text-xs text-red-600">{{ errors.username }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input v-model="form.password" type="text" readonly class="block w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-300 rounded-md focus:outline-none sm:text-sm" />
                <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
              </div>

              <!-- Student fields -->
              <template v-if="form.role === 'Student'">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Course</label>
                  <input v-model="form.course" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none sm:text-sm" />
                  <p v-if="errors.course" class="mt-1 text-xs text-red-600">{{ errors.course }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Year</label>
                  <input v-model="form.year" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none sm:text-sm" />
                  <p v-if="errors.year" class="mt-1 text-xs text-red-600">{{ errors.year }}</p>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Section</label>
                  <input v-model="form.section" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none sm:text-sm" />
                  <p v-if="errors.section" class="mt-1 text-xs text-red-600">{{ errors.section }}</p>
                </div>
              </template>

              <!-- Teacher fields -->
              <template v-else-if="form.role === 'Teacher'">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Department</label>
                  <input v-model="form.department" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none sm:text-sm" />
                  <p v-if="errors.department" class="mt-1 text-xs text-red-600">{{ errors.department }}</p>
                </div>
              </template>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t">
            <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button @click="saveUser" :disabled="Object.keys(errors).length > 0" :class="['px-4 py-2 text-sm font-medium text-white rounded-md', Object.keys(errors).length > 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700']">Save</button>
          </div>
        </div>
      </div>
    </Teleport>
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
