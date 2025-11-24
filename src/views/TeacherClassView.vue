<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import bg1 from '@/assets/image/bg1.jpg'
import bg2 from '@/assets/image/bg2.jpg'
import bg3 from '@/assets/image/bg3.jpg'
import bg4 from '@/assets/image/bg4.jpg'
import bg5 from '@/assets/image/bg5.jpg'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import type { ClassItem, ClassSection } from '@/interfaces/interfaces'
import ClassSectionCard from '@/components/teacher/ClassSectionCard.vue'
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))
const SectionDeleteModal = defineAsyncComponent(() => import('@/components/modals/SectionDeleteModal.vue'))

// CONSTANTS
const coverImages = [bg1, bg2, bg3, bg4, bg5]
const router = useRouter()

// PROPS
interface Props { id: string }
const props = defineProps<Props>()

// REACTIVE
const classesStore = useCoursesStore()
const sectionsStore = useSectionsStore()
const newClass = reactive({ name: '', description: '', students: 1 })

// REFS
const showCreateClass = ref(false)
const showDeleteSectionModal = ref(false)
const showDetails = ref(false)
const selectedClassId = ref<string | null>(null)
const openMenuId = ref<number | null>(null)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const sectionToDeleteId = ref<number | null>(null)
const sectionToDeleteName = ref('')

// COMPUTED
const sections = computed(() => {
  const cid = Number(props.id)
  return sectionsStore.getSectionsByCourse(cid)
})

const sectionsWithSchedule = computed(() => {
  const cid = Number(props.id)
  return sections.value.map(section => {
    const schedule = sectionsStore.getSchedule(cid, section.id)
    return {
      ...section,
      scheduleDay: schedule?.scheduleDay || 'TBA',
      scheduleTime: schedule?.scheduleTime ? formatTime(schedule.scheduleTime) : '—',
      classroom: schedule?.classroom || 'TBA'
    }
  })
})

const current = computed<ClassItem>(() => {
  const cid = Number(props.id)
  const found = classesStore.allCourses.find((c: ClassItem) => c.id === cid)
  return (
    found || { id: cid, code: '', name: `Class ${props.id}`, teacher: '', description: '—', students: 0, color: 'gray' }
  )
})

const professorName = computed(() => current.value.teacher || '—') 
const totalClasses = computed(() => sections.value.length)
const totalStudents = computed(() => sections.value.reduce((sum, s) => sum + s.students, 0))

const coverUrl = computed(() => {
  const key = `${current.value.id}-${current.value.name}`
  const idx = getDeterministicIndex(key)
  return coverImages[idx % coverImages.length]
})

const breadcrumbText = computed(() => `Dashboard > Courses > ${current.value.name}`)

// METHODS
function formatTime(time24: string): string {
  if (!time24 || time24 === '—') return '—'
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

function getDeterministicIndex(key: string) {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function toggleMenu(id: number) { openMenuId.value = openMenuId.value === id ? null : id }

function openCreateClass() {
  router.push({ name: 'class-management', params: { id: props.id } })
}

function openEditClass(id: number) {
  router.push({ name: 'class-management', params: { id: props.id }, query: { sectionId: String(id) } })
}

function deleteClass(id: number) {
  sectionsStore.archiveSection(id, Number(props.id))
  if (selectedClassId.value === String(id)) {
    closeDetails()
  }
}

function openDeleteSectionModal(id: number, name: string) {
  sectionToDeleteId.value = id
  sectionToDeleteName.value = name
  showDeleteSectionModal.value = true
}

function handleConfirmDeleteSection() {
  if (sectionToDeleteId.value != null) {
    deleteClass(sectionToDeleteId.value)
  }
  showDeleteSectionModal.value = false
  sectionToDeleteId.value = null
  sectionToDeleteName.value = ''
}

function handleCancelDeleteSection() {
  showDeleteSectionModal.value = false
  sectionToDeleteId.value = null
  sectionToDeleteName.value = ''
}

function closeDetails() {
  showDetails.value = false
  selectedClassId.value = null
}


function openDashboard(id: number) {
  router.push({ name: 'teacher-class-dashboard', params: { id: String(id) } })
}
</script>


<template>
  <div class="bg-gray-50 min-h-screen">
    <Header :breadcrumb="breadcrumbText" />
    
    <!-- Hero section -->
    <div class="relative">
      <div class="absolute inset-0 overflow-hidden">
        <div class="w-full h-full bg-cover bg-center" :style="{ backgroundImage: `url(${coverUrl})` }" aria-hidden="true"></div>
        <div class="absolute inset-0 hero-gradient"></div>
      </div>
      <div class="relative container mx-auto px-4 py-12 md:py-20">
        <div class="max-w-3xl">
          <p class="text-white/80 text-sm font-medium mb-2">{{ current.code }}</p>
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">{{ current.name }}</h1>
          <p class="text-lg text-white text-opacity-90 mb-6">{{ current.description }}</p>
          <div class="flex flex-wrap gap-3">
            <div class="bg-white/10 rounded-lg px-4 py-2 flex items-center border border-white/20">
              <i class="fas fa-book text-white mr-2"></i>
              <span class="text-white font-medium">{{ totalClasses }} Classes</span>
            </div>
            <div class="bg-white/10 rounded-lg px-4 py-2 flex items-center border border-white/20">
              <i class="fas fa-users text-white mr-2"></i>
              <span class="text-white font-medium">{{ totalStudents }} Students</span>
            </div>
            <div class="bg-white/10 rounded-lg px-4 py-2 flex items-center border border-white/20">
              <i class="fas fa-user text-white mr-2"></i>
              <span class="text-white font-medium">{{ professorName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content section -->
    <main class="container mx-auto px-4 py-8">
      <div>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Your Classes</h2>
          <button @click="openCreateClass"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center cursor-pointer">
            <i class="fas fa-plus mr-2"></i> New Class
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="sectionsWithSchedule.length === 0" class="p-12 flex flex-col items-center justify-center text-center">
          <div class="relative mb-6">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
              <i class="fas fa-chalkboard-teacher text-4xl text-blue-400"></i>
            </div>
            <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <i class="fas fa-plus text-white text-sm"></i>
            </div>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">No Classes Yet</h3>
          <p class="text-gray-500 max-w-md mb-6">
            You haven't created any classes for this course yet. Click the "New Class" button above to get started!
          </p>
          <button 
            @click="openCreateClass"
            class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 cursor-pointer"
          >
            <i class="fas fa-plus"></i>
            <span>Create Your First Class</span>
          </button>
        </div>

        <!-- Classes Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ClassSectionCard
            v-for="section in sectionsWithSchedule"
            :key="section.id"
            :section="{
              id: section.id,
              name: section.name,
              scheduleDay: section.scheduleDay,
              scheduleTime: section.scheduleTime,
              classroom: section.classroom,
              students: section.students,
            }"
            :show-menu="true"
            :is-menu-open="openMenuId === section.id"
            @card-click="openDashboard(section.id)"
            @toggle-menu="toggleMenu(section.id)"
            @edit="openEditClass(section.id)"
            @delete="openDeleteSectionModal(section.id, section.name); openMenuId = null"
          />
        </div>
      </div>
    </main>

    <SectionDeleteModal
      :open="showDeleteSectionModal"
      :section-name="sectionToDeleteName"
      @cancel="handleCancelDeleteSection"
      @confirm="handleConfirmDeleteSection"
    />

  </div>
</template>

<style scoped>

</style>
