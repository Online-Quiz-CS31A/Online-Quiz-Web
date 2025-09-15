<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useCounterStore } from '@/stores/counter'
interface Props {
  isActive: boolean
  activeSection?: 'home' | 'quizzes' | 'calendar' | 'courses'
}

const props = defineProps<Props>()
defineEmits<{
  close: []
  'create-quiz': []
  'import-questions': []
  'join-class': []
  'nav-home': []
  'nav-quizzes': []
  'nav-calendar': []
}>()

const classesOpen = ref(false)
const route = useRoute()
const router = useRouter()
const isCoursesActive = computed(() => {
  return (
    activeSection.value === 'courses' ||
    route.name === 'teacher-courses' ||
    route.name === 'teacher-class' ||
    route.name === 'teacher-class-dashboard'
  )
})
const isHomeActive = computed(() => route.name === 'home')
const activeSection = computed(() => props.activeSection)
const isQuizzesActive = computed(() => activeSection.value === 'quizzes')
const isCalendarActive = computed(() => activeSection.value === 'calendar')

const store = useCounterStore()
const isTeacher = computed(() => store.userRole === 'teacher')
const isStudent = computed(() => store.userRole === 'student')
const myClasses = computed(() => store.myClasses)

const colorMap: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  teal: 'bg-teal-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  yellow: 'bg-yellow-500',
}
function colorDotClass(color?: string) {
  return color ? (colorMap[color] || 'bg-gray-400') : 'bg-gray-400'
}

function navigateToQuizCreator() {
  router.push(`/teacher/create-quiz`)
}
</script>

<template>
  <div 
    :class="[
      'sidebar w-64 bg-white shadow-lg fixed h-full overflow-y-auto z-40',
      { 'active': isActive }
    ]"
  >
    
    <div class="p-4">
      <div class="mb-6">
        <h2 class="text-xs uppercase font-semibold text-gray-500 mb-2"></h2>
        <ul>
          <li class="mb-1">
            <button @click="$emit('nav-home')" class="w-full flex items-center p-2 rounded-md text-left cursor-pointer" :class="(isHomeActive || activeSection === 'home') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'">
              <i class="fas fa-home mr-3"></i>
              <span>Home</span>
            </button>
          </li>
          <li class="mb-1">
            <button 
              @click="classesOpen = !classesOpen"
              class="w-full flex items-center p-2 rounded-md text-gray-700 cursor-pointer"
              :class="isCoursesActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'"
            >
              <i class="fas fa-book-open mr-3"></i>
              <span>My Courses</span>
              <i 
                class="fas fa-chevron-down ml-auto transition-transform duration-200"
                :class="classesOpen ? 'rotate-180' : ''"
              ></i>
            </button>
            <ul v-show="classesOpen" class="mt-1 ml-6">
              <li v-for="cls in myClasses" :key="cls.id" class="mb-1">
                <!-- Teachers: real navigation to classroom; Students: visually same, no navigation -->
                <RouterLink
                  v-if="isTeacher"
                  :to="{ name: 'teacher-class', params: { id: cls.id } }"
                  class="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  <span class="w-4 h-4 rounded-full mr-3" :class="colorDotClass(cls.color)"></span>
                  <span>{{ cls.name }}</span>
                </RouterLink>
                <div
                  v-else
                  class="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700"
                  @click.prevent
                >
                  <span class="w-4 h-4 rounded-full mr-3" :class="colorDotClass(cls.color)"></span>
                  <span>{{ cls.name }}</span>
                </div>
              </li>
            </ul>
          </li>
          <li class="mb-1">
            <button @click="$emit('nav-quizzes')" class="w-full flex items-center p-2 rounded-md text-left cursor-pointer" :class="isQuizzesActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'">
              <i class="fas fa-clipboard-list mr-3"></i>
              <span>Quizzes</span>
            </button>
          </li>
          <li class="mb-1">
            <button @click="$emit('nav-calendar')" class="w-full flex items-center p-2 rounded-md text-left cursor-pointer" :class="isCalendarActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'">
              <i class="fas fa-calendar-alt mr-3"></i>
              <span>Calendar</span>
            </button>
          </li>
        </ul>
      </div>
      
      
      
      <!-- Teacher actions -->
      <div class="mb-6" v-if="isTeacher">
        <button 
          @click="navigateToQuizCreator"
          class="w-full mb-2 bg-white border border-2 border-blue-600 text-blue-600 hover:bg-blue-700 hover:text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors cursor-pointer"
        >
          <i class="fas fa-plus mr-2 "></i> Create Quiz
        </button>
        <button 
          @click="$emit('import-questions')"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors cursor-pointer"
        >
          <i class="fas fa-upload mr-2"></i> Import Questions
        </button>
      </div>

      <!-- Student actions -->
      <div class="mb-6" v-else-if="isStudent">
        <button 
          @click="$emit('join-class')"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
        >
          <i class="fas fa-user-plus mr-2"></i> Join Class
        </button>
      </div>
    </div>
  </div>
</template>

