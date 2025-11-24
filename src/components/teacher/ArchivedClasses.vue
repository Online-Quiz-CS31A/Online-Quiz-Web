<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import ClassSectionCard from '@/components/teacher/ClassSectionCard.vue'

const coursesStore = useCoursesStore()
const sectionsStore = useSectionsStore()
const router = useRouter()

const openMenuId = ref<number | null>(null)

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
      const course = allCourses.find(c => c.id === m.courseId)
      if (!section || !course) return null

      const schedule = sectionsStore.getSchedule(m.courseId, section.id)

      return {
        id: section.id,
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

function toggleMenu(id: number) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function openDashboard(id: number) {
  router.push({ name: 'teacher-class-dashboard', params: { id: String(id) } })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold text-gray-800">Archived Classes / Sections</h2>
    </div>

    <div v-if="archivedSections.length === 0" class="p-8 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
      <p>No archived sections yet. Deleted classes/sections will appear here.</p>
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
          @card-click="openDashboard(item.id)"
          @toggle-menu="toggleMenu(item.id)"
          @edit="openMenuId = null"
          @delete="openMenuId = null"
        />
      </div>
    </div>
  </div>
</template>
