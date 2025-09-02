<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/teacher/Sidebar.vue'
import Header from '@/components/teacher/Header.vue'
import ActiveQuizzes from '@/components/teacher/TeacherQuiz.vue'

const sidebarActive = ref(false)
const showCreateQuiz = ref(false)
const showImport = ref(false)
const currentSection = ref<'quizzes' | 'calendar'>('quizzes')


const activeQuizzes = ref([
  {
    id: 1,
     subject: 'Information Assurance',
    title: 'Week 1 Quiz',
    description: '',
    dueDate: 'May 15',
    class: 'CS31A',
    submitted: 12,
    total: 24,
    color: 'blue'
  },
  {
    id: 2,
    subject: 'Information Assurance',
    title: 'Week 2 Quiz',
    description: '',
    dueDate: 'May 18',
    class: 'CS31A',
    submitted: 8,
    total: 24,
    color: 'green'
  },
  {
    id: 3,
      subject: 'Computer Architecture',
    title: 'Week 5 Quiz',
    description: '',
    dueDate: 'May 20',
    class: 'CS31A',
    submitted: 3,
    total: 24,
    color: 'purple'
  }
])

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
      @close="closeSidebar"
      @create-quiz="showCreateQuizModal"
      @import-questions="showImportModal"
      @nav-quizzes="navigateToQuizzes"
      @nav-calendar="navigateToCalendar"
    />

    <!-- Main Content -->
    <div class="md:ml-64 min-h-screen">
      <!-- Header -->
      <Header />

      <!-- Main Dashboard -->
      <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <!-- Quizzes Section -->
        <ActiveQuizzes v-if="currentSection === 'quizzes'" :quizzes="activeQuizzes" />
        <!-- Calendar Section -->
        <SchoolCalendar v-else />
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