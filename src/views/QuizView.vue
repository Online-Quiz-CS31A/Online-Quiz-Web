  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  
  interface Question {
    question: string
    options: string[]
    correctAnswer: number
  }
  
  const questions: Question[] = [
    {
      question: "John sells each slice at Php15.50. Assume that he sells at a constant rate of 3 slices per 10 minutes. If a pizza is sliced in eight parts, how many pizzas will be sold within 3 hours?",
      options: ["6.75", "8", "11.25", "720"],
      correctAnswer: 0
    },
    {
      question: "What is 25% of 80?",
      options: ["15", "20", "25", "30"],
      correctAnswer: 1
    },
    {
      question: "If a shirt costs $45 and is discounted by 20%, what is the final price?",
      options: ["$9", "$36", "$54", "$45"],
      correctAnswer: 1
    },
    {
      question: "What is the sum of 1/4 + 1/3?",
      options: ["2/7", "7/12", "1/2", "2/3"],
      correctAnswer: 1
    },
    {
      question: "If 3x + 7 = 22, what is the value of x?",
      options: ["3", "5", "7", "15"],
      correctAnswer: 1
    },
    {
      question: "What is the area of a rectangle with length 8 and width 6?",
      options: ["14", "28", "48", "56"],
      correctAnswer: 2
    },
    {
      question: "If a car travels 240 miles in 4 hours, what is its average speed?",
      options: ["40 mph", "60 mph", "80 mph", "120 mph"],
      correctAnswer: 1
    },
    {
      question: "What is 15% of 200?",
      options: ["15", "20", "30", "35"],
      correctAnswer: 2
    },
    {
      question: "If 2y - 5 = 11, what is the value of y?",
      options: ["3", "6", "8", "13"],
      correctAnswer: 2
    },
    {
      question: "What is the perimeter of a square with side length 5?",
      options: ["10", "15", "20", "25"],
      correctAnswer: 2
    },
    {
      question: "What is 3/4 of 100?",
      options: ["25", "50", "75", "100"],
      correctAnswer: 2
    },
    {
      question: "If a book costs $24 and tax is 8%, what is the total cost?",
      options: ["$19.20", "$24.00", "$25.92", "$32.00"],
      correctAnswer: 2
    },
    {
      question: "What is the value of 2³?",
      options: ["4", "6", "8", "16"],
      correctAnswer: 2
    },
    {
      question: "If 4x = 20, what is the value of x?",
      options: ["4", "5", "16", "20"],
      correctAnswer: 1
    },
    {
      question: "What is the square root of 64?",
      options: ["6", "7", "8", "9"],
      correctAnswer: 2
    },
    {
      question: "If a triangle has angles of 45°, 45°, and 90°, what type of triangle is it?",
      options: ["Equilateral", "Isosceles", "Scalene", "Right"],
      correctAnswer: 1
    },
    {
      question: "What is 1/2 + 1/6?",
      options: ["1/3", "2/3", "1/2", "3/4"],
      correctAnswer: 1
    },
    {
      question: "If a circle has radius 5, what is its circumference?",
      options: ["10π", "15π", "20π", "25π"],
      correctAnswer: 0
    },
    {
      question: "What is 20% of 150?",
      options: ["20", "25", "30", "35"],
      correctAnswer: 2
    },
    {
      question: "If 5z + 3 = 18, what is the value of z?",
      options: ["2", "3", "4", "5"],
      correctAnswer: 1
    }
  ]
  
  const currentQuestion = ref(0)
  const selectedOption = ref<number | null>(null)
  const timer = ref(0)
  const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const answeredQuestions = ref<Set<number>>(new Set())
  
  const progress = computed(() => {
    return ((currentQuestion.value + 1) / questions.length) * 100
  })
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const selectOption = (optionIndex: number) => {
    selectedOption.value = optionIndex
    answeredQuestions.value.add(currentQuestion.value)
  }
  
  const nextQuestion = () => {
    if (currentQuestion.value < questions.length - 1) {
      currentQuestion.value++
      selectedOption.value = null
    }
  }
  
  const previousQuestion = () => {
    if (currentQuestion.value > 0) {
      currentQuestion.value--
      selectedOption.value = null
    }
  }
  
  const goToQuestion = (questionIndex: number) => {
    currentQuestion.value = questionIndex
    selectedOption.value = null
  }
  
  const startTimer = () => {
    timerInterval.value = setInterval(() => {
      timer.value++
    }, 1000)
  }
  
  onMounted(() => {
    startTimer()
  })
  
  onUnmounted(() => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  })
  </script>

