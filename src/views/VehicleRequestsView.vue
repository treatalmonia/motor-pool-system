<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">Vehicle Service Requests</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Track and manage corrective maintenance requests
            </p>
          </div>
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
        <v-row class="mb-2">
          <v-col cols="12" sm="4">
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
              :items="vehicleOptions"
              label="Vehicle"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>

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
          <!-- Request No Column -->
          <template v-slot:item.request_no="{ item }">
            <span class="font-weight-bold text-primary">
              {{ item.request_no }}
            </span>
          </template>

          <!-- Status Column -->
          <template v-slot:item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small" variant="tonal">
              {{ item.status }}
            </v-chip>
          </template>

          <!-- Actions Column -->
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
            <!-- Request No - auto generated, read only -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.request_no"
                label="Request No."
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
                hint="Auto-generated"
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

            <!-- Vehicle -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.vehicle_id"
                :items="vehicleList"
                item-title="unit_name"
                item-value="id"
                label="Vehicle *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.vehicle_id"
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

            <!-- Problem Details -->
            <v-col cols="12">
              <v-textarea
                v-model="form.problem_details"
                label="Problem / Details of Request *"
                variant="outlined"
                density="comfortable"
                rows="3"
                :error-messages="errors.problem_details"
                placeholder="Describe the problem or service needed"
              />
            </v-col>

            <!-- Work Details -->
            <v-col cols="12">
              <v-textarea
                v-model="form.work_details"
                label="Work Details"
                variant="outlined"
                density="comfortable"
                rows="3"
                placeholder="Describe the work done"
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

            <!-- Mileage -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.mileage"
                label="Mileage (km)"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 43117"
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

            <!-- Status -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="['In Progress', 'Completed', 'Cancelled']"
                label="Status"
                variant="outlined"
                density="comfortable"
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
          <!-- Request No Badge -->
          <div class="mb-4">
            <v-chip color="primary" size="large" variant="tonal">
              <v-icon start>mdi-file-document</v-icon>
              {{ selectedRequest.request_no }}
            </v-chip>
            <v-chip
              :color="statusColor(selectedRequest.status)"
              size="large"
              variant="tonal"
              class="ml-2"
            >
              {{ selectedRequest.status }}
            </v-chip>
          </div>

          <v-list lines="two" density="compact">
            <v-list-item
              subtitle="Date of Request"
              :title="selectedRequest.date_of_request || '—'"
            />
            <v-list-item subtitle="Vehicle" :title="getVehicleName(selectedRequest.vehicle_id)" />
            <v-list-item subtitle="Requisitioner" :title="selectedRequest.requisitioner || '—'" />
            <v-list-item
              subtitle="Problem / Details"
              :title="selectedRequest.problem_details || '—'"
            />
            <v-list-item subtitle="Work Done" :title="selectedRequest.work_details || '—'" />
            <v-list-item subtitle="Conducted By" :title="selectedRequest.conducted_by || '—'" />
            <v-list-item
              subtitle="Mileage"
              :title="selectedRequest.mileage ? selectedRequest.mileage + ' km' : '—'"
            />
            <v-list-item
              subtitle="Cost"
              :title="
                selectedRequest.cost ? '₱' + Number(selectedRequest.cost).toLocaleString() : '—'
              "
            />
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-4 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete Request?</h3>
          <p class="text-medium-emphasis">
            Are you sure you want to delete request
            <strong>{{ selectedRequest?.request_no }}</strong
            >? This action cannot be undone.
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
import { supabase } from '../supabase'

// ---- DATA ----
const requests = ref([])
const vehicleList = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref('All')
const vehicleFilter = ref('All')

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
  requisitioner: '',
  problem_details: '',
  work_details: '',
  conducted_by: '',
  mileage: null,
  cost: null,
  status: 'In Progress',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ---- SNACKBAR ----
const snackbar = ref({ show: false, message: '', color: 'success' })

