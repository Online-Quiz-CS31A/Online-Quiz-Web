<script setup lang="ts">
import type { MatchingPair } from '@/interfaces/interfaces'

interface Props {
  pairs: MatchingPair[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:pairs': [pairs: MatchingPair[]]
}>()

function addPair() {
  const pairCount = props.pairs.length + 1
  const newPairs = [...props.pairs, {
    left: `Term ${pairCount}`,
    right: `Definition ${pairCount}`
  }]
  emit('update:pairs', newPairs)
}

function removePair(index: number) {
  const newPairs = props.pairs.filter((_, i) => i !== index)
  emit('update:pairs', newPairs)
}

function updatePair(index: number, field: 'left' | 'right', value: string) {
  const newPairs = [...props.pairs]
  newPairs[index] = { ...newPairs[index], [field]: value }
  emit('update:pairs', newPairs)
}
</script>

<template>
  <div class="mb-6">
    <label class="block text-sm font-medium text-gray-700 mb-2">Matching Pairs</label>
    <div class="space-y-3">
      <div v-for="(pair, index) in pairs" :key="index" class="flex items-center">
        <div class="flex-1 group">
          <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-2.5 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
            <input 
              :value="pair.left"
              @input="updatePair(index, 'left', ($event.target as HTMLInputElement).value)"
              type="text"
              class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400"
              placeholder="Term" 
            />
            <i class="fas fa-arrows-alt-h text-gray-300"></i>
            <input 
              :value="pair.right"
              @input="updatePair(index, 'right', ($event.target as HTMLInputElement).value)"
              type="text"
              class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400"
              placeholder="Definition" 
            />
          </div>
        </div>

        <div class="ml-3 flex items-center gap-2 self-stretch">
          <button 
            @click="removePair(index)" 
            title="Remove pair"
            class="inline-flex items-center justify-center w-9 h-9 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
    <button 
      @click="addPair" 
      class="mt-3 bg-blue-50 text-blue-600 text-sm py-2 px-3 rounded-md hover:bg-blue-100 transition-colors"
    >
      <i class="fas fa-plus mr-1"></i> Add Pair
    </button>
  </div>
</template>
