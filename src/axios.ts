// src/axios.ts
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 创建一个 Axios 实例
const instance = axios.create({
  baseURL: 'http://localhost:5000', // 设置基础 URL
  timeout: 10000, // 设置请求超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：每次请求前都自动添加 token
// instance.interceptors.request.use(
//   (config) => {
//     const userStore = useUserStore()
    
//     const token = userStore.token
//     if (token) {
//       // 如果 token 存在，添加到 Authorization 头中
//       ElMessage.success('请求拦截器'+token)
//       config.headers.satoken = `${token}`
//     }
//     return config
//   },
//   (error) => {
//     // 请求错误时的处理
//     return Promise.reject(error)
//   }
// )

// // 响应拦截器（可选）：处理响应中的错误（例如 token 过期，401 未授权）
// instance.interceptors.response.use(
//   (response) => {
//     // 正常响应，直接返回数据
//     return response
//   },
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // 如果是 401 未授权，可能是 token 过期，跳转到登录页
//       console.error('Token 过期或无效，请重新登录')
//       // 可以做跳转逻辑
//     }
//     return Promise.reject(error)
//   }
// )

export default instance
