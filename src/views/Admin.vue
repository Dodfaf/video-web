<template>
    <div class="admin-page">
      <nav-bar />
      <div class="admin-container">
        <h1>管理员 - 视频审核</h1>
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <!-- 未审核视频 -->
          <el-tab-pane label="未审核视频" name="pending">
            <el-table :data="pendingVideos" style="width: 100%" v-loading="pendingLoading">
              <el-table-column label="封面" width="150">
                <template #default="{ row }">
                  <img
                    :src="row.coverUrl"
                    class="cover-img"
                    @click="goToVideo(row.id)"
                    style="cursor: pointer"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="videoTitle" label="标题" />
              <el-table-column label="时长" width="100">
                <template #default="{ row }">
                  {{ formatDuration(row.duration) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="300">
                <template #default="{ row }">
                  <el-button type="success" size="small" @click="approveVideo(row.id)">审核通过</el-button>
                  <el-button type="warning" size="small" @click="rejectVideo(row.id)">审核不通过</el-button>
                  <el-button type="danger" size="small" @click="deleteVideo(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              v-model:current-page="pendingPageNo"
              :page-size="pageSize"
              :total="pendingTotal"
              layout="prev, pager, next"
              @current-change="fetchPendingVideos"
              style="margin-top: 20px"
            />
          </el-tab-pane>
  
          <!-- 审核不通过视频 -->
          <el-tab-pane label="审核不通过视频" name="rejected">
            <el-table :data="rejectedVideos" style="width: 100%" v-loading="rejectedLoading">
              <el-table-column label="封面" width="150">
                <template #default="{ row }">
                  <img
                    :src="row.coverUrl"
                    class="cover-img"
                    @click="goToVideo(row.id)"
                    style="cursor: pointer"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="videoTitle" label="标题" />
              <el-table-column label="时长" width="100">
                <template #default="{ row }">
                  {{ formatDuration(row.duration) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="300">
                <template #default="{ row }">
                  <el-button type="success" size="small" @click="approveVideo(row.id)">审核通过</el-button>
                  <el-button type="danger" size="small" @click="deleteVideo(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              v-model:current-page="rejectedPageNo"
              :page-size="pageSize"
              :total="rejectedTotal"
              layout="prev, pager, next"
              @current-change="fetchRejectedVideos"
              style="margin-top: 20px"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    ElTabs,
    ElTabPane,
    ElTable,
    ElTableColumn,
    ElButton,
    ElPagination,
    ElMessage,
    ElMessageBox
  } from 'element-plus'
  import axios from '@/axios'
  import NavBar from '@/components/NavBar.vue'
  
  const router = useRouter()
  
  // Tab 状态
  const activeTab = ref('pending')
  
  // 未审核视频
  const pendingVideos = ref<any[]>([])
  const pendingPageNo = ref(1)
  const pendingTotal = ref(0)
  const pendingLoading = ref(false)
  
  // 审核不通过视频
  const rejectedVideos = ref<any[]>([])
  const rejectedPageNo = ref(1)
  const rejectedTotal = ref(0)
  const rejectedLoading = ref(false)
  
  const pageSize = 5
  
  // 获取未审核视频列表
  const fetchPendingVideos = async () => {
    pendingLoading.value = true
    try {
      const response = await axios.post('http://localhost:5000/videodisplay/video/getStatusVideoList', {
        status: 0,
        isDeleted: 0,
        pageNo: pendingPageNo.value,
        pageSize
      })
      if (response.data.success) {
        pendingVideos.value = response.data.data.content
        pendingTotal.value = response.data.data.totalElements
      } else {
        ElMessage.error('获取未审核视频失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('获取未审核视频错误:', error)
      ElMessage.error('获取未审核视频失败')
    } finally {
      pendingLoading.value = false
    }
  }
  
  // 获取审核不通过视频列表
  const fetchRejectedVideos = async () => {
    rejectedLoading.value = true
    try {
      const response = await axios.post('http://localhost:5000/videodisplay/video/getStatusVideoList', {
        status: 2,
        isDeleted: 0,
        pageNo: rejectedPageNo.value,
        pageSize
      })
      if (response.data.success) {
        rejectedVideos.value = response.data.data.content
        rejectedTotal.value = response.data.data.totalElements
      } else {
        ElMessage.error('获取审核不通过视频失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('获取审核不通过视频错误:', error)
      ElMessage.error('获取审核不通过视频失败')
    } finally {
      rejectedLoading.value = false
    }
  }
  
  // 审核通过
  const approveVideo = async (id: number) => {
    try {
      const response = await axios.post('http://localhost:5000/videodisplay/video/updateStatus', {
        id,
        status: 1
      })
      if (response.data.success) {
        ElMessage.success('审核通过成功')
        if (activeTab.value === 'pending') fetchPendingVideos()
        else fetchRejectedVideos()
      } else {
        ElMessage.error('审核通过失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('审核通过错误:', error)
      ElMessage.error('审核通过失败')
    }
  }
  
  // 审核不通过
  const rejectVideo = async (id: number) => {
    try {
      const response = await axios.post('http://localhost:5000/videodisplay/video/updateStatus', {
        id,
        status: 2
      })
      if (response.data.success) {
        ElMessage.success('审核不通过成功')
        fetchPendingVideos() // 只在未审核 Tab 中需要刷新
      } else {
        ElMessage.error('审核不通过失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('审核不通过错误:', error)
      ElMessage.error('审核不通过失败')
    }
  }
  
  // 删除视频
  const deleteVideo = async (id: number) => {
    ElMessageBox.confirm('确定删除此视频吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        const response = await axios.post('http://localhost:5000/videodisplay/video/update', {
          id,
          isDeleted: 1
        })
        if (response.data.success) {
          ElMessage.success('删除成功')
          if (activeTab.value === 'pending') fetchPendingVideos()
          else fetchRejectedVideos()
        } else {
          ElMessage.error('删除失败: ' + response.data.message)
        }
      } catch (error) {
        console.error('删除视频错误:', error)
        ElMessage.error('删除失败')
      }
    }).catch(() => {
      ElMessage.info('已取消删除')
    })
  }
  
  // 跳转到播放页面
  const goToVideo = (id: number) => {
    router.push(`/video/vv${id}`)
  }
  
  // 格式化时长
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '未知'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`
  }
  
  // Tab 切换
  const handleTabClick = () => {
    if (activeTab.value === 'pending') fetchPendingVideos()
    else fetchRejectedVideos()
  }
  
  onMounted(() => {
    fetchPendingVideos() // 默认加载未审核视频
  })
  </script>
  
  <style scoped>
  .admin-page {
    padding-top: 60px;
  }
  
  .admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .cover-img {
    width: 120px;
    height: 68px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .el-table {
    margin-top: 20px;
  }
  </style>