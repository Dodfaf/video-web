<template>
  <div class="player-container">
    <NavBar></NavBar>
    <div class="main-content">
      <!-- 左侧：视频和视频信息 -->
      <div class="left-column">
        <div class="video-wrapper">
          <video
            ref="videoPlayer"
            controls
            autoplay
            @timeupdate="updateDanmaku"
            @fullscreenchange="handleFullscreenChange"
            class="video-element"
          >
            <source :src="video?.videoUrl" type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
          <div ref="danmakuContainer" class="danmaku-container"></div>
        </div>
        
        <div class="video-info-section" v-if="video">
          <div class="video-title-row">
            <h1>{{ video.videoTitle }}</h1>
            <div class="video-stats">
              <span class="play-count">播放: 0</span>
              <span class="danmu-count">弹幕: {{ danmakuList.length }}</span>
              <span class="publish-time">{{ formatTime(video.createTime) }}</span>
            </div>
          </div>
          
          <div class="uploader-info">
            <div class="uploader-avatar">
              <img src="https://via.placeholder.com/40" alt="用户头像" />
            </div>
            <div class="uploader-details">
              <div class="uploader-name">{{ video.createBy || '未知' }}</div>
              <div class="uploader-fans">粉丝: 0</div>
            </div>
            <el-button type="primary" size="small" class="follow-btn">关注</el-button>
          </div>
          
          <div class="video-description">
            <p>{{ video.description || '暂无简介' }}</p>
          </div>
          
          <div class="danmaku-controls">
            <el-select v-model="danmakuDensity" placeholder="弹幕密度" size="small">
              <el-option label="正常（不重叠）" value="normal"></el-option>
              <el-option label="重叠" value="overlap"></el-option>
            </el-select>
            <el-input v-model="danmakuInput" placeholder="发送弹幕" @keyup.enter="sendDanmaku"></el-input>
            <el-button type="primary" @click="sendDanmaku">发送</el-button>
          </div>
        </div>


              <!-- 评论模块  -->
        <div class="video-comment-section" v-if="videoId !== null">
          <h3>评论</h3>
          <VideoComment :videoId="videoId" />
        </div>
      </div>




      <!-- 右侧：弹幕列表和推荐视频 -->
      <div class="right-column">
        <!-- 弹幕面板 - 可折叠 -->
        <div class="danmu-panel" :class="{ 'danmu-collapsed': !isDanmuExpanded }">
          <div class="danmu-header" @click="toggleDanmuPanel">
            <span>弹幕列表 ({{ danmakuList.length }})</span>
            <el-icon :class="{ 'rotate-180': isDanmuExpanded }">
              <ArrowDown />
            </el-icon>
          </div>
          <div class="danmu-content" v-show="isDanmuExpanded">
            <div class="sort-options">
              <el-radio-group v-model="sortBy" @change="sortDanmuList" size="small">
                <el-radio label="sendTime">按弹幕时间</el-radio>
                <el-radio label="createTime">按创建时间</el-radio>
              </el-radio-group>
            </div>
            <div class="danmu-list">
              <div v-for="danmu in danmakuList" :key="danmu.id" class="danmu-item">
                <span class="danmu-time">{{ formatDanmuTime(danmu.sendTime) }}</span>
                <span class="danmu-content-text">{{ danmu.content }}</span>
                <span class="danmu-create-time">{{ formatCreateTime(danmu.createTime) }}</span>
              </div>
              <div v-if="danmakuList.length === 0" class="no-danmu">暂无弹幕</div>
            </div>
          </div>
        </div>
        
        <!-- 推荐视频区域 -->
        <div class="recommended-videos">
          <h3>推荐视频</h3>
          <div class="video-preview-list">
            <div class="video-preview" v-for="i in 5" :key="i">
              <div class="video-preview-img">
                <img src="https://via.placeholder.com/160x90" alt="视频预览" />
                <span class="video-duration">03:45</span>
              </div>
              <div class="video-preview-info">
                <p class="video-preview-title">示例推荐视频标题{{ i }}</p>
                <p class="video-preview-stats">
                  <span class="preview-uploader">UP主名称</span>
                  <span class="preview-views">播放: 1.2万</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!video" class="loading">加载中...</div>
  </div>
</template>

<!-- script部分保持不变 -->


