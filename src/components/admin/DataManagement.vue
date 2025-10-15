<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, Upload, Database, FileJson, FileSpreadsheet, AlertCircle, Check, Trash2, Archive } from 'lucide-vue-next'
import DangerConfirmModal from '@/components/modals/DangerConfirmModal.vue'
import { useToast } from '@/composables/useToast'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useStudentsStore } from '@/stores/studentsStore'

const { success, error, info } = useToast()
const coursesStore = useCoursesStore()
const sectionsStore = useSectionsStore()
const studentsStore = useStudentsStore()

const isExporting = ref(false)
const isImporting = ref(false)
const uploadedFile = ref<File | null>(null)
const showImportPreview = ref(false)
const importPreviewData = ref<any>(null)
const exportHistory = ref<Array<{ id: string; timestamp: string; type: string; size: string }>>([])
const showClearDataModal = ref(false)

// COMPUTED
const databaseStats = computed(() => ({
  courses: coursesStore.allCourses.length,
  sections: sectionsStore.allSections.length,
  students: Object.keys(studentsStore.profiles).length,
  lastBackup: localStorage.getItem('lastBackupDate') || 'Never'
}))

// METHODS
const exportData = async (format: 'json' | 'csv') => {
  isExporting.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const data = {
      courses: coursesStore.allCourses,
      sections: sectionsStore.allSections,
      courseSectionMappings: sectionsStore.courseSectionMappings,
      schedules: sectionsStore.courseSectionSchedules,
      students: studentsStore.profiles,
      quizSettings: JSON.parse(localStorage.getItem('adminQuizSettings') || '{}'),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
    
    let content: string
    let filename: string
    let mimeType: string
    
    if (format === 'json') {
      content = JSON.stringify(data, null, 2)
      filename = `quiz-portal-backup-${Date.now()}.json`
      mimeType = 'application/json'
    } else {
      const csvRows = [
        ['Type', 'ID', 'Name', 'Code', 'Teacher', 'Students'],
        ...data.courses.map(c => ['Course', c.id, c.name, c.code, c.teacher, c.students])
      ]
      content = csvRows.map(row => row.join(',')).join('\n')
      filename = `quiz-portal-courses-${Date.now()}.csv`
      mimeType = 'text/csv'
    }
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    
    const sizeKB = (blob.size / 1024).toFixed(2)
    exportHistory.value.unshift({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: format.toUpperCase(),
      size: `${sizeKB} KB`
    })
    
    localStorage.setItem('lastBackupDate', new Date().toLocaleString())
    
    success(`Data exported successfully as ${format.toUpperCase()}`)
  } catch (err) {
    error('Export failed')
  } finally {
    isExporting.value = false
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    uploadedFile.value = file
    previewImportData(file)
  }
}

const previewImportData = async (file: File) => {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    importPreviewData.value = {
      courses: data.courses?.length || 0,
      sections: data.sections?.length || 0,
      students: Object.keys(data.students || {}).length,
      version: data.version || 'Unknown',
      exportDate: data.exportDate ? new Date(data.exportDate).toLocaleString() : 'Unknown'
    }
    
    showImportPreview.value = true
  } catch (err) {
    error('Invalid file format')
    uploadedFile.value = null
  }
}

const confirmImport = async () => {
  if (!uploadedFile.value) return
  
  isImporting.value = true
  
  try {
    const text = await uploadedFile.value.text()
    const data = JSON.parse(text)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (data.courses) {
      data.courses.forEach((course: any) => {
        const exists = coursesStore.allCourses.find(c => c.id === course.id)
        if (!exists) {
          coursesStore.allCourses.push(course)
        }
      })
    }
    
    if (data.sections) {
      data.sections.forEach((section: any) => {
        const exists = sectionsStore.allSections.find(s => s.id === section.id)
        if (!exists) {
          sectionsStore.allSections.push(section)
        }
      })
    }
    
    if (data.courseSectionMappings) {
      sectionsStore.courseSectionMappings = data.courseSectionMappings
    }
    
    if (data.schedules) {
      sectionsStore.courseSectionSchedules = data.schedules
    }
    
    if (data.students) {
      Object.assign(studentsStore.profiles, data.students)
    }
    
    if (data.quizSettings) {
      localStorage.setItem('adminQuizSettings', JSON.stringify(data.quizSettings))
    }
    
    success('Data imported successfully')
    showImportPreview.value = false
    uploadedFile.value = null
  } catch (err) {
    error('Import failed')
  } finally {
    isImporting.value = false
  }
}

const cancelImport = () => {
  showImportPreview.value = false
  uploadedFile.value = null
}

const clearAllData = () => {
  showClearDataModal.value = true
}

const confirmClearAllData = () => {
  coursesStore.allCourses.length = 0
  sectionsStore.allSections.length = 0
  sectionsStore.courseSectionMappings.length = 0
  sectionsStore.courseSectionSchedules.length = 0
  Object.keys(studentsStore.profiles).forEach(key => delete studentsStore.profiles[key])

  localStorage.removeItem('adminQuizSettings')
  localStorage.removeItem('lastBackupDate')

  showClearDataModal.value = false
  info('All data has been cleared')
}

