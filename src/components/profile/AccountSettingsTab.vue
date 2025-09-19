<script setup lang="ts">
import { ref } from 'vue'

const language = ref('English')
const timezone = ref('(GMT-08:00) Pacific Time (Philippines)')
const dateFormat = ref('MM/DD/YYYY')
const weeklySummary = ref(true)
const showOnline = ref(false)

function onCancel() {
  language.value = 'English'
  timezone.value = '(GMT-08:00) Pacific Time (Philippines)'
  dateFormat.value = 'MM/DD/YYYY'
  weeklySummary.value = true
  showOnline.value = false
}

function onSubmit(e: Event) {
  e.preventDefault()
  alert('Account preferences saved successfully!')
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-800 mb-6">Account Preferences</h3>
    <form @submit="onSubmit">
      <div class="mb-6">
        <label class="block text-gray-700 mb-2" for="language">Language</label>
        <select v-model="language" id="language" class="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
          <option>Chinese</option>
        </select>
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 mb-2" for="timezone">Timezone</label>
        <select v-model="timezone" id="timezone" class="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
          <option>(GMT-05:00) Eastern Time (Philippines)</option>
          <option>(GMT-06:00) Central Time (Philippines)</option>
          <option>(GMT-07:00) Mountain Time (Philippines)</option>
          <option>(GMT-08:00) Pacific Time (Philippines)</option>
          <option>(GMT+00:00) Manila Time</option>
        </select>
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 mb-2" for="date-format">Date Format</label>
        <select v-model="dateFormat" id="date-format" class="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
          <option>MM/DD/YYYY</option>
          <option>DD/MM/YYYY</option>
          <option>YYYY-MM-DD</option>
        </select>
      </div>
      <div class="mb-6">
        <label class="flex items-center">
          <input v-model="weeklySummary" type="checkbox" class="rounded text-sky-600 focus:ring-sky-500">
          <span class="ml-2 text-gray-700">Receive weekly summary emails</span>
        </label>
      </div>
      <div class="mb-6">
        <label class="flex items-center">
          <input v-model="showOnline" type="checkbox" class="rounded text-sky-600 focus:ring-sky-500">
          <span class="ml-2 text-gray-700">Show online status to students</span>
        </label>
      </div>
      <div class="flex justify-end">
        <button type="button" @click="onCancel" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 mr-4 hover:bg-gray-50">Cancel</button>
        <button type="submit" class="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition">Save Preferences</button>
      </div>
    </form>
  </div>
</template>
