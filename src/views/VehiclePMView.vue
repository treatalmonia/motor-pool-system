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
        <v-row class="mb-2">
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
              :items="assetOptions"
              label="Asset"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="filteredRecords"
          :loading="loading"
          loading-text="Loading PM records..."
          no-data-text="No PM records found"
          items-per-page="10"
          rounded="lg"
        >
          <template v-slot:item="{ item, props }">
            <tr v-bind="props" :class="{ 'bg-red-lighten-5': isOverdue(item) }">
              <td>{{ item.asset_name }}</td>
              <td>
                <v-chip
                  :color="item.asset_type === 'Vehicle' ? 'info' : 'warning'"
                  size="small"
                  variant="tonal"
                >
                  {{ item.asset_type }}
                </v-chip>
              </td>
              <td>{{ item.service_type }}</td>

              <!-- Last Date Performed -->
              <td>{{ formatDate(item.date_performed) }}</td>

              <!-- Odometer at Service -->
              <td>
                <span v-if="item.asset_type === 'Vehicle'">
                  {{ item.odometer ? Number(item.odometer).toLocaleString() + ' km' : '—' }}
                </span>
                <span v-else class="text-medium-emphasis">—</span>
              </td>

              <!-- Date Completed -->
              <td>{{ formatDate(item.date_accomplished) || '—' }}</td>

              <!-- Next Due Date -->
              <td>
                <span :class="isOverdue(item) ? 'text-error font-weight-bold' : ''">
                  {{ formatDate(item.next_due_date) || '—' }}
                </span>
              </td>

              <!-- Next Due Odo -->
              <td>
                <span v-if="item.asset_type === 'Vehicle'">
                  {{
                    item.next_due_odometer
                      ? Number(item.next_due_odometer).toLocaleString() + ' km'
                      : '—'
                  }}
                </span>
                <span v-else class="text-medium-emphasis">—</span>
              </td>

              <td>
                <v-chip :color="statusColor(item.status)" size="small" variant="tonal">
                  {{ item.status }}
                </v-chip>
              </td>
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
    <v-dialog v-model="formDialog" max-width="700" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">
          <span class="text-h6">
            {{ isEditing ? 'Edit PM Record' : 'Add PM Record' }}
          </span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Asset -->
            <v-col cols="12" sm="6">
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

            <!-- Service Type -->
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.service_type"
                :items="serviceTypeNames"
                label="Service Type *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.service_type"
                @update:modelValue="onServiceTypeSelected"
              />
            </v-col>

            <!-- Row: Date Performed | Odometer or Hours -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.date_performed_display"
                label="Last Date Performed * (MM/DD/YY)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 03/05/26"
                :error-messages="errors.date_performed"
                @input="onDatePerformedInput"
              />
            </v-col>

            <v-col cols="12" sm="6" v-if="selectedAssetType === 'Vehicle'">
              <v-text-field
                v-model="form.odometer_display"
                label="Previous Odometer (km)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 43,117"
                @input="onOdometerInput"
                @blur="onOdometerBlur"
              />
            </v-col>

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

            <!-- Row: Months Between Service | KM Between Service -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.months_between_service"
                label="Months Between Service"
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
              />
            </v-col>

            <v-col cols="12" sm="6" v-if="selectedAssetType === 'Vehicle'">
              <v-text-field
                v-model="form.km_between_service_display"
                label="KM Between Service"
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
              />
            </v-col>

            <!-- Row: Next Due Date | Next Due Odometer -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.next_due_date_display"
                label="Next Due Date (MM/DD/YY)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 09/05/26"
                @input="onNextDueDateInput"
              />
            </v-col>

            <v-col cols="12" sm="6" v-if="selectedAssetType === 'Vehicle'">
              <v-text-field
                v-model="form.next_due_odometer_display"
                label="Next Due Odometer (km)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 51,117"
                @input="onNextDueOdometerInput"
                @blur="onNextDueOdometerBlur"
              />
            </v-col>

            <v-col cols="12"><v-divider /></v-col>

            <!-- Reference No -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.reference_no"
                label="Reference No. (SR)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 2025-001"
                hint="Service Request number linked to this PM"
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

            <!-- Cost -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.cost_display"
                label="Cost (₱)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 1,500"
                @input="onCostInput"
                @blur="onCostBlur"
              />
            </v-col>

            <!-- Status -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="['Scheduled', 'Completed', 'Cancelled']"
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
            <!-- Current Odometer -->
            <v-col cols="12" sm="6" v-if="selectedAssetType === 'Vehicle'">
              <v-text-field
                v-model="form.current_odometer_display"
                label="Current Odometer (km)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 45,000"
                @input="onCurrentOdometerInput"
                @blur="onCurrentOdometerBlur"
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
    <v-dialog v-model="viewDialog" max-width="560">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0 d-flex align-center justify-space-between">
          <span class="text-h6">PM Record Details</span>
          <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
        </v-card-title>

        <v-card-text class="pa-4" v-if="selectedRecord">
          <!-- Status Badges -->
          <div class="d-flex ga-2 flex-wrap mb-4">
            <v-chip
              :color="selectedRecord.asset_type === 'Vehicle' ? 'info' : 'warning'"
              variant="tonal"
            >
              <v-icon start>
                {{ selectedRecord.asset_type === 'Vehicle' ? 'mdi-car' : 'mdi-engine' }}
              </v-icon>
              {{ selectedRecord.asset_type }}
            </v-chip>
            <v-chip :color="statusColor(selectedRecord.status)" variant="tonal">
              {{ selectedRecord.status }}
            </v-chip>
            <v-chip v-if="isOverdue(selectedRecord)" color="error" variant="tonal">
              <v-icon start>mdi-alert</v-icon>OVERDUE
            </v-chip>
          </div>

          <!-- Section: Asset & Service Info -->
          <p class="text-caption text-medium-emphasis font-weight-bold mb-2">ASSET & SERVICE</p>
          <v-card variant="tonal" color="grey" rounded="lg" class="mb-4">
            <v-card-text class="pa-3">
              <v-row dense>
                <v-col cols="6">
                  <p class="text-caption text-medium-emphasis">Asset</p>
                  <p class="text-body-2 font-weight-medium">
                    {{ selectedRecord.asset_name || '—' }}
                  </p>
                </v-col>
                <v-col cols="6">
                  <p class="text-caption text-medium-emphasis">Service Type</p>
                  <p class="text-body-2 font-weight-medium">
                    {{ selectedRecord.service_type || '—' }}
                  </p>
                </v-col>
                <v-col cols="6">
                  <p class="text-caption text-medium-emphasis">Conducted By</p>
                  <p class="text-body-2 font-weight-medium">
                    {{ selectedRecord.conducted_by || '—' }}
                  </p>
                </v-col>
                <v-col cols="6">
                  <p class="text-caption text-medium-emphasis">Cost</p>
                  <p class="text-body-2 font-weight-medium">
                    {{
                      selectedRecord.cost ? '₱' + Number(selectedRecord.cost).toLocaleString() : '—'
                    }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Section: Service Details -->
          <p class="text-caption text-medium-emphasis font-weight-bold mb-2">SERVICE DETAILS</p>
          <v-card variant="tonal" color="grey" rounded="lg" class="mb-4">
            <v-card-text class="pa-3">
              <v-row dense>
                <v-col cols="6">
                  <p class="text-caption text-medium-emphasis">Last Date Performed</p>
                  <p class="text-body-2 font-weight-medium">
                    {{ formatDate(selectedRecord.date_performed) || '—' }}
                  </p>
                </v-col>
                <v-col cols="6" v-if="selectedRecord.asset_type === 'Vehicle'">
                  <p class="text-caption text-medium-emphasis">Odometer at Service</p>
                  <p class="text-body-2 font-weight-medium">
                    {{
                      selectedRecord.odometer
                        ? Number(selectedRecord.odometer).toLocaleString() + ' km'
                        : '—'
                    }}
                  </p>
                </v-col>
                <v-col cols="6" v-if="selectedRecord.asset_type === 'Non-Vehicular'">
                  <p class="text-caption text-medium-emphasis">Hours of Operation</p>
                  <p class="text-body-2 font-weight-medium">
                    {{
                      selectedRecord.hours_of_operation
                        ? selectedRecord.hours_of_operation + ' hrs'
                        : '—'
                    }}
                  </p>
                </v-col>
                <v-col cols="6">
                  <p class="text-caption text-medium-emphasis">Months Between Service</p>
                  <p class="text-body-2 font-weight-medium">
                    {{
                      selectedRecord.months_between_service
                        ? selectedRecord.months_between_service + ' months'
                        : '—'
                    }}
                  </p>
                </v-col>
                <v-col cols="6" v-if="selectedRecord.asset_type === 'Vehicle'">
                  <p class="text-caption text-medium-emphasis">KM Between Service</p>
                  <p class="text-body-2 font-weight-medium">
                    {{
                      selectedRecord.km_between_service
                        ? Number(selectedRecord.km_between_service).toLocaleString() + ' km'
                        : '—'
                    }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Section: Next Due -->
          <p class="text-caption text-medium-emphasis font-weight-bold mb-2">NEXT DUE</p>
          <v-card variant="tonal" color="grey" rounded="lg" class="mb-4">
            <v-card-text class="pa-3">
              <v-row dense>
                <v-col cols="6">
                  <p class="text-caption text-medium-emphasis">Next Due Date</p>
                  <p
                    class="text-body-2 font-weight-medium"
                    :class="isOverdue(selectedRecord) ? 'text-error' : ''"
                  >
                    {{ formatDate(selectedRecord.next_due_date) || '—' }}
                  </p>
                </v-col>
                <v-col cols="6" v-if="selectedRecord.asset_type === 'Vehicle'">
                  <p class="text-caption text-medium-emphasis">Next Due Odometer</p>
                  <p class="text-body-2 font-weight-medium">
                    {{
                      selectedRecord.next_due_odometer
                        ? Number(selectedRecord.next_due_odometer).toLocaleString() + ' km'
                        : '—'
                    }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Reference -->
          <p class="text-caption text-medium-emphasis font-weight-bold mb-2">REFERENCE</p>
          <v-card variant="tonal" color="grey" rounded="lg" class="mb-4">
            <v-card-text class="pa-3">
              <p class="text-caption text-medium-emphasis">Service Request No.</p>
              <p class="text-body-2 font-weight-medium">
                {{ selectedRecord.reference_no || '—' }}
              </p>
            </v-card-text>
          </v-card>

          <!-- Remarks -->
          <p class="text-caption text-medium-emphasis font-weight-bold mb-2">REMARKS</p>
          <v-card variant="tonal" color="grey" rounded="lg">
            <v-card-text class="pa-3">
              <p class="text-body-2">{{ selectedRecord.remarks || 'No remarks.' }}</p>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-4 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete PM Record?</h3>
          <p class="text-medium-emphasis">
            Are you sure you want to delete this
            <strong>{{ selectedRecord?.service_type }}</strong> record for
            <strong>{{ selectedRecord?.asset_name }}</strong
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
const assetList = ref([])
const pmServiceTypes = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref('All')
const vehicleFilter = ref('All')
const assetTypeFilter = ref('All')
const selectedAssetType = ref('Vehicle')
const today = new Date().toISOString().split('T')[0]

// ---- DIALOGS ----
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedRecord = ref(null)

// ---- FORM ----
const defaultForm = {
  vehicle_id: null,
  asset_type: 'Vehicle',
  service_type: '',
  service_type_id: null,
  reference_no: '',
  date_performed: today,
  date_performed_display: formatDate(today),
  next_due_date_display: '',
  odometer: null,
  odometer_display: '',
  hours_of_operation: null,
  km_between_service: null,
  km_between_service_display: '',
  months_between_service: null,
  next_due_date: '',
  next_due_odometer: null,
  next_due_odometer_display: '',
  conducted_by: '',
  cost: null,
  cost_display: '',
  status: 'Scheduled',
  current_odometer: null,
  current_odometer_display: '',
  remarks: '',
  date_accomplished: null,
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ---- SNACKBAR ----
const snackbar = ref({ show: false, message: '', color: 'success' })

// ---- TABLE HEADERS ----
const headers = [
  { title: 'Asset', key: 'asset_name', sortable: true },
  { title: 'Type', key: 'asset_type', sortable: true },
  { title: 'Service Type', key: 'service_type', sortable: true },
  { title: 'Last Date Performed', key: 'date_performed', sortable: true },
  { title: 'Previous Odometer', key: 'odometer', sortable: false },
  { title: 'Date Completed', key: 'date_accomplished', sortable: true },
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
const serviceTypeNames = computed(() => pmServiceTypes.value.map((s) => s.service_type))
const assetOptions = computed(() => ['All', ...assetList.value.map((a) => a.asset_name)])

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

const filteredRecords = computed(() => {
  let result = pmRecords.value
  if (assetTypeFilter.value !== 'All')
    result = result.filter((r) => r.asset_type === assetTypeFilter.value)
  if (statusFilter.value !== 'All') result = result.filter((r) => r.status === statusFilter.value)
  if (vehicleFilter.value !== 'All')
    result = result.filter((r) => r.asset_name === vehicleFilter.value)
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.asset_name?.toLowerCase().includes(s) ||
        r.service_type?.toLowerCase().includes(s) ||
        r.conducted_by?.toLowerCase().includes(s) ||
        r.remarks?.toLowerCase().includes(s),
    )
  }
  return result
})

// ---- FORMAT HELPERS ----
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

function formatNumber(val) {
  if (!val && val !== 0) return ''
  return Number(val).toLocaleString()
}

// function parseNumber(val) {
//   if (!val) return null
//   return Number(String(val).replace(/,/g, ''))
// }

// ---- COMMA-FORMATTED INPUT HANDLERS ----
function onOdometerInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    form.value.odometer = Number(raw)
    recalculateNextDueOdometer()
  }
}
function onOdometerBlur() {
  form.value.odometer_display = form.value.odometer ? formatNumber(form.value.odometer) : ''
}

function onCurrentOdometerInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    form.value.current_odometer = Number(raw)
  }
}
function onCurrentOdometerBlur() {
  form.value.current_odometer_display = form.value.current_odometer
    ? formatNumber(form.value.current_odometer)
    : ''
}

