<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import type { QuizViewQuestion } from '@/interfaces/interfaces'

// CONSTANTS
const router = useRouter()

interface ReviewQuestion extends QuizViewQuestion {
  userAnswer: number | null
  isCorrect: boolean
}

const questions: ReviewQuestion[] = [
  {
    question: "John sells each slice at Php15.50. Assume that he sells at a constant rate of 3 slices per 10 minutes. If a pizza is sliced in eight parts, how many pizzas will be sold within 3 hours?",
    options: ["6.75", "8", "11.25", "720"],
    correctAnswer: 0,
    userAnswer: 0,
    isCorrect: false
  },
  {
    question: "What is 25% of 80?",
    options: ["15", "20", "25", "30"],
    correctAnswer: 1,
    userAnswer: 1,
    isCorrect: true
  },
  {
    question: "If a shirt costs $45 and is discounted by 20%, what is the final price?",
    options: ["$9", "$36", "$54", "$45"],
    correctAnswer: 1,
    userAnswer: 1,
    isCorrect: true
  },
  {
    question: "What is the sum of 1/4 + 1/3?",
    options: ["2/7", "7/12", "1/2", "2/3"],
    correctAnswer: 1,
    userAnswer: 3,
    isCorrect: false
  },
  {
    question: "If 3x + 7 = 22, what is the value of x?",
    options: ["3", "5", "7", "15"],
    correctAnswer: 1,
    userAnswer: 1,
    isCorrect: true
  },
  {
    question: "What is the area of a rectangle with length 8 and width 6?",
    options: ["14", "28", "48", "56"],
    correctAnswer: 2,
    userAnswer: 2,
    isCorrect: true
  },
  {
    question: "If a car travels 240 miles in 4 hours, what is its average speed?",
    options: ["40 mph", "60 mph", "80 mph", "120 mph"],
    correctAnswer: 1,
    userAnswer: 1,
    isCorrect: true
  },
  {
    question: "What is 15% of 200?",
    options: ["15", "20", "30", "35"],
    correctAnswer: 2,
    userAnswer: 2,
    isCorrect: true
  },
  {
    question: "If 2y - 5 = 11, what is the value of y?",
    options: ["3", "6", "8", "13"],
    correctAnswer: 2,
    userAnswer: 2,
    isCorrect: true
  },
  {
    question: "What is the perimeter of a square with side length 5?",
    options: ["10", "15", "20", "25"],
    correctAnswer: 2,
    userAnswer: 2,
    isCorrect: true
  },
  {
    question: "What is 3/4 of 100?",
    options: ["25", "50", "75", "100"],
    correctAnswer: 2,
    userAnswer: 2,
    isCorrect: true
  },
  {
    question: "If a book costs $24 and tax is 8%, what is the total cost?",
    options: ["$19.20", "$24.00", "$25.92", "$32.00"],
    correctAnswer: 2,
    userAnswer: 2,
    isCorrect: true
  },
  {
    question: "What is the value of 2³?",
    options: ["4", "6", "8", "16"],
    correctAnswer: 2,
    userAnswer: 2,
    isCorrect: true
  },
  {
    question: "If 4x = 20, what is the value of x?",
    options: ["4", "5", "16", "20"],
    correctAnswer: 1,
    userAnswer: 1,
    isCorrect: true
  },
  {
    question: "What is the square root of 64?",
    options: ["6", "7", "8", "9"],
    correctAnswer: 2,
    userAnswer: 2,
    isCorrect: true
  },
  {
    question: "If a triangle has angles of 45°, 45°, and 90°, what type of triangle is it?",
    options: ["Equilateral", "Isosceles", "Scalene", "Right"],
    correctAnswer: 1,
    userAnswer: 1,
    isCorrect: true
  },
  {
    question: "What is 1/2 + 1/6?",
    options: ["1/3", "2/3", "1/2", "3/4"],
    correctAnswer: 1,
    userAnswer: 1,
    isCorrect: true
  },
  {
    question: "If a circle has radius 5, what is its circumference?",
    options: ["10π", "15π", "20π", "25π"],
    correctAnswer: 0,
    userAnswer: 3,
    isCorrect: false
  },
  {
    question: "What is 20% of 150?",
    options: ["20", "25", "30", "35"],
    correctAnswer: 2,
    userAnswer: 0,
    isCorrect: false
  },
  {
    question: "If 5z + 3 = 18, what is the value of z?",
    options: ["2", "3", "4", "5"],
    correctAnswer: 1,
    userAnswer: 1,
    isCorrect: true
  }
]

// REFS
const currentQuestion = ref(0)

// COMPUTED
const breadcrumb = computed(() => `Dashboard > Quizzes > Week 1 Quiz > Score`)

const score = computed(() => {
  const correct = questions.filter(q => q.isCorrect).length
  return `${correct}/${questions.length}`
})

const correctCount = computed(() => questions.filter(q => q.isCorrect).length)

// METHODS
const goToQuestion = (questionIndex: number) => {
  currentQuestion.value = questionIndex
}

const nextQuestion = () => {
  if (currentQuestion.value < questions.length - 1) {
    currentQuestion.value++
  }
}

const previousQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
  }
}

const finishReview = () => {
  router.push({ name: 'student' })
}

const getQuestionButtonClass = (index: number) => {
  const question = questions[index]
  const isActive = currentQuestion.value === index
  
  if (isActive) {
    return question.isCorrect 
      ? 'border-[#4285f4] bg-[#e3f2fd] text-[#1976d2]'
      : 'border-[#4285f4] bg-[#e3f2fd] text-[#1976d2]'
  }
  
  return question.isCorrect 
    ? 'border-[#4ade80] bg-[#86efac] text-green-800 hover:bg-green-300'
    : 'border-[#f87171] bg-[#fca5a5] text-red-800 hover:bg-red-300'
}

