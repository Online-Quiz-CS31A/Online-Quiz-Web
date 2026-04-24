<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
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
import TeacherClassSkeleton from '@/components/skeletons/TeacherClassSkeleton.vue'
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))
const SectionDeleteModal = defineAsyncComponent(() => import('@/components/modals/SectionDeleteModal.vue'))

// CONSTANTS
const coverImages = [bg1, bg2, bg3, bg4, bg5]
const router = useRouter()

// PROPS
interface Props { code: string }
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
  const code = props.code
  if (!code) return []

  const targetCourseIds = classesStore.rawTeacherCourses
    .filter(c => c.code === code)
    .map(c => c.courseId)

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
})

const current = computed<ClassItem>(() => {
  const found = classesStore.allCourses.find((c: ClassItem) => c.code === props.code)
  return (
    found || { id: 0, code: props.code, name: props.code, teacher: '', description: '—', students: 0, color: 'gray' }
  )
})

const isCourseArchived = computed(() => current.value.status === 'Archived')

const professorName = computed(() => current.value.teacher || '—') 
const totalClasses = computed(() => sections.value.length)
const totalStudents = computed(() => sections.value.reduce((sum, s) => sum + s.students, 0))

const coverUrl = computed(() => {
  const key = `${current.value.id}-${current.value.name}`
  const idx = getDeterministicIndex(key)
  return coverImages[idx % coverImages.length]
})

const breadcrumbText = computed(() => `Dashboard > Courses > ${current.value.name}`)


onMounted(async () => {
  await classesStore.fetchTeacherCourses()
})

// METHODS
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
  router.push({ name: 'class-management', params: { code: props.code } })
}

function openEditClass(id: number) {
  router.push({ name: 'class-management', params: { code: props.code }, query: { sectionId: String(id) } })
}

function deleteClass(id: number) {
  const anchorCourseId = classesStore.rawTeacherCourses.find(rc => rc.code === props.code)?.courseId ?? 0
  sectionsStore.archiveSection(id, anchorCourseId)
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


function openDashboard(sectionId: number) {
  const section = sectionsStore.allSections.find(s => s.id === sectionId)
  const sectionName = section?.name ?? ''
  const rawEntry = classesStore.rawTeacherCourses.find(
    rc => rc.code === props.code && rc.section?.trim() === sectionName.trim()
  ) ?? classesStore.rawTeacherCourses.find(rc => rc.code === props.code)
  const courseId = rawEntry?.courseId ?? 0

  router.push({
    name: 'teacher-class-dashboard',
    params: { id: String(sectionId) },
    query: { courseId: String(courseId) },
  })
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
          <button
            @click="openCreateClass"
            :disabled="isCourseArchived"
            :title="isCourseArchived ? `Can't edit archived course` : 'Create a new class'"
            :class="[
              'px-4 py-2 rounded-lg flex items-center',
              isCourseArchived
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
            ]"
          >
            <i class="fas fa-plus mr-2"></i> New Class
          </button>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="classesStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TeacherClassSkeleton v-for="i in 3" :key="i" />
        </div>

        <!-- Empty State -->
        <div v-else-if="sections.length === 0" class="p-12 flex flex-col items-center justify-center text-center">
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
            You haven't created any classes for this course yet.
            <span v-if="!isCourseArchived"> Click the "New Class" button above to get started!</span>
            <span v-else> This course is archived, so classes can no longer be created.</span>
          </p>
          <button 
            @click="openCreateClass"
            :disabled="isCourseArchived"
            :title="isCourseArchived ? `Can't edit archived course` : 'Create a new class'"
            :class="[
              'px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2',
              isCourseArchived
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
            ]"
          >
            <i class="fas fa-plus"></i>
            <span>Create Your First Class</span>
          </button>
        </div>

        <!-- Classes Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ClassSectionCard
            v-for="section in sections"
            :key="section.id"
            :section="{
              id: section.id,
              name: section.name,
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
