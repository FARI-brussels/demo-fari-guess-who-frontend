import { createRouter, createWebHistory } from 'vue-router'
import InteractiveStart from '../views/InteractiveStart.vue'
import CharacterSelectView from '../views/CharacterSelectView.vue'
import InfoStart from '../views/InfoStart.vue'
import InteractiveView from '@/views/InteractiveView.vue'
import InfoView from '@/views/InfoView.vue'
import { useWebSocketStore } from '@/stores/ws'

const routes = [
  {
    path: '/',
    name: '/',
    redirect: '/interactive-start'
  },
  {
    name: 'interactive-start',
    path: '/interactive-start',
    component: InteractiveStart
  },
  {
    name: 'info-start',
    path: '/info-start',
    component: InfoStart
  },
  {
    name: 'character-select',
    path: '/character-select',
    component: CharacterSelectView
  },
  {
    name: 'interactive',
    path: '/interactive',
    component: InteractiveView
  },
  {
    name: 'info',
    path: '/info',
    component: InfoView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const webSocketStore = useWebSocketStore()
  console.log({ to, from, started: webSocketStore.fastifyStarted })
  if (to.name === 'interactive' && from.path === '/' && !webSocketStore.fastifyStarted) {
    webSocketStore.sendFastify('stop')
    next({ name: 'interactive-start' })
  } else {
    next()
  }
})

export default router
