<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <h2 class="text-h5 font-weight-bold">Dashboard</h2>
        <p class="text-medium-emphasis text-body-2 mt-1">
          Motor Pool & AC Management System — {{ todayFormatted }}
        </p>
      </v-col>
    </v-row>

    <!-- TOP SUMMARY CARDS -->
    <v-row class="mb-4">
      <!-- Vehicles -->
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="text-center pa-3">
            <v-avatar color="primary" variant="tonal" size="40" class="mb-2">
              <v-icon size="20">mdi-car</v-icon>
            </v-avatar>
            <p class="text-h5 font-weight-bold">{{ stats.totalVehicles }}</p>
            <p class="text-caption text-medium-emphasis">Total Vehicles</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="text-center pa-3">
            <v-avatar color="error" variant="tonal" size="40" class="mb-2">
              <v-icon size="20">mdi-alert-circle</v-icon>
            </v-avatar>
            <p class="text-h5 font-weight-bold text-error">{{ stats.overduePM }}</p>
            <p class="text-caption text-medium-emphasis">Overdue PM</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="text-center pa-3">
            <v-avatar color="warning" variant="tonal" size="40" class="mb-2">
              <v-icon size="20">mdi-clock-alert</v-icon>
            </v-avatar>
            <p class="text-h5 font-weight-bold text-warning">{{ stats.dueSoonPM }}</p>
            <p class="text-caption text-medium-emphasis">Due Soon</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="text-center pa-3">
            <v-avatar color="warning" variant="tonal" size="40" class="mb-2">
              <v-icon size="20">mdi-wrench-clock</v-icon>
            </v-avatar>
            <p class="text-h5 font-weight-bold">{{ stats.inProgressSR }}</p>
            <p class="text-caption text-medium-emphasis">In Repair</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="text-center pa-3">
            <v-avatar color="info" variant="tonal" size="40" class="mb-2">
              <v-icon size="20">mdi-air-conditioner</v-icon>
            </v-avatar>
            <p class="text-h5 font-weight-bold">{{ stats.totalAC }}</p>
            <p class="text-caption text-medium-emphasis">AC Units</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="text-center pa-3">
            <v-avatar color="success" variant="tonal" size="40" class="mb-2">
              <v-icon size="20">mdi-fuel</v-icon>
            </v-avatar>
            <p class="text-h5 font-weight-bold">{{ stats.fuelBalance.toLocaleString() }}</p>
            <p class="text-caption text-medium-emphasis">Fuel Balance (L)</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ROW 2: PM Overview + Service Requests -->
    <v-row class="mb-4">
      <!-- PM Overview -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="0" border height="100%">
          <v-card-title class="pa-4 pb-2 text-body-1 font-weight-bold">
            <v-icon start color="primary" size="18">mdi-calendar-check</v-icon>
            PM Overview
          </v-card-title>
          <v-card-text class="pa-4 pt-0">
            <v-row density="comfortable">
              <v-col cols="6">
                <v-sheet rounded="lg" color="error" variant="tonal" class="pa-3 text-center">
                  <p class="text-h4 font-weight-bold text-error">{{ stats.overduePM }}</p>
                  <p class="text-caption">Overdue</p>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet rounded="lg" color="warning" variant="tonal" class="pa-3 text-center">
                  <p class="text-h4 font-weight-bold text-warning">{{ stats.dueSoonPM }}</p>
                  <p class="text-caption">Due in 30 days</p>
                </v-sheet>
              </v-col>
            </v-row>
            <v-divider class="my-3" />
            <p class="text-caption text-medium-emphasis font-weight-bold mb-2">OVERDUE SERVICES</p>
            <div v-if="overdueItems.length === 0" class="text-center py-2">
              <p class="text-caption text-success">All services up to date</p>
            </div>
            <v-list density="compact" class="pa-0" v-else>
              <v-list-item
                v-for="item in overdueItems.slice(0, 5)"
                :key="item.id"
                class="px-0"
                density="compact"
              >
                <template v-slot:prepend>
                  <v-icon color="error" size="16" class="mr-2">mdi-alert-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ item.asset_name }} — {{ item.service_type }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption text-error">
                  Due {{ formatDate(item.next_due_date) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-if="overdueItems.length > 5" class="text-caption text-medium-emphasis mt-1">
              +{{ overdueItems.length - 5 }} more overdue
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Service Requests -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="0" border height="100%">
          <v-card-title class="pa-4 pb-2 text-body-1 font-weight-bold">
            <v-icon start color="primary" size="18">mdi-wrench</v-icon>
            Service Requests
          </v-card-title>
          <v-card-text class="pa-4 pt-0">
           <v-row density="comfortable" class="mb-3">
              <v-col cols="4">
                <v-sheet rounded="lg" color="warning" variant="tonal" class="pa-3 text-center">
                  <p class="text-h4 font-weight-bold text-warning">{{ stats.inProgressSR }}</p>
                  <p class="text-caption">In Progress</p>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet rounded="lg" color="success" variant="tonal" class="pa-3 text-center">
                  <p class="text-h4 font-weight-bold text-success">{{ stats.completedSR }}</p>
                  <p class="text-caption">Completed</p>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet rounded="lg" color="grey" variant="tonal" class="pa-3 text-center">
                  <p class="text-h4 font-weight-bold">{{ stats.totalSR }}</p>
                  <p class="text-caption">Total</p>
                </v-sheet>
              </v-col>
            </v-row>
            <v-divider class="my-3" />
            <p class="text-caption text-medium-emphasis font-weight-bold mb-2">IN PROGRESS</p>
            <div v-if="inProgressSRItems.length === 0" class="text-center py-2">
              <p class="text-caption text-medium-emphasis">No active service requests</p>
            </div>
            <v-list density="compact" class="pa-0" v-else>
              <v-list-item
                v-for="item in inProgressSRItems.slice(0, 5)"
                :key="item.id"
                class="px-0"
                density="compact"
              >
                <template v-slot:prepend>
                  <v-icon color="warning" size="16" class="mr-2">mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ item.request_no }} — {{ item.asset_name }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ item.problem_details?.slice(0, 50)
                  }}{{ item.problem_details?.length > 50 ? '...' : '' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-if="inProgressSRItems.length > 5" class="text-caption text-medium-emphasis mt-1">
              +{{ inProgressSRItems.length - 5 }} more in progress
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ROW 3: Fuel Summary Cards -->
    <v-row class="mb-2">
      <v-col cols="12">
        <p class="text-body-2 font-weight-bold text-medium-emphasis mb-2">
          <v-icon size="16" class="mr-1">mdi-fuel</v-icon>
          FUEL SUMMARY
        </p>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-3">
            <p class="text-caption text-medium-emphasis">Total Allocated</p>
            <p class="text-h6 font-weight-bold">
              {{ fuelStats.totalAllocated.toLocaleString() }} L
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-3">
            <p class="text-caption text-medium-emphasis">Total Consumed</p>
            <p class="text-h6 font-weight-bold text-error">
              {{ fuelStats.totalConsumed.toLocaleString() }} L
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-3">
            <p class="text-caption text-medium-emphasis">Balance Remaining</p>
            <p class="text-h6 font-weight-bold text-success">
              {{ fuelStats.balance.toLocaleString() }} L
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-3">
            <p class="text-caption text-medium-emphasis">Total Cost</p>
            <p class="text-h6 font-weight-bold">₱{{ fuelStats.totalCost.toLocaleString() }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Fuel balance progress bar -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-3">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-caption text-medium-emphasis">Fuel Usage</span>
              <span class="text-caption font-weight-bold">
                {{
                  fuelStats.totalAllocated > 0
                    ? Math.round((fuelStats.totalConsumed / fuelStats.totalAllocated) * 100)
                    : 0
                }}% used
              </span>
            </div>
            <v-progress-linear
              :model-value="
                fuelStats.totalAllocated > 0
                  ? (fuelStats.totalConsumed / fuelStats.totalAllocated) * 100
                  : 0
              "
              :color="fuelProgressColor"
              bg-color="grey-lighten-3"
              rounded
              height="10"
            />
            <div class="d-flex justify-space-between mt-1">
              <span class="text-caption text-medium-emphasis">0 L</span>
              <span class="text-caption text-medium-emphasis"
                >{{ fuelStats.totalAllocated.toLocaleString() }} L</span
              >
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ROW 4: Fuel Charts -->
    <v-row class="mb-4">
      <!-- Monthly Consumption Trend -->
      <v-col cols="12" md="8">
        <v-card rounded="lg" elevation="0" border>
          <v-card-title class="pa-4 pb-2 text-body-1 font-weight-bold">
            <v-icon start color="primary" size="18">mdi-chart-line</v-icon>
            Monthly Fuel Consumption
          </v-card-title>
          <v-card-text class="pa-4 pt-0">
            <canvas ref="monthlyChartRef" height="120" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Cost per Vehicle -->
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-title class="pa-4 pb-2 text-body-1 font-weight-bold">
            <v-icon start color="primary" size="18">mdi-chart-bar</v-icon>
            Cost per Vehicle
          </v-card-title>
          <v-card-text class="pa-4 pt-0">
            <canvas ref="vehicleCostChartRef" height="200" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ROW 5: AC Summary -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card rounded="lg" elevation="0" border>
          <v-card-title class="pa-4 pb-2 text-body-1 font-weight-bold">
            <v-icon start color="primary" size="18">mdi-air-conditioner</v-icon>
            AC Units Summary
          </v-card-title>
          <v-card-text class="pa-4 pt-0">
            <v-row density="comfortable">
              <v-col cols="6" sm="3">
                <v-sheet rounded="lg" color="success" variant="tonal" class="pa-3 text-center">
                  <p class="text-h5 font-weight-bold text-success">{{ acStats.active }}</p>
                  <p class="text-caption">Active</p>
                </v-sheet>
              </v-col>
              <v-col cols="6" sm="3">
                <v-sheet rounded="lg" color="warning" variant="tonal" class="pa-3 text-center">
                  <p class="text-h5 font-weight-bold text-warning">{{ acStats.forRepair }}</p>
                  <p class="text-caption">For Repair</p>
                </v-sheet>
              </v-col>
              <v-col cols="6" sm="3">
                <v-sheet rounded="lg" color="grey" variant="tonal" class="pa-3 text-center">
                  <p class="text-h5 font-weight-bold">{{ acStats.condemned }}</p>
                  <p class="text-caption">Condemned</p>
                </v-sheet>
              </v-col>
              <v-col cols="6" sm="3">
                <v-sheet rounded="lg" color="primary" variant="tonal" class="pa-3 text-center">
                  <p class="text-h5 font-weight-bold">{{ stats.totalAC }}</p>
                  <p class="text-caption">Total Units</p>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { supabase } from '../supabase'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// ---- DATE ----
const today = new Date().toISOString().split('T')[0]
const currentYear = new Date().getFullYear()
const todayFormatted = new Date().toLocaleDateString('en-PH', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

// ---- REFS ----
const monthlyChartRef = ref(null)
const vehicleCostChartRef = ref(null)
let monthlyChart = null
let vehicleCostChart = null

// ---- STATE ----
const stats = ref({
  totalVehicles: 0,
  overduePM: 0,
  dueSoonPM: 0,
  inProgressSR: 0,
  completedSR: 0,
  totalSR: 0,
  totalAC: 0,
  fuelBalance: 0,
})

const fuelStats = ref({
  totalAllocated: 0,
  totalConsumed: 0,
  balance: 0,
  totalCost: 0,
})

const acStats = ref({ active: 0, forRepair: 0, condemned: 0 })
const overdueItems = ref([])
const inProgressSRItems = ref([])
const vehicleNames = ref([])

// ---- COMPUTED ----
const fuelProgressColor = computed(() => {
  const pct =
    fuelStats.value.totalAllocated > 0
      ? (fuelStats.value.totalConsumed / fuelStats.value.totalAllocated) * 100
      : 0
  if (pct >= 90) return 'error'
  if (pct >= 70) return 'warning'
  return 'success'
})

// ---- HELPERS ----
function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

// ---- FETCH ----
async function fetchAll() {
  await Promise.all([
    fetchVehicleStats(),
    fetchPMStats(),
    fetchSRStats(),
    fetchACStats(),
    fetchFuelStats(),
  ])
  await nextTick()
  buildCharts()
}

async function fetchVehicleStats() {
  const { data } = await supabase
    .from('vehicles')
    .select('id, asset_name, asset_type')
    .eq('status', 'Active')
  if (data) {
    stats.value.totalVehicles = data.filter((v) => v.asset_type === 'Vehicle').length
    vehicleNames.value = data.filter((v) => v.asset_type === 'Vehicle')
  }
}

async function fetchPMStats() {
  const { data } = await supabase
    .from('vehicle_pm_log')
    .select('id, vehicle_id, service_type, next_due_date, status')

  if (!data) return

  const soon = new Date()
  soon.setDate(soon.getDate() + 30)
  const soonStr = soon.toISOString().split('T')[0]

  // Enrich with asset names
  const { data: vehicles } = await supabase.from('vehicles').select('id, asset_name')
  const vMap = {}
  if (vehicles)
    vehicles.forEach((v) => {
      vMap[v.id] = v.asset_name
    })

  const enriched = data.map((r) => ({ ...r, asset_name: vMap[r.vehicle_id] || '—' }))

  const overdue = enriched.filter(
    (r) =>
      r.status !== 'Completed' &&
      r.status !== 'Cancelled' &&
      r.next_due_date &&
      r.next_due_date < today,
  )
  const dueSoon = enriched.filter(
    (r) =>
      r.status !== 'Completed' &&
      r.status !== 'Cancelled' &&
      r.next_due_date &&
      r.next_due_date >= today &&
      r.next_due_date <= soonStr,
  )

  stats.value.overduePM = overdue.length
  stats.value.dueSoonPM = dueSoon.length
  overdueItems.value = overdue.sort((a, b) => a.next_due_date.localeCompare(b.next_due_date))
}

async function fetchSRStats() {
  const { data } = await supabase
    .from('vehicle_service_requests')
    .select('id, request_no, vehicle_id, status, problem_details')

  if (!data) return

  const { data: vehicles } = await supabase.from('vehicles').select('id, asset_name')
  const vMap = {}
  if (vehicles)
    vehicles.forEach((v) => {
      vMap[v.id] = v.asset_name
    })

  const enriched = data.map((r) => ({ ...r, asset_name: vMap[r.vehicle_id] || '—' }))

  stats.value.totalSR = data.length
  stats.value.inProgressSR = data.filter((r) => r.status === 'In Progress').length
  stats.value.completedSR = data.filter((r) => r.status === 'Completed').length
  inProgressSRItems.value = enriched.filter((r) => r.status === 'In Progress')
}

async function fetchACStats() {
  const { data } = await supabase.from('ac_units').select('id, status')
  if (!data) return
  stats.value.totalAC = data.length
  acStats.value.active = data.filter((r) => r.status === 'Active').length
  acStats.value.forRepair = data.filter((r) => r.status === 'For Repair').length
  acStats.value.condemned = data.filter((r) => r.status === 'Condemned').length
}

async function fetchFuelStats() {
  const { data: contracts } = await supabase.from('fuel_contracts').select('*')
  const { data: transactions } = await supabase.from('fuel_transactions').select('*')

  const totalAllocated =
    contracts?.reduce(
      (s, c) => s + (Number(c.allocated_diesel) || 0) + (Number(c.allocated_gasoline) || 0),
      0,
    ) || 0
  const totalConsumed = transactions?.reduce((s, t) => s + (Number(t.quantity) || 0), 0) || 0
  const totalCost = transactions?.reduce((s, t) => s + (Number(t.total_amount) || 0), 0) || 0

  fuelStats.value = {
    totalAllocated,
    totalConsumed,
    balance: totalAllocated - totalConsumed,
    totalCost,
  }
  stats.value.fuelBalance = totalAllocated - totalConsumed

  buildMonthlyData(transactions || [])
  buildVehicleCostData(transactions || [])
}

// ---- CHART DATA ----
const monthlyLabels = ref([])
const monthlyData = ref([])
const vehicleCostLabels = ref([])
const vehicleCostData = ref([])

function buildMonthlyData(transactions) {
  const months = {}
  for (let m = 1; m <= 12; m++) {
    const label = new Date(currentYear, m - 1, 1).toLocaleString('en', { month: 'short' })
    months[label] = 0
  }
  transactions.forEach((t) => {
    if (!t.date) return
    const d = new Date(t.date)
    if (d.getFullYear() !== currentYear) return
    const label = d.toLocaleString('en', { month: 'short' })
    if (months[label] !== undefined) months[label] += Number(t.quantity) || 0
  })
  monthlyLabels.value = Object.keys(months)
  monthlyData.value = Object.values(months)
}

function buildVehicleCostData(transactions) {
  const costMap = {}
  transactions.forEach((t) => {
    const name = t.vehicle || 'Unknown'
    if (!costMap[name]) costMap[name] = 0
    costMap[name] += Number(t.total_amount) || 0
  })
  const entries = Object.entries(costMap).filter(([, cost]) => cost > 0)
  vehicleCostLabels.value = entries.map(([name]) => name)
  vehicleCostData.value = entries.map(([, cost]) => cost)
}

// ---- CHARTS ----
function buildCharts() {
  buildMonthlyChart()
  buildVehicleCostChart()
}

function buildMonthlyChart() {
  if (!monthlyChartRef.value) return
  if (monthlyChart) monthlyChart.destroy()

  monthlyChart = new Chart(monthlyChartRef.value, {
    type: 'line',
    data: {
      labels: monthlyLabels.value,
      datasets: [
        {
          label: 'Liters',
          data: monthlyData.value,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#00d4ff',
          pointRadius: 4,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y.toLocaleString()} L`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(128,128,128,0.1)' },
          ticks: { color: 'rgba(128,128,128,0.8)' },
        },
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(128,128,128,0.8)' },
        },
      },
    },
  })
}

function buildVehicleCostChart() {
  if (!vehicleCostChartRef.value) return
  if (vehicleCostChart) vehicleCostChart.destroy()

  const colors = [
    'rgba(0,212,255,0.7)',
    'rgba(124,58,237,0.7)',
    'rgba(34,197,94,0.7)',
    'rgba(245,158,11,0.7)',
    'rgba(239,68,68,0.7)',
    'rgba(99,102,241,0.7)',
    'rgba(20,184,166,0.7)',
  ]

  vehicleCostChart = new Chart(vehicleCostChartRef.value, {
    type: 'bar',
    data: {
      labels: vehicleCostLabels.value.length > 0 ? vehicleCostLabels.value : ['No data'],
      datasets: [
        {
          label: 'Cost (₱)',
          data: vehicleCostData.value.length > 0 ? vehicleCostData.value : [0],
          backgroundColor: colors.slice(0, vehicleCostLabels.value.length || 1),
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ₱${ctx.parsed.x.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(128,128,128,0.1)' },
          ticks: {
            color: 'rgba(128,128,128,0.8)',
            callback: (v) => '₱' + Number(v).toLocaleString(),
          },
        },
        y: {
          grid: { display: false },
          ticks: { color: 'rgba(128,128,128,0.8)' },
        },
      },
    },
  })
}

// ---- LIFECYCLE ----
onMounted(() => fetchAll())
onBeforeUnmount(() => {
  if (monthlyChart) monthlyChart.destroy()
  if (vehicleCostChart) vehicleCostChart.destroy()
})
</script>
