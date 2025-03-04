import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/LoginRegister.vue'
import Home from '@/views/HomeView.vue'
const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router
