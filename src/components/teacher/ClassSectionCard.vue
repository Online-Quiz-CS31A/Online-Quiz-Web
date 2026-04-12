<script setup lang="ts">
interface SectionCardData {
  id: number
  name: string
  scheduleDay: string
  scheduleTime: string
  classroom: string
  students: number
}

const props = defineProps<{
  section: SectionCardData
  showMenu?: boolean
  isMenuOpen?: boolean
  menuMode?: 'default' | 'archive'
}>()

const emit = defineEmits<{
  (e: 'card-click'): void
  (e: 'toggle-menu'): void
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'unarchive'): void
}>()
</script>

<template>
  <div
    class="rounded-xl shadow-md overflow-hidden class-card transition-all duration-300 text-white"
    @click="emit('card-click')"
  >
    <div class="p-6 relative cursor-pointer">
      <div class="relative z-10">
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-bold text-white">{{ props.section.name }}</h3>
          <div v-if="props.showMenu" class="relative">
            <button
              @click.stop="emit('toggle-menu')"
              class="text-white hover:text-gray-200 text-lg"
              aria-label="More options"
            >
              <i class="fas fa-ellipsis-vertical cursor-pointer"></i>
            </button>
            <div
              v-if="props.isMenuOpen"
              @click.stop
              class="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10"
            >
              <template v-if="props.menuMode === 'archive'">
                <button
                  @click="emit('card-click')"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span>View</span>
                </button>
                <button
                  @click="emit('unarchive')"
                  class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                >
                  <span>Unarchive</span>
                </button>
              </template>
              <template v-else>
                <button
                  @click="emit('edit')"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span>Edit</span>
                </button>
                <button
                  @click="emit('delete')"
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <span>Archive</span>
                </button>
              </template>
            </div>
          </div>
        </div>
        <div class="mt-3 space-y-1">
          <!-- <div class="flex items-center text-white/90 text-sm">
            <i class="fas fa-calendar-day w-5 mr-2"></i>
            <span>{{ props.section.scheduleDay }} {{ props.section.scheduleTime }}</span>
          </div>
          <div class="flex items-center text-white/90 text-sm">
            <i class="fas fa-door-open w-5 mr-2"></i>
            <span>{{ props.section.classroom }}</span>
          </div> -->
        </div>
        <span class="inline-block mt-3 bg-white/20 text-white text-xs px-2 py-1 rounded-full">
          {{ props.section.students }} students
        </span>
      </div>
    </div>
    <div class="px-6 py-3 border-t border-gray-100 bg-white">
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-600">
          <i class="fas fa-tasks mr-1"></i> Course Details
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.class-card > .p-6.relative {
  background-image: url('https://img.pikbest.com/background/20180829/blue-cartoon-school-season-classroom-background-design_2745940.jpg!bw700');
  background-size: cover;
  background-position: center;
  position: relative;
}

.class-card > .p-6.relative::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(30, 58, 138, 0.7), rgba(30, 58, 138, 0.7));
  pointer-events: none;
}
</style>
