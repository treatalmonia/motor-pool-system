<template>
  <v-container fluid>
    <!-- ── Screen Controls ── -->
    <v-row class="mb-4 no-print">
      <v-col>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <h2 class="text-h5 font-weight-bold">Fuel Balance Per Account</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Generate printable fuel balance report per cost center account
            </p>
          </div>
          <div class="d-flex ga-2 align-center">
            <!-- <v-btn-toggle v-model="orientation" mandatory variant="outlined" density="compact">
              <v-btn value="portrait" prepend-icon="mdi-phone-rotate-portrait">Portrait</v-btn>
              <v-btn value="landscape" prepend-icon="mdi-phone-rotate-landscape">Landscape</v-btn>
            </v-btn-toggle> -->
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
          <v-col cols="12" sm="3">
            <v-select
              v-model="selectedFundCluster"
              :items="['All Funds', ...fundClusterOptions]"
              label="Fund Cluster (optional)"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:modelValue="loadData"
            />
          </v-col>
          <v-col cols="12" sm="3" class="d-flex align-center ga-2">
            <v-progress-circular v-if="loading" indeterminate size="24" width="2" />
            <span v-else-if="pages.length" class="text-caption text-medium-emphasis">
              {{ pages.length }} page{{ pages.length !== 1 ? 's' : '' }} /
              {{ totalAccounts }} account{{ totalAccounts !== 1 ? 's' : '' }}
            </span>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ── Empty State ── -->
    <v-card v-if="!pages.length && !loading" rounded="lg" elevation="0" border class="no-print">
      <v-card-text class="text-center pa-12">
        <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-file-chart-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">
          Select a year to generate the Fuel Balance Per Account report
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
        class="fba-page"
        :class="{ 'page-break-after': pIdx < pages.length - 1 }"
      >
        <!-- Official CSU Header -->
        <ReportHeader variant="standard" />

        <!-- Report Title -->
        <div class="fba-title-block">
          <div class="fba-title">FUEL BALANCE PER ACCOUNT</div>
          <div class="fba-subtitle">For the Year {{ selectedYear }} — {{ page.fundCluster }}</div>
        </div>

        <!-- Main Table -->
        <table class="fba-table">
          <thead>
            <tr>
              <th rowspan="2" class="col-po">P.O. #</th>
              <th rowspan="2" class="col-account">ACCOUNT CODE / COST CENTER</th>
              <th rowspan="2" class="col-amount">ACCOUNT AMOUNT</th>
              <th :colspan="MONTHS.length" class="group-consumption">CONSUMPTION</th>
              <th rowspan="2" class="col-balance">BALANCE</th>
            </tr>
            <tr>
              <th v-for="m in MONTHS" :key="m.value" class="col-month">{{ m.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rIdx) in page.rows"
              :key="rIdx"
              :class="rIdx % 2 === 0 ? 'row-even' : 'row-odd'"
            >
              <!-- PO Number -->
              <td class="data-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.po_number }}
                </div>
                <input v-else v-model="row.po_number" class="edit-input" />
              </td>
              <!-- Account Code -->
              <td class="data-cell">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ row.account_code }}
                </div>
                <input v-else v-model="row.account_code" class="edit-input" />
              </td>
              <!-- Account Amount -->
              <td class="data-cell num-cell td-amount">
                <div v-if="!editMode" class="cell-text editable-field" @click="enableEdit">
                  {{ formatAmount(row.contract_amount) }}
                </div>
                <input
                  v-else
                  v-model="row.contract_amount"
                  class="edit-input"
                  type="number"
                  step="0.01"
                />
              </td>
              <!-- Monthly Consumptions -->
              <td
                v-for="m in MONTHS"
                :key="m.value"
                class="data-cell num-cell"
                :class="row.monthlyConsumption[m.value] ? 'td-has-value' : 'td-empty'"
              >
                {{
                  row.monthlyConsumption[m.value]
                    ? formatAmount(row.monthlyConsumption[m.value])
                    : ''
                }}
              </td>
              <!-- Balance -->
              <td
                class="data-cell num-cell td-balance"
                :class="row.balance < 0 ? 'td-negative' : 'td-positive'"
              >
                {{ formatAmount(row.balance) }}
              </td>
            </tr>

            <!-- Totals row -->
            <tr class="totals-row">
              <td colspan="2" class="data-cell totals-label">TOTAL</td>
              <td class="data-cell num-cell">{{ formatAmount(page.totalContractAmount) }}</td>
              <td v-for="m in MONTHS" :key="m.value" class="data-cell num-cell">
                {{ page.monthlyTotals[m.value] ? formatAmount(page.monthlyTotals[m.value]) : '' }}
              </td>
              <td
                class="data-cell num-cell"
                :class="page.totalBalance < 0 ? 'td-negative' : 'td-positive'"
              >
                {{ formatAmount(page.totalBalance) }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Signatories -->
        <div class="fba-signatory-block">
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
        </div>

        <!-- Form code -->
        <div class="form-code">
          <span>F-GEN-PMC-003a <br>
Rev. 3 10/19/2023</span>
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
const orientation = ref('landscape')
const pages = ref([])
const fundClusterOptions = ref([])
const selectedYear = ref(new Date().getFullYear())
const selectedFundCluster = ref('All Funds')

const editableInfo = ref({
  verifiedByName: 'ENGR. ENA TIU-IBARRA',
  verifiedByTitle: 'AO III, General Services Office',
})

// ── Computed ──
const yearOptions = computed(() => {
  const cur = new Date().getFullYear()
  return [cur - 2, cur - 1, cur, cur + 1].reverse()
})

const totalAccounts = computed(() => pages.value.reduce((s, p) => s + p.rows.length, 0))

// ── Formatters ──
function formatAmount(val) {
  if (val === null || val === undefined || val === '') return '0.00'
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Load Data ──
async function loadData() {
  loading.value = true
  editMode.value = false
  pages.value = []

  // 1. Fetch all contracts for the selected year
  let contractQuery = supabase
    .from('fuel_contracts')
    .select('id, po_number, account_code, fund_cluster, contract_amount')
    .eq('year', selectedYear.value)
    .order('fund_cluster')
    .order('account_code')

  if (selectedFundCluster.value && selectedFundCluster.value !== 'All Funds') {
    contractQuery = contractQuery.eq('fund_cluster', selectedFundCluster.value)
  }

  const { data: contracts, error: cErr } = await contractQuery
  if (cErr || !contracts?.length) {
    loading.value = false
    return
  }

  // 2. Fetch all transactions for the selected year
  const { data: transactions, error: tErr } = await supabase
    .from('fuel_transactions')
    .select('contract_id, total_amount, date')
    .gte('date', `${selectedYear.value}-01-01`)
    .lte('date', `${selectedYear.value}-12-31`)

  if (tErr) {
    loading.value = false
    return
  }

  // 3. Build consumption map: contract_id → { month: total_amount }
  const consumptionMap = {}
  ;(transactions || []).forEach((tx) => {
    if (!tx.contract_id) return
    const month = new Date(tx.date + 'T00:00:00').getMonth() + 1
    if (!consumptionMap[tx.contract_id]) consumptionMap[tx.contract_id] = {}
    consumptionMap[tx.contract_id][month] =
      (consumptionMap[tx.contract_id][month] || 0) + (tx.total_amount || 0)
  })

  // 4. Group contracts by fund_cluster → one page per fund cluster
  const grouped = {}
  contracts.forEach((c) => {
    const fc = c.fund_cluster || 'UNSPECIFIED'
    if (!grouped[fc]) grouped[fc] = []
    grouped[fc].push(c)
  })

  // 5. Build pages
  pages.value = Object.entries(grouped).map(([fundCluster, contractList]) => {
    const rows = contractList.map((c) => {
      const monthly = consumptionMap[c.id] || {}
      const totalConsumed = Object.values(monthly).reduce((s, v) => s + v, 0)
      const balance = (c.contract_amount || 0) - totalConsumed
      return {
        po_number: c.po_number || '',
        account_code: c.account_code || '',
        contract_amount: c.contract_amount || 0,
        monthlyConsumption: monthly,
        totalConsumed,
        balance,
      }
    })

    // Page totals
    const totalContractAmount = rows.reduce((s, r) => s + r.contract_amount, 0)
    const totalBalance = rows.reduce((s, r) => s + r.balance, 0)
    const monthlyTotals = {}
    MONTHS.forEach((m) => {
      const total = rows.reduce((s, r) => s + (r.monthlyConsumption[m.value] || 0), 0)
      if (total > 0) monthlyTotals[m.value] = total
    })

    return { fundCluster, rows, totalContractAmount, totalBalance, monthlyTotals }
  })

  // 6. Populate fund cluster filter options
  const fcSet = [...new Set(contracts.map((c) => c.fund_cluster).filter(Boolean))]
  fundClusterOptions.value = fcSet

  loading.value = false
}

// ── Edit / Print ──
function enableEdit() {
  editMode.value = true
}
function toggleEdit() {
  editMode.value = !editMode.value
}

function printReport() {
  editMode.value = false
  const existing = document.getElementById('fba-print-style')
  if (existing) existing.remove()
  const style = document.createElement('style')
  style.id = 'fba-print-style'
  style.textContent = `@page { size: ${orientation.value}; margin: 4mm 6mm 10mm; }`
  document.head.appendChild(style)
  setTimeout(() => window.print(), 100)
}

// ── Lifecycle ──
onMounted(() => loadData())
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
.fba-page :deep(.report-header) {
  padding-bottom: 16px;
  margin-bottom: 16px;
}
.fba-page :deep(.logo-csu) {
  height: 130px;
}
.fba-page :deep(.logo-right) {
  height: 110px;
}

/* ── Page block ── */
.fba-page {
  background: white;
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

/* ── Title block ── */
.fba-title-block {
  text-align: center;
  margin-bottom: 12px;
}
.fba-title {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.fba-subtitle {
  font-size: 11px;
  font-weight: bold;
  margin-top: 2px;
  color: #333;
}

/* ── Main table ── */
.fba-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8.5px;
  margin-bottom: 16px;
}

.fba-table th {
  border: 1px solid #aaa;
  padding: 4px 3px;
  text-align: center;
  font-size: 8px;
  font-weight: bold;
}

.fba-table td {
  border: 1px solid #aaa;
  vertical-align: middle;
}

/* Header colors */
.fba-table thead tr:first-child th {
  background: #1f4e79;
  color: white;
}

/* Consumption sub-header group */
.group-consumption {
  background: #1565c0;
  color: white;
}

/* Month sub-headers */
.col-month {
  background: #90caf9;
  color: #0d2137;
  font-weight: bold;
  width: 52px;
}

/* Column widths */
.col-po {
  width: 80px;
  background: #1f4e79;
  color: white;
}
.col-account {
  width: 160px;
  background: #1f4e79;
  color: white;
}
.col-amount {
  width: 80px;
  background: #f9a825;
  color: #000;
}
.col-balance {
  width: 80px;
  background: #2e7d32;
  color: white;
}

.data-cell {
  padding: 3px 5px;
  min-height: 22px;
  text-align: center;
}
.num-cell {
  text-align: center;
}

/* Row striping */
.row-even {
  background: #ffffff;
}
.row-odd {
  background: #f3f8ff;
}

/* Cell value styles */
.td-amount {
  background: #fff9c4;
  font-weight: bold;
}
.td-has-value {
  background: #e3f2fd;
}
.td-empty {
  background: #fafafa;
  color: #bbb;
}
.td-balance {
  font-weight: bold;
}
.td-positive {
  color: #1b5e20;
  background: #e8f5e9;
}
.td-negative {
  color: #b71c1c;
  background: #ffebee;
}

/* Totals row */
.totals-row td {
  background: #1f4e79;
  color: white;
  font-weight: bold;
  border-color: #1f4e79;
}
.totals-label {
  text-align: right;
  padding-right: 8px;
}

/* ── Signatories ── */
.fba-signatory-block {
  display: flex;
  justify-content: flex-start;
  gap: 60px;
  margin-top: 20px;
  margin-bottom: 8px;
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
  border-top: 1px solid #333;
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
.cell-text {
  white-space: pre-wrap;
  word-break: break-word;
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
    font-size: 8px;
  }

  .fba-page {
    max-width: 100%;
    padding: 4mm 6mm 10mm;
    border: none;
    border-radius: 0;
    margin: 0;
  }

  .fba-page :deep(.report-header) {
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
  .fba-page :deep(.logo-csu) {
    height: 130px;
  }
  .fba-page :deep(.logo-right) {
    height: 110px;
  }

  .page-break-after {
    page-break-after: always;
  }

  .fba-table {
    font-size: 7.5px;
  }
  .fba-table th {
    font-size: 7px;
  }
  .fba-title {
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
