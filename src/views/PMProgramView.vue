<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">Preventive Maintenance Program</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Annual Preventive Maintenance Program — service type intervals and settings
            </p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
            Add Service Type
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
              <v-icon>mdi-clipboard-text-clock</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Service Types</p>
              <p class="text-h5 font-weight-bold">{{ serviceTypes.length }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="info" variant="tonal" size="48">
              <v-icon>mdi-speedometer</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">KM-Based Services</p>
              <p class="text-h5 font-weight-bold">{{ kmBasedCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="success" variant="tonal" size="48">
              <v-icon>mdi-calendar-month</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Month-Based Services</p>
              <p class="text-h5 font-weight-bold">{{ monthBasedCount }}</p>
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
              placeholder="Search service types..."
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="filteredServiceTypes"
          :loading="loading"
          loading-text="Loading service types..."
          no-data-text="No service types found"
          items-per-page="15"
          rounded="lg"
        >
          <!-- KM Between Service -->
          <template v-slot:item.km_between_service="{ item }">
            <span v-if="item.km_between_service">
              {{ item.km_between_service.toLocaleString() }} km
            </span>
            <span v-else class="text-medium-emphasis">—</span>
          </template>

          <!-- Months Between Service -->
          <template v-slot:item.months_between_service="{ item }">
            <span v-if="item.months_between_service">
              {{ item.months_between_service }}
              {{ item.months_between_service === 1 ? 'month' : 'months' }}
            </span>
            <span v-else class="text-medium-emphasis">—</span>
          </template>

          <!-- WHY: Interval Type column removed per requirements. -->

          <!-- Months Between Service (Non-Vehicular) -->
          <!-- WHAT: Displays the non-vehicular month interval for this service type -->
          <template v-slot:item.months_between_service_nv="{ item }">
            <span v-if="item.months_between_service_nv">
              {{ item.months_between_service_nv }}
              {{ item.months_between_service_nv === 1 ? 'month' : 'months' }}
            </span>
            <span v-else class="text-medium-emphasis">—</span>
          </template>

          <!-- Actions -->
          <template v-slot:item.actions="{ item }">
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
    <v-dialog v-model="formDialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0">
          <span class="text-h6">
            {{ isEditing ? 'Edit Service Type' : 'Add Service Type' }}
          </span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Service Type Name -->
            <v-col cols="12">
              <v-text-field
                v-model="form.service_type"
                label="Service Type *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.service_type"
                placeholder="e.g. Change Engine Oil"
              />
            </v-col>

            <!-- KM Between Service -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.km_between_service"
                label="KM Between Service"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 8000"
                hint="Leave blank if not KM-based"
                persistent-hint
              />
            </v-col>

            <!-- Months Between Service — Vehicle only -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.months_between_service"
                label="Months Between Service"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 6"
                hint="Vehicle only. Leave blank if not month-based."
                persistent-hint
              />
            </v-col>

            <!-- Months Between Service (Non-Vehicular) — separate editable field -->
            <!-- WHAT: Controls how often non-vehicular assets need this service -->
            <!-- WHY: Non-vehicular assets don't use KM — months is their only interval -->
            <!-- Previously hardcoded to 6 everywhere — now editable per service type -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.months_between_service_nv"
                label="Months Between Service (Non-Vehicular)"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 6"
                hint="Non-vehicular only. Leave blank if not applicable."
                persistent-hint
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
                placeholder="e.g. Use fully synthetic engine oil"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveServiceType">
            {{ isEditing ? 'Save Changes' : 'Add Service Type' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-4 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete Service Type?</h3>
          <p class="text-medium-emphasis">
            Are you sure you want to delete
            <strong>{{ selectedServiceType?.service_type }}</strong
            >? This will not affect existing PM log records.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteServiceType">
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
const serviceTypes = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')

// ---- DIALOGS ----
const formDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedServiceType = ref(null)

// ---- FORM ----
const defaultForm = {
  service_type: '',
  km_between_service: null,
  months_between_service: null,
  // WHY: New field — stores the month interval specifically for non-vehicular assets
  months_between_service_nv: null,
  remarks: '',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ---- SNACKBAR ----
const snackbar = ref({ show: false, message: '', color: 'success' })

// ---- TABLE HEADERS ----
const headers = [
  { title: 'Service Type', key: 'service_type', sortable: true },
  // WHY: These two columns are for VEHICLES only
  { title: 'KM Between Service', key: 'km_between_service', sortable: true },
  { title: 'Months Between Service', key: 'months_between_service', sortable: true },
  // WHY: New column — separate interval specifically for non-vehicular assets.
  //      Previously this was hardcoded to 6 months everywhere.
  //      Now the user controls it here per service type.
  { title: 'Months Between Service (Non-Vehicular)', key: 'months_between_service_nv', sortable: true },
  { title: 'Remarks', key: 'remarks', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// ---- COMPUTED ----
const kmBasedCount = computed(() => serviceTypes.value.filter((s) => s.km_between_service).length)
const monthBasedCount = computed(
  () => serviceTypes.value.filter((s) => s.months_between_service).length,
)

const filteredServiceTypes = computed(() => {
  if (!search.value) return serviceTypes.value
  const s = search.value.toLowerCase()
  return serviceTypes.value.filter(
    (st) => st.service_type?.toLowerCase().includes(s) || st.remarks?.toLowerCase().includes(s),
  )
})

// ---- METHODS ----
async function fetchServiceTypes() {
  loading.value = true
  const { data, error } = await supabase
    .from('pm_service_types')
    .select('*')
    .order('service_type', { ascending: true })

  if (error) {
    showSnackbar('Failed to load service types', 'error')
  } else {
    serviceTypes.value = data
  }
  loading.value = false
}

function openAddDialog() {
  isEditing.value = false
  form.value = { ...defaultForm }
  errors.value = {}
  formDialog.value = true
}

function openEditDialog(serviceType) {
  isEditing.value = true
  selectedServiceType.value = serviceType
  form.value = {
    ...serviceType,
    km_between_service: serviceType.km_between_service ?? null,
    months_between_service: serviceType.months_between_service ?? null,
  }
  errors.value = {}
  formDialog.value = true
}

function openDeleteDialog(serviceType) {
  selectedServiceType.value = serviceType
  deleteDialog.value = true
}

function closeFormDialog() {
  formDialog.value = false
  form.value = { ...defaultForm }
  errors.value = {}
}

function validateForm() {
  errors.value = {}
  if (!form.value.service_type?.trim()) errors.value.service_type = 'Service type name is required'
  return Object.keys(errors.value).length === 0
}

async function saveServiceType() {
  if (!validateForm()) return
  saving.value = true

  const payload = {
    service_type: form.value.service_type,
    km_between_service:
      form.value.km_between_service !== '' && form.value.km_between_service !== undefined
        ? Number(form.value.km_between_service)
        : null,
    months_between_service:
      form.value.months_between_service !== '' && form.value.months_between_service !== undefined
        ? Number(form.value.months_between_service)
        : null,
    // WHY: Save the non-vehicular month interval separately
    months_between_service_nv:
      form.value.months_between_service_nv !== '' && form.value.months_between_service_nv !== undefined
        ? Number(form.value.months_between_service_nv)
        : null,
    remarks: form.value.remarks,
  }

  if (isEditing.value) {
    const { error } = await supabase
      .from('pm_service_types')
      .update(payload)
      .eq('id', form.value.id)

    if (error) {
      showSnackbar('Failed to update service type', 'error')
    } else {
      showSnackbar('Service type updated successfully', 'success')
      closeFormDialog()
      await fetchServiceTypes()
    }
  } else {
    const { error } = await supabase.from('pm_service_types').insert(payload)

    if (error) {
      showSnackbar('Failed to add service type', 'error')
    } else {
      showSnackbar('Service type added successfully', 'success')
      closeFormDialog()
      await fetchServiceTypes()
    }
  }

  saving.value = false
}

async function deleteServiceType() {
  deleting.value = true
  const { error } = await supabase
    .from('pm_service_types')
    .delete()
    .eq('id', selectedServiceType.value.id)

  if (error) {
    showSnackbar('Failed to delete service type', 'error')
  } else {
    showSnackbar('Service type deleted', 'success')
    deleteDialog.value = false
    await fetchServiceTypes()
  }
  deleting.value = false
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// ---- LIFECYCLE ----
onMounted(() => {
  fetchServiceTypes()
})
</script>
