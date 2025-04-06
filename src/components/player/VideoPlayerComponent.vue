<template>
  <div class="video-wrapper">
    <video
      ref="videoPlayer"
      controls
      autoplay
      @timeupdate="updateDanmaku"
      @fullscreenchange="handleFullscreenChange"
      class="video-element"
    >
      <source :src="video?.videoUrl" type="video/mp4" />
      您的浏览器不支持视频播放。
    </video>
    <div ref="danmakuContainer" class="danmaku-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits } from 'vue'
import { throttle } from 'lodash'

const props = defineProps({
  video: Object,
  danmakuList: Array,
  danmakuDensity: String
})

const emit = defineEmits(['update-active-danmaku'])

const videoPlayer = ref<HTMLVideoElement | null>(null)
const danmakuContainer = ref<HTMLElement | null>(null)
const activeDanmaku = ref<Map<number, { element: HTMLElement; animation: Animation }>>(new Map())

const updateDanmaku = throttle(() => {
  if (!videoPlayer.value || !danmakuContainer.value) return
  const currentTime = videoPlayer.value.currentTime
  props.danmakuList?.forEach((danmaku) => {
    if (
      Math.abs(danmaku.sendTime - currentTime) < 0.5 &&
      !activeDanmaku.value.has(danmaku.id)
    ) {
      renderDanmaku(danmaku)
    }
  })
}, 200)

const renderDanmaku = (danmaku) => {
  if (!danmakuContainer.value || !videoPlayer.value) return
  const danmakuEl = document.createElement('div')
  danmakuEl.className = 'danmaku'
  danmakuEl.textContent = danmaku.content
  danmakuEl.style.color = danmaku.color || '#ffffff'

  const containerWidth = danmakuContainer.value.clientWidth
  danmakuEl.style.position = 'absolute'
  danmakuEl.style.left = `${containerWidth}px`

  if (props.danmakuDensity === 'normal') {
    const trackHeight = 40
    let top = 0
    let overlap = true
    while (overlap) {
      overlap = false
      for (const [, { element }] of activeDanmaku.value) {
        const activeTop = parseInt(element.style.top) || 0
        if (Math.abs(activeTop - top) < trackHeight) {
          overlap = true
          top += trackHeight
          break
        }
      }
      if (top + trackHeight > danmakuContainer.value.clientHeight) top = 0
    }
    danmakuEl.style.top = `${top}px`
  } else {
    const maxTop = danmakuContainer.value.clientHeight - 30
    danmakuEl.style.top = `${Math.random() * maxTop}px`
  }

  danmakuContainer.value.appendChild(danmakuEl)
  const animation = danmakuEl.animate(
    [
      { left: `${containerWidth}px` },
      { left: `-${danmakuEl.offsetWidth}px` }
    ],
    { duration: 5000, easing: 'linear', fill: 'forwards' }
  )
  activeDanmaku.value.set(danmaku.id, { element: danmakuEl, animation })
  emit('update-active-danmaku', activeDanmaku.value)

  animation.onfinish = () => {
    danmakuEl.remove()
    activeDanmaku.value.delete(danmaku.id)
    emit('update-active-danmaku', activeDanmaku.value)
  }
}

const handleFullscreenChange = () => {
  if (!videoPlayer.value || !danmakuContainer.value) return
  const isFullscreen = document.fullscreenElement === videoPlayer.value
  if (isFullscreen) {
    danmakuContainer.value.style.width = '100vw'
    danmakuContainer.value.style.height = '100vh'
    danmakuContainer.value.style.top = '0'
    danmakuContainer.value.style.left = '0'
    activeDanmaku.value.forEach(({ element }) => {
      element.style.left = `${window.innerWidth}px`
    })
  } else {
    danmakuContainer.value.style.width = '100%'
    danmakuContainer.value.style.height = '100%'
    danmakuContainer.value.style.top = '0'
    danmakuContainer.value.style.left = '0'
    activeDanmaku.value.forEach(({ element }) => {
      element.style.left = `${danmakuContainer.value?.clientWidth}px`
    })
  }
}

watch(
  () => props.video?.videoUrl,
  (newUrl) => {
    if (newUrl && videoPlayer.value) {
      videoPlayer.value.src = newUrl
      videoPlayer.value.load()
      videoPlayer.value.play().catch((error) => console.error('自动播放失败:', error))
    }
  }
)

onUnmounted(() => {
  activeDanmaku.value.forEach(({ animation }) => animation.cancel())
  activeDanmaku.value.clear()
})

defineExpose({
  videoPlayer,
  activeDanmaku
})
</script>

<style scoped>
.video-wrapper {
  position: relative;
  width: 100%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  display: block;
}

.danmaku-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.danmaku {
  position: absolute;
  white-space: nowrap;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}
</style>