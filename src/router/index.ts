import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/LoginRegister.vue'
import Home from '@/views/HomeView.vue'
import Upload from '@/views/Upload.vue'
import Admin from '@/views/Admin.vue'
import MyVideos from '@/views/MyVideos.vue'
import SearchResults from '@/views/SearchResults.vue'
import Collection from '@/views/CollectionView.vue'
import UserProfile from '@/views/UserProfile.vue'
import UserManagement from '@/views/UserManagement.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login },
  { path: '/home', component: Home },
  { 
    path: '/video/:videoId', 
    component: () => import('@/views/Player.vue'),
    props: true // 传递路由参数到组件
  },
  { path: '/upload', name: 'Upload', component: Upload },
  { path: '/admin', name: 'Admin', component: Admin },
  { path: '/my_videos', name: 'MyVideos', component: MyVideos },
  { path: '/search', name: 'SearchResults', component: SearchResults },
  { path: '/collection', name: 'Collection', component: Collection },
  { path: '/profile', name: 'UserProfile', component: UserProfile },
  { path: '/user-management', name: 'UserManagement', component: UserManagement }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router