<template>
    <div class="max-w-6xl mx-auto p-4 min-h-screen">
      <!-- Header Section -->
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-[#4285f4] mb-1">Week 1 Quiz</h1>
        <p class="text-lg text-gray-700">Business Math</p>
      </header>
  
      <!-- Main Content -->
      <main class="grid grid-cols-3 gap-6">
        <!-- Left Panel-->
        <div class="col-span-2">
          <div class="bg-white rounded-3xl shadow-sm p-8 border-2 border-[#4285f4] relative">
            <!-- Timer -->
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div class="bg-[#4285f4] text-white px-6 py-2 rounded-full text-sm font-semibold">
                {{ formatTime(timer) }}
              </div>
            </div>
            
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">Question {{ currentQuestion + 1 }}</h2>
              <p class="text-base text-gray-700 leading-relaxed mb-6">{{ questions[currentQuestion].question }}</p>
            </div>
            
            <div class="space-y-3">
              <div 
                v-for="(option, index) in questions[currentQuestion].options" 
                :key="index"
                :class="[
                  'flex items-center p-2 rounded-xl cursor-pointer transition-all border-1',
                  selectedOption === index 
                    ? 'bg-[#C9E4F6] border-[#7B90DF]' 
                    : 'bg-[#F4F7F9] border-[#7B90DF] hover:bg-gray-100'
                ]"
                @click="selectOption(index)"
              >
                <div class="mr-4 flex items-center justify-center w-8 h-8">
                  <div 
                    :class="[
                      'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                      selectedOption === index 
                        ? 'bg-[#8B9EE3] border-[#7B90DF] text-[#C9E4F6]' 
                        : 'bg-[#F4F7F9] border-[#7B90DF] text-black'
                    ]"
                  >
                    <i 
                      v-if="selectedOption === index" 
                      class="fas fa-check text-xs"
                    ></i>
                    <span v-else>{{ String.fromCharCode(65 + index) }}</span>
                  </div>
                </div>
                <span 
                  :class="[
                    'text-base font-medium',
                    selectedOption === index ? 'text-[#4866DA]' : 'text-gray-800'
                  ]"
                >{{ option }}</span>
              </div>
            </div>
          </div>
          
          <!-- Navigation buttons below quiz container -->
          <div class="flex gap-3 justify-center mt-6">
            <button 
              class="px-8 py-2 bg-[#F4F7F9] text-black border border-[#7B90DF] rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
              @click="previousQuestion"
              :disabled="currentQuestion === 0"
            >
              Previous
            </button>
            <button 
              class="px-8 py-2 bg-[#C9E4F6] border border-[#7B90DF] text-[#4D74FF] rounded-xl font-medium transition-all disabled:opacity-50"
              @click="nextQuestion"
              :disabled="currentQuestion === questions.length - 1"
            >
              Next
            </button>
          </div>
        </div>
  
        <!-- Right Panel-->
        <div class="col-span-1">
          <div class="bg-[#F4F7F9] rounded-xl shadow-sm p-4">
            <div class="mb-4">
                   <p class="text-sm text-gray-600 mb-2 text-right font-medium">Question {{ currentQuestion + 1 }} of {{ questions.length }}</p>
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div 
                  class="h-full bg-[#4285f4] rounded-full transition-all duration-300" 
                  :style="{ width: progress + '%' }"
                ></div>
              </div>
         
            </div>
            <div class="grid grid-cols-5 gap-3">
              <button 
                v-for="questionIndex in questions.length" 
                :key="questionIndex"
                :class="[
                  'w-10 h-10 border-2 rounded-lg font-semibold text-sm cursor-pointer transition-all',
                  currentQuestion === questionIndex - 1
                    ? 'border-[#4285f4] bg-[#e3f2fd] text-[#1976d2]'
                    : answeredQuestions.has(questionIndex - 1)
                    ? 'border-[#8B9EE3] bg-[#C9E4F6] text-[#1976d2]'
                    : 'border-[#4D74FF] bg-[#F4F7F9] text-gray-600 hover:bg-gray-50'
                ]"
                @click="goToQuestion(questionIndex - 1)"
              >
                {{ questionIndex }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  

  