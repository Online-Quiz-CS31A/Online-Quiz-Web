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
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))

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
const showDetails = ref(false)
const selectedClassId = ref<string | null>(null)
const openMenuId = ref<number | null>(null)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

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
  const section = sectionsStore.allSections.find((s: ClassSection) => s.id === id)
  if (!section) return
  isEditing.value = true
  editingId.value = id
  newClass.name = section.name
  newClass.description = '' 
  newClass.students = section.students
  showCreateClass.value = true
  openMenuId.value = null
}

function deleteClass(id: number) {
  sectionsStore.removeSectionFromCourse(id, Number(props.id))
  if (selectedClassId.value === String(id)) {
    closeDetails()
  }
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

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="section in sectionsWithSchedule" :key="section.id"
            class="rounded-xl shadow-md overflow-hidden class-card transition-all duration-300 text-white"
            @click="openDashboard(section.id)">
            <div class="p-6 relative cursor-pointer">
              <div class="relative z-10">
                <div class="flex justify-between items-start">
                  <h3 class="text-lg font-bold text-white">{{ section.name }}</h3>
                  <div class="relative">
                    <button @click.stop="toggleMenu(section.id)" 
                      class="text-white hover:text-gray-200 text-lg" 
                      aria-label="More options" 
                      :aria-expanded="openMenuId === section.id">
                      <i class="fas fa-ellipsis-vertical cursor-pointer"></i>
                    </button>
                    <!-- Dropdown menu -->
                    <div v-if="openMenuId === section.id" @click.stop 
                      class="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                      <!-- Edit button -->
                      <button @click="openEditClass(section.id)" 
                        class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <span>Edit</span>
                      </button>
                      <!-- Delete button -->
                      <button @click="deleteClass(section.id); openMenuId = null" 
                        class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="mt-3 space-y-1">
                  <div class="flex items-center text-white/90 text-sm">
                    <i class="fas fa-calendar-day w-5 mr-2"></i>
                    <span>{{ section.scheduleDay }} {{ section.scheduleTime }}</span>
                  </div>
                  <div class="flex items-center text-white/90 text-sm">
                    <i class="fas fa-door-open w-5 mr-2"></i>
                    <span>{{ section.classroom }}</span>
                  </div>
                </div>
                <span class="inline-block mt-3 bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  {{ section.students }} students
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
        </div>
      </div>
    </main>

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
