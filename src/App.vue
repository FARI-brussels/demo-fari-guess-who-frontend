<!-- App.vue -->
<template>
  <div id="app" class="bg-color-blue">
    <!-- <header>
      <FDemoAppBar dense @exit="webSocketStore.sendFastify('stop')" />
    </header> -->
    <main>
      <!-- Passing the necessary WebSocket methods and state to the child components via router-view -->
      <!-- <router-view
        :status="webSocketStore.fastifyStatus"
        :started="webSocketStore.fastifyStarted"
        :data="webSocketStore.fastifyData"
        :send="webSocketStore.sendFastify"
        :open="webSocketStore.openFastify"
        :close="webSocketStore.closeFastify"
      /> -->
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component
            :is="Component"
            :status="webSocketStore.fastifyStatus"
            :started="webSocketStore.fastifyStarted"
            :data="webSocketStore.fastifyData"
            :send="webSocketStore.sendFastify"
            :open="webSocketStore.openFastify"
            :close="webSocketStore.closeFastify"
          />
        </transition>
      </router-view>
    </main>
    <footer v-if="!webSocketStore.fastifyStarted">
      <FFooter></FFooter>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { FTitle, FSubTitle, FFooter, FDemoAppBar } from 'fari-component-library'

import { useWebSocketStore } from './stores/ws'

const webSocketStore = useWebSocketStore()
</script>

<style scoped lang="scss">
main {
  // padding: 2rem;
  width: 100%;
  height: 100%;
}
footer {
  margin-top: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
