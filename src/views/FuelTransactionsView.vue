<template>
  <v-container fluid>
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <h2 class="text-h5 font-weight-bold">Fuel Transactions</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Encode fuel withdrawals from hard copy Petron invoices
            </p>
          </div>
          <div class="d-flex ga-2 flex-wrap align-center">
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
              Add Transaction
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row class="mb-4">
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="44">
              <v-icon>mdi-receipt-text</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Transactions</p>
              <p class="text-h5 font-weight-bold">{{ transactions.length }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="blue-darken-2" variant="tonal" size="44">
              <v-icon>mdi-fuel</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Diesel (L)</p>
              <p class="text-h5 font-weight-bold">{{ formatNumber(totalDiesel) }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="green-darken-2" variant="tonal" size="44">
              <v-icon>mdi-gas-station</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Gasoline (L)</p>
              <p class="text-h5 font-weight-bold">{{ formatNumber(totalGasoline) }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="orange-darken-2" variant="tonal" size="44">
              <v-icon>mdi-cash-multiple</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Amount</p>
              <p class="text-h5 font-weight-bold">₱{{ formatNumber(totalAmount) }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card rounded="lg" elevation="0" border class="mb-4 pa-3">
      <div class="d-flex ga-3 flex-wrap align-center">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search OR#, vehicle, utilized by..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="min-width: 260px"
        />
        <v-select
          v-model="filterYear"
          :items="availableYears"
          label="Year"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 100px"
          @update:modelValue="fetchTransactions"
        />
        <v-select
          v-model="filterPeriod"
          :items="['All Periods', ...billingPeriods]"
          label="Billing Period"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 200px"
        />
        <v-select
          v-model="filterFuel"
          :items="['All Types', 'Diesel', 'Gasoline']"
          label="Fuel Type"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 130px"
        />
        <v-select
          v-model="filterFund"
          :items="['All Funds', ...availableFunds]"
          label="Fund"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 120px"
        />
        <v-spacer />
        <p class="text-medium-emphasis text-body-2 text-no-wrap">
          {{ filteredTransactions.length }} of {{ transactions.length }}
        </p>
      </div>
    </v-card>

    <!-- Vehicle Quick Lookup -->
    <v-card rounded="lg" elevation="0" border class="mb-4">
      <v-card-title class="pa-3 pb-0">
        <v-icon start color="primary" size="18">mdi-car-search</v-icon>
        <span class="text-body-1 font-weight-bold">Vehicle / Equipment Quick Lookup</span>
      </v-card-title>
      <v-card-text class="pa-3">
        <div class="d-flex ga-3 flex-wrap align-center mb-3">
          <v-select
            v-model="lookupYear"
            :items="availableYears"
            label="Year"
            variant="outlined"
            density="compact"
            hide-details
            style="min-width: 100px"
          />
          <v-text-field
            v-model="lookupSearch"
            prepend-inner-icon="mdi-magnify"
            label="Search vehicle or equipment..."
            variant="outlined"
            density="compact"
            hide-details
            clearable
            style="min-width: 240px"
          />
        </div>
        <div v-if="vehicleSummary.length === 0" class="text-medium-emphasis text-body-2 pa-2">
          No data found.
        </div>
        <v-table v-else density="compact" class="lookup-table">
          <thead>
            <tr>
              <th>Vehicle / Equipment</th>
              <th class="text-center">Withdrawals</th>
              <th class="text-center">Diesel (L)</th>
              <th class="text-center">Gasoline (L)</th>
              <th class="text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in filteredVehicleSummary" :key="v.name">
              <td>
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" :color="v.is_vehicle ? 'primary' : 'orange'">
                    {{ v.is_vehicle ? 'mdi-car' : 'mdi-cog' }}
                  </v-icon>
                  {{ v.name }}
                </div>
              </td>
              <td class="text-center">{{ v.count }}</td>
              <td class="text-center">
                <span v-if="v.diesel > 0" class="text-blue-darken-2 font-weight-medium">
                  {{ formatNumber(v.diesel) }}
                </span>
                <span v-else class="text-medium-emphasis">—</span>
              </td>
              <td class="text-center">
                <span v-if="v.gasoline > 0" class="text-green-darken-2 font-weight-medium">
                  {{ formatNumber(v.gasoline) }}
                </span>
                <span v-else class="text-medium-emphasis">—</span>
              </td>
              <td class="text-right font-weight-medium">₱{{ formatNumber(v.amount) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Transactions Table -->
    <v-card rounded="lg" elevation="0" border>
      <v-data-table
        :headers="headers"
        :items="filteredTransactions"
        :loading="loading"
        items-per-page="15"
      >
        <!-- Date -->
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <!-- Fuel Type chip -->
        <template #item.fuel_type="{ item }">
          <v-chip
            :color="item.fuel_type === 'Diesel' ? 'blue-darken-2' : 'green-darken-2'"
            variant="tonal"
            size="small"
            class="font-weight-bold"
          >
            {{ item.fuel_type }}
          </v-chip>
        </template>

        <!-- Quantity -->
        <template #item.quantity="{ item }"> {{ formatNumber(item.quantity) }} L </template>

        <!-- Unit Price -->
        <template #item.unit_price="{ item }"> ₱{{ formatNumber(item.unit_price) }} </template>

        <!-- Total Amount -->
        <template #item.total_amount="{ item }">
          <span class="font-weight-medium">₱{{ formatNumber(item.total_amount) }}</span>
        </template>

        <!-- Fund -->
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

        <!-- Billing Period -->
        <template #item.billing_period="{ item }">
          <span class="text-caption">{{ item.billing_period }}</span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="x-small"
            variant="text"
            color="info"
            @click="openViewDialog(item)"
          />
          <v-btn
            icon="mdi-pencil"
            size="x-small"
            variant="text"
            color="primary"
            @click="openEditDialog(item)"
          />
          <v-btn
            icon="mdi-delete"
            size="x-small"
            variant="text"
            color="error"
            @click="openDeleteDialog(item)"
          />
        </template>

        <template #no-data>
          <div class="pa-8 text-center">
            <v-icon size="56" color="grey-lighten-1">mdi-receipt-text-outline</v-icon>
            <p class="mt-3 text-medium-emphasis">No transactions found.</p>
            <v-btn color="primary" class="mt-3" @click="openAddDialog">
              Add First Transaction
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- ── ADD / EDIT DIALOG ── -->
    <v-dialog v-model="formDialog" max-width="720" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">
          <v-icon start :color="isEditing ? 'primary' : 'success'">
            {{ isEditing ? 'mdi-pencil' : 'mdi-plus-circle' }}
          </v-icon>
          {{ isEditing ? 'Edit Transaction' : 'Add Transaction' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row>
            <!-- Date -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.date_display"
                label="Date *"
                variant="outlined"
                density="comfortable"
                placeholder="MM/DD/YY"
                :error-messages="errors.date"
                @blur="onDateBlur"
              />
            </v-col>
            <!-- OR Number -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.or_number"
                label="OR Number *"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 30221"
                :error-messages="errors.or_number"
              />
            </v-col>
            <!-- Billing Period (auto) -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.billing_period"
                label="Billing Period"
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
                hint="Auto-detected from date"
                persistent-hint
              />
            </v-col>

            <!-- Fuel Type -->
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.fuel_type"
                :items="['Diesel', 'Gasoline']"
                label="Fuel Type *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.fuel_type"
              />
            </v-col>
            <!-- Quantity -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.quantity_display"
                label="Quantity (Liters) *"
                variant="outlined"
                density="comfortable"
                suffix="L"
                :error-messages="errors.quantity"
                @input="onQuantityInput"
                @blur="onQuantityBlur"
              />
            </v-col>
            <!-- Unit -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.unit"
                label="Unit"
                variant="outlined"
                density="comfortable"
                placeholder="LTRS."
              />
            </v-col>

            <!-- Unit Price -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.unit_price_display"
                label="Unit Price (₱/L) *"
                variant="outlined"
                density="comfortable"
                prefix="₱"
                :error-messages="errors.unit_price"
                @input="onUnitPriceInput"
                @blur="onUnitPriceBlur"
              />
            </v-col>
            <!-- Total Amount (auto) -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.total_amount_display"
                label="Total Amount"
                variant="outlined"
                density="comfortable"
                prefix="₱"
                readonly
                bg-color="grey-lighten-4"
                hint="Auto-computed (Qty × Unit Price)"
                persistent-hint
              />
            </v-col>

            <v-col cols="12">
              <v-divider class="mb-1" />
              <p class="text-body-2 font-weight-medium text-medium-emphasis my-2">
                <v-icon size="16" class="mr-1">mdi-car</v-icon>
                Usage Details
              </p>
            </v-col>

            <!-- Vehicle / Equipment -->
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.vehicle"
                :items="vehicleOptions"
                label="Vehicle / Equipment *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.vehicle"
                placeholder="e.g. COASTER, FORTUNER, FARMALL"
              />
            </v-col>
            <!-- Utilized By -->
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.utilized_by"
                :items="utilizedByOptions"
                label="Utilized By *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.utilized_by"
                placeholder="e.g. HRMO, ECO, CAA"
              />
            </v-col>

            <v-col cols="12">
              <v-divider class="mb-1" />
              <p class="text-body-2 font-weight-medium text-medium-emphasis my-2">
                <v-icon size="16" class="mr-1">mdi-file-document</v-icon>
                Charge To
              </p>
            </v-col>

            <!-- Fund Cluster (filter) -->
            <v-col cols="12" sm="3">
              <v-select
                v-model="form.fund_cluster"
                :items="['', ...availableFunds]"
                label="Fund Cluster"
                variant="outlined"
                density="comfortable"
                clearable
                @update:modelValue="onFundChange"
              />
            </v-col>
            <!-- Contract dropdown -->
            <v-col cols="12" sm="9">
              <v-select
                v-model="form.contract_id"
                :items="filteredContractOptions"
                item-title="label"
                item-value="id"
                label="Charge To (Cost Center / PO) *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.contract_id"
                :disabled="filteredContractOptions.length === 0"
                @update:modelValue="onContractSelected"
              />
            </v-col>

            <!-- PO Number (readonly, auto-filled) -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.po_number"
                label="PO Number"
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
              />
            </v-col>
            <!-- Remarks -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.remarks"
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
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveTransaction">
            {{ isEditing ? 'Save Changes' : 'Add Transaction' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── VIEW DIALOG ── -->
    <v-dialog v-model="viewDialog" max-width="560">
      <v-card rounded="lg" v-if="selectedTx">
        <v-card-title class="pa-4 pb-2 d-flex align-center justify-space-between">
          <span>Transaction Details</span>
          <v-chip
            :color="selectedTx.fuel_type === 'Diesel' ? 'blue-darken-2' : 'green-darken-2'"
            variant="tonal"
            size="small"
            class="font-weight-bold"
          >
            {{ selectedTx.fuel_type }}
          </v-chip>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <!-- Invoice Info -->
          <v-card rounded="lg" variant="tonal" color="grey" class="pa-3 mb-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">INVOICE</p>
            <v-row dense>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Date</p>
                <p class="font-weight-medium">{{ formatDate(selectedTx.date) }}</p>
              </v-col>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">OR Number</p>
                <p class="font-weight-medium">{{ selectedTx.or_number }}</p>
              </v-col>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Billing Period</p>
                <p class="font-weight-medium text-caption">{{ selectedTx.billing_period }}</p>
              </v-col>
            </v-row>
          </v-card>
          <!-- Fuel Info -->
          <v-card rounded="lg" variant="tonal" color="blue" class="pa-3 mb-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">FUEL</p>
            <v-row dense>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Quantity</p>
                <p class="font-weight-bold">{{ formatNumber(selectedTx.quantity) }} L</p>
              </v-col>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Unit Price</p>
                <p class="font-weight-medium">₱{{ formatNumber(selectedTx.unit_price) }}</p>
              </v-col>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Total Amount</p>
                <p class="font-weight-bold text-orange-darken-3">
                  ₱{{ formatNumber(selectedTx.total_amount) }}
                </p>
              </v-col>
            </v-row>
          </v-card>
          <!-- Usage Info -->
          <v-card rounded="lg" variant="tonal" color="green" class="pa-3 mb-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">USAGE</p>
            <v-row dense>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Vehicle / Equipment</p>
                <p class="font-weight-medium">{{ selectedTx.vehicle }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Utilized By</p>
                <p class="font-weight-medium">{{ selectedTx.utilized_by }}</p>
              </v-col>
            </v-row>
          </v-card>
          <!-- Charge Info -->
          <v-card rounded="lg" variant="tonal" color="orange" class="pa-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">CHARGED TO</p>
            <v-row dense>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Fund</p>
                <v-chip
                  :color="fundColor(selectedTx.fund_cluster)"
                  variant="tonal"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ selectedTx.fund_cluster }}
                </v-chip>
              </v-col>
              <v-col cols="8">
                <p class="text-caption text-medium-emphasis">PO Number</p>
                <p class="font-weight-medium">{{ selectedTx.po_number }}</p>
              </v-col>
              <v-col cols="12" class="mt-1">
                <p class="text-caption text-medium-emphasis">Account Code</p>
                <p class="font-weight-medium">{{ selectedTx.account_code }}</p>
              </v-col>
            </v-row>
          </v-card>
          <div v-if="selectedTx.remarks" class="mt-3">
            <p class="text-caption text-medium-emphasis">Remarks</p>
            <p class="text-body-2">{{ selectedTx.remarks }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="viewDialog = false">Close</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="
              () => {
                viewDialog = false
                openEditDialog(selectedTx)
              }
            "
          >
            Edit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── DELETE DIALOG ── -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-5 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete Transaction?</h3>
          <p class="text-medium-emphasis">
            Delete OR# <strong>{{ selectedTx?.or_number }}</strong
            >? This cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteTx">Delete</v-btn>
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
const transactions = ref([])
const contracts = ref([])
const assets = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const filterYear = ref(new Date().getFullYear())
const availableYears = ref([new Date().getFullYear()])
const search = ref('')
const filterPeriod = ref('All Periods')
const filterFuel = ref('All Types')
const filterFund = ref('All Funds')
const lookupSearch = ref('')
const lookupYear = ref(new Date().getFullYear())

// ── DIALOGS ──
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedTx = ref(null)

// ── FORM ──
const defaultForm = {
  date: '',
  date_display: '',
  or_number: '',
  billing_period: '',
  fuel_type: 'Diesel',
  quantity: 0,
  quantity_display: '',
  unit: 'LTRS.',
  unit_price: 0,
  unit_price_display: '',
  total_amount: 0,
  total_amount_display: '',
  vehicle: '',
  utilized_by: '',
  fund_cluster: '',
  contract_id: null,
  po_number: '',
  account_code: '',
  remarks: '',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ── SNACKBAR ──
const snackbar = ref({ show: false, message: '', color: 'success' })

// ── TABLE HEADERS ──
const headers = [
  { title: 'Date', key: 'date', width: '100px' },
  { title: 'OR #', key: 'or_number', width: '90px' },
  { title: 'Billing Period', key: 'billing_period', width: '160px' },
  { title: 'Type', key: 'fuel_type', width: '90px' },
  { title: 'Qty (L)', key: 'quantity', align: 'end', width: '90px' },
  { title: 'Unit Price', key: 'unit_price', align: 'end', width: '100px' },
  { title: 'Total Amt.', key: 'total_amount', align: 'end', width: '110px' },
  { title: 'Vehicle / Equip.', key: 'vehicle' },
  { title: 'Utilized By', key: 'utilized_by' },
  { title: 'Fund', key: 'fund_cluster', width: '80px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: '100px' },
]

// ── BILLING PERIODS (24 per year) ──

const MONTH_NAMES = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
]

function getBillingPeriod(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const month = MONTH_NAMES[d.getMonth()]
  const day = d.getDate()
  const year = d.getFullYear()
  const lastDay = new Date(year, d.getMonth() + 1, 0).getDate()
  if (day <= 15) return `${month} 1-15, ${year}`
  return `${month} 16-${lastDay}, ${year}`
}

const billingPeriods = computed(() => {
  const set = new Set(transactions.value.map((t) => t.billing_period).filter(Boolean))
  return [...set].sort()
})

// ── COMPUTED ──
const filteredTransactions = computed(() => {
  return transactions.value.filter((t) => {
    const matchSearch =
      !search.value ||
      [t.or_number, t.vehicle, t.utilized_by, t.account_code].some((f) =>
        f?.toLowerCase().includes(search.value.toLowerCase()),
      )
    const matchPeriod =
      filterPeriod.value === 'All Periods' || t.billing_period === filterPeriod.value
    const matchFuel = filterFuel.value === 'All Types' || t.fuel_type === filterFuel.value
    const matchFund = filterFund.value === 'All Funds' || t.fund_cluster === filterFund.value
    return matchSearch && matchPeriod && matchFuel && matchFund
  })
})

const totalDiesel = computed(() =>
  filteredTransactions.value
    .filter((t) => t.fuel_type === 'Diesel')
    .reduce((s, t) => s + (t.quantity || 0), 0),
)

const totalGasoline = computed(() =>
  filteredTransactions.value
    .filter((t) => t.fuel_type === 'Gasoline')
    .reduce((s, t) => s + (t.quantity || 0), 0),
)

const totalAmount = computed(() =>
  filteredTransactions.value.reduce((s, t) => s + (t.total_amount || 0), 0),
)

const availableFunds = computed(() =>
  [...new Set(contracts.value.map((c) => c.fund_cluster).filter(Boolean))].sort(),
)

const filteredContractOptions = computed(() => {
  return contracts.value
    .filter((c) => !form.value.fund_cluster || c.fund_cluster === form.value.fund_cluster)
    .map((c) => ({
      id: c.id,
      label: `[${c.fund_cluster}] ${c.account_code} — ${c.po_number}`,
      po_number: c.po_number,
      fund_cluster: c.fund_cluster,
      account_code: c.account_code,
    }))
})

// Vehicle / Equipment options from assets + past transactions
const vehicleOptions = computed(() => {
  const fromAssets = assets.value.map((a) => a.asset_name)
  const fromTx = [...new Set(transactions.value.map((t) => t.vehicle).filter(Boolean))]
  return [...new Set([...fromAssets, ...fromTx])].sort()
})

const utilizedByOptions = computed(() =>
  [...new Set(transactions.value.map((t) => t.utilized_by).filter(Boolean))].sort(),
)

// ── VEHICLE SUMMARY (quick lookup) ──
const vehicleSummary = computed(() => {
  const yearTx = transactions.value.filter((t) => {
    const d = new Date(t.date + 'T00:00:00')
    return d.getFullYear() === Number(lookupYear.value)
  })
  const map = new Map()
  yearTx.forEach((t) => {
    const key = t.vehicle || 'Unknown'
    if (!map.has(key)) {
      map.set(key, {
        name: key,
        count: 0,
        diesel: 0,
        gasoline: 0,
        amount: 0,
        is_vehicle:
          assets.value.find((a) => a.asset_name === key && a.asset_type === 'Vehicle') != null,
      })
    }
    const entry = map.get(key)
    entry.count++
    entry.amount += t.total_amount || 0
    if (t.fuel_type === 'Diesel') entry.diesel += t.quantity || 0
    else entry.gasoline += t.quantity || 0
  })
  return [...map.values()].sort((a, b) => b.amount - a.amount)
})

const filteredVehicleSummary = computed(() => {
  if (!lookupSearch.value) return vehicleSummary.value
  return vehicleSummary.value.filter((v) =>
    v.name.toLowerCase().includes(lookupSearch.value.toLowerCase()),
  )
})

// ── FETCH ──
async function fetchAvailableYears() {
  const { data } = await supabase.from('fuel_transactions').select('date').order('date')
  if (data && data.length > 0) {
    const years = [...new Set(data.map((r) => new Date(r.date).getFullYear()))]
    const allYears = [...new Set([...years, new Date().getFullYear()])].sort()
    availableYears.value = allYears
  }
}

async function fetchTransactions() {
  loading.value = true
  const startDate = `${filterYear.value}-01-01`
  const endDate = `${filterYear.value}-12-31`
  const { data, error } = await supabase
    .from('fuel_transactions')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('or_number', { ascending: false })
  if (error) showSnackbar('Failed to load transactions', 'error')
  else transactions.value = data
  loading.value = false
}

async function fetchContracts() {
  const { data } = await supabase
    .from('fuel_contracts')
    .select('*')
    .order('fund_cluster')
    .order('account_code')
  if (data) contracts.value = data
}

async function fetchAssets() {
  const { data } = await supabase
    .from('vehicles')
    .select('asset_name, asset_type')
    .eq('status', 'Active')
    .order('asset_name')
  if (data) assets.value = data
}

// ── DIALOGS ──
function openAddDialog() {
  isEditing.value = false
  form.value = { ...defaultForm }
  errors.value = {}
  formDialog.value = true
}

function openEditDialog(tx) {
  isEditing.value = true
  selectedTx.value = tx
  form.value = {
    ...tx,
    date_display: formatDate(tx.date),
    quantity_display: formatNumber(tx.quantity),
    unit_price_display: formatNumber(tx.unit_price),
    total_amount_display: formatNumber(tx.total_amount),
  }
  errors.value = {}
  formDialog.value = true
}

function openViewDialog(tx) {
  selectedTx.value = tx
  viewDialog.value = true
}

function openDeleteDialog(tx) {
  selectedTx.value = tx
  deleteDialog.value = true
}

function closeFormDialog() {
  formDialog.value = false
  form.value = { ...defaultForm }
  errors.value = {}
}

// ── FORM HANDLERS ──
function onDateBlur() {
  // Parse MM/DD/YY → ISO YYYY-MM-DD
  const val = form.value.date_display?.trim()
  if (!val) return
  const parts = val.split('/')
  if (parts.length === 3) {
    const mm = parts[0].padStart(2, '0')
    const dd = parts[1].padStart(2, '0')
    const yy = parts[2].length === 2 ? '20' + parts[2] : parts[2]
    form.value.date = `${yy}-${mm}-${dd}`
    form.value.billing_period = getBillingPeriod(form.value.date)
  }
}

function onFundChange() {
  form.value.contract_id = null
  form.value.po_number = ''
  form.value.account_code = ''
}

function onContractSelected(id) {
  const contract = filteredContractOptions.value.find((c) => c.id === id)
  if (contract) {
    form.value.po_number = contract.po_number
    form.value.fund_cluster = contract.fund_cluster
    form.value.account_code = contract.account_code
  }
}

function recalcTotal() {
  const qty = form.value.quantity || 0
  const price = form.value.unit_price || 0
  form.value.total_amount = Math.round(qty * price * 100) / 100
  form.value.total_amount_display = formatNumber(form.value.total_amount)
}

function onQuantityInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    form.value.quantity = Number(raw)
    recalcTotal()
  }
}
function onQuantityBlur() {
  form.value.quantity_display = form.value.quantity ? formatNumber(form.value.quantity) : ''
}

function onUnitPriceInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    form.value.unit_price = Number(raw)
    recalcTotal()
  }
}
function onUnitPriceBlur() {
  form.value.unit_price_display = form.value.unit_price ? formatNumber(form.value.unit_price) : ''
}

// ── VALIDATION ──
function validateForm() {
  errors.value = {}
  if (!form.value.date) errors.value.date = 'Required (MM/DD/YY)'
  if (!form.value.or_number?.trim()) errors.value.or_number = 'Required'
  if (!form.value.fuel_type) errors.value.fuel_type = 'Required'
  if (!form.value.quantity || form.value.quantity <= 0)
    errors.value.quantity = 'Must be greater than 0'
  if (!form.value.unit_price || form.value.unit_price <= 0)
    errors.value.unit_price = 'Must be greater than 0'
  if (!form.value.vehicle?.trim()) errors.value.vehicle = 'Required'
  if (!form.value.utilized_by?.trim()) errors.value.utilized_by = 'Required'
  if (!form.value.contract_id) errors.value.contract_id = 'Select a cost center to charge'
  return Object.keys(errors.value).length === 0
}

// ── SAVE ──
async function saveTransaction() {
  if (!validateForm()) return
  saving.value = true
  const payload = {
    date: form.value.date,
    or_number: form.value.or_number,
    billing_period: form.value.billing_period || getBillingPeriod(form.value.date),
    fuel_type: form.value.fuel_type,
    quantity: form.value.quantity,
    unit: form.value.unit || 'LTRS.',
    unit_price: form.value.unit_price,
    total_amount: form.value.total_amount,
    vehicle: form.value.vehicle,
    utilized_by: form.value.utilized_by,
    fund_cluster: form.value.fund_cluster,
    contract_id: form.value.contract_id,
    po_number: form.value.po_number,
    account_code: form.value.account_code,
    remarks: form.value.remarks || '',
  }
  if (isEditing.value) {
    const { error } = await supabase
      .from('fuel_transactions')
      .update(payload)
      .eq('id', form.value.id)
    if (error) showSnackbar('Failed to update transaction', 'error')
    else {
      showSnackbar('Transaction updated', 'success')
      closeFormDialog()
      await fetchTransactions()
    }
  } else {
    const { error } = await supabase.from('fuel_transactions').insert(payload)
    if (error) showSnackbar('Failed to add transaction', 'error')
    else {
      showSnackbar('Transaction added', 'success')
      closeFormDialog()
      await fetchTransactions()
    }
  }
  saving.value = false
}

// ── DELETE ──
async function deleteTx() {
  deleting.value = true
  const { error } = await supabase.from('fuel_transactions').delete().eq('id', selectedTx.value.id)
  if (error) showSnackbar('Failed to delete transaction', 'error')
  else {
    showSnackbar('Transaction deleted', 'success')
    deleteDialog.value = false
    await fetchTransactions()
  }
  deleting.value = false
}

// ── HELPERS ──
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}
function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '0'
  return Number(val).toLocaleString('en-PH', { maximumFractionDigits: 2 })
}
function fundColor(fund) {
  const map = { RAF: 'blue', IGF: 'green', BRF: 'orange', TRF: 'purple' }
  if (map[fund]) return map[fund]
  const colors = ['teal', 'pink', 'indigo', 'cyan', 'deep-orange', 'lime', 'brown', 'blue-grey']
  let hash = 0
  for (let i = 0; i < (fund?.length || 0); i++) hash += fund.charCodeAt(i)
  return colors[hash % colors.length]
}
function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// Re-fetch when year filter changes
watch(filterYear, fetchTransactions)

onMounted(async () => {
  await Promise.all([fetchContracts(), fetchAssets()])
  await fetchAvailableYears()
  await fetchTransactions()
})
</script>
