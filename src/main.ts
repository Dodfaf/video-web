// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import axios from './axios'
import 'element-plus/dist/index.css'
import ElmentPlus, { ElMessage } from 'element-plus'


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
    console.log("响应数据: ", response.data) // 调试用
    const { code, message } = response.data
    if (code === 401) {
      userStore.loginId = null
      userStore.userName = null
      userStore.isLogin = false
      ElMessage.error("登录过期，请重新登录！")
      router.push('/login')
    }
    return response
  },
  
  (error) => {
    if (error.response) {
      const { code, message } = error.response.data || {}
      if (error.response.status === 401 || code === 401) {
        console.error('Token 过期或无效，请重新登录: ' + (message || error.message))
        router.push('/login')
      }
    } else {
      console.error('网络错误: ' + error.message)
    }
    return Promise.reject(error)
  }
)

app.mount('#app')