function onDatePerformedInput(e) {
  const val = e.target.value
  form.value.date_performed_display = val
  // Parse MM/DD/YY into ISO for saving
  const parts = val.split('/')
  if (parts.length === 3) {
    const mm = parts[0].padStart(2, '0')
    const dd = parts[1].padStart(2, '0')
    const yy = parts[2].length === 2 ? '20' + parts[2] : parts[2]
    const iso = `${yy}-${mm}-${dd}`
    if (!isNaN(new Date(iso).getTime())) {
      form.value.date_performed = iso
      recalculateNextDueDate()
    }
  }
}

function onNextDueDateInput(e) {
  const val = e.target.value
  form.value.next_due_date_display = val
  const parts = val.split('/')
  if (parts.length === 3) {
    const mm = parts[0].padStart(2, '0')
    const dd = parts[1].padStart(2, '0')
    const yy = parts[2].length === 2 ? '20' + parts[2] : parts[2]
    const iso = `${yy}-${mm}-${dd}`
    if (!isNaN(new Date(iso).getTime())) {
      form.value.next_due_date = iso
    }
  }
}

function onCostInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    form.value.cost = Number(raw)
  }
}
function onCostBlur() {
  form.value.cost_display = form.value.cost ? formatNumber(form.value.cost) : ''
}

function onNextDueOdometerInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    form.value.next_due_odometer = Number(raw)
  }
}
function onNextDueOdometerBlur() {
  form.value.next_due_odometer_display = form.value.next_due_odometer
    ? formatNumber(form.value.next_due_odometer)
    : ''
}

// ---- HELPERS ----
function onStatusChange(newStatus) {
  if (newStatus === 'Completed' && !form.value.date_accomplished) {
    form.value.date_accomplished = today
  }
}
function itemProps(item) {
  return {
    disabled: item.isHeader,
    class: item.isHeader ? 'text-primary font-weight-bold text-caption' : '',
  }
}

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

function getAssetName(assetId) {
  const asset = assetList.value.find((a) => a.id === assetId)
  return asset ? asset.asset_name : '—'
}

function getAssetType(assetId) {
  const asset = assetList.value.find((a) => a.id === assetId)
  return asset ? asset.asset_type : 'Vehicle'
}

// ---- AUTO-CALCULATION ----
function recalculateNextDueDate() {
  if (!form.value.date_performed || !form.value.months_between_service) return
  const [year, month, day] = form.value.date_performed.split('-').map(Number)
  const date = new Date(year, month - 1 + Number(form.value.months_between_service), day)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  form.value.next_due_date = `${y}-${m}-${d}`
  form.value.next_due_date_display = formatDate(`${y}-${m}-${d}`)
}

