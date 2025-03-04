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
app.use(ElmentPlus)
const userStore = useUserStore()

axios.interceptors.request.use(
  (config) => {
    const token = userStore.token
    if (token) {
      console.log('设置satoken: ' + token) // 调试用
      config.headers['satoken'] = token // 设置 satoken 头
    }
    return config
  },
  (error) => Promise.reject(error)
)


// 配置响应拦截器

axios.interceptors.response.use(
  (response) => {
    console.log("re"+response) // 调试用
    if ( response.code === 401) {
      console.error('Token 过期或无效，请重新登录')
      userStore.logout()
      router.push('/login')
    }  
    return response
  },
  
  (error) => {
    if (error.response && error.response.code === 401) {
      console.error('Token 过期或无效，请重新登录')
      userStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

app.mount('#app')
