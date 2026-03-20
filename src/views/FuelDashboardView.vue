<template>
  <v-container fluid>
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <h2 class="text-h5 font-weight-bold">Dashboard</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Fuel Allocation Monitoring — Overview
            </p>
          </div>
          <div class="d-flex ga-2 align-center flex-wrap">
            <v-select
              v-model="selectedYear"
              :items="availableYears"
              label="Fiscal Year"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 110px"
              @update:modelValue="loadAll"
            />
            <v-chip size="small" variant="tonal" color="primary">
              Updated: {{ todayLabel }}
            </v-chip>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Loading overlay for initial load -->
    <v-row v-if="initialLoading" class="mb-4">
      <v-col class="text-center pa-12">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="mt-4 text-medium-emphasis">Loading dashboard data...</p>
      </v-col>
    </v-row>

    <template v-else>
      <!-- ── SECTION 1: Year-to-date Summary Cards ── -->
      <p
        class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-3"
        style="letter-spacing: 0.8px"
      >
        Year-to-date overview — FY {{ selectedYear }}
      </p>
      <v-row class="mb-4">
        <!-- Card: Total Contract Budget -->
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border height="100%">
            <v-card-text>
              <p class="text-caption text-medium-emphasis mb-1">Total contract budget</p>
              <p class="text-h5 font-weight-bold">
                {{ formatCurrency(summary.totalContractAmount) }}
              </p>
              <p class="text-caption text-medium-emphasis mt-1">
                {{ summary.totalContracts }} cost centers
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Card: Total Consumed -->
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border height="100%">
            <v-card-text>
              <p class="text-caption text-medium-emphasis mb-1">Total consumed</p>
              <p class="text-h5 font-weight-bold">{{ formatCurrency(summary.totalConsumed) }}</p>
              <p class="text-caption mt-1" :class="utilizationColor(summary.utilizationPct)">
                {{ summary.utilizationPct }}% utilized
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Card: Remaining Balance -->
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border height="100%">
            <v-card-text>
              <p class="text-caption text-medium-emphasis mb-1">Remaining balance</p>
              <p
                class="text-h5 font-weight-bold"
                :class="summary.totalBalance < 0 ? 'text-error' : ''"
              >
                {{ summary.totalBalance < 0 ? '−' : ''
                }}{{ formatCurrency(Math.abs(summary.totalBalance)) }}
              </p>
              <p v-if="summary.overBudgetCount > 0" class="text-caption text-error mt-1">
                {{ summary.overBudgetCount }} center{{
                  summary.overBudgetCount > 1 ? 's' : ''
                }}
                over budget
              </p>
              <p v-else class="text-caption text-success mt-1">All centers within budget</p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Card: Total Transactions -->
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border height="100%">
            <v-card-text>
              <p class="text-caption text-medium-emphasis mb-1">Total transactions</p>
              <p class="text-h5 font-weight-bold">{{ formatNumber(summary.totalTransactions) }}</p>
              <p class="text-caption text-medium-emphasis mt-1">
                This billing period: {{ formatNumber(summary.currentPeriodTransactions) }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── SECTION 2: Charts + Alerts ── -->
      <v-row class="mb-4">
        <!-- Fuel Consumption Per Year Chart -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="0" border height="100%">
            <v-card-text>
              <p class="text-body-2 font-weight-bold mb-3">Fuel consumption per year (liters)</p>
              <!-- Chart.js canvas — the JS below draws the bar chart here -->
              <canvas ref="yearChartRef" height="220" />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Budget Alerts -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="0" border height="100%">
            <v-card-text>
              <p class="text-body-2 font-weight-bold mb-3">Budget alerts</p>

              <div v-if="budgetAlerts.length === 0" class="text-center pa-6">
                <v-icon size="40" color="success" class="mb-2">mdi-check-circle</v-icon>
                <p class="text-body-2 text-success">All cost centers are within budget</p>
              </div>

              <div v-else class="d-flex flex-column ga-2">
                <v-alert
                  v-for="alert in budgetAlerts"
                  :key="alert.id"
                  :type="alert.type"
                  variant="tonal"
                  density="compact"
                  rounded="lg"
                >
                  <span class="text-body-2">
                    <strong>{{ alert.name }}</strong> {{ alert.message }}
                  </span>
                </v-alert>
              </div>

              <p class="text-caption text-medium-emphasis mt-3">
                Red = over budget &nbsp;·&nbsp; Yellow = ≥90% utilized
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── SECTION 3: Vehicle + Equipment Charts ── -->
      <v-row class="mb-4">
        <!-- Top Vehicles -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="0" border height="100%">
            <v-card-text>
              <p class="text-body-2 font-weight-bold mb-3">
                Top vehicles by consumption (FY {{ selectedYear }})
              </p>

              <div v-if="topVehicles.length === 0" class="text-center pa-6">
                <v-icon size="40" color="grey-lighten-1" class="mb-2">mdi-car-off</v-icon>
                <p class="text-body-2 text-medium-emphasis">No vehicular transactions yet</p>
              </div>

              <div v-else>
                <canvas ref="vehicleChartRef" height="220" />
                <p class="text-caption text-medium-emphasis mt-2">
                  Vehicular only · all fuel types combined
                </p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Top Equipment -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="0" border height="100%">
            <v-card-text>
              <p class="text-body-2 font-weight-bold mb-3">
                Top equipment by consumption (FY {{ selectedYear }})
              </p>

              <div v-if="topEquipment.length === 0" class="text-center pa-6">
                <v-icon size="40" color="grey-lighten-1" class="mb-2">mdi-tools</v-icon>
                <p class="text-body-2 text-medium-emphasis">No non-vehicular transactions yet</p>
              </div>

              <div v-else>
                <canvas ref="equipmentChartRef" height="220" />
                <p class="text-caption text-medium-emphasis mt-2">Non-vehicular equipment only</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── SECTION 4: Recent Transactions ── -->
      <v-card rounded="lg" elevation="0" border>
        <v-card-text class="pb-0">
          <p class="text-body-2 font-weight-bold">Recent transactions</p>
        </v-card-text>
        <v-data-table
          :headers="recentHeaders"
          :items="recentTransactions"
          :loading="loadingRecent"
          items-per-page="5"
          density="compact"
        >
          <!-- Date -->
          <template #item.date="{ item }">
            <span class="text-caption">{{ formatDate(item.date) }}</span>
          </template>

          <!-- Fuel Type chip -->
          <template #item.fuel_type="{ item }">
            <v-chip
              :color="item.fuel_type === 'Diesel' ? 'blue-darken-2' : 'green-darken-2'"
              variant="tonal"
              size="x-small"
              class="font-weight-bold"
            >
              {{ item.fuel_type }}
            </v-chip>
          </template>

          <!-- Quantity -->
          <template #item.quantity="{ item }">
            <span class="text-caption">{{ formatNumber(item.quantity) }} L</span>
          </template>

          <!-- Amount -->
          <template #item.total_amount="{ item }">
            <span class="text-caption font-weight-medium"
              >₱{{ formatNumber(item.total_amount) }}</span
            >
          </template>

          <!-- Fund chip -->
          <template #item.fund_cluster="{ item }">
            <v-chip
              :color="fundColor(item.fund_cluster)"
              variant="tonal"
              size="x-small"
              class="font-weight-bold"
            >
              {{ item.fund_cluster }}
            </v-chip>
          </template>

          <template #no-data>
            <div class="pa-6 text-center text-medium-emphasis text-body-2">
              No transactions found for FY {{ selectedYear }}
            </div>
          </template>
        </v-data-table>
      </v-card>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { supabase } from '../supabase'
import {
  Chart,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

// Register only the Chart.js components we need.
// WHY: registering everything would bloat the bundle.
// We only need bar charts here.
Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend)

// ── STATE ──
const selectedYear = ref(new Date().getFullYear())
const availableYears = ref([new Date().getFullYear()])
const initialLoading = ref(true)
const loadingRecent = ref(false)

// Summary numbers shown in the top 4 cards
const summary = ref({
  totalContractAmount: 0,
  totalConsumed: 0,
  totalBalance: 0,
  totalContracts: 0,
  overBudgetCount: 0,
  utilizationPct: 0,
  totalTransactions: 0,
  currentPeriodTransactions: 0,
})

// Budget alerts list — over budget (red) and near limit (yellow)
const budgetAlerts = ref([])

// Top 5 vehicles and equipment by liters consumed
const topVehicles = ref([])
const topEquipment = ref([])

// Most recent 10 transactions for the bottom table
const recentTransactions = ref([])

// Multi-year data for the annual consumption bar chart
const yearlyData = ref([])

// Chart.js instance references — stored so we can destroy and redraw
// when the year changes without creating duplicate charts
const yearChartRef = ref(null)
const vehicleChartRef = ref(null)
const equipmentChartRef = ref(null)
let yearChartInstance = null
let vehicleChartInstance = null
let equipmentChartInstance = null

// ── COMPUTED ──
// todayLabel: formatted current date shown next to the year selector
const todayLabel = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
})

