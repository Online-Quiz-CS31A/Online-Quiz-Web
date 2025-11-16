<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useCoursesStore } from '@/stores/coursesStore'
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))
const Sidebar = defineAsyncComponent(() => import('@/components/Sidebar.vue'))
const ActiveQuizzes = defineAsyncComponent(() => import('@/components/teacher/TeacherQuiz.vue'))
const SchoolCalendar = defineAsyncComponent(() => import('@/components/SchoolCalendar.vue'))
const TeacherClasses = defineAsyncComponent(() => import('@/components/teacher/TeacherCourses.vue'))
const ViewAllCourses = defineAsyncComponent(() => import('@/components/ViewAllCourses.vue'))
const ViewAllQuizzes = defineAsyncComponent(() => import('@/components/ViewAllQuizzes.vue'))

// REFS
const sidebarActive = ref(false)
const showCreateQuiz = ref(false)
const showImport = ref(false)
const currentSection = ref<'home' | 'quizzes' | 'calendar' | 'courses' | 'archived'>('home')
const archivedTab = ref<'courses' | 'quizzes'>('courses')
const archivedQuizzesFilter = ref<'all' | 'published' | 'draft'>('all')

// REACTIVE
const quizzesStore = useQuizzesStore()
const coursesStore = useCoursesStore()
const route = useRoute()
const refreshTrigger = ref(0)

// COMPUTED
const activeQuizzes = computed(() => {
  refreshTrigger.value
  
  const storedQuizzes = quizzesStore.loadQuizzesFromStorage()
  const allQuizzes = [...storedQuizzes, ...quizzesStore.myTeacherQuizzes].filter(q => !q.archived)
  
  return allQuizzes.sort((a, b) => {
    const aStatus = a.status || 'published'
    const bStatus = b.status || 'published'
    
    if (aStatus === 'draft' && bStatus !== 'draft') return -1
    if (aStatus !== 'draft' && bStatus === 'draft') return 1
    
    const aDate = new Date(a.createdAt || 0).getTime()
    const bDate = new Date(b.createdAt || 0).getTime()
    return bDate - aDate
  })
})

const archivedCourses = computed(() => {
  return coursesStore.allCourses.filter(c => c.status === 'Archived')
})

const archivedQuizzes = computed(() => {
  const storedQuizzes = quizzesStore.getAllQuizzes()
  const allQuizzes = [...storedQuizzes, ...quizzesStore.myTeacherQuizzes]
  let list = allQuizzes.filter(q => q.archived)
  if (archivedQuizzesFilter.value !== 'all') {
    list = list.filter(q => (q.status || 'published') === archivedQuizzesFilter.value)
  }
  return list
})

// WATCHERS
watch(
  () => route.query.section,
  (val) => {
    const section = (val as string) || ''
    if (section === 'courses' || section === 'quizzes' || section === 'calendar' || section === 'home' || section === 'archived') {
      currentSection.value = section as typeof currentSection.value
    }
    if (section === 'home' || !section) {
      refreshTrigger.value++
    }
  }
)

watch(
  () => route.path,
  () => {
    refreshTrigger.value++
  }
)

// METHODS
const handleViewAllClasses = () => {
  currentSection.value = 'courses'
}

const toggleSidebar = () => {
  sidebarActive.value = !sidebarActive.value
}

const closeSidebar = () => {
  sidebarActive.value = false
}

const showCreateQuizModal = () => {
  showCreateQuiz.value = true
  closeSidebar()
}

const showImportModal = () => {
  showImport.value = true
  closeSidebar()
}

const navigateToQuizzes = () => {
  currentSection.value = 'quizzes'
  closeSidebar()
}

const navigateToCalendar = () => {
  currentSection.value = 'calendar'
  closeSidebar()
}

const navigateToArchived = () => {
  currentSection.value = 'archived'
  closeSidebar()
}

const navigateToArchivedCourses = () => {
  currentSection.value = 'archived'
  archivedTab.value = 'courses'
  closeSidebar()
}

