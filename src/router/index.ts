import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import DashboardHome from '../views/DashboardHome.vue'
import ProductsList from '../views/ProductsList.vue'
import OrdersList from '../views/OrdersList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DashboardLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardHome
        },
        {
          path: 'products',
          name: 'products',
          component: ProductsList
        },
        {
          path: 'orders',
          name: 'orders',
          component: OrdersList
        }
      ]
    }
  ]
})

export default router