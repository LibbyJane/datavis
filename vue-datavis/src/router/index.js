import { createRouter, createWebHistory } from 'vue-router'
import FitnessTrackerView from '@/views/FitnessTracker.vue'
import PieChartView from '@/views/PieChart.vue'
import BarChartView from '@/views/BarChart.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: FitnessTrackerView,
    },
    {
      path: '/line',
      name: 'Fitness Tracker',
      component: FitnessTrackerView
      // component: () => import('../views/FitnessTracker.vue')
    },
    {
      path: '/pie',
      name: 'Pie chart',
      component: PieChartView

      //component: () => import('../views/PieChart.vue')
    },
    {
      path: '/bar',
      name: 'Bar chart',
      component: BarChartView

      //component: () => import('../views/BarChart.vue')
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
