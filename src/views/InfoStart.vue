<template>
  <div class="bg-color-blue">
    <h1>Info Screen start</h1>
    <p>{{ webSocketStore.fastifyStarted }}</p>
  </div>
</template>

<script setup lang="ts">
import { useWebSocketStore } from '../stores/ws'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

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