// Table headers for the recent transactions section
const recentHeaders = [
  { title: 'Date', key: 'date', width: '90px' },
  { title: 'OR #', key: 'or_number', width: '80px' },
  { title: 'Vehicle / Equipment', key: 'vehicle' },
  { title: 'Utilized By', key: 'utilized_by', width: '110px' },
  { title: 'Fuel', key: 'fuel_type', width: '90px' },
  { title: 'Liters', key: 'quantity', align: 'end', width: '80px' },
  { title: 'Amount', key: 'total_amount', align: 'end', width: '110px' },
  { title: 'Fund', key: 'fund_cluster', width: '70px' },
]

// ── DATA LOADING ──

// loadAll: main entry point — fetches everything needed for the dashboard.
// Called on mount and when the year selector changes.
async function loadAll() {
  initialLoading.value = true
  await Promise.all([
    loadSummary(),
    loadYearlyChart(),
    loadVehicleEquipmentData(),
    loadRecentTransactions(),
  ])
  initialLoading.value = false
  // Wait for Vue to update the DOM before drawing charts
  await nextTick()
  drawAllCharts()
}

// loadSummary: fetches contract totals and transaction totals for the selected year.
// Computes the 4 summary cards and budget alert list.
async function loadSummary() {
  const startDate = `${selectedYear.value}-01-01`
  const endDate = `${selectedYear.value}-12-31`

  // Fetch all contracts for the year
  const { data: contracts } = await supabase
    .from('fuel_contracts')
    .select('id, contract_amount, account_code, fund_cluster')
    .eq('year', selectedYear.value)

  // Fetch all transactions for the year (only fields needed for math)
  const { data: transactions } = await supabase
    .from('fuel_transactions')
    .select('contract_id, total_amount, billing_period')
    .gte('date', startDate)
    .lte('date', endDate)

  if (!contracts || !transactions) return

  // Total contract budget
  const totalContractAmount = contracts.reduce((s, c) => s + (c.contract_amount || 0), 0)

  // Total amount spent from transactions
  const totalConsumed = transactions.reduce((s, t) => s + (t.total_amount || 0), 0)

  // Build consumed-per-contract map
  const consumedMap = new Map()
  transactions.forEach((t) => {
    if (!t.contract_id) return
    consumedMap.set(t.contract_id, (consumedMap.get(t.contract_id) || 0) + (t.total_amount || 0))
  })

  // Count over-budget contracts and build alert list
  const alerts = []
  contracts.forEach((c) => {
    const consumed = consumedMap.get(c.id) || 0
    const balance = (c.contract_amount || 0) - consumed
    const pct = c.contract_amount > 0 ? (consumed / c.contract_amount) * 100 : 0

    if (balance < 0) {
      alerts.push({
        id: c.id,
        type: 'error',
        name: c.account_code,
        message: `is ₱${formatNumber(Math.abs(balance))} over budget. Balance: −₱${formatNumber(Math.abs(balance))}`,
      })
    } else if (pct >= 90) {
      alerts.push({
        id: c.id,
        type: 'warning',
        name: c.account_code,
        message: `at ${pct.toFixed(1)}% utilized. ₱${formatNumber(balance)} remaining`,
      })
    }
  })

  // Current billing period = the most common billing_period in recent transactions
  const periodCounts = {}
  transactions.forEach((t) => {
    if (t.billing_period) periodCounts[t.billing_period] = (periodCounts[t.billing_period] || 0) + 1
  })
  const currentPeriod = Object.keys(periodCounts).sort().pop() || ''
  const currentPeriodTransactions = periodCounts[currentPeriod] || 0

  const overBudgetCount = alerts.filter((a) => a.type === 'error').length
  const utilizationPct =
    totalContractAmount > 0 ? Math.round((totalConsumed / totalContractAmount) * 1000) / 10 : 0

  summary.value = {
    totalContractAmount,
    totalConsumed,
    totalBalance: totalContractAmount - totalConsumed,
    totalContracts: contracts.length,
    overBudgetCount,
    utilizationPct,
    totalTransactions: transactions.length,
    currentPeriodTransactions,
  }

  // Sort alerts: errors first, then warnings
  budgetAlerts.value = alerts.sort((a, b) => {
    if (a.type === 'error' && b.type !== 'error') return -1
    if (b.type === 'error' && a.type !== 'error') return 1
    return 0
  })
}

