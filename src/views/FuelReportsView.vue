<template>
  <v-container fluid>
    <!-- Page Header -->
    <v-row class="mb-4 no-print">
      <v-col>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <h2 class="text-h5 font-weight-bold">Reports</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Billing summaries, vehicle consumption, balances, and payment tracking
            </p>
          </div>
          <!-- Print button only shown on Billing Summary tab -->
          <v-btn
            v-if="activeTab === 'billing' && billingPages.length > 0"
            variant="outlined"
            prepend-icon="mdi-printer"
            @click="printReport"
          >
            Print selected ({{ billingPages.length }} page{{
              billingPages.length !== 1 ? 's' : ''
            }})
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- ── TABS ── -->
    <v-tabs v-model="activeTab" class="mb-4 no-print" color="primary">
      <v-tab value="billing">
        <v-icon start>mdi-file-document-outline</v-icon>
        Billing summary
      </v-tab>
      <v-tab value="vehicle">
        <v-icon start>mdi-car</v-icon>
        Vehicle consumption
      </v-tab>
      <v-tab value="balance">
        <v-icon start>mdi-scale-balance</v-icon>
        Balance by cost center
      </v-tab>
      <v-tab value="dv">
        <v-icon start>mdi-cash-check</v-icon>
        Payment tracker (DV)
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <!-- ════════════════════════════════════════
           TAB 1: BILLING SUMMARY
           Matches the existing FuelSummaryReportView
           layout but integrated inside the Reports screen
      ════════════════════════════════════════ -->
      <v-tabs-window-item value="billing">
        <!-- Filters -->
        <v-card rounded="lg" elevation="0" border class="mb-4 no-print">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="3">
                <v-select
                  v-model="billing.selectedPeriod"
                  :items="billing.periodOptions"
                  label="Billing period"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  clearable
                  @update:modelValue="loadBillingData"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="billing.selectedFund"
                  :items="billing.fundOptions"
                  label="Fund cluster (optional)"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  clearable
                  @update:modelValue="loadBillingData"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="billing.selectedContractId"
                  :items="billing.contractOptions"
                  item-title="label"
                  item-value="id"
                  label="Contract / PO (optional)"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  clearable
                  @update:modelValue="loadBillingData"
                />
              </v-col>
              <v-col cols="12" sm="3" class="d-flex align-center ga-2">
                <v-progress-circular v-if="billing.loading" indeterminate size="24" width="2" />
                <span v-else-if="billingPages.length" class="text-caption text-medium-emphasis">
                  {{ billingPages.length }} page{{ billingPages.length !== 1 ? 's' : '' }} ·
                  {{ billingTotalRows }} rows · ₱{{ formatNumber(billingTotalAmount) }}
                </span>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Empty state -->
        <v-card
          v-if="!billingPages.length && !billing.loading"
          rounded="lg"
          elevation="0"
          border
          class="no-print"
        >
          <v-card-text class="text-center pa-12">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-gas-station-outline</v-icon>
            <p class="text-h6 text-medium-emphasis">
              Select a billing period to generate the summary
            </p>
          </v-card-text>
        </v-card>

        <!-- Pages list (screen view) -->
        <div v-if="billingPages.length" class="no-print">
          <div v-for="(page, pIdx) in billingPages" :key="pIdx" class="mb-4">
            <v-card rounded="lg" elevation="0" border>
              <!-- Page card header -->
              <div class="d-flex align-center justify-space-between pa-3 pb-2">
                <span class="text-body-2 font-weight-bold">
                  Page {{ pIdx + 1 }} &nbsp;·&nbsp;
                  <v-chip
                    size="x-small"
                    :color="fundColor(page.fundCluster)"
                    variant="tonal"
                    class="font-weight-bold"
                  >
                    {{ page.fundCluster }}
                  </v-chip>
                  &nbsp; {{ page.contractLabel }}
                </span>
                <v-btn
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-printer"
                  @click="printSinglePage(pIdx)"
                >
                  Print this page
                </v-btn>
              </div>
              <v-divider />
              <!-- Transactions table -->
              <v-table density="compact" class="text-caption">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>OR #</th>
                    <th>Diesel QTY</th>
                    <th>Gasoline QTY</th>
                    <th>Utilized by</th>
                    <th>Vehicle</th>
                    <th class="text-right">Total amount</th>
                    <th>Fuel charge to</th>
                    <th>PO #</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rIdx) in page.rows" :key="rIdx">
                    <td>{{ row.date }}</td>
                    <td>{{ row.or_number }}</td>
                    <td>{{ row.diesel_qty ? formatQty(row.diesel_qty) + ' LTRS' : '—' }}</td>
                    <td>{{ row.gasoline_qty ? formatQty(row.gasoline_qty) + ' LTRS' : '—' }}</td>
                    <td>{{ row.utilized_by }}</td>
                    <td>{{ row.vehicle }}</td>
                    <td class="text-right">₱{{ formatAmount(rowTotal(row)) }}</td>
                    <td class="text-caption text-medium-emphasis">{{ row.fuel_charge_to }}</td>
                    <td class="text-caption">{{ row.po_number }}</td>
                  </tr>
                </tbody>
              </v-table>
              <!-- Page totals footer -->
              <v-divider />
              <div class="d-flex ga-6 pa-3 text-caption">
                <span
                  >Diesel total: <strong>{{ formatQty(page.totalDieselQty) }} L</strong></span
                >
                <span
                  >Gasoline total: <strong>{{ formatQty(page.totalGasolineQty) }} L</strong></span
                >
                <span
                  >Total amount due: <strong>₱{{ formatAmount(page.totalAmount) }}</strong></span
                >
              </div>
            </v-card>
          </div>
        </div>

        <!-- DV hint -->
        <v-alert
          v-if="billingPages.length"
          type="info"
          variant="tonal"
          rounded="lg"
          class="mt-2 no-print"
        >
          Use the <strong>Payment Tracker (DV)</strong> tab to record Disbursement Voucher numbers,
          Check/ADA numbers, and payment status per billing period after the report is verified.
        </v-alert>
      </v-tabs-window-item>

      <!-- ════════════════════════════════════════
           TAB 2: VEHICLE CONSUMPTION REPORT
      ════════════════════════════════════════ -->
      <v-tabs-window-item value="vehicle">
        <!-- Filters -->
        <v-card rounded="lg" elevation="0" border class="mb-4">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="3">
                <v-select
                  v-model="vehicle.selectedYear"
                  :items="availableYears"
                  label="Fiscal year"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  @update:modelValue="loadVehicleData"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="vehicle.selectedType"
                  :items="['All', 'Vehicular', 'Non-Vehicular']"
                  label="Utilization type"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="vehicle.selectedFuel"
                  :items="['All Types', 'Diesel', 'Gasoline']"
                  label="Fuel type"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-progress-circular v-if="vehicle.loading" indeterminate size="24" width="2" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Vehicle consumption table -->
        <v-card rounded="lg" elevation="0" border>
          <v-data-table
            :headers="vehicleHeaders"
            :items="filteredVehicleRows"
            :loading="vehicle.loading"
            items-per-page="15"
          >
            <template #item.utilization_type="{ item }">
              <v-chip
                :color="item.utilization_type === 'Non-Vehicular' ? 'orange' : 'blue'"
                variant="tonal"
                size="x-small"
              >
                {{ item.utilization_type || 'Vehicular' }}
              </v-chip>
            </template>
            <template #item.total_diesel="{ item }">
              {{ item.total_diesel > 0 ? formatNumber(item.total_diesel) + ' L' : '—' }}
            </template>
            <template #item.total_gasoline="{ item }">
              {{ item.total_gasoline > 0 ? formatNumber(item.total_gasoline) + ' L' : '—' }}
            </template>
            <template #item.total_liters="{ item }">
              <span class="font-weight-bold">{{ formatNumber(item.total_liters) }} L</span>
            </template>
            <template #item.total_amount="{ item }">
              <span class="font-weight-medium">₱{{ formatNumber(item.total_amount) }}</span>
            </template>
            <template #no-data>
              <div class="pa-8 text-center text-medium-emphasis">
                No vehicle data found for FY {{ vehicle.selectedYear }}
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-tabs-window-item>

      <!-- ════════════════════════════════════════
           TAB 3: BALANCE BY COST CENTER
      ════════════════════════════════════════ -->
      <v-tabs-window-item value="balance">
        <!-- Filters -->
        <v-card rounded="lg" elevation="0" border class="mb-4">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="3">
                <v-select
                  v-model="balance.selectedYear"
                  :items="availableYears"
                  label="Fiscal year"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  @update:modelValue="loadBalanceData"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="balance.search"
                  prepend-inner-icon="mdi-magnify"
                  label="Search cost center..."
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="balance.filterFund"
                  :items="['All Funds', 'RAF', 'IGF', 'BRF', 'TRF']"
                  label="Fund cluster"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-progress-circular v-if="balance.loading" indeterminate size="24" width="2" />
                <span v-else class="text-caption text-medium-emphasis">
                  {{ filteredBalanceRows.length }} of {{ balance.rows.length }} contracts
                </span>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card rounded="lg" elevation="0" border>
          <v-data-table
            :headers="balanceHeaders"
            :items="filteredBalanceRows"
            :loading="balance.loading"
            items-per-page="20"
          >
            <template #item.fund_cluster="{ item }">
              <v-chip
                :color="fundColor(item.fund_cluster)"
                variant="tonal"
                size="small"
                class="font-weight-bold"
              >
                {{ item.fund_cluster }}
              </v-chip>
            </template>
            <template #item.contract_amount="{ item }">
              ₱{{ formatNumber(item.contract_amount) }}
            </template>
            <template #item.consumed_amount="{ item }">
              <span class="text-medium-emphasis">₱{{ formatNumber(item.consumed_amount) }}</span>
            </template>
            <template #item.balance="{ item }">
              <v-chip
                :color="
                  item.balance < 0
                    ? 'error'
                    : item.balance < item.contract_amount * 0.1
                      ? 'warning'
                      : 'success'
                "
                variant="tonal"
                size="small"
              >
                {{ item.balance < 0 ? '−' : '' }}₱{{ formatNumber(Math.abs(item.balance)) }}
                {{ item.balance < 0 ? '(over)' : '' }}
              </v-chip>
            </template>
            <template #item.remaining_diesel="{ item }">
              <span :class="item.remaining_diesel < 0 ? 'text-error font-weight-bold' : ''">
                {{ formatNumber(item.remaining_diesel) }} L
              </span>
            </template>
            <template #item.remaining_gasoline="{ item }">
              <span :class="item.remaining_gasoline < 0 ? 'text-error font-weight-bold' : ''">
                {{ formatNumber(item.remaining_gasoline) }} L
              </span>
            </template>
            <template #item.pct_used="{ item }">
              <div class="d-flex align-center ga-2">
                <v-progress-linear
                  :model-value="Math.min(item.pct_used, 100)"
                  :color="
                    item.pct_used > 100 ? 'error' : item.pct_used > 90 ? 'warning' : 'success'
                  "
                  rounded
                  height="6"
                  style="min-width: 60px"
                />
                <span class="text-caption" :class="item.pct_used > 100 ? 'text-error' : ''">
                  {{ item.pct_used.toFixed(1) }}%
                </span>
              </div>
            </template>
            <template #no-data>
              <div class="pa-8 text-center text-medium-emphasis">
                No contract data found for FY {{ balance.selectedYear }}
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-tabs-window-item>

      <!-- ════════════════════════════════════════
           TAB 4: PAYMENT TRACKER (DV)
      ════════════════════════════════════════ -->
      <v-tabs-window-item value="dv">
        <!-- Filters + Add DV button -->
        <v-card rounded="lg" elevation="0" border class="mb-4">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="3">
                <v-select
                  v-model="dv.selectedYear"
                  :items="availableYears"
                  label="Fiscal year"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  @update:modelValue="loadDVData"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="dv.filterStatus"
                  :items="['All', 'Unpaid', 'Partial', 'Paid']"
                  label="Payment status"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-progress-circular v-if="dv.loading" indeterminate size="24" width="2" />
              </v-col>
              <v-col cols="12" sm="3" class="d-flex justify-end">
                <v-btn color="primary" prepend-icon="mdi-plus" @click="openDVDialog()">
                  Add DV Record
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card rounded="lg" elevation="0" border>
          <v-data-table
            :headers="dvHeaders"
            :items="filteredDVRows"
            :loading="dv.loading"
            items-per-page="15"
          >
            <template #item.fund_cluster="{ item }">
              <v-chip
                :color="fundColor(item.fund_cluster)"
                variant="tonal"
                size="small"
                class="font-weight-bold"
              >
                {{ item.fund_cluster }}
              </v-chip>
            </template>
            <template #item.total_amount="{ item }">
              ₱{{ formatNumber(item.total_amount) }}
            </template>
            <template #item.total_net_amount="{ item }">
              {{ item.total_net_amount ? '₱' + formatNumber(item.total_net_amount) : '—' }}
            </template>
            <template #item.payment_status="{ item }">
              <v-chip
                :color="
                  item.payment_status === 'Paid'
                    ? 'success'
                    : item.payment_status === 'Partial'
                      ? 'warning'
                      : 'error'
                "
                variant="tonal"
                size="small"
              >
                {{ item.payment_status }}
              </v-chip>
            </template>
            <template #item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                size="x-small"
                variant="text"
                color="primary"
                @click="openDVDialog(item)"
              />
            </template>
            <template #no-data>
              <div class="pa-8 text-center">
                <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-cash-check</v-icon>
                <p class="text-medium-emphasis">No DV records yet for FY {{ dv.selectedYear }}</p>
                <v-btn color="primary" class="mt-3" @click="openDVDialog()"
                  >Add First DV Record</v-btn
                >
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- ── ADD / EDIT DV DIALOG ── -->
    <v-dialog v-model="dv.formDialog" max-width="600" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">
          <v-icon start :color="dv.isEditing ? 'primary' : 'success'">
            {{ dv.isEditing ? 'mdi-pencil' : 'mdi-plus-circle' }}
          </v-icon>
          {{ dv.isEditing ? 'Edit DV Record' : 'Add DV Record' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="dv.form.year"
                label="Year *"
                type="number"
                variant="outlined"
                density="comfortable"
                :error-messages="dv.errors.year"
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-combobox
                v-model="dv.form.billing_period"
                :items="billing.periodOptions"
                label="Billing Period *"
                variant="outlined"
                density="comfortable"
                :error-messages="dv.errors.billing_period"
                placeholder="e.g. JANUARY 1-15, 2025"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="dv.form.fund_cluster"
                :items="['RAF', 'IGF', 'BRF', 'TRF']"
                label="Fund Cluster *"
                variant="outlined"
                density="comfortable"
                :error-messages="dv.errors.fund_cluster"
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="dv.form.po_number"
                label="PO Number *"
                variant="outlined"
                density="comfortable"
                :error-messages="dv.errors.po_number"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="dv.form.total_amount_display"
                label="Total Billed Amount *"
                variant="outlined"
                density="comfortable"
                prefix="₱"
                :error-messages="dv.errors.total_amount"
                @input="onDVAmountInput"
                @blur="onDVAmountBlur"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="dv.form.payment_status"
                :items="['Unpaid', 'Partial', 'Paid']"
                label="Payment Status"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="dv.form.dv_number"
                label="DV Number"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 2025-01-0042"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="dv.form.check_ada_number"
                label="Check / ADA Number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="dv.form.date_advised"
                label="Date Advised"
                variant="outlined"
                density="comfortable"
                type="date"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="dv.form.total_net_amount_display"
                label="Total Net Amount Paid"
                variant="outlined"
                density="comfortable"
                prefix="₱"
                @input="onDVNetAmountInput"
                @blur="onDVNetAmountBlur"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="dv.form.remarks"
                label="Remarks"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="dv.formDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="dv.saving" @click="saveDV">
            {{ dv.isEditing ? 'Save Changes' : 'Add Record' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom right"
      :timeout="3000"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../supabase'

// ── STATE ──
const activeTab = ref('billing')
const availableYears = ref([new Date().getFullYear()])
const snackbar = ref({ show: false, message: '', color: 'success' })

// ── TAB 1: BILLING SUMMARY ──
const billing = ref({
  loading: false,
  selectedPeriod: null,
  selectedFund: null,
  selectedContractId: null,
  periodOptions: [],
  fundOptions: [],
  contractOptions: [],
})
const billingPages = ref([])

const billingTotalRows = computed(() => billingPages.value.reduce((s, p) => s + p.rows.length, 0))
const billingTotalAmount = computed(() => billingPages.value.reduce((s, p) => s + p.totalAmount, 0))

// ── TAB 2: VEHICLE CONSUMPTION ──
const vehicle = ref({
  loading: false,
  selectedYear: new Date().getFullYear(),
  selectedType: 'All',
  selectedFuel: 'All Types',
  rows: [],
})

const vehicleHeaders = [
  { title: 'Vehicle / Equipment', key: 'vehicle' },
  { title: 'Type', key: 'utilization_type', width: '140px' },
  { title: 'Withdrawals', key: 'withdrawal_count', align: 'end', width: '110px' },
  { title: 'Diesel (L)', key: 'total_diesel', align: 'end', width: '110px' },
  { title: 'Gasoline (L)', key: 'total_gasoline', align: 'end', width: '110px' },
  { title: 'Total (L)', key: 'total_liters', align: 'end', width: '100px' },
  { title: 'Total Amount', key: 'total_amount', align: 'end', width: '130px' },
]

const filteredVehicleRows = computed(() => {
  return vehicle.value.rows.filter((r) => {
    const matchType =
      vehicle.value.selectedType === 'All' ||
      (vehicle.value.selectedType === 'Non-Vehicular' && r.utilization_type === 'Non-Vehicular') ||
      (vehicle.value.selectedType === 'Vehicular' && r.utilization_type !== 'Non-Vehicular')
    const matchFuel =
      vehicle.value.selectedFuel === 'All Types' ||
      (vehicle.value.selectedFuel === 'Diesel' && r.total_diesel > 0) ||
      (vehicle.value.selectedFuel === 'Gasoline' && r.total_gasoline > 0)
    return matchType && matchFuel
  })
})

// ── TAB 3: BALANCE BY COST CENTER ──
const balance = ref({
  loading: false,
  selectedYear: new Date().getFullYear(),
  search: '',
  filterFund: 'All Funds',
  rows: [],
})

const balanceHeaders = [
  { title: 'Fund', key: 'fund_cluster', width: '80px' },
  { title: 'PO Number', key: 'po_number', width: '140px' },
  { title: 'Account Code / Cost Center', key: 'account_code' },
  { title: 'Center Head', key: 'cost_center_head' },
  { title: 'Contract Amt.', key: 'contract_amount', align: 'end' },
  { title: 'Consumed', key: 'consumed_amount', align: 'end' },
  { title: 'Balance', key: 'balance', align: 'center' },
  { title: 'Rem. Diesel', key: 'remaining_diesel', align: 'end' },
  { title: 'Rem. Gasoline', key: 'remaining_gasoline', align: 'end' },
  { title: '% Used', key: 'pct_used', width: '140px' },
]

const filteredBalanceRows = computed(() => {
  return balance.value.rows.filter((r) => {
    const matchSearch =
      !balance.value.search ||
      [r.account_code, r.cost_center_head, r.po_number].some((f) =>
        f?.toLowerCase().includes(balance.value.search.toLowerCase()),
      )
    const matchFund =
      balance.value.filterFund === 'All Funds' || r.fund_cluster === balance.value.filterFund
    return matchSearch && matchFund
  })
})

// ── TAB 4: PAYMENT TRACKER (DV) ──
const dv = ref({
  loading: false,
  saving: false,
  selectedYear: new Date().getFullYear(),
  filterStatus: 'All',
  rows: [],
  formDialog: false,
  isEditing: false,
  selectedDV: null,
  errors: {},
  form: {
    year: new Date().getFullYear(),
    billing_period: '',
    fund_cluster: '',
    po_number: '',
    total_amount: 0,
    total_amount_display: '',
    dv_number: '',
    check_ada_number: '',
    date_advised: '',
    total_net_amount: 0,
    total_net_amount_display: '',
    payment_status: 'Unpaid',
    remarks: '',
  },
})

const dvHeaders = [
  { title: 'Year', key: 'year', width: '70px' },
  { title: 'Billing Period', key: 'billing_period' },
  { title: 'Fund', key: 'fund_cluster', width: '80px' },
  { title: 'PO Number', key: 'po_number', width: '140px' },
  { title: 'Billed Amount', key: 'total_amount', align: 'end' },
  { title: 'DV Number', key: 'dv_number' },
  { title: 'Check / ADA', key: 'check_ada_number' },
  { title: 'Date Advised', key: 'date_advised', width: '110px' },
  { title: 'Net Amount', key: 'total_net_amount', align: 'end' },
  { title: 'Status', key: 'payment_status', width: '100px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: '80px' },
]

const filteredDVRows = computed(() => {
  if (dv.value.filterStatus === 'All') return dv.value.rows
  return dv.value.rows.filter((r) => r.payment_status === dv.value.filterStatus)
})

// ── FETCH: Available years ──
async function loadAvailableYears() {
  const { data } = await supabase.from('fuel_contracts').select('year').order('year')
  if (data) {
    const years = [...new Set(data.map((r) => r.year))]
    availableYears.value = years.length > 0 ? years : [new Date().getFullYear()]
  }
}

// ── FETCH: Billing tab options ──
async function loadBillingOptions() {
  const { data: bpData } = await supabase
    .from('fuel_transactions')
    .select('billing_period')
    .not('billing_period', 'is', null)
    .order('billing_period', { ascending: false })

  billing.value.periodOptions = [
    ...new Set((bpData || []).map((r) => r.billing_period).filter(Boolean)),
  ]

  const { data: fcData } = await supabase
    .from('fuel_transactions')
    .select('fund_cluster')
    .not('fund_cluster', 'is', null)
    .order('fund_cluster')

  billing.value.fundOptions = [
    ...new Set((fcData || []).map((r) => r.fund_cluster).filter(Boolean)),
  ]

  const { data: cData } = await supabase
    .from('fuel_contracts')
    .select('id, year, po_number, fund_cluster, account_code')
    .order('year', { ascending: false })

  billing.value.contractOptions = (cData || []).map((c) => ({
    id: c.id,
    label: `${c.year} — ${c.fund_cluster} — ${c.account_code}`,
  }))
}

// ── FETCH: Billing summary data ──
async function loadBillingData() {
  if (!billing.value.selectedPeriod) {
    billingPages.value = []
    return
  }
  billing.value.loading = true

  let query = supabase
    .from('fuel_transactions')
    .select('*')
    .eq('billing_period', billing.value.selectedPeriod)
    .order('fund_cluster')
    .order('date')

  if (billing.value.selectedFund) query = query.eq('fund_cluster', billing.value.selectedFund)
  if (billing.value.selectedContractId)
    query = query.eq('contract_id', billing.value.selectedContractId)

  const { data } = await query
  billing.value.loading = false

  if (!data) {
    billingPages.value = []
    return
  }

  // Group by fund_cluster → one page per cluster
  const grouped = {}
  data.forEach((tx) => {
    const fc = tx.fund_cluster || 'UNSPECIFIED'
    if (!grouped[fc]) grouped[fc] = []
    grouped[fc].push(tx)
  })

  billingPages.value = Object.entries(grouped).map(([fundCluster, txList]) => {
    const rowMap = {}
    txList.forEach((tx) => {
      const key = tx.or_number || tx.id
      if (!rowMap[key]) {
        rowMap[key] = {
          date: formatDate(tx.date),
          or_number: tx.or_number || '',
          diesel_qty: null,
          diesel_unit_price: null,
          gasoline_qty: null,
          gasoline_unit_price: null,
          utilized_by: tx.utilized_by || '',
          vehicle: tx.vehicle || '',
          fuel_charge_to: tx.account_code || tx.fund_cluster || '',
          po_number: tx.po_number || '',
          _sortDate: tx.date,
        }
      }
      if ((tx.fuel_type || '').toLowerCase() === 'gasoline') {
        rowMap[key].gasoline_qty = tx.quantity
        rowMap[key].gasoline_unit_price = tx.unit_price
      } else {
        rowMap[key].diesel_qty = tx.quantity
        rowMap[key].diesel_unit_price = tx.unit_price
      }
      if (tx.utilized_by) rowMap[key].utilized_by = tx.utilized_by
      if (tx.vehicle) rowMap[key].vehicle = tx.vehicle
    })

    const rows = Object.values(rowMap).sort((a, b) => (a._sortDate > b._sortDate ? 1 : -1))

    // Only show fuel_charge_to on the first row of each unique value (matches Excel format)
    let lastCharge = null
    rows.forEach((r) => {
      if (r.fuel_charge_to === lastCharge) r.fuel_charge_to = ''
      else lastCharge = r.fuel_charge_to
    })

    const totalDieselQty = rows.reduce((s, r) => s + (Number(r.diesel_qty) || 0), 0)
    const totalGasolineQty = rows.reduce((s, r) => s + (Number(r.gasoline_qty) || 0), 0)
    const totalAmount = rows.reduce((s, r) => s + rowTotal(r), 0)

    // Get contract label from the first transaction in this group
    const firstTx = txList[0]
    const contractLabel = firstTx?.account_code || firstTx?.po_number || ''

    return { fundCluster, contractLabel, rows, totalDieselQty, totalGasolineQty, totalAmount }
  })
}

// ── FETCH: Vehicle consumption data ──
async function loadVehicleData() {
  vehicle.value.loading = true
  const year = vehicle.value.selectedYear
  const { data } = await supabase
    .from('fuel_transactions')
    .select('vehicle, fuel_type, quantity, total_amount, utilization_type')
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)

  vehicle.value.loading = false

  if (!data) {
    vehicle.value.rows = []
    return
  }

  // Group by vehicle name
  const map = new Map()
  data.forEach((t) => {
    const name = t.vehicle || 'Unknown'
    if (!map.has(name)) {
      map.set(name, {
        vehicle: name,
        utilization_type: t.utilization_type || 'Vehicular',
        withdrawal_count: 0,
        total_diesel: 0,
        total_gasoline: 0,
        total_liters: 0,
        total_amount: 0,
      })
    }
    const row = map.get(name)
    row.withdrawal_count++
    row.total_amount += t.total_amount || 0
    if (t.fuel_type === 'Diesel') row.total_diesel += t.quantity || 0
    else if (t.fuel_type === 'Gasoline') row.total_gasoline += t.quantity || 0
    row.total_liters = row.total_diesel + row.total_gasoline
    // Keep the most recently seen utilization_type
    if (t.utilization_type) row.utilization_type = t.utilization_type
  })

  vehicle.value.rows = [...map.values()].sort((a, b) => b.total_liters - a.total_liters)
}

// ── FETCH: Balance data (uses the fuel_contract_balances view) ──
async function loadBalanceData() {
  balance.value.loading = true
  const { data, error } = await supabase
    .from('fuel_contract_balances')
    .select('*')
    .eq('year', balance.value.selectedYear)
    .order('fund_cluster')
    .order('account_code')

  balance.value.loading = false

  if (error || !data) {
    balance.value.rows = []
    return
  }

  // Add pct_used field for the progress bar column
  balance.value.rows = data.map((r) => ({
    ...r,
    pct_used: r.contract_amount > 0 ? (r.consumed_amount / r.contract_amount) * 100 : 0,
  }))
}

// ── FETCH: DV records ──
async function loadDVData() {
  dv.value.loading = true
  const { data } = await supabase
    .from('disbursement_vouchers')
    .select('*')
    .eq('year', dv.value.selectedYear)
    .order('billing_period')
    .order('fund_cluster')

  dv.value.rows = data || []
  dv.value.loading = false
}

// ── DV DIALOG ──
const dvDefaultForm = {
  year: new Date().getFullYear(),
  billing_period: '',
  fund_cluster: '',
  po_number: '',
  total_amount: 0,
  total_amount_display: '',
  dv_number: '',
  check_ada_number: '',
  date_advised: '',
  total_net_amount: 0,
  total_net_amount_display: '',
  payment_status: 'Unpaid',
  remarks: '',
}

function openDVDialog(record = null) {
  dv.value.isEditing = !!record
  dv.value.selectedDV = record
  dv.value.errors = {}
  if (record) {
    dv.value.form = {
      ...record,
      total_amount_display: formatNumber(record.total_amount),
      total_net_amount_display: record.total_net_amount
        ? formatNumber(record.total_net_amount)
        : '',
    }
  } else {
    dv.value.form = { ...dvDefaultForm, year: dv.value.selectedYear }
  }
  dv.value.formDialog = true
}

function validateDVForm() {
  dv.value.errors = {}
  if (!dv.value.form.year) dv.value.errors.year = 'Required'
  if (!dv.value.form.billing_period?.trim()) dv.value.errors.billing_period = 'Required'
  if (!dv.value.form.fund_cluster) dv.value.errors.fund_cluster = 'Required'
  if (!dv.value.form.po_number?.trim()) dv.value.errors.po_number = 'Required'
  if (!dv.value.form.total_amount || dv.value.form.total_amount <= 0)
    dv.value.errors.total_amount = 'Must be greater than 0'
  return Object.keys(dv.value.errors).length === 0
}

async function saveDV() {
  if (!validateDVForm()) return
  dv.value.saving = true
  const payload = {
    year: Number(dv.value.form.year),
    billing_period: dv.value.form.billing_period,
    fund_cluster: dv.value.form.fund_cluster,
    po_number: dv.value.form.po_number,
    total_amount: dv.value.form.total_amount || 0,
    dv_number: dv.value.form.dv_number || '',
    check_ada_number: dv.value.form.check_ada_number || '',
    date_advised: dv.value.form.date_advised || null,
    total_net_amount: dv.value.form.total_net_amount || 0,
    payment_status: dv.value.form.payment_status || 'Unpaid',
    remarks: dv.value.form.remarks || '',
  }
  let error
  if (dv.value.isEditing) {
    ;({ error } = await supabase
      .from('disbursement_vouchers')
      .update(payload)
      .eq('id', dv.value.selectedDV.id))
  } else {
    ;({ error } = await supabase.from('disbursement_vouchers').insert(payload))
  }
  if (error) showSnackbar('Failed to save DV record', 'error')
  else {
    showSnackbar(dv.value.isEditing ? 'DV record updated' : 'DV record added', 'success')
    dv.value.formDialog = false
    await loadDVData()
  }
  dv.value.saving = false
}

// Amount input handlers for DV form
function onDVAmountInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') dv.value.form.total_amount = Number(raw)
}
function onDVAmountBlur() {
  dv.value.form.total_amount_display = dv.value.form.total_amount
    ? formatNumber(dv.value.form.total_amount)
    : ''
}
function onDVNetAmountInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') dv.value.form.total_net_amount = Number(raw)
}
function onDVNetAmountBlur() {
  dv.value.form.total_net_amount_display = dv.value.form.total_net_amount
    ? formatNumber(dv.value.form.total_net_amount)
    : ''
}

// ── PRINT ──
function printReport() {
  setTimeout(() => window.print(), 100)
}

function printSinglePage(pageIndex) {
  // Store which page to print, hide others, print, restore
  const allPages = document.querySelectorAll('.billing-page-card')
  allPages.forEach((el, i) => {
    if (i !== pageIndex) el.style.display = 'none'
  })
  window.print()
  allPages.forEach((el) => {
    el.style.display = ''
  })
}

// ── HELPERS ──
function rowTotal(row) {
  const d = (Number(row.diesel_qty) || 0) * (Number(row.diesel_unit_price) || 0)
  const g = (Number(row.gasoline_qty) || 0) * (Number(row.gasoline_unit_price) || 0)
  return d + g
}
function formatQty(val) {
  if (!val && val !== 0) return ''
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatAmount(val) {
  if (!val && val !== 0) return ''
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '0'
  return Number(val).toLocaleString('en-PH', { maximumFractionDigits: 2 })
}
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}
function fundColor(fund) {
  const map = { RAF: 'blue', IGF: 'green', BRF: 'orange', TRF: 'purple' }
  if (map[fund]) return map[fund]
  const colors = ['teal', 'pink', 'indigo', 'cyan', 'deep-orange']
  let hash = 0
  for (let i = 0; i < (fund?.length || 0); i++) hash += fund.charCodeAt(i)
  return colors[hash % colors.length]
}
function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// Watch tab changes to lazy-load data for each tab
watch(activeTab, (tab) => {
  if (tab === 'vehicle' && vehicle.value.rows.length === 0) loadVehicleData()
  if (tab === 'balance' && balance.value.rows.length === 0) loadBalanceData()
  if (tab === 'dv' && dv.value.rows.length === 0) loadDVData()
})

onMounted(async () => {
  await loadAvailableYears()
  await loadBillingOptions()
})
</script>
