<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { useQuizEditor } from '@/composables/useQuizEditor'
import { useQuestionSettings } from '@/composables/useQuestionSettings'
import { useMediaUpload } from '@/composables/useMediaUpload'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useCoursesStore } from '@/stores/coursesStore'
import type { QuizQuestion } from '@/interfaces/interfaces'
interface Props {
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false
})
import SidebarQuestions from './SidebarQuestions.vue'
import QuestionEditorPanel from './QuestionEditorPanel.vue'
import SettingsPanel from './SettingsPanel.vue'
const AddQuestionModal = defineAsyncComponent(() => import('@/components/modals/AddQuestionModal.vue'))

const quizzesStore = useQuizzesStore()
const coursesStore = useCoursesStore()

const {
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
  saveQuiz: saveQuizFromEditor,
  publishQuiz,
} = useQuizEditor()

const quiz = quizzesStore.currentQuiz
const currentQuestion = computed(() => quizzesStore.currentQuestion)
const teacherSubjects = computed(() => coursesStore.mySubjects)

const hasAssignedSections = computed(() => {
  if (quizzesStore.currentQuiz.assignedSections.length > 0) return true
  const id = quizzesStore.currentQuiz.id
  if (!id) return false
  const quizData = quizzesStore.myTeacherQuizzes.find(q => q.id === id)
  if (!quizData) return false
  const assignedSections = (quizData as any).assignedSections
  return Array.isArray(assignedSections) && assignedSections.length > 0
})

const hasCourseSelected = computed(() => {
  return !!quiz.subject && quiz.subject.trim() !== ''
})

const { questionSettings, questionTypes, syncSettings } = useQuestionSettings(currentQuestion)
const { showMediaUpload, onQuestionMediaChange, clearQuestionMedia } = useMediaUpload(
  currentQuestion,
  computed(() => questionSettings.mediaType)
)

const toast = useToast()

function handleSelectQuestion(index: number) {
  selectQuestion(index)
  syncSettings()
}

function handleAddQuestionClick() {
  if (!hasCourseSelected.value) {
    toast.info('Please select a course first before adding questions.')
    return
  }

  if (!hasAssignedSections.value) {
    toast.info('Please assign a section for this quiz in the assign tab before adding questions.')
    return
  }

  openAddQuestionModal()
}

function handleDisabledAddQuestionClick() {
  if (!hasCourseSelected.value) {
    toast.info('Please select a course first before adding questions.')
  } else if (!hasAssignedSections.value) {
    toast.info('Please assign a section first in the assign tab before adding questions.')
  }
}

function saveQuiz() {
  if (typeof saveQuizFromEditor === 'function') {
    return (saveQuizFromEditor as () => void)()
  }
  return saveQuizDraft()
}

onMounted(() => {
  if (currentQuestion.value) {
    syncSettings()
  }

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
      handleAddQuestion(newQuestion)
    })

    useToast().success(`Successfully imported ${importedQuestions.length} question${importedQuestions.length > 1 ? 's' : ''}!`)
  }
})

watch(currentQuestion, (newQuestion) => {
  if (newQuestion) {
    syncSettings()
  }
})

defineExpose({
  saveQuiz,
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
        :read-only="props.readOnly"
        @select="handleSelectQuestion"
        @toggleMenu="toggleQuestionMenu"
        @duplicate="duplicateQuestion"
        @delete="deleteQuestion"
      />

      <!-- Middle -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- AppHeader inside center content container -->
        <div class="py-4">
          <div class="bg-white p-4 flex items-start gap-4 rounded-lg">
            <!-- Add Question Button -->
            <div class="flex-shrink-0" v-if="!props.readOnly">
              <!-- Real button when enabled -->
              <button
                v-if="hasCourseSelected && hasAssignedSections"
                @click="handleAddQuestionClick"
                class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors cursor-pointer"
              >
                <i class="fas fa-plus mr-2"></i>
                Add Question
              </button>

              <!-- Fake disabled button when disabled -->
              <button
                v-else
                @click="handleDisabledAddQuestionClick"
                class="bg-gray-400 text-gray-200 py-2 px-4 rounded-md flex items-center cursor-pointer"
              >
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
                         :disabled="props.readOnly"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                         placeholder="Quiz Title">
                </div>
                <div>
                  <select v-model="quiz.subject"
                          :disabled="props.readOnly"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                    <option value="">Select Course</option>
                    <option v-for="subject in teacherSubjects" :key="subject" :value="subject">
                      {{ subject }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Question Editor -->
        <div class="flex-1 overflow-auto scrollbar-hide">
          <QuestionEditorPanel :question="currentQuestion" :read-only="props.readOnly" />
        </div>
      </div>

      <!-- Settings Panel -->
      <SettingsPanel
        :question="currentQuestion"
        :questionSettings="questionSettings"
        :questionTypes="questionTypes"
        :showMediaUpload="showMediaUpload"
        :read-only="props.readOnly"
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
