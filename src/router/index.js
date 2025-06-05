import { createRouter, createWebHistory } from 'vue-router'
import UserView from '../views/UserView.vue'
import ServiceView from '../views/ServiceView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/user',
      name: 'user',
      component: UserView,
    },
    {
      path: '/service',
      name: 'service',
      component: ServiceView,
    },
  ],
})

export default router
