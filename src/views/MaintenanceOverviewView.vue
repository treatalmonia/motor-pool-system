<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between flex-wrap ga-3">
          <div>
            <h2 class="text-h5 font-weight-bold">Maintenance Overview</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Per-vehicle service history matrix — last performed and next due
            </p>
          </div>
          <div class="d-flex ga-3 align-center flex-wrap">
            <v-select
              v-model="selectedYear"
              :items="yearOptions"
              label="Year"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 110px"
            />
            <v-select
              v-model="selectedVehicleId"
              :items="vehicleOptions"
              item-title="asset_name"
              item-value="id"
              label="Vehicle"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 180px"
            />
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="text-medium-emphasis mt-4">Loading maintenance data...</p>
      </v-col>
    </v-row>

    <!-- No vehicle selected -->
    <v-row v-else-if="!selectedVehicleId">
      <v-col class="text-center py-12">
        <v-icon size="64" color="grey-lighten-1">mdi-car-search</v-icon>
        <p class="text-medium-emphasis mt-4">Select a vehicle to view its maintenance matrix.</p>
      </v-col>
    </v-row>

    <!-- Matrix Table -->
    <template v-else>
      <!-- Vehicle Info Card -->
      <v-row class="mb-4">
        <v-col>
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="d-flex align-center ga-4 flex-wrap">
              <v-avatar color="primary" variant="tonal" size="48">
                <v-icon>mdi-car</v-icon>
              </v-avatar>
              <div>
                <p class="text-h6 font-weight-bold">{{ selectedVehicle?.asset_name }}</p>
                <p class="text-medium-emphasis text-body-2">
                  {{ selectedVehicle?.plate_number || '—' }}
                  <span v-if="selectedVehicle?.model"> · {{ selectedVehicle.model }}</span>
                  <span v-if="selectedVehicle?.year_model">
                    · {{ selectedVehicle.year_model }}</span
                  >
                </p>
              </div>
              <v-spacer />
              <div class="text-right d-flex flex-column align-end ga-2">
                <div>
                  <p class="text-caption text-medium-emphasis">Current Odometer</p>
                  <p class="text-body-1 font-weight-bold">
                    {{
                      selectedVehicle?.current_odometer
                        ? Number(selectedVehicle.current_odometer).toLocaleString() + ' km'
                        : '—'
                    }}
                  </p>
                </div>
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-history"
                  @click="openEFHRDialog"
                >
                  Repair History
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Summary Cards -->
      <v-row class="mb-4">
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="d-flex align-center ga-3">
              <v-avatar color="success" variant="tonal" size="40">
                <v-icon size="20">mdi-check-circle</v-icon>
              </v-avatar>
              <div>
                <p class="text-caption text-medium-emphasis">Done This Year</p>
                <p class="text-h6 font-weight-bold">{{ doneThisYear }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="d-flex align-center ga-3">
              <v-avatar color="error" variant="tonal" size="40">
                <v-icon size="20">mdi-alert-circle</v-icon>
              </v-avatar>
              <div>
                <p class="text-caption text-medium-emphasis">Overdue</p>
                <p class="text-h6 font-weight-bold">{{ overdueCount }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="d-flex align-center ga-3">
              <v-avatar color="warning" variant="tonal" size="40">
                <v-icon size="20">mdi-clock-alert</v-icon>
              </v-avatar>
              <div>
                <p class="text-caption text-medium-emphasis">Due Soon</p>
                <p class="text-h6 font-weight-bold">{{ dueSoonCount }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="d-flex align-center ga-3">
              <v-avatar color="info" variant="tonal" size="40">
                <v-icon size="20">mdi-calendar-clock</v-icon>
              </v-avatar>
              <div>
                <p class="text-caption text-medium-emphasis">Scheduled</p>
                <p class="text-h6 font-weight-bold">{{ scheduledCount }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Matrix -->
      <v-card rounded="lg" elevation="0" border>
        <v-card-text class="pa-0">
          <div class="overflow-x-auto">
            <table class="maintenance-matrix">
              <thead>
                <tr>
                  <th class="col-service sticky-col">Service Type</th>
                  <th v-for="month in months" :key="month.value" class="col-month text-center">
                    {{ month.label }}
                  </th>
                  <th class="col-ref text-center">Ref No.</th>
                  <th class="col-next text-center">Next Due</th>
                  <th class="col-odo text-center">Next Odo</th>
                  <th class="col-status text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in matrixRows" :key="row.service_type" :class="rowClass(row)">
                  <td class="sticky-col cell-service">
                    <span class="text-body-2 font-weight-medium">{{ row.service_type }}</span>
                    <span class="text-caption text-medium-emphasis d-block">
                      <span v-if="row.km_between_service"
                        >every {{ Number(row.km_between_service).toLocaleString() }} km</span
                      >
                      <span v-if="row.km_between_service && row.months_between_service"> · </span>
                      <span v-if="row.months_between_service"
                        >{{ row.months_between_service }} mo</span
                      >
                    </span>
                  </td>
                  <td v-for="month in months" :key="month.value" class="text-center cell-month">
                    <template v-if="row.monthCells[month.value]">
                      <v-chip
                        color="success"
                        size="x-small"
                        variant="tonal"
                        class="font-weight-medium"
                      >
                        {{ formatShortDate(row.monthCells[month.value].date_performed) }}
                      </v-chip>
                    </template>
                    <span v-else class="text-medium-emphasis text-caption">—</span>
                  </td>
                  <td class="text-center cell-ref">
                    <span class="text-caption text-primary font-weight-medium">
                      {{ row.latestRecord?.reference_no || '—' }}
                    </span>
                  </td>
                  <td class="text-center cell-next">
                    <span class="text-caption font-weight-medium" :class="nextDueDateClass(row)">
                      {{
                        row.latestRecord?.next_due_date
                          ? formatDate(row.latestRecord.next_due_date)
                          : '—'
                      }}
                    </span>
                  </td>
                  <td class="text-center cell-odo">
                    <span class="text-caption">
                      {{
                        row.latestRecord?.next_due_odometer
                          ? Number(row.latestRecord.next_due_odometer).toLocaleString() + ' km'
                          : '—'
                      }}
                    </span>
                  </td>
                  <td class="text-center cell-status">
                    <v-chip :color="statusColor(row)" size="x-small" variant="tonal">
                      {{ statusLabel(row) }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card-text>
      </v-card>

      <!-- Legend -->
      <v-row class="mt-3">
        <v-col class="d-flex ga-3 flex-wrap align-center">
          <span class="text-caption text-medium-emphasis">Legend:</span>
          <v-chip color="error" size="x-small" variant="tonal">Overdue</v-chip>
          <v-chip color="warning" size="x-small" variant="tonal">Due Soon (30 days)</v-chip>
          <v-chip color="success" size="x-small" variant="tonal">OK</v-chip>
          <v-chip color="grey" size="x-small" variant="tonal">No Record</v-chip>
        </v-col>
      </v-row>
    </template>

    <!-- EFHR Dialog -->
    <v-dialog v-model="efhrDialog" max-width="900" scrollable>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0 d-flex align-center justify-space-between">
          <div>
            <span class="text-h6">Repair History</span>
            <p class="text-body-2 text-medium-emphasis mt-1">
              {{ selectedVehicle?.asset_name }} — Equipment Field History Record (EFHR)
            </p>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="efhrDialog = false" />
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Loading -->
          <div v-if="efhrLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <!-- No records -->
          <div v-else-if="efhrRecords.length === 0" class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1">mdi-clipboard-off</v-icon>
            <p class="text-medium-emphasis mt-3">No repair records found for this vehicle.</p>
          </div>

          <!-- Table -->
          <div v-else class="overflow-x-auto">
            <table class="efhr-table">
              <thead>
                <tr>
                  <th>Ref No.</th>
                  <th>Date Start</th>
                  <th>Date End</th>
                  <th>Particulars / Problem</th>
                  <th>Work Done</th>
                  <th>Conducted By</th>
                  <th class="text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in efhrRecords" :key="r.id">
                  <td>
                    <span class="text-primary font-weight-medium text-body-2">
                      {{ r.request_no || '—' }}
                    </span>
                  </td>
                  <td class="text-caption">{{ formatDate(r.date_of_request) || '—' }}</td>
                  <td class="text-caption">{{ formatDate(r.date_end) || '—' }}</td>
                  <td class="cell-wrap text-body-2">{{ r.problem_details || '—' }}</td>
                  <td class="cell-wrap text-body-2">{{ r.work_details || '—' }}</td>
                  <td class="text-caption">{{ r.conducted_by || '—' }}</td>
                  <td class="text-right text-caption font-weight-medium">
                    {{ r.cost ? '₱' + Number(r.cost).toLocaleString() : '—' }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-right font-weight-bold text-body-2 pt-2">
                    Total Cost
                  </td>
                  <td class="text-right font-weight-bold text-body-2 pt-2">
                    ₱{{ efhrTotalCost.toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { supabase } from '../supabase'

const today = new Date().toISOString().split('T')[0]
const currentYear = new Date().getFullYear()

// ---- STATE ----
const loading = ref(false)
const vehicles = ref([])
const pmServiceTypes = ref([])
const pmRecords = ref([])
const selectedVehicleId = ref(null)
const selectedYear = ref(currentYear)

// ---- YEAR OPTIONS ----
const yearOptions = computed(() => {
  const years = []
  for (let y = currentYear + 1; y >= currentYear - 4; y--) years.push(y)
  return years
})

// ---- MONTHS ----
const months = [
  { label: 'Jan', value: 1 },
  { label: 'Feb', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Apr', value: 4 },
  { label: 'May', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Aug', value: 8 },
  { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Dec', value: 12 },
]

// ---- VEHICLE OPTIONS ----
const vehicleOptions = computed(() => vehicles.value.filter((v) => v.asset_type === 'Vehicle'))

const selectedVehicle = computed(
  () => vehicles.value.find((v) => v.id === selectedVehicleId.value) || null,
)

// ---- MATRIX ROWS ----
const matrixRows = computed(() => {
  if (!selectedVehicleId.value || !pmServiceTypes.value.length) return []

  const vehicleRecords = pmRecords.value.filter((r) => r.vehicle_id === selectedVehicleId.value)

  return pmServiceTypes.value.map((st) => {
    const records = vehicleRecords.filter((r) => r.service_type === st.service_type)

    const yearRecords = records.filter((r) => {
      if (!r.date_performed) return false
      return new Date(r.date_performed).getFullYear() === selectedYear.value
    })

    const monthCells = {}
    yearRecords.forEach((r) => {
      const month = new Date(r.date_performed + 'T00:00:00').getMonth() + 1
      if (!monthCells[month] || r.date_performed > monthCells[month].date_performed) {
        monthCells[month] = r
      }
    })

    const latestRecord = records.length
      ? records.reduce((a, b) => ((a.date_performed || '') > (b.date_performed || '') ? a : b))
      : null

    return {
      service_type: st.service_type,
      km_between_service: st.km_between_service,
      months_between_service: st.months_between_service,
      monthCells,
      latestRecord,
    }
  })
})

// ---- SUMMARY COUNTS ----
const doneThisYear = computed(
  () => matrixRows.value.filter((r) => Object.keys(r.monthCells).length > 0).length,
)

const overdueCount = computed(
  () =>
    matrixRows.value.filter((r) => {
      if (!r.latestRecord?.next_due_date) return false
      return r.latestRecord.next_due_date < today
    }).length,
)

const dueSoonCount = computed(() => {
  const soon = new Date()
  soon.setDate(soon.getDate() + 30)
  const soonStr = soon.toISOString().split('T')[0]
  return matrixRows.value.filter((r) => {
    if (!r.latestRecord?.next_due_date) return false
    return r.latestRecord.next_due_date >= today && r.latestRecord.next_due_date <= soonStr
  }).length
})

const scheduledCount = computed(
  () =>
    matrixRows.value.filter((r) => {
      if (!r.latestRecord?.next_due_date) return false
      const soon = new Date()
      soon.setDate(soon.getDate() + 30)
      return r.latestRecord.next_due_date > soon.toISOString().split('T')[0]
    }).length,
)

// ---- HELPERS ----
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}/${dd}`
}

function statusLabel(row) {
  if (!row.latestRecord?.next_due_date) return 'No Record'
  if (row.latestRecord.next_due_date < today) return 'Overdue'
  const soon = new Date()
  soon.setDate(soon.getDate() + 30)
  if (row.latestRecord.next_due_date <= soon.toISOString().split('T')[0]) return 'Due Soon'
  return 'OK'
}

function statusColor(row) {
  const label = statusLabel(row)
  return { Overdue: 'error', 'Due Soon': 'warning', OK: 'success', 'No Record': 'grey' }[label]
}

function rowClass(row) {
  const label = statusLabel(row)
  if (label === 'Overdue') return 'row-overdue'
  if (label === 'Due Soon') return 'row-due-soon'
  return ''
}

function nextDueDateClass(row) {
  const label = statusLabel(row)
  if (label === 'Overdue') return 'text-error'
  if (label === 'Due Soon') return 'text-warning'
  return ''
}

// ---- FETCH ----
async function fetchVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, asset_name, asset_type, plate_number, model, year_model, current_odometer')
    .eq('status', 'Active')
    .order('asset_name')
  if (!error) vehicles.value = data
}

async function fetchServiceTypes() {
  const { data, error } = await supabase.from('pm_service_types').select('*').order('service_type')
  if (!error) pmServiceTypes.value = data
}

async function fetchPMRecords() {
  if (!selectedVehicleId.value) return
  loading.value = true
  const { data, error } = await supabase
    .from('vehicle_pm_log')
    .select('*')
    .eq('vehicle_id', selectedVehicleId.value)
    .order('date_performed', { ascending: false })
  if (!error) pmRecords.value = data
  loading.value = false
}

watch(selectedVehicleId, () => fetchPMRecords())

// ---- EFHR ----
const efhrDialog = ref(false)
const efhrLoading = ref(false)
const efhrRecords = ref([])

const efhrTotalCost = computed(() =>
  efhrRecords.value.reduce((sum, r) => sum + (Number(r.cost) || 0), 0),
)

async function openEFHRDialog() {
  efhrDialog.value = true
  efhrLoading.value = true
  efhrRecords.value = []

  const { data, error } = await supabase
    .from('vehicle_service_requests')
    .select('*')
    .eq('vehicle_id', selectedVehicleId.value)
    .order('date_of_request', { ascending: false })

  if (!error) efhrRecords.value = data
  efhrLoading.value = false
}

// ---- LIFECYCLE ----
onMounted(async () => {
  await fetchVehicles()
  await fetchServiceTypes()
})
</script>

<style scoped>
.maintenance-matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.maintenance-matrix th,
.maintenance-matrix td {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
  white-space: nowrap;
}

.maintenance-matrix th {
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(128, 128, 128, 0.08);
  color: rgba(128, 128, 128, 0.9);
}

.sticky-col {
  position: sticky;
  left: 0;
  z-index: 2;
  background: inherit;
  min-width: 200px;
}

.maintenance-matrix th.sticky-col {
  z-index: 3;
  background: rgba(128, 128, 128, 0.08);
}

.col-month {
  min-width: 72px;
}
.col-ref {
  min-width: 90px;
}
.col-next {
  min-width: 90px;
}
.col-odo {
  min-width: 110px;
}
.col-status {
  min-width: 90px;
}

.row-overdue td {
  background: rgba(239, 68, 68, 0.06);
}
.row-due-soon td {
  background: rgba(245, 158, 11, 0.06);
}

.cell-service {
  padding: 10px 12px;
}

.efhr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.efhr-table th,
.efhr-table td {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
  white-space: nowrap;
  vertical-align: top;
}

.efhr-table th {
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(128, 128, 128, 0.08);
  color: rgba(128, 128, 128, 0.9);
}

.efhr-table tfoot td {
  border-top: 2px solid rgba(128, 128, 128, 0.2);
  border-bottom: none;
}

.cell-wrap {
  white-space: normal;
  max-width: 220px;
  min-width: 140px;
}
</style>
