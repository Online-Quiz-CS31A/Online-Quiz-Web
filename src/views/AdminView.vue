<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-blue-400 text-black p-4">
      <h2 class="text-xl font-bold mb-4 bg-blue-500 text-center rounded-md">Admin Panel</h2>
      <ul class="space-y-2">
        <li><a href="#user-management" class="block p-2 hover:bg-blue-700 rounded">User Management</a></li>
        <li><a href="#subject-catalogue" class="block p-2 hover:bg-blue-700 rounded">Subjects / Courses</a></li>
        <li><a href="#quiz-settings" class="block p-2 hover:bg-blue-700 rounded">Global Quiz Settings</a></li>
        <li><a href="#data-export" class="block p-2 hover:bg-blue-700 rounded">Data Export / Import</a></li>
        <li><a href="#audit-analytics" class="block p-2 hover:bg-blue-700 rounded">Audit & Analytics</a></li>
      </ul>
    </aside>

    <!-- Content Area -->
    <main class="flex-1 p-6 bg-blue-100 space-y-6">
      <!-- User Management -->
      <div id="user-management" class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-2">User Management</h2>
        <p class="mb-2">Create, edit, deactivate accounts for teachers & students. Reset passwords as needed.</p>
        <div class="flex gap-2 mb-4">
          <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add User</button>
          <button class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Reset Password</button>
        </div>
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="py-2 px-4 border-b">Name</th>
              <th class="py-2 px-4 border-b">Email</th>
              <th class="py-2 px-4 border-b">Role</th>
              <th class="py-2 px-4 border-b">Status</th>
              <th class="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="py-2 px-4 border-b">{{ user.name }}</td>
              <td class="py-2 px-4 border-b">{{ user.email }}</td>
              <td class="py-2 px-4 border-b">{{ user.role }}</td>
              <td class="py-2 px-4 border-b">
                <span :class="user.active ? 'text-green-600' : 'text-red-600'">
                  {{ user.active ? 'Active' : 'Deactivated' }}
                </span>
              </td>
              <td class="py-2 px-4 border-b">
                <button class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-2">Edit</button>
                <button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Deactivate</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Subjects / Courses -->
      <div id="subject-catalogue" class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-2">Subjects / Courses</h2>
        <p class="mb-2">CRUD operations on subjects so teachers can assign quizzes consistently.</p>
        <button class="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add Subject</button>
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="py-2 px-4 border-b">Subject</th>
              <th class="py-2 px-4 border-b">Code</th>
              <th class="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in subjects" :key="subject.id">
              <td class="py-2 px-4 border-b">{{ subject.name }}</td>
              <td class="py-2 px-4 border-b">{{ subject.code }}</td>
              <td class="py-2 px-4 border-b">
                <button class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2">Edit</button>
                <button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Global Quiz Settings -->
      <div id="quiz-settings" class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-2">Global Quiz Settings</h2>
        <p class="mb-2">Configure default time-limits, retake policy, tab-switch warning thresholds.</p>
        <form class="space-y-4">
          <div>
            <label class="block font-medium">Default Time Limit (minutes):</label>
            <input type="number" v-model="quizSettings.timeLimit" class="border rounded px-2 py-1 w-32" />
          </div>
          <div>
            <label class="block font-medium">Retake Policy:</label>
            <select v-model="quizSettings.retakePolicy" class="border rounded px-2 py-1 w-48">
              <option value="no-retake">No Retake</option>
              <option value="one-retake">One Retake</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>
          <div>
            <label class="block font-medium">Tab-switch Warning Threshold:</label>
            <input type="number" v-model="quizSettings.tabSwitchThreshold" class="border rounded px-2 py-1 w-32" />
          </div>
          <button type="button" class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Save Settings</button>
        </form>
      </div>

      <!-- Data Export / Import -->
      <div id="data-export" class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-2">Data Export / Import</h2>
        <p class="mb-2">Download full database snapshots (CSV/JSON) or restore from a backup file.</p>
        <div class="flex gap-2 mb-2">
          <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Export CSV</button>
          <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Export JSON</button>
          <input type="file" class="ml-4" />
          <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Import Backup</button>
        </div>
      </div>

      <!-- Audit & Analytics -->
      <div id="audit-analytics" class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-2">Audit & Analytics</h2>
        <p class="mb-2">View system logs (log-ins, quiz creations, warnings issued).</p>
        <ul class="list-disc pl-6">
          <li v-for="log in logs" :key="log.id" class="mb-1">
            <span class="font-semibold">{{ log.type }}:</span> {{ log.message }} <span class="text-gray-500 text-xs">({{ log.time }})</span>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface User {
  id: number
  name: string
  email: string
  role: string
  active: boolean
}

interface Subject {
  id: number
  name: string
  code: string
}

interface Log {
  id: number
  type: string
  message: string
  time: string
}

const users = ref<User[]>([
  { id: 1, name: 'John Doe', email: 'john.doe@university.edu', role: 'Student', active: true },
  { id: 2, name: 'Alice Smith', email: 'alice.smith@university.edu', role: 'Teacher', active: true },
  { id: 3, name: 'Robert Johnson', email: 'robert.j@university.edu', role: 'Student', active: false },
])

const subjects = ref<Subject[]>([
  { id: 1, name: 'Mathematics', code: 'MATH101' },
  { id: 2, name: 'Physics', code: 'PHYS201' },
  { id: 3, name: 'Computer Science', code: 'CS301' },
])

const quizSettings = reactive({
  timeLimit: 60,
  retakePolicy: 'no-retake',
  tabSwitchThreshold: 3,
})

const logs = ref<Log[]>([
  { id: 1, type: 'Login', message: 'Alice Smith logged in', time: '2025-09-14 08:00' },
  { id: 2, type: 'Quiz Created', message: 'Math Quiz 1 created by John Doe', time: '2025-09-13 14:22' },
  { id: 3, type: 'Warning', message: 'Tab switch detected for Robert Johnson', time: '2025-09-13 15:10' },
])
</script>