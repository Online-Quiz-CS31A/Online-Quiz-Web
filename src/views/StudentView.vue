<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useQuizzesStore } from '@/stores/quizzesStore'
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))
const Sidebar = defineAsyncComponent(() => import('@/components/Sidebar.vue'))
const StudentClasses = defineAsyncComponent(() => import('@/components/student/StudentCourses.vue'))
const StudentUpcomingQuizzes = defineAsyncComponent(() => import('@/components/student/StudentQuiz.vue'))
const SchoolCalendar = defineAsyncComponent(() => import('@/components/SchoolCalendar.vue'))
const ViewAllCourses = defineAsyncComponent(() => import('@/components/ViewAllCourses.vue'))
const ViewAllQuizzes = defineAsyncComponent(() => import('@/components/ViewAllQuizzes.vue'))

// REFS
const sidebarActive = ref(false)
const showJoinClass = ref(false)
const showFindQuizzes = ref(false)
const currentSection = ref<'home' | 'quizzes' | 'calendar' | 'courses'>('home')

// REACTIVE
const quizzesStore = useQuizzesStore()

// METHODS
const upcomingQuizzes = quizzesStore.myStudentQuizzes

const toggleSidebar = () => {
  sidebarActive.value = !sidebarActive.value
}

const closeSidebar = () => {
  sidebarActive.value = false
}

const showJoinClassModal = () => {
  showJoinClass.value = true
  closeSidebar()
}

const navigateToHome = () => {
  currentSection.value = 'home'
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

const navigateToCourses = () => {
  currentSection.value = 'courses'
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

    <!-- Shared Sidebar (role-aware) -->
    <Sidebar 
      :isActive="sidebarActive" 
      :activeSection="currentSection"
      @close="closeSidebar"
      @join-class="showJoinClassModal"
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
        <div v-if="currentSection === 'home'" class="space-y-8">
          <!-- Classes Section (limit to top 3 on home) -->
          <StudentClasses :max-items="3" @view-all="navigateToCourses" />
          <!-- Quizzes Section -->
          <StudentUpcomingQuizzes :quizzes="upcomingQuizzes.slice(0, 3)" @view-all="navigateToQuizzes" />
        </div>
        <ViewAllQuizzes v-else-if="currentSection === 'quizzes'" />
        <SchoolCalendar v-else-if="currentSection === 'calendar'" />
        <ViewAllCourses v-else />
      </main>
    </div>
  </div>
</template>

<style scoped>
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

.class-card {
  transition: all 0.3s ease;
}

.class-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.quiz-progress {
  transition: width 0.5s ease;
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

.notification-badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
