<template>
  <v-container fluid>

    <!-- ── Screen Controls (hidden on print) ── -->
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

    <!-- Controls Card -->
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

    <!-- Empty state -->
    <v-card v-if="!selectedVehicle" rounded="lg" elevation="0" border class="no-print">
      <v-card-text class="text-center pa-12">
        <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-history</v-icon>
        <p class="text-h6 text-medium-emphasis">
          Select a vehicle or equipment to generate the EFHR report
        </p>
      </v-card-text>
    </v-card>

    <!-- ══════════════════════════════════════════
         PRINTABLE REPORT
    ══════════════════════════════════════════ -->
    <div v-if="selectedVehicle" class="print-area" id="efhr-report">

      <!-- Official CSU Header -->
      <ReportHeader variant="standard" />

      <!-- ── Title Block ── -->
      <div class="efhr-title-block">
        <div class="efhr-form-code-top">
          <span>F-GEN-EFHR-004</span>
          <span>Rev. 2 10/19/2023</span>
        </div>
        <div class="efhr-title">EQUIPMENT / FACILITY HISTORY RECORD</div>
      </div>

      <!-- ── Header Info Table ── -->
      <table class="efhr-header-table">
        <tr>
          <td class="hdr-label">Equipment / Facility Name</td>
          <td class="hdr-value" colspan="3">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.name }}
            </span>
            <input v-else v-model="editableInfo.name" class="edit-input" />
          </td>
        </tr>
        <tr>
          <td class="hdr-label">EQF Code</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.eqfCode }}
            </span>
            <input v-else v-model="editableInfo.eqfCode" class="edit-input" />
          </td>
          <td class="hdr-label">Model</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.model }}
            </span>
            <input v-else v-model="editableInfo.model" class="edit-input" />
          </td>
        </tr>
        <tr>
          <td class="hdr-label">Serial / Plate No.</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.plateNo }}
            </span>
            <input v-else v-model="editableInfo.plateNo" class="edit-input" />
          </td>
          <td class="hdr-label">Date Purchased</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.datePurchased }}
            </span>
            <input v-else v-model="editableInfo.datePurchased" class="edit-input" />
          </td>
        </tr>
        <tr>
          <td class="hdr-label">Supplier</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.supplier }}
            </span>
            <input v-else v-model="editableInfo.supplier" class="edit-input" />
          </td>
          <td class="hdr-label">Custodian</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.custodian }}
            </span>
            <input v-else v-model="editableInfo.custodian" class="edit-input" />
          </td>
        </tr>
        <tr>
          <td class="hdr-label">Department</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.department }}
            </span>
            <input v-else v-model="editableInfo.department" class="edit-input" />
          </td>
          <td class="hdr-label">Contact No.</td>
          <td class="hdr-value">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.contactNo }}
            </span>
            <input v-else v-model="editableInfo.contactNo" class="edit-input" />
          </td>
        </tr>
        <tr>
          <td class="hdr-label">Other Information</td>
          <td class="hdr-value" colspan="3">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.otherInfo }}
            </span>
            <input v-else v-model="editableInfo.otherInfo" class="edit-input" />
          </td>
        </tr>
      </table>

      <!-- ── Repair Record Table ── -->
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
            <!-- Date Start -->
            <td class="data-cell">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{ row.date_start }}
              </div>
              <input v-else v-model="row.date_start" class="edit-input" />
            </td>
            <!-- Date End -->
            <td class="data-cell">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{ row.date_end }}
              </div>
              <input v-else v-model="row.date_end" class="edit-input" />
            </td>
            <!-- Reference No -->
            <td class="data-cell">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{ row.reference_no }}
              </div>
              <input v-else v-model="row.reference_no" class="edit-input" />
            </td>
            <!-- Repaired By -->
            <td class="data-cell">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{ row.repaired_by }}
              </div>
              <input v-else v-model="row.repaired_by" class="edit-input" />
            </td>
            <!-- Particulars -->
            <td class="data-cell">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{ row.particulars }}
              </div>
              <textarea v-else v-model="row.particulars" class="cell-textarea" rows="3" />
            </td>
            <!-- Expenses -->
            <td class="data-cell text-right">
              <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                {{ row.expenses ? formatCurrency(row.expenses) : '' }}
              </div>
              <input v-else v-model="row.expenses" class="edit-input text-right" type="number" />
            </td>
          </tr>

          <!-- Blank filler rows (minimum 5 rows always shown) -->
          <tr v-for="n in Math.max(0, 5 - repairRows.length)" :key="'blank' + n">
            <td class="data-cell blank-row">&nbsp;</td>
            <td class="data-cell blank-row"></td>
            <td class="data-cell blank-row"></td>
            <td class="data-cell blank-row"></td>
            <td class="data-cell blank-row"></td>
            <td class="data-cell blank-row"></td>
          </tr>
        </tbody>

        <!-- Total Footer -->
        <tfoot>
          <tr>
            <td colspan="5" class="total-label">Total Expenses</td>
            <td class="total-value">{{ formatCurrency(totalExpenses) }}</td>
          </tr>
        </tfoot>
      </table>

      <!-- ── Signatories ── -->
      <div class="efhr-signatories">
        <div class="signatory-col">
          <div class="sig-label">Prepared by:</div>
          <div class="sig-name">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.preparedByName }}
            </span>
            <input v-else v-model="editableInfo.preparedByName" class="edit-input" />
          </div>
          <div class="sig-title">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.preparedByTitle }}
            </span>
            <input v-else v-model="editableInfo.preparedByTitle" class="edit-input" />
          </div>
        </div>
        <div class="signatory-col">
          <div class="sig-label">Noted by:</div>
          <div class="sig-name">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.notedByName }}
            </span>
            <input v-else v-model="editableInfo.notedByName" class="edit-input" />
          </div>
          <div class="sig-title">
            <span v-if="!editMode" class="editable-field" @click="enableEdit">
              {{ editableInfo.notedByTitle }}
            </span>
            <input v-else v-model="editableInfo.notedByTitle" class="edit-input" />
          </div>
        </div>
      </div>

    </div>
    <!-- end print-area -->

    <!-- Floating Edit Toggle -->
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

