// store.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useWebSocket } from '@vueuse/core'

const fastifyWsUrl = import.meta.env.VITE_FASTIFY_WEBSOCKET_URL

export const useWebSocketStore = defineStore('webSocket', () => {
  const {
    status: fastifyStatus,
    data: fastifyData,
    send: sendFastify,
    open: openFastify,
    close: closeFastify
  } = useWebSocket(fastifyWsUrl)

  const fastifyStarted = ref(false)
  const fastifyDecisionTree = ref(null)

  watch(
    () => [fastifyStatus, fastifyData],
    ([newStatus, newData]) => {
      if (newStatus.value === 'OPEN') {
        if (newData.value === 'start') fastifyStarted.value = true
        if (newData.value === 'stop') {
          fastifyStarted.value = false
        } else fastifyDecisionTree.value = newData.value
      }
    },
    { deep: true, immediate: true }
  )

  watch(fastifyData, (data) => console.log({ fastifyData: data }))

  return {
    fastifyStatus,
    fastifyStarted,
    fastifyData,
    fastifyDecisionTree,
    sendFastify,
    openFastify,
    closeFastify
  }
})
