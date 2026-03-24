<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">Assets Registry</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Manage all vehicles and non-vehicular equipment
            </p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog"> Add Asset </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="48">
              <v-icon>mdi-garage</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Assets</p>
              <p class="text-h5 font-weight-bold">{{ assets.length }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="info" variant="tonal" size="48">
              <v-icon>mdi-car</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Vehicles</p>
              <p class="text-h5 font-weight-bold">{{ vehicleCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="warning" variant="tonal" size="48">
              <v-icon>mdi-engine</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Non-Vehicular</p>
              <p class="text-h5 font-weight-bold">{{ nonVehicularCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
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
      <v-col cols="12" sm="6">
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
        <!-- Filters -->
        <v-row class="mb-2">
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search assets..."
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
              :items="['All', 'Active', 'Inactive']"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>

        <!-- Data Table -->
        <p class="text-caption text-medium-emphasis mb-2">
          Click any row to view details · Double-click to edit
        </p>
        <v-data-table
          :headers="headers"
          :items="filteredAssets"
          :loading="loading"
          loading-text="Loading assets..."
          no-data-text="No assets found"
          items-per-page="10"
          rounded="lg"
          :row-props="
            ({ item }) => ({
              style: { cursor: 'pointer' },
              onClick: () => viewAsset(item),
              onDblclick: () => openEditDialog(item),
            })
          "
        >
          <!-- Asset Type Column -->
          <template v-slot:item.asset_type="{ item }">
            <v-chip
              :color="item.asset_type === 'Vehicle' ? 'info' : 'warning'"
              size="small"
              variant="tonal"
            >
              <v-icon start size="12">
                {{ item.asset_type === 'Vehicle' ? 'mdi-car' : 'mdi-engine' }}
              </v-icon>
              {{ item.asset_type }}
            </v-chip>
          </template>

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
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click.stop="openEditDialog(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click.stop="openDeleteDialog(item)"
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
            {{ isEditing ? 'Edit Asset' : 'Add New Asset' }}
          </span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Asset Type — first so fields update immediately -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.asset_type"
                :items="['Vehicle', 'Non-Vehicular']"
                label="Asset Type *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.asset_type"
                @update:modelValue="onAssetTypeChange"
              />
            </v-col>

            <!-- Asset Name -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.asset_name"
                label="Asset Name *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.asset_name"
                :placeholder="
                  form.asset_type === 'Vehicle'
                    ? 'e.g. HILUX, ADVENTURE'
                    : 'e.g. Chainsaw, Grasscutter'
                "
              />
            </v-col>

            <!-- EQF Code -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.eqf_code"
                label="EQF Code"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. MV-001 A"
              />
            </v-col>

            <!-- Assigned Driver (Vehicle only) -->
            <v-col cols="12" sm="6" v-if="form.asset_type === 'Vehicle'">
              <v-text-field
                v-model="form.assigned_driver"
                label="Assigned Driver"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- Operator (Non-Vehicular only) -->
            <v-col cols="12" sm="6" v-if="form.asset_type === 'Non-Vehicular'">
              <v-text-field
                v-model="form.operator"
                label="Operator"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- Plate Number -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.plate_number"
                label="Plate Number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- Model -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.model"
                label="Model"
                variant="outlined"
                density="comfortable"
                :placeholder="
                  form.asset_type === 'Vehicle' ? 'e.g. TOYOTA HILUX' : 'e.g. STIHL MS 170'
                "
              />
            </v-col>

            <!-- Year Model -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.year_model"
                label="Year Model"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 2022"
              />
            </v-col>

            <!-- Engine Number -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.engine_number"
                label="Engine Number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- Body Type (Vehicle only) -->
            <v-col cols="12" sm="6" v-if="form.asset_type === 'Vehicle'">
              <v-text-field
                v-model="form.body_type"
                label="Body Type"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. PICK-UP, VAN"
              />
            </v-col>

            <!-- Chassis Number (Non-Vehicular only) -->
            <v-col cols="12" sm="6" v-if="form.asset_type === 'Non-Vehicular'">
              <v-text-field
                v-model="form.chassis_number"
                label="Chassis Number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- Displacement -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.displacement"
                label="Displacement"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 2393"
              />
            </v-col>

            <!-- Status -->
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
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveAsset">
            {{ isEditing ? 'Save Changes' : 'Add Asset' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Details Dialog -->
    <v-dialog v-model="viewDialog" max-width="700">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0 d-flex align-center justify-space-between">
          <span class="text-h6">Asset Details</span>
          <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
        </v-card-title>

        <v-card-text class="pa-4" v-if="selectedAsset">
          <!-- Type Badge -->
          <div class="mb-4 d-flex ga-2">
            <v-chip
              :color="selectedAsset.asset_type === 'Vehicle' ? 'info' : 'warning'"
              variant="tonal"
            >
              {{ selectedAsset.asset_type }}
            </v-chip>
            <v-chip
              :color="selectedAsset.status === 'Active' ? 'success' : 'error'"
              variant="tonal"
            >
              {{ selectedAsset.status }}
            </v-chip>
          </div>

          <v-list lines="two" density="compact">
            <v-list-item subtitle="Asset Name" :title="selectedAsset.asset_name || '—'" />
            <v-list-item subtitle="EQF Code" :title="selectedAsset.eqf_code || '—'" />
            <v-list-item
              v-if="selectedAsset.asset_type === 'Vehicle'"
              subtitle="Assigned Driver"
              :title="selectedAsset.assigned_driver || '—'"
            />
            <v-list-item
              v-if="selectedAsset.asset_type === 'Non-Vehicular'"
              subtitle="Operator"
              :title="selectedAsset.operator || '—'"
            />
            <v-list-item subtitle="Plate Number" :title="selectedAsset.plate_number || '—'" />
            <v-list-item subtitle="Model" :title="selectedAsset.model || '—'" />
            <v-list-item subtitle="Year Model" :title="selectedAsset.year_model || '—'" />
            <v-list-item subtitle="Engine Number" :title="selectedAsset.engine_number || '—'" />
            <v-list-item
              v-if="selectedAsset.asset_type === 'Vehicle'"
              subtitle="Body Type"
              :title="selectedAsset.body_type || '—'"
            />
            <v-list-item
              v-if="selectedAsset.asset_type === 'Non-Vehicular'"
              subtitle="Chassis Number"
              :title="selectedAsset.chassis_number || '—'"
            />
            <v-list-item subtitle="Displacement" :title="selectedAsset.displacement || '—'" />
          </v-list>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            prepend-icon="mdi-pencil"
            class="flex-grow-1"
            @click="viewDialog = false; openEditDialog(selectedAsset)"
            >Edit Record</v-btn
          >
          <v-btn
            color="error"
            variant="outlined"
            size="large"
            prepend-icon="mdi-delete"
            class="flex-grow-1"
            @click="viewDialog = false; openDeleteDialog(selectedAsset)"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-4 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete Asset?</h3>
          <p class="text-medium-emphasis">
            Are you sure you want to delete
            <strong>{{ selectedAsset?.asset_name }}</strong
            >? This cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteAsset">
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
const assets = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref('All')
const assetTypeFilter = ref('All')

// ---- DIALOGS ----
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedAsset = ref(null)

// ---- FORM ----
const defaultForm = {
  asset_name: '',
  asset_type: 'Vehicle',
  eqf_code: '',
  assigned_driver: '',
  operator: '',
  plate_number: '',
  model: '',
  year_model: '',
  engine_number: '',
  body_type: '',
  chassis_number: '',
  displacement: '',
  status: 'Active',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ---- SNACKBAR ----
const snackbar = ref({ show: false, message: '', color: 'success' })

// ---- TABLE HEADERS ----
const headers = [
  { title: 'Asset Name', key: 'asset_name', sortable: true },
  { title: 'Asset Type', key: 'asset_type', sortable: true },
  { title: 'EQF Code', key: 'eqf_code', sortable: true },
  { title: 'Driver / Operator', key: 'driver_operator', sortable: false },
  { title: 'Plate Number', key: 'plate_number', sortable: false },
  { title: 'Model', key: 'model', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// ---- COMPUTED ----
const vehicleCount = computed(() => assets.value.filter((a) => a.asset_type === 'Vehicle').length)
const nonVehicularCount = computed(
  () => assets.value.filter((a) => a.asset_type === 'Non-Vehicular').length,
)
const activeCount = computed(() => assets.value.filter((a) => a.status === 'Active').length)
const inactiveCount = computed(() => assets.value.filter((a) => a.status === 'Inactive').length)

const filteredAssets = computed(() => {
  let result = assets.value.map((a) => ({
    ...a,
    driver_operator: a.asset_type === 'Vehicle' ? a.assigned_driver : a.operator,
  }))

  if (assetTypeFilter.value !== 'All') {
    result = result.filter((a) => a.asset_type === assetTypeFilter.value)
  }
  if (statusFilter.value !== 'All') {
    result = result.filter((a) => a.status === statusFilter.value)
  }
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(
      (a) =>
        a.asset_name?.toLowerCase().includes(s) ||
        a.eqf_code?.toLowerCase().includes(s) ||
        a.assigned_driver?.toLowerCase().includes(s) ||
        a.operator?.toLowerCase().includes(s) ||
        a.plate_number?.toLowerCase().includes(s) ||
        a.model?.toLowerCase().includes(s),
    )
  }

  return result
})

// ---- HELPERS ----
function onAssetTypeChange() {
  // Clear type-specific fields when switching
  form.value.assigned_driver = ''
  form.value.operator = ''
  form.value.body_type = ''
  form.value.chassis_number = ''
}

// ---- METHODS ----
async function fetchAssets() {
  loading.value = true
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    showSnackbar('Failed to load assets', 'error')
  } else {
    assets.value = data
  }
  loading.value = false
}

function openAddDialog() {
  isEditing.value = false
  form.value = { ...defaultForm }
  errors.value = {}
  formDialog.value = true
}

function openEditDialog(asset) {
  isEditing.value = true
  selectedAsset.value = asset
  form.value = { ...asset }
  errors.value = {}
  formDialog.value = true
}

function viewAsset(asset) {
  selectedAsset.value = asset
  viewDialog.value = true
}

function openDeleteDialog(asset) {
  selectedAsset.value = asset
  deleteDialog.value = true
}

function closeFormDialog() {
  formDialog.value = false
  form.value = { ...defaultForm }
  errors.value = {}
}

function validateForm() {
  errors.value = {}
  if (!form.value.asset_type) errors.value.asset_type = 'Asset type is required'
  if (!form.value.asset_name?.trim()) errors.value.asset_name = 'Asset name is required'
  return Object.keys(errors.value).length === 0
}

async function saveAsset() {
  if (!validateForm()) return
  saving.value = true

  const payload = {
    asset_name: form.value.asset_name,
    asset_type: form.value.asset_type,
    eqf_code: form.value.eqf_code,
    assigned_driver: form.value.asset_type === 'Vehicle' ? form.value.assigned_driver : null,
    operator: form.value.asset_type === 'Non-Vehicular' ? form.value.operator : null,
    plate_number: form.value.plate_number,
    model: form.value.model,
    year_model: form.value.year_model,
    engine_number: form.value.engine_number,
    body_type: form.value.asset_type === 'Vehicle' ? form.value.body_type : null,
    chassis_number: form.value.asset_type === 'Non-Vehicular' ? form.value.chassis_number : null,
    displacement: form.value.displacement,
    status: form.value.status,
  }

  if (isEditing.value) {
    const { error } = await supabase.from('vehicles').update(payload).eq('id', form.value.id)

    if (error) {
      showSnackbar('Failed to update asset', 'error')
    } else {
      showSnackbar('Asset updated successfully', 'success')
      closeFormDialog()
      await fetchAssets()
    }
  } else {
    const { error } = await supabase.from('vehicles').insert(payload)

    if (error) {
      showSnackbar('Failed to add asset', 'error')
    } else {
      showSnackbar('Asset added successfully', 'success')
      closeFormDialog()
      await fetchAssets()
    }
  }

  saving.value = false
}

async function deleteAsset() {
  deleting.value = true

  const { error } = await supabase.from('vehicles').delete().eq('id', selectedAsset.value.id)

  if (error) {
    showSnackbar('Failed to delete asset', 'error')
  } else {
    showSnackbar('Asset deleted successfully', 'success')
    deleteDialog.value = false
    await fetchAssets()
  }

  deleting.value = false
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// ---- LIFECYCLE ----
onMounted(() => {
  fetchAssets()
})
</script>