// loadYearlyChart: fetches diesel and gasoline totals for the last 3 years
// including the selected year — used to draw the annual consumption bar chart.
async function loadYearlyChart() {
  const currentYear = selectedYear.value
  const years = [currentYear - 2, currentYear - 1, currentYear]

  const results = await Promise.all(
    years.map(async (year) => {
      const { data } = await supabase
        .from('fuel_transactions')
        .select('fuel_type, quantity')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`)

      const diesel = (data || [])
        .filter((t) => t.fuel_type === 'Diesel')
        .reduce((s, t) => s + (t.quantity || 0), 0)
      const gasoline = (data || [])
        .filter((t) => t.fuel_type === 'Gasoline')
        .reduce((s, t) => s + (t.quantity || 0), 0)

      return { year, diesel, gasoline }
    }),
  )

  yearlyData.value = results
}

// loadVehicleEquipmentData: fetches consumption grouped by vehicle name.
// Separates vehicular from non-vehicular based on utilization_type column.
// Falls back to treating all as vehicular if the column doesn't exist yet.
async function loadVehicleEquipmentData() {
  const startDate = `${selectedYear.value}-01-01`
  const endDate = `${selectedYear.value}-12-31`

  const { data } = await supabase
    .from('fuel_transactions')
    .select('vehicle, quantity, utilization_type')
    .gte('date', startDate)
    .lte('date', endDate)

  if (!data) return

  // Group by vehicle and sum liters
  const vehicleMap = new Map()
  const equipmentMap = new Map()

  data.forEach((t) => {
    const name = t.vehicle || 'Unknown'
    const qty = t.quantity || 0
    // utilization_type column added in Phase 4.
    // If it doesn't exist yet, default everything to Vehicular.
    const isNonVehicle = t.utilization_type === 'Non-Vehicular'

    if (isNonVehicle) {
      equipmentMap.set(name, (equipmentMap.get(name) || 0) + qty)
    } else {
      vehicleMap.set(name, (vehicleMap.get(name) || 0) + qty)
    }
  })

  // Sort by quantity descending, take top 5
  topVehicles.value = [...vehicleMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }))

  topEquipment.value = [...equipmentMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }))
}

// loadRecentTransactions: fetches the 10 most recent transactions for the table
async function loadRecentTransactions() {
  loadingRecent.value = true
  const startDate = `${selectedYear.value}-01-01`
  const endDate = `${selectedYear.value}-12-31`

  const { data } = await supabase
    .from('fuel_transactions')
    .select(
      'date, or_number, vehicle, utilized_by, fuel_type, quantity, total_amount, fund_cluster',
    )
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('or_number', { ascending: false })
    .limit(10)

  recentTransactions.value = data || []
  loadingRecent.value = false
}

// loadAvailableYears: fetches all years that have contract data
async function loadAvailableYears() {
  const { data } = await supabase.from('fuel_contracts').select('year').order('year')
  if (data) {
    const years = [...new Set(data.map((r) => r.year))]
    availableYears.value = years.length > 0 ? years : [new Date().getFullYear()]
  }
}

// ── CHART DRAWING ──

// drawAllCharts: draws (or redraws) all three Chart.js charts.
// Always destroys the previous instance before drawing a new one.
// WHY: Chart.js doesn't auto-update when data changes — you must
// destroy and recreate. Without this, charts stack on top of each other.
function drawAllCharts() {
  drawYearChart()
  if (topVehicles.value.length > 0) drawVehicleChart()
  if (topEquipment.value.length > 0) drawEquipmentChart()
}

function drawYearChart() {
  if (!yearChartRef.value) return
  if (yearChartInstance) yearChartInstance.destroy()

  const labels = yearlyData.value.map((d) => {
    return d.year === selectedYear.value ? `${d.year} (YTD)` : String(d.year)
  })

  yearChartInstance = new Chart(yearChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Diesel',
          data: yearlyData.value.map((d) => Math.round(d.diesel * 100) / 100),
          backgroundColor: '#1565C0',
          borderRadius: 4,
        },
        {
          label: 'Gasoline',
          data: yearlyData.value.map((d) => Math.round(d.gasoline * 100) / 100),
          backgroundColor: '#2E7D32',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${formatNumber(ctx.raw)} L`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: {
          beginAtZero: true,
          ticks: {
            font: { size: 11 },
            callback: (v) => formatNumber(v) + ' L',
          },
        },
      },
    },
  })
}

