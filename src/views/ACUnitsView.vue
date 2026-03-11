<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">AC Unit Registry</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Manage all air conditioner units across 6 buildings
            </p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
            Add AC Unit
          </v-btn>
        </div>
      </v-col>
    </v-row>


    <!-- Total Summary Row -->
    <v-row class="mb-4">
      <v-col cols="12" sm="3">
        <v-card rounded="lg" elevation="0" border color="primary">
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="white" variant="tonal" size="48">
              <v-icon color="primary">mdi-air-conditioner</v-icon>
            </v-avatar>
            <div>
              <p class="text-body-2 text-white">Total AC Units</p>
              <p class="text-h5 font-weight-bold text-white">
                {{ acUnits.length }}
              </p>
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
              <p class="text-medium-emphasis text-body-2">Active</p>
              <p class="text-h5 font-weight-bold">{{ activeCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="warning" variant="tonal" size="48">
              <v-icon>mdi-swap-horizontal</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Transferred</p>
              <p class="text-h5 font-weight-bold">{{ transferredCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="error" variant="tonal" size="48">
              <v-icon>mdi-close-circle</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Decommissioned</p>
              <p class="text-h5 font-weight-bold">{{ decommissionedCount }}</p>
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
              placeholder="Search units..."
              variant="outlined"
              density="compact"
              hide-details
              clearable
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
          <v-col cols="12" sm="3">
            <v-select
              v-model="unitTypeFilter"
              :items="['All', ...unitTypes]"
              label="Unit Type"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="statusFilter"
              :items="['All', 'Active', 'Inactive', 'Transferred', 'Decommissioned']"
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
          :items="filteredUnits"
          :loading="loading"
          loading-text="Loading AC units..."
          no-data-text="No AC units found"
          items-per-page="10"
          rounded="lg"
        >
          <!-- Unit Type Column -->
          <template v-slot:item.unit_type="{ item }">
            <v-chip :color="unitTypeColor(item.unit_type)" size="small" variant="tonal">
              {{ item.unit_type }}
            </v-chip>
          </template>

          <!-- Technology Column -->
          <template v-slot:item.technology="{ item }">
            <v-chip
              :color="item.technology === 'Inverter' ? 'success' : 'warning'"
              size="small"
              variant="tonal"
            >
              {{ item.technology }}
            </v-chip>
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
              @click="viewUnit(item)"
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
            {{ isEditing ? 'Edit AC Unit' : 'Add AC Unit' }}
          </span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Building -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.building"
                :items="buildings"
                label="Building *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.building"
              />
            </v-col>

            <!-- Floor -->
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.floor"
                :items="floors"
                label="Floor *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.floor"
                hint="Select or type your own"
                persistent-hint
              />
            </v-col>

            <!-- Area / Room -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.area_room"
                label="Area / Room *"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. Server Room, Lobby"
                :error-messages="errors.area_room"
              />
            </v-col>

            <!-- Unit Type -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.unit_type"
                :items="unitTypes"
                label="Unit Type *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.unit_type"
              />
            </v-col>

            <!-- Number of Units -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.num_units"
                label="Number of Units *"
                variant="outlined"
                density="comfortable"
                type="number"
                min="1"
                :error-messages="errors.num_units"
              />
            </v-col>

            <!-- Brand -->
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.brand"
                :items="brands"
                label="Brand / Make"
                variant="outlined"
                density="comfortable"
                hint="Select or type your own"
                persistent-hint
              />
            </v-col>

            <!-- Capacity -->
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.capacity"
                :items="capacities"
                label="Capacity"
                variant="outlined"
                density="comfortable"
                hint="Select or type your own"
                persistent-hint
              />
            </v-col>

            <!-- Technology -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.technology"
                :items="['Inverter', 'Non-Inverter']"
                label="Technology"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- Status -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="['Active', 'Inactive', 'Transferred', 'Decommissioned']"
                label="Status"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- Remarks -->
            <v-col cols="12">
              <v-textarea
                v-model="form.remarks"
                label="Remarks / Notes"
                variant="outlined"
                density="comfortable"
                rows="2"
                placeholder="e.g. Unit relocated to Conference Room"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveUnit">
            {{ isEditing ? 'Save Changes' : 'Add AC Unit' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Details Dialog -->
    <v-dialog v-model="viewDialog" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0 d-flex align-center justify-space-between">
          <span class="text-h6">AC Unit Details</span>
          <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
        </v-card-title>

        <v-card-text class="pa-4" v-if="selectedUnit">
          <!-- Badges -->
          <div class="mb-4 d-flex ga-2 flex-wrap">
            <v-chip :color="unitTypeColor(selectedUnit.unit_type)" variant="tonal">
              {{ selectedUnit.unit_type }}
            </v-chip>
            <v-chip
              :color="selectedUnit.technology === 'Inverter' ? 'success' : 'warning'"
              variant="tonal"
            >
              {{ selectedUnit.technology }}
            </v-chip>
            <v-chip :color="statusColor(selectedUnit.status)" variant="tonal">
              {{ selectedUnit.status }}
            </v-chip>
          </div>

          <v-list lines="two" density="compact">
            <v-list-item subtitle="Building" :title="selectedUnit.building || '—'" />
            <v-list-item subtitle="Floor" :title="selectedUnit.floor || '—'" />
            <v-list-item subtitle="Area / Room" :title="selectedUnit.area_room || '—'" />
            <v-list-item subtitle="Unit Type" :title="selectedUnit.unit_type || '—'" />
            <v-list-item
              subtitle="Number of Units"
              :title="String(selectedUnit.num_units) || '—'"
            />
            <v-list-item subtitle="Brand / Make" :title="selectedUnit.brand || '—'" />
            <v-list-item subtitle="Capacity" :title="selectedUnit.capacity || '—'" />
            <v-list-item subtitle="Technology" :title="selectedUnit.technology || '—'" />
            <v-list-item subtitle="Remarks" :title="selectedUnit.remarks || '—'" />
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-4 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete AC Unit?</h3>
          <p class="text-medium-emphasis">
            Are you sure you want to delete the AC unit in
            <strong>{{ selectedUnit?.area_room }}</strong
            >? This cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteUnit">
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
const acUnits = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const buildingFilter = ref('All')
const unitTypeFilter = ref('All')
const statusFilter = ref('All')

// ---- DROPDOWN OPTIONS ----
const buildings = [
  'Administration Building',
  'Farm Mechanization Building',
  'Hero Learning Commons Building',
  'Kinaadman Building',
  'Old CAS Building',
  'S&T Building',
]

const floors = ['Ground Floor', '2nd Floor', '3rd Floor', 'Mezzanine']

const unitTypes = ['Floor-Mounted', 'Wall-Mounted', 'Window Type', 'Ceiling Type']

const brands = [
  'Midea',
  'Koppel',
  'Matrix',
  'Gen. Royal',
  'Daikin',
  'Samsung',
  'Kolin',
  'Carrier',
  'Sharp',
  'LG',
  'Condura',
]

const capacities = ['1.0 HP', '1.5 HP', '2.0 HP', '2.5 HP', '3.0 TR', '3.0 HP', '5.0 TR']

// ---- DIALOGS ----
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedUnit = ref(null)

// ---- FORM ----
const defaultForm = {
  building: '',
  floor: '',
  area_room: '',
  unit_type: '',
  num_units: 1,
  brand: '',
  capacity: '',
  technology: 'Inverter',
  status: 'Active',
  remarks: '',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ---- SNACKBAR ----
const snackbar = ref({ show: false, message: '', color: 'success' })

// ---- TABLE HEADERS ----
const headers = [
  { title: 'Building', key: 'building', sortable: true },
  { title: 'Floor', key: 'floor', sortable: true },
  { title: 'Area / Room', key: 'area_room', sortable: true },
  { title: 'Unit Type', key: 'unit_type', sortable: true },
  { title: 'No. of Units', key: 'num_units', sortable: false },
  { title: 'Brand', key: 'brand', sortable: false },
  { title: 'Capacity', key: 'capacity', sortable: false },
  { title: 'Technology', key: 'technology', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// ---- COMPUTED ----
const activeCount = computed(() => acUnits.value.filter((u) => u.status === 'Active').length)
const transferredCount = computed(
  () => acUnits.value.filter((u) => u.status === 'Transferred').length,
)
const decommissionedCount = computed(
  () => acUnits.value.filter((u) => u.status === 'Decommissioned').length,
)


const filteredUnits = computed(() => {
  let result = acUnits.value

  if (buildingFilter.value !== 'All') {
    result = result.filter((u) => u.building === buildingFilter.value)
  }
  if (unitTypeFilter.value !== 'All') {
    result = result.filter((u) => u.unit_type === unitTypeFilter.value)
  }
  if (statusFilter.value !== 'All') {
    result = result.filter((u) => u.status === statusFilter.value)
  }
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(
      (u) =>
        u.building?.toLowerCase().includes(s) ||
        u.floor?.toLowerCase().includes(s) ||
        u.area_room?.toLowerCase().includes(s) ||
        u.brand?.toLowerCase().includes(s) ||
        u.remarks?.toLowerCase().includes(s),
    )
  }

  return result
})

// ---- HELPERS ----
function statusColor(status) {
  const colors = {
    Active: 'success',
    Inactive: 'grey',
    Transferred: 'warning',
    Decommissioned: 'error',
  }
  return colors[status] || 'grey'
}

function unitTypeColor(type) {
  const colors = {
    'Floor-Mounted': 'primary',
    'Wall-Mounted': 'info',
    'Window Type': 'warning',
    'Ceiling Type': 'purple',
  }
  return colors[type] || 'grey'
}

// ---- METHODS ----
async function fetchUnits() {
  loading.value = true
  const { data, error } = await supabase
    .from('ac_units')
    .select('*')
    .order('building', { ascending: true })

  if (error) {
    showSnackbar('Failed to load AC units', 'error')
  } else {
    acUnits.value = data
  }
  loading.value = false
}

function openAddDialog() {
  isEditing.value = false
  form.value = { ...defaultForm }
  errors.value = {}
  formDialog.value = true
}

function openEditDialog(unit) {
  isEditing.value = true
  selectedUnit.value = unit
  form.value = { ...unit }
  errors.value = {}
  formDialog.value = true
}

function viewUnit(unit) {
  selectedUnit.value = unit
  viewDialog.value = true
}

function openDeleteDialog(unit) {
  selectedUnit.value = unit
  deleteDialog.value = true
}

function closeFormDialog() {
  formDialog.value = false
  form.value = { ...defaultForm }
  errors.value = {}
}

function validateForm() {
  errors.value = {}
  if (!form.value.building) errors.value.building = 'Building is required'
  if (!form.value.floor?.trim()) errors.value.floor = 'Floor is required'
  if (!form.value.area_room?.trim()) errors.value.area_room = 'Area / Room is required'
  if (!form.value.unit_type) errors.value.unit_type = 'Unit type is required'
  if (!form.value.num_units || form.value.num_units < 1)
    errors.value.num_units = 'Number of units must be at least 1'
  return Object.keys(errors.value).length === 0
}

async function saveUnit() {
  if (!validateForm()) return
  saving.value = true

  const payload = {
    building: form.value.building,
    floor: form.value.floor,
    area_room: form.value.area_room,
    unit_type: form.value.unit_type,
    num_units: form.value.num_units,
    brand: form.value.brand,
    capacity: form.value.capacity,
    technology: form.value.technology,
    status: form.value.status,
    remarks: form.value.remarks,
  }

  if (isEditing.value) {
    const { error } = await supabase.from('ac_units').update(payload).eq('id', form.value.id)

    if (error) {
      showSnackbar('Failed to update AC unit', 'error')
    } else {
      showSnackbar('AC unit updated successfully', 'success')
      closeFormDialog()
      await fetchUnits()
    }
  } else {
    const { error } = await supabase.from('ac_units').insert(payload)

    if (error) {
      showSnackbar('Failed to add AC unit', 'error')
    } else {
      showSnackbar('AC unit added successfully', 'success')
      closeFormDialog()
      await fetchUnits()
    }
  }

  saving.value = false
}

async function deleteUnit() {
  deleting.value = true

  const { error } = await supabase.from('ac_units').delete().eq('id', selectedUnit.value.id)

  if (error) {
    showSnackbar('Failed to delete AC unit', 'error')
  } else {
    showSnackbar('AC unit deleted successfully', 'success')
    deleteDialog.value = false
    await fetchUnits()
  }

  deleting.value = false
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// ---- LIFECYCLE ----
onMounted(() => {
  fetchUnits()
})
</script>
