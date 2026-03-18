<template>
  <v-container fluid>
    <v-row class="mb-4 no-print">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">Preventive Maintenance Checklist</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">Generate printable PMC report per vehicle per year</p>
          </div>
          <v-btn variant="outlined" prepend-icon="mdi-printer" @click="printReport" :disabled="!selectedVehicle">
            Print
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-card rounded="lg" elevation="0" border class="mb-4 no-print">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" sm="4">
            <!--
              item-value="id" — Vuetify will store whatever type "id" is.
              We normalise IDs to strings at fetch time so this is always a string.
            -->
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
            <v-select v-model="selectedYear" :items="yearOptions" label="Year"
              variant="outlined" density="comfortable" hide-details
              @update:modelValue="loadData" />
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

    <v-card v-if="!selectedVehicle" rounded="lg" elevation="0" border class="no-print">
      <v-card-text class="text-center pa-12">
        <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-clipboard-text-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">Select a vehicle and year to generate the PMC report</p>
      </v-card-text>
    </v-card>

    <div v-if="selectedVehicle" class="print-area" id="pmc-report">

      <!-- PAGE 1 -->
      <div class="pmc-page page-break-after">
        <ReportHeader variant="standard" />

        <div class="pmc-title-block">
          <div class="pmc-title">PREVENTIVE MAINTENANCE CHECKLIST</div>
          <div class="pmc-subtitle">For the year {{ selectedYear }}</div>
        </div>

        <table class="pmc-info-table">
          <tr>
            <td class="info-label">Equipment/Facility Name</td>
            <td class="info-value">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{ editableInfo.name }}</span>
              <input v-else v-model="editableInfo.name" class="edit-input" />
            </td>
          </tr>
          <tr>
            <td class="info-label">EQF CODE</td>
            <td class="info-value">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{ editableInfo.eqfCode }}</span>
              <input v-else v-model="editableInfo.eqfCode" class="edit-input" />
            </td>
          </tr>
          <tr>
            <td class="info-label">Location</td>
            <td class="info-value">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{ editableInfo.location }}</span>
              <input v-else v-model="editableInfo.location" class="edit-input" />
            </td>
          </tr>
        </table>

        <!-- Maintenance Objectives -->
        <div class="pmc-objectives">
          <div v-for="(group, gIdx) in objectives" :key="gIdx" class="objective-group">
            <div class="objective-title">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{ group.title }}</span>
              <input v-else v-model="objectives[gIdx].title" class="edit-input obj-title-input" />
            </div>
            <ul class="objective-list">
              <li v-for="(item, iIdx) in group.items" :key="iIdx">
                <span v-if="!editMode" class="editable-field" @click="enableEdit">{{ item }}</span>
                <input v-else v-model="objectives[gIdx].items[iIdx]" class="edit-input" />
              </li>
            </ul>
          </div>
        </div>

        <!-- WHY: Table removed from Page 1 per requirements.
             The printable table is in Page 2 (Report Log) only. -->

        <div class="pmc-signatory-block">
          <div class="signatory-item">
            <span class="signatory-label">Reviewed by:</span>
            <div class="signatory-name">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{ editableInfo.reviewedByName }}</span>
              <input v-else v-model="editableInfo.reviewedByName" class="edit-input" />
            </div>
            <div class="signatory-title">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{ editableInfo.reviewedByTitle }}</span>
              <input v-else v-model="editableInfo.reviewedByTitle" class="edit-input" />
            </div>
          </div>
        </div>
        <div class="form-code"><span>F-GEN-PMC-003a</span><span>Rev. 3 10/19/2023</span></div>
      </div>

      <!-- PAGE 2: REPORT LOG -->
      <div class="pmc-page">
        <ReportHeader variant="standard" />

        <div class="pmc-title-block">
          <div class="pmc-title">PREVENTIVE MAINTENANCE CHECKLIST</div>
          <div class="pmc-section-title">REPORT LOG</div>
          <div class="pmc-note-small">*Log problem(s) encountered during conduct of Preventive Maintenance.</div>
        </div>

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
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">{{ row.date }}</div>
                <input v-else v-model="reportLogRows[idx].date" class="edit-input" />
              </td>
              <td class="log-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">{{ row.reference_no }}</div>
                <input v-else v-model="reportLogRows[idx].reference_no" class="edit-input" />
              </td>
              <td class="log-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">{{ row.remarks }}</div>
                <textarea v-else v-model="reportLogRows[idx].remarks" class="cell-input" rows="2" />
              </td>
              <td class="log-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">{{ row.action_taken }}</div>
                <textarea v-else v-model="reportLogRows[idx].action_taken" class="cell-input" rows="2" />
              </td>
              <td class="log-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">{{ row.reported_by }}</div>
                <input v-else v-model="reportLogRows[idx].reported_by" class="edit-input" />
              </td>
            </tr>
            <tr v-for="n in Math.max(0, 20 - reportLogRows.length)" :key="'bl'+n">
              <td class="log-cell blank-row">&nbsp;</td>
              <td class="log-cell blank-row"></td>
              <td class="log-cell blank-row"></td>
              <td class="log-cell blank-row"></td>
              <td class="log-cell blank-row"></td>
            </tr>
          </tbody>
        </table>

        <div class="pmc-signatory-block">
          <div class="signatory-item">
            <span class="signatory-label">Reviewed by:</span>
            <div class="signatory-name">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{ editableInfo.reviewedByName }}</span>
              <input v-else v-model="editableInfo.reviewedByName" class="edit-input" />
            </div>
            <div class="signatory-title">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{ editableInfo.reviewedByTitle }}</span>
              <input v-else v-model="editableInfo.reviewedByTitle" class="edit-input" />
            </div>
          </div>
        </div>
        <div class="form-code"><span>F-GEN-PMC-003a</span><span>Rev. 3 10/19/2023</span></div>
      </div>

    </div>

    <v-btn v-if="selectedVehicle" class="no-print"
      :color="editMode ? 'success' : 'primary'" :variant="editMode ? 'flat' : 'outlined'"
      :prepend-icon="editMode ? 'mdi-check' : 'mdi-pencil'"
      style="position:fixed;bottom:32px;right:32px;z-index:999;" @click="toggleEdit">
      {{ editMode ? 'Done Editing' : 'Edit Fields' }}
    </v-btn>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'
