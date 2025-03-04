<template>
  <div class="home-container">
    <div class="video-list">
      <div v-for="video in videoList" :key="video.id" class="video-card">
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
import { ref, onMounted } from 'vue'
import axios from '@/axios'
import { ElImage, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'


// 获取 userStore
const userStore = useUserStore()

ElMessage.success("用户id："+userStore.loginId)



// 定义视频数据接口
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
  views: number | null
}

// 状态管理
const videoList = ref<Video[]>([])
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const hasMore = ref(true)

// 获取视频列表
const fetchVideos = async (isLoadMore = false) => {
  if (loading.value || (!isLoadMore && !hasMore.value)) return

  loading.value = true
  try {
    const response = await axios.get('/videodisplay/video/getHomePageVideoList', {
      params: {
        page: page.value,
        pageSize: pageSize
      }
    })
    if (response.data.success) {
      const newVideos = response.data.data
      if (isLoadMore) {
        videoList.value = [...videoList.value, ...newVideos]
      } else {
        videoList.value = newVideos
      }
      // 如果返回的视频少于 pageSize，说明没有更多数据
      hasMore.value = newVideos.length === pageSize
      if (hasMore.value) page.value++ // 只有在有更多数据时才递增页码
    } else {
      console.error('获取视频列表失败:', response.data.message)
    }
  } catch (error) {
    console.error('请求视频列表出错:', error)
  } finally {
    loading.value = false
  }
}

// 时间格式化
const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 时长格式化（假设 duration 是秒数）
const formatDuration = (duration: number | null) => {
  if (!duration) return '未知'
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
}

// 检查滚动到底部
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const windowHeight = window.innerHeight
  const scrollHeight = document.documentElement.scrollHeight
  if (scrollTop + windowHeight >= scrollHeight - 50 && hasMore.value && !loading.value) {
    fetchVideos(true) // 加载更多
  }
}

// 初始化加载
onMounted(() => {
  fetchVideos() // 初次加载
  window.addEventListener('scroll', handleScroll) // 监听滚动事件
})

// 清理监听器
// onUnmounted(() => {
//   window.removeEventListener('scroll', handleScroll)
// })
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 一行5个 */
  gap: 20px;
}

.video-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
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