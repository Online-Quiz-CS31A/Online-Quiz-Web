import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
    },
    {
    path: '/subject',
    name: 'subject',
    component: () => import('../views/SubjectView.vue'),
    },
    {
    path: '/manager',
    name: 'manager',
    component: () => import('../views/ManagerView.vue'),
    },

  ],
})

export default router
