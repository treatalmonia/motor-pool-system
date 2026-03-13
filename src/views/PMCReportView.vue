<template>
  <v-container fluid>
    <!-- Page Header -->
    <v-row class="mb-4 no-print">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">Preventive Maintenance Checklist</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Generate printable PMC report per vehicle per year
            </p>
          </div>
          <div class="d-flex ga-2">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-printer"
              @click="printReport"
              :disabled="!selectedVehicle"
            >
              Print
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Controls -->
    <v-card rounded="lg" elevation="0" border class="mb-4 no-print">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" sm="4">
            <v-select
              v-model="selectedVehicle"
              :items="vehicles"
              item-title="asset_name"
              item-value="id"
              label="Select Vehicle"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:modelValue="onVehicleChange"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="selectedYear"
              :items="yearOptions"
              label="Year"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:modelValue="loadData"
            />
          </v-col>
          <v-col cols="12" sm="5" class="d-flex align-center ga-2">
            <v-chip v-if="selectedVehicle && !loading" color="primary" variant="tonal">
              <v-icon start>mdi-car</v-icon>
              {{ selectedVehicleObj?.asset_name }} — {{ selectedYear }}
            </v-chip>
            <v-progress-circular v-if="loading" indeterminate size="24" width="2" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- No vehicle selected -->
    <v-card v-if="!selectedVehicle" rounded="lg" elevation="0" border class="no-print">
      <v-card-text class="text-center pa-12">
        <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-clipboard-text-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">Select a vehicle and year to generate the PMC report</p>
      </v-card-text>
    </v-card>

    <!-- ============================================================ -->
    <!-- PRINTABLE REPORT AREA -->
    <!-- ============================================================ -->
    <div v-if="selectedVehicle" class="print-area" id="pmc-report">

      <!-- ========== PAGE 1: CHECKLIST MATRIX ========== -->
      <div class="pmc-page page-break-after">

        <!-- Official CSU Header -->
        <ReportHeader variant="standard" />

        <!-- Report Title -->
        <div class="pmc-title-block">
          <div class="pmc-title">PREVENTIVE MAINTENANCE CHECKLIST</div>
          <div class="pmc-subtitle">For the year {{ selectedYear }}</div>
        </div>

        <!-- Vehicle Info -->
        <table class="pmc-info-table">
          <tr>
            <td class="info-label">Equipment/Facility Name</td>
            <td class="info-value">
              <span
                v-if="!editMode"
                class="editable-field"
                @click="enableEdit"
              >{{ editableInfo.name }}</span>
              <input v-else v-model="editableInfo.name" class="edit-input" />
            </td>
          </tr>
          <tr>
            <td class="info-label">EQF CODE</td>
            <td class="info-value">
              <span
                v-if="!editMode"
                class="editable-field"
                @click="enableEdit"
              >{{ editableInfo.eqfCode }}</span>
              <input v-else v-model="editableInfo.eqfCode" class="edit-input" />
            </td>
          </tr>
          <tr>
            <td class="info-label">Location</td>
            <td class="info-value">
              <span
                v-if="!editMode"
                class="editable-field"
                @click="enableEdit"
              >{{ editableInfo.location }}</span>
              <input v-else v-model="editableInfo.location" class="edit-input" />
            </td>
          </tr>
        </table>

        <!-- Checkpoints Legend -->
        <table class="pmc-checkpoints-table">
          <thead>
            <tr>
              <th>Checkpoints</th>
              <th>Frequency</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cp in checkpoints" :key="cp.no">
              <td class="text-center">{{ cp.no }}</td>
              <td>{{ cp.frequency }}</td>
              <td>{{ cp.description }}</td>
            </tr>
          </tbody>
        </table>

        <div class="pmc-note">
          Note: Put the actual date of maintenance and name of the mechanic.
        </div>

        <!-- Main Matrix Table -->
        <table class="pmc-matrix-table">
          <thead>
            <tr>
              <th rowspan="2" class="month-col">Month</th>
              <th colspan="4" class="checkpoint-group">Checkpoint 1 (Weekly)</th>
              <th rowspan="2" class="cp-col">CP 2</th>
              <th rowspan="2" class="cp-col">CP 3</th>
              <th rowspan="2" class="cp-col">CP 4</th>
              <th rowspan="2" class="cp-col">CP 5</th>
            </tr>
            <tr>
              <th class="week-col">Week 1</th>
              <th class="week-col">Week 2</th>
              <th class="week-col">Week 3</th>
              <th class="week-col">Week 4</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(month, mIdx) in months" :key="month">
              <td class="month-name">{{ month }}</td>
              <!-- Week 1-4 for CP1 -->
              <td v-for="week in 4" :key="'w'+week" class="matrix-cell">
                <div
                  v-if="!editMode"
                  class="cell-text editable-field"
                  @click="enableEdit"
                >{{ matrixData[mIdx].cp1['week'+week] }}</div>
                <textarea
                  v-else
                  v-model="matrixData[mIdx].cp1['week'+week]"
                  class="cell-input"
                  rows="2"
                />
              </td>
              <!-- CP 2-5 -->
              <td v-for="cp in [2,3,4,5]" :key="'cp'+cp" class="matrix-cell">
                <div
                  v-if="!editMode"
                  class="cell-text editable-field"
                  @click="enableEdit"
                >{{ matrixData[mIdx]['cp'+cp] }}</div>
                <textarea
                  v-else
                  v-model="matrixData[mIdx]['cp'+cp]"
                  class="cell-input"
                  rows="2"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Signatory -->
        <div class="pmc-signatory-block">
          <div class="signatory-item">
            <span class="signatory-label">Reviewed by:</span>
            <div class="signatory-name">
              <span
                v-if="!editMode"
                class="editable-field"
                @click="enableEdit"
              >{{ editableInfo.reviewedByName }}</span>
              <input v-else v-model="editableInfo.reviewedByName" class="edit-input" />
            </div>
            <div class="signatory-title">
              <span
                v-if="!editMode"
                class="editable-field"
                @click="enableEdit"
              >{{ editableInfo.reviewedByTitle }}</span>
              <input v-else v-model="editableInfo.reviewedByTitle" class="edit-input" />
            </div>
          </div>
        </div>

        <!-- Form Code -->
        <div class="form-code">
          <span>F-GEN-PMC-003a</span>
          <span>Rev. 3 10/19/2023</span>
        </div>
      </div>

      <!-- ========== PAGE 2: REPORT LOG ========== -->
      <div class="pmc-page">

        <!-- Official CSU Header -->
        <ReportHeader variant="standard" />

        <!-- Report Log Title -->
        <div class="pmc-title-block">
          <div class="pmc-title">PREVENTIVE MAINTENANCE CHECKLIST</div>
          <div class="pmc-section-title">REPORT LOG</div>
          <div class="pmc-note-small">*Log problem(s) encountered during conduct of Preventive Maintenance.</div>
        </div>

        <!-- Report Log Table -->
        <table class="pmc-log-table">
          <thead>
            <tr>
              <th class="log-date-col">Date</th>
              <th class="log-ref-col">Reference No.</th>
              <th class="log-remarks-col">Remarks / Problem Encountered</th>
              <th class="log-action-col">Action Taken</th>
              <th class="log-reported-col">Reported By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in reportLogRows" :key="idx">
              <td class="log-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.date }}
                </div>
                <input v-else v-model="row.date" class="edit-input" />
              </td>
              <td class="log-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.reference_no }}
                </div>
                <input v-else v-model="row.reference_no" class="edit-input" />
              </td>
              <td class="log-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.remarks }}
                </div>
                <textarea v-else v-model="row.remarks" class="cell-input" rows="2" />
              </td>
              <td class="log-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.action_taken }}
                </div>
                <textarea v-else v-model="row.action_taken" class="cell-input" rows="2" />
              </td>
              <td class="log-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.reported_by }}
                </div>
                <input v-else v-model="row.reported_by" class="edit-input" />
              </td>
            </tr>
            <!-- Blank filler rows -->
            <tr v-for="n in Math.max(0, 20 - reportLogRows.length)" :key="'blank'+n">
              <td class="log-cell blank-row">&nbsp;</td>
              <td class="log-cell blank-row"></td>
              <td class="log-cell blank-row"></td>
              <td class="log-cell blank-row"></td>
              <td class="log-cell blank-row"></td>
            </tr>
          </tbody>
        </table>

        <!-- Signatory -->
        <div class="pmc-signatory-block">
          <div class="signatory-item">
            <span class="signatory-label">Reviewed by:</span>
            <div class="signatory-name">
              <span
                v-if="!editMode"
                class="editable-field"
                @click="enableEdit"
              >{{ editableInfo.reviewedByName }}</span>
              <input v-else v-model="editableInfo.reviewedByName" class="edit-input" />
            </div>
            <div class="signatory-title">
              <span
                v-if="!editMode"
                class="editable-field"
                @click="enableEdit"
              >{{ editableInfo.reviewedByTitle }}</span>
              <input v-else v-model="editableInfo.reviewedByTitle" class="edit-input" />
            </div>
          </div>
        </div>

        <!-- Form Code -->
        <div class="form-code">
          <span>F-GEN-PMC-003a</span>
          <span>Rev. 3 10/19/2023</span>
        </div>
      </div>

    </div>

    <!-- Edit Mode Toggle Button (floating) -->
    <v-btn
      v-if="selectedVehicle"
      class="no-print"
      :color="editMode ? 'success' : 'primary'"
      :variant="editMode ? 'flat' : 'outlined'"
      :prepend-icon="editMode ? 'mdi-check' : 'mdi-pencil'"
      style="position:fixed; bottom:32px; right:32px; z-index:999;"
      @click="toggleEdit"
    >
      {{ editMode ? 'Done Editing' : 'Edit Fields' }}
    </v-btn>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from  'vue-router'
