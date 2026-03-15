<template>
  <v-container fluid class="pa-6">
    <!-- ── Page Header ── -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Caraga State University — General Services Office, Transportation Unit
        </p>
      </div>
      <div class="d-flex align-center ga-3">
        <v-select
          v-model="selectedYear"
          :items="yearOptions"
          label="Year"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 110px"
          @update:modelValue="loadAll"
        />
        <v-chip variant="tonal" color="primary" size="small">
          <v-icon start size="14">mdi-clock-outline</v-icon>
          Updated {{ todayLabel }}
        </v-chip>
      </div>
    </div>

    <!-- ── KPI Summary Cards ── -->
    <v-row dense class="mb-4">
      <v-col cols="6" sm="3" v-for="kpi in kpiCards" :key="kpi.label">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">{{
                kpi.label
              }}</span>
              <v-icon :color="kpi.color" size="18" opacity="0.7">{{ kpi.icon }}</v-icon>
            </div>
            <div class="text-h5 font-weight-bold">{{ kpi.value }}</div>
            <div class="text-caption text-medium-emphasis mt-1">{{ kpi.sub }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Row 2: Fuel Consumption Bar Chart + PM Status ── -->
    <v-row dense class="mb-4">
      <!-- Fuel Consumption Per Year -->
      <v-col cols="12" md="8">
        <v-card rounded="lg" elevation="0" border height="340">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-subtitle-2 font-weight-bold">Fuel Consumption Per Year</div>
                <div class="text-caption text-medium-emphasis">Diesel vs Gasoline (Liters)</div>
              </div>
              <div class="d-flex ga-3 align-center">
                <span class="d-flex align-center ga-1 text-caption">
                  <span class="legend-dot" style="background: #1976d2"></span> Diesel
                </span>
                <span class="d-flex align-center ga-1 text-caption">
                  <span class="legend-dot" style="background: #ff8f00"></span> Gasoline
                </span>
              </div>
            </div>
            <div
              v-if="loadingFuel"
              class="d-flex align-center justify-center"
              style="height: 220px"
            >
              <v-progress-circular indeterminate size="32" width="2" />
            </div>
            <canvas v-else ref="fuelYearChart" height="220"></canvas>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- PM Status Donut -->
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="0" border height="340">
          <v-card-text class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-1">PM Status</div>
            <div class="text-caption text-medium-emphasis mb-3">
              {{ selectedYear }} — All Assets
            </div>
            <div v-if="loadingPM" class="d-flex align-center justify-center" style="height: 220px">
              <v-progress-circular indeterminate size="32" width="2" />
            </div>
            <div v-else>
              <canvas ref="pmDonutChart" height="180"></canvas>
              <div class="d-flex justify-center flex-wrap ga-2 mt-2">
                <span
                  v-for="s in pmStatusData"
                  :key="s.label"
                  class="d-flex align-center ga-1 text-caption"
                >
                  <span class="legend-dot" :style="`background:${s.color}`"></span>
                  {{ s.label }} ({{ s.count }})
                </span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Row 3: Vehicular Consumption Bar + Non-Vehicular Bar ── -->
    <v-row dense class="mb-4">
      <!-- Vehicular Fuel Consumption -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="0" border height="320">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <div>
                <div class="text-subtitle-2 font-weight-bold">Vehicular Consumption</div>
                <div class="text-caption text-medium-emphasis">
                  {{ selectedYear }} — Liters per Vehicle
                </div>
              </div>
              <div class="d-flex ga-3 align-center">
                <span class="d-flex align-center ga-1 text-caption">
                  <span class="legend-dot" style="background: #1976d2"></span> Diesel
                </span>
                <span class="d-flex align-center ga-1 text-caption">
                  <span class="legend-dot" style="background: #ff8f00"></span> Gasoline
                </span>
              </div>
            </div>
            <div
              v-if="loadingVehicle"
              class="d-flex align-center justify-center"
              style="height: 200px"
            >
              <v-progress-circular indeterminate size="32" width="2" />
            </div>
            <canvas v-else ref="vehicleBarChart" height="200"></canvas>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Non-Vehicular Fuel Consumption -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="0" border height="320">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <div>
                <div class="text-subtitle-2 font-weight-bold">Non-Vehicular Consumption</div>
                <div class="text-caption text-medium-emphasis">
                  {{ selectedYear }} — Liters per Equipment
                </div>
              </div>
              <div class="d-flex ga-3 align-center">
                <span class="d-flex align-center ga-1 text-caption">
                  <span class="legend-dot" style="background: #1976d2"></span> Diesel
                </span>
                <span class="d-flex align-center ga-1 text-caption">
                  <span class="legend-dot" style="background: #ff8f00"></span> Gasoline
                </span>
              </div>
            </div>
            <div
              v-if="loadingNonVehicle"
              class="d-flex align-center justify-center"
              style="height: 200px"
            >
              <v-progress-circular indeterminate size="32" width="2" />
            </div>
            <canvas v-else ref="nonVehicleBarChart" height="200"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Row 4: Asset Fuel Summary Table ── -->
    <v-row dense class="mb-4">
      <v-col cols="12">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <div>
                <div class="text-subtitle-2 font-weight-bold">
                  Asset Fuel Summary — {{ selectedYear }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Withdrawals, liters consumed, fuel type, and total amount per asset
                </div>
              </div>
              <v-text-field
                v-model="assetSearch"
                placeholder="Search asset..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                style="max-width: 220px"
              />
            </div>
            <v-data-table
              :headers="assetTableHeaders"
              :items="filteredAssetRows"
              :loading="loadingAssets"
              density="compact"
              :items-per-page="10"
              class="asset-table"
            >
              <template #item.asset_type="{ item }">
                <v-chip
                  :color="item.asset_type === 'Vehicle' ? 'primary' : 'warning'"
                  size="x-small"
                  variant="tonal"
                  >{{ item.asset_type }}</v-chip
                >
              </template>
              <template #item.fuel_type="{ item }">
                <span class="text-caption">{{ item.fuel_type }}</span>
              </template>
              <template #item.total_liters="{ item }">
                <span class="font-weight-medium">{{ formatNum(item.total_liters) }} L</span>
              </template>
              <template #item.total_amount="{ item }">
                <span class="font-weight-medium">{{ formatCurrency(item.total_amount) }}</span>
              </template>
              <template #item.diesel_liters="{ item }">
                <span class="text-caption">{{
                  item.diesel_liters > 0 ? formatNum(item.diesel_liters) + ' L' : '—'
                }}</span>
              </template>
              <template #item.gasoline_liters="{ item }">
                <span class="text-caption">{{
                  item.gasoline_liters > 0 ? formatNum(item.gasoline_liters) + ' L' : '—'
                }}</span>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Row 5: Recent Service Requests ── -->
    <v-row dense>
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-3">Recent Service Requests</div>
            <v-progress-linear v-if="loadingSR" indeterminate color="primary" class="mb-2" />
            <div v-else>
              <div
                v-if="recentSR.length === 0"
                class="text-caption text-medium-emphasis text-center pa-4"
              >
                No records
              </div>
              <div
                v-for="sr in recentSR"
                :key="sr.id"
                class="sr-row d-flex align-center justify-space-between py-2"
              >
                <div>
                  <div class="text-body-2 font-weight-medium">{{ sr.request_no }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ sr.asset_name }} · {{ formatDate(sr.date_of_request) }}
                  </div>
                </div>
                <v-chip :color="srColor(sr.status)" size="x-small" variant="tonal">{{
                  sr.status
                }}</v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-3">Upcoming PM Due</div>
            <v-progress-linear v-if="loadingPMDue" indeterminate color="primary" class="mb-2" />
            <div v-else>
              <div
                v-if="upcomingPM.length === 0"
                class="text-caption text-medium-emphasis text-center pa-4"
              >
                No upcoming PM within 30 days
              </div>
              <div
                v-for="pm in upcomingPM"
                :key="pm.id"
                class="sr-row d-flex align-center justify-space-between py-2"
              >
                <div>
                  <div class="text-body-2 font-weight-medium">{{ pm.asset_name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ pm.service_type }} · Due {{ formatDate(pm.next_due_date) }}
                  </div>
                </div>
                <v-chip :color="dueColor(pm.next_due_date)" size="x-small" variant="tonal">
                  {{ daysUntil(pm.next_due_date) }}d
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { supabase } from '../supabase'

// ── Year selector ──
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const yearOptions = computed(() => {
  return [currentYear - 2, currentYear - 1, currentYear].reverse()
})
const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
)

