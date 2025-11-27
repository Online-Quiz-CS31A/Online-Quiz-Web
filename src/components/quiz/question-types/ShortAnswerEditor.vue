<script setup lang="ts">
interface Props {
  correctAnswer: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:correctAnswer': [value: string]
}>()

function updateAnswer(e: Event) {
  emit('update:correctAnswer', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="mb-6">
    <label class="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
    <div class="flex items-center">
      <div class="flex-1 group">
        <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-2.5 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
          <i class="fas fa-align-left text-blue-500"></i>
          <input 
            :value="correctAnswer"
            @input="updateAnswer"
            type="text"
            class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400"
            placeholder="Enter the correct answer" 
          />
        </div>
      </div>
    </div>
  </div>
</template>
