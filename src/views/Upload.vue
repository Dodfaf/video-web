<template>
    <div class="upload-page">
      <nav-bar />
      <div class="upload-container">
        <h1>上传视频</h1>
  
        <!-- 第一步：上传视频 -->
        <div v-if="!videoUploaded" class="upload-video-section">
          <el-upload
            drag
            accept="video/mp4"
            :http-request="uploadVideoToMinio"
            :show-file-list="false"
            :before-upload="beforeVideoUpload"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将视频文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip">仅支持 MP4 格式，文件大小不超过 500MB</div>
          </el-upload>
        </div>
  
        <!-- 第二步：填写信息 -->
        <div v-if="videoUploaded" class="video-info-section">
          <el-form ref="formRef" :model="videoForm" :rules="rules" label-width="100px">
            <!-- 视频预览 -->
            <el-form-item label="视频预览">
              <video
                ref="videoPreview"
                controls
                :src="videoUrl"
                crossOrigin="anonymous"
                class="video-preview"
                @loadedmetadata="onVideoLoaded"
              />
            </el-form-item>
  
            <!-- 时长显示（可选） -->
            <el-form-item label="视频时长">
              <span>{{ formatDuration(videoForm.duration) }}</span>
            </el-form-item>
  
            <!-- 标题 -->
            <el-form-item label="标题" prop="videoTitle">
              <el-input v-model="videoForm.videoTitle" placeholder="请输入视频标题" />
            </el-form-item>
  
            <!-- 封面 -->
            <el-form-item label="封面" prop="coverUrl">
              <div class="cover-options">
                <el-upload
                  accept="image/jpeg,image/png"
                  :http-request="uploadCoverToMinio"
                  :show-file-list="false"
                  :before-upload="beforeCoverUpload"
                >
                  <el-button type="primary">上传封面</el-button>
                </el-upload>
                <el-button type="info" @click="captureFrame">截取视频帧</el-button>
                <img v-if="videoForm.coverUrl" :src="videoForm.coverUrl" class="cover-preview" />
              </div>
            </el-form-item>
  
            <!-- 分区 -->
            <el-form-item label="分区" prop="categoryId">
              <el-select v-model="videoForm.categoryId" placeholder="请选择分区">
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.categoryName"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
  
            <!-- 简介 -->
            <el-form-item label="简介" prop="description">
              <el-input
                type="textarea"
                v-model="videoForm.description"
                placeholder="请输入视频简介"
                :rows="4"
              />
            </el-form-item>
  
            <!-- 提交按钮 -->
            <el-form-item>
              <el-button type="primary" @click="submitVideoInfo">提交</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    ElUpload,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElSelect,
    ElOption,
    ElMessage,
    type FormInstance
  } from 'element-plus'
  import axios from '@/axios'
  import { useUserStore } from '@/stores/user'
  import NavBar from '@/components/NavBar.vue'
  
  const router = useRouter()
  const userStore = useUserStore()
  
  // 视频上传状态
  const videoUploaded = ref(false)
  const videoUrl = ref('')
  const videoPreview = ref<HTMLVideoElement | null>(null)
  
  // 表单数据，添加 duration 字段
  const videoForm = ref({
    videoTitle: '',
    upId: userStore.loginId,
    videoUrl: '',
    coverUrl: '',
    createTime: new Date().toISOString(),
    description: '',
    categoryId: undefined as number | undefined,
    duration: 0 // 新增 duration 字段，初始值为 0
  })
  
  // 表单校验规则
  const rules = ref({
    videoTitle: [{ required: true, message: '请输入视频标题', trigger: 'blur' }],
    coverUrl: [{ required: true, message: '请上传封面', trigger: 'change' }],
    categoryId: [{ required: true, message: '请选择分区', trigger: 'change' }]
  })
  
  // 分区列表
  const categories = ref<{ id: number; categoryName: string; isDeteled: number }[]>([])
  
  // 表单引用
  const formRef = ref<FormInstance>()
  
  // 上传视频到 MinIO
  const uploadVideoToMinio = async (options: any) => {
    const file = options.file
    const formData = new FormData()
    formData.append('uploadFile', file)
    formData.append('bucket', 'video')
    formData.append('objectName', `user${userStore.loginId}`)
  
    try {
      const response = await axios.post('http://localhost:5000/oss/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000 // 增加超时时间到 60 秒
      })
      if (response.data.success) {
        videoUrl.value = response.data.data
        videoForm.value.videoUrl = videoUrl.value
        videoUploaded.value = true
        ElMessage.success('视频上传成功，请填写信息')
      } else {
        ElMessage.error('视频上传失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('视频上传错误:', error)
      ElMessage.error('视频上传失败')
    }
  }
  
  // 上传封面到 MinIO
  const uploadCoverToMinio = async (options: any) => {
    const file = options.file
    const formData = new FormData()
    formData.append('uploadFile', file)
    formData.append('bucket', 'cover')
    formData.append('objectName', `user${userStore.loginId}`)
  
    try {
      const response = await axios.post('http://localhost:5000/oss/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (response.data.success) {
        videoForm.value.coverUrl = response.data.data
        ElMessage.success('封面上传成功')
      } else {
        ElMessage.error('封面上传失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('封面上传错误:', error)
      ElMessage.error('封面上传失败')
    }
  }
  
  // 截取视频帧作为封面
  const captureFrame = () => {
    if (!videoPreview.value) return
    const canvas = document.createElement('canvas')
    canvas.width = videoPreview.value.videoWidth
    canvas.height = videoPreview.value.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoPreview.value, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const file = new File([blob], `cover_${userStore.loginId}_${Date.now()}.png`, { type: 'image/png' })
            const formData = new FormData()
            formData.append('uploadFile', file)
            formData.append('bucket', 'cover')
            formData.append('objectName', `${userStore.loginId}/${file.name}`)
  
            try {
              const response = await axios.post('http://localhost:5000/oss/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              })
              if (response.data.success) {
                videoForm.value.coverUrl = response.data.data
                ElMessage.success('封面截取并上传成功')
              }
            } catch (error) {
              console.error('截图上传错误:', error)
              ElMessage.error('封面截取失败')
            }
          }
        },
        'image/png',
        0.95
      )
    }
  }
  
  // 获取分区列表
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/videodisplay/videoCategory/getAll')
      if (response.data.success) {
        categories.value = response.data.data.filter((cat: any) => cat.isDeteled === 0)
      }
    } catch (error) {
      console.error('获取分区失败:', error)
      ElMessage.error('加载分区失败')
    }
  }
  
  // 提交视频信息
  const submitVideoInfo = () => {
    if (!formRef.value) return
    formRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          const response = await axios.post('http://localhost:5000/videodisplay/video/uploadVideo', videoForm.value)
          if (response.data.success) {
            ElMessage.success('视频信息提交成功')
            router.push('/home')
          } else {
            ElMessage.error('提交失败: ' + response.data.message)
          }
        } catch (error) {
          console.error('提交视频信息错误:', error)
          ElMessage.error('提交失败')
        }
      }
    })
  }
  
  // 视频上传前校验
  const beforeVideoUpload = (file: File) => {
    const isMp4 = file.type === 'video/mp4'
    const isLt500M = file.size / 1024 / 1024 /1024 < 2
    if (!isMp4) ElMessage.error('仅支持 MP4 格式')
    if (!isLt500M) ElMessage.error('视频大小不能超过 2GB')
    return isMp4 && isLt500M
  }
  
  // 封面上传前校验
  const beforeCoverUpload = (file: File) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isImage) ElMessage.error('仅支持 JPG/PNG 格式')
    if (!isLt10M) ElMessage.error('封面大小不能超过 10MB')
    return isImage && isLt10M
  }
  
  // 视频加载完成时获取时长
  const onVideoLoaded = () => {
    if (videoPreview.value) {
      videoPreview.value.currentTime = 1 // 设置默认预览时间
      const duration = Math.round(videoPreview.value.duration) // 获取时长（秒），四舍五入为整数
      videoForm.value.duration = duration // 更新到表单
      console.log('视频时长:', duration)
    }
  }
  
  // 格式化时长显示（可选）
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`
  }
  
  onMounted(() => {
    fetchCategories()
  })
  </script>
  
  <style scoped>
  .upload-page {
    padding-top: 60px;
  }
  
  .upload-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .upload-video-section {
    text-align: center;
  }
  
  .video-info-section {
    margin-top: 20px;
  }
  
  .video-preview {
    width: 100%;
    max-height: 400px;
    margin-bottom: 20px;
  }
  
  .cover-options {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .cover-preview {
    width: 100px;
    height: 100px;
    object-fit: cover;
    margin-top: 10px;
  }
  
  .el-upload__tip {
    color: #999;
    font-size: 12px;
  }
  </style>