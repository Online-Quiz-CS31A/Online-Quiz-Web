<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'
import type { QuizQuestion } from '@/interfaces/interfaces'

interface Props {
  question: QuizQuestion | null
  questionSettings: {
    type: string
    points: number
    mediaType: string
    required: boolean
  }
  questionTypes: Array<{ value: string; label: string }>
  showMediaUpload: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:type': [value: string]
  'update:points': [value: number]
  'update:mediaType': [value: string]
  'update:required': [value: boolean]
  'mediaChange': [event: Event]
  'clearMedia': []
  'moveUp': []
  'moveDown': []
  'shuffle': []
}>()

function updateType(value: string) {
  emit('update:type', value)
}

function updatePoints(value: number) {
  emit('update:points', value)
}

function updateMediaType(value: string) {
  emit('update:mediaType', value)
}
</script>

<template>
  <div class="w-80 flex flex-col p-4">
    <div class="bg-white rounded-lg flex-1 overflow-y-auto p-4 pretty-scroll space-y-6">
      <!-- Type and Points -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-700">Question Type</label>
        </div>
        <select 
          :value="questionSettings.type"
          @change="updateType(($event.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="type in questionTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
        <div class="grid grid-cols-1 gap-3 mt-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Points</label>
            <input 
              :value="questionSettings.points"
              @input="updatePoints(Number(($event.target as HTMLInputElement).value))"
              type="number" 
              min="1" 
              class="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p
              v-if="questionSettings.type === 'enumeration' || questionSettings.type === 'matching'"
              class="mt-1 text-xs text-gray-500"
            >
              Points per item
            </p>
          </div>
        </div>
      </div>

      <!-- Media -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-700">Media</label>
        </div>
        <select 
          :value="questionSettings.mediaType"
          @change="updateMediaType(($event.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        >
          <option value="none">None</option>
          <option value="image">Image</option>
        </select>
        <div v-if="showMediaUpload" class="">
          <div v-if="question?.mediaUrl" class="mb-3">
            <div class="relative">
              <img :src="question.mediaUrl" alt="question image" class="w-full h-40 object-cover rounded-md border" />
            </div>
            <button @click="emit('clearMedia')" class="mt-2 text-red-600 text-sm hover:underline">Remove image</button>
          </div>
          <label v-else class="block w-full">
            <div class="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-300 transition">
              <i class="fas fa-cloud-upload-alt text-3xl text-blue-300 mb-2"></i>
              <p class="text-sm text-gray-500">Click to upload or drag and drop (image only)</p>
            </div>
            <input type="file" accept="image/*" class="hidden" @change="emit('mediaChange', $event)" />
          </label>
        </div>
      </div>

      <!-- Quick Actions -->
      <div v-if="question">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-700">Quick Actions</label>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button @click="emit('moveUp')" 
                  class="bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors">
            <i class="fas fa-arrow-up"></i>
            <span class="text-sm">Move Up</span>
          </button>
          <button @click="emit('moveDown')" 
                  class="bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors">
            <i class="fas fa-arrow-down"></i>
            <span class="text-sm">Move Down</span>
          </button>
          <button v-if="question.type === 'multiple-choice'" @click="emit('shuffle')" 
                  class="col-span-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors">
            <i class="fas fa-random"></i>
            <span class="text-sm">Shuffle Options</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pretty-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.6) transparent;
}
.pretty-scroll::-webkit-scrollbar {
  width: 10px;
}
.pretty-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.pretty-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.5);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.pretty-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.7);
}
</style>
