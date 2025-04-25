<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">视频弹幕系统</h1>
      <el-tabs v-model="activeTab" type="border-card" class="auth-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form :model="form" ref="loginForm" label-width="80px" class="auth-form">
            <el-form-item label="用户名" prop="userName" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
              <el-input v-model="form.userName" placeholder="请输入用户名" prefix-icon="User" />
            </el-form-item>
            <el-form-item label="密码" prop="password" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-form-item class="auth-actions">
              <el-button type="primary" @click="handleLogin" class="auth-button">登录</el-button>
              <div class="switch-tab" @click="switchTab('register')">没有账号？注册</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form :model="form" ref="registerForm" label-width="80px" class="auth-form">
            <el-form-item label="用户名" prop="userName" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
              <el-input v-model="form.userName" placeholder="请输入用户名" prefix-icon="User" />
            </el-form-item>
            <el-form-item label="密码" prop="password" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-form-item class="auth-actions">
              <el-button type="primary" @click="handleRegister" class="auth-button">注册</el-button>
              <div class="switch-tab" @click="switchTab('login')">已有账号？登录</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElForm, ElTabPane, ElTabs, ElInput, ElButton, ElFormItem, ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { el } from 'element-plus/es/locales.mjs'
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

onMounted(() => {
  if(activeTab.value === 'login') {
    document.title = "登陆页面"
  }
  else{
    document.title = "注册页面"
  }
})
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.auth-card {
  width: 450px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  background-color: white;
  overflow: hidden;
}

.auth-title {
  text-align: center;
  margin: 20px 0;
  color: #409eff;
  font-size: 24px;
  font-weight: 600;
}

.auth-tabs {
  border: none;
}

.auth-form {
  padding: 20px 10px;
}

.auth-actions {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.switch-tab {
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.3s;
}

.switch-tab:hover {
  color: #66b1ff;
  text-decoration: underline;
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
}

:deep(.el-tabs__nav) {
  width: 100%;
  display: flex;
}

:deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
  font-size: 16px;
  padding: 15px 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  padding: 8px 15px;
  border-radius: 6px;
}
</style>