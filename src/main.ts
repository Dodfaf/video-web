// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import axios from './axios'
import 'element-plus/dist/index.css'
import ElmentPlus from 'element-plus'


const app = createApp(App)
const pinia = createPinia()
// app.use(createPinia())
app.use(router)
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
// 配置响应拦截器
const userStore = useUserStore()
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Token 过期或无效，请重新登录')
      userStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
app.use(ElmentPlus)
app.mount('#app')
