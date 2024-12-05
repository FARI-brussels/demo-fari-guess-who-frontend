import { createRouter, createWebHistory } from 'vue-router'
import InteractiveStart from '../views/InteractiveStart.vue'
import CharacterSelectView from '../views/CharacterSelectView.vue'
import InfoStart from '../views/InfoStart.vue'
import InteractiveView from '@/views/InteractiveView.vue'
import InfoView from '@/views/InfoView.vue'
import { useWebSocketStore } from '@/stores/ws'

const INACTIVITY_TIMEOUT = 300000
let inactivityTimer: NodeJS.Timeout | null = null

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer)

  inactivityTimer = setTimeout(() => {
    window.location.reload()
  }, INACTIVITY_TIMEOUT)
}

function setupInactivityDetection() {
  const events = ['mousemove', 'click', 'keydown', 'touchstart', 'touchmove']

  events.forEach((event) => document.addEventListener(event, resetInactivityTimer))
}

const monitoredRoutes = ['character-select', 'interactive']

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

  // if (monitoredRoutes.includes(to.name)) {
  //   resetInactivityTimer()
  //   setupInactivityDetection()
  // } else {
  //   if (inactivityTimer) clearTimeout(inactivityTimer)
  //   document.removeEventListener('mousemove', resetInactivityTimer)
  //   document.removeEventListener('click', resetInactivityTimer)
  //   document.removeEventListener('keydown', resetInactivityTimer)
  // }

  if (to.name === 'interactive' && from.path === '/' && !webSocketStore.fastifyStarted) {
    webSocketStore.sendFastify('stop')
    next({ name: 'interactive-start' })
  } else {
    next()
  }
})

export default router