// ── Loading flags ──
const loadingFuel = ref(true)
const loadingVehicle = ref(true)
const loadingNonVehicle = ref(true)
const loadingPM = ref(true)
const loadingAssets = ref(true)
const loadingSR = ref(true)
const loadingPMDue = ref(true)

// ── KPI data ──
const kpiCards = ref([
  {
    label: 'Total Assets',
    icon: 'mdi-car',
    color: 'primary',
    value: '—',
    sub: 'Active vehicles & equipment',
  },
  { label: 'Service Requests', icon: 'mdi-wrench', color: 'orange', value: '—', sub: 'This year' },
  {
    label: 'PM Completed',
    icon: 'mdi-check-circle',
    color: 'success',
    value: '—',
    sub: 'This year',
  },
  {
    label: 'Total Fuel Cost',
    icon: 'mdi-gas-station',
    color: 'blue',
    value: '—',
    sub: 'This year (₱)',
  },
])

// ── Chart refs ──
const fuelYearChart = ref(null)
const pmDonutChart = ref(null)
const vehicleBarChart = ref(null)
const nonVehicleBarChart = ref(null)

// ── Chart instances (for cleanup) ──
let fuelYearInstance = null
let pmDonutInstance = null
let vehicleBarInstance = null
let nonVehicleBarInstance = null