function recalculateNextDueOdometer() {
  if (!form.value.odometer || !form.value.km_between_service) return
  const result = Number(form.value.odometer) + Number(form.value.km_between_service)
  form.value.next_due_odometer = result
  form.value.next_due_odometer_display = formatNumber(result)
}

// ---- EVENT HANDLERS ----
function onAssetSelected(assetId) {
  if (!assetId || assetId === '__header_vehicle__' || assetId === '__header_nonvehicle__') {
    form.value.vehicle_id = null
    return
  }
  const asset = assetList.value.find((a) => a.id === assetId)
  if (asset) {
    selectedAssetType.value = asset.asset_type
    form.value.asset_type = asset.asset_type
    if (asset.asset_type === 'Non-Vehicular') {
      form.value.km_between_service = null
      form.value.km_between_service_display = ''
      form.value.months_between_service = 6
      recalculateNextDueDate()
    }
    if (form.value.service_type) onServiceTypeSelected(form.value.service_type)
  }
}

function onServiceTypeSelected(serviceTypeName) {
  if (!serviceTypeName) return
  const match = pmServiceTypes.value.find((s) => s.service_type === serviceTypeName)
  if (match) {
    form.value.service_type_id = match.id
    if (selectedAssetType.value === 'Vehicle') {
      if (match.km_between_service) {
        form.value.km_between_service = match.km_between_service
        form.value.km_between_service_display = formatNumber(match.km_between_service)
      }
      if (match.months_between_service)
        form.value.months_between_service = match.months_between_service
    } else {
      form.value.km_between_service = null
      form.value.km_between_service_display = ''
      form.value.months_between_service = match.months_between_service || 6
    }
    recalculateNextDueDate()
    recalculateNextDueOdometer()
  } else {
    form.value.service_type_id = null
  }
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
      asset_name: getAssetName(r.vehicle_id),
      asset_type: r.asset_type || getAssetType(r.vehicle_id),
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

async function fetchPMServiceTypes() {
  const { data, error } = await supabase.from('pm_service_types').select('*').order('service_type')
  if (!error) pmServiceTypes.value = data
}

function openAddDialog() {
  isEditing.value = false
  selectedAssetType.value = 'Vehicle'
  form.value = { ...defaultForm, date_performed: today }
  errors.value = {}
  formDialog.value = true
}

function openEditDialog(record) {
  isEditing.value = true
  selectedRecord.value = record
  selectedAssetType.value = record.asset_type || 'Vehicle'
  form.value = {
    ...record,
    date_performed_display: record.date_performed ? formatDate(record.date_performed) : '',
    next_due_date_display: record.next_due_date ? formatDate(record.next_due_date) : '',
    odometer_display: record.odometer ? formatNumber(record.odometer) : '',
    km_between_service_display: record.km_between_service
      ? formatNumber(record.km_between_service)
      : '',
    next_due_odometer_display: record.next_due_odometer
      ? formatNumber(record.next_due_odometer)
      : '',
    cost_display: record.cost ? formatNumber(record.cost) : '',
  }
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
  selectedAssetType.value = 'Vehicle'
  errors.value = {}
}

function validateForm() {
  errors.value = {}
  if (!form.value.vehicle_id) errors.value.vehicle_id = 'Asset is required'
  if (!form.value.service_type?.trim()) errors.value.service_type = 'Service type is required'
  if (!form.value.date_performed) errors.value.date_performed = 'Date performed is required'
  return Object.keys(errors.value).length === 0
}

async function saveRecord() {
  if (!validateForm()) return
  saving.value = true

  const payload = {
    date_accomplished: form.value.date_accomplished || null,
    vehicle_id: form.value.vehicle_id,
    asset_type: form.value.asset_type,
    service_type: form.value.service_type,
    date_performed: form.value.date_performed,

    odometer: selectedAssetType.value === 'Vehicle' ? form.value.odometer || null : null,
    hours_of_operation:
      selectedAssetType.value === 'Non-Vehicular' ? form.value.hours_of_operation || null : null,
    km_between_service:
      selectedAssetType.value === 'Vehicle' ? form.value.km_between_service || null : null,
    months_between_service: form.value.months_between_service || null,
    next_due_date: form.value.next_due_date || null,
    next_due_odometer:
      selectedAssetType.value === 'Vehicle' ? form.value.next_due_odometer || null : null,
    conducted_by: form.value.conducted_by,
    cost: form.value.cost || null,
    status: form.value.status,
    current_odometer:
      selectedAssetType.value === 'Vehicle' ? form.value.current_odometer || null : null,
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
  await fetchAssets()
  await fetchPMServiceTypes()
  await fetchRecords()
})
</script>
