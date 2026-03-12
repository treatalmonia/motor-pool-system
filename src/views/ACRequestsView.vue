<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">AC Service Requests</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Track and manage air conditioner service requests
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
              <p class="text-medium-emphasis text-body-2">Pending</p>
              <p class="text-h5 font-weight-bold">{{ pendingCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="info" variant="tonal" size="48">
              <v-icon>mdi-account-wrench</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Forwarded to Tech.</p>
              <p class="text-h5 font-weight-bold">{{ forwardedCount }}</p>
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
    </v-row>

    <!-- Table -->
    <v-card rounded="lg" elevation="0" border>
      <v-card-text>
        <!-- Filters -->
        <v-row class="mb-2">
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
              v-model="statusFilter"
              :items="['All', 'Pending', 'Forwarded to Tech.', 'Completed']"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="buildingFilter"
              :items="['All', ...buildings]"
              label="Building"
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
          loading-text="Loading AC requests..."
          no-data-text="No AC service requests found"
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
            {{ isEditing ? 'Edit AC Service Request' : 'New AC Service Request' }}
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

            <!-- Date Received -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.date_received"
                label="Date Received *"
                variant="outlined"
                density="comfortable"
                type="date"
                :error-messages="errors.date_received"
              />
            </v-col>

            <v-combobox
              v-model="selectedBuilding"
              :items="buildings"
              label="Building *"
              variant="outlined"
              density="comfortable"
              :error-messages="errors.building"
              hint="Select or type a new building"
              persistent-hint
              @update:modelValue="onBuildingChange"
            />

            <!-- AC Unit (filtered by building) -->
            <v-combobox
              v-model="form.area_room"
              :items="filteredAcUnits.map((u) => u.display_name)"
              label="AC Unit / Room *"
              variant="outlined"
              density="comfortable"
              :error-messages="errors.ac_unit_id"
              :disabled="!selectedBuilding"
              hint="Select or type a room name"
              persistent-hint
            />

            <!-- Details of Request -->
            <v-col cols="12">
              <v-textarea
                v-model="form.details_of_request"
                label="Details of Request *"
                variant="outlined"
                density="comfortable"
                rows="3"
                :error-messages="errors.details_of_request"
                placeholder="Describe the problem or service needed"
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
                placeholder="Additional notes or resolution details"
              />
            </v-col>

            <!-- Status -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="['Pending', 'Forwarded to Tech.', 'Completed']"
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
    <v-dialog v-model="viewDialog" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0 d-flex align-center justify-space-between">
          <span class="text-h6">Request Details</span>
          <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
        </v-card-title>

        <v-card-text class="pa-4" v-if="selectedRequest">
          <!-- Badges -->
          <div class="mb-4 d-flex ga-2 flex-wrap">
            <v-chip color="primary" size="large" variant="tonal">
              <v-icon start>mdi-file-document</v-icon>
              {{ selectedRequest.request_no }}
            </v-chip>
            <v-chip :color="statusColor(selectedRequest.status)" size="large" variant="tonal">
              {{ selectedRequest.status }}
            </v-chip>
          </div>

          <v-list lines="two" density="compact">
            <v-list-item subtitle="Date Received" :title="selectedRequest.date_received || '—'" />
            <v-list-item subtitle="Building" :title="selectedRequest.building || '—'" />
            <v-list-item
              subtitle="Area / Room"
              :title="getAcUnitRoom(selectedRequest.ac_unit_id)"
            />
            <v-list-item
              subtitle="Details of Request"
              :title="selectedRequest.details_of_request || '—'"
            />
            <v-list-item subtitle="Remarks" :title="selectedRequest.remarks || '—'" />
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
import { supabase } from '../supabase'

// ---- DATA ----
const requests = ref([])
const acUnitList = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref('All')
const buildingFilter = ref('All')
const selectedBuilding = ref('')

// ---- BUILDINGS ----
const buildings = ref([])

// ---- DIALOGS ----
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedRequest = ref(null)

// ---- FORM ----
const defaultForm = {
  request_no: '',
  date_received: '',
  ac_unit_id: null,
  building: '',
  area_room: '',
  details_of_request: '',
  remarks: '',
  status: 'Pending',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ---- SNACKBAR ----
const snackbar = ref({ show: false, message: '', color: 'success' })

// ---- TABLE HEADERS ----
const headers = [
  { title: 'Request No.', key: 'request_no', sortable: true },
  { title: 'Date Received', key: 'date_received', sortable: true },
  { title: 'Building', key: 'building', sortable: true },
  { title: 'Area / Room', key: 'area_room', sortable: false },
  { title: 'Details', key: 'details_of_request', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// ---- COMPUTED ----
const pendingCount = computed(() => requests.value.filter((r) => r.status === 'Pending').length)
const forwardedCount = computed(
  () => requests.value.filter((r) => r.status === 'Forwarded to Tech.').length,
)
const completedCount = computed(() => requests.value.filter((r) => r.status === 'Completed').length)

const filteredAcUnits = computed(() => {
  if (!selectedBuilding.value) return []
  return acUnitList.value
    .filter((u) => u.building === selectedBuilding.value)
    .map((u) => ({
      ...u,
      display_name: `${u.floor} — ${u.area_room}`,
    }))
})

const filteredRequests = computed(() => {
  let result = requests.value

  if (statusFilter.value !== 'All') {
    result = result.filter((r) => r.status === statusFilter.value)
  }
  if (buildingFilter.value !== 'All') {
    result = result.filter((r) => r.building === buildingFilter.value)
  }
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.request_no?.toLowerCase().includes(s) ||
        r.building?.toLowerCase().includes(s) ||
        r.area_room?.toLowerCase().includes(s) ||
        r.details_of_request?.toLowerCase().includes(s),
    )
  }

  return result
})

// ---- HELPERS ----
function statusColor(status) {
  const colors = {
    Pending: 'warning',
    'Forwarded to Tech.': 'info',
    Completed: 'success',
  }
  return colors[status] || 'grey'
}

function getAcUnitRoom(acUnitId) {
  const unit = acUnitList.value.find((u) => u.id === acUnitId)
  return unit ? `${unit.floor} — ${unit.area_room}` : '—'
}

function onBuildingChange() {
  form.value.ac_unit_id = null
}

// Auto-generate AC request number: AC-YY-001
async function generateRequestNo() {
  const year = String(new Date().getFullYear()).slice(-2)
  const prefix = `AC-${year}-`

  const { data, error } = await supabase
    .from('ac_service_requests')
    .select('request_no')
    .like('request_no', `${prefix}%`)
    .order('request_no', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return `${prefix}001`
  }

  const lastNo = data[0].request_no
  const lastSequence = parseInt(lastNo.split('-')[2])
  const nextSequence = String(lastSequence + 1).padStart(3, '0')
  return `${prefix}${nextSequence}`
}

// ---- METHODS ----
async function fetchBuildings() {
  const { data, error } = await supabase.from('buildings').select('name').order('name')
  if (!error) buildings.value = data.map((b) => b.name)
}

async function fetchRequests() {
  loading.value = true

  const { data, error } = await supabase
    .from('ac_service_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    showSnackbar('Failed to load AC requests', 'error')
  } else {
    requests.value = data.map((r) => ({
      ...r,
      area_room: getAcUnitRoom(r.ac_unit_id),
    }))
  }

  loading.value = false
}

async function fetchAcUnits() {
  const { data, error } = await supabase
    .from('ac_units')
    .select('id, building, floor, area_room')
    .eq('status', 'Active')
    .order('building')

  if (!error) {
    acUnitList.value = data
  }
}

async function openAddDialog() {
  isEditing.value = false
  errors.value = {}
  selectedBuilding.value = ''
  const requestNo = await generateRequestNo()
  form.value = {
    ...defaultForm,
    request_no: requestNo,
    date_received: new Date().toISOString().split('T')[0],
  }
  formDialog.value = true
}

function openEditDialog(request) {
  isEditing.value = true
  selectedRequest.value = request
  form.value = { ...request }
  selectedBuilding.value = request.building
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
  selectedBuilding.value = ''
  errors.value = {}
}

function validateForm() {
  errors.value = {}
  if (!form.value.date_received) errors.value.date_received = 'Date is required'
  if (!selectedBuilding.value) errors.value.building = 'Building is required'
  if (!form.value.area_room?.trim()) errors.value.ac_unit_id = 'AC Unit / Room is required'
  if (!form.value.details_of_request?.trim())
    errors.value.details_of_request = 'Details of request are required'
  return Object.keys(errors.value).length === 0
}

async function saveRequest() {
  if (!validateForm()) return
  saving.value = true

  const payload = {
    request_no: form.value.request_no,
    date_received: form.value.date_received,

    ac_unit_id: null,
    building: selectedBuilding.value,
    area_room: form.value.area_room || '',

    details_of_request: form.value.details_of_request,
    remarks: form.value.remarks,
    status: form.value.status,
  }

  if (isEditing.value) {
    const { error } = await supabase
      .from('ac_service_requests')
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
    const { error } = await supabase.from('ac_service_requests').insert(payload)

    if (error) {
      showSnackbar('Failed to submit request', 'error')
    } else {
      showSnackbar('AC request submitted successfully', 'success')
      closeFormDialog()
      await fetchRequests()
    }
  }

  saving.value = false
}

async function deleteRequest() {
  deleting.value = true

  const { error } = await supabase
    .from('ac_service_requests')
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
  await fetchBuildings()
  await fetchAcUnits()
  await fetchRequests()
})
</script>
