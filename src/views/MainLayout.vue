<template>
  <v-app>
    <!-- Sidebar Navigation -->
    <v-navigation-drawer v-model="drawer" permanent width="300" color="#003300">
      <v-list-item title="Fleet Manager System" subtitle="CSU General Services" nav class="py-4">
        <template v-slot:prepend>
          <v-icon color="primary" size="32">mdi-car-wrench</v-icon>
        </template>
      </v-list-item>

      <v-divider />

      <v-list density="compact" nav>

        <!-- ── MAIN ── -->
        <v-list-subheader>MAIN</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/"
          rounded="lg"
        />

        <!-- ── MOTOR POOL ── -->
        <v-list-subheader>MOTOR POOL</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-car"
          title="Asset Registry"
          to="/vehicles"
          rounded="lg"
        />
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

        <!-- ── AIR CONDITIONER ── -->
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

        <!-- ── FUEL MONITORING ── -->
        <!-- Renamed from "FUEL MANAGEMENT" to match the new module naming -->
        <v-list-subheader>FUEL MONITORING</v-list-subheader>

        <!-- Fuel Dashboard: overview with charts, alerts, recent transactions -->
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Fuel Dashboard"
          to="/fuel-dashboard"
          rounded="lg"
        />

        <!-- Fuel Allocation Monitoring: renamed from "Fuel Contracts" -->
        <v-list-item
          prepend-icon="mdi-file-document-multiple"
          title="Fuel Allocation Monitoring"
          to="/fuel-contracts"
          rounded="lg"
        />

        <v-list-item
          prepend-icon="mdi-receipt-text"
          title="Fuel Transactions"
          to="/fuel-transactions"
          rounded="lg"
        />

        <!-- Fuel Reports: replaces old "Fuel Summary Report" with 4 tabs -->
        <v-list-item
          prepend-icon="mdi-chart-box"
          title="Fuel Reports"
          to="/fuel-reports"
          rounded="lg"
        />

        <!-- ── PRINTABLE REPORTS ── -->
        <v-list-subheader>PRINTABLE REPORTS</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-clipboard-check"
          title="PMC Report"
          to="/pmc-report"
          rounded="lg"
        />
        <v-list-item
          prepend-icon="mdi-history"
          title="EFHR Report"
          to="/efhr-report"
          rounded="lg"
        />

      </v-list>

      <!-- Annual PM — kept outside the list to match original placement -->
      <v-list-item
        prepend-icon="mdi-file-document-edit"
        title="Annual PM Program"
        to="/annual-pm"
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

// Load saved theme preference on startup
const savedTheme = localStorage.getItem('csu-theme')
if (savedTheme) theme.change(savedTheme)

function toggleTheme() {
  const next = isDark.value ? 'light' : 'dark'
  theme.change(next)
  localStorage.setItem('csu-theme', next)
}

// pageTitles: maps each route path to a human-readable title shown in the top bar.
// WHY: the top bar reads from this map using the current route path.
// Always add a new entry here whenever you add a new route in index.js.
const pageTitles = {
  // Fleet Management
  '/': 'Dashboard',
  '/vehicles': 'Asset Registry',
  '/vehicle-requests': 'Service Requests',
  '/vehicle-pm': 'Schedule of Maintenance',
  '/maintenance-log': 'Maintenance Log',
  '/schedule-of-maintenance': 'Preventive Maintenance Program',
  '/annual-pm': 'Annual PM Program',

  // AC Management
  '/ac-units': 'AC Unit Registry',
  '/ac-requests': 'AC Service Requests',
  '/ac-cleaning': 'AC Cleaning Log',

  // Fuel Monitoring — new entries added here
  '/fuel-dashboard': 'Fuel Dashboard',
  '/fuel-contracts': 'Fuel Allocation Monitoring',
  '/fuel-transactions': 'Fuel Transactions',
  '/fuel-reports': 'Fuel Reports',
  '/fuel-summary-report': 'Fuel Summary Report', // kept for backward compatibility

  // Printable Reports
  '/pmc-report': 'PMC Report',
  '/efhr-report': 'EFHR Report',
}

const currentPageTitle = computed(() => pageTitles[route.path] || 'Motor Pool System')
</script>