import { supabase } from '../supabase'
import ReportHeader from '../components/ReportHeader.vue'

const route = useRoute()

// ---- STATE ----
const vehicles = ref([])
const selectedVehicle = ref(null)
const selectedYear = ref(new Date().getFullYear())
const loading = ref(false)
const editMode = ref(false)

// Editable header info
const editableInfo = ref({
  name: '',
  eqfCode: '',
  location: 'CARAGA STATE UNIVERSITY, MAIN CAMPUS',
  reviewedByName: 'ENGR. ENA TIU-IBARRA',
  reviewedByTitle: 'AO III, General Services',
})

// ---- CONSTANTS ----
const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const checkpoints = [
  { no: 1, frequency: 'Weekly',        description: 'Check HYDRAULIC HOSE AND POWER STEERING' },
  { no: 2, frequency: 'Monthly',       description: 'Check BRAKE SYSTEM AND CLUTCH' },
  { no: 3, frequency: 'Quarterly',     description: 'GREASING OF FITTINGS AND REPACKING OF BEARING' },
  { no: 4, frequency: 'Semi-Annually', description: 'CHANGE ENGINE OIL, REPLACE OIL FILTER, AIR FILTER AND OTHER RELATED WORKS' },
  { no: 5, frequency: 'Annually',      description: 'LTO Registration, Insurance, Emission Test, and etc.' },
]

