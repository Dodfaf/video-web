<template>
  <div class="home-container">
    <NavBar></NavBar>
    
    <!-- 分区导航 -->
    <div class="category-nav">
      <el-button 
        :type="selectedCategory === null ? 'primary' : 'default'" 
        @click="changeCategory(null)"
        class="category-btn"
      >
        全部
      </el-button>
      <el-button 
        v-for="category in categories" 
        :key="category.id"
        :type="selectedCategory === category.id ? 'primary' : 'default'"
        @click="changeCategory(category.id)"
        class="category-btn"
      >
        {{ category.categoryName }}
      </el-button>
    </div>
    
    <div class="video-list">
      <div v-for="video in videoList" :key="video.id" class="video-card" @click="goToVideo(video.id)">
        <el-image :src="video.coverUrl" class="video-cover" fit="cover" />
        <div class="video-info">
          <h3 class="video-title">{{ video.videoTitle }}</h3>
          <p class="video-meta">
            <span>{{ formatTime(video.createTime) }}</span> |
            <span>作者: {{ video.createBy || '未知' }}</span> |
            <span>时长: {{ formatDuration(video.duration) }}</span>
          </p>
        </div>
      </div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="!hasMore" class="no-more">没有更多视频了</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/axios'
import { ElImage, ElButton } from 'element-plus'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar.vue'


interface Video {
  id: number
  videoTitle: string
  upId: number
  videoUrl: string
  status: number
  coverUrl: string
  likes: number
  favorites: number
  createBy: string | null
  createTime: string
  updateBy: string | null
  updateTime: string | null
  isDeleted: number | null
  duration: number | null
  description: string | null
}

interface Category {
  id: number
  categoryName: string
  isDeteled: number
}

const userStore = useUserStore()
const router = useRouter()
const videoList = ref<Video[]>([])
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const hasMore = ref(true)
const categories = ref<Category[]>([])
const selectedCategory = ref<number | null>(null)

// 获取分区列表
const fetchCategories = async () => {
  try {
    const response = await axios.get('/videodisplay/videoCategory/getAll')
    if (response.data.success) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('获取分区列表失败:', error)
  }
}

const fetchVideos = async (isLoadMore = false) => {
  if (loading.value || (!isLoadMore && !hasMore.value) || !userStore.isLogin) return

  loading.value = true
  try {
    let response;
    
    // 根据是否选择分区调用不同的接口
    if (selectedCategory.value === null) {
      // 全部分区，使用原来的接口
      const params = { 
        page: page.value, 
        pageSize 
      }
      response = await axios.get('/videodisplay/video/getHomePageVideoList', {
        params: params
      })
    } else {
      // 特定分区，使用新接口
      response = await axios.post('/videodisplay/video/getVideosByCategory', {
        categoryId: selectedCategory.value
      })
      console.log(response.data)
    }
    
    if (response.data.success) {
      let newVideos;
      
      // 处理不同接口返回的数据结构
      if (selectedCategory.value === null) {
        // 原接口直接返回视频数组
        newVideos = response.data.data;
      } else {
        // 新接口返回分页对象，需要取content字段
        newVideos = response.data.data.content;
      }
      
      videoList.value = isLoadMore ? [...videoList.value, ...newVideos] : newVideos
      
      // 判断是否还有更多数据
      if (selectedCategory.value === null) {
        // 原接口的判断逻辑
        hasMore.value = newVideos.length === pageSize
      } else {
        // 新接口的判断逻辑
        const pageInfo = response.data.data;
        hasMore.value = !pageInfo.last;
      }
      
      if (hasMore.value) page.value++
    }
  } catch (error) {
    console.error('请求视频列表出错:', error)
  } finally {
    loading.value = false
  }
}

// 切换分区
const changeCategory = (categoryId: number | null) => {
  if (selectedCategory.value === categoryId) return
  
  selectedCategory.value = categoryId
  page.value = 1
  videoList.value = []
  hasMore.value = true
  fetchVideos()
}

const goToVideo = (videoId: number) => {
  router.push(`/video/vv${videoId}`)
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatDuration = (duration: number | null) => {
  if (!duration) return '未知'
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
}

const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const windowHeight = window.innerHeight
  const scrollHeight = document.documentElement.scrollHeight
  if (scrollTop + windowHeight >= scrollHeight - 50 && hasMore.value && !loading.value) {
    fetchVideos(true)
  }
}

onMounted(() => {
  if (userStore.isLogin) {
    fetchCategories()
    fetchVideos()
    window.addEventListener('scroll', handleScroll)
  } else {
    router.push('/login')
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.home-container {
  /* padding: 20px; */
  padding-top: 70px; /* 避免导航栏遮挡 */
}

/* 分区导航样式 */
.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 8px;
  margin: 0 20px 20px 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.category-btn {
  min-width: 80px;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  padding: 0 20px;
}

.video-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer; /* 增加手型光标 */
}

.video-card:hover {
  transform: translateY(-5px);
}

.video-cover {
  width: 100%;
  height: 150px;
}

.video-info {
  padding: 10px;
}

.video-title {
  font-size: 16px;
  margin: 0 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-meta {
  font-size: 12px;
  color: #666;
}

.loading,
.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>