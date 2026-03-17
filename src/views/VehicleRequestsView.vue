<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">Service Requests</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Track and manage corrective maintenance requests
            </p>
          </div>

          <!-- WHAT: Year management controls — Year Dropdown, Add Year, Add Contract -->
          <!-- WHY: Required by spec. Buttons appear in order before New Request. -->
          <div class="d-flex align-center ga-2 flex-wrap">
            <v-select
              v-model="yearFilter"
              :items="yearOptions"
              label="Year"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 100px"
            />
            <v-btn variant="outlined" prepend-icon="mdi-plus" @click="addYear"> Add Year </v-btn>

            <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
              New Request
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="48">
              <v-icon>mdi-clipboard-list</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Requests</p>
              <p class="text-h5 font-weight-bold">{{ requests.length }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="warning" variant="tonal" size="48">
              <v-icon>mdi-clock-outline</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">In Progress</p>
              <p class="text-h5 font-weight-bold">{{ inProgressCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="success" variant="tonal" size="48">
              <v-icon>mdi-check-circle</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Completed</p>
              <p class="text-h5 font-weight-bold">{{ completedCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="error" variant="tonal" size="48">
              <v-icon>mdi-cancel</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Cancelled</p>
              <p class="text-h5 font-weight-bold">{{ cancelledCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table -->
    <v-card rounded="lg" elevation="0" border>
      <v-card-text>
        <!-- Filters -->
        <v-row class="mb-2" align="center">
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search requests..."
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="assetTypeFilter"
              :items="['All', 'Vehicle', 'Non-Vehicular']"
              label="Asset Type"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="2">
            <v-select
              v-model="yearFilter"
              :items="yearOptions"
              label="Year"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="vehicleFilter"
              :items="assetOptions"
              label="Asset"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>
        <div class="d-flex justify-end mb-2">
          <span class="text-caption text-medium-emphasis">
            Showing {{ filteredRequests.length }} of {{ requests.length }} requests
          </span>
        </div>

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="filteredRequests"
          :loading="loading"
          loading-text="Loading requests..."
          no-data-text="No service requests found"
          items-per-page="10"
          rounded="lg"
        >
          <!-- Request No -->
          <template v-slot:item.request_no="{ item }">
            <span class="font-weight-bold text-primary">
              {{ item.request_no }}
            </span>
          </template>

          <!-- Asset Type chip -->
          <template v-slot:item.asset_type="{ item }">
            <v-chip
              :color="item.asset_type === 'Vehicle' ? 'info' : 'warning'"
              size="small"
              variant="tonal"
            >
              {{ item.asset_type }}
            </v-chip>
          </template>

          <!-- Status — clickable chip that opens a quick-change menu -->
          <template v-slot:item.status="{ item }">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-chip
                  :color="statusColor(item.status)"
                  size="small"
                  variant="tonal"
                  v-bind="props"
                  style="cursor: pointer"
                  append-icon="mdi-chevron-down"
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <v-list density="compact" min-width="150">
                <v-list-item
                  v-for="s in ['In Progress', 'Completed', 'Cancelled']"
                  :key="s"
                  :title="s"
                  @click="quickUpdateStatus(item, s)"
                />
              </v-list>
            </v-menu>
          </template>

          <!-- BUG FIX: This was previously nested inside the status menu — it never rendered. -->
          <!-- WHY: Each column slot must be a DIRECT child of v-data-table, not inside another slot. -->
          <template v-slot:item.date_completed="{ item }">
            {{ item.date_completed ? formatDate(item.date_completed) : '—' }}
          </template>

          <!-- WHAT: Formats mileage with commas and km unit in the table -->
          <!-- WHY: Raw numbers like 43117 are hard to read — 43,117 km is clear -->
          <template v-slot:item.mileage="{ item }">
            <span v-if="item.mileage">
              {{ Number(item.mileage).toLocaleString() }} km
            </span>
            <span v-else class="text-medium-emphasis">—</span>
          </template>

          <!-- WHAT: Formats cost with peso sign and commas in the table -->
          <template v-slot:item.cost="{ item }">
            <span v-if="item.cost">
              ₱{{ Number(item.cost).toLocaleString() }}
            </span>
            <span v-else class="text-medium-emphasis">—</span>
          </template>

          <!-- Actions -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="info"
              @click="viewRequest(item)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="openEditDialog(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="openDeleteDialog(item)"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add / Edit Dialog -->
    <v-dialog v-model="formDialog" max-width="650" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0">
          <span class="text-h6">
            {{ isEditing ? 'Edit Service Request' : 'New Service Request' }}
          </span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Request No -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.request_no"
                label="Request No."
                variant="outlined"
                density="comfortable"
                hint="Auto-generated. You can change it."
                persistent-hint
              />
            </v-col>

            <!-- Date of Request — MM/DD/YY typed input with multi-format support -->
            <!-- WHAT: User types the date; the parser converts it to YYYY-MM-DD for the database -->
            <!-- WHY: type="date" forces YYYY-MM-DD display and shows a browser calendar only -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="dateOfRequestDisplay"
                label="Date of Request * (MM/DD/YY)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 04/24/26"
                autocomplete="off"
                :error-messages="errors.date_of_request"
                @input="onDateOfRequestInput"
              />
            </v-col>

            <!-- Asset — grouped dropdown (Vehicles + Non-Vehicular) -->
            <!-- WHY: :item-props with a function crashes Vuetify 4 virtual scroll. -->
            <!-- disabled and class are now set directly on each item object instead. -->
            <v-col cols="12">
              <v-select
                v-model="form.vehicle_id"
                :items="groupedAssetItems"
                item-title="title"
                item-value="value"
                label="Asset *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.vehicle_id"
                @update:modelValue="onAssetSelected"
              />
            </v-col>

            <!-- Requisitioner — searchable combobox with plain string items -->
            <!-- WHAT: User picks from list or types a new name -->
            <!-- WHY: New names auto-save to Supabase. Saved names shown below with delete. -->
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.requisitioner"
                :items="requisitionerOptions"
                label="Requisitioner"
                variant="outlined"
                density="comfortable"
                placeholder="Type or select name"
                clearable
                @update:modelValue="
                  (val) => onComboboxUpdate('requisitioner', val, requisitionerOptions)
                "
              />
              <!-- Saved custom entries — shown as chips with X delete button -->
              <!-- WHY: We cannot use a custom item slot in Vuetify 4 combobox safely -->
              <div
                v-if="getSavedOptions('requisitioner').length"
                class="d-flex flex-wrap ga-1 mt-1"
              >
                <v-chip
                  v-for="opt in getSavedOptions('requisitioner')"
                  :key="opt.id"
                  size="small"
                  closable
                  @click:close="deleteDropdownOption(opt.id)"
                >
                  {{ opt.value }}
                </v-chip>
              </div>
            </v-col>

            <!-- Conducted By — same pattern as Requisitioner -->
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.conducted_by"
                :items="conductedByOptions"
                label="Conducted By"
                variant="outlined"
                density="comfortable"
                placeholder="Type or select name"
                clearable
                @update:modelValue="
                  (val) => onComboboxUpdate('conducted_by', val, conductedByOptions)
                "
              />
              <div v-if="getSavedOptions('conducted_by').length" class="d-flex flex-wrap ga-1 mt-1">
                <v-chip
                  v-for="opt in getSavedOptions('conducted_by')"
                  :key="opt.id"
                  size="small"
                  closable
                  @click:close="deleteDropdownOption(opt.id)"
                >
                  {{ opt.value }}
                </v-chip>
              </div>
            </v-col>

            <!-- Problem Encountered -->
            <v-col cols="12">
              <v-textarea
                v-model="form.problem_details"
                label="Problem Encountered *"
                variant="outlined"
                density="comfortable"
                rows="3"
                :error-messages="errors.problem_details"
                placeholder="Describe the problem encountered"
              />
            </v-col>

            <!-- Diagnosis & Action Taken — plain string combobox -->
            <v-col cols="12">
              <v-combobox
                v-model="form.work_details"
                :items="diagnosisOptions"
                label="Diagnosis & Action Taken"
                variant="outlined"
                density="comfortable"
                placeholder="Type or select diagnosis / action taken"
                clearable
                @update:modelValue="(val) => onComboboxUpdate('diagnosis', val, diagnosisOptions)"
              />
              <div v-if="getSavedOptions('diagnosis').length" class="d-flex flex-wrap ga-1 mt-1">
                <v-chip
                  v-for="opt in getSavedOptions('diagnosis')"
                  :key="opt.id"
                  size="small"
                  closable
                  @click:close="deleteDropdownOption(opt.id)"
                >
                  {{ opt.value }}
                </v-chip>
              </div>
            </v-col>
            <!-- Remarks -->
            <v-col cols="12">
              <v-textarea
                v-model="form.remarks"
                label="Remarks"
                variant="outlined"
                density="comfortable"
                rows="2"
                placeholder="Details of incomplete work or additional notes"
              />
            </v-col>

            <!-- Mileage — Vehicle only — comma-formatted display -->
            <!-- WHAT: Binds to mileageDisplay (the formatted text) not form.mileage (the number) -->
            <!-- WHY: type="number" cannot show commas — we handle formatting manually -->
            <v-col cols="12" sm="6" v-if="selectedAssetType === 'Vehicle'">
              <v-text-field
                v-model="mileageDisplay"
                label="Mileage (km)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 12,000"
                autocomplete="off"
                @input="onMileageInput"
                @blur="onMileageBlur"
              />
            </v-col>

            <!-- Hours of Operation — Non-Vehicular only -->
            <v-col cols="12" sm="6" v-if="selectedAssetType === 'Non-Vehicular'">
              <v-text-field
                v-model="form.hours_of_operation"
                label="Hours of Operation"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 250"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="costDisplay"
                label="Cost (₱)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 1,250"
                autocomplete="off"
                @input="onCostInput"
                @blur="onCostBlur"
              />
            </v-col>

            <!-- Date Completed — always visible, auto-fills when status = Completed -->
            <!-- WHY: User may want to enter date completed even before changing status -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="dateCompletedDisplay"
                label="Date Completed (MM/DD/YY)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 04/24/26"
                autocomplete="off"
                hint="Auto-fills when status is set to Completed. You can change it."
                persistent-hint
                @input="onDateCompletedInput"
              />
            </v-col>

            <!-- Status -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="['In Progress', 'Completed', 'Cancelled']"
                label="Status"
                variant="outlined"
                density="comfortable"
                @update:modelValue="onStatusChange"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveRequest">
            {{ isEditing ? 'Save Changes' : 'Submit Request' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Details Dialog -->
    <v-dialog v-model="viewDialog" max-width="550">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0 d-flex align-center justify-space-between">
          <span class="text-h6">Request Details</span>
          <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
        </v-card-title>

        <v-card-text class="pa-4" v-if="selectedRequest">
          <div class="mb-4 d-flex ga-2 flex-wrap">
            <v-chip color="primary" size="large" variant="tonal">
              <v-icon start>mdi-file-document</v-icon>
              {{ selectedRequest.request_no }}
            </v-chip>
            <v-chip
              :color="selectedRequest.asset_type === 'Vehicle' ? 'info' : 'warning'"
              size="large"
              variant="tonal"
            >
              {{ selectedRequest.asset_type }}
            </v-chip>
            <v-chip :color="statusColor(selectedRequest.status)" size="large" variant="tonal">
              {{ selectedRequest.status }}
            </v-chip>
          </div>

          <v-list lines="two" density="compact">
            <v-list-item
              subtitle="Date of Request"
              :title="selectedRequest.date_of_request || '—'"
            />

            <v-list-item subtitle="Date Completed" :title="selectedRequest.date_completed || '—'" />

            <v-list-item subtitle="Asset" :title="getAssetName(selectedRequest.vehicle_id)" />
            <v-list-item subtitle="Requisitioner" :title="selectedRequest.requisitioner || '—'" />
            <v-list-item
              subtitle="Problem Encountered"
              :title="selectedRequest.problem_details || '—'"
            />
            <v-list-item
              subtitle="Diagnosis & Action Taken"
              :title="selectedRequest.work_details || '—'"
            />
            <v-list-item subtitle="Remarks" :title="selectedRequest.remarks || '—'" />
            <v-list-item subtitle="Conducted By" :title="selectedRequest.conducted_by || '—'" />
            <v-list-item
              v-if="selectedRequest.asset_type === 'Vehicle'"
              subtitle="Mileage"
              :title="selectedRequest.mileage ? selectedRequest.mileage + ' km' : '—'"
            />
            <v-list-item
              v-if="selectedRequest.asset_type === 'Non-Vehicular'"
              subtitle="Hours of Operation"
              :title="
                selectedRequest.hours_of_operation
                  ? selectedRequest.hours_of_operation + ' hrs'
                  : '—'
              "
            />
            <v-list-item
              subtitle="Cost"
              :title="
                selectedRequest.cost ? '₱' + Number(selectedRequest.cost).toLocaleString() : '—'
              "
            />
            <v-list-item
              v-if="selectedRequest.status === 'Completed'"
              subtitle="Date Completed"
              :title="
                selectedRequest.date_completed ? formatDate(selectedRequest.date_completed) : '—'
              "
            />
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-4 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete Request?</h3>
          <p class="text-medium-emphasis">
            Are you sure you want to delete request
            <strong>{{ selectedRequest?.request_no }}</strong
            >? This cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteRequest">
            Delete
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
//import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

// const router = useRouter()

async function quickUpdateStatus(item, newStatus) {
  const payload = { status: newStatus }
  if (newStatus === 'Completed' && !item.date_completed) {
    payload.date_completed = new Date().toISOString().split('T')[0]
  }
  const { error } = await supabase
    .from('vehicle_service_requests')
    .update(payload)
    .eq('id', item.id)

  if (error) {
    showSnackbar('Failed to update status', 'error')
  } else {
    item.status = newStatus
    if (payload.date_completed) item.date_completed = payload.date_completed
    showSnackbar('Status updated', 'success')
  }
}

// ---- DATA ----
const requests = ref([])
const assetList = ref([])

// WHY: These hold the dropdown options loaded from Supabase.
// WHAT: Each item looks like: { id, category, value }
// HOW: We filter by category when building each dropdown list.
const dropdownOptions = ref([])

// WHAT: Loads all dropdown options from the database in one call.
// WHY: One call for all categories is cheaper than 3 separate calls.
async function fetchDropdownOptions() {
  const { data, error } = await supabase
    .from('dropdown_options')
    .select('*')
    .order('value', { ascending: true })
  if (!error) dropdownOptions.value = data
}

// WHAT: Saves a new option to the database.
// WHY: When the user types a name that doesn't exist, this saves it
//      so it appears in the dropdown the next time the form opens.
// CONNECTS TO: addDropdownOption is called by onComboboxUpdate
async function addDropdownOption(category, value) {
  const trimmed = value?.trim()
  if (!trimmed) return

  // Prevent duplicates — check if this value already exists for this category
  const exists = dropdownOptions.value.some(
    (o) => o.category === category && o.value.toLowerCase() === trimmed.toLowerCase(),
  )
  if (exists) return

  const { data, error } = await supabase
    .from('dropdown_options')
    .insert({ category, value: trimmed })
    .select()
    .single()

  // Add to local list immediately so the UI updates without a full re-fetch
  if (!error && data) dropdownOptions.value.push(data)
}

// WHAT: Deletes one option from the database by its ID.
// WHY: Users need to remove incorrect or outdated entries.
// CONNECTS TO: Called by the X button in each combobox item slot
async function deleteDropdownOption(id) {
  const { error } = await supabase.from('dropdown_options').delete().eq('id', id)
  if (!error) {
    // Remove from local list immediately — no re-fetch needed
    dropdownOptions.value = dropdownOptions.value.filter((o) => o.id !== id)
  }
}
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref('All')
const yearFilter = ref(null)

const yearOptions = computed(() => {
  const cur = new Date().getFullYear()
  return [
    { title: 'All Years', value: null },
    { title: String(cur + 1), value: cur + 1 },
    { title: String(cur), value: cur },
    { title: String(cur - 1), value: cur - 1 },
    { title: String(cur - 2), value: cur - 2 },
  ]
})
const vehicleFilter = ref('All')
const assetTypeFilter = ref('All')
const selectedAssetType = ref('Vehicle')

// ---- DIALOGS ----
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedRequest = ref(null)

// ---- FORM ----
const defaultForm = {
  request_no: '',
  date_of_request: '',

  vehicle_id: null,
  asset_type: 'Vehicle',
  requisitioner: '',
  problem_details: '',
  work_details: '',
  conducted_by: '',
  mileage: null,
  hours_of_operation: null,
  cost: null,
  status: 'In Progress',
  date_completed: null,
  remarks: '',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ---- SNACKBAR ----
const snackbar = ref({ show: false, message: '', color: 'success' })

// ---- TABLE HEADERS ----
const headers = [
  { title: 'Request No.', key: 'request_no', sortable: true },
  { title: 'Date Start', key: 'date_of_request', sortable: true },
  { title: 'Asset Type', key: 'asset_type', sortable: true },
  { title: 'Asset', key: 'asset_name', sortable: true },
  { title: 'Requisitioner', key: 'requisitioner', sortable: false },
  { title: 'Problem', key: 'problem_details', sortable: false },
  { title: 'Diagnosis & Action Taken', key: 'work_details', sortable: false },
  { title: 'Remarks', key: 'remarks', sortable: false },
  // WHY: Mileage and Cost were in the form and database but had no table column
  { title: 'Mileage (km)', key: 'mileage', sortable: false },
  { title: 'Cost (₱)', key: 'cost', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date Completed', key: 'date_completed', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// ---- COMPUTED ----

// WHAT: The default names always available in Requisitioner and Conducted By.
// WHY: These people are always in the list even before anyone adds custom entries.
const DEFAULT_REQUISITIONERS = [
  'Adonis Mateo',
  'Albert Hora',
  'Allan M. Albero',
  'Ariel Ancheta',
  'Christopher F. Sison',
  'Concordio P. Lacre',
  'Jonathan Bahian',
  'Marlon Solis',
  'Ranold Marco',
  'Rene R. Longakit',
  'Retchie Capangpangan',
  'Rodrigo P. Villa',
  'Timoteo V. Umpad',
  'Verjelyn Capilitan',
]

// WHAT: The default options for Diagnosis & Action Taken.
const DEFAULT_DIAGNOSIS = [
  'Changed Engine Oil (7l) And 1 Pc. Oil Filter',
  'Stencilled Engine And Chassis Number',
  'Replaced Brake Pads',
  'Changed 7l Engine Oil, 1 Pc. Oil Filter',
  'Cleaned And Adjusted Brake',
  'Replaced Fuel Filter',
  'Repaired Grass Cutter',
  'Replaced Battery 11 Plates',
  'Changed Engine Oil (6l)',
  'Repacked Fr Wheel Bearing (Left & Right)',
  'Replaced Wiper Blade',
  'Replaced Primary Clutch Assembly',
  'Replaced Timing Belt',
  'Checked, Cleaned And Adjusted Brake; Fr & Rr Brakes',
  'Replaced Solenoid Switch',
  'Replaced Alternator Belt',
  'Cleaned And Adjusted Rr Brake',
  'Cleaned And Adjusted Brake - Front & Rear',
  'Repaired Horn; Re-wired',
  'Replaced Brake Lining',
  'Replaced Engine Support (Left And Right)',
  'Replaced 2 Pcs. Tires',
  'Replaced 2 Pcs. Cross Bearing',
  'Replaced 2 Pcs. Tie Rod End (Left And Right)',
  'Replaced 2 Pcs. Rack End Rod (Left And Right)',
  'Replaced Tensioner Brg. (2 Pcs.)',
  'Replaced Air Cleaner Element',
  'Replaced 1 Set Brake Pad',
  'Repacked Wheel Bearing (Left And Right)',
]

// WHAT: Builds the Requisitioner dropdown list.
// HOW: Gets saved entries from Supabase, merges with defaults,
//      removes duplicates so the same name never appears twice.
// WHAT: Returns plain string arrays for the combobox items.
// WHY: Vuetify 4's virtual scroll crashes when we use object arrays
//      with a custom v-slot:item. Plain strings are stable and reliable.
// The delete UI is handled separately below each field.

const requisitionerOptions = computed(() => {
  const savedValues = dropdownOptions.value
    .filter((o) => o.category === 'requisitioner')
    .map((o) => o.value)
  const filteredDefaults = DEFAULT_REQUISITIONERS.filter(
    (d) => !savedValues.some((s) => s.toLowerCase() === d.toLowerCase()),
  )
  return [...savedValues, ...filteredDefaults]
})

// WHAT: Default options for the Conducted By field.
// WHY: These are the shops and technicians who actually perform the work.
//      This is a completely separate list from Requisitioner.
const DEFAULT_CONDUCTED_BY = [
  'Vergilio P. Villamor Jr.',
  'Redline Auto Parts',
  'Torralba Metalcraft, Inc.',
  'Gv Diesel Calibration Center',
  'Toyota Butuan',
  'Oro Asian Automotive Center Corp.',
  'Allan Velmote',
]

// WHAT: Builds the Conducted By dropdown list.
// HOW: Same pattern as Requisitioner — saved entries from Supabase first,
//      then defaults that aren't already saved.
const conductedByOptions = computed(() => {
  const savedValues = dropdownOptions.value
    .filter((o) => o.category === 'conducted_by')
    .map((o) => o.value)
  const filteredDefaults = DEFAULT_CONDUCTED_BY.filter(
    (d) => !savedValues.some((s) => s.toLowerCase() === d.toLowerCase()),
  )
  return [...savedValues, ...filteredDefaults]
})

// WHAT: Same logic for Diagnosis & Action Taken.
const diagnosisOptions = computed(() => {
  const savedValues = dropdownOptions.value
    .filter((o) => o.category === 'diagnosis')
    .map((o) => o.value)
  const filteredDefaults = DEFAULT_DIAGNOSIS.filter(
    (d) => !savedValues.some((s) => s.toLowerCase() === d.toLowerCase()),
  )
  return [...savedValues, ...filteredDefaults]
})
// WHAT: Returns only the SAVED (non-default) entries for a given category.
// WHY: These are shown below the combobox with an X button to delete them.
// CONNECTS TO: The "Manage saved options" chip display in the template.
function getSavedOptions(category) {
  return dropdownOptions.value.filter((o) => o.category === category)
}

const inProgressCount = computed(
  () => requests.value.filter((r) => r.status === 'In Progress').length,
)
const completedCount = computed(() => requests.value.filter((r) => r.status === 'Completed').length)
const cancelledCount = computed(() => requests.value.filter((r) => r.status === 'Cancelled').length)

// WHAT: Builds the grouped asset dropdown list for the form.
// WHY: Assets are grouped into Vehicles and Non-Vehicular with visual headers.
// HOW: Header items have disabled:true and class set directly on the object.
//      This is the Vuetify 4 stable way — using :item-props with a function
//      causes render crashes with virtual scroll.
const groupedAssetItems = computed(() => {
  const vehicles = assetList.value.filter(
    (a) => a.asset_type?.toLowerCase() === 'vehicle'
  )
  const nonVehicles = assetList.value.filter(
    (a) => a.asset_type === 'Non-Vehicular'
  )
  const items = []

  if (vehicles.length > 0) {
    // Header row — disabled so user cannot select it, styled as a label
    items.push({
      title: '── VEHICLES ──',
      value: '__header_vehicle__',
      disabled: true,
      class: 'text-primary font-weight-bold text-caption',
    })
    vehicles.forEach((v) =>
      items.push({
        title: v.asset_name,
        value: v.id,
      })
    )
  }

  if (nonVehicles.length > 0) {
    items.push({
      title: '── NON-VEHICULAR ──',
      value: '__header_nonvehicle__',
      disabled: true,
      class: 'text-primary font-weight-bold text-caption',
    })
    nonVehicles.forEach((v) =>
      items.push({
        title: v.asset_name,
        value: v.id,
      })
    )
  }

  return items
})

const assetOptions = computed(() => ['All', ...assetList.value.map((a) => a.asset_name)])

const filteredRequests = computed(() => {
  let result = requests.value

  if (assetTypeFilter.value !== 'All') {
    result = result.filter((r) => r.asset_type === assetTypeFilter.value)
  }
  if (statusFilter.value !== 'All') {
    result = result.filter((r) => r.status === statusFilter.value)
  }
   if (yearFilter.value !== null) {
    result = result.filter((r) => {
      const yr = r.date_of_request ? new Date(r.date_of_request + 'T00:00:00').getFullYear() : null
      return yr === yearFilter.value
    })
  }
  if (vehicleFilter.value !== 'All') {
    result = result.filter((r) => r.asset_name === vehicleFilter.value)
  }
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.request_no?.toLowerCase().includes(s) ||
        r.requisitioner?.toLowerCase().includes(s) ||
        r.problem_details?.toLowerCase().includes(s) ||
        r.asset_name?.toLowerCase().includes(s),
    )
  }

  return result
})

// ---- HELPERS ----
function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  const yy = String(dt.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

function statusColor(status) {
  const colors = {
    'In Progress': 'warning',
    Completed: 'success',
    Cancelled: 'error',
  }
  return colors[status] || 'grey'
}

function getAssetName(assetId) {
  const asset = assetList.value.find((a) => a.id === assetId)
  return asset ? asset.asset_name : '—'
}

function onAssetSelected(assetId) {
  // WHY: Guard against header items being selected accidentally
  if (!assetId || assetId === '__header_vehicle__' || assetId === '__header_nonvehicle__') {
    form.value.vehicle_id = null
    return
  }
  const asset = assetList.value.find((a) => a.id === assetId)
  if (asset) {
    selectedAssetType.value = asset.asset_type
    form.value.asset_type = asset.asset_type
    // WHY: Reset numeric fields when switching assets so stale values don't carry over
    form.value.mileage = null
    form.value.hours_of_operation = null
    mileageDisplay.value = ''
  }
}


async function generateRequestNo() {
  const year = new Date().getFullYear()
  const { data, error } = await supabase
    .from('vehicle_service_requests')
    .select('request_no')
    .like('request_no', `${year}-%`)
    .order('request_no', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) return `${year}-001`

  const lastNo = data[0].request_no
  const lastSequence = parseInt(lastNo.split('-')[1])
  const nextSequence = String(lastSequence + 1).padStart(3, '0')
  return `${year}-${nextSequence}`
}
// WHAT: Called when user picks or types a value in any combobox.
// WHY: v-combobox fires this for both existing picks AND new typed values.
//      If the value is new (not in the list), we save it to Supabase.
// RECEIVES:
//   category — which field this is ('requisitioner', 'conducted_by', 'diagnosis')
//   value    — what the user typed or selected (may be a string or an object)
//   options  — the current list for that field (used to check for duplicates)

async function onComboboxUpdate(category, value, optionsRef) {
  // Guard against undefined/null — Vuetify can fire this during render cycles
  if (value === undefined || value === null) return

  // Items are now plain strings, so value is always a string
  const text = String(value).trim()
  if (!text) return

  // Check if this value already exists in the current options list
  const exists = optionsRef.value.some((o) => o.toLowerCase() === text.toLowerCase())

  // Only save if it's genuinely new — not in defaults AND not already saved
  if (!exists) {
    await addDropdownOption(category, text)
  }
}

// WHAT: Converts user-typed dates into ISO format (YYYY-MM-DD) for the database.
// WHY: The database needs YYYY-MM-DD. Users type in multiple formats.
// HANDLES:
//   MM/DD/YY    → e.g. 04/24/26
//   MM/DD/YYYY  → e.g. 04/24/2026
//   MM-DD-YY    → e.g. 04-24-26
//   DD-Mon-YYYY → e.g. 10-Jan-2023
function parseFlexibleDate(val) {
  if (!val) return null
  const s = val.trim()

  // Handle: 10-Jan-2023 or 10-Jan-23 format
  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ]
  const alphaMatch = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/)
  if (alphaMatch) {
    const dd = alphaMatch[1].padStart(2, '0')
    const mo = monthNames.indexOf(alphaMatch[2].toLowerCase())
    if (mo === -1) return null
    const mm = String(mo + 1).padStart(2, '0')
    const yy = alphaMatch[3].length === 2 ? '20' + alphaMatch[3] : alphaMatch[3]
    const iso = `${yy}-${mm}-${dd}`
    return isNaN(new Date(iso).getTime()) ? null : iso
  }

  // Handle: MM/DD/YY, MM/DD/YYYY, MM-DD-YY, MM-DD-YYYY
  const parts = s.split(/[/-]/)
  if (parts.length === 3) {
    const mm = parts[0].padStart(2, '0')
    const dd = parts[1].padStart(2, '0')
    const yy = parts[2].length === 2 ? '20' + parts[2] : parts[2]
    const iso = `${yy}-${mm}-${dd}`
    return isNaN(new Date(iso).getTime()) ? null : iso
  }

  return null
}

// WHAT: Display variables for comma-formatted number fields.
// WHY: We can't use type="number" for comma display,
//      so we use a plain text field + these separate display refs.
// CONNECTS TO: mileageDisplay is bound to the Mileage text field in the template.
//              form.value.mileage holds the real number for saving to the database.
const mileageDisplay = ref('')
const costDisplay = ref('')

// WHAT: Called every time the user types in the Mileage field.
// HOW: Strips commas first, converts to a number, then reformats with commas for display.
function onMileageInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (raw === '' || isNaN(raw)) {
    form.value.mileage = null
  } else {
    form.value.mileage = Number(raw)
    mileageDisplay.value = Number(raw).toLocaleString()
  }
}
// WHAT: Called when user leaves (clicks away from) the Mileage field.
// WHY: Ensures the number is properly formatted after the user finishes typing.
function onMileageBlur() {
  mileageDisplay.value = form.value.mileage ? Number(form.value.mileage).toLocaleString() : ''
}

// Same input/blur pattern for the Cost field.
function onCostInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (raw === '' || isNaN(raw)) {
    form.value.cost = null
  } else {
    form.value.cost = Number(raw)
    costDisplay.value = Number(raw).toLocaleString()
  }
}
function onCostBlur() {
  costDisplay.value = form.value.cost ? Number(form.value.cost).toLocaleString() : ''
}

// WHAT: Display variables for date fields (what the user sees and types).
// WHY: The form stores ISO dates (YYYY-MM-DD) for the database,
//      but the user sees and types MM/DD/YY.
const dateOfRequestDisplay = ref('')
const dateCompletedDisplay = ref('')

// WHAT: Called every time the user types in the Date of Request field.
function onDateOfRequestInput(e) {
  const val = e.target.value
  dateOfRequestDisplay.value = val
  const iso = parseFlexibleDate(val)
  // Only update the real value if the date is valid
  if (iso) form.value.date_of_request = iso
}

// WHAT: Called every time the user types in the Date Completed field.
function onDateCompletedInput(e) {
  const val = e.target.value
  dateCompletedDisplay.value = val
  const iso = parseFlexibleDate(val)
  if (iso) form.value.date_completed = iso
}

function onStatusChange(status) {
  if (status === 'Completed' && !form.value.date_completed) {
    const todayIso = new Date().toISOString().split('T')[0]
    form.value.date_completed = todayIso
    // WHY: Also sync the display field so the user sees the auto-filled date
    dateCompletedDisplay.value = formatDate(todayIso)
  }
}
// ---- METHODS ----
async function fetchRequests() {
  loading.value = true
  const { data, error } = await supabase
    .from('vehicle_service_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    showSnackbar('Failed to load requests', 'error')
  } else {
    requests.value = data.map((r) => ({
      ...r,
      asset_name: getAssetName(r.vehicle_id),
    }))
  }
  loading.value = false
}

async function fetchAssets() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, asset_name, asset_type')
    .eq('status', 'Active')
    .order('asset_type')

  if (!error) assetList.value = data
}

// WHAT: Placeholder for Add Year — expand later when year-specific logic is needed.
function addYear() {
  showSnackbar('Add Year feature coming soon', 'info')
}

async function openAddDialog() {
  isEditing.value = false
  errors.value = {}
  selectedAssetType.value = 'Vehicle'
  const requestNo = await generateRequestNo()
  const todayIso = new Date().toISOString().split('T')[0]
  form.value = {
    ...defaultForm,
    request_no: requestNo,
    date_of_request: todayIso,
  }
  // WHY: Sync display fields so the date and number inputs show correctly
  //      when a new form opens. Without this they would be blank or stale.
  mileageDisplay.value = ''
  costDisplay.value = ''
  dateOfRequestDisplay.value = formatDate(todayIso)
  dateCompletedDisplay.value = ''
  formDialog.value = true
}

function openEditDialog(request) {
  isEditing.value = true
  selectedRequest.value = request
  form.value = { ...request }
  selectedAssetType.value = request.asset_type || 'Vehicle'
  errors.value = {}
  // WHY: When editing an existing record, pre-fill the display fields
  //      with the already-saved values so the user sees them correctly.
  mileageDisplay.value = request.mileage ? Number(request.mileage).toLocaleString() : ''
  costDisplay.value = request.cost ? Number(request.cost).toLocaleString() : ''
  dateOfRequestDisplay.value = request.date_of_request ? formatDate(request.date_of_request) : ''
  dateCompletedDisplay.value = request.date_completed ? formatDate(request.date_completed) : ''
  formDialog.value = true
}

function viewRequest(request) {
  selectedRequest.value = request
  viewDialog.value = true
}

function openDeleteDialog(request) {
  selectedRequest.value = request
  deleteDialog.value = true
}

function closeFormDialog() {
  formDialog.value = false
  form.value = { ...defaultForm }
  selectedAssetType.value = 'Vehicle'
  errors.value = {}
}

function validateForm() {
  errors.value = {}
  if (!form.value.date_of_request) errors.value.date_of_request = 'Date is required'
  if (!form.value.vehicle_id) errors.value.vehicle_id = 'Asset is required'
  if (!form.value.problem_details?.trim())
    errors.value.problem_details = 'Problem details are required'
  return Object.keys(errors.value).length === 0
}

async function saveRequest() {
  if (!validateForm()) return
  saving.value = true

  const payload = {
    request_no: form.value.request_no,
    date_of_request: form.value.date_of_request,
    date_completed: form.value.date_completed || null,
    vehicle_id: form.value.vehicle_id,
    asset_type: form.value.asset_type,
    requisitioner: form.value.requisitioner,
    problem_details: form.value.problem_details,
    work_details: form.value.work_details,
    conducted_by: form.value.conducted_by,
    mileage: selectedAssetType.value === 'Vehicle' ? form.value.mileage || null : null,
    hours_of_operation:
      selectedAssetType.value === 'Non-Vehicular' ? form.value.hours_of_operation || null : null,
    cost: form.value.cost || null,
    status: form.value.status,
    // WHY: remarks was missing from the payload — it was saved in the form
    //      but never sent to Supabase, so it always disappeared after saving.
    remarks: form.value.remarks || null,
  }

  if (isEditing.value) {
    const { error } = await supabase
      .from('vehicle_service_requests')
      .update(payload)
      .eq('id', form.value.id)

    if (error) {
      showSnackbar('Failed to update request', 'error')
    } else {
      showSnackbar('Request updated successfully', 'success')
      closeFormDialog()
      await fetchRequests()
    }
  } else {
    const { error } = await supabase.from('vehicle_service_requests').insert(payload)

    if (error) {
      showSnackbar('Failed to submit request', 'error')
    } else {
      showSnackbar('Request submitted successfully', 'success')
      closeFormDialog()
      await fetchRequests()
    }
  }

  saving.value = false
}

async function deleteRequest() {
  deleting.value = true
  const { error } = await supabase
    .from('vehicle_service_requests')
    .delete()
    .eq('id', selectedRequest.value.id)

  if (error) {
    showSnackbar('Failed to delete request', 'error')
  } else {
    showSnackbar('Request deleted successfully', 'success')
    deleteDialog.value = false
    await fetchRequests()
  }
  deleting.value = false
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// ---- LIFECYCLE ----
onMounted(async () => {
  // WHY: All three must load before the form opens.
  //      fetchDropdownOptions loads the saved names for the comboboxes.
  await fetchAssets()
  await fetchDropdownOptions()
  await fetchRequests()
})
</script>
