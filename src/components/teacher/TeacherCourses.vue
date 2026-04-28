<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useAuthStore } from '@/stores/authStore'
import * as courseService from '@/services/courseService'
import type { ClassItem } from '@/interfaces/interfaces'
import bg1 from '@/assets/image/bg1.webp'
import bg2 from '@/assets/image/bg2.webp'
import bg3 from '@/assets/image/bg3.webp'
import bg4 from '@/assets/image/bg4.webp'
import bg5 from '@/assets/image/bg5.webp'

// CONSTANTS
const coverImages = [bg1, bg2, bg3, bg4, bg5]
const router = useRouter()

// PROPS
const props = withDefaults(defineProps<{ classes?: ClassItem[]; maxItems?: number; showAppHeader?: boolean; mode?: 'default' | 'archived' }>(), {
  showAppHeader: true,
  mode: 'default',
})

// EMITS
defineEmits<{
  (e: 'leave-class', classItem: ClassItem): void
  (e: 'view-all'): void
}>()

// REACTIVE
const classesStore = useCoursesStore()
const sectionsStore = useSectionsStore()
const quizzesStore = useQuizzesStore()

// REFS
const menuOpenForId = ref<number | null>(null)

// COMPUTED
const classes = computed<ClassItem[]>(() => props.classes ?? classesStore.myClasses)
const displayedClasses = computed<ClassItem[]>(() => {
  const list = classes.value
  return typeof props.maxItems === 'number' ? list.slice(0, props.maxItems) : list
})

// METHODS
const toggleMenu = (id: number) => {
  menuOpenForId.value = menuOpenForId.value === id ? null : id
}

const onDocClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.actions-menu')) {
    menuOpenForId.value = null
  }
}

const handleEnterClass = (classItem: ClassItem) => {
  router.push({ name: 'teacher-class', params: { code: classItem.code } })
}