import ReportHeader from '../components/ReportHeader.vue'

const route = useRoute()

const vehicles        = ref([])
const selectedVehicle = ref(null)
const selectedYear    = ref(new Date().getFullYear())
const loading         = ref(false)
const editMode        = ref(false)

const editableInfo = ref({
  name:            '',
  eqfCode:         '',
  location:        'CARAGA STATE UNIVERSITY, MAIN CAMPUS',
  reviewedByName:  'ENGR. ENA TIU-IBARRA',
  reviewedByTitle: 'AO III, General Services',
})

const objectives = ref([
  {
    title: 'Ensure Vehicle Safety',
    items: [
      'Prevent failures that could result in accidents or hazardous conditions.',
      'Maintain critical systems such as brakes, tires, steering, and lights in optimal working order.',
      'Comply with road safety regulations and inspection standards.',
    ],
  },
  {
    title: 'Enhance Vehicle Reliability and Performance',
    items: [
      'Reduce the risk of unexpected breakdowns or stalls.',
      'Ensure the vehicle operates efficiently and starts reliably.',
      'Maintain optimal engine, transmission, and suspension performance.',
    ],
  },
  {
    title: 'Minimize Operating Costs',
    items: [
      'Avoid costly emergency repairs by addressing issues early.',
      'Improve fuel efficiency through regular maintenance (e.g., oil changes and air filter replacement).',
      'Reduce downtime that could affect productivity or transport schedules.',
    ],
  },
])

const yearOptions = computed(() => {
  const cur = new Date().getFullYear()
  return [cur - 2, cur - 1, cur, cur + 1].reverse()
})

const pmRows        = ref([])
const reportLogRows = ref([])

// ✅ FIX: compare as strings on both sides so numeric DB ids match string route params
const selectedVehicleObj = computed(() =>
  vehicles.value.find(v => String(v.id) === String(selectedVehicle.value))
)

