<template>
  <v-container fluid>

    <!-- Page Header -->
    <v-row class="mb-2 no-print">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">Maintenance Log</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Preventive Maintenance records across all vehicles
            </p>
          </div>
          <v-btn variant="outlined" prepend-icon="mdi-printer" @click="printReport">
            Print
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Summary Cards — hidden on print -->
    <v-row class="mb-4 no-print">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Total Records</p>
                <p class="text-h5 font-weight-bold">{{ totalRecords }}</p>
              </div>
              <v-icon size="36" color="primary" opacity="0.6">mdi-clipboard-list</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Completed</p>
                <p class="text-h5 font-weight-bold text-success">{{ completedCount }}</p>
              </div>
              <v-icon size="36" color="success" opacity="0.6">mdi-check-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Scheduled</p>
                <p class="text-h5 font-weight-bold text-info">{{ scheduledCount }}</p>
              </div>
              <v-icon size="36" color="info" opacity="0.6">mdi-calendar-clock</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Overdue</p>
                <p class="text-h5 font-weight-bold text-error">{{ overdueCount }}</p>
              </div>
              <v-icon size="36" color="error" opacity="0.6">mdi-alert-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters — hidden on print -->
    <v-card rounded="lg" elevation="0" border class="mb-4 no-print">
      <v-card-text>
        <v-row align="center" dense>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="search"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" sm="2">
            <v-select
              v-model="assetTypeFilter"
              :items="['All', 'Vehicle', 'Non-Vehicular']"
              label="Asset Type"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="vehicleFilter"
              :items="assetOptions"
              label="Asset"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" sm="2">
            <v-select
              v-model="statusFilter"
              :items="['All', 'Scheduled', 'Completed', 'Overdue', 'Cancelled']"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="2">
            <v-select
              v-model="yearFilter"
              :items="yearOptions"
              label="Year"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ============================================================
         SCREEN TABLE
    ============================================================ -->
    <v-card rounded="lg" elevation="0" border class="no-print">
      <v-data-table
        :headers="headers"
        :items="filteredRecords"
        :loading="loading"
        :search="search"
        density="compact"
        class="maintenance-table"
      >
        <template #item.asset_name="{ item }">
          <div class="font-weight-medium">{{ item.asset_name }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.asset_type }}</div>
        </template>
        <template #item.date_performed="{ item }">
          {{ formatDate(item.date_performed) || '—' }}
        </template>
        <template #item.next_due_date="{ item }">
          {{ formatDate(item.next_due_date) || '—' }}
        </template>
        <template #item.date_accomplished="{ item }">
          {{ formatDate(item.date_accomplished) || '—' }}
        </template>
        <template #item.cost="{ item }">
          {{ item.cost ? formatCurrency(item.cost) : '—' }}
        </template>
        <template #item.status="{ item }">
          <v-chip
            :color="statusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ item.status }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>

    <!-- ============================================================
         PRINTABLE AREA
    ============================================================ -->
    <div class="print-only" id="maintenance-log-print">

      <ReportHeader variant="standard" />

      <div class="print-title-block">
        <div class="print-title">MAINTENANCE LOG</div>
        <div class="print-subtitle">
          {{ assetTypeFilter !== 'All' ? assetTypeFilter : 'All Assets' }}
          {{ vehicleFilter ? ' — ' + vehicleFilter : '' }}
          {{ statusFilter !== 'All' ? ' | Status: ' + statusFilter : '' }}
          {{ yearFilter ? ' | Year: ' + yearFilter : '' }}
        </div>
      </div>

      <!-- Print table — NO vehicle column per user requirement -->
      <table class="print-table">
        <thead>
          <tr>
            <th class="pt-no">No.</th>
            <th class="pt-stype">Service Type</th>
            <th class="pt-dperf">Date Performed</th>
            <th class="pt-ddue">Next Due Date</th>
            <th class="pt-dacc">Date Accomplished</th>
            <th class="pt-conducted">Conducted By</th>
            <th class="pt-status">Status</th>
            <th class="pt-remarks">Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in filteredRecords" :key="item.id">
            <td class="pt-cell text-center">{{ idx + 1 }}</td>
            <td class="pt-cell">{{ item.service_type }}</td>
            <td class="pt-cell">{{ formatDate(item.date_performed) || '—' }}</td>
            <td class="pt-cell">{{ formatDate(item.next_due_date) || '—' }}</td>
            <td class="pt-cell">{{ formatDate(item.date_accomplished) || '—' }}</td>
            <td class="pt-cell">{{ item.conducted_by || '—' }}</td>
            <td class="pt-cell text-center">{{ item.status }}</td>
            <td class="pt-cell">{{ item.remarks || '' }}</td>
          </tr>
          <tr v-if="!filteredRecords.length">
            <td colspan="8" class="pt-cell text-center" style="color:#999;">No records found</td>
          </tr>
        </tbody>
      </table>

      <div class="print-footer">
        Total records: {{ filteredRecords.length }}
        &nbsp;|&nbsp;
        Printed: {{ printDate }}
      </div>
    </div>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import ReportHeader from '../components/ReportHeader.vue'

// ── State ──
const pmRecords      = ref([])
const vehicles       = ref([])
const loading        = ref(false)

const search         = ref('')
const assetTypeFilter = ref('All')
const vehicleFilter  = ref(null)
const statusFilter   = ref('All')
const yearFilter     = ref(new Date().getFullYear())

const printDate = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
})