const getOptionClass = (optionIndex: number) => {
  const question = questions[currentQuestion.value]
  const isUserAnswer = question.userAnswer === optionIndex
  const isCorrectAnswer = question.correctAnswer === optionIndex
  
  if (isCorrectAnswer && isUserAnswer) {
    return 'bg-[#86efac] border-[#4ade80]'
  } else if (isCorrectAnswer) {
    return 'bg-[#F4F7F9] border-[#7B90DF]'
  } else if (isUserAnswer) {
    return 'bg-[#fca5a5] border-[#f87171]'
  }
  
  return 'bg-[#F4F7F9] border-[#7B90DF]'
}

const getOptionIconClass = (optionIndex: number) => {
  const question = questions[currentQuestion.value]
  const isUserAnswer = question.userAnswer === optionIndex
  const isCorrectAnswer = question.correctAnswer === optionIndex
  
  if (isCorrectAnswer && isUserAnswer) {
    return 'bg-[#4ade80] border-[#4ade80] text-white'
  } else if (isCorrectAnswer) {
    return 'bg-[#F4F7F9] border-[#7B90DF] text-black'
  } else if (isUserAnswer) {
    return 'bg-[#f87171] border-[#f87171] text-white'
  }
  
  return 'bg-[#F4F7F9] border-[#7B90DF] text-black'
}

const showIcon = (optionIndex: number) => {
  const question = questions[currentQuestion.value]
  const isUserAnswer = question.userAnswer === optionIndex
  const isCorrectAnswer = question.correctAnswer === optionIndex
  
  return isUserAnswer || isCorrectAnswer
}

const getIconType = (optionIndex: number) => {
  const question = questions[currentQuestion.value]
  const isCorrectAnswer = question.correctAnswer === optionIndex
  
  return isCorrectAnswer ? 'check' : 'times'
}
</script>

<template>
  <div class="min-h-screen">
    <Header :breadcrumb="breadcrumb" />
    
    <div class="max-w-6xl mx-auto p-4 mt-8">
      <!-- Quiz Header Info -->
      <div class="mb-6 flex items-start gap-6">
        <!-- Title Block -->
        <div class="shrink-0">
          <h1 class="text-3xl font-bold text-[#4285f4] leading-tight">Week 1 Quiz</h1>
          <p class="text-base text-gray-800">Business Math</p>
        </div>

        <!-- Info Box -->
        <div class="flex-1 min-w-[420px]">
          <div class="rounded-2xl border border-[#D7E8FF] overflow-hidden">
            <!-- Row 1 -->
            <div class="grid grid-cols-2 divide-x divide-[#D7E8FF]">
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Status:</span>
                <span class="ml-2 text-gray-800">Finished</span>
              </div>
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Started:</span>
                <span class="ml-2 text-gray-800">July 27, 2025, 10:30 AM</span>
              </div>
            </div>
            <!-- Row 2 -->
            <div class="grid grid-cols-2 divide-x divide-[#D7E8FF] border-t border-[#D7E8FF]">
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Score:</span>
                <span class="ml-2 text-gray-800">{{ score }}</span>
              </div>
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Completed:</span>
                <span class="ml-2 text-gray-800">July 27, 2025, 11:30 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="grid grid-cols-3 gap-6">
        <!-- Left Panel -->
        <div class="col-span-2">
          <div class="bg-white rounded-3xl shadow-sm p-8 border-2 border-[#4285f4] relative">
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">Question {{ currentQuestion + 1 }}</h2>
              <p class="text-base text-gray-700 leading-relaxed mb-6">{{ questions[currentQuestion].question }}</p>
            </div>
            
            <div class="space-y-3">
              <div 
                v-for="(option, index) in questions[currentQuestion].options" 
                :key="index"
                :class="[
                  'flex items-center p-2 rounded-xl transition-all border-1',
                  getOptionClass(index)
                ]"
              >
                <div class="mr-4 flex items-center justify-center w-8 h-8">
                  <div 
                    :class="[
                      'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                      getOptionIconClass(index)
                    ]"
                  >
                    <i 
                      v-if="showIcon(index)" 
                      :class="['fas', `fa-${getIconType(index)}`, 'text-xs']"
                    ></i>
                    <span v-else>{{ String.fromCharCode(65 + index) }}</span>
                  </div>
                </div>
                <span 
                  :class="[
                    'text-base font-medium',
                    questions[currentQuestion].userAnswer === index ? 'text-[#4866DA]' : 'text-gray-800'
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

        <!-- Right Panel -->
        <div class="col-span-1">
          <div class="bg-[#F4F7F9] rounded-xl shadow-sm p-4">
            <div class="mb-4">
              <p class="text-sm font-medium text-gray-600 text-right">Question {{ currentQuestion + 1 }} of {{ questions.length }}</p>
            </div>
            <div class="grid grid-cols-5 gap-3">
              <button 
                v-for="(question, index) in questions" 
                :key="index"
                :class="[
                  'w-10 h-10 border-2 rounded-lg font-semibold text-sm cursor-pointer transition-all',
                  getQuestionButtonClass(index)
                ]"
                @click="goToQuestion(index)"
              >
                {{ index + 1 }}
              </button>
            </div>
            
            <!-- Finish Review Button -->
            <div class="mt-6 pt-4 border-t border-gray-300">
              <button 
                @click="finishReview"
                class="w-full px-4 py-2 bg-white border border-[#7B90DF] text-[#4285f4] rounded-xl font-medium hover:bg-[#F4F7F9] transition-all flex items-center justify-center gap-2"
              >
                <span>Finish Review</span>
                <i class="fas fa-arrow-right text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
