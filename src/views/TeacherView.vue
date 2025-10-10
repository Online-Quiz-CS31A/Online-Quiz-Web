<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuizzesStore } from '@/stores/quizzesStore'
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))
const Sidebar = defineAsyncComponent(() => import('@/components/Sidebar.vue'))
const ActiveQuizzes = defineAsyncComponent(() => import('@/components/teacher/TeacherQuiz.vue'))
const SchoolCalendar = defineAsyncComponent(() => import('@/components/SchoolCalendar.vue'))
const TeacherClasses = defineAsyncComponent(() => import('@/components/teacher/TeacherCourses.vue'))
const ViewAllCourses = defineAsyncComponent(() => import('@/components/ViewAllCourses.vue'))
const ViewAllQuizzes = defineAsyncComponent(() => import('@/components/ViewAllQuizzes.vue'))

const sidebarActive = ref(false)
const showCreateQuiz = ref(false)
const showImport = ref(false)
const currentSection = ref<'home' | 'quizzes' | 'calendar' | 'courses'>('home')

const quizzesStore = useQuizzesStore()
const activeQuizzes = quizzesStore.myTeacherQuizzes

const router = useRouter()
const route = useRoute()
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

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  const section = (route.query.section as string) || ''
  if (section === 'courses' || section === 'quizzes' || section === 'calendar' || section === 'home') {
    currentSection.value = section as typeof currentSection.value
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => route.query.section,
  (val) => {
    const section = (val as string) || ''
    if (section === 'courses' || section === 'quizzes' || section === 'calendar' || section === 'home') {
      currentSection.value = section as typeof currentSection.value
    }
  }
)
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