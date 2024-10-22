import { createRouter, createWebHistory } from 'vue-router'
import InteractiveStart from '../views/InteractiveStart.vue'
import InfoStart from '../views/InfoStart.vue'
import InteractiveView from '@/views/InteractiveView.vue'
import InfoView from '@/views/InfoView.vue'

const routes = [
  {
    path: '/',
    redirect: '/interactive-start' // Default route redirects to the interactive start screen
  },
  {
    path: '/interactive-start',
    component: InteractiveStart // Screen with the "start" button
  },
  {
    path: '/info-start',
    component: InfoStart // Screen without the "start" button
  },
  {
    path: '/interactive',
    component: InteractiveView // Interactive view after clicking "start"
  },
  {
    path: '/info',
    component: InfoView // Info view after clicking "start" on the interactive screen
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
