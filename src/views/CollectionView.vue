<template>
  <NavBar />
  <div class="collection-view">
    <el-tabs v-model="activeTab" class="collection-tabs">
      <el-tab-pane label="我的收藏夹" name="myFolders">
        <div class="folder-actions">
          <el-button type="primary" @click="showCreateFolderDialog">创建收藏夹</el-button>
        </div>
        
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        
        <div v-else-if="folders.length === 0" class="empty-folders">
          <el-empty description="您还没有创建收藏夹"></el-empty>
        </div>
        
        <div v-else class="folder-grid">
          <el-card v-for="folder in folders" :key="folder.id" class="folder-card" shadow="hover">
            <div class="folder-cover" @click="viewFolderDetail(folder.id)">
              <img :src="folder.coverUrl || defaultCover" alt="封面">
              <div class="folder-info">
                <h3>{{ folder.folderName }}</h3>
                <p>{{ folder.videoCount }}个视频</p>
              </div>
            </div>
            <div class="folder-actions">
              <el-button type="text" @click="viewFolderDetail(folder.id)">查看</el-button>
              <el-button type="text" @click="editFolder(folder)">编辑</el-button>
              <el-popconfirm
                title="确定要删除这个收藏夹吗？"
                @confirm="deleteFolder(folder.id)"
              >
                <template #reference>
                  <el-button type="text" class="delete-btn">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 创建/编辑收藏夹对话框 -->
    <el-dialog
      v-model="folderDialogVisible"
      :title="isEditing ? '编辑收藏夹' : '创建收藏夹'"
      width="500px"
    >
      <el-form :model="currentFolder" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="currentFolder.folderName" placeholder="请输入收藏夹名称"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentFolder.description" type="textarea" placeholder="请输入收藏夹描述"></el-input>
        </el-form-item>
        <el-form-item label="封面">
          <el-input v-model="currentFolder.coverUrl" placeholder="请输入封面图片URL"></el-input>
        </el-form-item>
        <el-form-item label="公开">
          <el-switch v-model="currentFolder.isPublic" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="folderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFolder" :disabled="!currentFolder.folderName">
            {{ isEditing ? '保存' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 收藏夹详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="收藏夹详情"
      width="800px"
    >
      <div v-if="folderDetail">
        <div class="folder-header">
          <h2>{{ folderDetail.folderName }}</h2>
          <p>{{ folderDetail.description }}</p>
          <div class="folder-meta">
            <span>{{ folderDetail.videoCount }}个视频</span>
            <span>{{ folderDetail.isPublic ? '公开' : '私密' }}</span>
            <span>创建于 {{ formatDate(folderDetail.createTime) }}</span>
          </div>
        </div>
        
        <div v-if="folderVideos.length === 0" class="empty-videos">
          <el-empty description="收藏夹中还没有视频"></el-empty>
        </div>
        
        <div v-else class="video-list">
          <el-table :data="folderVideos" style="width: 100%">
            <el-table-column label="视频ID" prop="videoId" width="100"></el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="text" @click="goToVideo(scope.row.videoId)">观看</el-button>
                <el-button type="text" class="delete-btn" @click="removeFromFolder(scope.row.id)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import axios from '@/axios'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('myFolders')
const loading = ref(false)
const folders = ref([])
const folderDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEditing = ref(false)
const currentFolder = ref({
  id: null,
  folderName: '',
  description: '',
  coverUrl: '',
  isPublic: 0
})
const folderDetail = ref(null)
const folderVideos = ref([])
const defaultCover = 'https://via.placeholder.com/200x120?text=收藏夹'

// 获取用户收藏夹列表
const getUserFolders = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  loading.value = true
  try {
    const response = await axios.get('/videodisplay/videoCollection/getUserFolders', {
      params: {
        userId: userStore.loginId
      }
    })
    
    if (response.data.code === 200) {
      folders.value = response.data.data || []
    }
  } catch (error) {
    console.error('获取收藏夹列表失败:', error)
    ElMessage.error('获取收藏夹列表失败')
  } finally {
    loading.value = false
  }
}

// 显示创建收藏夹对话框
const showCreateFolderDialog = () => {
  isEditing.value = false
  currentFolder.value = {
    id: null,
    folderName: '',
    description: '',
    coverUrl: '',
    isPublic: 0
  }
  folderDialogVisible.value = true
}

// 编辑收藏夹
const editFolder = (folder) => {
  isEditing.value = true
  currentFolder.value = { ...folder }
  folderDialogVisible.value = true
}

// 提交收藏夹（创建或更新）
const submitFolder = async () => {
  if (!currentFolder.value.folderName) return
  
  try {
    let response
    if (isEditing.value) {
      response = await axios.post('/videodisplay/videoCollection/updateFolder', {
        id: currentFolder.value.id,
        userId: userStore.loginId,
        folderName: currentFolder.value.folderName,
        description: currentFolder.value.description,
        coverUrl: currentFolder.value.coverUrl,
        isPublic: currentFolder.value.isPublic
      })
    } else {
      response = await axios.post('/videodisplay/videoCollection/createFolder', {
        userId: userStore.loginId,
        folderName: currentFolder.value.folderName,
        description: currentFolder.value.description,
        coverUrl: currentFolder.value.coverUrl,
        isPublic: currentFolder.value.isPublic
      })
    }
    
    if (response.data.code === 200) {
      ElMessage.success(isEditing.value ? '更新收藏夹成功' : '创建收藏夹成功')
      folderDialogVisible.value = false
      getUserFolders()
    }
  } catch (error) {
    console.error(isEditing.value ? '更新收藏夹失败:' : '创建收藏夹失败:', error)
    ElMessage.error(isEditing.value ? '更新收藏夹失败' : '创建收藏夹失败')
  }
}

// 删除收藏夹
const deleteFolder = async (folderId) => {
  try {
    const response = await axios.post('/videodisplay/videoCollection/deleteFolder', {
      folderId,
      userId: userStore.loginId
    })
    
    if (response.data.code === 200) {
      ElMessage.success('删除收藏夹成功')
      getUserFolders()
    }
  } catch (error) {
    console.error('删除收藏夹失败:', error)
    ElMessage.error('删除收藏夹失败')
  }
}

// 查看收藏夹详情
const viewFolderDetail = async (folderId) => {
  try {
    const detailResponse = await axios.get('/videodisplay/videoCollection/getFolderDetail', {
      params: { folderId }
    })
    
    if (detailResponse.data.code === 200) {
      folderDetail.value = detailResponse.data.data
      
      // 获取收藏夹中的视频
      const videosResponse = await axios.get('/videodisplay/videoCollection/getFolderVideos', {
        params: { folderId }
      })
      
      if (videosResponse.data.code === 200) {
        folderVideos.value = videosResponse.data.data.map(videoId => ({ videoId })) || []
      }
      
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取收藏夹详情失败:', error)
    ElMessage.error('获取收藏夹详情失败')
  }
}

// 从收藏夹中移除视频
const removeFromFolder = async (recordId) => {
  try {
    const response = await axios.post('/videodisplay/videoCollection/cancelCollection', {
      recordId,
      userId: userStore.loginId
    })
    
    if (response.data.code === 200) {
      console.log(response)
      ElMessage.success('移除视频成功')
      // 重新获取收藏夹详情
      if (folderDetail.value) {
        viewFolderDetail(folderDetail.value.id)
      }
    }
  } catch (error) {
    console.error('移除视频失败:', error)
    ElMessage.error('移除视频失败')
  }
}

// 跳转到视频页面
const goToVideo = (videoId) => {
  router.push(`/video/${videoId}`)
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

onMounted(() => {
  getUserFolders()
})
</script>

<style scoped>
.collection-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 70px;
}

.collection-tabs {
  margin-bottom: 20px;
}

.folder-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.folder-card {
  transition: transform 0.3s;
}

.folder-card:hover {
  transform: translateY(-5px);
}

.folder-cover {
  position: relative;
  cursor: pointer;
  height: 150px;
  overflow: hidden;
}

.folder-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.folder-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
}

.folder-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.folder-info p {
  margin: 0;
  font-size: 12px;
}

.folder-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.delete-btn {
  color: #f56c6c;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-folders, .empty-videos {
  padding: 40px;
  text-align: center;
}

.folder-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.folder-meta {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 14px;
  margin-top: 10px;
}

.video-list {
  margin-top: 20px;
}
</style>