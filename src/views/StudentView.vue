<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import StudentSidebar from '@/components/student/StudentSidebar.vue'
import StudentHeader from '@/components/student/StudentHeader.vue'
import StudentClasses from '@/components/student/StudentClasses.vue'
import StudentUpcomingQuizzes from '@/components/student/StudenQuiz.vue'

const sidebarActive = ref(false)
const showJoinClass = ref(false)
const showFindQuizzes = ref(false)


const studentClasses = ref([
  {
    id: 1,
    name: 'Information Assurance',
    teacher: 'Noel Lehitimas',
    description: '',
    students: 24,
    color: 'red'
  },
  {
    id: 2,
    name: 'Automata',
    teacher: 'Donald Francisco',
    description: '',
    students: 22,
    color: 'blue'
  },
  {
    id: 3,
    name: 'Computer Architecture',
    teacher: 'Winslie Dada',
    description: '',
    students: 26,
    color: 'green'
  }
])

const upcomingQuizzes = ref([
  {
    id: 1,
    subject: 'Information Assurance',
    title: 'Week 1 Quiz',
    description: '',
    dueDate: 'May 15',
    class: 'CS31A',
    timeLimit: '45 min',
    status: 'Not Started',
    color: 'blue'
  },
  {
    id: 2,
    subject: 'Information Assurance',
    title: 'Week 2 Quiz',
    description: '',
    dueDate: 'May 18',
    class: 'CS31A',
    timeLimit: '30 min',
    status: 'Not Started',
    color: 'green'
  },
  {
    id: 3,
    subject: 'Computer Architecture',
    title: 'Week 5 Quiz',
    description: '',
    dueDate: 'May 20',
    class: 'CS31A',
    timeLimit: '25 min',
    status: 'Not Started',
    color: 'purple'
  }
])

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

const showFindQuizzesModal = () => {
  showFindQuizzes.value = true
  closeSidebar()
}

const handleClassJoined = (classData: any) => {
  studentClasses.value.push(classData)
  showJoinClass.value = false
  console.log('Joined class:', classData)
}

const handleQuizSelected = (quiz: any) => {
  showFindQuizzes.value = false
  console.log('Selected quiz:', quiz)
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
    <StudentSidebar 
      :isActive="sidebarActive" 
      @close="closeSidebar"
      @join-class="showJoinClassModal"
      @find-quizzes="showFindQuizzesModal"
    />

    <!-- Main Content -->
    <div class="md:ml-64 min-h-screen">
      <!-- Header -->
      <StudentHeader />

      <!-- Main Dashboard -->
      <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

        <!-- Classes Section -->
        <StudentClasses :classes="studentClasses" />

        <!-- Quizzes Section -->
        <StudentUpcomingQuizzes :quizzes="upcomingQuizzes" />

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
