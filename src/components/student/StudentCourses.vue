<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import type { ClassItem } from '@/interfaces/interfaces'
import bg1 from '@/assets/image/bg1.webp'
import bg2 from '@/assets/image/bg2.webp'
import bg3 from '@/assets/image/bg3.webp'
import bg4 from '@/assets/image/bg4.webp'
import bg5 from '@/assets/image/bg5.webp'

// CONSTANTS
const coverImages = [bg1, bg2, bg3, bg4, bg5]

// PROPS
const props = defineProps<{ classes?: ClassItem[]; showViewAll?: boolean; showAppHeader?: boolean; maxItems?: number }>()

// EMITS
defineEmits<{
  (e: 'leave-class', classItem: ClassItem): void
  (e: 'view-all'): void
}>()

// REACTIVE
const classesStore = useCoursesStore()
const sectionsStore = useSectionsStore()

// REFS
const router = useRouter()
const isLoading = ref(false)

// COMPUTED
const classes = computed<ClassItem[]>(() => props.classes ?? classesStore.myClasses)
const displayedClasses = computed<ClassItem[]>(() => {
  const nonArchived = classes.value.filter(c => c.status !== 'Archived')
  return typeof props.maxItems === 'number' ? nonArchived.slice(0, props.maxItems) : nonArchived
})

// METHODS
const handleEnterClass = (classItem: ClassItem) => {
  router.push({ name: 'student-course-dashboard', params: { id: classItem.id } })
}

const getCoverStyle = (classItem: ClassItem) => {
  // Try to match course name to appropriate background
  const courseName = classItem.name.toLowerCase()

  let imageIndex = 0

  // Computer Science / Programming courses
  if (courseName.includes('programming') ||
      courseName.includes('automata') ||
      courseName.includes('algorithm') ||
      courseName.includes('data structure') ||
      courseName.includes('software') ||
      courseName.includes('computer') ||
      courseName.includes('cs')) {
    imageIndex = 0 // bg1 - tech/blue theme
  }
  // Math / Science courses
  else if (courseName.includes('math') ||
           courseName.includes('calculus') ||
           courseName.includes('physics') ||
           courseName.includes('chemistry') ||
           courseName.includes('science')) {
    imageIndex = 1 // bg2
  }
  // Business / Management courses
  else if (courseName.includes('business') ||
           courseName.includes('management') ||
           courseName.includes('accounting') ||
           courseName.includes('finance') ||
           courseName.includes('economics')) {
    imageIndex = 2 // bg3
  }
  // Arts / Humanities courses
  else if (courseName.includes('art') ||
           courseName.includes('design') ||
           courseName.includes('literature') ||
           courseName.includes('history') ||
           courseName.includes('english')) {
    imageIndex = 3 // bg4
  }
  // Default: use deterministic hash for other courses
  else {
    const hash = getDeterministicIndex(`${classItem.id}-${classItem.name}`)
    imageIndex = hash % coverImages.length
  }

  const url = coverImages[imageIndex]
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
  const classItem = classes.value.find(c => c.id === courseId)
  if (classItem && classItem.students > 0) {
    return classItem.students
  }

  const sections = sectionsStore.getSectionsByCourse(courseId)
  return sections.reduce((total, section) => total + section.studentUsernames.length, 0)
}

// LIFECYCLE
onMounted(async () => {
  // Only show loading and fetch if we don't have data yet
  if (classesStore.myClasses.length === 0) {
    isLoading.value = true
    await classesStore.fetchStudentCourses()
    isLoading.value = false
  }
})
</script>

<template>
  <div class="mb-8">
    <div class="flex justify-between items-center mb-4 student-classes-AppHeader">
      <h2 class="text-xl font-bold text-gray-800">My Courses</h2>
      <a href="#" @click.prevent="$emit('view-all')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</a>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in (props.maxItems || 3)" :key="i" class="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
        <div class="h-40 bg-gray-200"></div>
        <div class="p-4 space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div class="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="displayedClasses.length === 0" class="p-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200">
      <div class="relative mb-6">
        <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
          <i class="fas fa-graduation-cap text-4xl text-blue-400"></i>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No Courses Enrolled</h3>
      <p class="text-gray-500 max-w-md">
        You haven't enrolled in any courses yet. Join a course to start your learning journey.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="classItem in displayedClasses"
        :key="classItem.id"
        class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer"
        @click="handleEnterClass(classItem)"
      >
        <!-- AppHeader with background image -->
        <div class="relative h-40 overflow-hidden">
          <div
            class="absolute inset-0 bg-center bg-cover transform group-hover:scale-105 transition-transform duration-300"
            :style="getCoverStyle(classItem)"
          ></div>
          <div class="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-transparent"></div>

          <!-- Course code badge -->
          <div class="absolute top-3 left-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
              {{ classItem.code }}
            </span>
          </div>

          <!-- Course title -->
          <div class="absolute bottom-3 left-3 right-3">
            <h3 class="text-lg font-bold text-white line-clamp-2 drop-shadow-lg leading-tight">
              {{ classItem.name }}
            </h3>
          </div>
        </div>

        <!-- Card body -->
        <div class="p-4 space-y-4">
          <!-- Teacher info -->
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase text-white shadow-sm flex-shrink-0"
              :style="getAvatarStyle(classItem.teacher)"
            >
              {{ getInitials(classItem.teacher) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 truncate">{{ classItem.teacher }}</p>
              <p class="text-xs text-gray-500 flex items-center">
                <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {{ getStudentCount(classItem.id) }} students
              </p>
            </div>
          </div>

          <!-- Action button -->
          <button
            @click.stop="handleEnterClass(classItem)"
            class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center group-hover:shadow-md"
          >
            Enter Class
            <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

