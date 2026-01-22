<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Clock, RefreshCw, AlertTriangle, Save, RotateCcw, Check } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import type { QuizSettings } from '@/interfaces/interfaces'

const { success, error, info } = useToast()

// REACTIVE
const settings = reactive<QuizSettings>({
  defaultTimeLimit: 60,
  allowRetakes: true,
  maxRetakes: 3,
  retakeCooldown: 24,
  tabSwitchWarningThreshold: 3,
  tabSwitchAutoSubmit: true,
  showCorrectAnswers: false,
  showScoreImmediately: true,
  passingScore: 70,
  randomizeQuestions: false,
  randomizeOptions: false,
  allowReview: true
})

const originalSettings = ref({ ...settings })
const isSaving = ref(false)
const hasChanges = ref(false)

// METHODS
const updateSetting = () => {
  hasChanges.value = JSON.stringify(settings) !== JSON.stringify(originalSettings.value)
}

const saveSettings = async () => {
  isSaving.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem('adminQuizSettings', JSON.stringify(settings))
    originalSettings.value = { ...settings }
    hasChanges.value = false
    
    success('Settings saved successfully')
  } catch (err) {
    error('Failed to save settings')
  } finally {
    isSaving.value = false
  }
}

const resetToDefaults = () => {
  if (confirm('Reset all settings to default values?')) {
    Object.assign(settings, {
      defaultTimeLimit: 60,
      allowRetakes: true,
      maxRetakes: 3,
      retakeCooldown: 24,
      tabSwitchWarningThreshold: 3,
      tabSwitchAutoSubmit: true,
      showCorrectAnswers: false,
      showScoreImmediately: true,
      passingScore: 70,
      randomizeQuestions: false,
      randomizeOptions: false,
      allowReview: true
    })
    updateSetting()
    info('Settings reset to defaults')
  }
}

const discardChanges = () => {
  if (confirm('Discard all unsaved changes?')) {
    Object.assign(settings, originalSettings.value)
    hasChanges.value = false
    info('Changes discarded')
  }
}

// LIFECYCLE
onMounted(() => {
  const saved = localStorage.getItem('adminQuizSettings')
  if (saved) {
    Object.assign(settings, JSON.parse(saved))
    originalSettings.value = { ...settings }
  }
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <button
          v-if="hasChanges"
          @click="discardChanges"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <RotateCcw :size="16" />
          Discard
        </button>
        <button
          @click="resetToDefaults"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw :size="16" />
          Reset to Defaults
        </button>
        <button
          @click="saveSettings"
          :disabled="!hasChanges || isSaving"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Save v-if="!isSaving" :size="16" />
          <div v-else class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Time Management -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-blue-50 rounded-lg">
            <Clock class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Time Management</h3>
            <p class="text-sm text-gray-500">Configure quiz duration settings</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Default Time Limit (minutes)
            </label>
            <input
              v-model.number="settings.defaultTimeLimit"
              @input="updateSetting"
              type="number"
              min="1"
              max="300"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <p class="mt-1 text-xs text-gray-500">
              Default duration for new quizzes (1-300 minutes)
            </p>
          </div>
        </div>
      </div>

      <!-- Retake Policy -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-green-50 rounded-lg">
            <RefreshCw class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Retake Policy</h3>
            <p class="text-sm text-gray-500">Configure quiz retake options</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <label class="text-sm font-medium text-gray-700">Allow Retakes</label>
              <p class="text-xs text-gray-500">Enable students to retake quizzes</p>
            </div>
            <button
              @click="settings.allowRetakes = !settings.allowRetakes; updateSetting()"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.allowRetakes ? 'bg-blue-600' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.allowRetakes ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <div v-if="settings.allowRetakes" class="space-y-4 pl-4 border-l-2 border-blue-200">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Maximum Retakes
              </label>
              <input
                v-model.number="settings.maxRetakes"
                @input="updateSetting"
                type="number"
                min="1"
                max="10"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cooldown Period (hours)
              </label>
              <input
                v-model.number="settings.retakeCooldown"
                @input="updateSetting"
                type="number"
                min="0"
                max="168"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p class="mt-1 text-xs text-gray-500">Time before next attempt</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Switch Monitoring -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Warning Threshold
            </label>
            <input
              v-model.number="settings.tabSwitchWarningThreshold"
              @input="updateSetting"
              type="number"
              min="1"
              max="10"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <p class="mt-1 text-xs text-gray-500">
              Number of tab switches before action
            </p>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex-1">
              <label class="text-sm font-medium text-gray-700">Auto-Submit on Exceed</label>
              <p class="text-xs text-gray-500">Automatically submit quiz after threshold</p>
            </div>
            <button
              @click="settings.tabSwitchAutoSubmit = !settings.tabSwitchAutoSubmit; updateSetting()"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.tabSwitchAutoSubmit ? 'bg-blue-600' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.tabSwitchAutoSubmit ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Display & Scoring -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-purple-50 rounded-lg">
            <Check class="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Display & Scoring</h3>
            <p class="text-sm text-gray-500">Result visibility settings</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Passing Score (%)
            </label>
            <input
              v-model.number="settings.passingScore"
              @input="updateSetting"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">Show Score Immediately</label>
              <button
                @click="settings.showScoreImmediately = !settings.showScoreImmediately; updateSetting()"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings.showScoreImmediately ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.showScoreImmediately ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>

            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">Show Correct Answers</label>
              <button
                @click="settings.showCorrectAnswers = !settings.showCorrectAnswers; updateSetting()"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings.showCorrectAnswers ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.showCorrectAnswers ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>

            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">Allow Review After Submit</label>
              <button
                @click="settings.allowReview = !settings.allowReview; updateSetting()"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings.allowReview ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.allowReview ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>

            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">Randomize Questions</label>
              <button
                @click="settings.randomizeQuestions = !settings.randomizeQuestions; updateSetting()"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings.randomizeQuestions ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.randomizeQuestions ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>

            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">Randomize Options</label>
              <button
                @click="settings.randomizeOptions = !settings.randomizeOptions; updateSetting()"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings.randomizeOptions ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.randomizeOptions ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Status -->
    <div v-if="hasChanges" class="fixed bottom-6 right-6 bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-lg">
      <div class="flex items-center gap-3">
        <AlertTriangle class="w-5 h-5 text-orange-600" />
        <span class="text-sm font-medium text-orange-900">You have unsaved changes</span>
      </div>
    </div>
  </div>
</template>
