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
          <v-btn variant="outlined" prepend-icon="mdi-history" @click="openEFHRReport">
            EFHR Report
          </v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
            New Request
          </v-btn>
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
          <v-col cols="12" sm="3">
            <v-select
              v-model="statusFilter"
              :items="['All', 'In Progress', 'Completed', 'Cancelled']"
              label="Status"
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

          <!-- Status -->
          <!-- Status -->
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

              <template v-slot:item.date_completed="{ item }">
                {{ item.date_completed ? formatDate(item.date_completed) : '—' }}
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

            <!-- Date -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.date_of_request"
                label="Date of Request *"
                variant="outlined"
                density="comfortable"
                type="date"
                :error-messages="errors.date_of_request"
              />
            </v-col>

            <!-- Asset (grouped dropdown) -->
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
                :item-props="itemProps"
                @update:modelValue="onAssetSelected"
              />
            </v-col>

            <!-- Requisitioner -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.requisitioner"
                label="Requisitioner"
                variant="outlined"
                density="comfortable"
                placeholder="Name of person requesting"
              />
            </v-col>

            <!-- Conducted By -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.conducted_by"
                label="Conducted By"
                variant="outlined"
                density="comfortable"
                placeholder="Technician name"
              />
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

            <!-- Diagnosis & Action Taken -->
            <v-col cols="12">
              <v-textarea
                v-model="form.work_details"
                label="Diagnosis & Action Taken"
                variant="outlined"
                density="comfortable"
                rows="3"
                placeholder="Describe diagnosis and actions taken"
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
                placeholder="Details of incomplete work or additional notes"
              />
            </v-col>

            <!-- Mileage — Vehicle only -->
            <v-col cols="12" sm="6" v-if="selectedAssetType === 'Vehicle'">
              <v-text-field
                v-model="form.mileage"
                label="Mileage (km)"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 43117"
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

            <!-- Cost -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.cost"
                label="Cost (₱)"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 1500"
              />
            </v-col>

            <!-- Date Completed (auto-filled, editable) -->
            <v-col v-if="form.status === 'Completed'" cols="12" sm="6">
              <v-text-field
                v-model="form.date_completed"
                label="Date Completed"
                type="date"
                variant="outlined"
                density="comfortable"
                hint="Auto-filled when status is set to Completed"
                persistent-hint
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
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

function openEFHRReport() {
  const asset = assetList.value.find((a) => a.asset_name === vehicleFilter.value)
  router.push({
    path: '/efhr-report',
    query: { vehicleId: asset?.id || '' },
  })
}

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
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref('All')
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
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date Completed', key: 'date_completed', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// ---- COMPUTED ----
const inProgressCount = computed(
  () => requests.value.filter((r) => r.status === 'In Progress').length,
)
const completedCount = computed(() => requests.value.filter((r) => r.status === 'Completed').length)
const cancelledCount = computed(() => requests.value.filter((r) => r.status === 'Cancelled').length)

// Grouped asset items for dropdown
const groupedAssetItems = computed(() => {
  const vehicles = assetList.value.filter((a) => a.asset_type === 'Vehicle')
  const nonVehicles = assetList.value.filter((a) => a.asset_type === 'Non-Vehicular')
  const items = []

  if (vehicles.length > 0) {
    items.push({
      title: '── VEHICLE ──',
      value: '__header_vehicle__',
      assetType: null,
      isHeader: true,
    })
    vehicles.forEach((v) =>
      items.push({
        title: v.asset_name,
        value: v.id,
        assetType: v.asset_type,
        isHeader: false,
      }),
    )
  }

  if (nonVehicles.length > 0) {
    items.push({
      title: '── NON-VEHICULAR ──',
      value: '__header_nonvehicle__',
      assetType: null,
      isHeader: true,
    })
    nonVehicles.forEach((v) =>
      items.push({
        title: v.asset_name,
        value: v.id,
        assetType: v.asset_type,
        isHeader: false,
      }),
    )
  }

  return items
})

// Item props — disable header items so they can't be selected
function itemProps(item) {
  return {
    disabled: item.isHeader,
    class: item.isHeader ? 'text-primary font-weight-bold text-caption' : '',
  }
}

const assetOptions = computed(() => ['All', ...assetList.value.map((a) => a.asset_name)])

const filteredRequests = computed(() => {
  let result = requests.value

  if (assetTypeFilter.value !== 'All') {
    result = result.filter((r) => r.asset_type === assetTypeFilter.value)
  }
  if (statusFilter.value !== 'All') {
    result = result.filter((r) => r.status === statusFilter.value)
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
  // Ignore header items
  if (!assetId || assetId === '__header_vehicle__' || assetId === '__header_nonvehicle__') {
    form.value.vehicle_id = null
    return
  }
  const asset = assetList.value.find((a) => a.id === assetId)
  if (asset) {
    selectedAssetType.value = asset.asset_type
    form.value.asset_type = asset.asset_type
    form.value.mileage = null
    form.value.hours_of_operation = null
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
function onStatusChange(status) {
  if (status === 'Completed' && !form.value.date_completed) {
    form.value.date_completed = new Date().toISOString().split('T')[0]
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

async function openAddDialog() {
  isEditing.value = false
  errors.value = {}
  selectedAssetType.value = 'Vehicle'
  const requestNo = await generateRequestNo()
  form.value = {
    ...defaultForm,
    request_no: requestNo,
    date_of_request: new Date().toISOString().split('T')[0],
  }
  formDialog.value = true
}

function openEditDialog(request) {
  isEditing.value = true
  selectedRequest.value = request
  form.value = { ...request }
  selectedAssetType.value = request.asset_type || 'Vehicle'
  errors.value = {}
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
  await fetchAssets()
  await fetchRequests()
})
</script>
