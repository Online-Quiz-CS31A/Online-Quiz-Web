<script setup lang="ts">
import { computed } from 'vue'
import { Search, SlidersHorizontal, X } from 'lucide-vue-next'

type Option = string | { label: string; value: string }

const props = defineProps<{
  modelValue: string
  filter: string
  options: Option[]
  filter2?: string
  options2?: Option[]
  placeholder?: string
  disabled?: boolean
  actionLabel?: string
  importLabel?: string
  importAccept?: string
  showImport?: boolean
  noBorder?: boolean
  resultCount?: number
  resultLabel?: string
  hasActiveFilters?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'update:filter', v: string): void
  (e: 'update:filter2', v: string): void
  (e: 'action'): void
  (e: 'import', ev: Event): void
  (e: 'clear-filters'): void
}>()

const normalizedOptions = computed(() =>
  (props.options || []).map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o
  )
)

const normalizedOptions2 = computed(() =>
  (props.options2 || []).map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o
  )
)
</script>

<template>
  <div class="bg-white rounded-xl p-4 shadow-sm" :class="{ 'border border-gray-200': !props.noBorder }">
    <div class="flex flex-col gap-3">

      <!-- Row 1: Search + Action buttons -->
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <!-- Search input with inline clear -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search class="w-4 h-4 text-gray-400" />
          </div>
          <input
            :value="modelValue"
            :placeholder="placeholder || 'Search...'"
            :disabled="disabled"
            @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            type="text"
            class="block w-full py-2.5 pl-10 pr-9 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          />
          <button
            v-if="modelValue"
            @click="emit('update:modelValue', '')"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2">
          <slot name="actions">
            <button
              v-if="props.actionLabel"
              type="button"
              class="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
              :disabled="disabled"
              @click="emit('action')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              {{ props.actionLabel }}
            </button>
            <label
              v-if="props.importLabel !== undefined && (props.showImport ?? true)"
              class="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap"
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

      <!-- Row 2: Filter dropdowns + result count + clear -->
      <div class="flex flex-wrap items-center gap-2">
        <SlidersHorizontal class="w-4 h-4 text-gray-400 flex-shrink-0" />

        <!-- Primary filter -->
        <select
          :value="filter"
          :disabled="disabled"
          @change="emit('update:filter', ($event.target as HTMLSelectElement).value)"
          class="py-1.5 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <!-- Secondary filter -->
        <select
          v-if="props.options2 && props.options2.length"
          :value="filter2"
          :disabled="disabled"
          @change="emit('update:filter2', ($event.target as HTMLSelectElement).value)"
          class="py-1.5 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option v-for="opt in normalizedOptions2" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <slot name="filters" />

        <!-- Result count -->
        <span v-if="resultCount !== undefined" class="ml-auto text-sm text-gray-500">
          {{ resultCount }} {{ resultLabel || 'result' }}{{ resultCount !== 1 ? 's' : '' }} found
        </span>

        <!-- Clear filters button -->
        <button
          v-if="hasActiveFilters"
          @click="emit('clear-filters')"
          class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <X class="w-3 h-3" /> Clear filters
        </button>
      </div>

    </div>
  </div>
</template>
