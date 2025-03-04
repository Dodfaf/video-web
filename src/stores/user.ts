// src/store/user.ts
import { defineStore } from 'pinia'
import axios from '@/axios'  // 引入自定义的 axios 实例
import { parseCommandLine } from 'typescript'

interface UserState {
  token: string | null
  loginId: string | null
  isLogin: boolean
  userName: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: null,
    loginId: null,
    isLogin: false,
    userName: null
  }),
  actions: {
    // 注册
    async register(userName: string, password: string) {
      try {
        const response = await axios.post('/auth/user/register', {
          userName,
          password
        })
        if (response.data.success) {
          return true
        } else {
          throw new Error('注册失败')
        }
      } catch (error) {
        console.error('注册失败', error)
        return false
      }
    },
    // 登录
    async login(userName: string, password: string) {
      try {
        const response = await axios.post('/auth/user/doLogin', {
            userName,
            password
        })
        if (response.data.success) {
          const { tokenValue, loginId } = response.data.data
          this.token = tokenValue  // 存储 token
          this.loginId = loginId    // 存储 loginId
          this.isLogin = true
          this.userName = userName
          return true
        } else {
          throw new Error('登录失败')
        }
      } catch (error) {
        console.error('登录失败', error)
        return false
      }
    },
    // 退出登录
    async logout() {
        try {
            const response = await axios.post('/auth/user/logOut', {
                params:{
                    loginId: this.loginId
                }
            })
            if (response.data.success) {
                this.token = null
                this.loginId = null
                this.isLogin = false
                this.userName = null
                return true
            } else {
              throw new Error('登出失败')
            }
          } catch (error) {
            console.error('登出失败', error)
            return false
          }
      
    }
  },
  persist: true
})
