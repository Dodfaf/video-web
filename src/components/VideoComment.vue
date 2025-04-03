<template>
  <div class="comment-container">
    <!-- 评论输入框 -->
    <div class="comment-input">
      <el-input
        v-model="commentContent"
        type="textarea"
        :rows="3"
        placeholder="发表你的评论..."
        maxlength="200"
        show-word-limit
      ></el-input>
      <div class="comment-actions">
        <el-button type="primary" @click="submitMoment" :disabled="!commentContent.trim()">发表评论</el-button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list">
      <div class="comment-header">
        <span class="comment-count">{{ momentList.length }} 条评论</span>
      </div>
      
      <div v-if="momentList.length === 0" class="no-comment">
        暂无评论，快来发表第一条评论吧！
      </div>
      
      <div v-for="moment in momentList" :key="moment.id" class="comment-item">
        <div class="comment-user">
          <el-avatar :size="40" :src="moment.userAvatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
          <div class="user-info">
            <div class="username">{{ moment.userName }}</div>
            <div class="comment-time">{{ formatTime(moment.createdTime) }}</div>
          </div>
        </div>
        <div class="comment-content">{{ moment.content }}</div>
        
        <!-- 回复列表 -->
        <div class="reply-list" v-if="moment.comments && moment.comments.length > 0">
          <div v-for="comment in moment.comments" :key="comment.id" class="reply-item">
            <div class="reply-user">
              <el-avatar :size="30" :src="comment.userAvatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
              <div class="user-info">
                <div class="username">
                  {{ comment.userName }} 
                  <span class="reply-to" v-if="comment.targetUserName">回复 {{ comment.targetUserName }}</span>
                </div>
                <div class="comment-time">{{ formatTime(comment.createdTime) }}</div>
              </div>
            </div>
            <div class="reply-content">{{ comment.content }}</div>
          </div>
        </div>
        
        <!-- 回复数量显示 -->
        <div class="reply-count" v-if="moment.replyCount > 0 && (!moment.comments || moment.comments.length === 0)">
          {{ moment.replyCount }} 条回复
        </div>
        
        <!-- 回复输入框 -->
        <div class="reply-actions">
          <span class="reply-btn" @click="showReplyInput(moment.id)">回复</span>
        </div>
        <div v-if="activeReplyId === moment.id" class="reply-input">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="2"
            placeholder="回复评论..."
            maxlength="200"
            show-word-limit
          ></el-input>
          <div class="reply-input-actions">
            <el-button size="small" @click="cancelReply">取消</el-button>
            <el-button size="small" type="primary" @click="submitComment(moment.id)" :disabled="!replyContent.trim()">回复</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from '@/axios';
import { useUserStore } from '@/stores/user';