// ── State ──
const vehicles    = ref([])
const selectedVehicle = ref(null)
const dateFrom    = ref('')
const dateTo      = ref('')
const loading     = ref(false)
const editMode    = ref(false)
const repairRows  = ref([])

// ── Editable header info (pre-filled from DB, all editable before print) ──
const editableInfo = ref({
  name:             '',
  eqfCode:          '',
  model:            '',
  plateNo:          '',
  datePurchased:    '',
  supplier:         '',
  custodian:        '',
  department:       'General Services Office',
  contactNo:        '',
  otherInfo:        '',
  preparedByName:   'ENGR. ENA TIU-IBARRA',
  preparedByTitle:  'Engineer 1, General Services',
  notedByName:      'AR. CHRISTIAN DWIGHT C. DOLOTINA',
  notedByTitle:     'Director, General Services',
})

// ── Computed ──


const totalExpenses = computed(() =>
  repairRows.value.reduce((sum, r) => sum + (Number(r.expenses) || 0), 0)
)

// ── Helpers ──
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

function formatCurrency(val) {
  if (!val && val !== 0) return ''
  return '₱' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

// ── Data fetching ──
async function fetchVehicles() {
  const { data } = await supabase
    .from('vehicles')
    .select('id, asset_name, asset_type, eqf_code, model, plate_number')
    .eq('status', 'Active')
    .order('asset_name')
  vehicles.value = data || []
}

function onVehicleChange(vehicleId) {
  if (!vehicleId) {
    repairRows.value = []
    return
  }
  const v = vehicles.value.find(x => x.id === vehicleId)
  if (v) {
    editableInfo.value.name    = v.asset_name || ''
    editableInfo.value.eqfCode = v.eqf_code   || ''
    editableInfo.value.model   = v.model       || ''
    editableInfo.value.plateNo = v.plate_number || ''
  }
  loadData()
}

async function loadData() {
  if (!selectedVehicle.value) return
  loading.value = true
  editMode.value = false

  let query = supabase
    .from('vehicle_service_requests')
    .select('request_no, date_of_request, date_completed, conducted_by, problem_details, work_details, cost')
    .eq('vehicle_id', selectedVehicle.value)
    .order('date_of_request')

  if (dateFrom.value) query = query.gte('date_of_request', dateFrom.value)
  if (dateTo.value)   query = query.lte('date_of_request', dateTo.value)

  const { data, error } = await query

  if (!error && data) {
    repairRows.value = data.map(r => ({
      date_start:   formatDate(r.date_of_request),
      date_end:     formatDate(r.date_completed),
      reference_no: r.request_no    || '',
      repaired_by:  r.conducted_by  || '',
      // Combine problem + action into Particulars
      particulars:  [r.problem_details, r.work_details]
                      .filter(Boolean)
                      .join('\n'),
      expenses:     r.cost || '',
    }))
  }

  loading.value = false
}

// ── Edit mode ──
function enableEdit()  { editMode.value = true  }
function toggleEdit()  { editMode.value = !editMode.value }

// ── Print ──
function printReport() {
  editMode.value = false
  setTimeout(() => window.print(), 100)
}

// ── Lifecycle ──
onMounted(async () => {
  await fetchVehicles()

  // Auto-select if navigated from Service Requests with ?vehicleId=
  if (route.query.vehicleId) {
  selectedVehicle.value = route.query.vehicleId
    onVehicleChange(selectedVehicle.value)
  }
})
</script>

<style scoped>
/* ── Screen wrapper ── */
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

/* ── Title block ── */
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
.efhr-title {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

/* ── Header info table ── */
.efhr-header-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
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

/* ── Repair record table ── */
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

.col-date-start  { width: 72px; }
.col-date-end    { width: 72px; }
.col-ref         { width: 90px; }
.col-repaired    { width: 120px; }
.col-particulars { }          /* takes remaining space */
.col-expenses    { width: 90px; text-align: right; }

.data-cell {
  padding: 4px 5px;
  min-height: 28px;
}
.blank-row { height: 28px; }
.text-right { text-align: right; }

/* Total footer */
tfoot td { border: 1px solid #555; padding: 5px 6px; }
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

/* ── Editable field hints (screen only) ── */
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

/* ── Signatories ── */
.efhr-signatories {
  display: flex;
  gap: 80px;
  margin-top: 20px;
}
.signatory-col { min-width: 220px; }
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

/* ══════════════════════════
   PRINT STYLES
══════════════════════════ */
@media print {
  .no-print { display: none !important; }

  body, .v-app, .v-main, .v-container {
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

  .efhr-title { font-size: 13px; }
}
</style>