// ---- TABLE HEADERS ----
const headers = [
  { title: 'Request No.', key: 'request_no', sortable: true },
  { title: 'Date', key: 'date_of_request', sortable: true },
  { title: 'Vehicle', key: 'vehicle_name', sortable: true },
  { title: 'Requisitioner', key: 'requisitioner', sortable: false },
  { title: 'Problem', key: 'problem_details', sortable: false },
  { title: 'Conducted By', key: 'conducted_by', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// ---- COMPUTED ----
const inProgressCount = computed(
  () => requests.value.filter((r) => r.status === 'In Progress').length,
)
const completedCount = computed(() => requests.value.filter((r) => r.status === 'Completed').length)
const cancelledCount = computed(() => requests.value.filter((r) => r.status === 'Cancelled').length)

const vehicleOptions = computed(() => ['All', ...vehicleList.value.map((v) => v.unit_name)])

const filteredRequests = computed(() => {
  let result = requests.value

  if (statusFilter.value !== 'All') {
    result = result.filter((r) => r.status === statusFilter.value)
  }

  if (vehicleFilter.value !== 'All') {
    result = result.filter((r) => r.vehicle_name === vehicleFilter.value)
  }

  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.request_no?.toLowerCase().includes(s) ||
        r.requisitioner?.toLowerCase().includes(s) ||
        r.problem_details?.toLowerCase().includes(s) ||
        r.vehicle_name?.toLowerCase().includes(s),
    )
  }

  return result
})

// ---- HELPERS ----
function statusColor(status) {
  const colors = {
    'In Progress': 'warning',
    Completed: 'success',
    Cancelled: 'error',
  }
  return colors[status] || 'grey'
}

function getVehicleName(vehicleId) {
  const vehicle = vehicleList.value.find((v) => v.id === vehicleId)
  return vehicle ? vehicle.unit_name : '—'
}

// Auto-generate request number: YYYY-001 format
async function generateRequestNo() {
  const year = new Date().getFullYear()

  const { data, error } = await supabase
    .from('vehicle_service_requests')
    .select('request_no')
    .like('request_no', `${year}-%`)
    .order('request_no', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return `${year}-001`
  }

  const lastNo = data[0].request_no
  const lastSequence = parseInt(lastNo.split('-')[1])
  const nextSequence = String(lastSequence + 1).padStart(3, '0')
  return `${year}-${nextSequence}`
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
    // Attach vehicle name to each request
    requests.value = data.map((r) => ({
      ...r,
      vehicle_name: getVehicleName(r.vehicle_id),
    }))
  }

  loading.value = false
}

async function fetchVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, unit_name')
    .eq('status', 'Active')
    .order('unit_name')

  if (!error) {
    vehicleList.value = data
  }
}

async function openAddDialog() {
  isEditing.value = false
  errors.value = {}
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
  errors.value = {}
}

function validateForm() {
  errors.value = {}
  if (!form.value.date_of_request) errors.value.date_of_request = 'Date is required'
  if (!form.value.vehicle_id) errors.value.vehicle_id = 'Vehicle is required'
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
    vehicle_id: form.value.vehicle_id,
    requisitioner: form.value.requisitioner,
    problem_details: form.value.problem_details,
    work_details: form.value.work_details,
    conducted_by: form.value.conducted_by,
    mileage: form.value.mileage || null,
    cost: form.value.cost || null,
    status: form.value.status,
  }

  if (isEditing.value) {
    const { error } = await supabase
      .from('vehicle_service_requests')
      .update(payload)
      .eq('id', form.value.id)

    if (error) {
      //console.log('UPDATE ERROR:', error) // 👈 Add this(for debugging)
      showSnackbar('Failed to update request', 'error')
    } else {
      showSnackbar('Request updated successfully', 'success')
      closeFormDialog()
      await fetchRequests()
    }
  } else {
    const { error } = await supabase.from('vehicle_service_requests').insert(payload)

    if (error) {
      //console.log('INSERT ERROR:', error) // 👈 Add this(for debugging)
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
  await fetchVehicles()
  await fetchRequests()
})
</script>
