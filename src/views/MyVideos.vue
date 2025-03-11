<template>
    <div class="my-videos-page">
      <nav-bar />
      <div class="my-videos-container">
        <h1>我的投稿视频</h1>
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <!-- 审核中 -->
          <el-tab-pane label="审核中" name="pending">
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
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
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
  
          <!-- 审核未通过 -->
          <el-tab-pane label="审核未通过" name="rejected">
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
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
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
  
          <!-- 审核已通过 -->
          <el-tab-pane label="审核已通过" name="approved">
            <el-table :data="approvedVideos" style="width: 100%" v-loading="approvedLoading">
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
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button type="danger" size="small" @click="deleteVideo(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              v-model:current-page="approvedPageNo"
              :page-size="pageSize"
              :total="approvedTotal"
              layout="prev, pager, next"
              @current-change="fetchApprovedVideos"
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
  import { useUserStore } from '@/stores/user'
  import NavBar from '@/components/NavBar.vue'
  
  const router = useRouter()
  const userStore = useUserStore()
  
  // Tab 状态
  const activeTab = ref('pending')
  
  // 审核中视频
  const pendingVideos = ref<any[]>([])
  const pendingPageNo = ref(1)
  const pendingTotal = ref(0)
  const pendingLoading = ref(false)
  
  // 审核未通过视频
  const rejectedVideos = ref<any[]>([])
  const rejectedPageNo = ref(1)
  const rejectedTotal = ref(0)
  const rejectedLoading = ref(false)
  
  // 审核已通过视频
  const approvedVideos = ref<any[]>([])
  const approvedPageNo = ref(1)
  const approvedTotal = ref(0)
  const approvedLoading = ref(false)
  
  const pageSize = 5
  
  // 获取审核中视频列表
  const fetchPendingVideos = async () => {
    pendingLoading.value = true
    try {
      const response = await axios.post('http://localhost:5000/videodisplay/video/getUserVideoList', {
        upId: userStore.loginId,
        status: 0,
        pageNo: pendingPageNo.value,
        pageSize
      })
      if (response.data.success) {
        pendingVideos.value = response.data.data.content
        pendingTotal.value = response.data.data.totalElements
      } else {
        ElMessage.error('获取审核中视频失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('获取审核中视频错误:', error)
      ElMessage.error('获取审核中视频失败')
    } finally {
      pendingLoading.value = false
    }
  }
  
  // 获取审核未通过视频列表
  const fetchRejectedVideos = async () => {
    rejectedLoading.value = true
    try {
      const response = await axios.post('http://localhost:5000/videodisplay/video/getUserVideoList', {
        upId: userStore.loginId,
        status: 2,
        pageNo: rejectedPageNo.value,
        pageSize
      })
      if (response.data.success) {
        rejectedVideos.value = response.data.data.content
        rejectedTotal.value = response.data.data.totalElements
      } else {
        ElMessage.error('获取审核未通过视频失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('获取审核未通过视频错误:', error)
      ElMessage.error('获取审核未通过视频失败')
    } finally {
      rejectedLoading.value = false
    }
  }
  
  // 获取审核已通过视频列表
  const fetchApprovedVideos = async () => {
    approvedLoading.value = true
    try {
      const response = await axios.post('http://localhost:5000/videodisplay/video/getUserVideoList', {
        upId: userStore.loginId,
        status: 1,
        pageNo: approvedPageNo.value,
        pageSize
      })
      if (response.data.success) {
        approvedVideos.value = response.data.data.content
        approvedTotal.value = response.data.data.totalElements
      } else {
        ElMessage.error('获取审核已通过视频失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('获取审核已通过视频错误:', error)
      ElMessage.error('获取审核已通过视频失败')
    } finally {
      approvedLoading.value = false
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
          else if (activeTab.value === 'rejected') fetchRejectedVideos()
          else fetchApprovedVideos()
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
    else if (activeTab.value === 'rejected') fetchRejectedVideos()
    else fetchApprovedVideos()
  }
  
  onMounted(() => {
    fetchPendingVideos() // 默认加载审核中视频
  })
  </script>
  
  <style scoped>
  .my-videos-page {
    padding-top: 60px;
  }
  
  .my-videos-container {
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