// ── Table headers (screen) — includes Vehicle column ──
const headers = [
  { title: 'Asset',             key: 'asset_name',       sortable: true },
  { title: 'Service Type',      key: 'service_type',     sortable: true },
  { title: 'Date Performed',    key: 'date_performed',   sortable: true },
  { title: 'Next Due Date',     key: 'next_due_date',    sortable: true },
  { title: 'Date Accomplished', key: 'date_accomplished', sortable: true },
  { title: 'Conducted By',      key: 'conducted_by',     sortable: true },
  { title: 'Cost',              key: 'cost',             sortable: false },
  { title: 'Status',            key: 'status',           sortable: true },
  { title: 'Remarks',           key: 'remarks',          sortable: false },
]

// ── Computed ──
const yearOptions = computed(() => {
  const cur = new Date().getFullYear()
  return [cur - 2, cur - 1, cur, cur + 1].reverse()
})

const assetOptions = computed(() =>
  [...new Set(pmRecords.value.map(r => r.asset_name).filter(Boolean))].sort()
)

const filteredRecords = computed(() => {
  return pmRecords.value.filter(r => {
    if (assetTypeFilter.value !== 'All' && r.asset_type !== assetTypeFilter.value) return false
    if (vehicleFilter.value && r.asset_name !== vehicleFilter.value) return false
    if (statusFilter.value !== 'All' && r.status !== statusFilter.value) return false
    if (yearFilter.value) {
      const yr = r.date_performed ? new Date(r.date_performed + 'T00:00:00').getFullYear() : null
      if (yr !== yearFilter.value) return false
    }
    if (search.value) {
      const s = search.value.toLowerCase()
      return (
        (r.asset_name    || '').toLowerCase().includes(s) ||
        (r.service_type  || '').toLowerCase().includes(s) ||
        (r.conducted_by  || '').toLowerCase().includes(s) ||
        (r.remarks       || '').toLowerCase().includes(s)
      )
    }
    return true
  })
})

const totalRecords    = computed(() => filteredRecords.value.length)
const completedCount  = computed(() => filteredRecords.value.filter(r => r.status === 'Completed').length)
const scheduledCount  = computed(() => filteredRecords.value.filter(r => r.status === 'Scheduled').length)
const overdueCount    = computed(() => filteredRecords.value.filter(r => r.status === 'Overdue').length)

// ── Helpers ──
function sid(val) { return val !== null && val !== undefined ? String(val) : null }

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  const yy = String(dt.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

function formatCurrency(val) {
  return '₱' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

function statusColor(status) {
  const map = { Completed: 'success', Scheduled: 'info', Overdue: 'error', Cancelled: 'grey' }
  return map[status] || 'grey'
}

function getAssetName(vehicleId) {
  const v = vehicles.value.find(x => sid(x.id) === sid(vehicleId))
  return v ? v.asset_name : `Asset #${vehicleId}`
}

function getAssetType(vehicleId) {
  const v = vehicles.value.find(x => sid(x.id) === sid(vehicleId))
  return v ? v.asset_type : ''
}

// ── Data ──
async function fetchVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, asset_name, asset_type')
    .eq('status', 'Active')
    .order('asset_name')
  if (error) { console.error('fetchVehicles:', error); return }
  vehicles.value = (data || []).map(v => ({ ...v, id: sid(v.id) }))
}

async function fetchRecords() {
  loading.value = true
  const { data, error } = await supabase
    .from('vehicle_pm_log')
    .select('*')
    .order('date_performed', { ascending: false })
  if (error) {
    console.error('fetchRecords:', error)
  } else {
    pmRecords.value = (data || []).map(r => ({
      ...r,
      asset_name: getAssetName(r.vehicle_id),
      asset_type: r.asset_type || getAssetType(r.vehicle_id),
    }))
  }
  loading.value = false
}

// ── Print ──
function printReport() {
  window.print()
}

// ── Lifecycle ──
onMounted(async () => {
  await fetchVehicles()
  await fetchRecords()
})
</script>

<style scoped>
/* Screen — hide print area */
.print-only { display: none; }

/* Print cards */
.maintenance-table { font-size: 13px; }

/* ── PRINT STYLES ── */
@media print {
  /* Hide everything except the print area */
  .no-print { display: none !important; }

  /* Show print area */
  .print-only {
    display: block !important;
    font-family: Arial, sans-serif;
    font-size: 9px;
    background: white;
  }

  body, .v-app, .v-main, .v-container {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .print-title-block {
    text-align: center;
    margin-bottom: 12px;
  }
  .print-title {
    font-size: 13px;
    font-weight: bold;
    letter-spacing: 1px;
  }
  .print-subtitle {
    font-size: 9px;
    color: #555;
    margin-top: 2px;
  }

  /* Print table — no vehicle column */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5px;
    margin-bottom: 12px;
  }
  .print-table th {
    background: #333;
    color: white;
    padding: 4px 5px;
    border: 1px solid #333;
    text-align: left;
    font-size: 8px;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .print-table td { border: 1px solid #aaa; vertical-align: top; }
  .pt-cell { padding: 3px 4px; min-height: 20px; }
  .text-center { text-align: center; }

  .pt-no        { width: 24px; text-align: center; }
  .pt-stype     { width: 140px; }
  .pt-dperf     { width: 60px; }
  .pt-ddue      { width: 60px; }
  .pt-dacc      { width: 60px; }
  .pt-conducted { width: 110px; }
  .pt-status    { width: 60px; text-align: center; }
  .pt-remarks   { }

  .print-footer {
    font-size: 8px;
    color: #666;
    text-align: right;
    margin-top: 8px;
  }

  @page { margin: 10mm 12mm; }
}
</style>