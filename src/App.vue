<template>
  <div id="app" class="bg-color-blue">
    <FDemoAppBar
      v-if="isInteractiveRoute"
      dense
      @exit="webSocketStore.sendFastify('stop')"
      class="appbar"
    />

    <main>
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

    <FFooter v-if="route.name === 'interactive-start'"></FFooter>
  </div>
</template>

<script setup lang="ts">
import { FFooter, FDemoAppBar } from 'fari-component-library'
import { useWebSocketStore } from './stores/ws'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const webSocketStore = useWebSocketStore()

const route = useRoute()
const isInteractiveRoute = computed(() => {
  return route.name === 'interactive'
})
</script>

<style scoped lang="scss">
main {
  width: 100%;
  height: 100%;
}
.appbar {
  position: absolute;
  top: 2rem;
  z-index: 1;
}
footer {
  margin-top: auto;
  position: absolute;
  bottom: 0;
  width: 100%;
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
