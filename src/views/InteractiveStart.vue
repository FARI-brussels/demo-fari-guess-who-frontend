<template>
  <div class="bg-color-blue">
    <div class="title-container">
      <FTitle> Guess who </FTitle>
      <FSubTitle> Resource optimization</FSubTitle>
    </div>
    <FButton class="start-button" @click="send('start')" label="start" />
    <!-- <img src="@/assets/screen.svg" /> -->
  </div>
</template>

<script setup lang="ts">
import { FTitle, FSubTitle, FFooter, FButton } from 'fari-component-library'
import { useWebSocketStore } from '../stores/ws'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const webSocketStore = useWebSocketStore()

defineProps<{ send: Function; started: boolean }>()

watch(
  () => webSocketStore.fastifyStarted,
  (started) => {
    console.log({ started })
    if (started) {
      console.log({ router })
      router.push('/interactive')
    }
  }
)
</script>

<style scoped lang="scss">
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
</style>
