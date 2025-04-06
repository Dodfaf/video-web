<template>
  <div class="recommended-videos">
    <h3>推荐视频</h3>
    <div class="video-preview-list">
      <div class="video-preview" v-for="i in 5" :key="i">
        <div class="video-preview-img">
          <img src="https://via.placeholder.com/160x90" alt="视频预览" />
          <span class="video-duration">03:45</span>
        </div>
        <div class="video-preview-info">
          <p class="video-preview-title">示例推荐视频标题{{ i }}</p>
          <p class="video-preview-stats">
            <span class="preview-uploader">UP主名称</span>
            <span class="preview-views">播放: 1.2万</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 未来可以添加获取推荐视频的逻辑
</script>

<style scoped>
.recommended-videos {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 15px;
}

.recommended-videos h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
}

.video-preview-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.video-preview {
  display: flex;
  cursor: pointer;
}

.video-preview:hover .video-preview-title {
  color: #409eff;
}

.video-preview-img {
  position: relative;
  width: 160px;
  height: 90px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.video-preview-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 12px;
}

.video-preview-info {
  margin-left: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-preview-title {
  margin: 0 0 5px;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}

.video-preview-stats {
  margin: 0;
  font-size: 12px;
  color: #666;
  display: flex;
  flex-direction: column;
}

.preview-uploader {
  margin-bottom: 2px;
}
</style>