const cancelClearAllData = () => {
  showClearDataModal.value = false
}
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Database Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-600">Courses</p>
            <p class="text-2xl font-bold text-blue-900 mt-1">{{ databaseStats.courses }}</p>
          </div>
          <Database class="w-8 h-8 text-blue-600 opacity-50" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-600">Sections</p>
            <p class="text-2xl font-bold text-green-900 mt-1">{{ databaseStats.sections }}</p>
          </div>
          <Archive class="w-8 h-8 text-green-600 opacity-50" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-purple-600">Students</p>
            <p class="text-2xl font-bold text-purple-900 mt-1">{{ databaseStats.students }}</p>
          </div>
          <Database class="w-8 h-8 text-purple-600 opacity-50" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-orange-600">Last Backup</p>
            <p class="text-xs font-semibold text-orange-900 mt-1">{{ databaseStats.lastBackup }}</p>
          </div>
          <Download class="w-8 h-8 text-orange-600 opacity-50" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Export Section -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-blue-50 rounded-lg">
            <Download class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Export Data</h3>
            <p class="text-sm text-gray-500">Download database snapshot</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <AlertCircle class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-blue-900">
                <p class="font-medium mb-1">Export includes:</p>
                <ul class="list-disc list-inside space-y-1 text-blue-800">
                  <li>All courses and sections</li>
                  <li>Student profiles and enrollments</li>
                  <li>Quiz settings and configurations</li>
                  <li>Schedules and mappings</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <button
              @click="exportData('json')"
              :disabled="isExporting"
              class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
            >
              <FileJson class="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span class="font-medium">
                {{ isExporting ? 'Exporting...' : 'Export as JSON' }}
              </span>
            </button>

            <button
              @click="exportData('csv')"
              :disabled="isExporting"
              class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
            >
              <FileSpreadsheet class="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span class="font-medium">
                {{ isExporting ? 'Exporting...' : 'Export as CSV' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Import Section -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-green-50 rounded-lg">
            <Upload class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Import Data</h3>
            <p class="text-sm text-gray-500">Restore from backup file</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <AlertCircle class="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-orange-900">
                <p class="font-medium mb-1">Important:</p>
                <p>Importing will merge with existing data. Duplicate IDs will be skipped.</p>
              </div>
            </div>
          </div>

          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".json"
              @change="handleFileUpload"
              class="hidden"
              id="file-upload"
            />
            <label for="file-upload" class="cursor-pointer">
              <Upload class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-sm font-medium text-gray-700 mb-1">
                Click to upload backup file
              </p>
              <p class="text-xs text-gray-500">JSON format only</p>
            </label>
          </div>

          <div v-if="uploadedFile" class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <FileJson class="w-5 h-5 text-blue-600" />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ uploadedFile.name }}</p>
                  <p class="text-xs text-gray-500">{{ (uploadedFile.size / 1024).toFixed(2) }} KB</p>
                </div>
              </div>
              <button @click="uploadedFile = null" class="text-gray-400 hover:text-red-600">
                <Trash2 :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export History -->
    <div v-if="exportHistory.length > 0" class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h3>
      <div class="space-y-2">
        <div
          v-for="item in exportHistory.slice(0, 5)"
          :key="item.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <Download :size="16" class="text-blue-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ item.type }} Export</p>
              <p class="text-xs text-gray-500">{{ new Date(item.timestamp).toLocaleString() }}</p>
            </div>
          </div>
          <span class="text-xs font-medium text-gray-600">{{ item.size }}</span>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6">
      <div class="flex items-start gap-3 mb-4">
        <AlertCircle class="w-6 h-6 text-red-600 mt-0.5" />
        <div>
          <h3 class="text-lg font-semibold text-red-900">Danger Zone</h3>
          <p class="text-sm text-red-700">Irreversible actions that affect all data</p>
        </div>
      </div>
      
      <button
        @click="clearAllData"
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
      >
        <Trash2 :size="18" />
        Clear All Data
      </button>
    </div>

    <!-- Import Preview Modal -->
    <div
      v-if="showImportPreview"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="cancelImport"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-blue-50 rounded-lg">
            <AlertCircle class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-900">Confirm Import</h3>
        </div>

        <div class="space-y-3 mb-6">
          <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm font-medium text-gray-700">Courses</span>
            <span class="text-sm font-bold text-gray-900">{{ importPreviewData?.courses }}</span>
          </div>
          <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm font-medium text-gray-700">Sections</span>
            <span class="text-sm font-bold text-gray-900">{{ importPreviewData?.sections }}</span>
          </div>
          <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm font-medium text-gray-700">Students</span>
            <span class="text-sm font-bold text-gray-900">{{ importPreviewData?.students }}</span>
          </div>
          <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm font-medium text-gray-700">Export Date</span>
            <span class="text-sm font-bold text-gray-900">{{ importPreviewData?.exportDate }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="cancelImport"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            @click="confirmImport"
            :disabled="isImporting"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Check v-if="!isImporting" :size="18" />
            <div v-else class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            {{ isImporting ? 'Importing...' : 'Import Data' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <DangerConfirmModal
    :open="showClearDataModal"
    title="Delete all data from the system?"
    message="This will permanently remove courses, sections, schedules, and student profiles. This action cannot be undone."
    confirm-label="Delete everything"
    cancel-label="Cancel"
    @confirm="confirmClearAllData"
    @cancel="cancelClearAllData"
  />
</template>
