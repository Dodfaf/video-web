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
          <div class="danmu-item-row">
            <span class="danmu-time">{{ formatDanmuTime(danmu.sendTime) }}</span>
            <span class="danmu-content-text">{{ danmu.content }}</span>
            <span class="danmu-create-time">{{ formatCreateTime(danmu.createTime) }}</span>
          </div>
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

// 定义弹幕数据的接口
interface Danmaku {
  id: number | string;
  content: string;
  sendTime: number;
  createTime: string | null;
  [key: string]: any; // 允许其他可能的属性
}

const props = defineProps({
  danmakuList: {
    type: Array as () => Danmaku[],
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
  
  return [...props.danmakuList].sort((a: Danmaku, b: Danmaku) => {
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

const formatDanmuTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs < 10 ? '0' + secs : secs}`
}


const formatCreateTime = (time: any): string => {
  if (!time) return 'NaN-NaN NaN:NaN'
  
  try {
    // 处理对象格式的日期
    if (typeof time === 'object' && time !== null) {
      // 检查是否有必要的日期属性
      if ('year' in time && 'monthValue' in time && 'dayOfMonth' in time && 
          'hour' in time && 'minute' in time) {
        const month = time.monthValue.toString().padStart(2, '0')
        const day = time.dayOfMonth.toString().padStart(2, '0')
        const hours = time.hour.toString().padStart(2, '0')
        const minutes = time.minute.toString().padStart(2, '0')
        return `${month}-${day} ${hours}:${minutes}`
      }
    }
    
    // 如果是字符串格式，使用原来的处理方式
    if (typeof time === 'string') {
      const date = new Date(time)
      if (isNaN(date.getTime())) return 'NaN-NaN NaN:NaN'
      
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${month}-${day} ${hours}:${minutes}`
    }
    
    return 'NaN-NaN NaN:NaN'
  } catch (error) {
    console.error('日期格式化错误:', error)
    return 'NaN-NaN NaN:NaN'
  }
}
</script>

<style scoped>
.danmu-panel {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: all 0.3s ease;
  width: 115%; /* 增加宽度为原来的1.15倍 */
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
  flex-direction: column;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.danmu-item-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.danmu-time {
  color: #666;
  font-size: 12px;
  min-width: 30px;
  margin-right: 10px;
  font-weight: bold;
  flex-shrink: 0;
}

.danmu-content-text {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
}

.danmu-create-time {
  color: #999;
  font-size: 12px;
  flex-shrink: 0;
  white-space: nowrap;
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