function sid(val) { return val !== null && val !== undefined ? String(val) : null }

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  const yy = String(dt.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

async function fetchVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, asset_name, eqf_code, asset_type, plate_number')
    .eq('asset_type', 'Vehicle')
    .eq('status', 'Active')
    .order('asset_name')
  if (error) { console.error('fetchVehicles:', error); return }
  // ✅ FIX: normalise every id to string so === comparisons always work
  vehicles.value = (data || []).map(v => ({ ...v, id: sid(v.id) }))
}

function fillHeaderFromVehicle(vehicleId) {
  // ✅ FIX: compare as strings — DB id is number, route param is string
  const v = vehicles.value.find(x => sid(x.id) === sid(vehicleId))
  if (!v) return
  const platePart = v.plate_number ? ` (${v.plate_number})` : ''
  editableInfo.value.name    = `${v.asset_name}${platePart}`
  editableInfo.value.eqfCode = v.eqf_code || ''
}

function onVehicleChange(vehicleId) {
  if (!vehicleId) { pmRows.value = []; reportLogRows.value = []; return }
  fillHeaderFromVehicle(vehicleId)
  loadData()
}

async function loadData() {
  if (!selectedVehicle.value) return
  loading.value = true
  editMode.value = false
  await Promise.all([loadPMRows(), loadReportLog()])
  loading.value = false
}

async function loadPMRows() {
  const { data, error } = await supabase
    .from('vehicle_pm_log')
    .select('service_type, date_performed, next_due_date, conducted_by, status, remarks')
    .eq('vehicle_id', sid(selectedVehicle.value))
    .gte('date_performed', `${selectedYear.value}-01-01`)
    .lte('date_performed', `${selectedYear.value}-12-31`)
    .order('date_performed')
  if (error) { console.error('loadPMRows:', error.message); pmRows.value = []; return }
  pmRows.value = (data || []).map(r => ({
    service_type:   r.service_type  || '',
    date_performed: formatDate(r.date_performed),
    next_due_date:  formatDate(r.next_due_date),
    conducted_by:   r.conducted_by  || '',
    status:         r.status        || '',
    remarks:        r.remarks       || '',
  }))
}

async function loadReportLog() {
  const { data, error } = await supabase
    .from('vehicle_service_requests')
    .select('date_of_request, request_no, problem_details, work_details, conducted_by')
    .eq('vehicle_id', sid(selectedVehicle.value))
    .gte('date_of_request', `${selectedYear.value}-01-01`)
    .lte('date_of_request', `${selectedYear.value}-12-31`)
    .order('date_of_request')
  if (error) { console.error('loadReportLog:', error.message); reportLogRows.value = []; return }
  reportLogRows.value = (data || []).map(r => ({
    date:         formatDate(r.date_of_request),
    reference_no: r.request_no      || '',
    remarks:      r.problem_details || '',
    action_taken: r.work_details    || '',
    reported_by:  r.conducted_by    || '',
  }))
}

function enableEdit() { editMode.value = true }
function toggleEdit() { editMode.value = !editMode.value }

function printReport() {
  editMode.value = false
  setTimeout(() => window.print(), 100)
}

onMounted(async () => {
  await fetchVehicles()

  if (route.query.vehicleId) {
    // Store as string — vehicles array already has string ids after normalisation
    selectedVehicle.value = sid(route.query.vehicleId)
    // fillHeaderFromVehicle works because both sides are now strings
    fillHeaderFromVehicle(selectedVehicle.value)
    loadData()
  }

  if (route.query.year) {
    const yr = parseInt(route.query.year, 10)
    if (!isNaN(yr)) selectedYear.value = yr
  }
})
</script>

