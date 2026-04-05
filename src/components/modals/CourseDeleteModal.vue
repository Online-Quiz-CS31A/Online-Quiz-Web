<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangle, X } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  courseName?: string
  courseCode?: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()

const confirmationText = ref('')
const isConfirmed = () => confirmationText.value.toUpperCase() === 'DELETE'
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[9999] flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" @click="emit('cancel')"></div>

      <!-- Modal -->
      <div class="relative w-full max-w-md bg-white rounded-xl shadow-2xl transform transition-all scale-100 p-6">
        <button 
          @click="emit('cancel')"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle class="w-6 h-6 text-red-600" />
          </div>

          <h3 class="text-xl font-bold text-gray-900 mb-2">Delete Course?</h3>
          
          <div class="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 w-full">
            <p class="text-sm text-red-800 mb-1">You are about to delete:</p>
            <p class="font-bold text-red-900 text-lg">{{ courseName }}</p>
            <p class="text-xs text-red-700 font-mono mt-1">{{ courseCode }}</p>
          </div>

          <p class="text-sm text-gray-500 mb-6">
            This action cannot be undone. All data associated with this course, including student enrollments and grades, will be permanently removed.
          </p>

          <div class="w-full mb-6">
            <label class="block text-xs font-medium text-gray-700 mb-2 text-left">
              Type <span class="font-mono font-bold text-red-600">DELETE</span> to confirm
            </label>
            <input 
              v-model="confirmationText"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-center font-mono uppercase placeholder-gray-300"
              placeholder="DELETE"
            />
          </div>

          <div class="flex gap-3 w-full">
            <button 
              @click="emit('cancel')"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="emit('confirm')"
              :disabled="!isConfirmed()"
              :class="[
                'flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-sm',
                isConfirmed() 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                  : 'bg-gray-300 cursor-not-allowed'
              ]"
            >
              Delete Course
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>