const navigateToArchivedQuizzes = () => {
  currentSection.value = 'archived'
  archivedTab.value = 'quizzes'
  archivedQuizzesFilter.value = 'all'
  closeSidebar()
}

const navigateToArchivedQuizzesPublished = () => {
  currentSection.value = 'archived'
  archivedTab.value = 'quizzes'
  archivedQuizzesFilter.value = 'published'
  closeSidebar()
}

const navigateToArchivedQuizzesDraft = () => {
  currentSection.value = 'archived'
  archivedTab.value = 'quizzes'
  archivedQuizzesFilter.value = 'draft'
  closeSidebar()
}

const navigateToHome = () => {
  currentSection.value = 'home'
  closeSidebar()
}

const handleClickOutside = (e: Event) => {
  if (window.innerWidth <= 768 && sidebarActive.value) {
    const target = e.target as HTMLElement
    if (!target.closest('.sidebar') && !target.closest('#menuBtn')) {
      closeSidebar()
    }
  }
}


// LIFECYCLE
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  const section = (route.query.section as string) || ''
  if (section === 'courses' || section === 'quizzes' || section === 'calendar' || section === 'home' || section === 'archived') {
    currentSection.value = section as typeof currentSection.value
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="bg-gray-50 font-sans">
    <!-- Mobile Menu Button -->
    <div class="md:hidden fixed top-4 left-4 z-50">
      <button @click="toggleSidebar" class="p-2 rounded-md bg-white shadow-md">
        <i class="fas fa-bars text-gray-700"></i>
      </button>
    </div>

    <!-- Sidebar -->
    <Sidebar 
      :isActive="sidebarActive"
      :activeSection="currentSection"
      @close="closeSidebar"
      @create-quiz="showCreateQuizModal"
      @import-questions="showImportModal"
      @nav-home="navigateToHome"
      @nav-quizzes="navigateToQuizzes"
      @nav-calendar="navigateToCalendar"
      @nav-archived="navigateToArchived"
      @nav-archived-courses="navigateToArchivedCourses"
      @nav-archived-quizzes="navigateToArchivedQuizzes"
      @nav-archived-quizzes-published="navigateToArchivedQuizzesPublished"
      @nav-archived-quizzes-draft="navigateToArchivedQuizzesDraft"
    />

    <!-- Main Content -->
    <div class="md:ml-64 min-h-screen">
      <!-- Header -->
      <Header />

      <!-- Main Dashboard -->
      <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <!-- Home Section: show Classes cards, then Quizzes under them -->
        <div v-if="currentSection === 'home'" class="space-y-8">
          <TeacherClasses :max-items="3" @view-all="handleViewAllClasses" />
          <div>
            <ActiveQuizzes :quizzes="activeQuizzes.slice(0, 3)" @view-all="navigateToQuizzes" />
          </div>
        </div>
        <!-- Quizzes Section -->
        <ViewAllQuizzes v-else-if="currentSection === 'quizzes'" />
        <!-- Calendar Section -->
        <SchoolCalendar v-else-if="currentSection === 'calendar'" />
        <!-- Archived Section -->
        <div v-else-if="currentSection === 'archived'" class="space-y-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-semibold text-gray-800">Archived</h2>
            <select
              v-model="archivedTab"
              class="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="courses">Courses</option>
              <option value="quizzes">Quizzes</option>
            </select>
          </div>

          <div v-if="archivedTab === 'courses'">
            <TeacherClasses :classes="archivedCourses" />
          </div>

          <div v-else>
            <ActiveQuizzes
              :quizzes="archivedQuizzes"
              :hide-header="true"
              :show-filters="false"
            />
          </div>
        </div>
        <!-- Courses Section (View All) -->
        <ViewAllCourses v-else />
      </main>
    </div>

  </div>
</template>

<style scoped>

.question-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.quiz-card {
  transition: all 0.3s ease;
}

.quiz-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.sidebar {
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    position: fixed;
    z-index: 50;
    height: 100vh;
  }
  .sidebar.active {
    transform: translateX(0);
  }
}
</style>