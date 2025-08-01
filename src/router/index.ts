import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/network',
    name: 'network',
    component: () => import('@/views/NetworkView.vue')
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('@/views/CategoryView.vue')
  },
  {
    path: '/company/:id',
    name: 'company-details',
    component: () => import('@/views/CompanyDetails.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
