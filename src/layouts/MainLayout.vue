<template>
  <v-app>
    <!-- Sidebar Navigation -->
    <v-navigation-drawer v-model="drawer" permanent color="white">
      <v-list-item title="Motor Pool System" subtitle="Management System" nav class="py-4">
        <template v-slot:prepend>
          <v-icon color="primary" size="32">mdi-car-wrench</v-icon>
        </template>
      </v-list-item>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-subheader>MAIN</v-list-subheader>

        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/" rounded="lg" />

        <v-list-subheader>MOTOR POOL</v-list-subheader>

        <v-list-item prepend-icon="mdi-car" title="Assets" to="/vehicles" rounded="lg" />
        <v-list-item
          prepend-icon="mdi-wrench"
          title="Service Requests"
          to="/vehicle-requests"
          rounded="lg"
        />
        <v-list-item
          prepend-icon="mdi-calendar-check"
          title="Preventive Maintenance"
          to="/vehicle-pm"
          rounded="lg"
        />
        <v-list-item
          prepend-icon="mdi-clipboard-text-clock"
          title="PM Program"
          to="/pm-program"
          rounded="lg"
        />
        <v-list-item
          prepend-icon="mdi-file-document-edit"
          title="Annual PM Program"
          to="/annual-pm"
          rounded="lg"
        />

        <v-list-subheader>AIR CONDITIONER</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-air-conditioner"
          title="AC Units"
          to="/ac-units"
          rounded="lg"
        />
        <v-list-item
          prepend-icon="mdi-clipboard-list"
          title="AC Service Requests"
          to="/ac-requests"
          rounded="lg"
        />
        <v-list-item
          prepend-icon="mdi-snowflake"
          title="AC Cleaning Log"
          to="/ac-cleaning"
          rounded="lg"
        />
      </v-list>
      <v-list-subheader>FUEL MANAGEMENT</v-list-subheader>
      <v-list-item
        prepend-icon="mdi-file-document-multiple"
        title="Fuel Contracts"
        to="/fuel-contracts"
        rounded="lg"
      />
    </v-navigation-drawer>

    <!-- Top Bar -->
    <v-app-bar elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>{{ currentPageTitle }}</v-app-bar-title>
      <template v-slot:append>
        <v-chip color="primary" class="mr-3">
          <v-icon start>mdi-account</v-icon>
          Admin
        </v-chip>
      </template>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const drawer = ref(true)
const route = useRoute()

const pageTitles = {
  '/': 'Dashboard',
  '/vehicles': 'Vehicle Registry',
  '/vehicle-requests': 'Vehicle Service Requests',
  '/vehicle-pm': 'Preventive Maintenance',
  '/ac-units': 'AC Unit Registry',
  '/ac-requests': 'AC Service Requests',
  '/ac-cleaning': 'AC Cleaning Log',
}

const currentPageTitle = computed(() => pageTitles[route.path] || 'Motor Pool System')
</script>
