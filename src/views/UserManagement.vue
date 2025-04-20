<template>
  <div class="user-management-container">
    <NavBar />
    <div class="management-content">
      <h1 class="management-title">用户管理</h1>
      
      <el-card class="user-list-card">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户名或昵称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        
        <el-table
          :data="userList"
          style="width: 100%"
          v-loading="loading"
          border
        >
          <el-table-column label="ID" prop="id" width="80" />
          <el-table-column label="头像" width="100">
            <template #default="scope">
              <el-avatar :size="40" :src="scope.row.avatar" />
            </template>
          </el-table-column>
          <el-table-column label="用户名" prop="userName" />
          <el-table-column label="昵称" prop="nickName" />
          <el-table-column label="联系方式">
            <template #default="scope">
              <div>邮箱: {{ scope.row.email || '未设置' }}</div>
              <div>电话: {{ scope.row.phone || '未设置' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
                {{ scope.row.status === 0 ? '正常' : '已封禁' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button
                :type="scope.row.status === 0 ? 'danger' : 'success'"
                size="small"
                @click="changeUserStatus(scope.row)"
              >
                {{ scope.row.status === 0 ? '封禁' : '解封' }}
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="viewUserDetail(scope.row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
    
    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="用户详情"
      width="500px"
    >
      <div v-if="selectedUser" class="user-detail">
        <div class="user-detail-header">
          <el-avatar :size="80" :src="selectedUser.avatar" />
          <div class="user-detail-info">
            <h2>{{ selectedUser.nickName }}</h2>
            <p>用户名: {{ selectedUser.userName }}</p>
            <el-tag :type="selectedUser.status === 0 ? 'success' : 'danger'">
              {{ selectedUser.status === 0 ? '正常' : '已封禁' }}
            </el-tag>
          </div>
        </div>
        
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ selectedUser.id }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedUser.email || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ selectedUser.phone || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ selectedUser.sex === 0 ? '男' : '女' }}</el-descriptions-item>
          <el-descriptions-item label="个人简介">{{ selectedUser.introduce || '未设置' }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button
            :type="selectedUser.status === 0 ? 'danger' : 'success'"
            @click="changeUserStatus(selectedUser, true)"
          >
            {{ selectedUser.status === 0 ? '封禁用户' : '解除封禁' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
    
    <!-- 确认对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      :title="confirmDialogTitle"
      width="400px"
    >
      <div class="confirm-content">
        <p>{{ confirmDialogMessage }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmChangeStatus">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import NavBar from '@/components/NavBar.vue'
import axios from '@/axios'

// 用户列表数据
const userList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchKeyword = ref('')

// 用户详情对话框
const dialogVisible = ref(false)
const selectedUser = ref(null)

// 确认对话框
const confirmDialogVisible = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const userToChange = ref(null)
const closeDetailAfterChange = ref(false)

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const response = await axios.post('/auth/user/getUserList', {
    })
    
    if (response.data.success) {
      userList.value = response.data.data
      // 假设后端返回的是总数，如果没有，可以使用列表长度
      total.value = response.data.data.length || 0
    } else {
      ElMessage.error('获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索用户
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 改变每页显示数量
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUserList()
}

// 改变页码
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUserList()
}

// 查看用户详情
const viewUserDetail = (user) => {
  selectedUser.value = { ...user }
  dialogVisible.value = true
}

// 准备更改用户状态
const changeUserStatus = (user, fromDetail = false) => {
  userToChange.value = user
  closeDetailAfterChange.value = fromDetail
  
  const newStatus = user.status === 0 ? 1 : 0
  confirmDialogTitle.value = newStatus === 1 ? '封禁用户' : '解除封禁'
  confirmDialogMessage.value = newStatus === 1 
    ? `确定要封禁用户 "${user.nickName}" (${user.userName}) 吗？封禁后该用户将无法登录系统。`
    : `确定要解除对用户 "${user.nickName}" (${user.userName}) 的封禁吗？`
  
  confirmDialogVisible.value = true
}

// 确认更改用户状态
const confirmChangeStatus = async () => {
  if (!userToChange.value) return
  
  const user = userToChange.value
  const newStatus = user.status === 0 ? 1 : 0
  
  try {
    const response = await axios.post('/auth/user/changeUserStatus', {
      id: user.id,
      status: newStatus
    })
    
    if (response.data.success) {
      ElMessage.success(newStatus === 1 ? '用户已封禁' : '用户已解封')
      
      // 更新列表中的用户状态
      const index = userList.value.findIndex(u => u.id === user.id)
      if (index !== -1) {
        userList.value[index].status = newStatus
      }
      
      // 如果是从详情页操作的，更新详情页的用户状态
      if (selectedUser.value && selectedUser.value.id === user.id) {
        selectedUser.value.status = newStatus
      }
      
      // 如果需要关闭详情页
      if (closeDetailAfterChange.value) {
        dialogVisible.value = false
      }
    } else {
      ElMessage.error('操作失败: ' + response.data.message)
    }
  } catch (error) {
    console.error('更改用户状态失败:', error)
    ElMessage.error('更改用户状态失败')
  } finally {
    confirmDialogVisible.value = false
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-management-container {
  padding-top: 60px;
}

.management-content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

.management-title {
  text-align: center;
  margin-bottom: 30px;
  color: #409EFF;
}

.user-list-card {
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  max-width: 400px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.user-detail {
  padding: 10px;
}

.user-detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-detail-info {
  margin-left: 20px;
}

.user-detail-info h2 {
  margin: 0 0 10px 0;
}

.user-detail-info p {
  margin: 5px 0;
  color: #666;
}

.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.confirm-content {
  padding: 10px 0;
}
</style>