function drawVehicleChart() {
  if (!vehicleChartRef.value) return
  if (vehicleChartInstance) vehicleChartInstance.destroy()

  vehicleChartInstance = new Chart(vehicleChartRef.value, {
    type: 'bar',
    data: {
      labels: topVehicles.value.map((v) => v.name),
      datasets: [
        {
          label: 'Liters',
          data: topVehicles.value.map((v) => Math.round(v.qty * 100) / 100),
          backgroundColor: '#7B1FA2',
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${formatNumber(ctx.raw)} L`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { font: { size: 11 }, callback: (v) => formatNumber(v) + ' L' },
        },
        y: { ticks: { font: { size: 11 } } },
      },
    },
  })
}

function drawEquipmentChart() {
  if (!equipmentChartRef.value) return
  if (equipmentChartInstance) equipmentChartInstance.destroy()

  equipmentChartInstance = new Chart(equipmentChartRef.value, {
    type: 'bar',
    data: {
      labels: topEquipment.value.map((e) => e.name),
      datasets: [
        {
          label: 'Liters',
          data: topEquipment.value.map((e) => Math.round(e.qty * 100) / 100),
          backgroundColor: '#E65100',
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${formatNumber(ctx.raw)} L`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { font: { size: 11 }, callback: (v) => formatNumber(v) + ' L' },
        },
        y: { ticks: { font: { size: 11 } } },
      },
    },
  })
}

// ── HELPERS ──
function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '0'
  return Number(val).toLocaleString('en-PH', { maximumFractionDigits: 2 })
}

function formatCurrency(val) {
  if (val === null || val === undefined || val === '') return '₱0.00'
  return (
    '₱' +
    Number(val).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

function fundColor(fund) {
  const map = { RAF: 'blue', IGF: 'green', BRF: 'orange', TRF: 'purple' }
  if (map[fund]) return map[fund]
  const colors = ['teal', 'pink', 'indigo', 'cyan', 'deep-orange']
  let hash = 0
  for (let i = 0; i < (fund?.length || 0); i++) hash += fund.charCodeAt(i)
  return colors[hash % colors.length]
}

// utilizationColor: returns a CSS class based on how much of the budget is used.
// < 80%: normal text | 80-89%: warning | 90%+: error
function utilizationColor(pct) {
  if (pct >= 90) return 'text-error'
  if (pct >= 80) return 'text-warning'
  return 'text-success'
}

// Watch year changes to reload everything
// AFTER — delete this line entirely
// The @update:modelValue on the <v-select> already calls loadAll

onMounted(async () => {
  await loadAvailableYears()
  await loadAll()
})
</script>
