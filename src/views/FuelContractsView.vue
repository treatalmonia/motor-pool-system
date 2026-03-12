<template>
  <v-container fluid>
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <h2 class="text-h5 font-weight-bold">Fuel Contracts & Cost Centers</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Manage annual fuel contracts per cost center
            </p>
          </div>
          <div class="d-flex ga-2 flex-wrap align-center">
            <v-select
              v-model="selectedYear"
              :items="availableYears"
              label="Year"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 110px"
              @update:modelValue="fetchContracts"
            />
            <v-btn
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-content-copy"
              @click="openCopyYearDialog"
            >
              Copy to New Year
            </v-btn>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
              Add Contract
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row class="mb-4">
      <!-- Total Contract Amount -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="orange-darken-2" variant="tonal" size="44">
              <v-icon>mdi-cash-multiple</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Contract Amount</p>
              <p class="text-h5 font-weight-bold">{{ formatCurrency(totalContractAmount) }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Diesel -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="ga-3">
            <div class="d-flex align-center ga-3 mb-2">
              <v-avatar color="blue-darken-2" variant="tonal" size="44">
                <v-icon>mdi-fuel</v-icon>
              </v-avatar>
              <p class="text-body-2 font-weight-bold">Diesel</p>
            </div>
            <v-row dense>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Total No. of (L)</p>
                <p class="text-h6 font-weight-bold text-blue-darken-2">
                  {{ formatNumber(totalDiesel) }}
                </p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Total Amount</p>
                <p class="text-h6 font-weight-bold">{{ formatCurrency(totalDieselAmount) }}</p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Gasoline -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="ga-3">
            <div class="d-flex align-center ga-3 mb-2">
              <v-avatar color="green-darken-2" variant="tonal" size="44">
                <v-icon>mdi-gas-station</v-icon>
              </v-avatar>
              <p class="text-body-2 font-weight-bold">Gasoline</p>
            </div>
            <v-row dense>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Total No. of (L)</p>
                <p class="text-h6 font-weight-bold text-green-darken-2">
                  {{ formatNumber(totalGasoline) }}
                </p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Total Amount</p>
                <p class="text-h6 font-weight-bold">{{ formatCurrency(totalGasolineAmount) }}</p>
              </v-col>
            </v-row>
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
          label="Search cost center, head, account code..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="min-width: 280px"
        />
        <v-select
          v-model="filterFund"
          :items="['All Funds', 'RAF', 'IGF', 'BRF', 'TRF']"
          label="Fund Cluster"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 140px"
        />
        <v-spacer />
        <p class="text-medium-emphasis text-body-2">
          Showing {{ filteredContracts.length }} of {{ contracts.length }} contracts
        </p>
      </div>
    </v-card>

    <!-- Contracts Table -->
    <v-card rounded="lg" elevation="0" border>
      <v-data-table
        :headers="headers"
        :items="filteredContracts"
        :loading="loading"
        items-per-page="15"
        class="fuel-table"
      >
        <!-- Fund Cluster chip -->
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

        <!-- Contract Amount -->
        <template #item.contract_amount="{ item }">
          <span class="font-weight-medium"> ₱{{ formatNumber(item.contract_amount) }} </span>
        </template>

        <!-- Diesel liters -->
        <template #item.allocated_diesel="{ item }">
          <span>{{ formatNumber(item.allocated_diesel) }} L</span>
        </template>

        <!-- Gasoline liters -->
        <template #item.allocated_gasoline="{ item }">
          <span>{{ formatNumber(item.allocated_gasoline) }} L</span>
        </template>

        <!-- Balance -->
        <template #item.balance="{ item }">
          <v-chip :color="item.balance >= 0 ? 'success' : 'error'" variant="tonal" size="small">
            ₱{{ formatNumber(Math.abs(item.balance)) }}
            {{ item.balance < 0 ? '(over)' : '' }}
          </v-chip>
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
            <v-icon size="56" color="grey-lighten-1">mdi-file-document-outline</v-icon>
            <p class="mt-3 text-medium-emphasis">No contracts found for {{ selectedYear }}.</p>
            <v-btn color="primary" class="mt-3" @click="openAddDialog"> Add First Contract </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- ── ADD / EDIT DIALOG ── -->
    <v-dialog v-model="formDialog" max-width="700" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">
          <v-icon start :color="isEditing ? 'primary' : 'success'">
            {{ isEditing ? 'mdi-pencil' : 'mdi-plus-circle' }}
          </v-icon>
          {{ isEditing ? 'Edit Contract' : 'Add Contract' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row>
            <!-- Fund Cluster -->
            <v-col cols="12" sm="4">
              <v-combobox
                v-model="form.fund_cluster"
                :items="existingFundClusters"
                label="Fund Cluster *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.fund_cluster"
                placeholder="e.g. RAF, IGF, BRF, TRF"
              />
            </v-col>
            <!-- PO Number -->
            <v-col cols="12" sm="4">
              <v-combobox
                v-model="form.po_number"
                :items="existingPONumbers"
                label="PO Number *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.po_number"
                placeholder="e.g. 101-25-01-002"
              />
            </v-col>
            <!-- Mode of Procurement -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.mode_of_procurement"
                label="Mode of Procurement"
                variant="outlined"
                density="comfortable"
                placeholder="CONTRACT"
              />
            </v-col>

            <!-- Account Code -->
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="form.account_code"
                label="Account Code *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.account_code"
                placeholder="e.g. CAA LABSHARE"
              />
            </v-col>
            <!-- Year -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.year"
                label="Year *"
                variant="outlined"
                density="comfortable"
                type="number"
                :error-messages="errors.year"
              />
            </v-col>

            <!-- Cost Center Head -->
            <v-col cols="12">
              <v-text-field
                v-model="form.cost_center_head"
                label="Cost Center Head *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.cost_center_head"
                placeholder="e.g. ELIZABETH PARAC, PH.D"
              />
            </v-col>

            <v-col cols="12">
              <v-divider class="mb-3" />
              <p class="text-body-2 font-weight-medium text-medium-emphasis mb-3">
                <v-icon size="16" class="mr-1">mdi-currency-php</v-icon>
                Contract Financial Details
              </p>
            </v-col>

            <!-- Contract Amount -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.contract_amount_display"
                label="Contract Amount (₱) *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.contract_amount"
                placeholder="0.00"
                @input="onAmountInput"
                @blur="onAmountBlur"
              />
            </v-col>
            <!-- Allocated Diesel -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.allocated_diesel_display"
                label="Allocated Diesel (L)"
                variant="outlined"
                density="comfortable"
                placeholder="0.00"
                suffix="L"
                @input="onDieselInput"
                @blur="onDieselBlur"
              />
            </v-col>
            <!-- Allocated Gasoline -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.allocated_gasoline_display"
                label="Allocated Gasoline (L)"
                variant="outlined"
                density="comfortable"
                placeholder="0.00"
                suffix="L"
                @input="onGasolineInput"
                @blur="onGasolineBlur"
              />
            </v-col>

            <!-- Remarks -->
            <v-col cols="12">
              <v-textarea
                v-model="form.remarks"
                label="Remarks"
                variant="outlined"
                density="comfortable"
                rows="2"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveContract">
            {{ isEditing ? 'Save Changes' : 'Add Contract' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── VIEW DIALOG ── -->
    <v-dialog v-model="viewDialog" max-width="580">
      <v-card rounded="lg" v-if="selectedContract">
        <v-card-title class="pa-4 pb-2 d-flex align-center justify-space-between">
          <span>Contract Details</span>
          <v-chip
            :color="fundColor(selectedContract.fund_cluster)"
            variant="tonal"
            size="small"
            class="font-weight-bold"
          >
            {{ selectedContract.fund_cluster }}
          </v-chip>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <!-- Contract Info -->
          <v-card rounded="lg" variant="tonal" color="grey" class="pa-3 mb-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">
              CONTRACT INFORMATION
            </p>
            <v-row dense>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">PO Number</p>
                <p class="font-weight-medium">{{ selectedContract.po_number }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Mode of Procurement</p>
                <p class="font-weight-medium">{{ selectedContract.mode_of_procurement || '—' }}</p>
              </v-col>
              <v-col cols="12" class="mt-1">
                <p class="text-caption text-medium-emphasis">Account Code</p>
                <p class="font-weight-medium">{{ selectedContract.account_code }}</p>
              </v-col>
              <v-col cols="12" class="mt-1">
                <p class="text-caption text-medium-emphasis">Cost Center Head</p>
                <p class="font-weight-medium">{{ selectedContract.cost_center_head }}</p>
              </v-col>
            </v-row>
          </v-card>

          <!-- Financial Info -->
          <v-card rounded="lg" variant="tonal" color="orange" class="pa-3 mb-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">FINANCIAL DETAILS</p>
            <v-row dense>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Contract Amount</p>
                <p class="font-weight-bold text-orange-darken-3">
                  ₱{{ formatNumber(selectedContract.contract_amount) }}
                </p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Balance</p>
                <p
                  :class="
                    selectedContract.balance >= 0
                      ? 'font-weight-bold text-success'
                      : 'font-weight-bold text-error'
                  "
                >
                  ₱{{ formatNumber(Math.abs(selectedContract.balance)) }}
                  {{ selectedContract.balance < 0 ? '(OVER)' : '' }}
                </p>
              </v-col>
            </v-row>
          </v-card>

          <!-- Fuel Allocation -->
          <v-card rounded="lg" variant="tonal" color="blue" class="pa-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">FUEL ALLOCATION</p>
            <v-row dense>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Allocated Diesel</p>
                <p class="font-weight-medium">
                  {{ formatNumber(selectedContract.allocated_diesel) }} L
                </p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Allocated Gasoline</p>
                <p class="font-weight-medium">
                  {{ formatNumber(selectedContract.allocated_gasoline) }} L
                </p>
              </v-col>
            </v-row>
          </v-card>

          <div v-if="selectedContract.remarks" class="mt-3">
            <p class="text-caption text-medium-emphasis">Remarks</p>
            <p class="text-body-2">{{ selectedContract.remarks }}</p>
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
                openEditDialog(selectedContract)
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
          <h3 class="text-h6 mb-2">Delete Contract?</h3>
          <p class="text-medium-emphasis">
            Delete <strong>{{ selectedContract?.account_code }}</strong
            >? This cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteContract">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── COPY YEAR DIALOG ── -->
    <v-dialog v-model="copyYearDialog" max-width="420">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0">
          <v-icon start>mdi-content-copy</v-icon>
          Copy Contracts to New Year
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-2 text-medium-emphasis mb-4">
            All contracts from <strong>{{ copyFromYear }}</strong> will be copied to a new year
            (consumption resets to zero).
          </p>
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="copyFromYear"
                :items="availableYears"
                label="Copy From"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="copyToYear"
                label="Copy To (Year)"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 2026"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="copyYearDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="copying" @click="copyToNewYear">
            Copy Contracts
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
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

// ── STATE ──
const contracts = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const copying = ref(false)
const selectedYear = ref(new Date().getFullYear())
const availableYears = ref([new Date().getFullYear()])
const search = ref('')
const filterFund = ref('All Funds')

// ── DIALOGS ──
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const copyYearDialog = ref(false)
const isEditing = ref(false)
const selectedContract = ref(null)
const copyFromYear = ref(new Date().getFullYear())
const copyToYear = ref(new Date().getFullYear() + 1)

// ── FORM ──
const defaultForm = {
  year: new Date().getFullYear(),
  fund_cluster: '',
  po_number: '',
  account_code: '',
  cost_center_head: '',
  contract_amount: 0,
  contract_amount_display: '',
  allocated_diesel: 0,
  allocated_diesel_display: '',
  allocated_gasoline: 0,
  allocated_gasoline_display: '',
  mode_of_procurement: 'CONTRACT',
  remarks: '',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ── SNACKBAR ──
const snackbar = ref({ show: false, message: '', color: 'success' })

// ── TABLE HEADERS ──
const headers = [
  { title: 'Fund', key: 'fund_cluster', width: '80px' },
  { title: 'PO Number', key: 'po_number', width: '140px' },
  { title: 'Account Code', key: 'account_code' },
  { title: 'Cost Center Head', key: 'cost_center_head' },
  { title: 'Contract Amt.', key: 'contract_amount', align: 'end' },
  { title: 'Diesel (L)', key: 'allocated_diesel', align: 'end' },
  { title: 'Gasoline (L)', key: 'allocated_gasoline', align: 'end' },
  { title: 'Balance', key: 'balance', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: '100px' },
]

// ── COMPUTED ──
const filteredContracts = computed(() => {
  return contracts.value.filter((c) => {
    const matchSearch =
      !search.value ||
      [c.account_code, c.cost_center_head, c.po_number].some((f) =>
        f?.toLowerCase().includes(search.value.toLowerCase()),
      )
    const matchFund = filterFund.value === 'All Funds' || c.fund_cluster === filterFund.value
    return matchSearch && matchFund
  })
})

const totalContractAmount = computed(() =>
  contracts.value.reduce((s, c) => s + (c.contract_amount || 0), 0),
)
const totalDiesel = computed(() =>
  contracts.value.reduce((s, c) => s + (c.allocated_diesel || 0), 0),
)
const totalGasoline = computed(() =>
  contracts.value.reduce((s, c) => s + (c.allocated_gasoline || 0), 0),
)
const totalDieselAmount = computed(() =>
  contracts.value
    .filter((c) => (c.allocated_diesel || 0) > 0)
    .reduce((s, c) => s + (c.contract_amount || 0), 0),
)
const totalGasolineAmount = computed(() =>
  contracts.value
    .filter((c) => (c.allocated_gasoline || 0) > 0)
    .reduce((s, c) => s + (c.contract_amount || 0), 0),
)

const existingPONumbers = computed(() => [
  ...new Set(contracts.value.map((c) => c.po_number).filter(Boolean)),
])

const existingFundClusters = computed(() => [
  ...new Set(contracts.value.map((c) => c.fund_cluster).filter(Boolean)),
])

// ── FETCH ──
async function fetchAvailableYears() {
  const { data } = await supabase.from('fuel_contracts').select('year').order('year')
  if (data) {
    const years = [...new Set(data.map((r) => r.year))]
    availableYears.value = years.length > 0 ? years : [new Date().getFullYear()]
    if (!availableYears.value.includes(selectedYear.value)) {
      selectedYear.value = availableYears.value[availableYears.value.length - 1]
    }
  }
}

async function fetchContracts() {
  loading.value = true
  const { data, error } = await supabase
    .from('fuel_contracts')
    .select('*')
    .eq('year', selectedYear.value)
    .order('fund_cluster')
    .order('po_number')
    .order('account_code')
  if (error) showSnackbar('Failed to load contracts', 'error')
  else contracts.value = data
  loading.value = false
}

// ── DIALOGS ──
function openAddDialog() {
  isEditing.value = false
  form.value = { ...defaultForm, year: selectedYear.value }
  errors.value = {}
  formDialog.value = true
}

function openEditDialog(contract) {
  isEditing.value = true
  selectedContract.value = contract
  form.value = {
    ...contract,
    contract_amount_display: formatNumber(contract.contract_amount),
    allocated_diesel_display: formatNumber(contract.allocated_diesel),
    allocated_gasoline_display: formatNumber(contract.allocated_gasoline),
  }
  errors.value = {}
  formDialog.value = true
}

function openViewDialog(contract) {
  selectedContract.value = contract
  viewDialog.value = true
}

function openDeleteDialog(contract) {
  selectedContract.value = contract
  deleteDialog.value = true
}

function openCopyYearDialog() {
  copyFromYear.value = selectedYear.value
  copyToYear.value = selectedYear.value + 1
  copyYearDialog.value = true
}

function closeFormDialog() {
  formDialog.value = false
  form.value = { ...defaultForm }
  errors.value = {}
}

// ── VALIDATION ──
function validateForm() {
  errors.value = {}
  if (!form.value.fund_cluster) errors.value.fund_cluster = 'Required'
  if (!form.value.po_number?.trim()) errors.value.po_number = 'Required'
  if (!form.value.account_code?.trim()) errors.value.account_code = 'Required'
  if (!form.value.cost_center_head?.trim()) errors.value.cost_center_head = 'Required'
  if (!form.value.contract_amount || form.value.contract_amount <= 0)
    errors.value.contract_amount = 'Must be greater than 0'
  if (!form.value.year) errors.value.year = 'Required'
  return Object.keys(errors.value).length === 0
}

// ── SAVE ──
async function saveContract() {
  if (!validateForm()) return
  saving.value = true
  const payload = {
    year: Number(form.value.year),
    fund_cluster: form.value.fund_cluster,
    po_number: form.value.po_number,
    account_code: form.value.account_code,
    cost_center_head: form.value.cost_center_head,
    contract_amount: form.value.contract_amount || 0,
    allocated_diesel: form.value.allocated_diesel || 0,
    allocated_gasoline: form.value.allocated_gasoline || 0,
    mode_of_procurement: form.value.mode_of_procurement || 'CONTRACT',
    remarks: form.value.remarks || '',
  }
  if (isEditing.value) {
    const { error } = await supabase.from('fuel_contracts').update(payload).eq('id', form.value.id)
    if (error) showSnackbar('Failed to update contract', 'error')
    else {
      showSnackbar('Contract updated', 'success')
      closeFormDialog()
      await fetchContracts()
    }
  } else {
    const { error } = await supabase.from('fuel_contracts').insert(payload)
    if (error) showSnackbar('Failed to add contract', 'error')
    else {
      showSnackbar('Contract added', 'success')
      closeFormDialog()
      await fetchContracts()
    }
  }
  saving.value = false
}

// ── DELETE ──
async function deleteContract() {
  deleting.value = true
  const { error } = await supabase
    .from('fuel_contracts')
    .delete()
    .eq('id', selectedContract.value.id)
  if (error) showSnackbar('Failed to delete contract', 'error')
  else {
    showSnackbar('Contract deleted', 'success')
    deleteDialog.value = false
    await fetchContracts()
  }
  deleting.value = false
}

// ── COPY YEAR ──
async function copyToNewYear() {
  if (!copyToYear.value) return
  copying.value = true
  const { data, error } = await supabase
    .from('fuel_contracts')
    .select('*')
    .eq('year', copyFromYear.value)
  if (error || !data || data.length === 0) {
    showSnackbar('No contracts found for selected year', 'error')
    copying.value = false
    return
  }
  const { data: existing } = await supabase
    .from('fuel_contracts')
    .select('id')
    .eq('year', copyToYear.value)
    .limit(1)
  if (existing && existing.length > 0) {
    showSnackbar(`Year ${copyToYear.value} already has contracts`, 'error')
    copying.value = false
    return
  }

  const newRows = data.map((row) => {
    // eslint-disable-next-line no-unused-vars
    const { id, created_at, ...rest } = row
    return { ...rest, year: Number(copyToYear.value) }
  })

  const { error: insertError } = await supabase.from('fuel_contracts').insert(newRows)
  if (insertError) showSnackbar('Failed to copy contracts', 'error')
  else {
    showSnackbar(`Contracts copied to ${copyToYear.value}`, 'success')
    await fetchAvailableYears()
    selectedYear.value = Number(copyToYear.value)
    await fetchContracts()
    copyYearDialog.value = false
  }
  copying.value = false
}

// ── COMMA-FORMATTED INPUTS ──
function onAmountInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') form.value.contract_amount = Number(raw)
}
function onAmountBlur() {
  form.value.contract_amount_display = form.value.contract_amount
    ? formatNumber(form.value.contract_amount)
    : ''
}
function onDieselInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') form.value.allocated_diesel = Number(raw)
}
function onDieselBlur() {
  form.value.allocated_diesel_display = form.value.allocated_diesel
    ? formatNumber(form.value.allocated_diesel)
    : ''
}
function onGasolineInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') form.value.allocated_gasoline = Number(raw)
}
function onGasolineBlur() {
  form.value.allocated_gasoline_display = form.value.allocated_gasoline
    ? formatNumber(form.value.allocated_gasoline)
    : ''
}

// ── HELPERS ──
function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '0'
  return Number(val).toLocaleString('en-PH', { maximumFractionDigits: 2 })
}
function formatCurrency(val) {
  if (!val) return '₱0'
  if (val >= 1000000) return '₱' + (val / 1000000).toFixed(2) + 'M'
  if (val >= 1000) return '₱' + (val / 1000).toFixed(1) + 'K'
  return '₱' + formatNumber(val)
}
function fundColor(fund) {
  const map = { RAF: 'blue', IGF: 'green', BRF: 'orange', TRF: 'purple' }
  if (map[fund]) return map[fund]
  // Auto-assign color for new fund clusters based on name
  const colors = ['teal', 'pink', 'indigo', 'cyan', 'deep-orange', 'lime', 'brown', 'blue-grey']
  let hash = 0
  for (let i = 0; i < fund.length; i++) hash += fund.charCodeAt(i)
  return colors[hash % colors.length]
}
function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

onMounted(async () => {
  await fetchAvailableYears()
  await fetchContracts()
})
</script>