// ── PM status data for legend ──
const pmStatusData = ref([])

// ── Asset table ──
const assetSearch = ref('')
const assetRows = ref([])
const assetTableHeaders = [
  { title: 'Asset', key: 'asset_name', sortable: true },
  { title: 'Type', key: 'asset_type', sortable: true },
  { title: 'Withdrawals', key: 'withdrawals', sortable: true, align: 'end' },
  { title: 'Diesel (L)', key: 'diesel_liters', sortable: true, align: 'end' },
  { title: 'Gasoline (L)', key: 'gasoline_liters', sortable: true, align: 'end' },
  { title: 'Total (L)', key: 'total_liters', sortable: true, align: 'end' },
  { title: 'Fuel Type', key: 'fuel_type', sortable: false },
  { title: 'Total Amount', key: 'total_amount', sortable: true, align: 'end' },
]
const filteredAssetRows = computed(() => {
  if (!assetSearch.value) return assetRows.value
  const s = assetSearch.value.toLowerCase()
  return assetRows.value.filter(
    (r) =>
      (r.asset_name || '').toLowerCase().includes(s) ||
      (r.asset_type || '').toLowerCase().includes(s) ||
      (r.fuel_type || '').toLowerCase().includes(s),
  )
})

// ── Recent service requests ──
const recentSR = ref([])
const upcomingPM = ref([])

