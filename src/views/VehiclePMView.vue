<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">Preventive Maintenance Log</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Track scheduled and completed preventive maintenance
            </p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
            Add PM Record
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
              <v-icon>mdi-calendar-check</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Records</p>
              <p class="text-h5 font-weight-bold">{{ pmRecords.length }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="info" variant="tonal" size="48">
              <v-icon>mdi-calendar-clock</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Scheduled</p>
              <p class="text-h5 font-weight-bold">{{ scheduledCount }}</p>
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
              <v-icon>mdi-alert-circle</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Overdue</p>
              <p class="text-h5 font-weight-bold">{{ overdueCount }}</p>
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
              placeholder="Search records..."
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="statusFilter"
              :items="['All', 'Scheduled', 'Completed', 'Overdue', 'Cancelled']"
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
          :items="filteredRecords"
          :loading="loading"
          loading-text="Loading PM records..."
          no-data-text="No PM records found"
          items-per-page="10"
          rounded="lg"
        >
          <!-- Row styling for overdue -->
          <template v-slot:item="{ item, props }">
            <tr v-bind="props" :class="{ 'bg-red-lighten-5': isOverdue(item) }">
              <!-- Vehicle -->
              <td>{{ item.vehicle_name }}</td>

              <!-- Service Type -->
              <td>{{ item.service_type }}</td>

              <!-- Date Performed -->
              <td>{{ item.date_performed || '—' }}</td>

              <!-- Odometer -->
              <td>{{ item.odometer ? item.odometer.toLocaleString() + ' km' : '—' }}</td>

              <!-- Next Due Date -->
              <td>
                <span :class="isOverdue(item) ? 'text-error font-weight-bold' : ''">
                  {{ item.next_due_date || '—' }}
                </span>
              </td>

              <!-- Next Due Odometer -->
              <td>
                {{ item.next_due_odometer ? item.next_due_odometer.toLocaleString() + ' km' : '—' }}
              </td>

              <!-- Status -->
              <td>
                <v-chip :color="statusColor(item.status)" size="small" variant="tonal">
                  {{ item.status }}
                </v-chip>
              </td>

              <!-- Actions -->
              <td class="text-center">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="info"
                  @click="viewRecord(item)"
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
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add / Edit Dialog -->
    <v-dialog v-model="formDialog" max-width="650" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0">
          <span class="text-h6">
            {{ isEditing ? 'Edit PM Record' : 'Add PM Record' }}
          </span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
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

            <!-- Service Type -->
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.service_type"
                :items="serviceTypes"
                label="Service Type *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.service_type"
                hint="Select from list or type your own"
                persistent-hint
              />
            </v-col>

            <!-- Date Performed -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.date_performed"
                label="Date Performed *"
                variant="outlined"
                density="comfortable"
                type="date"
                :error-messages="errors.date_performed"
              />
            </v-col>

            <!-- Odometer -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.odometer"
                label="Odometer at Service (km)"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 43117"
              />
            </v-col>

            <!-- Next Due Date -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.next_due_date"
                label="Next Due Date"
                variant="outlined"
                density="comfortable"
                type="date"
              />
            </v-col>

            <!-- Next Due Odometer -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.next_due_odometer"
                label="Next Due Odometer (km)"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 51117"
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
                :items="['Scheduled', 'Completed', 'Overdue', 'Cancelled']"
                label="Status"
                variant="outlined"
                density="comfortable"
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
                placeholder="Additional notes"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveRecord">
            {{ isEditing ? 'Save Changes' : 'Add Record' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Details Dialog -->
    <v-dialog v-model="viewDialog" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0 d-flex align-center justify-space-between">
          <span class="text-h6">PM Record Details</span>
          <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
        </v-card-title>

        <v-card-text class="pa-4" v-if="selectedRecord">
          <!-- Status Badge -->
          <div class="mb-4">
            <v-chip :color="statusColor(selectedRecord.status)" size="large" variant="tonal">
              {{ selectedRecord.status }}
            </v-chip>
            <v-chip
              v-if="isOverdue(selectedRecord)"
              color="error"
              size="large"
              variant="tonal"
              class="ml-2"
            >
              <v-icon start>mdi-alert</v-icon>
              OVERDUE
            </v-chip>
          </div>

          <v-list lines="two" density="compact">
            <v-list-item subtitle="Vehicle" :title="selectedRecord.vehicle_name || '—'" />
            <v-list-item subtitle="Service Type" :title="selectedRecord.service_type || '—'" />
            <v-list-item subtitle="Date Performed" :title="selectedRecord.date_performed || '—'" />
            <v-list-item
              subtitle="Odometer at Service"
              :title="
                selectedRecord.odometer ? selectedRecord.odometer.toLocaleString() + ' km' : '—'
              "
            />
            <v-list-item subtitle="Next Due Date" :title="selectedRecord.next_due_date || '—'" />
            <v-list-item
              subtitle="Next Due Odometer"
              :title="
                selectedRecord.next_due_odometer
                  ? selectedRecord.next_due_odometer.toLocaleString() + ' km'
                  : '—'
              "
            />
            <v-list-item subtitle="Conducted By" :title="selectedRecord.conducted_by || '—'" />
            <v-list-item
              subtitle="Cost"
              :title="
                selectedRecord.cost ? '₱' + Number(selectedRecord.cost).toLocaleString() : '—'
              "
            />
            <v-list-item subtitle="Remarks" :title="selectedRecord.remarks || '—'" />
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-4 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete PM Record?</h3>
          <p class="text-medium-emphasis">
            Are you sure you want to delete this
            <strong>{{ selectedRecord?.service_type }}</strong> record for
            <strong>{{ selectedRecord?.vehicle_name }}</strong
            >? This cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteRecord">
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
const pmRecords = ref([])
const vehicleList = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref('All')
const vehicleFilter = ref('All')
const today = new Date().toISOString().split('T')[0]

// ---- SERVICE TYPES ----
const serviceTypes = [
  'Change Engine Oil',
  'Air Filter Change',
  'Oil Filter Change',
  'Fuel Filter Change',
  'Brake Pad Replacement',
  'Tire Rotation / Balance',
  'Transmission Fluid Change',
  'Battery Replacement',
  'Greasing of Fittings/Bearings',
  'Tune-up Engine',
]

// ---- DIALOGS ----
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedRecord = ref(null)

// ---- FORM ----
const defaultForm = {
  vehicle_id: null,
  service_type: '',
  date_performed: today,
  odometer: null,
  next_due_date: '',
  next_due_odometer: null,
  conducted_by: '',
  cost: null,
  status: 'Scheduled',
  remarks: '',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ---- SNACKBAR ----
const snackbar = ref({ show: false, message: '', color: 'success' })

// ---- TABLE HEADERS ----
const headers = [
  { title: 'Vehicle', key: 'vehicle_name', sortable: true },
  { title: 'Service Type', key: 'service_type', sortable: true },
  { title: 'Date Performed', key: 'date_performed', sortable: true },
  { title: 'Odometer', key: 'odometer', sortable: false },
  { title: 'Next Due Date', key: 'next_due_date', sortable: true },
  { title: 'Next Due Odo.', key: 'next_due_odometer', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// ---- COMPUTED ----
const scheduledCount = computed(
  () => pmRecords.value.filter((r) => r.status === 'Scheduled').length,
)
const completedCount = computed(
  () => pmRecords.value.filter((r) => r.status === 'Completed').length,
)
const overdueCount = computed(() => pmRecords.value.filter((r) => isOverdue(r)).length)

const vehicleOptions = computed(() => ['All', ...vehicleList.value.map((v) => v.unit_name)])

const filteredRecords = computed(() => {
  let result = pmRecords.value

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
        r.vehicle_name?.toLowerCase().includes(s) ||
        r.service_type?.toLowerCase().includes(s) ||
        r.conducted_by?.toLowerCase().includes(s) ||
        r.remarks?.toLowerCase().includes(s),
    )
  }

  return result
})

// ---- HELPERS ----
function isOverdue(record) {
  if (record.status === 'Completed' || record.status === 'Cancelled') return false
  if (!record.next_due_date) return false
  return record.next_due_date < today
}

function statusColor(status) {
  const colors = {
    Scheduled: 'info',
    Completed: 'success',
    Overdue: 'error',
    Cancelled: 'grey',
  }
  return colors[status] || 'grey'
}

function getVehicleName(vehicleId) {
  const vehicle = vehicleList.value.find((v) => v.id === vehicleId)
  return vehicle ? vehicle.unit_name : '—'
}

// ---- METHODS ----
async function fetchRecords() {
  loading.value = true

  const { data, error } = await supabase
    .from('vehicle_pm_log')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    showSnackbar('Failed to load PM records', 'error')
  } else {
    pmRecords.value = data.map((r) => ({
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

function openAddDialog() {
  isEditing.value = false
  form.value = { ...defaultForm }
  errors.value = {}
  formDialog.value = true
}

function openEditDialog(record) {
  isEditing.value = true
  selectedRecord.value = record
  form.value = { ...record }
  errors.value = {}
  formDialog.value = true
}

function viewRecord(record) {
  selectedRecord.value = record
  viewDialog.value = true
}

function openDeleteDialog(record) {
  selectedRecord.value = record
  deleteDialog.value = true
}

function closeFormDialog() {
  formDialog.value = false
  form.value = { ...defaultForm }
  errors.value = {}
}

function validateForm() {
  errors.value = {}
  if (!form.value.vehicle_id) errors.value.vehicle_id = 'Vehicle is required'
  if (!form.value.service_type?.trim()) errors.value.service_type = 'Service type is required'
  if (!form.value.date_performed) errors.value.date_performed = 'Date performed is required'
  return Object.keys(errors.value).length === 0
}

async function saveRecord() {
  if (!validateForm()) return
  saving.value = true

  const payload = {
    vehicle_id: form.value.vehicle_id,
    service_type: form.value.service_type,
    date_performed: form.value.date_performed,
    odometer: form.value.odometer || null,
    next_due_date: form.value.next_due_date || null,
    next_due_odometer: form.value.next_due_odometer || null,
    conducted_by: form.value.conducted_by,
    cost: form.value.cost || null,
    status: form.value.status,
    remarks: form.value.remarks,
  }

  if (isEditing.value) {
    const { error } = await supabase.from('vehicle_pm_log').update(payload).eq('id', form.value.id)

    if (error) {
      showSnackbar('Failed to update record', 'error')
    } else {
      showSnackbar('Record updated successfully', 'success')
      closeFormDialog()
      await fetchRecords()
    }
  } else {
    const { error } = await supabase.from('vehicle_pm_log').insert(payload)

    if (error) {
      showSnackbar('Failed to add record', 'error')
    } else {
      showSnackbar('PM record added successfully', 'success')
      closeFormDialog()
      await fetchRecords()
    }
  }

  saving.value = false
}

async function deleteRecord() {
  deleting.value = true

  const { error } = await supabase.from('vehicle_pm_log').delete().eq('id', selectedRecord.value.id)

  if (error) {
    showSnackbar('Failed to delete record', 'error')
  } else {
    showSnackbar('Record deleted successfully', 'success')
    deleteDialog.value = false
    await fetchRecords()
  }

  deleting.value = false
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// ---- LIFECYCLE ----
onMounted(async () => {
  await fetchVehicles()
  await fetchRecords()
})
</script>
