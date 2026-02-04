import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'
import type { AdminUser, Course, Stats, LogEntry, AnalyticsSummary, User } from '../interfaces/interfaces'

import { useAuthStore } from './authStore'

export const useAdminStore = defineStore('admin', () => {
    // STATE
    const users = ref<AdminUser[]>([])
    const courses = ref<Course[]>([])
    const stats = ref<Stats>({
        activeUsers: 0,
        activeCourses: 0,
        quizzesTaken: 0,
        systemHealth: 'Optimal'
    })
    const recentActivity = ref<any[]>([])
    const logs = ref<LogEntry[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // PAGINATION STATE
    const totalUsers = ref(0)
    const totalCourses = ref(0)
    const totalLogs = ref(0)

    // ACTIONS

    // --- USERS ---
    async function fetchUsers(page = 1, pageSize = 10, search = '', role = '') {
        isLoading.value = true
        error.value = null
        try {
            const params = new URLSearchParams()
            params.append('pageNumber', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search) 
            if (role && role !== 'All Users') params.append('role', role) 

            const response = await api.get(`/user/paged?${params.toString()}`)

            const data = response.data
            users.value = data.items.map((u: any) => ({
                id: u.userId,
                name: u.fullName,
                email: u.email,
                role: u.roleName || 'Student', 
                status: u.status || 'Active',
                lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'Never',
                avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', 
                username: u.email.split('@')[0], 
                course: u.student?.course,
                year: u.student?.yearLevel?.toString(),
                section: u.student?.section,
                department: u.teacher?.department || u.department,
                contactNumber: u.contactNumber,
                emergencyContactNumber: u.emergencyContactNumber
            }))
            totalUsers.value = data.totalCount
        } catch (err: any) {
            console.error('Failed to fetch users:', err)
            error.value = err.message || 'Failed to fetch users'
        } finally {
            isLoading.value = false
        }
    }

    async function createUser(userData: any) {
        isLoading.value = true
        try {
            await api.post('/user', userData)
            await fetchUsers()
            return true
        } catch (err: any) {
            console.error('Failed to create user:', err)
            error.value = err.response?.data?.error || err.message || 'Failed to create user'
            return false
        } finally {
            isLoading.value = false
        }
    }

    async function updateUser(id: number, userData: any) {
        isLoading.value = true
        try {
            await api.put(`/user/${id}`, userData)
            await fetchUsers() 
            return true
        } catch (err: any) {
            console.error('Failed to update user:', err)
            error.value = err.response?.data?.error || err.message || 'Failed to update user'
            return false
        } finally {
            isLoading.value = false
        }
    }

    async function deleteUser(id: number) {
        isLoading.value = true
        try {
            await api.delete(`/user/${id}`)
            await fetchUsers() 
            return true
        } catch (err: any) {
            console.error('Failed to delete user:', err)
            error.value = err.response?.data?.error || err.message || 'Failed to delete user'
            return false
        } finally {
            isLoading.value = false
        }
    }

    // --- COURSES ---
    async function fetchCourses(page = 1, pageSize = 10, search = '', status = '') {
        isLoading.value = true
        error.value = null
        try {
            const params = new URLSearchParams()
            params.append('pageNumber', page.toString())
            params.append('pageSize', pageSize.toString())

            const response = await api.get(`/course/paged?${params.toString()}`)
            const data = response.data

            courses.value = data.items.map((c: any) => ({
                id: c.courseId,
                title: c.name,
                code: c.code,
                status: c.status || 'Active',
                subjectCode: c.category || '', 
                description: c.description || '',
                instructors: c.instructorName ? [{
                    teacherId: c.instructorId,
                    section: c.section || 'A',
                    students: c.enrollmentCount || 0
                }] : []
            }))
            totalCourses.value = data.totalCount
        } catch (err: any) {
            console.error('Failed to fetch courses:', err)
            error.value = err.message || 'Failed to fetch courses'
        } finally {
            isLoading.value = false
        }
    }

    async function fetchCourseEnrollments(courseId: number) {
        try {
            const response = await api.get(`/Course/${courseId}/enrollments`)
            return response.data
        } catch (error) {
            console.error('Failed to fetch course enrollments:', error)
            return []
        }
    }

    async function createCourse(courseData: any) {
        isLoading.value = true
        try {
            await api.post('/course', courseData)
            await fetchCourses()
            return true
        } catch (err: any) {
            error.value = err.response?.data?.error || err.message || 'Failed to create course'
            return false
        } finally {
            isLoading.value = false
        }
    }

    async function updateCourse(id: number, courseData: any) {
        isLoading.value = true
        try {
            await api.put(`/course/${id}`, courseData)
            await fetchCourses()
            return true
        } catch (err: any) {
            console.error('Failed to update course:', err)
            error.value = err.response?.data?.error || err.message || 'Failed to update course'
            return false
        } finally {
            isLoading.value = false
        }
    }

    async function deleteCourse(id: number) {
        isLoading.value = true
        try {
            await api.delete(`/course/${id}`)
            await fetchCourses()
            return true
        } catch (err: any) {
            console.error('Failed to delete course:', err)
            error.value = err.response?.data?.error || err.message || 'Failed to delete course'
            return false
        } finally {
            isLoading.value = false
        }
    }

    // --- DASHBOARD & ANALYTICS ---
    async function fetchDashboardStats() {
        isLoading.value = true
        try {
            const response = await api.get('/analytics/admin/dashboard')
            const data = response.data
            stats.value = {
                activeUsers: data.totalUsers || 0,
                activeCourses: data.totalCourses || 0,
                quizzesTaken: data.totalAttempts || 0,
                systemHealth: 'Optimal'
            }
        } catch (err: any) {
            console.error('Failed to fetch dashboard stats:', err)
        } finally {
            isLoading.value = false
        }
    }

    async function fetchActivityLogs(page = 1, pageSize = 20, filters: any = {}) {
        isLoading.value = true
        try {
            const params = new URLSearchParams()
            params.append('pageNumber', page.toString())
            params.append('pageSize', pageSize.toString())
            if (filters.userId) params.append('userId', filters.userId)
            if (filters.action) params.append('action', filters.action)
            if (filters.startDate) params.append('startDate', filters.startDate)
            if (filters.endDate) params.append('endDate', filters.endDate)

            const response = await api.get(`/activitylog?${params.toString()}`)
            const data = Array.isArray(response.data) ? response.data : response.data.items || []

            if (users.value.length === 0) {
                try {
                    const userRes = await api.get('/user/paged?pageNumber=1&pageSize=100')
                    if (userRes.data && userRes.data.items) {
                        users.value = userRes.data.items.map((u: any) => ({
                            id: u.userId,
                            name: u.fullName,
                            email: u.email,
                            role: u.roleName,
                            status: u.status,
                            lastActive: new Date(u.updatedAt).toLocaleString(),
                            avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                            username: u.student?.studentId || u.email.split('@')[0],
                            department: u.teacher?.department || u.department
                        }))
                    }
                } catch (e) {
                    console.error('Failed to fetch users for log resolution', e)
                }
            }

            logs.value = data.map((l: any) => {
                let userName = l.userName
                if (!userName && l.userId) {
                    const u = users.value.find(user => user.id === l.userId)
                    if (u) userName = u.name
                    else userName = `User #${l.userId}`
                }

                return {
                    id: l.logId || l.id,
                    timestamp: l.timestamp || l.createdAt,
                    type: l.action?.toLowerCase() || 'info',
                    user: userName || 'Unknown',
                    action: l.action,
                    details: l.description || '',
                    severity: 'info'
                }
            })

            recentActivity.value = logs.value.slice(0, 5).map(l => ({
                id: l.id,
                title: l.action,
                status: 'Completed', 
                icon: 'Activity', 
                user: l.user,
                date: new Date(l.timestamp).toLocaleDateString(),
                timeAgo: getTimeAgo(new Date(l.timestamp))
            }))

            totalLogs.value = data.length
        } catch (err: any) {
            console.error('Failed to fetch logs:', err)
        } finally {
            isLoading.value = false
        }
    }

    function getTimeAgo(date: Date) {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
        let interval = seconds / 31536000
        if (interval > 1) return Math.floor(interval) + " years ago"
        interval = seconds / 2592000
        if (interval > 1) return Math.floor(interval) + " months ago"
        interval = seconds / 86400
        if (interval > 1) return Math.floor(interval) + " days ago"
        interval = seconds / 3600
        if (interval > 1) return Math.floor(interval) + " hours ago"
        interval = seconds / 60
        if (interval > 1) return Math.floor(interval) + " minutes ago"
        return Math.floor(seconds) + " seconds ago"
    }

    async function fetchStudentsBySection(section: string) {
        try {
            const params = new URLSearchParams()
            params.append('pageNumber', '1')
            params.append('pageSize', '1000')
            params.append('role', 'Student')

            const response = await api.get(`/user/paged?${params.toString()}`)
            const data = response.data.items || []

            return data
                .map((u: any) => ({
                    id: u.userId,
                    name: u.fullName,
                    email: u.email,
                    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                    section: u.student?.section,
                    role: u.roleName
                }))
                .filter((u: any) => u.section === section)
        } catch (error) {
            console.error('Failed to fetch students by section:', error)
            return []
        }
    }
    async function fetchCourseQuizzes(courseId: number) {
        isLoading.value = true
        try {
            const authStore = useAuthStore()
            const userId = authStore.currentUser?.id
            if (!userId) {
                throw new Error('User not authenticated')
            }

            const response = await api.get(`/quiz/course/${courseId}?userId=${userId}&isStudent=false`)
            return response.data
        } catch (err: any) {
            console.error('Failed to fetch course quizzes:', err)
            error.value = err.message || 'Failed to fetch course quizzes'
            return []
        } finally {
            isLoading.value = false
        }
    }

    return {
        users,
        courses,
        stats,
        recentActivity,
        logs,
        isLoading,
        error,
        totalUsers,
        totalCourses,
        totalLogs,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        fetchCourses,
        createCourse,
        updateCourse,
        deleteCourse,
        fetchDashboardStats,
        fetchActivityLogs,
        fetchCourseEnrollments,
        fetchStudentsBySection,
        fetchCourseQuizzes
    }
})
