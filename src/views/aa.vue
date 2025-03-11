<template>
    <div class="player-container">
        
        <div v-if="video" class="video-player">
        <h2>{{ video.videoTitle }}</h2>
        <video ref="videoPlayer" controls autoplay class="video-element">
          <source :src="video.videoUrl" type="video/mp4" />
          您的浏览器不支持视频播放。
        </video>
        <div class="video-info">
          
          <p>作者: {{ video.createBy || '未知' }}</p>
          <p>创建时间: {{ formatTime(video.createTime) }}</p>
          <p>时长: {{ formatDuration(video.duration) }}</p>
        </div>
      </div>
      <div v-else class="loading">加载中...</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import axios from '@/axios'
  
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
  
  const route = useRoute()
  const video = ref<Video | null>(null)
  const videoPlayer = ref<HTMLVideoElement | null>(null)
  
  const fetchVideo = async () => {
    const videoId = route.params.videoId as string // 获取路由中的 videoId
    const id = videoId.replace('vv', '') // 去掉 'vv' 前缀
    try {
      const response = await axios.post('/videodisplay/video/getVideoInfo',{
        id: Number(id)// 我需要在这里传递id的json给后端
      })
      if (response.data.success) {
        video.value = response.data.data
      } else {
        console.error('获取视频失败:', response.data.message)
      }
    } catch (error) {
      console.error('请求视频出错:', error)
    }
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
  
  onMounted(() => {
    fetchVideo()
  })
  </script>
  
  <style scoped>
  .player-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .video-player {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .video-element {
    width: 100%;
    /* max-width: 800px; */
    /* height: auto; */
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    aspect-ratio: 1054 / 593;
    margin-bottom: 20px;
    background-color: #000;
  }
  
  .video-info {
    margin-top: 20px;
    text-align: left;
    width: 100%;
    max-width: 800px;
  }
  
  .video-info h2 {
    font-size: 24px;
    margin: 0 0 10px;
  }
  
  .video-info p {
    font-size: 16px;
    color: #666;
    margin: 5px 0;
  }
  
  .loading {
    text-align: center;
    font-size: 18px;
    color: #999;
  }
  </style>