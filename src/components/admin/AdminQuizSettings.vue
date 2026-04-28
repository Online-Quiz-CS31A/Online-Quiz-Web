<script setup lang="ts">
import { Clock, RefreshCw, AlertTriangle } from 'lucide-vue-next'

// Available time limit presets configured for instructors
const timePresets = [30, 60, 90, 120, 180]
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">Quiz Settings</h2>
      <p class="text-sm text-gray-500">Default system configurations (view only)</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Time Management -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-blue-50 rounded-lg">
            <Clock class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Time Management</h3>
            <p class="text-sm text-gray-500">Handled by Instructors</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium text-gray-700 mb-2">Available Time Limits</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="preset in timePresets"
                :key="preset"
                class="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
              >
                {{ preset }} mins
              </span>
            </div>
            <p class="mt-2 text-xs text-gray-500">
              Instructors select from these presets when creating quizzes.
            </p>
          </div>
        </div>
      </div>

      <!-- Retake Policy -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-green-50 rounded-lg">
            <RefreshCw class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Retake Policy</h3>
            <p class="text-sm text-gray-500">System-wide retake configuration</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p class="text-sm text-amber-800">
              All quizzes can only be taken <strong>once</strong>. There are no retakes allowed.
            </p>
          </div>
        </div>
      </div>

      <!-- Tab Switch Monitoring -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-orange-50 rounded-lg">
            <AlertTriangle class="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Tab Switch Monitoring</h3>
            <p class="text-sm text-gray-500">Anti-cheating measures</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-gray-100">
            <span class="text-sm text-gray-600">Warning Threshold</span>
            <span class="text-sm font-semibold text-gray-900">2 warnings</span>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-gray-100">
            <span class="text-sm text-gray-600">Auto-Submit on Exceed</span>
            <span class="text-sm font-semibold text-gray-900">Enabled</span>
          </div>
          <div class="bg-red-50 border border-red-100 rounded-lg p-3">
            <p class="text-sm text-red-800">
              Once <strong>2/2</strong> violations are reached, the quiz will be <strong>automatically submitted</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
