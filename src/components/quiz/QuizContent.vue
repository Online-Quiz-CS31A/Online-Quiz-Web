<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useQuizEditor } from '@/composables/useQuizEditor'
import { useQuestionSettings } from '@/composables/useQuestionSettings'
import { useMediaUpload } from '@/composables/useMediaUpload'
import type { QuizQuestion } from '@/interfaces/interfaces'

import SidebarQuestions from './SidebarQuestions.vue'
import QuestionEditorPanel from './QuestionEditorPanel.vue'
import SettingsPanel from './SettingsPanel.vue'
const AddQuestionModal = defineAsyncComponent(() => import('@/components/modals/AddQuestionModal.vue'))

const {
  quiz,
  currentQuestion,
  showAddQuestionModal,
  openMenuIndex,
  openAddQuestionModal,
  closeAddQuestionModal,
  handleAddQuestion,
  selectQuestion,
  toggleQuestionMenu,
  duplicateQuestion,
  deleteQuestion,
  moveQuestion,
  shuffleOptions,
  saveQuizDraft,
  publishQuiz,
} = useQuizEditor()

const { questionSettings, questionTypes, syncSettings } = useQuestionSettings(currentQuestion)
const { showMediaUpload, onQuestionMediaChange, clearQuestionMedia } = useMediaUpload(
  currentQuestion,
  computed(() => questionSettings.mediaType)
)

function handleSelectQuestion(index: number) {
  selectQuestion(index)
  syncSettings()
}

onMounted(() => {
  const importedQuestions = history.state?.importedQuestions
  if (importedQuestions && Array.isArray(importedQuestions)) {
    importedQuestions.forEach((q: any, index: number) => {
      const options = q.options ? q.options.map((opt: string, idx: number) => ({
        text: opt,
        isCorrect: q.correctAnswer === String.fromCharCode(65 + idx),
        imageUrl: ''
      })) : []
      
      const newQuestion: QuizQuestion = {
        id: q.id || Date.now() + index,
        type: q.type || 'short-answer',
        text: q.question || '',
        points: q.points || 1,
        required: q.required !== undefined ? q.required : true,
        mediaType: 'none',
        mediaUrl: '',
        options: options,
        correctAnswer: q.correctAnswer || '',
        pairs: [],
        items: []
      }
      quiz.questions.push(newQuestion)
    })
    
    if (quiz.questions.length > 0) {
      handleSelectQuestion(0)
    }
    
    useToast().success(`Successfully imported ${importedQuestions.length} question${importedQuestions.length > 1 ? 's' : ''}!`)
  }
})

defineExpose({
  saveQuiz: saveQuizDraft,
  publishQuiz
})
</script>

<template>
  <div class="bg-gray-50 font-sans h-full overflow-hidden">
    <!-- Main Layout -->
    <div class="flex h-full overflow-hidden">
      <!-- Sidebar with Questions List -->
      <SidebarQuestions
        :questions="quiz.questions"
        :currentQuestionIndex="quiz.currentQuestionIndex"
        :openMenuIndex="openMenuIndex"
        @select="handleSelectQuestion"
        @toggleMenu="toggleQuestionMenu"
        @duplicate="duplicateQuestion"
        @delete="deleteQuestion"
      />

      <!-- Middle -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header inside center content container -->
        <div class="py-4">
          <div class="bg-white p-4 flex items-start gap-4 rounded-lg">
            <!-- Add Question Button -->
            <div class="flex-shrink-0">
              <button @click="openAddQuestionModal"
                      class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors cursor-pointer">
                <i class="fas fa-plus mr-2"></i>
                Add Question
              </button>
            </div>

            <div class="hidden md:block w-px bg-gray-200 h-10 self-center"></div>

            <!-- QuizInputs -->
            <div class="flex-1">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div>
                  <input v-model="quiz.title" type="text" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                         placeholder="Quiz Title">
                </div>
                <div>
                  <select v-model="quiz.subject" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Course</option>
                    <option value="math">Information Assurance</option>
                    <option value="science">Automata</option>
                    <option value="history">Computer Architecture</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Question Editor -->
        <div class="flex-1 overflow-auto scrollbar-hide">
          <QuestionEditorPanel :question="currentQuestion" />
        </div>
      </div>

      <!-- Settings Panel -->
      <SettingsPanel
        :question="currentQuestion"
        :questionSettings="questionSettings"
        :questionTypes="questionTypes"
        :showMediaUpload="showMediaUpload"
        @update:type="(val) => questionSettings.type = val"
        @update:points="(val) => questionSettings.points = val"
        @update:mediaType="(val) => questionSettings.mediaType = val"
        @mediaChange="onQuestionMediaChange"
        @clearMedia="clearQuestionMedia"
        @moveUp="moveQuestion('up')"
        @moveDown="moveQuestion('down')"
        @shuffle="shuffleOptions"
      />
    </div>

    <!-- Add Question Modal -->
    <AddQuestionModal
      :open="showAddQuestionModal"
      @close="closeAddQuestionModal"
      @add="handleAddQuestion"
    />
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.border-l-3 {
  border-left-width: 3px;
}

.scrollbar-hide {
  -ms-overflow-style: none; 
  scrollbar-width: none; 
}
.scrollbar-hide::-webkit-scrollbar {
  display: none; 
}

.pretty-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.6) transparent; 
}
.pretty-scroll::-webkit-scrollbar {
  width: 10px;
}
.pretty-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.pretty-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.5); 
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.pretty-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.7);
}
.pretty-scroll::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}
</style>