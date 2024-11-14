<template>
  <div>
    <div class="title-container">
      <FTitle> Guess who </FTitle>
      <FSubTitle> AI Education</FSubTitle>
    </div>
    <video class="video" :src="startScreenAnimation" autoplay loop muted>
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script setup lang="ts">
import { FTitle, FSubTitle } from 'fari-component-library'

import { useWebSocketStore } from '../stores/ws'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import startScreenAnimation from '@/assets/videos/startscreen_animation_ai.mp4'

const router = useRouter()
const webSocketStore = useWebSocketStore()

watch(
  () => webSocketStore.fastifyStarted,
  (started) => {
    console.log(started, 'info')
    if (started) router.push('/info')
  }
)
</script>
<style scoped lang="scss">
.title {
  font-size: 3rem;
}

.title-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 20%;
  left: 30%;
}
</style>
