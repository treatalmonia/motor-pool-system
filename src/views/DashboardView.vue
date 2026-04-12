<template>
  <v-container fluid class="pa-6">

    <!-- ── Page Header ── -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-3">
      <div class="d-flex align-center ga-3">


        <div>
          <div class="d-flex align-center ga-2 mb-1">
            <h1 class="text-h5 font-weight-bold">Dashboard</h1>

          </div>

        </div>
      </div>
      <div class="d-flex align-center ga-3">
        <v-btn
          icon
          variant="text"
          size="small"
          :loading="loadingAll"
          title="Refresh dashboard"
          @click="loadAll"
        >
          <v-icon size="18">mdi-refresh</v-icon>
        </v-btn>
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
        <v-chip size="small" class="csu-updated-chip">
          <v-icon start size="13">mdi-clock-outline</v-icon>
          {{ todayLabel }}
        </v-chip>
      </div>
    </div>

    <!-- ── Single loading state for whole page ── -->
    <div v-if="loadingAll" class="d-flex align-center justify-center py-16">
      <div class="text-center">
        <v-progress-circular indeterminate color="primary" size="48" width="3" class="mb-4" />
        <div class="text-body-2 text-medium-emphasis">Loading dashboard…</div>
      </div>
    </div>

    <template v-else>

      <!-- ── KPI Summary Cards ── -->
      <v-row density="comfortable" class="mb-4">
        <v-col cols="6" sm="3" v-for="kpi in kpiCards" :key="kpi.label">
          <v-card rounded="lg" elevation="0" border class="kpi-card">
            <div class="kpi-top-border" :style="`background: ${kpi.borderColor}`" />
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">{{ kpi.label }}</span>
                <v-avatar :color="kpi.color" variant="tonal" size="30" rounded="md">
                  <v-icon size="16">{{ kpi.icon }}</v-icon>
                </v-avatar>
              </div>
              <div class="text-h5 font-weight-bold mt-1">{{ kpi.value }}</div>
              <div class="text-caption text-medium-emphasis mt-1">{{ kpi.sub }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── Fuel Budget Overview ── -->
      <div class="section-label mb-3">
        <span>Fuel Budget — FY {{ selectedYear }}</span>
      </div>
      <v-row density="comfortable" class="mb-4">
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">Contract Budget</span>
                <v-icon color="orange" size="18" opacity="0.7">mdi-cash-multiple</v-icon>
              </div>
              <div class="text-h5 font-weight-bold">{{ formatCurrency(fuelBudget.totalContractAmount) }}</div>
              <div class="text-caption text-medium-emphasis mt-1">{{ fuelBudget.totalContracts }} cost centers</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">Consumed</span>
                <v-icon color="blue" size="18" opacity="0.7">mdi-fuel</v-icon>
              </div>
              <div class="text-h5 font-weight-bold">{{ formatCurrency(fuelBudget.totalConsumed) }}</div>
              <div class="mt-2">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span
                    class="text-caption font-weight-medium"
                    :class="fuelBudget.utilizationPct >= 90 ? 'text-error' : fuelBudget.utilizationPct >= 80 ? 'text-warning' : 'text-success'"
                  >{{ fuelBudget.utilizationPct }}% utilized</span>
                  <span class="text-caption text-medium-emphasis">of budget</span>
                </div>
                <div class="util-bar-track">
                  <div
                    class="util-bar-fill"
                    :style="{
                      width: Math.min(fuelBudget.utilizationPct, 100) + '%',
                      background: fuelBudget.utilizationPct >= 90 ? '#d32f2f' : fuelBudget.utilizationPct >= 80 ? '#f57c00' : '#1a6e2e'
                    }"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">Remaining</span>
                <v-icon :color="fuelBudget.totalBalance < 0 ? 'error' : 'success'" size="18" opacity="0.7">mdi-scale-balance</v-icon>
              </div>
              <div class="text-h5 font-weight-bold" :class="fuelBudget.totalBalance < 0 ? 'text-error' : ''">
                {{ fuelBudget.totalBalance < 0 ? '−' : '' }}{{ formatCurrency(Math.abs(fuelBudget.totalBalance)) }}
              </div>
              <div v-if="fuelBudget.overBudgetCount > 0" class="text-caption text-error mt-1">
                {{ fuelBudget.overBudgetCount }} center{{ fuelBudget.overBudgetCount > 1 ? 's' : '' }} over budget
              </div>
              <div v-else class="text-caption text-success mt-1">All centers within budget</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">Transactions</span>
                <v-icon color="primary" size="18" opacity="0.7">mdi-receipt-text</v-icon>
              </div>
              <div class="text-h5 font-weight-bold">{{ fuelBudget.totalTransactions }}</div>
              <div class="text-caption text-medium-emphasis mt-1">This period: {{ fuelBudget.currentPeriodTransactions }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── Budget Alerts ── -->
      <v-row v-if="budgetAlerts.length > 0" density="comfortable" class="mb-4">
        <v-col cols="12">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-4">
              <div class="text-subtitle-2 font-weight-bold mb-3">
                <v-icon start color="warning" size="18">mdi-alert-circle</v-icon>
                Budget Alerts
              </div>
              <div class="d-flex flex-column ga-2">
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
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── Fuel Consumption Summary (replaces 4 charts) ── -->
      <div class="section-label mb-3">
        <span>Fuel Consumption — FY {{ selectedYear }}</span>
      </div>
      <v-row density="comfortable" class="mb-4">
        <!-- Diesel -->
        <v-col cols="12" sm="6">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-3 mb-3">
                <v-avatar color="blue-darken-2" variant="tonal" size="40">
                  <v-icon size="20">mdi-fuel</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-bold">Diesel</div>
                  <div class="text-caption text-medium-emphasis">FY {{ selectedYear }}</div>
                </div>
              </div>
              <!-- Diesel vs Gasoline proportion bar -->
              <div class="mb-3" v-if="fuelStats.dieselLiters + fuelStats.gasolineLiters > 0">
                <div class="d-flex text-caption text-medium-emphasis justify-space-between mb-1">
                  <span>Diesel {{ dieselPct }}%</span>
                  <span>Gasoline {{ 100 - dieselPct }}%</span>
                </div>
                <div class="fuel-split-track">
                  <div class="fuel-split-diesel" :style="`width: ${dieselPct}%`" />
                  <div class="fuel-split-gasoline" :style="`width: ${100 - dieselPct}%`" />
                </div>
              </div>
              <v-divider class="mb-3" />
              <v-row density="compact">
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">Total Liters</div>
                  <div class="text-h6 font-weight-bold text-blue-darken-2">{{ formatNum(fuelStats.dieselLiters) }}</div>
                  <div class="text-caption text-medium-emphasis">L</div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">Amount Spent</div>
                  <div class="text-body-1 font-weight-bold">{{ formatCurrency(fuelStats.dieselAmount) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">Withdrawals</div>
                  <div class="text-h6 font-weight-bold">{{ fuelStats.dieselCount }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Gasoline -->
        <v-col cols="12" sm="6">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-3 mb-3">
                <v-avatar color="green-darken-2" variant="tonal" size="40">
                  <v-icon size="20">mdi-gas-station</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-bold">Gasoline</div>
                  <div class="text-caption text-medium-emphasis">FY {{ selectedYear }}</div>
                </div>
              </div>
              <v-divider class="mb-3" />
              <v-row density="compact">
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">Total Liters</div>
                  <div class="text-h6 font-weight-bold text-green-darken-2">{{ formatNum(fuelStats.gasolineLiters) }}</div>
                  <div class="text-caption text-medium-emphasis">L</div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">Amount Spent</div>
                  <div class="text-body-1 font-weight-bold">{{ formatCurrency(fuelStats.gasolineAmount) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">Withdrawals</div>
                  <div class="text-h6 font-weight-bold">{{ fuelStats.gasolineCount }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── Asset Fuel Summary Table ── -->
      <v-row density="comfortable" class="mb-4">
        <v-col cols="12">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3 flex-wrap ga-2">
                <div>
                  <div class="text-subtitle-2 font-weight-bold">Vehicle Consumption — {{ selectedYear }}</div>
                  <div class="text-caption text-medium-emphasis">Withdrawals, liters consumed, and total amount per asset</div>
                </div>
                <div class="d-flex ga-2 align-center flex-wrap">
                  <v-select
                    v-model="assetTypeFilterDash"
                    :items="['All', 'Vehicular', 'Non-Vehicular']"
                    label="Type"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="min-width: 140px"
                  />
                  <v-text-field
                    v-model="assetSearch"
                    placeholder="Search asset..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    style="max-width: 200px"
                  />
                </div>
              </div>
              <v-data-table
                :headers="assetTableHeaders"
                :items="filteredAssetRows"
                density="compact"
                :items-per-page="10"
                class="asset-table"
                :row-props="({ item }) => item.withdrawals === 0 ? { class: 'row-inactive' } : {}"
              >
                <template #item.asset_type="{ item }">
                  <v-chip :color="item.asset_type === 'Vehicle' ? 'primary' : 'warning'" size="x-small" variant="tonal">
                    {{ item.asset_type }}
                  </v-chip>
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
                  <span class="text-caption">{{ item.diesel_liters > 0 ? formatNum(item.diesel_liters) + ' L' : '—' }}</span>
                </template>
                <template #item.gasoline_liters="{ item }">
                  <span class="text-caption">{{ item.gasoline_liters > 0 ? formatNum(item.gasoline_liters) + ' L' : '—' }}</span>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── Recent Service Requests + Upcoming PM ── -->
      <!-- No spinner — shows a clean empty state instantly when no data exists -->
      <v-row density="comfortable">
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-4">
              <div class="text-subtitle-2 font-weight-bold mb-3">Recent Service Requests</div>
              <div v-if="recentSR.length === 0" class="empty-state-panel">
                <v-icon size="36" color="grey-lighten-1" class="mb-2">mdi-wrench-outline</v-icon>
                <p class="text-caption text-medium-emphasis mb-3">No service requests recorded yet</p>
                <v-btn size="small" variant="tonal" color="primary" to="/vehicle-requests" prepend-icon="mdi-plus">
                  Add Request
                </v-btn>
              </div>
              <div v-else>
                <div
                  v-for="sr in recentSR"
                  :key="sr.id"
                  class="sr-row d-flex align-center justify-space-between py-2"
                >
                  <div>
                    <div class="text-body-2 font-weight-medium">{{ sr.request_no }}</div>
                    <div class="text-caption text-medium-emphasis">{{ sr.asset_name }} · {{ formatDate(sr.date_of_request) }}</div>
                  </div>
                  <v-chip :color="srColor(sr.status)" size="x-small" variant="tonal">{{ sr.status }}</v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-4">
              <div class="text-subtitle-2 font-weight-bold mb-3">Upcoming PM Due</div>
              <div v-if="upcomingPM.length === 0" class="empty-state-panel">
                <v-icon size="36" color="grey-lighten-1" class="mb-2">mdi-calendar-check-outline</v-icon>
                <p class="text-caption text-medium-emphasis mb-3">No preventive maintenance scheduled yet</p>
                <v-btn size="small" variant="tonal" color="primary" to="/vehicle-pm" prepend-icon="mdi-plus">
                  Add PM Record
                </v-btn>
              </div>
              <div v-else>
                <div
                  v-for="pm in upcomingPM"
                  :key="pm.id"
                  class="sr-row d-flex align-center justify-space-between py-2"
                >
                  <div>
                    <div class="text-body-2 font-weight-medium">{{ pm.asset_name }}</div>
                    <div class="text-caption text-medium-emphasis">{{ pm.service_type }} · Due {{ formatDate(pm.next_due_date) }}</div>
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

    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

// ── Year selector ──
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const yearOptions = computed(() => [currentYear - 2, currentYear - 1, currentYear].reverse())
const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
)

// ── Single loading flag — one spinner for the whole page ──
const loadingAll = ref(true)

// ── KPI cards ──
const kpiCards = ref([
  { label: 'Total Assets',     icon: 'mdi-car',         color: 'primary', value: '—', sub: 'Active vehicles & equipment' },
  { label: 'Service Requests', icon: 'mdi-wrench',       color: 'orange',  value: '—', sub: 'This year' },
  { label: 'PM Completed',     icon: 'mdi-check-circle', color: 'success', value: '—', sub: 'This year' },
  { label: 'Total Fuel Cost',  icon: 'mdi-gas-station',  color: 'blue',    value: '—', sub: 'This year (₱)' },
])

// ── Fuel stats (replaces the 4 heavy charts) ──
const fuelStats = ref({
  dieselLiters: 0,   dieselAmount: 0,   dieselCount: 0,
  gasolineLiters: 0, gasolineAmount: 0, gasolineCount: 0,
})

// ── Asset table ──
const assetSearch = ref('')
const assetRows = ref([])
const assetTypeFilterDash = ref('All')

const assetTableHeaders = [
  { title: 'Asset',        key: 'asset_name',      sortable: true },
  { title: 'Type',         key: 'asset_type',      sortable: true },
  { title: 'Withdrawals',  key: 'withdrawals',     sortable: true, align: 'end' },
  { title: 'Diesel (L)',   key: 'diesel_liters',   sortable: true, align: 'end' },
  { title: 'Gasoline (L)', key: 'gasoline_liters', sortable: true, align: 'end' },
  { title: 'Total (L)',    key: 'total_liters',    sortable: true, align: 'end' },
  { title: 'Total Amount', key: 'total_amount',    sortable: true, align: 'end' },
]

const filteredAssetRows = computed(() => {
  let result = assetRows.value
  if (assetTypeFilterDash.value !== 'All') {
    result = result.filter((r) =>
      assetTypeFilterDash.value === 'Non-Vehicular'
        ? r.asset_type === 'Non-Vehicular'
        : r.asset_type === 'Vehicle',
    )
  }
  if (assetSearch.value) {
    const s = assetSearch.value.toLowerCase()
    result = result.filter(
      (r) =>
        (r.asset_name || '').toLowerCase().includes(s) ||
        (r.asset_type || '').toLowerCase().includes(s),
    )
  }
  return result
})

// ── Fuel split percentage ──
const dieselPct = computed(() => {
  const total = fuelStats.value.dieselLiters + fuelStats.value.gasolineLiters
  if (total === 0) return 50
  return Math.round((fuelStats.value.dieselLiters / total) * 100)
})

// ── SR and PM ──
const recentSR  = ref([])
const upcomingPM = ref([])

// ── Fuel budget ──
const fuelBudget = ref({
  totalContractAmount: 0, totalConsumed: 0, totalBalance: 0,
  totalContracts: 0, overBudgetCount: 0, utilizationPct: 0,
  totalTransactions: 0, currentPeriodTransactions: 0,
})
const budgetAlerts = ref([])

// ── Helpers ──
function formatNum(n) {
  return Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
function formatCurrency(n) {
  return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
function srColor(s) {
  return { Pending: 'warning', 'In Progress': 'info', Completed: 'success', Cancelled: 'grey' }[s] || 'grey'
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

// ── Load everything ──
// Total queries: 5 flat parallel fetches.
// Chart.js is completely removed — no library to load at all.
// SR and PM only do a real fetch if their count > 0 (skips the query when tables are empty).
async function loadAll() {
  loadingAll.value = true
  const yr        = selectedYear.value
  const startDate = `${yr}-01-01`
  const endDate   = `${yr}-12-31`

  // One round of parallel queries — shared data for every section
  const [vehiclesRes, txRes, contractsRes, srCountRes, pmCountRes] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id, asset_name, asset_type')
      .eq('status', 'Active')
      .order('asset_name'),
    supabase
      .from('fuel_transactions')
      .select('vehicle, fuel_type, quantity, total_amount, contract_id, billing_period')
      .gte('date', startDate)
      .lte('date', endDate),
    supabase
      .from('fuel_contracts')
      .select('id, contract_amount, account_code, fund_cluster')
      .eq('year', yr),
    supabase
      .from('vehicle_service_requests')
      .select('id', { count: 'exact', head: true })
      .gte('date_of_request', startDate)
      .lte('date_of_request', endDate),
    supabase
      .from('vehicle_pm_log')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Completed')
      .gte('date_performed', startDate)
      .lte('date_performed', endDate),
  ])

  const allVehicles = vehiclesRes.data || []
  const txRows      = txRes.data      || []
  const contracts   = contractsRes.data || []

  // ── KPI cards ──
  const totalFuel = txRows.reduce((s, r) => s + (Number(r.total_amount) || 0), 0)
  kpiCards.value = [
    { label: 'Total Assets',     icon: 'mdi-car',         color: 'primary', borderColor: '#1a6e2e', value: allVehicles.length,          sub: 'Active vehicles & equipment' },
    { label: 'Service Requests', icon: 'mdi-wrench',       color: 'orange',  borderColor: '#d4621a', value: srCountRes.count  ?? 0,     sub: `${yr} records` },
    { label: 'PM Completed',     icon: 'mdi-check-circle', color: 'success', borderColor: '#c9960c', value: pmCountRes.count  ?? 0,     sub: `${yr} records` },
    { label: 'Total Fuel Cost',  icon: 'mdi-gas-station',  color: 'blue',    borderColor: '#1565c0', value: '₱' + formatNum(totalFuel), sub: `${yr} transactions` },
  ]

  // ── Fuel stats (diesel / gasoline cards) ──
  const diesel   = txRows.filter((r) => r.fuel_type === 'Diesel')
  const gasoline = txRows.filter((r) => r.fuel_type === 'Gasoline')
  fuelStats.value = {
    dieselLiters:   diesel.reduce((s, r)   => s + (Number(r.quantity)     || 0), 0),
    dieselAmount:   diesel.reduce((s, r)   => s + (Number(r.total_amount) || 0), 0),
    dieselCount:    diesel.length,
    gasolineLiters: gasoline.reduce((s, r) => s + (Number(r.quantity)     || 0), 0),
    gasolineAmount: gasoline.reduce((s, r) => s + (Number(r.total_amount) || 0), 0),
    gasolineCount:  gasoline.length,
  }

  // ── Asset table ──
  assetRows.value = allVehicles.map((v) => {
    const nm       = (v.asset_name || '').toLowerCase()
    const matching = txRows.filter((r) => (r.vehicle || '').toLowerCase().includes(nm))
    const dRows    = matching.filter((r) => r.fuel_type === 'Diesel')
    const gRows    = matching.filter((r) => r.fuel_type === 'Gasoline')
    const dL       = dRows.reduce((s, r)    => s + (Number(r.quantity)     || 0), 0)
    const gL       = gRows.reduce((s, r)    => s + (Number(r.quantity)     || 0), 0)
    const allAmt   = matching.reduce((s, r) => s + (Number(r.total_amount) || 0), 0)
    const fuelType = dL > 0 && gL > 0 ? 'Diesel / Gasoline' : dL > 0 ? 'Diesel' : gL > 0 ? 'Gasoline' : '—'
    return {
      id: v.id, asset_name: v.asset_name, asset_type: v.asset_type,
      withdrawals:     matching.length,
      diesel_liters:   Math.round(dL        * 100) / 100,
      gasoline_liters: Math.round(gL        * 100) / 100,
      total_liters:    Math.round((dL + gL) * 100) / 100,
      fuel_type: fuelType,
      total_amount: Math.round(allAmt * 100) / 100,
    }
  })

  // ── Fuel budget summary ──
  const consumedMap = new Map()
  txRows.forEach((t) => {
    if (!t.contract_id) return
    consumedMap.set(t.contract_id, (consumedMap.get(t.contract_id) || 0) + (t.total_amount || 0))
  })
  const totalContractAmount = contracts.reduce((s, c) => s + (c.contract_amount || 0), 0)
  const totalConsumed       = txRows.reduce((s, t)    => s + (t.total_amount     || 0), 0)

  const alerts = []
  contracts.forEach((c) => {
    const consumed = consumedMap.get(c.id) || 0
    const balance  = (c.contract_amount || 0) - consumed
    const pct      = c.contract_amount > 0 ? (consumed / c.contract_amount) * 100 : 0
    if (balance < 0) {
      alerts.push({ id: c.id, type: 'error',   name: c.account_code, message: `is ₱${formatNum(Math.abs(balance))} over budget` })
    } else if (pct >= 90) {
      alerts.push({ id: c.id, type: 'warning', name: c.account_code, message: `at ${pct.toFixed(1)}% utilized. ₱${formatNum(balance)} remaining` })
    }
  })

  const periodCounts = {}
  txRows.forEach((t) => {
    if (t.billing_period) periodCounts[t.billing_period] = (periodCounts[t.billing_period] || 0) + 1
  })
  const currentPeriod  = Object.keys(periodCounts).sort().pop() || ''
  const utilizationPct = totalContractAmount > 0
    ? Math.round((totalConsumed / totalContractAmount) * 1000) / 10 : 0

  fuelBudget.value = {
    totalContractAmount, totalConsumed,
    totalBalance:             totalContractAmount - totalConsumed,
    totalContracts:           contracts.length,
    overBudgetCount:          alerts.filter((a) => a.type === 'error').length,
    utilizationPct,
    totalTransactions:        txRows.length,
    currentPeriodTransactions: periodCounts[currentPeriod] || 0,
  }
  budgetAlerts.value = alerts.sort((a, b) =>
    a.type === 'error' && b.type !== 'error' ? -1 : b.type === 'error' ? 1 : 0,
  )

  // ── SR and PM: skip the real query entirely when tables are empty ──
  const hasSR = (srCountRes.count ?? 0) > 0
  const hasPM = (pmCountRes.count ?? 0) > 0

  if (hasSR || hasPM) {
    const vMap   = Object.fromEntries(allVehicles.map((v) => [String(v.id), v.asset_name]))
    const today  = new Date().toISOString().split('T')[0]
    const plus30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

    const [srRes, pmRes] = await Promise.all([
      hasSR
        ? supabase
            .from('vehicle_service_requests')
            .select('id, request_no, date_of_request, status, vehicle_id')
            .order('date_of_request', { ascending: false })
            .limit(8)
        : Promise.resolve({ data: [] }),
      hasPM
        ? supabase
            .from('vehicle_pm_log')
            .select('id, vehicle_id, service_type, next_due_date, status')
            .neq('status', 'Completed')
            .gte('next_due_date', today)
            .lte('next_due_date', plus30)
            .order('next_due_date')
            .limit(8)
        : Promise.resolve({ data: [] }),
    ])

    recentSR.value   = (srRes.data  || []).map((r) => ({ ...r, asset_name: vMap[String(r.vehicle_id)] || `Asset #${r.vehicle_id}` }))
    upcomingPM.value = (pmRes.data  || []).map((r) => ({ ...r, asset_name: vMap[String(r.vehicle_id)] || `Asset #${r.vehicle_id}` }))
  } else {
    recentSR.value   = []
    upcomingPM.value = []
  }

  loadingAll.value = false
}

onMounted(() => loadAll())
</script>

<style scoped>
/* ── CSU Brand Colors ──────────────────────────── */
/* Green: #1a6e2e  Gold: #c9960c  Orange: #d4621a  */

/* ── Header ── */
.csu-logo {
  height: 44px;
  width: auto;
  object-fit: contain;
}
.header-divider {
  width: 1px;
  height: 36px;
  background: currentColor;
  opacity: 0.15;
}
.csu-gold-chip {
  background: rgba(201, 150, 12, 0.12) !important;
  color: #c9960c !important;
  font-size: 10px !important;
  font-weight: 600 !important;
}
.csu-updated-chip {
  background: rgba(26, 110, 46, 0.1) !important;
  color: #1a6e2e !important;
  font-size: 11px !important;
}

/* ── Section Labels ── */
.section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 10px;
  border-left: 3px solid #1a6e2e;
}
.section-label span {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  opacity: 0.7;
}

/* ── KPI Cards ── */
.kpi-card {
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.kpi-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.10) !important;
}
.kpi-top-border {
  height: 3px;
  width: 100%;
}

/* ── Utilization Bar ── */
.util-bar-track {
  height: 6px;
  border-radius: 99px;
  background: rgba(128, 128, 128, 0.15);
  overflow: hidden;
}
.util-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s ease;
}

/* ── Fuel Split Bar ── */
.fuel-split-track {
  height: 6px;
  border-radius: 99px;
  overflow: hidden;
  display: flex;
}
.fuel-split-diesel {
  height: 100%;
  background: #1565c0;
  transition: width 0.6s ease;
}
.fuel-split-gasoline {
  height: 100%;
  background: #1a6e2e;
  transition: width 0.6s ease;
}

/* ── SR / PM rows ── */
.sr-row {
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}
.sr-row:last-child {
  border-bottom: none;
}

/* ── Empty state panels ── */
.empty-state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  text-align: center;
}

/* ── Asset table ── */
.asset-table :deep(thead th) {
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.6;
}
.asset-table :deep(tbody td) {
  font-size: 12px !important;
}
.asset-table :deep(tbody tr:hover td) {
  background: rgba(26, 110, 46, 0.04) !important;
}
.asset-table :deep(.row-inactive td) {
  opacity: 0.4;
}
</style>
