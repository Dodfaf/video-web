<template>
  <div class="collection-container">
    <el-button 
      type="default" 
      size="large" 
      @click="handleCollectionAction"
      class="collection-button"
    >
      <el-icon v-if="isCollected" class="collection-icon"><img :src="isCollected? '/src/assets/collection1.svg' : '/src/assets/collection.svg'" class="collection-icon"></el-icon>
      <el-icon v-else class="collection-icon"></el-icon>
      <!-- {{ isCollected ? '已收藏' : '收藏' }}<StarFilled /> -->
    </el-button>

    <el-dialog
      v-model="dialogVisible"
      title="收藏到"
      width="400px"
    >
      <div class="folder-list">
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="folders.length === 0" class="empty-folders">
          <p>您还没有创建收藏夹</p>
          <el-button type="primary" @click="createNewFolder">创建收藏夹</el-button>
        </div>
        <div v-else>
          <el-radio-group v-model="selectedFolderId">
            <div v-for="folder in folders" :key="folder.id" class="folder-item">
              <el-radio :label="folder.id">{{ folder.folderName }} ({{ folder.videoCount }})</el-radio>
            </div>
          </el-radio-group>
          <div class="create-new">
            <el-button type="text" @click="createNewFolder">+ 创建新收藏夹</el-button>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="collectVideo" :disabled="!selectedFolderId">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 创建新收藏夹对话框 -->
    <el-dialog
      v-model="createFolderDialogVisible"
      title="创建收藏夹"
      width="400px"
    >
      <el-form :model="newFolder" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="newFolder.folderName" placeholder="请输入收藏夹名称"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newFolder.description" type="textarea" placeholder="请输入收藏夹描述"></el-input>
        </el-form-item>
        <el-form-item label="公开">
          <el-switch v-model="newFolder.isPublic" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createFolderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitNewFolder" :disabled="!newFolder.folderName">
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from 'vue'
import { ElMessage, ElButton, ElDialog, ElRadio, ElRadioGroup, ElForm, ElFormItem, ElInput, ElSwitch, ElIcon } from 'element-plus'
import { Star, StarFilled, Loading } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import axios from '@/axios'

const props = defineProps({
  videoId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['collection-updated'])

const userStore = useUserStore()
const isCollected = ref(false)
const dialogVisible = ref(false)
const createFolderDialogVisible = ref(false)
const loading = ref(false)
const folders = ref([])
const selectedFolderId = ref(null)
const newFolder = ref({
  folderName: '',
  description: '',
  isPublic: 0
})
// 添加收藏记录ID
const collectionRecordId = ref(null)

// 检查视频是否已被收藏
const checkIsCollected = async () => {
  try {
    const response = await axios.get('/videodisplay/videoCollection/isVideoCollected', {
      params: {
        videoId: props.videoId,
        userId: userStore.loginId
      }
    })
    
    if (response.data.code === 200) {
      isCollected.value = response.data.data
      // 如果已收藏，获取收藏记录ID
      if (isCollected.value) {
        getCollectionRecordId()
      }
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 获取收藏记录ID
const getCollectionRecordId = async () => {
  try {
    const response = await axios.get('/videodisplay/videoCollection/getCollectionRecord', {
      params: {
        videoId: props.videoId,
        userId: userStore.loginId
      }
    })
    
    if (response.data.code === 200 && response.data.data) {
      collectionRecordId.value = response.data.data.id
    }
  } catch (error) {
    console.error('获取收藏记录ID失败:', error)
  }
}

// 处理收藏操作
const handleCollectionAction = () => {
  if (isCollected.value) {
    // 如果已收藏，则取消收藏
    cancelCollection()
  } else {
    // 如果未收藏，则显示收藏对话框
    showCollectionDialog()
  }
}

// 取消收藏
const cancelCollection = async () => {
  if (!collectionRecordId.value) {
    await getCollectionRecordId()
    if (!collectionRecordId.value) {
      ElMessage.error('获取收藏记录失败')
      return
    }
  }
  
  try {
    const response = await axios.post('/videodisplay/videoCollection/cancelCollection', {
      recordId: collectionRecordId.value,
      userId: userStore.loginId
    })
    
    if (response.data.code === 200) {
      ElMessage.success('已取消收藏')
      isCollected.value = false
      collectionRecordId.value = null
      emit('collection-updated')
    }
  } catch (error) {
    console.error('取消收藏失败:', error)
    ElMessage.error('取消收藏失败')
  }
}

// 获取用户收藏夹列表
const getUserFolders = async () => {
  // if (!userStore.isLoggedIn) return
  
  loading.value = true
  try {
    const response = await axios.get('/videodisplay/videoCollection/getUserFolders', {
      params: {
        userId: userStore.loginId
      }
    })
    
    if (response.data.code === 200) {
      folders.value = response.data.data || []
      if (folders.value.length > 0) {
        selectedFolderId.value = folders.value[0].id
      }
    }
  } catch (error) {
    console.error('获取收藏夹列表失败:', error)
    ElMessage.error('获取收藏夹列表失败')
  } finally {
    loading.value = false
  }
}

// 显示收藏对话框
const showCollectionDialog = () => {
  // if (!userStore.isLoggedIn) {
  //   ElMessage.warning('请先登录')
  //   return
  // }
  
  dialogVisible.value = true
  getUserFolders()
}

// 收藏视频
const collectVideo = async () => {
  if (!selectedFolderId.value) return
  
  try {
    const response = await axios.post('/videodisplay/videoCollection/collectVideo', {
      userId: userStore.loginId,
      folderId: selectedFolderId.value,
      videoId: props.videoId
    })
    
    if (response.data.code === 200) {
      ElMessage.success('收藏成功')
      isCollected.value = true
      dialogVisible.value = false
      emit('collection-updated')
    }
  } catch (error) {
    console.error('收藏视频失败:', error)
    ElMessage.error('收藏视频失败')
  }
}

// 创建新收藏夹
const createNewFolder = () => {
  createFolderDialogVisible.value = true
  dialogVisible.value = false
}

// 提交新收藏夹
const submitNewFolder = async () => {
  if (!newFolder.value.folderName) return
  
  try {
    const response = await axios.post('/videodisplay/videoCollection/createFolder', {
      userId: userStore.loginId,
      folderName: newFolder.value.folderName,
      description: newFolder.value.description,
      isPublic: newFolder.value.isPublic
    })
    
    if (response.data.code === 200) {
      ElMessage.success('创建收藏夹成功')
      createFolderDialogVisible.value = false
      dialogVisible.value = true
      
      // 重置表单
      newFolder.value = {
        folderName: '',
        description: '',
        isPublic: 0
      }
      
      // 重新获取收藏夹列表
      getUserFolders()
    }
  } catch (error) {
    console.error('创建收藏夹失败:', error)
    ElMessage.error('创建收藏夹失败')
  }
}

onMounted(() => {
  checkIsCollected()
})
</script>

<style scoped>
.collection-container {
  display: inline-block;
}

.collection-button {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 1.25em;
  padding: 10px 15px;
}

/* .collection-icon {
  font-size: 1.25em;
} */

.folder-list {
  max-height: 300px;
  overflow-y: auto;
}

.folder-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.folder-item:last-child {
  border-bottom: none;
}

.create-new {
  margin-top: 15px;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.empty-folders {
  text-align: center;
  padding: 20px;
}

.collection-icon {
  width: 25px;
  height: 25px;
}
</style>