const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  return [current - 2, current - 1, current, current + 1].reverse()
})

// ---- MATRIX DATA (12 months × checkpoints) ----
const emptyMatrix = () => months.map(() => ({
  cp1: { week1: '', week2: '', week3: '', week4: '' },
  cp2: '', cp3: '', cp4: '', cp5: '',
}))

const matrixData = ref(emptyMatrix())

// ---- REPORT LOG ROWS ----
const reportLogRows = ref([])

// ---- COMPUTED ----
const selectedVehicleObj = computed(() =>
  vehicles.value.find(v => v.id === selectedVehicle.value)
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

function getWeekOfMonth(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDate()
  if (day <= 7)  return 'week1'
  if (day <= 14) return 'week2'
  if (day <= 21) return 'week3'
  return 'week4'
}

function formatMechanic(name, dateStr) {
  if (!name && !dateStr) return ''
  const shortDate = formatDate(dateStr)
  // Extract last name from full name (VILLAMOR JR. → VILLAMOR JR.)
  const shortName = name ? name.split(' ').slice(-2).join(' ') : ''
  return shortDate ? `${shortName}  ${shortDate}` : shortName
}

// ---- DATA LOADING ----
async function fetchVehicles() {
  const { data } = await supabase
    .from('vehicles')
    .select('id, asset_name, eqf_code, asset_type, plate_number')
    .eq('asset_type', 'Vehicle')
    .eq('status', 'Active')
    .order('asset_name')
  vehicles.value = data || []
}

function onVehicleChange(vehicleId) {
  if (!vehicleId) {
    matrixData.value = emptyMatrix()
    reportLogRows.value = []
    return
  }
  const v = vehicles.value.find(x => x.id === vehicleId)
  if (v) {
    const platePart = v.plate_number ? ` (${v.plate_number})` : ''
    editableInfo.value.name = `${v.asset_name}${platePart}`
    editableInfo.value.eqfCode = v.eqf_code || ''
  }
  loadData()
}

async function loadData() {
  if (!selectedVehicle.value) return
  loading.value = true
  editMode.value = false

  await Promise.all([
    loadMatrix(),
    loadReportLog(),
  ])

  loading.value = false
}

async function loadMatrix() {
  // Fetch PM log entries for this vehicle in the selected year
  const startDate = `${selectedYear.value}-01-01`
  const endDate   = `${selectedYear.value}-12-31`

  const { data } = await supabase
    .from('vehicle_pm_log')
    .select('date_performed, service_type, conducted_by, status')
    .eq('vehicle_id', selectedVehicle.value)
    .gte('date_performed', startDate)
    .lte('date_performed', endDate)
    .order('date_performed')

  // Reset matrix
  const matrix = emptyMatrix()

  if (data && data.length > 0) {
    data.forEach(entry => {
      const d = new Date(entry.date_performed + 'T00:00:00')
      const monthIdx = d.getMonth() // 0-11
      const week = getWeekOfMonth(entry.date_performed)

      const cellText = entry.status === 'Completed'
        ? formatMechanic(entry.conducted_by, entry.date_performed)
        : entry.status || ''

      const stype = (entry.service_type || '').toLowerCase()

      // Map service types to checkpoints based on keywords
      if (stype.includes('hydraulic') || stype.includes('power steering') || stype.includes('weekly')) {
        // CP1 - Weekly
        if (!matrix[monthIdx].cp1[week]) {
          matrix[monthIdx].cp1[week] = cellText
        }
      } else if (stype.includes('brake') || stype.includes('clutch') || stype.includes('monthly')) {
        matrix[monthIdx].cp2 = cellText
      } else if (stype.includes('grease') || stype.includes('greasing') || stype.includes('bearing') || stype.includes('quarterly')) {
        matrix[monthIdx].cp3 = cellText
      } else if (stype.includes('engine oil') || stype.includes('oil filter') || stype.includes('air filter') || stype.includes('semi')) {
        matrix[monthIdx].cp4 = cellText
      } else if (stype.includes('lto') || stype.includes('registr') || stype.includes('insurance') || stype.includes('emission') || stype.includes('annual')) {
        matrix[monthIdx].cp5 = cellText
      } else {
        // Default: place in CP1 weekly based on date
        if (!matrix[monthIdx].cp1[week]) {
          matrix[monthIdx].cp1[week] = cellText
        }
      }
    })
  }

  matrixData.value = matrix
}

async function loadReportLog() {
  // Fetch service requests for this vehicle in the selected year
  const startDate = `${selectedYear.value}-01-01`
  const endDate   = `${selectedYear.value}-12-31`

  const { data } = await supabase
    .from('vehicle_service_requests')
    .select('date_of_request, reference_no, problem_details, work_details, conducted_by')
    .eq('vehicle_id', selectedVehicle.value)
    .gte('date_of_request', startDate)
    .lte('date_of_request', endDate)
    .order('date_of_request')

  reportLogRows.value = (data || []).map(r => ({
    date: formatDate(r.date_of_request),
    reference_no: r.reference_no || '',
    remarks: r.problem_details || '',
    action_taken: r.work_details || '',
    reported_by: r.conducted_by || '',
  }))
}

// ---- EDIT MODE ----
function enableEdit() {
  editMode.value = true
}

function toggleEdit() {
  editMode.value = !editMode.value
}

// ---- PRINT ----
function printReport() {
  editMode.value = false
  setTimeout(() => window.print(), 100)
}

// ---- LIFECYCLE ----
onMounted(async () => {
  await fetchVehicles()
})
</script>

<style scoped>
/* ============================================================
   SCREEN STYLES
   ============================================================ */
.print-area {
  background: white;
  font-family: Arial, sans-serif;
  font-size: 10px;
}

.pmc-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto 32px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.pmc-title-block {
  text-align: center;
  margin-bottom: 12px;
}

.pmc-title {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
}

.pmc-subtitle,
.pmc-section-title {
  font-size: 11px;
  font-weight: bold;
  margin-top: 2px;
}

.pmc-note-small {
  font-size: 9px;
  font-style: italic;
  margin-top: 4px;
  color: #555;
}

/* Vehicle info table */
.pmc-info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  font-size: 10px;
}
.pmc-info-table td {
  border: 1px solid #333;
  padding: 4px 6px;
}
.info-label {
  font-weight: bold;
  width: 200px;
  background: #f5f5f5;
}
.info-value {
  min-width: 200px;
}

