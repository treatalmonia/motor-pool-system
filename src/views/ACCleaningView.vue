<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">AC Cleaning Log</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Track preventive cleaning schedules for all AC units
            </p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
            Add Cleaning Record
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Summary Cards -->

    <v-row class="mb-4">
      <v-col cols="12" sm="2">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="48">
              <v-icon>mdi-snowflake</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Records</p>
              <p class="text-h5 font-weight-bold">{{ cleaningRecords.length }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="2">
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
      <v-col cols="12" sm="2">
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
        <v-row class="mb-2" align="center">
          <v-col cols="12" sm="3">
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
              :items="['All', 'Pending', 'Forwarded to Tech.', 'Completed', 'Overdue']"
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
          <v-col cols="12" sm="3" class="d-flex justify-end align-center">
            <span class="text-caption text-medium-emphasis">
              Showing {{ filteredRecords.length }} of {{ cleaningRecords.length }} records
            </span>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="filteredRecords"
          :loading="loading"
          loading-text="Loading cleaning records..."
          no-data-text="No cleaning records found"
          items-per-page="10"
          rounded="lg"
        >
          <!-- Custom row for overdue highlighting -->
          <template v-slot:item="{ item, props }">
            <tr v-bind="props" :class="{ 'bg-red-lighten-5': isOverdue(item) }">
              <!-- Building -->
              <td>{{ item.building }}</td>

              <!-- Area / Room -->
              <td>{{ item.area_room }}</td>

              <!-- Last Cleaning -->
              <td>{{ formatDate(item.last_cleaning_date) }}</td>

              <!-- Date Completed -->
              <td>{{ formatDate(item.date_accomplished) }}</td>

              <!-- Next Cleaning -->
              <td>
                <span :class="isOverdue(item) ? 'text-error font-weight-bold' : ''">
                  {{ formatDate(item.next_cleaning_date) }}
                </span>
              </td>

              <!-- Conducted By -->
              <td>{{ item.conducted_by || '—' }}</td>

              <!-- Status -->
              <td>
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
                  <v-list density="compact" min-width="180">
                    <v-list-item
                      v-for="s in ['Pending', 'Forwarded to Tech.', 'Completed']"
                      :key="s"
                      :title="s"
                      @click="quickUpdateStatus(item, s)"
                    />
                  </v-list>
                </v-menu>
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
            {{ isEditing ? 'Edit Cleaning Record' : 'Add Cleaning Record' }}
          </span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Building -->
            <v-col cols="12" sm="6">
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
            </v-col>

            <!-- AC Unit -->

            <v-col cols="12" sm="6">
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
            </v-col>

            <!-- Last Cleaning Date -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.last_cleaning_date"
                label="Last Cleaning Date *"
                variant="outlined"
                density="comfortable"
                type="date"
                :error-messages="errors.last_cleaning_date"
                @update:modelValue="autoCalculateNextDate"
              />
            </v-col>

            <!-- Next Cleaning Date (auto-calculated) -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.next_cleaning_date"
                label="Next Cleaning Date"
                variant="outlined"
                density="comfortable"
                type="date"
                hint="Auto-calculated (3 months). You can change it."
                persistent-hint
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

            <!-- Status -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="['Pending', 'Forwarded to Tech.', 'Completed']"
                label="Status"
                variant="outlined"
                density="comfortable"
                @update:modelValue="onStatusChange"
              />
            </v-col>

            <!-- Date Completed -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.date_accomplished"
                label="Date Completed"
                variant="outlined"
                density="comfortable"
                type="date"
                hint="Auto-fills when status is set to Completed. You can change it."
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
          <span class="text-h6">Cleaning Record Details</span>
          <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
        </v-card-title>

        <v-card-text class="pa-4" v-if="selectedRecord">
          <!-- Badges -->
          <div class="mb-4 d-flex ga-2 flex-wrap">
            <v-chip :color="statusColor(selectedRecord.status)" size="large" variant="tonal">
              {{ selectedRecord.status }}
            </v-chip>
            <v-chip v-if="isOverdue(selectedRecord)" color="error" size="large" variant="tonal">
              <v-icon start>mdi-alert</v-icon>
              OVERDUE
            </v-chip>
          </div>

          <v-list lines="two" density="compact">
            <v-list-item subtitle="Building" :title="selectedRecord.building || '—'" />
            <v-list-item subtitle="Area / Room" :title="selectedRecord.area_room || '—'" />
            <v-list-item
              subtitle="Last Cleaning Date"
              :title="selectedRecord.last_cleaning_date || '—'"
            />
            <v-list-item
              subtitle="Next Cleaning Date"
              :title="selectedRecord.next_cleaning_date || '—'"
            />
            <v-list-item subtitle="Conducted By" :title="selectedRecord.conducted_by || '—'" />
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
          <h3 class="text-h6 mb-2">Delete Cleaning Record?</h3>
          <p class="text-medium-emphasis">
            Are you sure you want to delete this cleaning record for
            <strong>{{ selectedRecord?.area_room }}</strong
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
const cleaningRecords = ref([])
const acUnitList = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref('All')
const buildingFilter = ref('All')
const selectedBuilding = ref('')
const today = new Date().toISOString().split('T')[0]

// ---- BUILDINGS ----
const buildings = ref([])

// ---- DIALOGS ----
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedRecord = ref(null)

// ---- FORM ----
const defaultForm = {
  ac_unit_id: null,
  building: '',
  area_room: '',
  last_cleaning_date: today,
  next_cleaning_date: '',
  conducted_by: '',
  status: 'Pending',
  remarks: '',
  date_accomplished: null,
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ---- SNACKBAR ----
const snackbar = ref({ show: false, message: '', color: 'success' })

// ---- TABLE HEADERS ----
const headers = [
  { title: 'Building', key: 'building', sortable: true },
  { title: 'Area / Room', key: 'area_room', sortable: true },
  { title: 'Last Cleaning', key: 'last_cleaning_date', sortable: true },
  { title: 'Date Completed', key: 'date_accomplished', sortable: true },
  { title: 'Next Cleaning', key: 'next_cleaning_date', sortable: true },
  { title: 'Conducted By', key: 'conducted_by', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// ---- COMPUTED ----
const pendingCount = computed(
  () => cleaningRecords.value.filter((r) => r.status === 'Pending').length,
)
const forwardedCount = computed(
  () => cleaningRecords.value.filter((r) => r.status === 'Forwarded to Tech.').length,
)
const completedCount = computed(
  () => cleaningRecords.value.filter((r) => r.status === 'Completed').length,
)
const overdueCount = computed(() => cleaningRecords.value.filter((r) => isOverdue(r)).length)

const filteredAcUnits = computed(() => {
  if (!selectedBuilding.value) return []
  return acUnitList.value
    .filter((u) => u.building === selectedBuilding.value)
    .map((u) => ({
      ...u,
      display_name: `${u.floor} — ${u.area_room}`,
    }))
})

const filteredRecords = computed(() => {
  let result = cleaningRecords.value

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
        r.building?.toLowerCase().includes(s) ||
        r.area_room?.toLowerCase().includes(s) ||
        r.conducted_by?.toLowerCase().includes(s) ||
        r.remarks?.toLowerCase().includes(s),
    )
  }

  return result
})

// ---- HELPERS ----
function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

function onStatusChange(newStatus) {
  if (newStatus === 'Completed' && !form.value.date_accomplished) {
    form.value.date_accomplished = today
  }
}
function isOverdue(record) {
  if (record.status === 'Completed') return false
  if (!record.next_cleaning_date) return false
  return record.next_cleaning_date < today
}

function statusColor(status) {
  const colors = {
    Pending: 'warning',
    'Forwarded to Tech.': 'info',
    Completed: 'success',
    Overdue: 'error',
  }
  return colors[status] || 'grey'
}

//Remove Unused Function
// function getAcUnitDetails(acUnitId) {
//   return acUnitList.value.find(u => u.id === acUnitId) || null
// }

// Auto-calculate next cleaning date (3 months after last cleaning)
function autoCalculateNextDate(dateValue) {
  if (!dateValue) return
  const date = new Date(dateValue)
  date.setMonth(date.getMonth() + 3)
  form.value.next_cleaning_date = date.toISOString().split('T')[0]
}

function onBuildingChange() {
  form.value.ac_unit_id = null
  form.value.area_room = ''
}

// ---- METHODS ----
async function fetchBuildings() {
  const { data, error } = await supabase.from('buildings').select('name').order('name')
  if (!error) buildings.value = data.map((b) => b.name)
}

async function fetchRecords() {
  loading.value = true

  const { data, error } = await supabase
    .from('ac_cleaning_log')
    .select('*')
    .order('next_cleaning_date', { ascending: true })

  if (error) {
    showSnackbar('Failed to load cleaning records', 'error')
  } else {
    cleaningRecords.value = data
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

function openAddDialog() {
  isEditing.value = false
  selectedBuilding.value = ''
  form.value = {
    ...defaultForm,
    last_cleaning_date: today,
  }
  autoCalculateNextDate(today)
  errors.value = {}
  formDialog.value = true
}

function openEditDialog(record) {
  isEditing.value = true
  selectedRecord.value = record
  form.value = { ...record }
  selectedBuilding.value = record.building
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
  selectedBuilding.value = ''
  errors.value = {}
}

function validateForm() {
  errors.value = {}
  if (!selectedBuilding.value) errors.value.building = 'Building is required'
  if (!form.value.area_room?.trim()) errors.value.ac_unit_id = 'AC Unit / Room is required'
  if (!form.value.last_cleaning_date)
    errors.value.last_cleaning_date = 'Last cleaning date is required'
  return Object.keys(errors.value).length === 0
}

async function saveRecord() {
  if (!validateForm()) return
  // Save new building to DB if it doesn't exist yet
  if (selectedBuilding.value && !buildings.value.includes(selectedBuilding.value)) {
    await supabase.from('buildings').insert({ name: selectedBuilding.value })
    await fetchBuildings()
  }
  saving.value = true

  const payload = {
    date_accomplished: form.value.date_accomplished || null,
    ac_unit_id: form.value.ac_unit_id,
    building: selectedBuilding.value,
    area_room: form.value.area_room,
    last_cleaning_date: form.value.last_cleaning_date,
    next_cleaning_date: form.value.next_cleaning_date || null,
    conducted_by: form.value.conducted_by,
    status: form.value.status,
    remarks: form.value.remarks,
  }

  if (isEditing.value) {
    const { error } = await supabase.from('ac_cleaning_log').update(payload).eq('id', form.value.id)

    if (error) {
      showSnackbar('Failed to update cleaning record', 'error')
    } else {
      showSnackbar('Cleaning record updated successfully', 'success')
      closeFormDialog()
      await fetchRecords()
    }
  } else {
    const { error } = await supabase.from('ac_cleaning_log').insert(payload)

    if (error) {
      showSnackbar('Failed to add cleaning record', 'error')
    } else {
      showSnackbar('Cleaning record added successfully', 'success')
      closeFormDialog()
      await fetchRecords()
    }
  }

  saving.value = false
}

async function deleteRecord() {
  deleting.value = true

  const { error } = await supabase
    .from('ac_cleaning_log')
    .delete()
    .eq('id', selectedRecord.value.id)

  if (error) {
    showSnackbar('Failed to delete cleaning record', 'error')
  } else {
    showSnackbar('Cleaning record deleted successfully', 'success')
    deleteDialog.value = false
    await fetchRecords()
  }

  deleting.value = false
}

async function quickUpdateStatus(item, newStatus) {
  const payload = { status: newStatus }
  if (newStatus === 'Completed' && !item.date_accomplished) {
    payload.date_accomplished = new Date().toISOString().split('T')[0]
  }
  const { error } = await supabase.from('ac_cleaning_log').update(payload).eq('id', item.id)
  if (error) {
    showSnackbar('Failed to update status', 'error')
  } else {
    item.status = newStatus
    if (payload.date_accomplished) item.date_accomplished = payload.date_accomplished
    showSnackbar('Status updated', 'success')
  }
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// ---- LIFECYCLE ----
onMounted(async () => {
  await fetchBuildings()
  await fetchAcUnits()
  await fetchRecords()
})
</script>
