<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import ClassSectionCard from '@/components/teacher/ClassSectionCard.vue'
import ConfirmUnarchiveModal from '@/components/modals/ConfirmUnarchiveModal.vue'

const coursesStore = useCoursesStore()
const sectionsStore = useSectionsStore()
const router = useRouter()

const openMenuId = ref<number | null>(null)
const sectionPendingUnarchive = ref<{ id: number; courseId: number; name: string } | null>(null)
const showSectionUnarchiveModal = ref(false)

function formatTime(time24: string): string {
  if (!time24 || time24 === '—') return '—'
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

const archivedSections = computed(() => {
  const mappings = sectionsStore.archivedSectionMappings
  const allSections = sectionsStore.allSections
  const allCourses = coursesStore.allCourses

  return mappings
    .map(m => {
      const section = allSections.find(s => s.id === m.sectionId)
      const primaryCourseId = m.courseIds[0]
      const course = allCourses.find(c => c.id === primaryCourseId)
      if (!section || !course) return null

      const schedule = sectionsStore.getSchedule(primaryCourseId, section.id)

      return {
        id: section.id,
        courseId: primaryCourseId,
        sectionName: section.name,
        courseName: course.name,
        courseCode: (course as any).code || '',
        scheduleDay: schedule?.scheduleDay || 'TBA',
        scheduleTime: schedule?.scheduleTime ? formatTime(schedule.scheduleTime) : '—',
        classroom: schedule?.classroom || 'TBA',
        students: section.students,
      }
    })
    .filter(
      (
        x,
      ): x is {
        id: number
        courseId: number
        sectionName: string
        courseName: string
        courseCode: string
        scheduleDay: string
        scheduleTime: string
        classroom: string
        students: number
      } => x !== null,
    )
})

onMounted(() => {
  sectionsStore.loadArchivedSectionsFromStorage()
})

function toggleMenu(id: number) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function openDashboard(id: number) {
  router.push({ name: 'teacher-class-dashboard', params: { id: String(id) } })
}

function handleUnarchive(item: { id: number }) {
  const allSections = sectionsStore.allSections
  const section = allSections.find(s => s.id === item.id)
  sectionPendingUnarchive.value = {
    id: item.id,
    courseId: 0,
    name: section?.name || 'Section',
  }
  showSectionUnarchiveModal.value = true
  openMenuId.value = null
}

function handleCancelUnarchiveSection() {
  showSectionUnarchiveModal.value = false
  sectionPendingUnarchive.value = null
}

function handleConfirmUnarchiveSection() {
  if (!sectionPendingUnarchive.value) {
    handleCancelUnarchiveSection()
    return
  }
  sectionsStore.unarchiveSection(sectionPendingUnarchive.value.id)
  handleCancelUnarchiveSection()
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold text-gray-800">Archived Classes / Sections</h2>
    </div>

    <div
      v-if="archivedSections.length === 0"
      class="p-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200"
    >
      <div class="relative mb-6">
        <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
          <i class="fas fa-box-archive text-4xl text-blue-400"></i>
        </div>
        <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <i class="fas fa-users text-white text-sm"></i>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No Archived Classes</h3>
      <p class="text-gray-500 max-w-md mb-6">
        There are no archived classes yet. When you archive a class or section, it will appear here.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="item in archivedSections" :key="item.id">
        <ClassSectionCard
          :section="{
            id: item.id,
            name: item.sectionName,
            scheduleDay: item.scheduleDay,
            scheduleTime: item.scheduleTime,
            classroom: item.classroom,
            students: item.students,
          }"
          :show-menu="true"
          :is-menu-open="openMenuId === item.id"
          menu-mode="archive"
          @card-click="openDashboard(item.id)"
          @toggle-menu="toggleMenu(item.id)"
          @unarchive="handleUnarchive(item)"
        />
      </div>
    </div>

	<ConfirmUnarchiveModal
	  :open="showSectionUnarchiveModal"
	  :item-name="sectionPendingUnarchive?.name"
	  title="Unarchive section?"
	  @cancel="handleCancelUnarchiveSection"
	  @confirm="handleConfirmUnarchiveSection"
	/>
  </div>
</template>
