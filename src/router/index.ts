import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/TeacherView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('../views/QuizView.vue'),
    },
    {
      path: '/student',
      name: 'student',
      component: () => import('../views/StudentView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
    },
    {
      path: '/teacher/classes/:id',
      name: 'teacher-class',
      component: () => import('../views/TeacherClassView.vue'),
      props: true,
    },
    {
      path: '/teacher/classes/:id/dashboard',
      name: 'teacher-class-dashboard',
      component: () => import('../views/ClassroomDashboardView.vue'),
      props: true,
    },
  ],
})

export default router
