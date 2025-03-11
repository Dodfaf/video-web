<template>
    <div class="navbar">
      <!-- 左侧：首页按钮 -->
      <div class="navbar-left">
        <el-button type="primary" @click="goToHome">首页</el-button>
      </div>
  
      <!-- 中间：搜索框 -->
      <div class="navbar-center">
        <el-input v-model="searchQuery" placeholder="搜索视频..." @keyup.enter="handleSearch">
          <template #append>
            <el-button icon="el-icon-search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
  
      <!-- 右侧：头像和投稿按钮 -->
      <div class="navbar-right">
        
        <el-dropdown trigger="hover" @command="handleDropdownCommand">
          <span class="avatar-wrapper">
            <img :src="avatarUrl" alt="头像" class="avatar" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="my_video">个人视频</el-dropdown-item>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="logout">登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="success" @click="goToUpload">投稿</el-button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElButton, ElInput, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessage } from 'element-plus'
  import { useUserStore } from '@/stores/user' // 假设 userStore 在此路径
  import axios from '@/axios'
  
  const router = useRouter()
  const userStore = useUserStore()
  
  // 搜索框输入
  const searchQuery = ref('')
  
  // 头像 URL（假设从 userStore 获取，若无则用默认值）
  const avatarUrl = ref(userStore.avatar || 'http://192.168.10.135:9000/avatars/Honkai%20%20Star%20Rail%20Screenshot%202024.07.31%20-%2015.29.50.75.png')
  
  // 跳转到首页
  const goToHome = () => {
    router.push('/home')
  }
  
  // 跳转到上传页面
  const goToUpload = () => {
    router.push('/upload')
  }
  
  // 处理搜索（待后端对接）
  const handleSearch = () => {
    if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
  } else {
    ElMessage.warning('请输入搜索关键词')
  }
  }
  
  // 处理下拉菜单命令
  const handleDropdownCommand = async (command: string) => {
    if (command === 'profile') {
      router.push('/profile') // 假设个人信息页面为 /profile
    }else if(command === 'my_video'){
        router.push('/my_videos')

    } else if (command === 'logout') {
      try {
        // const loginId = userStore.loginId
        userStore.logout() // 清空用户状态
        router.push('/login') // 跳转到登录页面
      } catch (error) {
        console.error('登出失败:', error)
        ElMessage.error('登出失败，请重试')
      }
    }
  }
  </script>
  
  <style scoped>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }
  
  .navbar-left {
    flex: 0 0 auto;
  }
  
  .navbar-center {
    flex: 1;
    max-width: 500px;
    margin: 0 20px;
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .avatar-wrapper {
    display: inline-block;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .el-dropdown-menu {
    min-width: 100px;
  }
  </style>