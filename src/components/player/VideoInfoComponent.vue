<template>
  <div class="video-info-section">
    <div class="video-title-row">
      <h1>{{ video.videoTitle }}</h1>
      <div class="video-stats">
        <span class="play-count">播放: 0</span>
        <span class="danmu-count">弹幕: {{ danmakuCount }}</span>
        <span class="publish-time">{{ formatTime(video.createTime) }}</span>
      </div>
    </div>
    
    <div class="uploader-info">
      <div class="uploader-avatar">
        <img :src="uploader?.avatar || 'https://via.placeholder.com/40'" alt="用户头像" />
      </div>
      <div class="uploader-details">
        <div class="uploader-name">{{ uploader?.nickName || video.createBy || '未知' }}</div>
        <div class="uploader-fans">粉丝: 0</div>
      </div>
      <el-button type="primary" size="small" class="follow-btn">关注</el-button>
    </div>
    
    <div class="video-description">
      <p>{{ video.description || '暂无简介' }}</p>
    </div>
    
    <div class="danmaku-controls">
      <el-select v-model="danmakuDensity" placeholder="弹幕密度" size="small" @change="densityChanged">
        <el-option label="正常（不重叠）" value="normal"></el-option>
        <el-option label="重叠" value="overlap"></el-option>
      </el-select>
      <el-input v-model="danmakuInput" placeholder="发送弹幕" @keyup.enter="sendDanmaku"></el-input>
      <el-button type="primary" @click="sendDanmaku">发送</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { ElSelect, ElOption, ElInput, ElButton } from 'element-plus'
import type { Video, Uploader } from '@/types/Video'


const props = defineProps<{
  video: Video,
  danmakuCount: Number,
  uploader: Uploader // 添加UP主信息属性
}>()

const emit = defineEmits(['send-danmaku', 'density-change'])

const danmakuInput = ref('')
const danmakuDensity = ref('normal')

const formatTime = (time: string | number | Date) => {
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const sendDanmaku = () => {
  if (!danmakuInput.value) return
  emit('send-danmaku', danmakuInput.value)
  danmakuInput.value = ''
}

const densityChanged = () => {
  emit('density-change', danmakuDensity.value)
}
</script>

<style scoped>
.video-info-section {
  margin-top: 20px;
  padding: 0 15px;
}

.video-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.video-title-row h1 {
  font-size: 20px;
  margin: 0;
  flex: 1;
}

.video-stats {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 14px;
}

.uploader-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.uploader-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.uploader-details {
  margin-left: 10px;
  flex: 1;
}

.uploader-name {
  font-weight: bold;
}

.uploader-fans {
  font-size: 12px;
  color: #666;
}

.follow-btn {
  margin-left: auto;
}

.video-description {
  margin-bottom: 15px;
  color: #333;
  line-height: 1.5;
}

.danmaku-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.danmaku-controls .el-select {
  width: 150px;
}

.danmaku-controls .el-input {
  flex: 1;
}
</style>