/* Checkpoints legend */
.pmc-checkpoints-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 6px;
  font-size: 9.5px;
}
.pmc-checkpoints-table th {
  background: #333;
  color: white;
  padding: 4px 6px;
  text-align: left;
  border: 1px solid #333;
}
.pmc-checkpoints-table td {
  border: 1px solid #bbb;
  padding: 3px 6px;
}

.pmc-note {
  font-size: 9px;
  font-style: italic;
  color: #555;
  margin-bottom: 6px;
}

/* Main matrix table */
.pmc-matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
  margin-bottom: 16px;
}
.pmc-matrix-table th,
.pmc-matrix-table td {
  border: 1px solid #999;
  text-align: center;
  vertical-align: middle;
}
.pmc-matrix-table th {
  background: #f0f0f0;
  font-weight: bold;
  padding: 4px 2px;
}
.month-col  { width: 72px; }
.week-col   { width: 90px; }
.cp-col     { width: 90px; }
.month-name { font-weight: bold; text-align: left; padding-left: 6px; }
.matrix-cell { height: 36px; padding: 2px; }

/* Report Log table */
.pmc-log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
  margin-bottom: 16px;
}
.pmc-log-table th {
  background: #333;
  color: white;
  padding: 4px 6px;
  border: 1px solid #333;
  text-align: left;
}
.pmc-log-table td {
  border: 1px solid #bbb;
  vertical-align: top;
}
.log-date-col     { width: 60px; }
.log-ref-col      { width: 80px; }
.log-remarks-col  { width: 200px; }
.log-action-col   { width: 200px; }
.log-reported-col { width: 120px; }
.log-cell { padding: 3px 4px; min-height: 22px; }
.blank-row { height: 22px; }

