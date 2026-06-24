<template>
  <v-container fluid>
    <!-- ── Screen Controls ── -->
    <v-row class="mb-4 no-print">
      <v-col>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <h2 class="text-h5 font-weight-bold">Consumption Per Assets</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Generate printable fuel consumption report per asset
            </p>
          </div>
          <div class="d-flex ga-2 align-center">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-printer"
              :disabled="!pages.length"
              @click="printReport"
            >
              Print
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- ── Filters ── -->
    <v-card rounded="lg" elevation="0" border class="mb-4 no-print">
      <v-card-text>
        <v-row align="center">
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
          <v-col cols="12" sm="3" class="d-flex align-center ga-2">
            <v-progress-circular v-if="loading" indeterminate size="24" width="2" />
            <span v-else-if="pages.length" class="text-caption text-medium-emphasis">
              {{ pages.length }} page{{ pages.length !== 1 ? 's' : '' }} / {{ totalAssets }} asset{{
                totalAssets !== 1 ? 's' : ''
              }}
            </span>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ── Empty State ── -->
    <v-card v-if="!pages.length && !loading" rounded="lg" elevation="0" border class="no-print">
      <v-card-text class="text-center pa-12">
        <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-car-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">
          Select a year to generate the Consumption Per Assets report
        </p>
      </v-card-text>
    </v-card>

    <!-- ══════════════════════════════════════
         PRINTABLE AREA
    ══════════════════════════════════════ -->
    <div class="print-area">
      <div
        v-for="(page, pIdx) in pages"
        :key="pIdx"
        class="cpa-page"
        :class="{ 'page-break-after': pIdx < pages.length - 1 }"
      >
        <!-- Official CSU Header -->
        <ReportHeader variant="standard" />

        <!-- Report Title -->
        <div class="cpa-title-block">
          <div class="cpa-title">CONSUMPTION PER ASSETS</div>
          <div class="cpa-subtitle">For the Year {{ selectedYear }}</div>
        </div>

        <!-- Category Label -->
        <div class="cpa-category-label">Category: {{ page.category }}</div>

        <!-- Main Table -->
        <table class="cpa-table">
          <thead>
            <tr>
              <th rowspan="2" class="col-asset-name">
                {{ page.category === 'Vehicular' ? 'Name of Assets' : 'Name of Equipment' }}
              </th>
              <th v-for="m in MONTHS" :key="m.value" colspan="2" class="col-month-group">
                {{ m.label }}
              </th>
              <th colspan="2" class="col-total-group">TOTAL</th>
            </tr>
            <tr>
              <template v-for="m in MONTHS" :key="m.value">
                <th class="col-sub">Liters</th>
                <th class="col-sub">Amount</th>
              </template>
              <th class="col-sub col-total-sub">Liters</th>
              <th class="col-sub col-total-sub">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rIdx) in page.rows"
              :key="rIdx"
              :class="rIdx % 2 === 0 ? 'row-even' : 'row-odd'"
            >
              <!-- Asset Name -->
              <td class="data-cell cell-name">
                <span v-if="!editMode">{{ row.assetName }}</span>
              </td>
              <!-- Monthly Data -->
              <template v-for="m in MONTHS" :key="m.value">
                <td class="data-cell num-cell">
                  {{ row.monthly[m.value] ? formatNum(row.monthly[m.value].liters) : '' }}
                </td>
                <td class="data-cell num-cell">
                  {{ row.monthly[m.value] ? formatAmount(row.monthly[m.value].amount) : '' }}
                </td>
              </template>
              <!-- Total -->
              <td class="data-cell num-cell td-total">{{ formatNum(row.totalLiters) }}</td>
              <td class="data-cell num-cell td-total">{{ formatAmount(row.totalAmount) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Signatories -->
        <div class="cpa-signatory-block">
          <div class="signatory-item">
            <span class="signatory-label">Verified &amp; Checked by:</span>
            <div class="signatory-name">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
                editableInfo.verifiedByName
              }}</span>
              <input v-else v-model="editableInfo.verifiedByName" class="edit-input" />
            </div>
            <div class="signatory-title">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
                editableInfo.verifiedByTitle
              }}</span>
              <input v-else v-model="editableInfo.verifiedByTitle" class="edit-input" />
            </div>
          </div>
          <div class="signatory-item">
            <span class="signatory-label">Noted by:</span>
            <div class="signatory-name">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
                editableInfo.notedByName
              }}</span>
              <input v-else v-model="editableInfo.notedByName" class="edit-input" />
            </div>
            <div class="signatory-title">
              <span v-if="!editMode" class="editable-field" @click="enableEdit">{{
                editableInfo.notedByTitle
              }}</span>
              <input v-else v-model="editableInfo.notedByTitle" class="edit-input" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Edit Toggle -->
    <v-btn
      v-if="pages.length"
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
import { supabase } from '../supabase'
import ReportHeader from '../components/ReportHeader.vue'