<style scoped>
.print-area { background: white; font-family: Arial, sans-serif; font-size: 10px; }
.pmc-page { padding: 20px; max-width: 900px; margin: 0 auto 32px; background: white; border: 1px solid #e0e0e0; border-radius: 8px; }
.pmc-title-block { text-align: center; margin-bottom: 12px; }
.pmc-title { font-size: 14px; font-weight: bold; letter-spacing: 1px; }
.pmc-subtitle, .pmc-section-title { font-size: 11px; font-weight: bold; margin-top: 2px; }
.pmc-note-small { font-size: 9px; font-style: italic; margin-top: 4px; color: #555; }
.pmc-info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10px; }
.pmc-info-table td { border: 1px solid #333; padding: 4px 6px; }
.info-label { font-weight: bold; width: 200px; background: #f5f5f5; }
.pmc-objectives { border: 1px solid #bbb; border-radius: 4px; padding: 10px 14px; margin-bottom: 10px; background: #fafafa; font-size: 9.5px; }
.objective-group { margin-bottom: 8px; }
.objective-group:last-child { margin-bottom: 0; }
.objective-title { font-weight: bold; font-size: 10px; margin-bottom: 3px; }
.objective-list { margin: 0; padding-left: 18px; line-height: 1.6; }
.objective-list li { margin-bottom: 1px; }
.obj-title-input { font-weight: bold; }
.pmc-note { font-size: 9px; font-style: italic; color: #555; margin-bottom: 6px; }
.pmc-checklist-table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 16px; }
.pmc-checklist-table th { background: #333; color: white; padding: 4px 5px; border: 1px solid #333; text-align: left; font-size: 8.5px; }
.pmc-checklist-table td { border: 1px solid #999; vertical-align: top; }
.col-no { width: 28px; }
.col-stype { width: 170px; }
.col-dperf { width: 70px; }
.col-ddue { width: 70px; }
.col-conducted { width: 110px; }
.col-status { width: 70px; }
.pmc-log-table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 16px; }
.pmc-log-table th { background: #333; color: white; padding: 4px 6px; border: 1px solid #333; text-align: left; }
.pmc-log-table td { border: 1px solid #bbb; vertical-align: top; }
.log-date-col { width: 60px; }
.log-ref-col { width: 80px; }
.log-remarks-col { width: 200px; }
.log-action-col { width: 200px; }
.log-reported-col { width: 120px; }
.log-cell { padding: 3px 4px; min-height: 22px; }
.data-cell { padding: 4px 5px; min-height: 24px; }
.blank-row { height: 24px; }
.text-center { text-align: center; }
.editable-field { cursor: pointer; min-height: 14px; display: inline-block; width: 100%; border-radius: 2px; transition: background 0.15s; }
.editable-field:hover { background: rgba(33,150,243,0.08); outline: 1px dashed #1976d2; }
.edit-input { width: 100%; border: 1px solid #1976d2; border-radius: 3px; padding: 2px 4px; font-size: 9.5px; font-family: Arial, sans-serif; background: #e3f2fd; outline: none; }
.cell-input { width: 100%; border: 1px solid #1976d2; border-radius: 3px; padding: 2px 4px; font-size: 9px; font-family: Arial, sans-serif; background: #e3f2fd; outline: none; resize: none; }
.cell-text { white-space: pre-wrap; word-break: break-word; }
.pmc-signatory-block { display: flex; justify-content: flex-start; margin-top: 16px; margin-bottom: 8px; }
.signatory-item { min-width: 280px; }
.signatory-label { font-size: 10px; font-weight: bold; margin-right: 8px; }
.signatory-name { margin-top: 24px; border-top: 1px solid #333; font-weight: bold; font-size: 10px; padding-top: 2px; min-width: 240px; }
.signatory-title { font-size: 9.5px; color: #333; margin-top: 2px; }
.form-code { display: flex; flex-direction: column; font-size: 8px; color: #666; margin-top: 8px; }

@media print {
  .no-print { display: none !important; }
  body, .v-app, .v-main, .v-container { background: white !important; padding: 0 !important; margin: 0 !important; }
  .pmc-page { padding: 12mm 15mm 10mm 15mm; max-width: 100%; margin: 0; border: none; border-radius: 0; }
  .page-break-after { page-break-after: always; }
  .editable-field { cursor: default; background: transparent !important; outline: none !important; }
  .edit-input, .cell-input { border: none; background: transparent; font-size: 9px; width: 100%; }
  .pmc-checklist-table, .pmc-log-table, .pmc-info-table { font-size: 8.5px; }
  .pmc-objectives { font-size: 8.5px; background: white; border-color: #ccc; }
  .pmc-title { font-size: 13px; }
}
</style>
