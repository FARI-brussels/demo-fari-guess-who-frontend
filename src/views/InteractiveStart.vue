<template>
  <div class="bg-color-blue">
    <div class="title-container">
      <FTitle> Guess who </FTitle>
      <FSubTitle> AI Education</FSubTitle>
    </div>
    <FButton class="start-button" @click="router.push('/character-select')" label="start" />
    <video class="video" :src="startScreenAnimation" autoplay loop muted>
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script setup lang="ts">
import { FTitle, FSubTitle, FButton } from 'fari-component-library'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import startScreenAnimation from '@/assets/videos/startscreen_animation_human.mp4'

const router = useRouter()
const gameStore = useGameStore()

onMounted(async () => await gameStore.loadImages())
console.log('Video Source Path:', startScreenAnimation)
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

.start-button {
  position: absolute;
  left: 45%;
  top: 45%;
}

.video {
  width: 100%;
  height: auto;
  z-index: -1;
  pointer-events: none;
  object-fit: cover;
}
</style>
