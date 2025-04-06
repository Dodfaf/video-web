<template>
  <div class="player-container">
    <NavBar></NavBar>
    <div class="main-content">
      <!-- 左侧：视频和视频信息 -->
      <div class="left-column">
        <VideoPlayerComponent 
          ref="videoPlayerRef"
          :video="video" 
          :danmakuList="danmakuList"
          :danmakuDensity="danmakuDensity"
          @update-active-danmaku="updateActiveDanmaku"
        />
        
        <VideoInfoComponent 
          v-if="video" 
          :video="video" 
          :danmakuCount="danmakuList.length"
          :uploader="uploader" 
          @send-danmaku="handleSendDanmaku"
          @density-change="handleDensityChange"
        />

        <!-- 评论模块 -->
        <div class="video-comment-section" v-if="videoId !== null">
          <h3>评论</h3>
          <VideoComment :videoId="videoId" />
        </div>
      </div>

      <!-- 右侧：弹幕列表和推荐视频 -->
      <div class="right-column">
        <DanmakuPanelComponent :danmakuList="danmakuList" />
        <RecommendedVideosComponent />
      </div>
    </div>
    <div v-if="!video" class="loading">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import '@/css/Player.css'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/axios'
import { ElMessage } from 'element-plus'
import NavBar from '@/components/NavBar.vue'
import VideoComment from '@/components/VideoComment.vue'

// 导入拆分后的组件
import VideoPlayerComponent from '@/components/player/VideoPlayerComponent.vue'
import VideoInfoComponent from '@/components/player/VideoInfoComponent.vue'
import DanmakuPanelComponent from '@/components/player/DanmakuPanelComponent.vue'
import RecommendedVideosComponent from '@/components/player/RecommendedVideosComponent.vue'



// 接口定义
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
// 添加UP主信息接口
interface Uploader {
  id: number
  userName: string
  status: number
  avatar: string
  nickName: string
  email: string | null
  phone: string | null
  password: string
  sex: number
  introduce: string
}
interface Danmaku {
  id: number
  userId: number
  videoId: number
  content: string
  sendTime: number
  color: string | null
  position: string | null
  type: number
  createBy: string | null
  createTime: string | null
}

const route = useRoute()
const video = ref<Video | null>(null)
const videoId = ref<number | null>(null)
const danmakuList = ref<Danmaku[]>([])
const danmakuDensity = ref<'normal' | 'overlap'>('normal')
const videoPlayerRef = ref(null)
let socket: WebSocket | null = null
const activeDanmaku = ref<Map<number, { element: HTMLElement; animation: Animation }>>(new Map())


// 添加UP主信息
const uploader = ref<Uploader | null>(null)



const fetchVideo = async () => {
  const videoIdStr = route.params.videoId as string
  const videoIdValue = Number(videoIdStr.replace('vv', ''))
  videoId.value = videoIdValue
  try {
    const response = await axios.post('/videodisplay/video/getVideoInfo', { id: videoId.value })
    if (response.data.success) {
      video.value = response.data.data
      fetchDanmakuHistory(videoId.value)
      setupWebSocket(videoId.value)
       // 获取到视频信息后，获取UP主信息
       if (video.value?.upId) {
        fetchUploaderInfo(video.value.upId)
      }
    }
  } catch (error) {
    console.error('请求视频出错:', error)
    ElMessage.error('加载视频失败')
  }
}




// 添加获取UP主信息的方法
const fetchUploaderInfo = async (upId: number) => {
  try {
    const response = await axios.post('/auth/user/getUserInfo', { id: upId })
    if (response.data.success) {
      uploader.value = response.data.data
    }
  } catch (error) {
    console.error('获取UP主信息失败:', error)
    ElMessage.error('获取UP主信息失败')
  }
}


const fetchDanmakuHistory = async (videoId: number) => {
  try {
    const response = await axios.get('/videodisplay/danmaku/history', { params: { videoId } })
    if (response.data.success) {
      danmakuList.value = response.data.data.map((item: any) => ({
        ...item,
        sendTime: Number(item.sendTime)
      }))
    }
  } catch (error) {
    console.error('获取历史弹幕失败:', error)
    ElMessage.error('获取弹幕失败')
  }
}

const setupWebSocket = (videoId: number) => {
  socket = new WebSocket(`ws://localhost:8181/danmaku/websocket/${videoId}`)
  socket.onopen = () => console.log('WebSocket 已连接')
  socket.onmessage = (event) => {
    const danmaku: Danmaku = JSON.parse(event.data)
    danmaku.sendTime = Number(danmaku.sendTime)
    danmakuList.value.push(danmaku)
  }
  socket.onclose = () => console.log('WebSocket 已断开')
  socket.onerror = (error) => console.error('WebSocket 错误:', error)
}

const handleSendDanmaku = (content: string) => {
  if (!content || !socket || socket.readyState !== WebSocket.OPEN) return
  
  const currentTime = videoPlayerRef.value?.videoPlayer?.currentTime || 0
  const danmaku: Danmaku = {
    id: 0,
    userId: 1,
    videoId: videoId.value as number,
    content: content,
    sendTime: Number(currentTime.toFixed(3)),
    color: '#ffffff',
    position: 'scroll',
    type: 0,
    createBy: 'user',
    createTime: new Date().toISOString()
  }
  socket.send(JSON.stringify(danmaku))
}

const handleDensityChange = (density: 'normal' | 'overlap') => {
  danmakuDensity.value = density
}

const updateActiveDanmaku = (newActiveDanmaku) => {
  activeDanmaku.value = newActiveDanmaku
}
//监听改变标签页标题
watch(video, (newVal) => {
  if (newVal) {
    document.title = newVal.videoTitle
  }
})
onMounted(() => {
  fetchVideo()
})

onUnmounted(() => {
  if (socket) socket.close()
})
</script>

<style>
.player-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 60px;
}

.main-content {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.left-column {
  flex: 1;
  min-width: 0;
}

.right-column {
  width: 300px;
  flex-shrink: 0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 18px;
  color: #666;
}

.video-comment-section {
  margin-top: 20px;
  width: 100%;
}
</style>