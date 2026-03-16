<template>
  <v-container fluid>
    <v-row class="mb-4 no-print">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">EFHR Report</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Equipment / Facility History Record — F-GEN-EFHR-004
            </p>
          </div>
          <v-btn
            variant="outlined"
            prepend-icon="mdi-printer"
            :disabled="!selectedVehicle"
            @click="printReport"
          >
            Print
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-card rounded="lg" elevation="0" border class="mb-4 no-print">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" sm="4">
            <v-select
              v-model="selectedVehicle"
              :items="vehicles"
              item-title="asset_name"
              item-value="id"
              label="Select Vehicle / Equipment"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:modelValue="onVehicleChange"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="dateFrom"
              label="Date From"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:modelValue="loadData"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="dateTo"
              label="Date To"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:modelValue="loadData"
            />
          </v-col>
          <v-col cols="12" sm="2" class="d-flex align-center">
            <v-progress-circular v-if="loading" indeterminate size="24" width="2" />
            <span v-else-if="repairRows.length" class="text-caption text-medium-emphasis">
              {{ repairRows.length }} record{{ repairRows.length !== 1 ? 's' : '' }}
            </span>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="!selectedVehicle" rounded="lg" elevation="0" border class="no-print">
      <v-card-text class="text-center pa-12">
        <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-history</v-icon>
        <p class="text-h6 text-medium-emphasis">
          Select a vehicle or equipment to generate the EFHR report
        </p>
      </v-card-text>
    </v-card>

    <div v-if="selectedVehicle" class="print-area" id="efhr-report">
      <ReportHeader variant="standard" />

      <div class="efhr-title-block">
        <div class="efhr-form-code-top">
          <span>F-GEN-EFHR-004</span>
          <span>Rev. 2 10/19/2023</span>
        </div>
        <div class="efhr-title">EQUIPMENT / FACILITY HISTORY RECORD</div>
      </div>

      <table class="efhr-header-table">
        <tr>
          <td class="hdr-label">Equipment / Facility Name</td>
          <td class="hdr-value" colspan="3">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.name
            }}</span>
            <input v-else v-model="editableInfo.name" class="edit-input" />
          </td>
        </tr>
        <tr>
          <td class="hdr-label">EQF Code</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.eqfCode
            }}</span>
            <input v-else v-model="editableInfo.eqfCode" class="edit-input" />
          </td>
          <td class="hdr-label">Model</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.model
            }}</span>
            <input v-else v-model="editableInfo.model" class="edit-input" />
          </td>
        </tr>
        <tr>
          <td class="hdr-label">Serial / Plate No.</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.plateNo
            }}</span>
            <input v-else v-model="editableInfo.plateNo" class="edit-input" />
          </td>
          <td class="hdr-label">Date Purchased</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.datePurchased
            }}</span>
            <input v-else v-model="editableInfo.datePurchased" class="edit-input" />
          </td>
        </tr>
        <tr>
          <td class="hdr-label">Supplier</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.supplier
            }}</span>
            <input v-else v-model="editableInfo.supplier" class="edit-input" />
          </td>
          <td class="hdr-label">Custodian</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.custodian
            }}</span>
            <input v-else v-model="editableInfo.custodian" class="edit-input" />
          </td>
        </tr>
        <tr>
          <td class="hdr-label">Department</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.department
            }}</span>
            <input v-else v-model="editableInfo.department" class="edit-input" />
          </td>
          <td class="hdr-label">Contact No.</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.contactNo
            }}</span>
            <input v-else v-model="editableInfo.contactNo" class="edit-input" />
          </td>
        </tr>
        <tr>
          <td class="hdr-label">Other Information</td>
          <td class="hdr-value" colspan="3">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.otherInfo
            }}</span>
            <input v-else v-model="editableInfo.otherInfo" class="edit-input" />
          </td>
        </tr>
      </table>

      <!-- Source legend — screen only -->
      <div class="source-legend no-print">
        <v-chip size="x-small" color="blue-darken-1" variant="tonal" class="mr-1">SR</v-chip>
        <span class="text-caption mr-4">from Service Request</span>
        <v-chip size="x-small" color="green-darken-1" variant="tonal" class="mr-1">PM</v-chip>
        <span class="text-caption">from PM Log</span>
      </div>

      <table class="efhr-table">
        <thead>
          <tr>
            <th class="col-date-start">Date Start</th>
            <th class="col-date-end">Date End</th>
            <th class="col-ref">Reference No.</th>
            <th class="col-repaired">Repaired By</th>
            <th class="col-particulars">Particulars</th>
            <th class="col-expenses">Expenses</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in repairRows" :key="idx">
            <td class="data-cell">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{ row.date_start }}
              </div>
              <input v-else v-model="repairRows[idx].date_start" class="edit-input" />
            </td>
            <td class="data-cell">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{ row.date_end }}
              </div>
              <input v-else v-model="repairRows[idx].date_end" class="edit-input" />
            </td>
            <td class="data-cell">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{ row.reference_no }}
              </div>
              <input v-else v-model="repairRows[idx].reference_no" class="edit-input" />
            </td>
            <td class="data-cell">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{ row.repaired_by }}
              </div>
              <input v-else v-model="repairRows[idx].repaired_by" class="edit-input" />
            </td>
            <td class="data-cell">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{ row.particulars }}
              </div>
              <textarea
                v-else
                v-model="repairRows[idx].particulars"
                class="cell-textarea"
                rows="3"
              />
            </td>
            <td class="data-cell text-right">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{
                  row.expenses !== '' && row.expenses !== null ? formatCurrency(row.expenses) : ''
                }}
              </div>
              <input
                v-else
                v-model="repairRows[idx].expenses"
                class="edit-input text-right"
                type="number"
              />
            </td>
          </tr>
          <tr v-for="n in Math.max(0, 5 - repairRows.length)" :key="'blank' + n">
            <td class="data-cell blank-row">&nbsp;</td>
            <td class="data-cell blank-row"></td>
            <td class="data-cell blank-row"></td>
            <td class="data-cell blank-row"></td>
            <td class="data-cell blank-row"></td>
            <td class="data-cell blank-row"></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" class="total-label">Total Expenses</td>
            <td class="total-value">
              <div v-if="!editMode" class="editable-field" @click="enableEdit">
                {{ formatCurrency(totalExpenses) }}
              </div>
              <input v-else v-model="manualTotal" class="edit-input text-right" type="number" />
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="efhr-signatories">
        <div class="signatory-col">
          <div class="sig-label">Prepared by:</div>
          <div class="sig-name">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.preparedByName
            }}</span>
            <input v-else v-model="editableInfo.preparedByName" class="edit-input" />
          </div>
          <div class="sig-title">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.preparedByTitle
            }}</span>
            <input v-else v-model="editableInfo.preparedByTitle" class="edit-input" />
          </div>
        </div>
        <div class="signatory-col">
          <div class="sig-label">Noted by:</div>
          <div class="sig-name">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.notedByName
            }}</span>
            <input v-else v-model="editableInfo.notedByName" class="edit-input" />
          </div>
          <div class="sig-title">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
              editableInfo.notedByTitle
            }}</span>
            <input v-else v-model="editableInfo.notedByTitle" class="edit-input" />
          </div>
        </div>
      </div>
    </div>

    <v-btn
      v-if="selectedVehicle"
      class="no-print"
      :color="editMode ? 'success' : 'primary'"
      :variant="editMode ? 'flat' : 'outlined'"
      :prepend-icon="editMode ? 'mdi-check' : 'mdi-pencil'"
      style="position: fixed; bottom: 32px; right: 32px; z-index: 999"
      @click="toggleEdit"
    >
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