const handleEditClass = (classItem: ClassItem) => {
  router.push({ name: 'teacher-class', params: { code: classItem.code } })
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

const getSectionsForCourse = (classItem: ClassItem) => {
  const code = classItem.code
  if (!code) {
    return sectionsStore.getSectionsByCourse(classItem.id)
  }

  const targetCourseIds = classesStore.rawTeacherCourses
    .filter(c => c.code === code)
    .map(c => c.courseId)

  if (targetCourseIds.length === 0) {
    targetCourseIds.push(classItem.id)
  }

  const allSections = []
  const seenIds = new Set<number>()

  for (const cid of targetCourseIds) {
    const cidSections = sectionsStore.getSectionsByCourse(cid)
    for (const s of cidSections) {
      if (!seenIds.has(s.id)) {
        allSections.push(s)
        seenIds.add(s.id)
      }
    }
  }

  const assignedSectionNames = classesStore.rawTeacherCourses
    .filter(c => c.code === code && c.section)
    .map(c => c.section.trim())

  const apiSections = sectionsStore.allSections.filter(s => assignedSectionNames.includes(s.name))
  for (const s of apiSections) {
    if (!seenIds.has(s.id)) {
      allSections.push(s)
      seenIds.add(s.id)
    }
  }

  return allSections
}

const getStudentCount = (classItem: ClassItem) => {
  const sections = getSectionsForCourse(classItem)
  return sections.reduce((total, section) => total + (section.students || 0), 0)
}

const hasFetchedCounts = ref(false)

const fetchStudentCounts = async () => {
  // Guard must be set synchronously at the top — setting it at the end
  // is too late because concurrent async calls can bypass the check
  if (hasFetchedCounts.value) return
  hasFetchedCounts.value = true

  await new Promise(resolve => setTimeout(resolve, 100))

  const authStore = useAuthStore()
  const teacherId = authStore.currentUser?.id
  if (!teacherId) {
    console.error('No teacher ID found')
    return
  }

  const coursesToProcess = classes.value.filter(c => c.id)
  if (!coursesToProcess.length) {
    return
  }

  // Group classes by course code to avoid duplicate fetches
  const processedCodes = new Set<string>()

  for (const classItem of coursesToProcess) {
    try {
      const code = classItem.code

      if (code && processedCodes.has(code)) {
        continue
      }

      const courseIdsToFetch = code
        ? classesStore.rawTeacherCourses
            .filter(c => c.code === code)
            .map(c => c.courseId)
        : [classItem.id]

      if (code) {
        processedCodes.add(code)
      }

      // Fetch enrollments for all related courses
      const allEnrollments = await Promise.all(
        courseIdsToFetch.map(courseId =>
          courseService.getCourseEnrollments(courseId, teacherId).catch(err => {
            console.error(`Failed to fetch enrollments for course ${courseId}`, err)
            return []
          })
        )
      )

      // Flatten all enrollments and group by section
      const sectionCounts: Record<string, number> = {}
      allEnrollments.flat().forEach((enrollment: { section?: string; sectionName?: string }) => {
        const sectionName = enrollment.section || enrollment.sectionName || ''
        if (sectionName) {
          sectionCounts[sectionName] = (sectionCounts[sectionName] || 0) + 1
        }
      })

      // Update each section with its student count
      const sections = getSectionsForCourse(classItem)

      for (const section of sections) {
        if (section.name) {
          const count = sectionCounts[section.name] || 0
          sectionsStore.updateSection(section.id, {
            students: count
          })
        }
      }
    } catch (e) {
      console.error(`Failed to fetch enrollments for course ${classItem.id}`, e)
    }
  }
}

watch(classes, (newClasses) => {
  if (newClasses.length > 0 && !hasFetchedCounts.value) {
    fetchStudentCounts()
  }
}, { immediate: true })

// LIFECYCLE
onMounted(async () => {
  document.addEventListener('click', onDocClick)

  if (classesStore.rawTeacherCourses.length === 0) {
    await classesStore.fetchTeacherCourses()
  }

  if (classes.value.length > 0 && !hasFetchedCounts.value) {
    fetchStudentCounts()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <div class="mb-8">
    <div v-if="props.showAppHeader" class="flex justify-between items-center mb-4 student-classes-AppHeader">
      <h2 class="text-xl font-bold text-gray-800">My Courses</h2>
      <a href="#" @click.prevent="$emit('view-all')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</a>
    </div>

    <!-- Loading State -->
    <div v-if="classesStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <i class="fas fa-book-open text-4xl text-blue-400"></i>
        </div>
        <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <i class="fas fa-plus text-white text-sm"></i>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No Courses Yet</h3>
      <p class="text-gray-500 max-w-md mb-6">
        You haven't created any courses yet. Create your first course to start teaching.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="classItem in displayedClasses"
        :key="classItem.id"
        class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer"
        @click="handleEnterClass(classItem)"
      >
        <!-- Header with background image -->
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

          <!-- Actions menu -->
          <div class="absolute right-2 top-2 actions-menu">
            <button
              @click.stop="toggleMenu(classItem.id)"
              class="text-white hover:text-white p-2 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors cursor-pointer"
              aria-label="More options"
              title="More options"
            >
              <i class="fas fa-ellipsis-vertical"></i>
            </button>
            <div
              v-if="menuOpenForId === classItem.id"
              class="absolute right-0 top-10 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20"
            >
              <template v-if="props.mode === 'archived'">
                <button
                  @click.stop="handleEnterClass(classItem)"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  View
                </button>
                <div class="px-3 py-2 text-xs text-gray-400 italic">
                  Contact admin to restore
                </div>
              </template>
              <template v-else>
                <button
                  @click.stop="handleEditClass(classItem)"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  Edit
                </button>
              </template>
            </div>
          </div>

          <!-- Course title and teacher info -->
          <div class="absolute bottom-3 left-3 right-3">
            <h3 class="text-lg font-bold text-white line-clamp-2 drop-shadow-lg leading-tight mb-2">
              {{ classItem.name }}
            </h3>
            <div class="flex items-center space-x-2">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold uppercase text-white ring-2 ring-white/20 shadow-sm"
                :style="getAvatarStyle(classItem.teacher)"
              >
                {{ getInitials(classItem.teacher) }}
              </div>
              <div class="min-w-0 leading-tight">
                <div class="text-xs text-white/90 truncate max-w-[180px]">{{ classItem.teacher }}</div>
                <div class="text-[11px] text-white/80">{{ getStudentCount(classItem) }} students</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card body -->
        <div class="p-4">
          <button 
            @click.stop="handleEnterClass(classItem)"
            class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center group-hover:shadow-md"
          >
            Enter class
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

