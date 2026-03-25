<template>
  <v-container fluid>
    <!-- ── Screen Controls ── -->
    <v-row class="mb-4 no-print">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">Fuel Summary Report</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Generate printable fuel summary per billing period
            </p>
          </div>
          <v-btn
            variant="outlined"
            prepend-icon="mdi-printer"
            :disabled="!pages.length"
            @click="printReport"
          >
            Print All ({{ pages.length }} page{{ pages.length !== 1 ? 's' : '' }})
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card rounded="lg" elevation="0" border class="mb-4 no-print">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" sm="3">
            <v-select
              v-model="selectedBillingPeriod"
              :items="billingPeriodOptions"
              label="Billing Period"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:modelValue="loadData"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="selectedFundCluster"
              :items="fundClusterOptions"
              label="Fund Cluster (optional)"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:modelValue="loadData"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="selectedContractId"
              :items="contractOptions"
              item-title="label"
              item-value="id"
              label="Contract / PO (optional)"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:modelValue="loadData"
            />
          </v-col>
          <v-col cols="12" sm="3" class="d-flex align-center ga-2">
            <v-progress-circular v-if="loading" indeterminate size="24" width="2" />
            <span v-else-if="pages.length" class="text-caption text-medium-emphasis">
              {{ pages.length }} fund cluster{{ pages.length !== 1 ? 's' : '' }} /
              {{ totalRows }} row{{ totalRows !== 1 ? 's' : '' }}
            </span>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Empty state -->
    <v-card v-if="!pages.length && !loading" rounded="lg" elevation="0" border class="no-print">
      <v-card-text class="text-center pa-12">
        <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-gas-station-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">
          Select a billing period to generate the fuel summary
        </p>
      </v-card-text>
    </v-card>

    <!-- ══════════════════════════════════════════
         PRINTABLE PAGES — one per fund cluster
    ══════════════════════════════════════════ -->
    <div class="print-area">
      <div
        v-for="(page, pIdx) in pages"
        :key="pIdx"
        class="fuel-page"
        :class="{ 'page-break-after': pIdx < pages.length - 1 }"
      >
        <!-- Official CSU Header -->
        <ReportHeader variant="standard" />

        <!-- Contractor row (kept as editable field below the header) -->
        <div class="fuel-contractor-row">
          <span class="fuel-contractor-label">CONTRACTOR:</span>
          <span class="fuel-contractor-name editable-field" v-if="!editMode" @click="enableEdit">
            {{ page.contractor }}
          </span>
          <input v-else v-model="page.contractor" class="edit-input contractor-input" />
        </div>

        <!-- Report title (editable) -->
        <div class="fuel-report-title">
          <span v-if="!editMode" class="editable-field" @click="enableEdit">
            {{ page.reportTitle }}
          </span>
          <input v-else v-model="page.reportTitle" class="edit-input title-input" />
        </div>

        <!-- Main table -->
        <table class="fuel-table">
          <thead>
            <tr>
              <th rowspan="2" class="col-date th-base">DATE</th>
              <th rowspan="2" class="col-or th-base">O.R. #</th>
              <th colspan="4" class="group-header th-diesel">DIESEL</th>
              <th colspan="4" class="group-header th-gasoline">GASOLINE</th>
              <th rowspan="2" class="col-utilize th-base">UTILIZED BY</th>
              <th rowspan="2" class="col-vehicle th-base">VEHICLE / EQUIPMENT</th>
              <th rowspan="2" class="col-total th-total">TOTAL AMOUNT DUE</th>
              <th rowspan="2" class="col-charge th-charge">FUEL CHARGE TO</th>
              <th rowspan="2" class="col-po th-po">P.O. #</th>
            </tr>
            <tr>
              <th class="sub-col sub-diesel">QTY</th>
              <th class="sub-col sub-diesel">UNIT</th>
              <th class="sub-col sub-diesel">UNIT COST</th>
              <th class="sub-col sub-diesel">AMOUNT</th>
              <th class="sub-col sub-gasoline">QTY</th>
              <th class="sub-col sub-gasoline">UNIT</th>
              <th class="sub-col sub-gasoline">UNIT COST</th>
              <th class="sub-col sub-gasoline">AMOUNT</th>
            </tr>
          </thead>

        <tbody>
            <tr v-for="(row, rIdx) in page.rows" :key="rIdx" :class="rIdx % 2 === 0 ? 'row-even' : 'row-odd'">
              <!-- Date -->
              <td class="data-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.date }}
                </div>
                <input v-else v-model="row.date" class="edit-input" />
              </td>
              <!-- OR # -->
              <td class="data-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.or_number }}
                </div>
                <input v-else v-model="row.or_number" class="edit-input" />
              </td>
              <!-- Diesel: QTY -->
              <td class="data-cell num-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.diesel_qty ? formatQty(row.diesel_qty) : '' }}
                </div>
                <input v-else v-model="row.diesel_qty" class="edit-input" type="number" step="0.01" />
              </td>
              <!-- Diesel: UNIT -->
              <td class="data-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.diesel_qty ? (row.diesel_unit || 'LTRS.') : '' }}
                </div>
                <input v-else v-model="row.diesel_unit" class="edit-input" />
              </td>
              <!-- Diesel: UNIT COST -->
              <td class="data-cell num-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.diesel_qty ? formatCost(row.diesel_unit_price) : '' }}
                </div>
                <input v-else v-model="row.diesel_unit_price" class="edit-input" type="number" step="0.01" />
              </td>
              <!-- Diesel: AMOUNT -->
              <td class="data-cell num-cell">
                {{ row.diesel_qty ? formatAmount(row.diesel_qty * row.diesel_unit_price) : '' }}
              </td>
              <!-- Gasoline: QTY -->
              <td class="data-cell num-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.gasoline_qty ? formatQty(row.gasoline_qty) : '' }}
                </div>
                <input v-else v-model="row.gasoline_qty" class="edit-input" type="number" step="0.01" />
              </td>
              <!-- Gasoline: UNIT -->
              <td class="data-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.gasoline_qty ? (row.gasoline_unit || 'LTRS.') : '' }}
                </div>
                <input v-else v-model="row.gasoline_unit" class="edit-input" />
              </td>
              <!-- Gasoline: UNIT COST -->
              <td class="data-cell num-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.gasoline_qty ? formatCost(row.gasoline_unit_price) : '' }}
                </div>
                <input v-else v-model="row.gasoline_unit_price" class="edit-input" type="number" step="0.01" />
              </td>
              <!-- Gasoline: AMOUNT -->
              <td class="data-cell num-cell">
                {{ row.gasoline_qty ? formatAmount(row.gasoline_qty * row.gasoline_unit_price) : '' }}
              </td>
              <!-- Utilized By -->
              <td class="data-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.utilized_by }}
                </div>
                <input v-else v-model="row.utilized_by" class="edit-input" />
              </td>
              <!-- Vehicle/Equipment -->
              <td class="data-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.vehicle }}
                </div>
                <input v-else v-model="row.vehicle" class="edit-input" />
              </td>
              <!-- Total Amount Due -->
              <td class="data-cell num-cell td-total-val">
                {{ formatAmount(rowTotal(row)) }}
              </td>
              <!-- Fuel Charge To -->
              <td class="data-cell td-charge-val">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.fuel_charge_to }}
                </div>
                <input v-else v-model="row.fuel_charge_to" class="edit-input" />
              </td>
              <!-- PO # -->
              <td class="data-cell td-po-val">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.po_number }}
                </div>
                <input v-else v-model="row.po_number" class="edit-input" />
              </td>
            </tr>
          </tbody>
        </table>

      <!-- Footer totals -->
        <table class="fuel-footer-table">
          <tbody>
            <tr>
              <td class="footer-label footer-label-diesel">NO. OF LITER/S IN DIESEL</td>
              <td class="footer-value footer-value-diesel">{{ formatQty(page.totalDieselQty) }}</td>
            </tr>
            <tr>
              <td class="footer-label footer-label-gasoline">NO. OF LITER/S IN GASOLINE</td>
              <td class="footer-value footer-value-gasoline">{{ formatQty(page.totalGasolineQty) }}</td>
            </tr>
            <tr class="footer-total-row">
              <td class="footer-label">TOTAL AMOUNT DUE</td>
              <td class="footer-value footer-total-val">{{ formatAmount(page.totalAmount) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Signatories -->
        <div class="fuel-signatories" :class="page.sigLayout">
          <!-- RAF / IGF / BRF layout: Prepared by | Checked by | Noted by -->
          <template v-if="page.sigLayout === 'three-col'">
            <div class="sig-col">
              <div class="sig-role">Prepared by:</div>
              <div class="sig-spacer"></div>
              <div class="sig-name">
                <span v-if="!editMode" class="editable-field" @click="enableEdit">
                  {{ page.sig.preparedByName }}
                </span>
                <input v-else v-model="page.sig.preparedByName" class="edit-input" />
              </div>
              <div class="sig-title">
                <span v-if="!editMode" class="editable-field" @click="enableEdit">
                  {{ page.sig.preparedByTitle }}
                </span>
                <input v-else v-model="page.sig.preparedByTitle" class="edit-input" />
              </div>
            </div>
            <div class="sig-col">
              <div class="sig-role">Checked by:</div>
              <div class="sig-spacer"></div>
              <div class="sig-name">
                <span v-if="!editMode" class="editable-field" @click="enableEdit">
                  {{ page.sig.checkedByName }}
                </span>
                <input v-else v-model="page.sig.checkedByName" class="edit-input" />
              </div>
              <div class="sig-title">
                <span v-if="!editMode" class="editable-field" @click="enableEdit">
                  {{ page.sig.checkedByTitle }}
                </span>
                <input v-else v-model="page.sig.checkedByTitle" class="edit-input" />
              </div>
            </div>
            <div class="sig-col">
              <div class="sig-role">Noted by:</div>
              <div class="sig-spacer"></div>
              <div class="sig-name">
                <span v-if="!editMode" class="editable-field" @click="enableEdit">
                  {{ page.sig.notedByName }}
                </span>
                <input v-else v-model="page.sig.notedByName" class="edit-input" />
              </div>
              <div class="sig-title">
                <span v-if="!editMode" class="editable-field" @click="enableEdit">
                  {{ page.sig.notedByTitle }}
                </span>
                <input v-else v-model="page.sig.notedByTitle" class="edit-input" />
              </div>
            </div>
          </template>

          <!-- TRF layout: Prepared by | Noted by (no Checked by) -->
          <template v-else>
            <div class="sig-col">
              <div class="sig-role">Prepared by:</div>
              <div class="sig-spacer"></div>
              <div class="sig-name">
                <span v-if="!editMode" class="editable-field" @click="enableEdit">
                  {{ page.sig.preparedByName }}
                </span>
                <input v-else v-model="page.sig.preparedByName" class="edit-input" />
              </div>
              <div class="sig-title">
                <span v-if="!editMode" class="editable-field" @click="enableEdit">
                  {{ page.sig.preparedByTitle }}
                </span>
                <input v-else v-model="page.sig.preparedByTitle" class="edit-input" />
              </div>
            </div>
            <div class="sig-col">
              <div class="sig-role">Noted by:</div>
              <div class="sig-spacer"></div>
              <div class="sig-name">
                <span v-if="!editMode" class="editable-field" @click="enableEdit">
                  {{ page.sig.notedByName }}
                </span>
                <input v-else v-model="page.sig.notedByName" class="edit-input" />
              </div>
              <div class="sig-title">
                <span v-if="!editMode" class="editable-field" @click="enableEdit">
                  {{ page.sig.notedByTitle }}
                </span>
                <input v-else v-model="page.sig.notedByTitle" class="edit-input" />
              </div>
            </div>
          </template>
        </div>
        <!-- end signatories -->
      </div>
      <!-- end v-for pages -->
    </div>
    <!-- end print-area -->

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

// ── State ──
const loading = ref(false)
const editMode = ref(false)
const pages = ref([]) // one entry per fund cluster
const billingPeriodOptions = ref([])
const fundClusterOptions = ref([])
const contractOptions = ref([])
const selectedBillingPeriod = ref(null)
const selectedFundCluster = ref(null)
const selectedContractId = ref(null)

// ── Computed ──
const totalRows = computed(() => pages.value.reduce((s, p) => s + p.rows.length, 0))

// ── Formatters ──
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

function formatQty(val) {
  if (!val && val !== 0) return ''
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatCost(val) {
  if (!val && val !== 0) return ''
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatAmount(val) {
  if (!val && val !== 0) return ''
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function rowTotal(row) {
  const d = (Number(row.diesel_qty) || 0) * (Number(row.diesel_unit_price) || 0)
  const g = (Number(row.gasoline_qty) || 0) * (Number(row.gasoline_unit_price) || 0)
  return d + g
}

// ── Signatory defaults by fund cluster ──
function getSig(fundCluster) {
  const fc = (fundCluster || '').toUpperCase()
  if (fc.includes('TRF')) {
    return {
      layout: 'two-col',
      preparedByName: 'ENGR. ENA TIU-IBARRA',
      preparedByTitle: 'Admin. Officer III, General Services',
      notedByName: 'AR. CHRISTIAN DWIGHT C. DOLOTINA',
      notedByTitle: 'Director, General Services',
    }
  }
  // RAF / IGF / BRF
  return {
    layout: 'three-col',
    preparedByName: 'ROJIELAINE DIVINE AMPARO',
    preparedByTitle: 'DRAFTSMAN - 1',
    checkedByName: 'ENGR. ENA TIU-IBARRA',
    checkedByTitle: 'AO III, GSO - Transportation Unit',
    notedByName: 'ENGR. MARIEL M. DELO',
    notedByTitle: 'Director, General Services',
  }
}

// ── Load dropdown options ──
async function fetchOptions() {
  // Distinct billing periods
  const { data: bpData } = await supabase
    .from('fuel_transactions')
    .select('billing_period')
    .not('billing_period', 'is', null)
    .order('billing_period', { ascending: false })

  const bpSet = [...new Set((bpData || []).map((r) => r.billing_period).filter(Boolean))]
  billingPeriodOptions.value = bpSet

  // Distinct fund clusters
  const { data: fcData } = await supabase
    .from('fuel_transactions')
    .select('fund_cluster')
    .not('fund_cluster', 'is', null)
    .order('fund_cluster')

  const fcSet = [...new Set((fcData || []).map((r) => r.fund_cluster).filter(Boolean))]
  fundClusterOptions.value = fcSet

  // Contracts for optional filter
  const { data: cData } = await supabase
    .from('fuel_contracts')
    .select('id, year, po_number, fund_cluster')
    .order('year', { ascending: false })

  contractOptions.value = (cData || []).map((c) => ({
    id: c.id,
    label: `${c.year} — ${c.fund_cluster} — PO# ${c.po_number}`,
  }))
}

// ── Main data load ──
async function loadData() {
  if (!selectedBillingPeriod.value) {
    pages.value = []
    return
  }

  loading.value = true
  editMode.value = false

  let query = supabase
    .from('fuel_transactions')
    .select('*')
    .eq('billing_period', selectedBillingPeriod.value)
    .order('fund_cluster')
    .order('date')

  if (selectedFundCluster.value) query = query.eq('fund_cluster', selectedFundCluster.value)

  if (selectedContractId.value) query = query.eq('contract_id', selectedContractId.value)

  const { data, error } = await query

  if (error || !data) {
    pages.value = []
    loading.value = false
    return
  }

  // Group by fund_cluster → one page per cluster
  const grouped = {}
  data.forEach((tx) => {
    const fc = tx.fund_cluster || 'UNSPECIFIED'
    if (!grouped[fc]) grouped[fc] = []
    grouped[fc].push(tx)
  })

  pages.value = Object.entries(grouped).map(([fundCluster, txList]) => {
    const sig = getSig(fundCluster)

    // Build rows — each transaction is one row
    // Diesel and Gasoline are separate transactions; we merge same-OR# transactions
    // onto one row when possible, otherwise keep separate
    const rowMap = {}
    txList.forEach((tx) => {
      const key = tx.or_number || tx.id // group by OR number
      if (!rowMap[key]) {
        rowMap[key] = {
          date: formatDate(tx.date),
          or_number: tx.or_number || '',
          diesel_qty: null,
          diesel_unit: '',
          diesel_unit_price: null,
          gasoline_qty: null,
          gasoline_unit: '',
          gasoline_unit_price: null,
          utilized_by: tx.utilized_by || '',
          vehicle: tx.vehicle || '',
          fuel_charge_to: tx.account_code || '',
          po_number: tx.po_number || '',
          _sortDate: tx.date,
        }
      }
      if ((tx.fuel_type || '').toLowerCase() === 'gasoline') {
        rowMap[key].gasoline_qty = tx.quantity
        rowMap[key].gasoline_unit = tx.unit || 'LTRS.'
        rowMap[key].gasoline_unit_price = tx.unit_price
      } else {
        // diesel (default)
        rowMap[key].diesel_qty = tx.quantity
        rowMap[key].diesel_unit = tx.unit || 'LTRS.'
        rowMap[key].diesel_unit_price = tx.unit_price
      }
      // Take utilized_by / vehicle from whichever row has it
      if (tx.utilized_by) rowMap[key].utilized_by = tx.utilized_by
      if (tx.vehicle) rowMap[key].vehicle = tx.vehicle
    })

    const rows = Object.values(rowMap).sort((a, b) => (a._sortDate > b._sortDate ? 1 : -1))

    // Compute totals
    const totalDieselQty = rows.reduce((s, r) => s + (Number(r.diesel_qty) || 0), 0)
    const totalGasolineQty = rows.reduce((s, r) => s + (Number(r.gasoline_qty) || 0), 0)
    const totalAmount = rows.reduce((s, r) => s + rowTotal(r), 0)

    // Only show fuel_charge_to on first row of each unique value
    let lastCharge = null
    rows.forEach((r) => {
      if (r.fuel_charge_to === lastCharge) {
        r.fuel_charge_to = ''
      } else {
        lastCharge = r.fuel_charge_to
      }
    })

    // Build title
    const reportTitle = `SUMMARY OF FUEL CONSUMPTION — ${selectedBillingPeriod.value} — ${fundCluster}`

    return {
      fundCluster,
      contractor: 'UNIV GAS REFILLING STATION',
      reportTitle,
      rows,
      totalDieselQty,
      totalGasolineQty,
      totalAmount,
      sigLayout: sig.layout === 'three-col' ? 'three-col' : 'two-col',
      sig: {
        preparedByName: sig.preparedByName || '',
        preparedByTitle: sig.preparedByTitle || '',
        checkedByName: sig.checkedByName || '',
        checkedByTitle: sig.checkedByTitle || '',
        notedByName: sig.notedByName || '',
        notedByTitle: sig.notedByTitle || '',
      },
    }
  })

  loading.value = false
}

// ── Edit mode ──
function enableEdit() {
  editMode.value = true
}
function toggleEdit() {
  editMode.value = !editMode.value
}

// ── Print ──
function printReport() {
  editMode.value = false
  setTimeout(() => window.print(), 100)
}

// ── Lifecycle ──
onMounted(async () => {
  await fetchOptions()
})
</script>

<style scoped>
/* ── Screen wrapper ── */
.print-area {
  font-family: Arial, sans-serif;
  font-size: 9.5px;
}

/* ── Page block ── */
.fuel-page {
  background: white;
  max-width: 1100px;
  margin: 0 auto 40px;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

/* ── Contractor row ── */
.fuel-contractor-row {
  font-size: 10px;
  font-weight: bold;
  margin-bottom: 4px;
}
.fuel-contractor-label {
  margin-right: 8px;
}
.fuel-contractor-name {
  font-weight: normal;
}

/* ── Report title ── */
.fuel-report-title {
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

/* ── Main table ── */
.fuel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8.5px;
  margin-bottom: 8px;
}
.fuel-table th {
  border: 1px solid #aaa;
  padding: 4px 3px;
  text-align: center;
  font-size: 8px;
  font-weight: bold;
}
.fuel-table td {
  border: 1px solid #aaa;
  vertical-align: middle;
}

/* Header base (DATE, OR#, UTILIZE BY, VEHICLE) */
.th-base    { background: #1F4E79; color: white; }
.th-diesel  { background: #1F4E79; color: white; }
.th-gasoline { background: #1E5631; color: white; }
.th-total   { background: #FFD966; color: #000; }
.th-charge  { background: #70AD47; color: white; }
.th-po      { background: #70AD47; color: white; }

/* Sub-headers */
.sub-diesel   { background: #BDD7EE; color: #000; }
.sub-gasoline { background: #C6EFCE; color: #000; }

/* Column widths — original */
.col-date    { width: 50px; }
.col-or      { width: 52px; }
.sub-col     { width: 46px; }
.col-utilize { width: 90px; }
.col-vehicle { width: 90px; }
.col-total   { width: 70px; text-align: right; }
.col-charge  { width: 100px; }
.col-po      { width: 80px; }

.data-cell { padding: 3px 4px; min-height: 22px; }
.num-cell  { text-align: right; }

/* Row striping */
.row-even { background: #ffffff; }
.row-odd  { background: #EBF3FB; }

/* Colored data cells */
.td-total-val  { font-weight: bold; background: #FFF2CC; }
.td-charge-val { background: #E2EFDA; font-weight: bold; text-align: center; }
.td-po-val     { background: #E2EFDA; font-weight: bold; text-align: center; }

/* ── Footer totals ── */
.fuel-footer-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
  margin-bottom: 16px;
}
.fuel-footer-table td { border: 1px solid #bbb; padding: 4px 8px; }
.footer-label {
  font-weight: bold;
  background: #f5f5f5;
  text-align: right;
  padding-right: 16px;
}
.footer-value { text-align: right; width: 120px; font-weight: bold; }

.footer-label-diesel  { background: #BDD7EE; color: #000; }
.footer-value-diesel  { background: #BDD7EE; color: #000; }
.footer-label-gasoline { background: #C6EFCE; color: #000; }
.footer-value-gasoline { background: #C6EFCE; color: #000; }

.footer-total-row .footer-label { background: #1F4E79; color: white; }
.footer-total-val { background: #FFD966; color: #000; font-weight: bold; font-size: 10px; }

/* ── Signatories ── */
.fuel-signatories {
  display: flex;
  gap: 40px;
  margin-top: 20px;
}
.three-col {
  justify-content: space-between;
}
.two-col {
  justify-content: flex-start;
  gap: 120px;
}

.sig-col {
  min-width: 180px;
}
.sig-role {
  font-size: 10px;
  font-weight: bold;
  margin-bottom: 2px;
}
.sig-spacer {
  height: 28px;
}
.sig-name {
  border-top: 1px solid #333;
  font-weight: bold;
  font-size: 10px;
  padding-top: 2px;
}
.sig-title {
  font-size: 9px;
  color: #333;
  margin-top: 2px;
}

/* ── Editable field hints (screen only) ── */
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
.contractor-input {
  font-size: 10px;
  font-weight: bold;
}
.title-input {
  font-size: 11px;
  font-weight: bold;
  text-align: center;
}
.cell-text {
  white-space: pre-wrap;
  word-break: break-word;
}

/* ══════════════════════
   PRINT STYLES
══════════════════════ */
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
    font-size: 8px;
  }

  .fuel-page {
    max-width: 100%;
    padding: 10mm 12mm;
    border: none;
    border-radius: 0;
    margin: 0;
    page-break-inside: avoid;
  }

  .page-break-after {
    page-break-after: always;
  }

  .fuel-table,
  .fuel-footer-table {
    font-size: 7.5px;
  }
  .fuel-table th {
    font-size: 7px;
  }
  .fuel-report-title {
    font-size: 10px;
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
