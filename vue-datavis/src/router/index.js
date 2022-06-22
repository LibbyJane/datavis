import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue' // these components will be pre-loaded rather than lazy loaded
import FitnessTrackerView from '@/views/FitnessTracker.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/line',
      name: 'Fitness Tracker',
      component: FitnessTrackerView
      // component: () => import('../views/FitnessTracker.vue')
    }
  ]
})
// router.beforeEach(async (to, from, next) => {
//   const userStore = useUserStore();

//   // console.log('to, from, next, logged in?', to.meta, from, next, userStore.getAuth)

//   if (!userStore.getAuth && to.meta.requiresAuth) {
//     next('/login')
//   } else if (userStore.getAuth && !to.meta.requiresAuth) {
//     // console.log('hide login page from authenticated users')
//     next('/')
//   } else {
//     next();
//   }
// })


export default router
