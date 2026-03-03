<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">Vehicle Registry</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">Manage all motor pool vehicles</p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
            Add Vehicle
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="48">
              <v-icon>mdi-car-multiple</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Vehicles</p>
              <p class="text-h5 font-weight-bold">{{ vehicles.length }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="success" variant="tonal" size="48">
              <v-icon>mdi-check-circle</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Active</p>
              <p class="text-h5 font-weight-bold">{{ activeCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="error" variant="tonal" size="48">
              <v-icon>mdi-close-circle</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Inactive</p>
              <p class="text-h5 font-weight-bold">{{ inactiveCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table -->
    <v-card rounded="lg" elevation="0" border>
      <v-card-text>
        <!-- Search -->
        <v-row class="mb-2">
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search vehicles..."
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="statusFilter"
              :items="['All', 'Active', 'Inactive']"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="filteredVehicles"
          :loading="loading"
          loading-text="Loading vehicles..."
          no-data-text="No vehicles found"
          items-per-page="10"
          rounded="lg"
        >
          <!-- Status Column -->
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="item.status === 'Active' ? 'success' : 'error'"
              size="small"
              variant="tonal"
            >
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
              @click="viewVehicle(item)"
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
    <v-dialog v-model="formDialog" max-width="600" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0">
          <span class="text-h6">
            {{ isEditing ? 'Edit Vehicle' : 'Add New Vehicle' }}
          </span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.unit_name"
                label="Unit Name *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.unit_name"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.eqf_code"
                label="EQF Code"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. MV-001 A"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.assigned_driver"
                label="Assigned Driver"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.plate_number"
                label="Plate Number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.model"
                label="Model"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. TOYOTA HILUX"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.year_model"
                label="Year Model"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 2022"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.engine_number"
                label="Engine Number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.body_type"
                label="Body Type"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. PICK-UP"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.displacement"
                label="Displacement"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 2393"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="['Active', 'Inactive']"
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
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveVehicle">
            {{ isEditing ? 'Save Changes' : 'Add Vehicle' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Details Dialog -->
    <v-dialog v-model="viewDialog" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0 d-flex align-center justify-space-between">
          <span class="text-h6">Vehicle Details</span>
          <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
        </v-card-title>

        <v-card-text class="pa-4" v-if="selectedVehicle">
          <v-list lines="two">
            <v-list-item
              v-for="detail in vehicleDetails"
              :key="detail.label"
              :subtitle="detail.label"
              :title="detail.value || '—'"
            />
          </v-list>

          <div class="mt-2">
            <v-chip
              :color="selectedVehicle.status === 'Active' ? 'success' : 'error'"
              variant="tonal"
            >
              {{ selectedVehicle.status }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-4 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete Vehicle?</h3>
          <p class="text-medium-emphasis">
            Are you sure you want to delete
            <strong>{{ selectedVehicle?.unit_name }}</strong
            >? This action cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteVehicle">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar Notification -->
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
const vehicles = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref('All')

// ---- DIALOGS ----
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedVehicle = ref(null)

// ---- FORM ----
const defaultForm = {
  unit_name: '',
  eqf_code: '',
  assigned_driver: '',
  plate_number: '',
  model: '',
  year_model: '',
  engine_number: '',
  body_type: '',
  displacement: '',
  status: 'Active',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ---- SNACKBAR ----
const snackbar = ref({ show: false, message: '', color: 'success' })

// ---- TABLE HEADERS ----
const headers = [
  { title: 'Unit Name', key: 'unit_name', sortable: true },
  { title: 'EQF Code', key: 'eqf_code', sortable: true },
  { title: 'Assigned Driver', key: 'assigned_driver', sortable: true },
  { title: 'Plate Number', key: 'plate_number', sortable: false },
  { title: 'Model', key: 'model', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// ---- COMPUTED ----
const activeCount = computed(() => vehicles.value.filter((v) => v.status === 'Active').length)
const inactiveCount = computed(() => vehicles.value.filter((v) => v.status === 'Inactive').length)

const filteredVehicles = computed(() => {
  let result = vehicles.value

  if (statusFilter.value !== 'All') {
    result = result.filter((v) => v.status === statusFilter.value)
  }

  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(
      (v) =>
        v.unit_name?.toLowerCase().includes(s) ||
        v.eqf_code?.toLowerCase().includes(s) ||
        v.assigned_driver?.toLowerCase().includes(s) ||
        v.plate_number?.toLowerCase().includes(s),
    )
  }

  return result
})

const vehicleDetails = computed(() => {
  if (!selectedVehicle.value) return []
  return [
    { label: 'Unit Name', value: selectedVehicle.value.unit_name },
    { label: 'EQF Code', value: selectedVehicle.value.eqf_code },
    { label: 'Assigned Driver', value: selectedVehicle.value.assigned_driver },
    { label: 'Plate Number', value: selectedVehicle.value.plate_number },
    { label: 'Model', value: selectedVehicle.value.model },
    { label: 'Year Model', value: selectedVehicle.value.year_model },
    { label: 'Engine Number', value: selectedVehicle.value.engine_number },
    { label: 'Body Type', value: selectedVehicle.value.body_type },
    { label: 'Displacement', value: selectedVehicle.value.displacement },
  ]
})

// ---- METHODS ----

// Fetch all vehicles from Supabase
async function fetchVehicles() {
  loading.value = true
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    showSnackbar('Failed to load vehicles', 'error')
  } else {
    vehicles.value = data
  }
  loading.value = false
}

// Open Add dialog
function openAddDialog() {
  isEditing.value = false
  form.value = { ...defaultForm }
  errors.value = {}
  formDialog.value = true
}

// Open Edit dialog
function openEditDialog(vehicle) {
  isEditing.value = true
  selectedVehicle.value = vehicle
  form.value = { ...vehicle }
  errors.value = {}
  formDialog.value = true
}

// Open View dialog
function viewVehicle(vehicle) {
  selectedVehicle.value = vehicle
  viewDialog.value = true
}

// Open Delete dialog
function openDeleteDialog(vehicle) {
  selectedVehicle.value = vehicle
  deleteDialog.value = true
}

// Close form dialog
function closeFormDialog() {
  formDialog.value = false
  form.value = { ...defaultForm }
  errors.value = {}
}

// Validate form
function validateForm() {
  errors.value = {}
  if (!form.value.unit_name.trim()) {
    errors.value.unit_name = 'Unit name is required'
  }
  return Object.keys(errors.value).length === 0
}

// Save vehicle (Add or Edit)
async function saveVehicle() {
  if (!validateForm()) return

  saving.value = true

  if (isEditing.value) {
    // Update existing vehicle
    const { error } = await supabase
      .from('vehicles')
      .update({
        unit_name: form.value.unit_name,
        eqf_code: form.value.eqf_code,
        assigned_driver: form.value.assigned_driver,
        plate_number: form.value.plate_number,
        model: form.value.model,
        year_model: form.value.year_model,
        engine_number: form.value.engine_number,
        body_type: form.value.body_type,
        displacement: form.value.displacement,
        status: form.value.status,
      })
      .eq('id', form.value.id)

    if (error) {
      showSnackbar('Failed to update vehicle', 'error')
    } else {
      showSnackbar('Vehicle updated successfully', 'success')
      closeFormDialog()
      fetchVehicles()
    }
  } else {
    // Insert new vehicle
    const { error } = await supabase.from('vehicles').insert({
      unit_name: form.value.unit_name,
      eqf_code: form.value.eqf_code,
      assigned_driver: form.value.assigned_driver,
      plate_number: form.value.plate_number,
      model: form.value.model,
      year_model: form.value.year_model,
      engine_number: form.value.engine_number,
      body_type: form.value.body_type,
      displacement: form.value.displacement,
      status: form.value.status,
    })

    if (error) {
      showSnackbar('Failed to add vehicle', 'error')
    } else {
      showSnackbar('Vehicle added successfully', 'success')
      closeFormDialog()
      fetchVehicles()
    }
  }

  saving.value = false
}

// Delete vehicle
async function deleteVehicle() {
  deleting.value = true

  const { error } = await supabase.from('vehicles').delete().eq('id', selectedVehicle.value.id)

  if (error) {
    showSnackbar('Failed to delete vehicle', 'error')
  } else {
    showSnackbar('Vehicle deleted successfully', 'success')
    deleteDialog.value = false
    fetchVehicles()
  }

  deleting.value = false
}

// Show snackbar notification
function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// ---- LIFECYCLE ----
onMounted(() => {
  fetchVehicles()
})
</script>