// ── Helpers ──
function formatNum(n) {
  return Number(n || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
function formatCurrency(n) {
  return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
function srColor(s) {
  return { 'In Progress': 'warning', Completed: 'success', Cancelled: 'grey' }[s] || 'grey'
}
function daysUntil(d) {
  if (!d) return 0
  return Math.max(0, Math.ceil((new Date(d + 'T00:00:00') - new Date()) / 86400000))
}
function dueColor(d) {
  const days = daysUntil(d)
  if (days <= 7) return 'error'
  if (days <= 14) return 'warning'
  return 'success'
}

// ── Destroy chart safely ──
function destroyChart(instance) {
  if (instance) {
    try {
      instance.destroy()
    } catch (err) {
      // ignore destroy errors
      console.warn('Chart destroy failed', err)
    }
  }
  return null
}

// ── Load all data ──
async function loadAll() {
  await Promise.all([
    loadKPIs(),
    loadFuelYearChart(),
    loadVehicleCharts(),
    loadPMStatus(),
    loadAssetTable(),
    loadRecentSR(),
    loadUpcomingPM(),
  ])
}

// ── KPI ──
async function loadKPIs() {
  const yr = selectedYear.value
  const [assetRes, srRes, pmRes, fuelRes] = await Promise.all([
    supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase
      .from('vehicle_service_requests')
      .select('id', { count: 'exact', head: true })
      .gte('date_of_request', `${yr}-01-01`)
      .lte('date_of_request', `${yr}-12-31`),
    supabase
      .from('vehicle_pm_log')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Completed')
      .gte('date_performed', `${yr}-01-01`)
      .lte('date_performed', `${yr}-12-31`),
    supabase
      .from('fuel_transactions')
      .select('total_amount')
      .gte('date', `${yr}-01-01`)
      .lte('date', `${yr}-12-31`),
  ])

  const totalFuel = (fuelRes.data || []).reduce((s, r) => s + (Number(r.total_amount) || 0), 0)

  kpiCards.value = [
    {
      label: 'Total Assets',
      icon: 'mdi-car',
      color: 'primary',
      value: assetRes.count ?? '—',
      sub: 'Active vehicles & equipment',
    },
    {
      label: 'Service Requests',
      icon: 'mdi-wrench',
      color: 'orange',
      value: srRes.count ?? '—',
      sub: `${yr} records`,
    },
    {
      label: 'PM Completed',
      icon: 'mdi-check-circle',
      color: 'success',
      value: pmRes.count ?? '—',
      sub: `${yr} records`,
    },
    {
      label: 'Total Fuel Cost',
      icon: 'mdi-gas-station',
      color: 'blue',
      value: '₱' + formatNum(totalFuel),
      sub: `${yr} transactions`,
    },
  ]
}

// ── Fuel per year (multi-year bar) ──
async function loadFuelYearChart() {
  loadingFuel.value = true
  const years = [currentYear - 2, currentYear - 1, currentYear]
  const results = await Promise.all(
    years.map((yr) =>
      supabase
        .from('fuel_transactions')
        .select('fuel_type, quantity')
        .gte('date', `${yr}-01-01`)
        .lte('date', `${yr}-12-31`),
    ),
  )

  const dieselData = []
  const gasData = []
  years.forEach((_, i) => {
    const rows = results[i].data || []
    dieselData.push(
      rows
        .filter((r) => (r.fuel_type || '').toLowerCase().includes('diesel'))
        .reduce((s, r) => s + (Number(r.quantity) || 0), 0),
    )
    gasData.push(
      rows
        .filter((r) => (r.fuel_type || '').toLowerCase().includes('gasoline'))
        .reduce((s, r) => s + (Number(r.quantity) || 0), 0),
    )
  })

  loadingFuel.value = false
  await nextTick()
  fuelYearInstance = destroyChart(fuelYearInstance)
  if (!fuelYearChart.value) return

  const Chart = (await import('chart.js/auto')).default
  fuelYearInstance = new Chart(fuelYearChart.value, {
    type: 'bar',
    data: {
      labels: years.map(String),
      datasets: [
        {
          label: 'Diesel',
          data: dieselData,
          backgroundColor: '#1976D2',
          borderRadius: 4,
          barPercentage: 0.6,
        },
        {
          label: 'Gasoline',
          data: gasData,
          backgroundColor: '#FF8F00',
          borderRadius: 4,
          barPercentage: 0.6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${formatNum(ctx.raw)} L`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: {
          grid: { color: '#f0f0f0' },
          ticks: { font: { size: 10 }, callback: (v) => formatNum(v) + ' L' },
        },
      },
    },
  })
}

// ── Vehicle / Non-vehicular charts ──
async function loadVehicleCharts() {
  loadingVehicle.value = true
  loadingNonVehicle.value = true
  const yr = selectedYear.value

  const [vRes, nvRes] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id, asset_name, asset_type')
      .eq('asset_type', 'Vehicle')
      .eq('status', 'Active')
      .order('asset_name'),
    supabase
      .from('vehicles')
      .select('id, asset_name, asset_type')
      .eq('asset_type', 'Non-Vehicular')
      .eq('status', 'Active')
      .order('asset_name'),
  ])

  const txRes = await supabase
    .from('fuel_transactions')
    .select('vehicle, fuel_type, quantity, total_amount')
    .gte('date', `${yr}-01-01`)
    .lte('date', `${yr}-12-31`)

  const txRows = txRes.data || []

  // helper: match vehicle name in transactions (fuel_transactions.vehicle is plain text)
  function sumFor(assetName, fuelType) {
    const nm = (assetName || '').toLowerCase()
    return txRows
      .filter(
        (r) =>
          (r.vehicle || '').toLowerCase().includes(nm) &&
          (r.fuel_type || '').toLowerCase().includes(fuelType),
      )
      .reduce((s, r) => s + (Number(r.quantity) || 0), 0)
  }

  const vehicles = vRes.data || []
  const nonVehicles = nvRes.data || []

  // Build vehicle chart data
  const vLabels = vehicles.map((v) => v.asset_name)
  const vDiesel = vehicles.map((v) => sumFor(v.asset_name, 'diesel'))
  const vGasoline = vehicles.map((v) => sumFor(v.asset_name, 'gasoline'))

  const nvLabels = nonVehicles.map((v) => v.asset_name)
  const nvDiesel = nonVehicles.map((v) => sumFor(v.asset_name, 'diesel'))
  const nvGasoline = nonVehicles.map((v) => sumFor(v.asset_name, 'gasoline'))

  loadingVehicle.value = false
  loadingNonVehicle.value = false
  await nextTick()

  const Chart = (await import('chart.js/auto')).default

  // Vehicle bar
  vehicleBarInstance = destroyChart(vehicleBarInstance)
  if (vehicleBarChart.value) {
    vehicleBarInstance = new Chart(vehicleBarChart.value, {
      type: 'bar',
      data: {
        labels: vLabels.length ? vLabels : ['No data'],
        datasets: [
          {
            label: 'Diesel',
            data: vDiesel,
            backgroundColor: '#1976D2',
            borderRadius: 3,
            barPercentage: 0.65,
          },
          {
            label: 'Gasoline',
            data: vGasoline,
            backgroundColor: '#FF8F00',
            borderRadius: 3,
            barPercentage: 0.65,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatNum(ctx.raw)} L` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: {
            grid: { color: '#f0f0f0' },
            ticks: { font: { size: 10 }, callback: (v) => formatNum(v) },
          },
        },
      },
    })
  }

  // Non-vehicular bar
  nonVehicleBarInstance = destroyChart(nonVehicleBarInstance)
  if (nonVehicleBarChart.value) {
    nonVehicleBarInstance = new Chart(nonVehicleBarChart.value, {
      type: 'bar',
      data: {
        labels: nvLabels.length ? nvLabels : ['No data'],
        datasets: [
          {
            label: 'Diesel',
            data: nvDiesel,
            backgroundColor: '#1976D2',
            borderRadius: 3,
            barPercentage: 0.65,
          },
          {
            label: 'Gasoline',
            data: nvGasoline,
            backgroundColor: '#FF8F00',
            borderRadius: 3,
            barPercentage: 0.65,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatNum(ctx.raw)} L` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: {
            grid: { color: '#f0f0f0' },
            ticks: { font: { size: 10 }, callback: (v) => formatNum(v) },
          },
        },
      },
    })
  }
}

// ── PM status donut ──
async function loadPMStatus() {
  loadingPM.value = true
  const yr = selectedYear.value
  const { data } = await supabase
    .from('vehicle_pm_log')
    .select('status')
    .gte('date_performed', `${yr}-01-01`)
    .lte('date_performed', `${yr}-12-31`)

  const counts = { Completed: 0, Scheduled: 0, Overdue: 0, Cancelled: 0 }
  ;(data || []).forEach((r) => {
    if (counts[r.status] !== undefined) counts[r.status]++
  })

  const colors = {
    Completed: '#43A047',
    Scheduled: '#1976D2',
    Overdue: '#E53935',
    Cancelled: '#9E9E9E',
  }
  pmStatusData.value = Object.entries(counts).map(([label, count]) => ({
    label,
    count,
    color: colors[label],
  }))

  loadingPM.value = false
  await nextTick()
  pmDonutInstance = destroyChart(pmDonutInstance)
  if (!pmDonutChart.value) return

  const Chart = (await import('chart.js/auto')).default
  pmDonutInstance = new Chart(pmDonutChart.value, {
    type: 'doughnut',
    data: {
      labels: pmStatusData.value.map((s) => s.label),
      datasets: [
        {
          data: pmStatusData.value.map((s) => s.count),
          backgroundColor: pmStatusData.value.map((s) => s.color),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}` } },
      },
    },
  })
}

// ── Asset fuel table ──
async function loadAssetTable() {
  loadingAssets.value = true
  const yr = selectedYear.value

  const [vRes, txRes] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id, asset_name, asset_type')
      .eq('status', 'Active')
      .order('asset_name'),
    supabase
      .from('fuel_transactions')
      .select('vehicle, fuel_type, quantity, total_amount')
      .gte('date', `${yr}-01-01`)
      .lte('date', `${yr}-12-31`),
  ])

  const vehicles = vRes.data || []
  const txRows = txRes.data || []

  // Map transactions to vehicles by name matching
  assetRows.value = vehicles
    .map((v) => {
      const nm = (v.asset_name || '').toLowerCase()
      const matching = txRows.filter((r) => (r.vehicle || '').toLowerCase().includes(nm))
      const diesel = matching.filter((r) => (r.fuel_type || '').toLowerCase().includes('diesel'))
      const gasoline = matching.filter((r) =>
        (r.fuel_type || '').toLowerCase().includes('gasoline'),
      )
      const dL = diesel.reduce((s, r) => s + (Number(r.quantity) || 0), 0)
      const gL = gasoline.reduce((s, r) => s + (Number(r.quantity) || 0), 0)
      const allAmt = matching.reduce((s, r) => s + (Number(r.total_amount) || 0), 0)

      const fuelType =
        dL > 0 && gL > 0 ? 'Diesel / Gasoline' : dL > 0 ? 'Diesel' : gL > 0 ? 'Gasoline' : '—'

      return {
        id: v.id,
        asset_name: v.asset_name,
        asset_type: v.asset_type,
        withdrawals: matching.length,
        diesel_liters: Math.round(dL * 100) / 100,
        gasoline_liters: Math.round(gL * 100) / 100,
        total_liters: Math.round((dL + gL) * 100) / 100,
        fuel_type: fuelType,
        total_amount: Math.round(allAmt * 100) / 100,
      }
    })
    .filter((r) => r.withdrawals > 0 || true) // show all assets

  loadingAssets.value = false
}

