<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import bg1 from '@/assets/image/bg1.jpg'
import bg2 from '@/assets/image/bg2.jpg'
import bg3 from '@/assets/image/bg3.jpg'
import bg4 from '@/assets/image/bg4.jpg'
import bg5 from '@/assets/image/bg5.jpg'

interface Props { id: string }
const props = defineProps<Props>()

type QS = 'pending' | 'completed' | 'overdue'
interface Quiz { id: number; title: string; description: string; dueDate: string; points: number; status: QS }
interface ClassItem { id: string; name: string; courseName: string; description: string; students: number }

const classes = ref<ClassItem[]>([
  {
    id: '1',
    name: 'CS31A',
    courseName: 'Information Assurance',
    description: 'This course covers the principles of information security, risk management, cryptography, and security policies to protect information systems against threats and vulnerabilities.',
    students: 45
  },
  {
    id: '2',
    name: 'IT11B',
    courseName: 'Automata',
    description: 'Deep dive into automata theory.',
    students: 32,
  },
  {
    id: '3',
    name: 'CS22A',
    courseName: 'Computer Architecture',
    description: 'Pipelines, caches, and performance optimization.',
    students: 38,
  }
])

const current = computed(() => classes.value.find(c => c.id === props.id) ?? { id: props.id, name: `Class ${props.id}`, courseName: `Course ${props.id}`, description: '—', students: 0 })
const professorName = 'Donald Francisco' 
const totalClasses = computed(() => classes.value.length)
const totalStudents = computed(() => classes.value.reduce((sum, c) => sum + c.students, 0))

const coverImages = [bg1, bg2, bg3, bg4, bg5]
function getDeterministicIndex(key: string) {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}
const coverUrl = computed(() => {
  const key = `${current.value.id}-${current.value.name}`
  const idx = getDeterministicIndex(key)
  return coverImages[idx % coverImages.length]
})

const showCreateClass = ref(false)
const showDetails = ref(false)

const newClass = reactive({ name: '', description: '', students: 1 })

const selectedClassId = ref<string | null>(null)
const openMenuId = ref<string | null>(null)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

function toggleMenu(id: string) { openMenuId.value = openMenuId.value === id ? null : id }

function openCreateClass() {
  router.push({ name: 'class-management', params: { id: props.id } })
}

function closeCreateClass() {
  showCreateClass.value = false
  isEditing.value = false
  editingId.value = null
}

function openEditClass(id: string) {
  const cls = classes.value.find(c => c.id === id)
  if (!cls) return
  isEditing.value = true
  editingId.value = id
  newClass.name = cls.name
  newClass.description = cls.description
  newClass.students = cls.students
  showCreateClass.value = true
  openMenuId.value = null
}

function createClass() {
  if (!newClass.name || !newClass.description || !newClass.students) return
  
  if (isEditing.value && editingId.value) {
    const idx = classes.value.findIndex(c => c.id === editingId.value)
    if (idx !== -1) {
      classes.value[idx] = {
        ...classes.value[idx],
        name: newClass.name,
        description: newClass.description,
        students: Number(newClass.students)
      }
    }
  } else {
    const id = (classes.value.reduce((m, c) => Math.max(m, parseInt(c.id, 10)), 0) + 1).toString()
    classes.value.push({
      id,
      name: newClass.name,
      courseName: newClass.name,
      description: newClass.description,
      students: Number(newClass.students),

    })
  }
  
  showCreateClass.value = false
  isEditing.value = false
  editingId.value = null
}

function deleteClass(id: string) {
  classes.value = classes.value.filter(c => c.id !== id)
  if (selectedClassId.value === id) {
    closeDetails()
  }
}

function closeDetails() {
  showDetails.value = false
  selectedClassId.value = null
}

const router = useRouter()
function openDashboard(id: string) {
  router.push({ name: 'teacher-class-dashboard', params: { id } })
}
</script>


<template>
  <div class="bg-gray-50 min-h-screen">
    <Header breadcrumb="Dashboard > Courses" />
    
    <!-- Hero section -->
    <div class="relative">
      <div class="absolute inset-0 overflow-hidden">
        <div class="w-full h-full bg-cover bg-center" :style="{ backgroundImage: `url(${coverUrl})` }" aria-hidden="true"></div>
        <div class="absolute inset-0 hero-gradient"></div>
      </div>
      <div class="relative container mx-auto px-4 py-12 md:py-20">
        <div class="max-w-3xl">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">{{ current.courseName }}</h1>
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
          <div v-for="cls in classes" :key="cls.id"
            class="rounded-xl shadow-md overflow-hidden class-card transition-all duration-300 text-white"
            @click="openDashboard(cls.id)">
            <div class="p-6 relative cursor-pointer">
              <div class="relative z-10">
                <div class="flex justify-end items-start">
                  <div class="relative">
                    <button @click.stop="toggleMenu(cls.id)" 
                      class="text-white hover:text-gray-200 text-lg" 
                      aria-label="More options" 
                      :aria-expanded="openMenuId === cls.id">
                      <i class="fas fa-ellipsis-vertical cursor-pointer"></i>
                    </button>
                    <!-- Dropdown menu -->
                    <div v-if="openMenuId === cls.id" @click.stop 
                      class="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                      <!-- Edit button -->
                      <button @click="openEditClass(cls.id)" 
                        class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <span>Edit</span>
                      </button>
                      <!-- Delete button -->
                      <button @click="deleteClass(cls.id); openMenuId = null" 
                        class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
                <h3 class="text-lg font-bold text-white mt-2">{{ cls.name }}</h3>
                <span class="inline-block mt-2 bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  {{ cls.students }} students
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
