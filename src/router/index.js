import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'vehicles',
          name: 'vehicles',
          component: () => import('../views/VehiclesView.vue'),
        },
        {
          path: 'vehicle-requests',
          name: 'vehicle-requests',
          component: () => import('../views/VehicleRequestsView.vue'),
        },
        {
          path: 'vehicle-pm',
          name: 'vehicle-pm',
          component: () => import('../views/VehiclePMView.vue'),
        },
        {
          path: 'pm-program',
          name: 'PMProgram',
          component: () => import('../views/PMProgramView.vue'),
        },

        {
          path: 'annual-pm',
          name: 'AnnualPM',
          component: () => import('../views/AnnualPMView.vue'),
        },
        {
          path: 'maintenance-overview',
          name: 'MaintenanceOverview',
          component: () => import('../views/MaintenanceOverviewView.vue'),
        },

        {
          path: 'ac-units',
          name: 'ac-units',
          component: () => import('../views/ACUnitsView.vue'),
        },
        {
          path: 'ac-requests',
          name: 'ac-requests',
          component: () => import('../views/ACRequestsView.vue'),
        },
        {
          path: 'ac-cleaning',
          name: 'ac-cleaning',
          component: () => import('../views/ACCleaningView.vue'),
        },
        { path: '/fuel-contracts', component: () => import('../views/FuelContractsView.vue') },
        {
          path: '/fuel-transactions',
          component: () => import('../views/FuelTransactionsView.vue'),
        },
      ],
    },
  ],
})

export default router