const vehicles = ref([])
const selectedVehicle = ref(null)
const dateFrom = ref('')
const dateTo = ref('')
const loading = ref(false)
const editMode = ref(false)
const repairRows = ref([])

const editableInfo = ref({
  name: '',
  eqfCode: '',
  model: '',
  plateNo: '',
  datePurchased: '',
  supplier: '',
  custodian: '',
  department: 'General Services Office',
  contactNo: '',
  otherInfo: '',
  preparedByName: 'ENGR. ENA TIU-IBARRA',
  preparedByTitle: 'Engineer 1, General Services',
  notedByName: 'AR. CHRISTIAN DWIGHT C. DOLOTINA',
  notedByTitle: 'Director, General Services',
})

const manualTotal = ref(null)
const totalExpenses = computed(() =>
  manualTotal.value !== null
    ? Number(manualTotal.value)
    : repairRows.value.reduce((sum, r) => sum + (Number(r.expenses) || 0), 0),
)

// ✅ KEY HELPER: always compare IDs as strings — DB returns bigint as JS number,
//    route.query returns strings. Using String() on both sides prevents mismatches.
function sid(val) {
  return val !== null && val !== undefined ? String(val) : null
}

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  const yy = String(dt.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

function formatCurrency(val) {
  if (val === '' || val === null || val === undefined) return '₱0.00'
  return '₱' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

async function fetchVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, asset_name, asset_type, eqf_code, model, plate_number')
    .eq('status', 'Active')
    .order('asset_name')
  if (error) {
    console.error('fetchVehicles:', error)
    return
  }
  // ✅ FIX: normalise all ids to strings at fetch time
  vehicles.value = (data || []).map((v) => ({ ...v, id: sid(v.id) }))
}

function fillHeaderFromVehicle(vehicleId) {
  // ✅ FIX: both sides are strings after normalisation above
  const v = vehicles.value.find((x) => sid(x.id) === sid(vehicleId))
  if (!v) {
    console.warn(
      'fillHeaderFromVehicle: no match for vehicleId =',
      vehicleId,
      '| available ids:',
      vehicles.value.map((x) => x.id),
    )
    return
  }
  editableInfo.value.name = v.asset_name || ''
  editableInfo.value.eqfCode = v.eqf_code || ''
  editableInfo.value.model = v.model || ''
  editableInfo.value.plateNo = v.plate_number || ''
}

function onVehicleChange(vehicleId) {
  if (!vehicleId) {
    repairRows.value = []
    return
  }
  fillHeaderFromVehicle(vehicleId)
  loadData()
}

async function loadData() {
  if (!selectedVehicle.value) return
  loading.value = true
  editMode.value = false

  const vid = sid(selectedVehicle.value)
  const from = dateFrom.value || null
  const to = dateTo.value || null

  // ── Service Requests ──
  let srQ = supabase
    .from('vehicle_service_requests')
    .select('request_no, date_of_request, conducted_by, problem_details, work_details, cost')
    .eq('vehicle_id', vid)
    .order('date_of_request')
  if (from) srQ = srQ.gte('date_of_request', from)
  if (to) srQ = srQ.lte('date_of_request', to)

  // ── PM Log ──
  let pmQ = supabase
    .from('vehicle_pm_log')
    .select('id, service_type, date_performed, date_accomplished, conducted_by, cost, remarks')
    .eq('vehicle_id', vid)
    .order('date_performed')
  if (from) pmQ = pmQ.gte('date_performed', from)
  if (to) pmQ = pmQ.lte('date_performed', to)

  const [srRes, pmRes] = await Promise.all([srQ, pmQ])

  if (srRes.error) console.error('EFHR SR error:', srRes.error.message, '| vid:', vid)
  if (pmRes.error) console.error('EFHR PM error:', pmRes.error.message, '| vid:', vid)

  // Map Service Requests → EFHR rows
  const srRows = (srRes.data || []).map((r) => ({
    _sort: r.date_of_request || '',
    date_start: formatDate(r.date_of_request),
    date_end: '', // no end date on service requests
    reference_no: r.request_no || '', // ← Reference No = SR Number (user requirement)
    repaired_by: r.conducted_by || '',
    // Particulars = Diagnosis (problem_details) + Action Taken (work_details) per user requirement
    particulars: r.work_details || '',
    expenses: r.cost ?? '',
  }))

  // Map PM Log → EFHR rows
  const pmRows = (pmRes.data || []).map((r) => ({
    _sort: r.date_performed || '',
    date_start: formatDate(r.date_performed),
    date_end: formatDate(r.date_accomplished),
    reference_no: `PM-${r.id}`,
    repaired_by: r.conducted_by || '',
    particulars: [r.service_type, r.remarks].filter(Boolean).join('\n'),
    expenses: r.cost ?? '',
  }))

  // Merge and sort chronologically
  repairRows.value = [...srRows, ...pmRows].sort((a, b) =>
    a._sort < b._sort ? -1 : a._sort > b._sort ? 1 : 0,
  )

  manualTotal.value = null // reset manual total on each data reload
  loading.value = false
}

function enableEdit() {
  editMode.value = true
}
function toggleEdit() {
  editMode.value = !editMode.value
}

function printReport() {
  editMode.value = false
  setTimeout(() => window.print(), 100)
}

onMounted(async () => {
  await fetchVehicles()

  if (route.query.vehicleId) {
    selectedVehicle.value = sid(route.query.vehicleId)
    fillHeaderFromVehicle(selectedVehicle.value)
    loadData()
  }
})
</script>

<style scoped>
.print-area {
  background: white;
  font-family: Arial, sans-serif;
  font-size: 10px;
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
.efhr-title-block {
  text-align: center;
  margin-bottom: 10px;
}
.efhr-form-code-top {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: #666;
  margin-bottom: 4px;
}
@media print {
  .efhr-form-code-top {
    display: none !important;
  }
}
.efhr-title {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 10px;
}
.efhr-header-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
  font-size: 10px;
}
.efhr-header-table td {
  border: 1px solid #555;
  padding: 4px 6px;
}
.hdr-label {
  font-weight: bold;
  background: #f5f5f5;
  width: 160px;
  white-space: nowrap;
}
.hdr-value {
  min-width: 160px;
}
.source-legend {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}
.efhr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  margin-bottom: 20px;
}
.efhr-table th {
  background: #333;
  color: white;
  padding: 5px 6px;
  border: 1px solid #333;
  text-align: left;
  font-size: 9.5px;
}
.efhr-table td {
  border: 1px solid #999;
  vertical-align: top;
}
.col-date-start {
  width: 72px;
}
.col-date-end {
  width: 72px;
}
.col-ref {
  width: 90px;
}
.col-repaired {
  width: 120px;
}
.col-expenses {
  width: 90px;
  text-align: right;
}
.data-cell {
  padding: 4px 5px;
  min-height: 28px;
}
.blank-row {
  height: 28px;
}
.text-right {
  text-align: right;
}
tfoot td {
  border: 1px solid #555;
  padding: 5px 6px;
}
.total-label {
  text-align: right;
  font-weight: bold;
  background: #f5f5f5;
  font-size: 10px;
}
.total-value {
  text-align: right;
  font-weight: bold;
  font-size: 10px;
  width: 90px;
}
.editable-field {
  cursor: pointer;
  display: inline-block;
  width: 100%;
  min-height: 16px;
  border-radius: 2px;
  transition: background 0.15s;
}
.editable-field:hover {
  background: rgba(33, 150, 243, 0.08);
  outline: 1px dashed #1976d2;
}
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
.cell-textarea {
  width: 100%;
  border: 1px solid #1976d2;
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 9.5px;
  font-family: Arial, sans-serif;
  background: #e3f2fd;
  outline: none;
  resize: none;
}
.cell-text {
  white-space: pre-wrap;
  word-break: break-word;
}
.efhr-signatories {
  display: flex;
  gap: 80px;
  margin-top: 20px;
}
.signatory-col {
  min-width: 220px;
}
.sig-label {
  font-size: 10px;
  font-weight: bold;
  margin-bottom: 20px;
}
.sig-name {
  border-top: 1px solid #333;
  font-weight: bold;
  font-size: 10px;
  padding-top: 2px;
}
.sig-title {
  font-size: 9.5px;
  color: #333;
  margin-top: 2px;
}

@page {
  margin: 10mm 12mm;
  size: A4;
}
@media print {
  @page {
    margin: 10mm 12mm;
  }
  .no-print {
    display: none !important;
  }
  body,
  .v-app,
  .v-main,
  .v-container {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .print-area {
    max-width: 100%;
    padding: 12mm 15mm;
    border: none;
    border-radius: 0;
    margin: 0;
  }
  .editable-field {
    cursor: default;
    background: transparent !important;
    outline: none !important;
  }
  .edit-input,
  .cell-textarea {
    border: none;
    background: transparent;
    font-size: 9.5px;
    width: 100%;
    padding: 0;
  }
  .efhr-table,
  .efhr-header-table {
    font-size: 9px;
  }
  .efhr-title {
    font-size: 13px;
  }
}
</style>
