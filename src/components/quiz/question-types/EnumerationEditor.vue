<script setup lang="ts">
interface Props {
  items: string[]
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false
})

const emit = defineEmits<{
  'update:items': [items: string[]]
}>()

function getOptionLetter(index: number) {
  const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return base[index] || String(index + 1)
}

function addItem() {
  const newItems = [...props.items, '']
  emit('update:items', newItems)
}

function removeItem(index: number) {
  const newItems = props.items.filter((_, i) => i !== index)
  emit('update:items', newItems)
}

function updateItem(index: number, value: string) {
  const newItems = [...props.items]
  newItems[index] = value
  emit('update:items', newItems)
}
</script>

<template>
  <div class="mb-6">
    <label class="block text-sm font-medium text-gray-700 mb-2">Items to Enumerate</label>
    <div class="space-y-3">
      <div v-for="(item, index) in items" :key="index" class="flex items-center">
        <div class="flex-1 group">
          <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-2.5 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
            <span class="min-w-6 h-6 inline-flex items-center justify-center text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
              {{ getOptionLetter(index) }}
            </span>

            <input 
              :value="item"
              @input="updateItem(index, ($event.target as HTMLInputElement).value)"
              :disabled="props.readOnly"
              type="text"
              :placeholder="`Item ${index + 1}`"
              class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400 disabled:opacity-80 disabled:cursor-not-allowed" 
            />
          </div>
        </div>

        <div class="ml-3 flex items-center gap-2 self-stretch" v-if="!props.readOnly">
          <button 
            @click="removeItem(index)" 
            title="Remove item"
            class="inline-flex items-center justify-center w-9 h-9 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
    <button 
      v-if="!props.readOnly"
      @click="addItem"
      class="mt-3 bg-blue-50 text-blue-600 text-sm py-2 px-3 rounded-md hover:bg-blue-100 transition-colors"
    >
      <i class="fas fa-plus mr-1"></i> Add Item
    </button>
  </div>
</template>
