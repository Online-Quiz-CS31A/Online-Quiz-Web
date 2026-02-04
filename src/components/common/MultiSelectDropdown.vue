<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ChevronDown, X, Search, Check } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: (string | number)[]
  options: { label: string; value: string | number }[]
  placeholder?: string
  label?: string
  maxVisibleTags?: number
}>(), {
  maxVisibleTags: 1
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref<HTMLElement | null>(null)

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

const selectedLabels = computed(() => {
  return props.options
    .filter(o => props.modelValue.includes(o.value))
    .map(o => o.label)
})

const isAllSelected = computed(() => {
  return props.options.length > 0 && props.modelValue.length === props.options.length
})

const toggleOption = (value: string | number) => {
  const newValue = [...props.modelValue]
  const idx = newValue.indexOf(value)
  if (idx === -1) {
    newValue.push(value)
  } else {
    newValue.splice(idx, 1)
  }
  emit('update:modelValue', newValue)
}

const toggleAll = () => {
  if (isAllSelected.value) {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', props.options.map(o => o.value))
  }
}

const removeTag = (value: string | number) => {
  const newValue = props.modelValue.filter(v => v !== value)
  emit('update:modelValue', newValue)
}

const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="relative" ref="containerRef">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    
    <!-- Trigger -->
    <div 
      @click="isOpen = !isOpen"
      class="min-h-[38px] w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 cursor-pointer flex items-center justify-between hover:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500"
    >
      <div class="flex flex-wrap gap-1.5">
        <span v-if="modelValue.length === 0" class="text-gray-400 text-sm">{{ placeholder || 'Select...' }}</span>
        
        <!-- Display first items -->
        <div 
          v-for="val in modelValue.slice(0, maxVisibleTags)" 
          :key="val"
          class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded flex items-center max-w-[100px]"
        >
          <span class="truncate">{{ options.find(o => o.value === val)?.label || val }}</span>
          <X 
            class="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900 flex-shrink-0" 
            @click.stop="removeTag(val)"
          />
        </div>

        <!-- Display count for remaining items -->
        <div 
          v-if="modelValue.length > maxVisibleTags"
          class="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded flex items-center"
        >
          +{{ modelValue.length - maxVisibleTags }} more
        </div>
      </div>
      <ChevronDown class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': isOpen }" />
    </div>

    <!-- Dropdown -->
    <div v-if="isOpen" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 flex flex-col">
      <!-- Search -->
      <div class="p-2 border-b border-gray-100">
        <div class="relative">
          <Search class="absolute left-2 top-2.5 w-3.5 h-3.5 text-gray-400" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search..." 
            class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
          >
        </div>
      </div>

      <!-- Options -->
      <div class="overflow-y-auto flex-1 p-1">
        <!-- Select All -->
        <div 
          v-if="!searchQuery"
          @click="toggleAll"
          class="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 text-gray-700 font-medium border-b border-gray-50 mb-1"
        >
          <div 
            class="w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors"
            :class="isAllSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'"
          >
            <Check v-if="isAllSelected" class="w-3 h-3 text-white" />
          </div>
          Select All
        </div>

        <div 
          v-for="opt in filteredOptions" 
          :key="opt.value"
          @click="toggleOption(opt.value)"
          class="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
        >
          <div 
            class="w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors"
            :class="modelValue.includes(opt.value) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'"
          >
            <Check v-if="modelValue.includes(opt.value)" class="w-3 h-3 text-white" />
          </div>
          {{ opt.label }}
        </div>
        
        <div v-if="filteredOptions.length === 0" class="px-3 py-4 text-center text-sm text-gray-500">
          No options found
        </div>
      </div>
      
      <div class="p-2 border-t border-gray-100 bg-gray-50 rounded-b-lg flex justify-between items-center text-xs text-gray-500">
        <span>{{ modelValue.length }} selected</span>
      </div>
    </div>
  </div>
</template>
