<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useClassesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import type { ClassItem } from '@/stores/types'
import bg1 from '@/assets/image/bg1.jpg'
import bg2 from '@/assets/image/bg2.jpg'
import bg3 from '@/assets/image/bg3.jpg'
import bg4 from '@/assets/image/bg4.jpg'
import bg5 from '@/assets/image/bg5.jpg'

const props = defineProps<{ classes?: ClassItem[]; showViewAll?: boolean; showHeader?: boolean; maxItems?: number }>()
const showViewAll = computed(() => props.showViewAll !== false)
const showHeader = computed(() => props.showHeader !== false)

const classesStore = useClassesStore()
const sectionsStore = useSectionsStore()
const classes = computed<ClassItem[]>(() => props.classes ?? classesStore.myClasses)
const displayedClasses = computed<ClassItem[]>(() => {
  const list = classes.value
  return typeof props.maxItems === 'number' ? list.slice(0, props.maxItems) : list
})

const menuOpenForId = ref<number | null>(null)

const emit = defineEmits<{
  (e: 'leave-class', classItem: ClassItem): void
  (e: 'view-all'): void
}>()

const toggleMenu = (id: number) => {
  menuOpenForId.value = menuOpenForId.value === id ? null : id
}

const onDocClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.actions-menu')) {
    menuOpenForId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})

const coverImages = [bg1, bg2, bg3, bg4, bg5]

const router = useRouter()

const handleEnterClass = (classItem: ClassItem) => {
  router.push({ name: 'teacher-class', params: { id: classItem.id.toString() } })
}

const handleLeaveClass = (classItem: ClassItem) => {
  const ok = confirm(`Leave class ${classItem.name}?`)
  if (ok) {
    emit('leave-class', classItem)
  }
  menuOpenForId.value = null
}

const getCoverStyle = (classItem: ClassItem) => {
  const index = getDeterministicIndex(`${classItem.id}-${classItem.name}`)
  const url = coverImages[index % coverImages.length]
  return {
    backgroundImage: `url(${url})`
  }
}

const getAvatarStyle = (seed: string) => {
  const hue = getDeterministicIndex(seed) % 360
  const background = `hsl(${hue}, 70%, 45%)`
  return { background }
}

const getDeterministicIndex = (key: string) => {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getInitials = (name: string) => {
  if (!name) return 'NA'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ''
  const last = parts[parts.length - 1]?.[0] || ''
  return (first + last).toUpperCase()
}

const getStudentCount = (courseId: number) => {
  const sections = sectionsStore.getSectionsByCourse(courseId)
  return sections.reduce((total, section) => total + section.studentUsernames.length, 0)
}
</script>

<template>
  <div class="mb-8">
    <div class="flex justify-between items-center mb-4 student-classes-header">
      <h2 class="text-xl font-bold text-gray-800">My Courses</h2>
      <a href="#" @click.prevent="$emit('view-all')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</a>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="classItem in displayedClasses" 
        :key="classItem.id"
        class="class-card rounded-xl shadow-md overflow-hidden bg-white cursor-pointer"
        @click="handleEnterClass(classItem)"
      >
        <div 
          class="relative h-36 bg-center bg-cover"
          :style="getCoverStyle(classItem)"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-black/30 via-black/15 to-black/10"></div>

          <div class="absolute inset-0 p-4 text-white select-none">
            <p class="text-xs opacity-90">{{ classItem.code }}</p>
            <h3 class="mt-1 text-xl font-bold leading-snug line-clamp-2">{{ classItem.name }}</h3>
          </div>
          <div class="absolute right-2 top-2 actions-menu">
            <button 
              @click.stop="toggleMenu(classItem.id)"
              class="text-white hover:text-white p-1 cursor-pointer"
              aria-label="More options"
              title="More options"
            >
              <i class="fas fa-ellipsis-vertical"></i>
            </button>
            <div 
              v-if="menuOpenForId === classItem.id" 
              class="absolute right-0 top-7 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20"
            >
              <button 
                @click.stop="handleLeaveClass(classItem)"
                class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                Edit 
              </button>
              
              <button 
                @click.stop="handleLeaveClass(classItem)"
                class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer"
              >
                Leave
              </button>
            </div>
          </div>

          <div class="absolute left-4 bottom-3 text-white min-w-0">
            <div class="flex items-center space-x-2">
              <div 
                class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold uppercase text-white ring-2 ring-white/20 shadow-sm"
                :style="getAvatarStyle(classItem.teacher)"
              >
                {{ getInitials(classItem.teacher) }}
              </div>
              <div class="min-w-0 leading-tight">
                <div class="text-xs truncate max-w-[180px]">{{ classItem.teacher }}</div>
                <div class="text-[11px] opacity-90">{{ getStudentCount(classItem.id) }} students</div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white px-4 py-3 flex items-center justify-end">
          <button class="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap cursor-pointer">
            Enter class
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.class-card {
  transition: all 0.3s ease;
}

.class-card:hover {
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

</style>

