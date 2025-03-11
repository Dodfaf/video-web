<template>
    <div class="search-results-page">
      <nav-bar />
      <div class="search-results-container">
        <h1>搜索结果</h1>
        <el-input
          v-model="searchQuery"
          placeholder="请输入视频标题"
          style="width: 300px; margin-bottom: 20px"
          @keyup.enter="fetchSearchResults"
        >
          <template #append>
            <el-button icon="el-icon-search" @click="fetchSearchResults" />
          </template>
        </el-input>
        <el-table :data="searchResults" style="width: 100%" v-loading="loading">
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
        </el-table>
        <el-pagination
          v-model:current-page="pageNo"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="fetchSearchResults"
          style="margin-top: 20px"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElInput, ElButton, ElTable, ElTableColumn, ElPagination, ElMessage } from 'element-plus'
  import axios from '@/axios'
  import NavBar from '@/components/NavBar.vue'
  
  const router = useRouter()
  const route = useRoute()
  
  // 搜索关键词
  const searchQuery = ref('')
  
  // 搜索结果
  const searchResults = ref<any[]>([])
  const pageNo = ref(1)
  const pageSize = 10
  const total = ref(0)
  const loading = ref(false)
  
  // 获取搜索结果
  const fetchSearchResults = async () => {
    if (!searchQuery.value.trim()) {
      ElMessage.warning('请输入搜索关键词')
      return
    }
    loading.value = true
    try {
      const response = await axios.post('http://localhost:5000/videodisplay/video/searchByTitle', {
        videoTitle: searchQuery.value,

        pageNo: pageNo.value,
        pageSize
      })
      if (response.data.success) {
        searchResults.value = response.data.data.content
        total.value = response.data.data.totalElements
      } else {
        ElMessage.error('搜索失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('搜索错误:', error)
      ElMessage.error('搜索失败')
    } finally {
      loading.value = false
    }
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
  
  // 从导航栏跳转时初始化搜索
  onMounted(() => {
    const query = route.query.q as string
    if (query) {
      searchQuery.value = query
      fetchSearchResults()
    }
  })
  </script>
  
  <style scoped>
  .search-results-page {
    padding-top: 60px;
  }
  
  .search-results-container {
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