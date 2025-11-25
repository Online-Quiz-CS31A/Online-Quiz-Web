<script setup lang="ts">
interface Props {
  correctAnswer: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:correctAnswer': [value: string]
}>()

function updateAnswer(e: Event) {
  emit('update:correctAnswer', (e.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="mb-6">
    <label class="block text-sm font-medium text-gray-700 mb-2">Sample Answer (optional)</label>
    <div class="flex items-start">
      <div class="flex-1 group">
        <div class="flex items-start gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-3 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
          <i class="fas fa-pen-fancy text-blue-500 mt-1"></i>
          <textarea 
            :value="correctAnswer"
            @input="updateAnswer"
            class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400 resize-none"
            rows="5"
            placeholder="Enter a sample answer (minimum 3 sentences)..."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