export default {
  name: 'VideoComment',
  props: {
    videoId: {
      type: [Number, String],
      required: true
    }
  },
  setup(props) {
    const userStore = useUserStore();
    const commentContent = ref('');
    const replyContent = ref('');
    const momentList = ref([]);
    const activeReplyId = ref(null);

    // 获取视频下的所有一级评论（moments）
    const getMoments = async () => {
      try {
        const response = await axios.post('/comment/share/moment/getMoments', {
          videoId: Number(props.videoId),
          pageInfo: {
            pageNo: 1,
            pageSize: 10
          }
        });
        
        if (response.data.code === 200) {
          momentList.value = response.data.data.result || [];
          // 获取每个moment下的评论
          momentList.value.forEach(moment => {
            getComments(moment.id);
          });
        }
      } catch (error) {
        console.error('获取评论失败:', error);
        if (error.response) {
          console.error('错误状态码:', error.response.status);
          console.error('错误响应数据:', error.response.data);
        }
        ElMessage.error('获取评论失败，请稍后重试');
      }
    };

    // 获取某个moment下的评论列表
    const getComments = async (momentId) => {
      try {
        const response = await axios.post('/comment/share/comment/list', {
          id: momentId,
          pageInfo: {
            pageNo: 1,
            pageSize: 20
          }
        });
        
        if (response.data.code === 200) {
          // 找到对应的moment并添加comments属性
          const moment = momentList.value.find(m => m.id === momentId);
          if (moment) {
            moment.comments = response.data.data.result || [];
          }
        }
      } catch (error) {
        console.error('获取回复列表失败:', error);
        if (error.response) {
          console.error('错误响应数据:', error.response.data);
        }
      }
    };

    // 提交一级评论（moment）
    const submitMoment = async () => {
      if (!commentContent.value.trim()) return;
      
      try {
        const response = await axios.post('/comment/share/moment/save', {
          videoId: Number(props.videoId),
          content: commentContent.value,
          picUrlList: []
        });
        
        if (response.data.code === 200) {
          ElMessage.success('评论发表成功');
          commentContent.value = '';
          getMoments(); // 重新获取评论列表
        }
      } catch (error) {
        console.error('发表评论失败:', error);
        if (error.response) {
          console.error('错误响应数据:', error.response.data);
        }
        ElMessage.error('评论发表失败，请稍后重试');
      }
    };

    // 显示回复输入框
    const showReplyInput = (momentId) => {
      activeReplyId.value = momentId;
      replyContent.value = '';
    };

    // 取消回复
    const cancelReply = () => {
      activeReplyId.value = null;
      replyContent.value = '';
    };

    // 提交评论（对moment的回复）
    const submitComment = async (momentId) => {
      if (!replyContent.value.trim()) return;
      
      try {
        const response = await axios.post('/comment/share/comment/save', {
          replyType: 1, // 对moment的回复
          momentId: momentId,
          content: replyContent.value,
          picUrlList: []
        });
        
        if (response.data.code === 200) {
          ElMessage.success('回复成功');
          replyContent.value = '';
          activeReplyId.value = null;
          getComments(momentId); // 重新获取该moment下的评论
          
          // 更新回复数量
          const moment = momentList.value.find(m => m.id === momentId);
          if (moment) {
            moment.replyCount = (moment.replyCount || 0) + 1;
          }
        }
      } catch (error) {
        console.error('回复评论失败:', error);
        if (error.response) {
          console.error('错误响应数据:', error.response.data);
        }
        ElMessage.error('回复失败，请稍后重试');
      }
    };

    // 格式化时间
    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now - date;
      
      // 一分钟内
      if (diff < 60 * 1000) {
        return '刚刚';
      }
      // 一小时内
      if (diff < 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 1000))}分钟前`;
      }
      // 一天内
      if (diff < 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
      }
      // 一年内
      if (diff < 365 * 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
      }
      
      // 超过一年
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    onMounted(() => {
      console.log('VideoComment 组件挂载，videoId:', props.videoId);
      console.log('当前用户 token:', userStore.token);
      if (props.videoId) {
        getMoments();
      }
    });

    return {
      commentContent,
      replyContent,
      momentList,
      activeReplyId,
      submitMoment,
      submitComment,
      showReplyInput,
      cancelReply,
      formatTime
    };
  }
}
</script>

<style scoped>
.comment-container {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.comment-input {
  margin-bottom: 20px;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.comment-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.comment-count {
  font-size: 16px;
  font-weight: bold;
}

.no-comment {
  color: #999;
  text-align: center;
  padding: 20px 0;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.comment-user, .reply-user {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.user-info {
  margin-left: 10px;
}

.username {
  font-weight: bold;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.comment-content, .reply-content {
  margin-left: 50px;
  margin-bottom: 10px;
  line-height: 1.5;
}

.reply-list {
  margin-left: 50px;
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 10px;
}

.reply-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-to {
  color: #409EFF;
  font-weight: normal;
  margin-left: 5px;
}

.reply-content {
  margin-left: 40px;
}

.reply-actions {
  margin-left: 50px;
  margin-top: 5px;
}

.reply-btn {
  color: #409EFF;
  cursor: pointer;
  font-size: 13px;
}

.reply-input {
  margin-left: 50px;
  margin-top: 10px;
}

.reply-input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  gap: 10px;
}
</style>