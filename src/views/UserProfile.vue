<template>
  <div class="profile-container">
    <NavBar />
    <div class="profile-content">
      <h1 class="profile-title">个人信息</h1>
      
      <el-card class="profile-card">
        <div class="avatar-section">
          <el-avatar :size="100" :src="userInfo.avatar" />
          <el-upload
            class="avatar-uploader"
            action="/auth/user/uploadAvatar"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <el-button size="small" type="primary">更换头像</el-button>
          </el-upload>
        </div>
        
        <el-form 
          :model="userInfo" 
          label-width="100px" 
          class="profile-form"
        >
          <el-form-item label="用户名">
            <el-input v-model="userInfo.userName" disabled />
          </el-form-item>
          
          <el-form-item label="昵称">
            <el-input v-model="userInfo.nickName" :disabled="!isEditing" />
          </el-form-item>
          
          <el-form-item label="邮箱">
            <el-input v-model="userInfo.email" :disabled="!isEditing" />
          </el-form-item>
          
          <el-form-item label="手机号">
            <el-input v-model="userInfo.phone" :disabled="!isEditing" />
          </el-form-item>
          
          <el-form-item label="性别">
            <el-radio-group v-model="userInfo.sex" :disabled="!isEditing">
              <el-radio :label="0">男</el-radio>
              <el-radio :label="1">女</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="个人简介">
            <el-input 
              v-model="userInfo.introduce" 
              type="textarea" 
              :rows="4" 
              placeholder="介绍一下自己吧"
              :disabled="!isEditing"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="startEditing" v-if="!isEditing">编辑信息</el-button>
            <template v-else>
              <el-button type="primary" @click="saveUserInfo">保存</el-button>
              <el-button @click="cancelEditing">取消</el-button>
            </template>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton, ElRadio, ElRadioGroup, ElCard, ElAvatar, ElUpload } from 'element-plus'
import NavBar from '@/components/NavBar.vue'
import axios from '@/axios'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isEditing = ref(false)
const originalUserInfo = ref({})

// 用户信息
const userInfo = ref({
  id: '',
  userName: '',
  status: 0,
  avatar: '',
  nickName: '',
  email: '',
  phone: '',
  sex: 1,
  introduce: ''
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await axios.post('/auth/user/getUserInfo', {
      id: userStore.loginId
    })
    
    if (response.data.success) {
      userInfo.value = response.data.data
      // 保存原始数据，用于取消编辑时恢复
      originalUserInfo.value = JSON.parse(JSON.stringify(response.data.data))
    } else {
      ElMessage.error('获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 开始编辑
const startEditing = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEditing = () => {
  // 恢复原始数据
  userInfo.value = JSON.parse(JSON.stringify(originalUserInfo.value))
  isEditing.value = false
}

// 保存用户信息
const saveUserInfo = async () => {
  try {
    const response = await axios.post('/auth/user/update', userInfo.value)
    
    if (response.data.success) {
      ElMessage.success('更新成功')
      isEditing.value = false
      // 更新原始数据
      originalUserInfo.value = JSON.parse(JSON.stringify(userInfo.value))
      
      // 更新用户存储中的信息
      if (userInfo.value.avatar) {
        userStore.avatar = userInfo.value.avatar
      }
      if (userInfo.value.nickName) {
        userStore.nickName = userInfo.value.nickName
      }
    } else {
      ElMessage.error('更新失败: ' + response.data.message)
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    ElMessage.error('更新用户信息失败')
  }
}

// 头像上传成功
const handleAvatarSuccess = (response, file) => {
  if (response.success) {
    userInfo.value.avatar = response.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error('头像上传失败')
  }
}

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  padding-top: 60px;
}

.profile-content {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.profile-title {
  text-align: center;
  margin-bottom: 30px;
  color: #409EFF;
}

.profile-card {
  margin-bottom: 20px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-uploader {
  margin-top: 15px;
}

.profile-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>