/* Editable field indicator (screen only) */
.editable-field {
  cursor: pointer;
  min-height: 16px;
  display: inline-block;
  width: 100%;
  border-radius: 2px;
  transition: background 0.15s;
}
.editable-field:hover {
  background: rgba(33, 150, 243, 0.08);
  outline: 1px dashed #1976d2;
}

/* Input elements in edit mode */
.edit-input {
  width: 100%;
  border: 1px solid #1976d2;
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 10px;
  font-family: Arial, sans-serif;
  background: #e3f2fd;
  outline: none;
}

.cell-input {
  width: 100%;
  border: 1px solid #1976d2;
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 9px;
  font-family: Arial, sans-serif;
  background: #e3f2fd;
  outline: none;
  resize: none;
}

.cell-text {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Signatory block */
.pmc-signatory-block {
  display: flex;
  justify-content: flex-start;
  margin-top: 16px;
  margin-bottom: 8px;
}
.signatory-item {
  min-width: 280px;
}
.signatory-label {
  font-size: 10px;
  font-weight: bold;
  margin-right: 8px;
}
.signatory-name {
  margin-top: 24px;
  border-top: 1px solid #333;
  font-weight: bold;
  font-size: 10px;
  padding-top: 2px;
  min-width: 240px;
}
.signatory-title {
  font-size: 9.5px;
  color: #333;
  margin-top: 2px;
}

/* Form code */
.form-code {
  display: flex;
  flex-direction: column;
  font-size: 8px;
  color: #666;
  margin-top: 8px;
}

/* ============================================================
   PRINT STYLES
   ============================================================ */
@media print {
  .no-print { display: none !important; }

  body, .v-app, .v-main, .v-container {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .print-area {
    display: block;
  }

  .pmc-page {
    padding: 15mm 15mm 10mm 15mm;
    max-width: 100%;
    margin: 0;
    border: none;
    border-radius: 0;
    page-break-inside: avoid;
  }

  .page-break-after {
    page-break-after: always;
  }

  /* Hide hover/edit styles */
  .editable-field {
    cursor: default;
    background: transparent !important;
    outline: none !important;
  }

  .edit-input, .cell-input {
    border: none;
    background: transparent;
    font-size: 9px;
    width: 100%;
  }

  /* Tighter font for print */
  .pmc-matrix-table,
  .pmc-log-table,
  .pmc-info-table,
  .pmc-checkpoints-table {
    font-size: 8.5px;
  }

  .pmc-title { font-size: 13px; }
  .pmc-subtitle, .pmc-section-title { font-size: 10px; }
}
</style>
