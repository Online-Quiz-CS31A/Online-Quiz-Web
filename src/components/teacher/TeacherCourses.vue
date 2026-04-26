<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useAuthStore } from '@/stores/authStore'
import * as courseService from '@/services/courseService'
import type { ClassItem } from '@/interfaces/interfaces'
import CourseArchiveModal from '@/components/modals/CourseArchiveModal.vue'
import ConfirmUnarchiveModal from '@/components/modals/ConfirmUnarchiveModal.vue'
import TeacherCourseSkeleton from '@/components/skeletons/TeacherCourseSkeleton.vue'
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
const coursePendingDeletion = ref<ClassItem | null>(null)
const showCourseDeleteModal = ref(false)
const coursePendingUnarchive = ref<ClassItem | null>(null)
const showCourseUnarchiveModal = ref(false)

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

const handleLeaveClass = (classItem: ClassItem) => {
  coursePendingDeletion.value = classItem
  showCourseDeleteModal.value = true
  menuOpenForId.value = null
}

const handleEditClass = (classItem: ClassItem) => {
  router.push({ name: 'teacher-class', params: { code: classItem.code } })
  menuOpenForId.value = null
}

const handleCancelDelete = () => {
  showCourseDeleteModal.value = false
  coursePendingDeletion.value = null
}

const handleConfirmDelete = () => {
  if (!coursePendingDeletion.value) {
    handleCancelDelete()
    return
  }
  classesStore.archiveCourse(coursePendingDeletion.value.id)
  quizzesStore.archiveQuizzesForCourse(coursePendingDeletion.value.name)
  handleCancelDelete()
}

const handleUnarchiveClass = (classItem: ClassItem) => {
  coursePendingUnarchive.value = classItem
  showCourseUnarchiveModal.value = true
  menuOpenForId.value = null
}

const handleCancelUnarchiveCourse = () => {
  showCourseUnarchiveModal.value = false
  coursePendingUnarchive.value = null
}

const handleConfirmUnarchiveCourse = () => {
  if (!coursePendingUnarchive.value) {
    handleCancelUnarchiveCourse()
    return
  }
  classesStore.unarchiveCourse(coursePendingUnarchive.value.id)
  quizzesStore.unarchiveQuizzesForCourse(coursePendingUnarchive.value.name)
  handleCancelUnarchiveCourse()
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
      <TeacherCourseSkeleton v-for="i in (props.maxItems || 3)" :key="i" />
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
              <template v-if="props.mode === 'archived'">
                <button
                  @click.stop="handleEnterClass(classItem)"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  View
                </button>
                <button
                  @click.stop="handleUnarchiveClass(classItem)"
                  class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                >
                  Unarchive
                </button>
              </template>
              <template v-else>
                <button
                  @click.stop="handleEditClass(classItem)"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  Edit
                </button>

                <button
                  @click.stop="handleLeaveClass(classItem)"
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer"
                >
                  Archive
                </button>
              </template>
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
                <div class="text-[11px] opacity-90">{{ getStudentCount(classItem) }} students</div>
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

  <CourseArchiveModal
    :open="showCourseDeleteModal"
    :courseName="coursePendingDeletion?.name"
    @cancel="handleCancelDelete"
    @confirm="handleConfirmDelete"
  />

	<ConfirmUnarchiveModal
	  :open="showCourseUnarchiveModal"
	  :item-name="coursePendingUnarchive?.name"
	  title="Unarchive course?"
	  @cancel="handleCancelUnarchiveCourse"
	  @confirm="handleConfirmUnarchiveCourse"
	/>
</template>

<style scoped>
.class-card {
  transition: all 0.3s ease;
}

.class-card:hover {
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

</style>

