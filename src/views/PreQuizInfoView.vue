<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Book, Info, FileText, Clock, List, Award, AlertCircle, CheckCircle, XCircle, HelpCircle, Play, BarChart2, Tag } from 'lucide-vue-next'
import Header from '@/components/Header.vue'


const route = useRoute()
const router = useRouter()

interface RouteParams {
  quizId: string
}

// COMPUTED
const quizId = computed(() => (route.params as unknown as RouteParams).quizId)

const breadcrumb = computed(() => `Dashboard > Quizzes > ${quiz.value.title}`)

const quiz = computed(() => ({
  id: quizId.value,
  title: 'Week 1 Quiz',
  subject: 'Information Assurance',
  duration: '30 minutes',
  questions: 20,
  correctAnswers: 17,
  passingScore: 12,
  passingPercentage: 50,
  attemptsAvailable: 1,
  currentScore: 85,
  improvement: 5,
  history: [
    { name: '1', date: 'May 15, 2023', score: '18/20', mark: 90 },
    { name: '2', date: 'April 28, 2023', score: '17/20', mark: 85 },
    { name: '3', date: 'April 10, 2023', score: '16/20', mark: 80 },
  ]
}))


// METHODS
const startQuiz = () => {
  router.push({ name: 'quiz' })
}

const markAsDone = () => {
  console.log('Quiz marked as done')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header :breadcrumb="breadcrumb" />

    <!-- Main -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-5xl mx-auto">
        <div class="bg-white rounded-3xl shadow-sm overflow-hidden border-2 border-[#4285f4]">
          <div class="bg-[#4285f4] p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold flex items-center">
                  <Info class="w-6 h-6 mr-2" /> Quiz Information
                </h2>
                <p class="mt-2 opacity-90">Before you begin, here's important information about this quiz</p>
              </div>
              <button @click="markAsDone" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-xl transition duration-200 flex items-center shadow-sm">
                <CheckCircle class="w-4 h-4 mr-2" /> Mark as Done
              </button>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Quiz Details -->
              <div class="bg-[#F4F7F9] p-4 rounded-xl border border-[#7B90DF]">
                <h3 class="font-semibold text-[#4285f4] flex items-center">
                  <FileText class="w-4 h-4 mr-2" /> Quiz Details
                </h3>
                <ul class="mt-3 space-y-2 text-gray-700">
                  <li class="flex items-start">
                    <Tag class="mr-2 mt-1 w-4 h-4" />
                    <span>Quiz Name: <span class="font-medium">{{ quiz.title }}</span></span>
                  </li>
                  <li class="flex items-start">
                    <Book class="mr-2 mt-1 w-4 h-4" />
                    <span>Subject: <span class="font-medium">{{ quiz.subject }}</span></span>
                  </li>
                  <li class="flex items-start">
                    <Clock class="mr-2 mt-1 w-4 h-4" />
                    <span>Duration: <span class="font-medium">{{ quiz.duration }}</span></span>
                  </li>
                  <li class="flex items-start">
                    <List class="mr-2 mt-1 w-4 h-4" />
                    <span>Questions: <span class="font-medium">{{ quiz.questions }}</span></span>
                  </li>
                </ul>
              </div>

              <!-- Score -->
              <div class="bg-[#F4F7F9] p-4 rounded-xl border border-[#7B90DF]">
                <h3 class="font-semibold text-[#4285f4] flex items-center">
                  <Award class="w-4 h-4 mr-2" /> Your Score
                </h3>
                <div class="mt-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-700 font-medium">Passing Score</span>
                    <span class="font-bold text-[#1976d2] text-lg">{{ quiz.passingScore }}/{{ quiz.questions }}</span>
                  </div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-gray-700 font-medium">Your Score</span>
                    <span class="font-bold text-[#4285f4] text-2xl">{{ quiz.correctAnswers }}/{{ quiz.questions }}</span>
                  </div>
                  <div class="flex items-center gap-3 mt-1">
                    <div class="w-full bg-gray-200 rounded-full h-3">
                      <div class="bg-[#4285f4] h-3 rounded-full transition-all" :style="{ width: (quiz.correctAnswers / quiz.questions * 100) + '%' }"></div>
                    </div>
                    <span class="min-w-[3rem] text-sm font-semibold text-[#4285f4] text-right">{{ Math.round((quiz.correctAnswers / quiz.questions) * 100) }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Instructions -->
            <div class="bg-[#F4F7F9] p-4 rounded-xl border border-[#7B90DF]">
              <h3 class="font-semibold text-[#4285f4] flex items-center">
                <AlertCircle class="w-4 h-4 mr-2" /> Important Instructions
              </h3>
              <div class="mt-3 space-y-3 text-gray-700">
                <div class="flex items-start">
                  <Clock class="mr-2 mt-1 text-amber-500 w-4 h-4" />
                  <span>The quiz will automatically submit when time runs out.</span>
                </div>
                <div class="flex items-start">
                  <XCircle class="mr-2 mt-1 text-red-500 w-4 h-4" />
                  <span>If you switch tabs, the quiz will automatically end.</span>
                </div>
                <div class="flex items-start">
                  <HelpCircle class="mr-2 mt-1 text-blue-600 w-4 h-4" />
                  <span>You will only have {{ quiz.attemptsAvailable }} attempt(s) to answer this quiz.</span>
                </div>
              </div>
            </div>

            <!-- Footer actions -->
            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
              <div class="flex items-center text-gray-600">
                <HelpCircle class="w-4 h-4 mr-2" />
                <span>Need help? Contact your instructor</span>
              </div>
              <button @click="startQuiz" class="bg-[#4285f4] hover:bg-[#1976d2] text-white font-semibold py-3 px-8 rounded-xl transition duration-200 flex items-center shadow-sm">
                <Play class="w-4 h-4 mr-2" /> Start Quiz
              </button>
            </div>
          </div>
        </div>

        <!-- Attempts History -->
        <div class="mt-8 bg-white rounded-3xl p-6 shadow-sm border-2 border-[#4285f4]">
          <h3 class="text-xl font-bold text-[#4285f4] flex items-center">
            <BarChart2 class="w-5 h-5 mr-2" /> Attempts History
          </h3>
          <div class="mt-4">
            <div class="grid grid-cols-4 gap-4 text-center mb-4 text-gray-700 font-semibold">
              <div>Attempts</div>
              <div>Date</div>
              <div>Score</div>
              <div>Mark</div>
            </div>
            <div class="space-y-3">
              <div v-for="item in quiz.history" :key="item.name + item.date" class="grid grid-cols-4 gap-4 text-center items-center bg-[#F4F7F9] p-3 rounded-xl border border-[#7B90DF]">
                <div class="text-gray-800">{{ item.name }}</div>
                <div class="text-gray-600">{{ item.date }}</div>
                <div class="font-bold text-[#4285f4]">{{ item.score }}</div>
                <div class="font-bold text-[#1976d2]">{{ item.mark }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
