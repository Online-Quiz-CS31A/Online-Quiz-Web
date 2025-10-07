<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useTeachersStore } from '@/stores/teachersStore'
import { useStudentsStore } from '@/stores/studentsStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useQuizzesStore } from '@/stores/quizzesStore'

const auth = useAuthStore()
const teachers = useTeachersStore()
const students = useStudentsStore()
const classesStore = useCoursesStore()
const sectionsStore = useSectionsStore()
const quizzesStore = useQuizzesStore()

const isTeacher = computed(() => auth.userRole === 'teacher')
const profile = computed(() => (isTeacher.value ? teachers.currentProfile : students.currentProfile))
const fullName = computed(() => {
  if (profile.value) return `${profile.value.firstName} ${profile.value.lastName}`
  return auth.currentUser?.name || 'Guest'
})

const firstName = ref(profile.value?.firstName || '')
const lastName = ref(profile.value?.lastName || '')
const email = ref(profile.value?.email || '')
const phone = ref(profile.value?.phone || '')
const department = ref((profile.value as any)?.department || '')
const yearLevel = ref((profile.value as any)?.yearLevel || '')
const program = ref((profile.value as any)?.program || '')
const bio = ref(profile.value?.bio || '')

const placeholderPhoto = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
const imageUrl = ref(profile.value?.photoUrl || placeholderPhoto)

const onFileChange: (e: Event) => void = (e) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const url = String(ev.target?.result || imageUrl.value)
    imageUrl.value = url
    if (isTeacher.value) {
      teachers.setCurrentPhoto(url)
    } else {
      students.setCurrentPhoto(url)
    }
  }
  reader.readAsDataURL(file)
}

function resetFromStore() {
  const p = profile.value
  firstName.value = p?.firstName || ''
  lastName.value = p?.lastName || ''
  email.value = p?.email || ''
  phone.value = p?.phone || ''
  department.value = (p as any)?.department || ''
  yearLevel.value = (p as any)?.yearLevel || ''
  program.value = (p as any)?.program || ''
  bio.value = p?.bio || ''
  imageUrl.value = p?.photoUrl || placeholderPhoto
}

function onCancel() {
  resetFromStore()
}

function onSubmit(e: Event) {
  e.preventDefault()
  if (isTeacher.value) {
    teachers.updateCurrentTeacherProfile({
      email: email.value,
      phone: phone.value,
      bio: bio.value,
      photoUrl: imageUrl.value,
    })
  } else {
    students.updateCurrentStudentProfile({
      email: email.value,
      phone: phone.value,
      photoUrl: imageUrl.value,
    })
  }
  alert('Profile changes saved successfully!')
}

const subtitle = computed(() => {
  if (!profile.value) return isTeacher.value ? 'Department' : 'Year • Course'
  return isTeacher.value
    ? (department.value || (profile.value as any).department || 'Department')
    : `${yearLevel.value || (profile.value as any).yearLevel || 'Year'}${program.value || (profile.value as any).program ? ' • ' : ''}${program.value || (profile.value as any).program || ''}`
})

const coursesCount = computed(() => classesStore.myClasses.length)

const studentsCount = computed(() => {
  if (!isTeacher.value) return 0
  
  const teacherCourses = classesStore.myClasses
  let totalStudents = 0
  
  for (const course of teacherCourses) {
    const sections = sectionsStore.getSectionsByCourse(course.id)
    for (const section of sections) {
      totalStudents += section.studentUsernames.length
    }
  }
  
  return totalStudents
})

const quizzesCount = computed(() => (isTeacher.value ? quizzesStore.myTeacherQuizzes.length : quizzesStore.myStudentQuizzes.length))
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row gap-8">
      <!-- Left Column -->
      <div class="md:w-1/3">
        <div class="relative w-30 h-30 md:w-40 md:h-40 mx-auto mb-6">
          <img :src="imageUrl" alt="Profile Picture" class="w-30 h-30 md:w-40 md:h-40 object-cover rounded-full border-4 border-sky-500" />
          <label class="absolute bottom-0 right-2 w-9 h-9 bg-sky-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow" title="Upload profile picture">
            <i class="fas fa-camera"></i>
            <input type="file" accept="image/*" class="hidden" @change="onFileChange" />
          </label>
        </div>
        <div class="text-center">
          <h3 class="text-xl font-semibold text-gray-800">{{ fullName }}</h3>
          <p class="text-gray-600">{{ subtitle }}</p>

        </div>
        <div class="mt-6 bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium text-gray-700 mb-3">Quick Stats</h4>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Courses</span>
              <span class="font-medium">{{ coursesCount }}</span>
            </div>
            <div class="flex justify-between" v-if="isTeacher">
              <span class="text-gray-600">Students</span>
              <span class="font-medium">{{ studentsCount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Quizzes</span>
              <span class="font-medium">{{ quizzesCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="md:w-2/3">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">Personal Information</h3>
        <form @submit="onSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-gray-700 mb-2" for="first-name">First Name</label>
              <input v-model="firstName" type="text" id="first-name" disabled class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label class="block text-gray-700 mb-2" for="last-name">Last Name</label>
              <input v-model="lastName" type="text" id="last-name" disabled class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label class="block text-gray-700 mb-2" for="email">Email</label>
              <input v-model="email" type="email" id="email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div>
              <label class="block text-gray-700 mb-2" for="phone">Phone</label>
              <input v-model="phone" type="tel" id="phone" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
            </div>
          </div>
          <div class="mb-6" v-if="isTeacher">
            <label class="block text-gray-700 mb-2" for="department">Department</label>
            <input v-model="department" type="text" id="department" disabled class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" v-else>
            <div>
              <label class="block text-gray-700 mb-2" for="year">Year Level</label>
              <select v-model="yearLevel" id="year" disabled class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed">
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 mb-2" for="program">Course/Program</label>
              <input v-model="program" type="text" id="program" disabled class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
            </div>
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 mb-2" for="bio">Bio</label>
            <textarea v-model="bio" id="bio" rows="4" :disabled="!isTeacher" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"></textarea>
          </div>
          <div class="flex justify-end">
            <button type="button" @click="onCancel" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 mr-4 hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
