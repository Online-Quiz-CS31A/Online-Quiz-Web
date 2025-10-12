<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { Search } from 'lucide-vue-next'

type Option = string | { label: string; value: string }

const props = defineProps<{
  modelValue: string
  filter: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
  actionLabel?: string
  importLabel?: string
  importAccept?: string
  showImport?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'update:filter', v: string): void
  (e: 'action'): void
  (e: 'import', ev: Event): void
}>()

const normalizedOptions = computed(() =>
  (props.options || []).map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o
  )
)

const slots = useSlots()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div class="flex items-center space-x-3 flex-1">
        <div class="relative rounded-lg shadow-sm flex-1 max-w-md">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search class="w-4 h-4 text-gray-400" />
          </div>
          <input
            :value="modelValue"
            :placeholder="placeholder || 'Search...'"
            :disabled="disabled"
            @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            type="text"
            class="block w-full py-2.5 pl-10 pr-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          />
        </div>
        <div class="relative">
          <select
            :value="filter"
            :disabled="disabled"
            @change="emit('update:filter', ($event.target as HTMLSelectElement).value)"
            class="block w-full py-2.5 pl-3 pr-10 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          >
            <option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <slot name="actions">
          <button
            v-if="props.actionLabel"
            type="button"
            class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            :disabled="disabled"
            @click="emit('action')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 -ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            {{ props.actionLabel }}
          </button>
          <label
            v-if="props.importLabel !== undefined && (props.showImport ?? true)"
            class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {{ props.importLabel }}
            <input
              type="file"
              class="hidden"
              :accept="props.importAccept || '.csv,.json'"
              :disabled="disabled"
              @change="(ev) => emit('import', ev)"
            />
          </label>
        </slot>
      </div>
    </div>
  </div>
</template>
