<template>
    <div class="auth-container">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="登录" name="login">
          <el-form :model="form" ref="loginForm" label-width="100px">
            <el-form-item label="用户名" prop="userName" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
              <el-input v-model="form.userName" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleLogin">登录</el-button>
              <span class="switch-tab" @click="switchTab('register')">没有账号？注册</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>
  
        <el-tab-pane label="注册" name="register">
          <el-form :model="form" ref="registerForm" label-width="100px">
            <el-form-item label="用户名" prop="userName" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
              <el-input v-model="form.userName" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleRegister">注册</el-button>
              <span class="switch-tab" @click="switchTab('login')">已有账号？登录</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useUserStore } from '@/stores/user'
  import { useRouter } from 'vue-router'
  import { ElForm, ElTabPane, ElTabs, ElInput, ElButton, ElFormItem, ElMessage } from 'element-plus'
  const router = useRouter()
  const userStore = useUserStore()
  
  const activeTab = ref('login')
  const form = ref({
    userName: '',
    password: ''
  })
  const loginForm = ref<InstanceType<typeof ElForm>>()
  const registerForm = ref<InstanceType<typeof ElForm>>()
  
  const handleLogin = async () => {
    loginForm.value?.validate(async (valid) => {
      if (valid) {
        const { userName, password } = form.value
        const success = await userStore.login(userName, password)
        if (success) {
          console.log('登录成功，Token:', userStore.token)
          console.log('登录ID:', userStore.loginId)
          router.push('/home')
          console.log('跳转完成')
        } else {
            ElMessage({
                message: '用户名或密码错误',
                type: 'error',
                plain: true,
            })
        }
      }
    })
  }
  
  const handleRegister = async () => {
    registerForm.value?.validate(async (valid) => {
      if (valid) {
        const { userName, password } = form.value
        const success = await userStore.register(userName, password)
        if (success) {
          alert('注册成功，请登录！')
          activeTab.value = 'login'
          form.value = { userName: '', password: '' } // 重置表单
        } else {
          alert('注册失败')
        }
      }
    })
  }
  
  const switchTab = (tab: 'login' | 'register') => {
    activeTab.value = tab
    form.value = { userName: '', password: '' } // 重置表单
  }
  </script>
  
  <style scoped>
  .auth-container {
    max-width: 400px;
    margin: 50px auto;
  }
  
  .switch-tab {
    color: #409eff;
    cursor: pointer;
    text-decoration: underline;
  }
  </style>