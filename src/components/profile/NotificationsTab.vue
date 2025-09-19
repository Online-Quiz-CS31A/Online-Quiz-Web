<script setup lang="ts">
import { ref } from 'vue'

const assignmentSubmissionsEmail = ref(true)
const gradeAppealsEmail = ref(true)
const courseAnnouncementsEmail = ref(false)

const privateMessagesInApp = ref(true)
const discussionRepliesInApp = ref(true)

function onCancel() {
  assignmentSubmissionsEmail.value = true
  gradeAppealsEmail.value = true
  courseAnnouncementsEmail.value = false
  privateMessagesInApp.value = true
  discussionRepliesInApp.value = true
}

function onSubmit(e: Event) {
  e.preventDefault()
  alert('Notification preferences saved successfully!')
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-800 mb-6">Notification Preferences</h3>
    <form @submit="onSubmit">
      <div class="mb-8">
        <h4 class="font-medium text-gray-700 mb-4">Email Notifications</h4>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-700 font-medium">Assignment Submissions</p>
              <p class="text-gray-500 text-sm">Get notified when students submit assignments</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="assignmentSubmissionsEmail" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-700 font-medium">Grade Appeals</p>
              <p class="text-gray-500 text-sm">Get notified when students appeal grades</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="gradeAppealsEmail" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-700 font-medium">Course Announcements</p>
              <p class="text-gray-500 text-sm">Get notified about new course announcements</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="courseAnnouncementsEmail" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <h4 class="font-medium text-gray-700 mb-4">In-App Notifications</h4>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-700 font-medium">Private Messages</p>
              <p class="text-gray-500 text-sm">Get notified when you receive private messages</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="privateMessagesInApp" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-700 font-medium">Discussion Replies</p>
              <p class="text-gray-500 text-sm">Get notified when students reply to your discussions</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="discussionRepliesInApp" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button type="button" @click="onCancel" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 mr-4 hover:bg-gray-50">Cancel</button>
        <button type="submit" class="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition">Save Preferences</button>
      </div>
    </form>
  </div>
</template>
