<script setup lang="ts">
import { ref } from 'vue'
interface Props {
  isActive: boolean
}

defineProps<Props>()
defineEmits<{
  close: []
  'join-class': []
}>()

const classesOpen = ref(false)
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
            <a href="#" class="flex items-center p-2 rounded-md bg-blue-50 text-blue-600">
              <i class="fas fa-home mr-3"></i>
              <span>Home</span>
            </a>
          </li>
          <li class="mb-1">
            <button 
              @click="classesOpen = !classesOpen"
              class="w-full flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700"
            >
              <i class="fas fa-book-open mr-3"></i>
              <span>My Courses</span>
              <i 
                class="fas fa-chevron-down ml-auto transition-transform duration-200"
                :class="classesOpen ? 'rotate-180' : ''"
              ></i>
            </button>
            <ul v-show="classesOpen" class="mt-1 ml-6">
              <li class="mb-1">
                <a href="#" class="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <span class="w-4 h-4 rounded-full bg-yellow-500 mr-3"></span>
                  <span>Information Assurance</span>
                </a>
              </li>
              <li class="mb-1">
                <a href="#" class="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <span class="w-4 h-4 rounded-full bg-blue-500 mr-3"></span>
                  <span>Automata</span>
                </a>
              </li>
              <li class="mb-1">
                <a href="#" class="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <span class="w-4 h-4 rounded-full bg-orange-500 mr-3"></span>
                  <span>Computer Architecture</span>
                </a>
              </li>
            </ul>
          </li>
          <li class="mb-1">
            <a href="#" class="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700">
              <i class="fas fa-clipboard-list mr-3"></i>
              <span>Quizzes</span>
            </a>
          </li>
          <li class="mb-1">
            <a href="#" class="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700">
              <i class="fas fa-calendar-alt mr-3"></i>
              <span>Calendar</span>
            </a>
          </li>
        </ul>
      </div>
      
      
      
      <div class="mb-6">
       
        <button 
          @click="$emit('join-class')"
          class="w-full mb-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
        >
          <i class="fas fa-plus mr-2"></i> Join Class
        </button>
      </div>
    </div>
  </div>
</template>

