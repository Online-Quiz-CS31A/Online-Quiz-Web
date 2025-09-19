<script setup lang="ts">
import { ref } from 'vue'

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const sms2FA = ref(false)

function onSubmit(e: Event) {
  e.preventDefault()
  if (newPassword.value !== confirmPassword.value) {
    alert('New passwords do not match!')
    return
  }
  if (newPassword.value.length < 8) {
    alert('Password must be at least 8 characters long')
    return
  }
  alert('Password changed successfully!')
}

function onLogoutSession(kind: 'desktop' | 'mobile') {
  alert(`Logged out ${kind} session`)
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-800 mb-6">Security Settings</h3>
    <form @submit="onSubmit">
      <div class="mb-6">
        <h4 class="font-medium text-gray-700 mb-4">Change Password</h4>
        <div class="space-y-4">
          <div class="relative">
            <label class="block text-gray-700 mb-2" for="current-password">Current Password</label>
            <input :type="showCurrent ? 'text' : 'password'" id="current-password" v-model="currentPassword" class="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
            <button type="button" class="absolute right-3 top-9 text-slate-500" @click="showCurrent = !showCurrent">
              <i :class="showCurrent ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div class="relative">
            <label class="block text-gray-700 mb-2" for="new-password">New Password</label>
            <input :type="showNew ? 'text' : 'password'" id="new-password" v-model="newPassword" class="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
            <button type="button" class="absolute right-3 top-9 text-slate-500" @click="showNew = !showNew">
              <i :class="showNew ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div class="relative">
            <label class="block text-gray-700 mb-2" for="confirm-password">Confirm New Password</label>
            <input :type="showConfirm ? 'text' : 'password'" id="confirm-password" v-model="confirmPassword" class="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
            <button type="button" class="absolute right-3 top-9 text-slate-500" @click="showConfirm = !showConfirm">
              <i :class="showConfirm ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="font-medium text-gray-700 mb-4">Two-Factor Authentication</h4>
        <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div>
            <p class="text-gray-700 font-medium">SMS Authentication</p>
            <p class="text-gray-500 text-sm">Add an extra layer of security to your account</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="sms2FA" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="font-medium text-gray-700 mb-4">Active Sessions</h4>
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <i class="fas fa-desktop text-gray-500 mr-3"></i>
              <div>
                <p class="text-gray-700 font-medium">Windows 10 • Chrome</p>
                <p class="text-gray-500 text-sm">Manila, Philippines • Active now</p>
              </div>
            </div>
            <button type="button" class="text-red-500 hover:text-red-700" @click="onLogoutSession('desktop')">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <i class="fas fa-mobile-alt text-gray-500 mr-3"></i>
              <div>
                <p class="text-gray-700 font-medium">iOS • Safari</p>
                <p class="text-gray-500 text-sm">Cavite, Philippines • 2 hours ago</p>
              </div>
            </div>
            <button type="button" class="text-red-500 hover:text-red-700" @click="onLogoutSession('mobile')">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button type="button" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 mr-4 hover:bg-gray-50">Cancel</button>
        <button type="submit" class="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition">Save Changes</button>
      </div>
    </form>
  </div>
</template>
