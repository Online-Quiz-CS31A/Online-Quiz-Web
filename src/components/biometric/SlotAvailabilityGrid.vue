<script setup lang="ts">
import { computed } from 'vue'
import type { AvailableSlotsResponse } from '@/interfaces/interfaces'

const props = defineProps<{
  slots: AvailableSlotsResponse | null
}>()

const usedPercentage = computed(() => {
  if (!props.slots) return 0
  return Math.round((props.slots.usedSlots / props.slots.totalSlots) * 100)
})

const usedColor = computed(() => {
  const pct = usedPercentage.value
  if (pct < 50) return 'text-green-600'
  if (pct < 80) return 'text-yellow-600'
  return 'text-red-600'
})

const barColor = computed(() => {
  const pct = usedPercentage.value
  if (pct < 50) return 'bg-green-500'
  if (pct < 80) return 'bg-yellow-500'
  return 'bg-red-500'
})

function getSlotNumber(index: number): number {
  return index + 1
}

function isSlotAvailable(index: number): boolean {
  if (!props.slots) return false
  const slotNum = getSlotNumber(index)
  return props.slots.availableSlots.includes(slotNum)
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
    <div class="px-4 sm:px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <h3 class="text-base font-semibold text-gray-800">Slot Availability</h3>
    </div>
    <div class="p-4 sm:p-5">
      <!-- Summary -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-3xl font-bold" :class="usedColor">
            {{ slots?.usedSlots ?? 0 }}
          </p>
          <p class="text-xs text-gray-500 font-medium mt-1">of {{ slots?.totalSlots ?? 127 }} slots used</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-green-600">
            {{ slots?.availableSlots.length ?? 0 }}
          </p>
          <p class="text-xs text-gray-500 font-medium mt-1">Available</p>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-3 mb-5 overflow-hidden shadow-inner">
        <div
          :class="[barColor, 'h-3 rounded-full transition-all duration-500 ease-out']"
          :style="{ width: `${usedPercentage}%` }"
        />
      </div>

      <!-- Percentage badge -->
      <div class="flex items-center justify-center mb-4">
        <span :class="[
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold',
          usedPercentage < 50 ? 'bg-green-100 text-green-700' :
          usedPercentage < 80 ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        ]">
          {{ usedPercentage }}% Capacity
        </span>
      </div>

      <!-- Slot grid (compact) -->
      <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <div class="grid grid-cols-13 gap-1 max-h-48 overflow-y-auto">
          <div
            v-for="i in (slots?.totalSlots ?? 127)"
            :key="i"
            :class="[
              'w-4 h-4 rounded transition-all duration-200',
              isSlotAvailable(i - 1)
                ? 'bg-green-400 hover:bg-green-500 hover:scale-110 cursor-pointer'
                : 'bg-gray-400 hover:bg-gray-500'
            ]"
            :title="`Slot ${i}: ${isSlotAvailable(i - 1) ? 'Available' : 'Used'}`"
          />
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center justify-center gap-6 mt-4 text-xs font-medium text-gray-600">
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded bg-green-400 inline-block shadow-sm" />
          Available
        </div>
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded bg-gray-400 inline-block shadow-sm" />
          Used
        </div>
      </div>
    </div>
  </div>
</template>