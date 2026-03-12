<template>
  <v-app>
    <!-- Sidebar Navigation -->
    <v-navigation-drawer v-model="drawer" permanent width="300">
      <v-list-item title="Fleet Manager System" subtitle="CSU General Services" nav class="py-4">
        <template v-slot:prepend>
          <v-icon color="primary" size="32">mdi-car-wrench</v-icon>
        </template>
      </v-list-item>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-subheader>MAIN</v-list-subheader>

        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/" rounded="lg" />

        <v-list-subheader>MOTOR POOL</v-list-subheader>

        <v-list-subheader>MOTOR POOL</v-list-subheader>

        <v-list-item prepend-icon="mdi-car" title="Asset Registry" to="/vehicles" rounded="lg" />
        <v-list-item
          prepend-icon="mdi-wrench"
          title="Service Requests"
          to="/vehicle-requests"
          rounded="lg"
        />

        <v-list-group value="preventive-maintenance">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-calendar-check"
              title="Preventive Maintenance"
              rounded="lg"
            />
          </template>

          <v-list-item
            title="Schedule of Maintenance"
            to="/vehicle-pm"
            rounded="lg"
            style="padding-left: 16px !important"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="mr-2">mdi-calendar-clock</v-icon>
            </template>
          </v-list-item>

          <v-list-item
            title="Maintenance Log"
            to="/maintenance-log"
            rounded="lg"
            style="padding-left: 16px !important"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="mr-2">mdi-table-eye</v-icon>
            </template>
          </v-list-item>
        </v-list-group>

        <v-list-item
          prepend-icon="mdi-clipboard-text-clock"
          title="Preventive Maintenance Program"
          to="/schedule-of-maintenance"
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
      <v-list-item
        prepend-icon="mdi-receipt-text"
        title="Fuel Transactions"
        to="/fuel-transactions"
        rounded="lg"
      />
    </v-navigation-drawer>

    <!-- Top Bar -->
    <v-app-bar elevation="1" :width="drawer ? 'calc(100% - 260px)' : '100%'">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>{{ currentPageTitle }}</v-app-bar-title>
      <template v-slot:append>
        <v-btn
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          class="mr-1"
          @click="toggleTheme"
        />
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
import { useTheme } from 'vuetify'

const drawer = ref(true)
const route = useRoute()
const theme = useTheme()
const isDark = computed(() => theme.global.name.value === 'dark')

function toggleTheme() {
  theme.change(isDark.value ? 'dark' : 'light')
}

const pageTitles = {
  '/': 'Dashboard',
  '/vehicles': 'Asset Registry',
  '/vehicle-requests': 'Service Requests',
  '/vehicle-pm': 'Schedule of Maintenance',
  '/maintenance-log': 'Maintenance Log',
  '/schedule-of-maintenance': 'Preventive Maintenance Program',
  '/annual-pm': 'Annual PM Program',
  '/ac-units': 'AC Unit Registry',
  '/ac-requests': 'AC Service Requests',
  '/ac-cleaning': 'AC Cleaning Log',
}
const currentPageTitle = computed(() => pageTitles[route.path] || 'Motor Pool System')
</script>
