<template>
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
        <div v-for="danmu in sortedDanmakuList" :key="danmu.id" class="danmu-item">
          <span class="danmu-time">{{ formatDanmuTime(danmu.sendTime) }}</span>
          <span class="danmu-content-text">{{ danmu.content }}</span>
          <span class="danmu-create-time">{{ formatCreateTime(danmu.createTime) }}</span>
        </div>
        <div v-if="danmakuList.length === 0" class="no-danmu">暂无弹幕</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from 'vue'
import { ElIcon, ElRadioGroup, ElRadio } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  danmakuList: {
    type: Array,
    default: () => []
  }
})

const isDanmuExpanded = ref(true)
const sortBy = ref('sendTime')

const toggleDanmuPanel = () => {
  isDanmuExpanded.value = !isDanmuExpanded.value
}

const sortedDanmakuList = computed(() => {
  if (!props.danmakuList) return []
  
  return [...props.danmakuList].sort((a, b) => {
    if (sortBy.value === 'sendTime') {
      return a.sendTime - b.sendTime // 按弹幕时间升序
    } else {
      return new Date(a.createTime || '').getTime() - new Date(b.createTime || '').getTime() // 按创建时间升序
    }
  })
})

const sortDanmuList = () => {
  // 排序逻辑已移至计算属性
}

const formatDanmuTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs < 10 ? '0' + secs.toFixed(1) : secs.toFixed(1)}`
}

const formatCreateTime = (time) => {
  if (!time || time === 'null') return '未知'
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}
</script>

<style scoped>
.danmu-panel {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.danmu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  font-weight: bold;
}

.danmu-content {
  padding: 0 15px 15px;
  max-height: 400px;
  overflow-y: auto;
}

.sort-options {
  margin-bottom: 10px;
}

.danmu-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.danmu-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.danmu-time {
  color: #666;
  font-size: 12px;
  width: 50px;
}

.danmu-content-text {
  flex: 1;
  margin: 0 10px;
}

.danmu-create-time {
  color: #999;
  font-size: 12px;
}

.no-danmu {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s;
}

.danmu-collapsed {
  margin-bottom: 10px;
}
</style>