<script setup lang="ts">
import '@/css/Player.css'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/axios'
import { ElSelect, ElOption, ElInput, ElButton, ElIcon, ElRadioGroup, ElRadio, ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { throttle } from 'lodash'
import NavBar from '@/components/NavBar.vue'

 // 导入评论组件
import VideoComment from '@/components/VideoComment.vue';




// 接口定义保持不变
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
const videoPlayer = ref<HTMLVideoElement | null>(null)
const danmakuContainer = ref<HTMLElement | null>(null)
const danmakuDensity = ref<'normal' | 'overlap'>('normal')
const danmakuInput = ref('')
let socket: WebSocket | null = null
const danmakuList = ref<Danmaku[]>([])
const activeDanmaku = ref<Map<number, { element: HTMLElement; animation: Animation }>>(new Map())

// 弹幕面板相关
const isDanmuExpanded = ref(true) // 默认展开
const sortBy = ref('sendTime') // 默认按弹幕时间排序
// 添加 videoId 变量
const videoId = ref<number | null>(null)

const fetchVideo = async () => {
  const videoIdStr = route.params.videoId as string
  const videoIdValue = Number(videoIdStr.replace('vv', ''))
  videoId.value = videoIdValue // 设置 videoId 的值
  try {
    const response = await axios.post('/videodisplay/video/getVideoInfo', { id: videoId.value })
    if (response.data.success) {
      video.value = response.data.data
      fetchDanmakuHistory(videoId.value)
      setupWebSocket(videoId.value)
    }
  } catch (error) {
    console.error('请求视频出错:', error)
    ElMessage.error('加载视频失败')
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
      sortDanmuList() // 初始排序
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
    renderDanmaku(danmaku)
    sortDanmuList() // 新弹幕加入后重新排序
  }
  socket.onclose = () => console.log('WebSocket 已断开')
  socket.onerror = (error) => console.error('WebSocket 错误:', error)
}

const sendDanmaku = () => {
  if (!danmakuInput.value || !socket || socket.readyState !== WebSocket.OPEN) return
  const videoIdStr = route.params.videoId as string
  const videoId = Number(videoIdStr.replace('vv', ''))
  const currentTime = videoPlayer.value?.currentTime || 0
  const danmaku: Danmaku = {
    id: 0,
    userId: 1,
    videoId,
    content: danmakuInput.value,
    sendTime: Number(currentTime.toFixed(3)),
    color: '#ffffff',
    position: 'scroll',
    type: 0,
    createBy: 'user',
    createTime: new Date().toISOString()
  }
  socket.send(JSON.stringify(danmaku))
  danmakuInput.value = ''
}

const updateDanmaku = throttle(() => {
  if (!videoPlayer.value || !danmakuContainer.value) return
  const currentTime = videoPlayer.value.currentTime
  danmakuList.value.forEach((danmaku) => {
    if (
      Math.abs(danmaku.sendTime - currentTime) < 0.5 &&
      !activeDanmaku.value.has(danmaku.id)
    ) {
      renderDanmaku(danmaku)
    }
  })
}, 200)

const renderDanmaku = (danmaku: Danmaku) => {
  if (!danmakuContainer.value || !videoPlayer.value) return
  const danmakuEl = document.createElement('div')
  danmakuEl.className = 'danmaku'
  danmakuEl.textContent = danmaku.content
  danmakuEl.style.color = danmaku.color || '#ffffff'

  const containerWidth = danmakuContainer.value.clientWidth
  danmakuEl.style.position = 'absolute'
  danmakuEl.style.left = `${containerWidth}px`

  if (danmakuDensity.value === 'normal') {
    const trackHeight = 40
    let top = 0
    let overlap = true
    while (overlap) {
      overlap = false
      for (const [, { element }] of activeDanmaku.value) {
        const activeTop = parseInt(element.style.top) || 0
        if (Math.abs(activeTop - top) < trackHeight) {
          overlap = true
          top += trackHeight
          break
        }
      }
      if (top + trackHeight > danmakuContainer.value.clientHeight) top = 0
    }
    danmakuEl.style.top = `${top}px`
  } else {
    const maxTop = danmakuContainer.value.clientHeight - 30
    danmakuEl.style.top = `${Math.random() * maxTop}px`
  }

  danmakuContainer.value.appendChild(danmakuEl)
  const animation = danmakuEl.animate(
    [
      { left: `${containerWidth}px` },
      { left: `-${danmakuEl.offsetWidth}px` }
    ],
    { duration: 5000, easing: 'linear', fill: 'forwards' }
  )
  activeDanmaku.value.set(danmaku.id, { element: danmakuEl, animation })

  animation.onfinish = () => {
    danmakuEl.remove()
    activeDanmaku.value.delete(danmaku.id)
  }
}

const handleFullscreenChange = () => {
  if (!videoPlayer.value || !danmakuContainer.value) return
  const isFullscreen = document.fullscreenElement === videoPlayer.value
  if (isFullscreen) {
    danmakuContainer.value.style.width = '100vw'
    danmakuContainer.value.style.height = '100vh'
    danmakuContainer.value.style.top = '0'
    danmakuContainer.value.style.left = '0'
    activeDanmaku.value.forEach(({ element }) => {
      element.style.left = `${window.innerWidth}px`
    })
  } else {
    danmakuContainer.value.style.width = '100%'
    danmakuContainer.value.style.height = '100%'
    danmakuContainer.value.style.top = '0'
    danmakuContainer.value.style.left = '0'
    activeDanmaku.value.forEach(({ element }) => {
      element.style.left = `${danmakuContainer.value?.clientWidth}px`
    })
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatDuration = (duration: number | null) => {
  if (!duration) return '未知'
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
}

// 弹幕面板功能
const toggleDanmuPanel = () => {
  isDanmuExpanded.value = !isDanmuExpanded.value
}

const sortDanmuList = () => {
  danmakuList.value.sort((a, b) => {
    if (sortBy.value === 'sendTime') {
      return a.sendTime - b.sendTime // 按弹幕时间升序
    } else {
      return new Date(a.createTime || '').getTime() - new Date(b.createTime || '').getTime() // 按创建时间升序
    }
  })
}

//格式化弹幕出现时间
const formatDanmuTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs < 10 ? '0' + secs.toFixed(1) : secs.toFixed(1)}`
}

const formatCreateTime = (time: string | null) => {
  if (!time || time === 'null') return '未知'
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}

watch(
  () => video.value?.videoUrl,
  (newUrl) => {
    if (newUrl && videoPlayer.value) {
      videoPlayer.value.src = newUrl
      videoPlayer.value.load()
      videoPlayer.value.play().catch((error) => console.error('自动播放失败:', error))
    }
  }
)

onMounted(() => {
  fetchVideo()
})

onUnmounted(() => {
  if (socket) socket.close()
  activeDanmaku.value.forEach(({ animation }) => animation.cancel())
  activeDanmaku.value.clear()
})
</script>


<style>
/* ... 现有样式 ... */





.video-comment-section {
  margin-top: 20px;
  width: 100%;
}
</style>