// ── Recent Service Requests ──
async function loadRecentSR() {
  loadingSR.value = true
  const { data } = await supabase
    .from('vehicle_service_requests')
    .select('id, request_no, date_of_request, status, vehicle_id')
    .order('date_of_request', { ascending: false })
    .limit(8)

  const vRes = await supabase.from('vehicles').select('id, asset_name')
  const vMap = Object.fromEntries((vRes.data || []).map((v) => [String(v.id), v.asset_name]))

  recentSR.value = (data || []).map((r) => ({
    ...r,
    asset_name: vMap[String(r.vehicle_id)] || `Asset #${r.vehicle_id}`,
  }))
  loadingSR.value = false
}

// ── Upcoming PM ──
async function loadUpcomingPM() {
  loadingPMDue.value = true
  const today = new Date().toISOString().split('T')[0]
  const plus30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const { data } = await supabase
    .from('vehicle_pm_log')
    .select('id, vehicle_id, service_type, next_due_date, status')
    .neq('status', 'Completed')
    .gte('next_due_date', today)
    .lte('next_due_date', plus30)
    .order('next_due_date')
    .limit(8)

  const vRes = await supabase.from('vehicles').select('id, asset_name')
  const vMap = Object.fromEntries((vRes.data || []).map((v) => [String(v.id), v.asset_name]))

  upcomingPM.value = (data || []).map((r) => ({
    ...r,
    asset_name: vMap[String(r.vehicle_id)] || `Asset #${r.vehicle_id}`,
  }))
  loadingPMDue.value = false
}

// ── Lifecycle ──
onMounted(() => loadAll())
</script>

<style scoped>
.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.sr-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.sr-row:last-child {
  border-bottom: none;
}

.asset-table :deep(thead th) {
  font-size: 11px !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: rgba(0, 0, 0, 0.6) !important;
}
.asset-table :deep(tbody td) {
  font-size: 12px !important;
}
</style>
