<template>
  <div class="like-container">
    <el-button 
      type="default" 
      size="large" 
      @click="toggleLike"
      :disabled="loading"
      class="like-button"
    >
      <img :src="isLiked ? '/src/assets/liked0.svg' : '/src/assets/like0.svg'" class="like-icon" />
      <!-- {{ isLiked ? '已点赞' : '点赞' }}  -->
      &nbsp; <span :class="{ 'liked-count': isLiked, 'normal-count': !isLiked }">{{ likeCount }}</span>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import axios from '@/axios'

const props = defineProps({
  videoId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['like-updated'])

const userStore = useUserStore()
const isLiked = ref(false)
const likeCount = ref(0)
const loading = ref(false)

// 获取点赞状态
const checkLikeStatus = async () => {
  if (!userStore.isLogin) return
  
  try {
    const response = await axios.post('/videodisplay/video/like/status', {
      videoId: props.videoId,
      likeUserId: userStore.loginId
    })
    
    if (response.data.code === 200) {
      isLiked.value = response.data.data
    }
  } catch (error) {
    console.error('检查点赞状态失败:', error)
  }
}

// 获取点赞数量
const getLikeCount = async () => {
  try {
    const response = await axios.post('/videodisplay/video/like/count', {
      videoId: props.videoId
    })
    
    if (response.data.code === 200) {
      likeCount.value = response.data.data
    }
  } catch (error) {
    console.error('获取点赞数量失败:', error)
  }
}

// 点赞或取消点赞
const toggleLike = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    return
  }
  
  loading.value = true
  try {
    // 乐观更新UI
    const previousState = isLiked.value
    isLiked.value = !previousState
    likeCount.value += previousState ? -1 : 1
    
    const response = await axios.post('/videodisplay/video/like/toggle', {
      videoId: props.videoId
    })
    
    if (response.data.code === 200) {
      // 服务器返回的实际状态
      const serverState = response.data.data
      
      // 如果服务器状态与本地状态不一致，则更新本地状态
      if (serverState !== isLiked.value) {
        isLiked.value = serverState
        likeCount.value += serverState ? 1 : -1
      }
      
      ElMessage.success(isLiked.value ? '点赞成功' : '已取消点赞')
      emit('like-updated', isLiked.value)
    } else {
      // 恢复之前的状态
      isLiked.value = previousState
      likeCount.value = previousState ? likeCount.value + 1 : likeCount.value - 1
      ElMessage.error('操作失败，请重试')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    // 恢复之前的状态
    isLiked.value = !isLiked.value
    likeCount.value += isLiked.value ? -1 : 1
    ElMessage.error('点赞操作失败，请重试')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  checkLikeStatus()
  getLikeCount()
})
</script>

<style scoped>
.like-container {
  display: inline-block;
  margin-right: 10px;
}

.like-button {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 1.25em;
  padding: 10px 15px;
}

.like-icon {
  width: 25px;
  height: 25px;
}

.liked-count {
  color: rgb(18, 150, 219);
}

.normal-count {
  color: #000;
}
</style>