// ── Constants ──
const MONTHS = [
  { label: 'JAN', value: 1 },
  { label: 'FEB', value: 2 },
  { label: 'MAR', value: 3 },
  { label: 'APR', value: 4 },
  { label: 'MAY', value: 5 },
  { label: 'JUN', value: 6 },
  { label: 'JUL', value: 7 },
  { label: 'AUG', value: 8 },
  { label: 'SEP', value: 9 },
  { label: 'OCT', value: 10 },
  { label: 'NOV', value: 11 },
  { label: 'DEC', value: 12 },
]

// ── State ──
const loading = ref(false)
const editMode = ref(false)
const pages = ref([])
const selectedYear = ref(new Date().getFullYear())

const signatoryId = ref(null)
const editableInfo = ref({
  verifiedByName: '',
  verifiedByTitle: '',
  notedByName: '',
  notedByTitle: '',
})

// ── Computed ──
const yearOptions = computed(() => {
  const cur = new Date().getFullYear()
  return [cur - 2, cur - 1, cur, cur + 1].reverse()
})

const totalAssets = computed(() => pages.value.reduce((s, p) => s + p.rows.length, 0))

// ── Formatters ──
function formatAmount(val) {
  if (val === null || val === undefined || val === '' || val === 0) return ''
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatNum(val) {
  if (val === null || val === undefined || val === '' || val === 0) return ''
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Load Data ──
async function loadData() {
  loading.value = true
  editMode.value = false
  pages.value = []

  // 1. Fetch all transactions for the selected year
  const { data: transactions, error: tErr } = await supabase
    .from('fuel_transactions')
    .select('vehicle, plate_number, utilization_type, quantity, total_amount, date')
    .gte('date', `${selectedYear.value}-01-01`)
    .lte('date', `${selectedYear.value}-12-31`)

  if (tErr || !transactions?.length) {
    loading.value = false
    return
  }

  // 2. Fetch vehicles table for correct category lookup
 // 2. Fetch vehicles table for correct category lookup — no status filter, get all assets
  const { data: vehicleList } = await supabase
    .from('vehicles')
    .select('asset_name, asset_type')

  // Build a simple map: asset_name (lowercase) → asset_type
  const vehicleTypeMap = {}
  ;(vehicleList || []).forEach((v) => {
    if (v.asset_name) vehicleTypeMap[v.asset_name.trim().toLowerCase()] = v.asset_type
  })

  // 3. Build consumption map: assetKey → { category, assetName, month: { liters, amount } }
  const assetMap = {}

  transactions.forEach((tx) => {
    // Use vehicle text directly from the transaction
    const assetName = tx.vehicle?.trim() || 'Unknown'
    // Look up category from vehicles table, fallback to utilization_type in transaction
   // Resolve category from vehicles table, normalizing 'Vehicle' → 'Vehicular'
    const rawType = vehicleTypeMap[assetName.trim().toLowerCase()] || tx.utilization_type || 'Non-Vehicular'
    const category = rawType === 'Vehicle' ? 'Vehicular' : rawType === 'Non-Vehicle' ? 'Non-Vehicular' : rawType

    // Use assetName + category as unique key
    const key = `${category}__${assetName}`
    if (!assetMap[key]) {
      assetMap[key] = { assetName, category, monthly: {} }
    }

    const month = new Date(tx.date + 'T00:00:00').getMonth() + 1
    if (!assetMap[key].monthly[month]) {
      assetMap[key].monthly[month] = { liters: 0, amount: 0 }
    }
    assetMap[key].monthly[month].liters += Number(tx.quantity) || 0
    assetMap[key].monthly[month].amount += Number(tx.total_amount) || 0
  })

  // 4. Build rows with totals
  const allRows = Object.values(assetMap).map((entry) => {
    const totalLiters = Object.values(entry.monthly).reduce((s, m) => s + m.liters, 0)
    const totalAmount = Object.values(entry.monthly).reduce((s, m) => s + m.amount, 0)
    return {
      assetName: entry.assetName,
      category: entry.category,
      monthly: entry.monthly,
      totalLiters,
      totalAmount,
    }
  })

  // 5. Sort alphabetically by asset name within each category
  allRows.sort((a, b) => a.assetName.localeCompare(b.assetName))

  // 6. Split into pages: Vehicular page first, Non-Vehicular page second
  const categories = ['Vehicular', 'Non-Vehicular']
  pages.value = categories
    .map((cat) => ({
      category: cat,
      rows: allRows.filter((r) => {
        // Match both 'Vehicular'/'Vehicle' and 'Non-Vehicular'/'Non-Vehicle'
        if (cat === 'Vehicular') return r.category === 'Vehicular' || r.category === 'Vehicle'
        return r.category === 'Non-Vehicular' || r.category === 'Non-Vehicle'
      }),
    }))
    .filter((p) => p.rows.length > 0) // only include page if it has data



  loading.value = false
}

// ── Signatories ──
async function loadSignatories() {
  const { data, error } = await supabase
    .from('pm_signatories')
    .select('id, prepared_by_name, prepared_by_title, reviewed_by_name, reviewed_by_title')
    .limit(1)
    .single()

  if (error || !data) return

  signatoryId.value = data.id
  editableInfo.value.verifiedByName = data.prepared_by_name
  editableInfo.value.verifiedByTitle = data.prepared_by_title
  editableInfo.value.notedByName = data.reviewed_by_name
  editableInfo.value.notedByTitle = data.reviewed_by_title
}

// ── Edit / Print ──
function enableEdit() {
  editMode.value = true
}

async function toggleEdit() {
  if (editMode.value && signatoryId.value) {
    await supabase
      .from('pm_signatories')
      .update({
        prepared_by_name: editableInfo.value.verifiedByName,
        prepared_by_title: editableInfo.value.verifiedByTitle,
        reviewed_by_name: editableInfo.value.notedByName,
        reviewed_by_title: editableInfo.value.notedByTitle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', signatoryId.value)
  }
  editMode.value = !editMode.value
}

function printReport() {
  editMode.value = false
  const existing = document.getElementById('cpa-print-style')
  if (existing) existing.remove()
  const style = document.createElement('style')
  style.id = 'cpa-print-style'
  style.textContent = `@page { size: landscape; margin: 4mm 6mm 10mm; }`
  document.head.appendChild(style)
  setTimeout(() => window.print(), 100)
}

// ── Lifecycle ──
onMounted(() => {
  loadData()
  loadSignatories()
})
</script>

<style scoped>
/* ── Print area ── */
.print-area {
  font-family: Arial, sans-serif;
  font-size: 10px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Make the ReportHeader taller in this module only ── */
.cpa-page :deep(.report-header) {
  padding-bottom: 16px;
  margin-bottom: 16px;
}
.cpa-page :deep(.logo-csu) {
  height: 130px;
}
.cpa-page :deep(.logo-right) {
  height: 110px;
}

/* ── Page block ── */
.cpa-page {
  background: white;
  max-width: 1400px;
  margin: 0 auto 40px;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

/* ── Title block ── */
.cpa-title-block {
  text-align: center;
  margin-bottom: 8px;
}
.cpa-title {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.cpa-subtitle {
  font-size: 11px;
  font-weight: bold;
  margin-top: 2px;
  color: #333;
}

/* ── Category label ── */
.cpa-category-label {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 6px;
  color: #1f4e79;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ── Main table ── */
.cpa-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8px;
  margin-bottom: 16px;
}

.cpa-table th {
  border: 1px solid #aaa;
  padding: 4px 3px;
  text-align: center;
  font-size: 7.5px;
  font-weight: bold;
}

.cpa-table td {
  border: 1px solid #aaa;
  vertical-align: middle;
}

/* ── Header: asset name column ── */
.col-asset-name {
  background: #2e7d32;
  color: white;
  width: 160px;
  text-align: center;
}

/* ── Header: month group (JAN, FEB...) ── */
.col-month-group {
  background: #2e7d32;
  color: white;
}

/* ── Header: sub-columns (L / Amount) ── */
.col-sub {
  background: #a5d6a7;
  color: #0d2137;
  font-weight: bold;
  width: 48px;
}

/* ── Header: TOTAL group ── */
.col-total-group {
  background: #2e7d32;
  color: white;
}

/* ── Header: TOTAL sub-columns ── */
.col-total-sub {
  background: #a5d6a7 !important;
  color: #0d2137 !important;
}

/* ── Data cells ── */
.data-cell {
  padding: 3px 4px;
  min-height: 20px;
}
.cell-name {
  text-align: left;
  padding-left: 6px;
  white-space: pre-wrap;
  word-break: break-word;
}
.num-cell {
  text-align: right;
  padding-right: 4px;
}

/* ── Row striping ── */
.row-even {
  background: #ffffff;
}
.row-odd {
  background: #ffffff;
}

/* ── Total cell ── */
.td-total {
  font-weight: bold;
  background: #e3f2fd;
}

/* ── Editable fields ── */
.editable-field {
  cursor: pointer;
  display: inline-block;
  width: 100%;
  min-height: 14px;
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
  font-size: 8.5px;
  font-family: Arial, sans-serif;
  background: #e3f2fd;
  outline: none;
}

/* ── Signatories ── */
.cpa-signatory-block {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 8px;
  padding-right: 12%;
}
.signatory-item {
  min-width: 220px;
}
.signatory-label {
  font-size: 10px;
  font-weight: bold;
}
.signatory-name {
  margin-top: 24px;
  font-weight: bold;
  font-size: 10px;
  padding-top: 2px;
  min-width: 200px;
}
.signatory-title {
  font-size: 9.5px;
  color: #333;
  margin-top: 2px;
}

/* ── Form code ── */
.form-code {
  font-size: 8px;
  color: #666;
  margin-top: 8px;
}

/* ══════════════════
   PRINT STYLES
══════════════════ */
@media print {
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
    font-size: 7.5px;
  }

  .cpa-page {
    max-width: 100%;
    padding: 4mm 6mm 10mm;
    border: none;
    border-radius: 0;
    margin: 0;
  }

  .cpa-page :deep(.report-header) {
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
  .cpa-page :deep(.logo-csu) {
    height: 130px;
  }
  .cpa-page :deep(.logo-right) {
    height: 110px;
  }

  .page-break-after {
    page-break-after: always;
  }

  .cpa-table {
    font-size: 7px;
  }
  .cpa-table th {
    font-size: 6.5px;
  }
  .cpa-title {
    font-size: 13px;
  }

  .editable-field {
    cursor: default;
    background: transparent !important;
    outline: none !important;
  }
  .edit-input {
    border: none;
    background: transparent;
    padding: 0;
    font-size: 8px;
    width: 100%;
  }
}
</style>
