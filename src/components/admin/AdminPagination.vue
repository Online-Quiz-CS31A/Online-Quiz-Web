<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  currentPage: number
  totalItems: number
  pageSize: number
}

interface Emits {
  (e: 'update:currentPage', value: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)))
const displayStart = computed(() => (props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1))
const displayEnd = computed(() => Math.min(props.currentPage * props.pageSize, props.totalItems))

const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const tp = totalPages.value
  if (tp <= 6) {
    for (let i = 1; i <= tp; i++) pages.push(i)
    return pages
  }
  pages.push(1, 2, 3)
  pages.push('...')
  pages.push(tp - 2, tp - 1, tp)
  return pages
})

const goToPage = (n: number) => {
  if (n < 1 || n > totalPages.value) return
  emit('update:currentPage', n)
}

const prevPage = () => goToPage(props.currentPage - 1)
const nextPage = () => goToPage(props.currentPage + 1)
</script>

<template>
  <div class="flex items-center justify-between px-4 py-3 mt-6 bg-white border border-gray-200 rounded-lg sm:px-6">
    <div class="flex justify-between flex-1 sm:hidden">
      <a 
        href="#" 
        @click.prevent="prevPage" 
        class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Previous
      </a>
      <a 
        href="#" 
        @click.prevent="nextPage" 
        class="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Next
      </a>
    </div>
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Showing
          <span class="font-medium">{{ displayStart }}</span>
          to
          <span class="font-medium">{{ displayEnd }}</span>
          of
          <span class="font-medium">{{ totalItems }}</span>
          results
        </p>
      </div>
      <div>
        <nav class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <a 
            href="#" 
            @click.prevent="prevPage" 
            class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
          >
            <span class="sr-only">Previous</span>
            <ChevronLeft class="w-5 h-5" />
          </a>
          <template v-for="p in pageNumbers" :key="p + '-' + currentPage">
            <a 
              v-if="typeof p === 'number'" 
              href="#" 
              @click.prevent="goToPage(p)"
              :class="[
                'relative inline-flex items-center px-4 py-2 text-sm font-medium border',
                p === currentPage ? 'text-blue-600 border-blue-500 bg-blue-50 z-10' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ p }}
            </a>
            <span 
              v-else 
              class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
            >
              ...
            </span>
          </template>
          <a 
            href="#" 
            @click.prevent="nextPage" 
            class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
          >
            <span class="sr-only">Next</span>
            <ChevronRight class="w-5 h-5" />
          </a>
        </nav>
      </div>
    </div>
  </div>
</template>
