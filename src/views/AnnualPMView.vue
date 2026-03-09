<template>
  <v-container fluid>
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <h2 class="text-h5 font-weight-bold">Annual PM Program</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Annual Preventive Maintenance Program for Transportation Services
            </p>
          </div>
          <div class="d-flex ga-2 flex-wrap align-center">
            <v-select
              v-model="selectedYear"
              :items="availableYears"
              label="Year"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 110px"
              @update:modelValue="fetchProgram"
            />
            <v-btn
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-content-copy"
              @click="openCopyYearDialog"
            >
              Copy to New Year
            </v-btn>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog"> Add Row </v-btn>
            <v-btn
              color="success"
              variant="outlined"
              prepend-icon="mdi-pencil"
              @click="openSignatoryDialog"
            >
              Edit Signatories
            </v-btn>
            <v-btn color="teal" variant="outlined" prepend-icon="mdi-printer" @click="printProgram">
              Print / PDF
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row class="mb-4">
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="44">
              <v-icon>mdi-format-list-bulleted</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Tasks</p>
              <p class="text-h5 font-weight-bold">{{ rows.length }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="green-darken-2" variant="tonal" size="44">
              <v-icon>mdi-tag-multiple</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Categories</p>
              <p class="text-h5 font-weight-bold">{{ uniqueDescriptions.length }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="orange-darken-2" variant="tonal" size="44">
              <v-icon>mdi-calendar-today</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Daily Tasks</p>
              <p class="text-h5 font-weight-bold">{{ dailyCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="info" variant="tonal" size="44">
              <v-icon>mdi-calendar-star</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Program Year</p>
              <p class="text-h5 font-weight-bold">{{ selectedYear }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Document Card -->
    <v-card rounded="lg" elevation="2" class="document-card">
      <!-- ── DOCUMENT HEADER ── -->
      <div class="doc-header px-6 pt-5 pb-3">
        <div class="d-flex align-center justify-space-between">
          <!-- CSU Banner -->
          <img
            src="/images/header_banner.png"
            alt="Caraga State University"
            class="header-banner"
          />
          <!-- Right logos -->
          <div class="d-flex flex-column align-end ga-1">
            <img src="/images/bagong_pilipinas.png" alt="Bagong Pilipinas" class="logo-bagong" />
            <img src="/images/socotec_ab.png" alt="SOCOTEC AB" class="logo-socotec" />
          </div>
        </div>

        <!-- Horizontal rule -->
        <v-divider class="mt-3 mb-4 border-opacity-50" color="green-darken-3" thickness="2" />

        <!-- Document Title -->
        <div class="text-center mb-3">
          <p class="doc-title">ANNUAL PREVENTIVE MAINTENANCE PROGRAM</p>
          <p class="doc-subtitle">FOR TRANSPORTATION SERVICES</p>
          <v-chip color="green-darken-2" variant="tonal" size="small" class="mt-1">
            <v-icon start size="14">mdi-calendar</v-icon>
            {{ selectedYear }}
          </v-chip>
        </div>

        <!-- Objectives (collapsible) -->
        <v-expansion-panels variant="accordion" class="mb-2 objectives-panel">
          <v-expansion-panel>
            <v-expansion-panel-title class="objectives-title">
              <v-icon start color="green-darken-3" size="18">mdi-bullseye-arrow</v-icon>
              <span class="text-body-2 font-weight-bold text-green-darken-3"> OBJECTIVES </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="objectives-content">
                <div v-for="obj in objectives" :key="obj.title" class="mb-3">
                  <p class="font-weight-bold text-body-2 text-green-darken-3 mb-1">
                    <v-icon size="14" class="mr-1">mdi-chevron-right</v-icon>
                    {{ obj.title }}
                  </p>
                  <ul class="objectives-list">
                    <li
                      v-for="point in obj.points"
                      :key="point"
                      class="text-body-2 text-medium-emphasis"
                    >
                      {{ point }}
                    </li>
                  </ul>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <!-- ── PROGRAM TABLE ── -->
      <div class="px-4 pb-2">
        <div v-if="loading" class="pa-10 text-center">
          <v-progress-circular indeterminate color="green-darken-2" />
          <p class="mt-3 text-medium-emphasis">Loading program...</p>
        </div>

        <div v-else-if="rows.length === 0" class="pa-10 text-center">
          <v-icon size="64" color="grey-lighten-1">mdi-file-document-outline</v-icon>
          <p class="mt-3 text-medium-emphasis">No program found for {{ selectedYear }}.</p>
          <v-btn color="primary" class="mt-3" @click="openCopyYearDialog">
            Copy from another year
          </v-btn>
        </div>

        <div v-else class="table-wrapper">
          <table class="pm-table">
            <thead>
              <tr>
                <th class="th-desc" rowspan="2">DESCRIPTION</th>
                <th class="th-comp" rowspan="2">COMPONENTS</th>
                <th class="th-task" rowspan="2">TASK</th>
                <th class="th-freq" colspan="6">FREQUENCY</th>
                <th class="th-resp" rowspan="2">RESPONSIBLE</th>
                <th class="th-rem" rowspan="2">REMARKS</th>
                <th class="th-act" rowspan="2">ACTIONS</th>
              </tr>
              <tr>
                <th class="th-freq-sub">DAILY</th>
                <th class="th-freq-sub">WEEKLY</th>
                <th class="th-freq-sub">MONTHLY</th>
                <th class="th-freq-sub">QUARTERLY</th>
                <th class="th-freq-sub">BI-ANNUAL</th>
                <th class="th-freq-sub">ANNUAL</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(group, gIdx) in groupedRows" :key="gIdx">
                <tr
                  v-for="(row, rIdx) in group.items"
                  :key="row.id"
                  class="pm-row"
                  :class="rIdx % 2 === 0 ? 'row-even' : 'row-odd'"
                >
                  <!-- Description — only on first row of group -->
                  <td v-if="rIdx === 0" :rowspan="group.items.length" class="td-desc">
                    <span class="desc-text">{{ group.description }}</span>
                  </td>

                  <td class="td-comp">{{ row.component }}</td>
                  <td class="td-task">{{ row.task }}</td>

                  <!-- Frequency cells — yellow if true -->
                  <td class="td-freq" :class="{ 'freq-active': row.freq_daily }"></td>
                  <td class="td-freq" :class="{ 'freq-active': row.freq_weekly }"></td>
                  <td class="td-freq" :class="{ 'freq-active': row.freq_monthly }"></td>
                  <td class="td-freq" :class="{ 'freq-active': row.freq_quarterly }"></td>
                  <td class="td-freq" :class="{ 'freq-active': row.freq_biannual }"></td>
                  <td class="td-freq" :class="{ 'freq-active': row.freq_annual }"></td>

                  <td class="td-resp">{{ row.responsible }}</td>
                  <td class="td-rem">{{ row.remarks }}</td>
                  <td class="td-act">
                    <v-btn
                      icon="mdi-pencil"
                      size="x-small"
                      variant="text"
                      color="primary"
                      @click="openEditDialog(row)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="openDeleteDialog(row)"
                    />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── SIGNATORIES ── -->
      <div v-if="rows.length > 0 && signatories" class="signatories-section px-8 py-6">
        <v-divider class="mb-6" />
        <v-row>
          <v-col cols="4" class="text-center">
            <p class="sig-label">Prepared By:</p>
            <div class="sig-line"></div>
            <p class="sig-name">{{ signatories.prepared_by_name }}</p>
            <p class="sig-title">{{ signatories.prepared_by_title }}</p>
          </v-col>
          <v-col cols="4" class="text-center">
            <p class="sig-label">Reviewed By:</p>
            <div class="sig-line"></div>
            <p class="sig-name">{{ signatories.reviewed_by_name }}</p>
            <p class="sig-title">{{ signatories.reviewed_by_title }}</p>
          </v-col>
          <v-col cols="4" class="text-center">
            <p class="sig-label">Approved By:</p>
            <div class="sig-line"></div>
            <p class="sig-name">{{ signatories.approved_by_name }}</p>
            <p class="sig-title">{{ signatories.approved_by_title }}</p>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- ── ADD / EDIT ROW DIALOG ── -->
    <v-dialog v-model="formDialog" max-width="680" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0">
          <span class="text-h6">{{ isEditing ? 'Edit Row' : 'Add Row' }}</span>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.description"
                :items="uniqueDescriptions"
                label="Description / Category *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.description"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.component"
                label="Component *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.component"
                placeholder="e.g. Engine oil level"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.task"
                label="Task"
                variant="outlined"
                density="comfortable"
                rows="2"
                placeholder="Describe the task"
              />
            </v-col>

            <!-- Frequency -->
            <v-col cols="12">
              <p class="text-body-2 font-weight-medium mb-3">
                <v-icon size="16" class="mr-1" color="green-darken-2"> mdi-clock-outline </v-icon>
                Frequency
              </p>
              <div class="d-flex flex-wrap ga-3">
                <v-checkbox
                  v-model="form.freq_daily"
                  label="Daily"
                  density="compact"
                  hide-details
                  color="green-darken-2"
                />
                <v-checkbox
                  v-model="form.freq_weekly"
                  label="Weekly"
                  density="compact"
                  hide-details
                  color="green-darken-2"
                />
                <v-checkbox
                  v-model="form.freq_monthly"
                  label="Monthly"
                  density="compact"
                  hide-details
                  color="green-darken-2"
                />
                <v-checkbox
                  v-model="form.freq_quarterly"
                  label="Quarterly"
                  density="compact"
                  hide-details
                  color="green-darken-2"
                />
                <v-checkbox
                  v-model="form.freq_biannual"
                  label="Bi-Annual"
                  density="compact"
                  hide-details
                  color="green-darken-2"
                />
                <v-checkbox
                  v-model="form.freq_annual"
                  label="Annual"
                  density="compact"
                  hide-details
                  color="green-darken-2"
                />
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.responsible"
                :items="responsibleOptions"
                label="Responsible"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.remarks"
                label="Remarks"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveRow">
            {{ isEditing ? 'Save Changes' : 'Add Row' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── EDIT SIGNATORIES DIALOG ── -->
    <v-dialog v-model="signatoryDialog" max-width="600" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0">
          <v-icon start color="green-darken-2">mdi-account-edit</v-icon>
          Edit Signatories
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <!-- Prepared By -->
            <v-col cols="12">
              <p class="text-caption font-weight-bold text-green-darken-3 mb-2">PREPARED BY</p>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="sigForm.prepared_by_name"
                label="Name"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="sigForm.prepared_by_title"
                label="Title / Position"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12"><v-divider /></v-col>

            <!-- Reviewed By -->
            <v-col cols="12">
              <p class="text-caption font-weight-bold text-green-darken-3 mb-2">REVIEWED BY</p>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="sigForm.reviewed_by_name"
                label="Name"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="sigForm.reviewed_by_title"
                label="Title / Position"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12"><v-divider /></v-col>

            <!-- Approved By -->
            <v-col cols="12">
              <p class="text-caption font-weight-bold text-green-darken-3 mb-2">APPROVED BY</p>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="sigForm.approved_by_name"
                label="Name"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="sigForm.approved_by_title"
                label="Title / Position"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="signatoryDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="savingSig" @click="saveSignatories">
            Save Signatories
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── COPY YEAR DIALOG ── -->
    <v-dialog v-model="copyYearDialog" max-width="420">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0">
          <v-icon start>mdi-content-copy</v-icon>
          Copy Program to New Year
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-2 text-medium-emphasis mb-4">
            All rows from <strong>{{ copyFromYear }}</strong> will be copied to a new year. You can
            then edit it freely.
          </p>
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="copyFromYear"
                :items="availableYears"
                label="Copy From"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="copyToYear"
                label="Copy To (Year)"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 2027"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="copyYearDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="copying" @click="copyToNewYear">
            Copy Program
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── DELETE DIALOG ── -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-4 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete Row?</h3>
          <p class="text-medium-emphasis">
            Delete <strong>{{ selectedRow?.component }}</strong
            >? This cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteRow">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── PRINT AREA (hidden) ── -->
    <div id="print-area" style="display: none">
      <div id="print-content"></div>
    </div>

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

// ── DATA ──
const rows = ref([])
const signatories = ref(null)
const loading = ref(false)
const saving = ref(false)
const savingSig = ref(false)
const deleting = ref(false)
const copying = ref(false)
const selectedYear = ref(new Date().getFullYear())
const availableYears = ref([2026])

// ── DIALOGS ──
const formDialog = ref(false)
const deleteDialog = ref(false)
const copyYearDialog = ref(false)
const signatoryDialog = ref(false)
const isEditing = ref(false)
const selectedRow = ref(null)
const copyFromYear = ref(selectedYear.value)
const copyToYear = ref(selectedYear.value + 1)

// ── FORM ──
const defaultForm = {
  description: '',
  component: '',
  task: '',
  freq_daily: false,
  freq_weekly: false,
  freq_monthly: false,
  freq_quarterly: false,
  freq_biannual: false,
  freq_annual: false,
  responsible: '',
  remarks: '',
}
const form = ref({ ...defaultForm })
const errors = ref({})

const sigForm = ref({
  prepared_by_name: '',
  prepared_by_title: '',
  reviewed_by_name: '',
  reviewed_by_title: '',
  approved_by_name: '',
  approved_by_title: '',
})

const responsibleOptions = [
  'Mechanic',
  'Assigned driver',
  'Mechanic/ Assigned driver',
  'Supervisor & Mechanic',
  'Car Aircon Technician (outsource)',
  'Mechanic/ outsource',
]

const objectives = [
  {
    title: 'Ensure Vehicle Safety',
    points: [
      'Prevent failures that could result in accidents or hazardous conditions.',
      'Maintain critical systems such as brakes, tires, steering, and lights in optimal working order.',
      'Comply with road safety regulations and inspection standards.',
    ],
  },
  {
    title: 'Enhance Vehicle Reliability and Performance',
    points: [
      'Reduce the risk of unexpected breakdowns or stalls.',
      'Ensure the vehicle operates efficiently and starts reliably.',
      'Maintain optimal engine, transmission, and suspension performance.',
    ],
  },
  {
    title: 'Minimize Operating Costs',
    points: [
      'Avoid costly emergency repairs by addressing issues early.',
      'Improve fuel efficiency through regular maintenance (e.g., oil changes, air filter replacement).',
      'Reduce downtime that could affect productivity or transport schedules.',
    ],
  },
]

// ── SNACKBAR ──
const snackbar = ref({ show: false, message: '', color: 'success' })

// ── COMPUTED ──
const uniqueDescriptions = computed(() => [
  ...new Set(rows.value.map((r) => r.description).filter(Boolean)),
])
const dailyCount = computed(() => rows.value.filter((r) => r.freq_daily).length)
const groupedRows = computed(() => {
  const groups = []
  const seen = new Map()
  rows.value.forEach((row) => {
    const key = row.description || ''
    if (!seen.has(key)) {
      seen.set(key, { description: key, items: [] })
      groups.push(seen.get(key))
    }
    seen.get(key).items.push(row)
  })
  return groups
})

// ── METHODS ──
async function fetchAvailableYears() {
  const { data } = await supabase.from('annual_pm_program').select('year').order('year')
  if (data) {
    const years = [...new Set(data.map((r) => r.year))]
    availableYears.value = years.length > 0 ? years : [new Date().getFullYear()]
    if (!availableYears.value.includes(selectedYear.value)) {
      selectedYear.value = availableYears.value[availableYears.value.length - 1]
    }
  }
}

async function fetchProgram() {
  loading.value = true
  const { data, error } = await supabase
    .from('annual_pm_program')
    .select('*')
    .eq('year', selectedYear.value)
    .order('sort_order', { ascending: true })
  if (error) showSnackbar('Failed to load program', 'error')
  else rows.value = data
  loading.value = false
}

async function fetchSignatories() {
  const { data } = await supabase.from('pm_signatories').select('*').limit(1).single()
  if (data) signatories.value = data
}

function openAddDialog() {
  isEditing.value = false
  form.value = { ...defaultForm }
  errors.value = {}
  formDialog.value = true
}

function openEditDialog(row) {
  isEditing.value = true
  selectedRow.value = row
  form.value = { ...row }
  errors.value = {}
  formDialog.value = true
}

function openDeleteDialog(row) {
  selectedRow.value = row
  deleteDialog.value = true
}

function openCopyYearDialog() {
  copyFromYear.value = selectedYear.value
  copyToYear.value = selectedYear.value + 1
  copyYearDialog.value = true
}

function openSignatoryDialog() {
  sigForm.value = { ...signatories.value }
  signatoryDialog.value = true
}

function closeFormDialog() {
  formDialog.value = false
  form.value = { ...defaultForm }
  errors.value = {}
}

function validateForm() {
  errors.value = {}
  if (!form.value.description?.trim()) errors.value.description = 'Description is required'
  if (!form.value.component?.trim()) errors.value.component = 'Component is required'
  return Object.keys(errors.value).length === 0
}

async function saveRow() {
  if (!validateForm()) return
  saving.value = true
  const payload = {
    year: selectedYear.value,
    description: form.value.description,
    component: form.value.component,
    task: form.value.task,
    freq_daily: form.value.freq_daily || false,
    freq_weekly: form.value.freq_weekly || false,
    freq_monthly: form.value.freq_monthly || false,
    freq_quarterly: form.value.freq_quarterly || false,
    freq_biannual: form.value.freq_biannual || false,
    freq_annual: form.value.freq_annual || false,
    responsible: form.value.responsible,
    remarks: form.value.remarks,
    sort_order: form.value.sort_order || rows.value.length + 1,
  }
  if (isEditing.value) {
    const { error } = await supabase
      .from('annual_pm_program')
      .update(payload)
      .eq('id', form.value.id)
    if (error) showSnackbar('Failed to update row', 'error')
    else {
      showSnackbar('Row updated', 'success')
      closeFormDialog()
      await fetchProgram()
    }
  } else {
    const { error } = await supabase.from('annual_pm_program').insert(payload)
    if (error) showSnackbar('Failed to add row', 'error')
    else {
      showSnackbar('Row added', 'success')
      closeFormDialog()
      await fetchProgram()
    }
  }
  saving.value = false
}

async function deleteRow() {
  deleting.value = true
  const { error } = await supabase.from('annual_pm_program').delete().eq('id', selectedRow.value.id)
  if (error) showSnackbar('Failed to delete row', 'error')
  else {
    showSnackbar('Row deleted', 'success')
    deleteDialog.value = false
    await fetchProgram()
  }
  deleting.value = false
}

async function saveSignatories() {
  savingSig.value = true
  const { error } = await supabase
    .from('pm_signatories')
    .update({
      prepared_by_name: sigForm.value.prepared_by_name,
      prepared_by_title: sigForm.value.prepared_by_title,
      reviewed_by_name: sigForm.value.reviewed_by_name,
      reviewed_by_title: sigForm.value.reviewed_by_title,
      approved_by_name: sigForm.value.approved_by_name,
      approved_by_title: sigForm.value.approved_by_title,
      updated_at: new Date().toISOString(),
    })
    .eq('id', signatories.value.id)
  if (error) showSnackbar('Failed to save signatories', 'error')
  else {
    showSnackbar('Signatories updated', 'success')
    signatoryDialog.value = false
    await fetchSignatories()
  }
  savingSig.value = false
}

async function copyToNewYear() {
  if (!copyToYear.value) return
  copying.value = true
  const { data, error } = await supabase
    .from('annual_pm_program')
    .select('*')
    .eq('year', copyFromYear.value)
    .order('sort_order')
  if (error || !data || data.length === 0) {
    showSnackbar('No data found for selected year', 'error')
    copying.value = false
    return
  }
  const { data: existing } = await supabase
    .from('annual_pm_program')
    .select('id')
    .eq('year', copyToYear.value)
    .limit(1)
  if (existing && existing.length > 0) {
    showSnackbar(`Year ${copyToYear.value} already exists`, 'error')
    copying.value = false
    return
  }


  const newRows = data.map((row) => {
  // eslint-disable-next-line no-unused-vars
  const { id, created_at, ...rest } = row
  return { ...rest, year: Number(copyToYear.value) }
})
  const { error: insertError } = await supabase.from('annual_pm_program').insert(newRows)
  if (insertError) showSnackbar('Failed to copy program', 'error')
  else {
    showSnackbar(`Program copied to ${copyToYear.value}`, 'success')
    await fetchAvailableYears()
    selectedYear.value = Number(copyToYear.value)
    await fetchProgram()
    copyYearDialog.value = false
  }
  copying.value = false
}

// ── PRINT ──
function printProgram() {
  const sig = signatories.value

  let tbodyHtml = ''
  groupedRows.value.forEach((group) => {
    group.items.forEach((row, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#fafafa'
      const freqCell = (active) =>
        `<td style="border:1px solid #ccc;padding:3px;text-align:center;
          background:${active ? '#FFF59D' : '#fff'};width:55px;"></td>`

      tbodyHtml += `
        <tr style="background:${bg}">
          ${
            idx === 0
              ? `<td rowspan="${group.items.length}"
                style="border:1px solid #ccc;padding:5px 7px;
                vertical-align:middle;font-weight:bold;
                font-size:10px;color:#1B5E20;
                background:#E8F5E9;text-align:center;
                width:110px">
                ${group.description}
              </td>`
              : ''
          }
          <td style="border:1px solid #ccc;padding:4px 6px;font-size:10px;
            width:110px;text-align:center">${row.component || ''}</td>
          <td style="border:1px solid #ccc;padding:4px 6px;font-size:10px">
            ${row.task || ''}</td>
          ${freqCell(row.freq_daily)}
          ${freqCell(row.freq_weekly)}
          ${freqCell(row.freq_monthly)}
          ${freqCell(row.freq_quarterly)}
          ${freqCell(row.freq_biannual)}
          ${freqCell(row.freq_annual)}
          <td style="border:1px solid #ccc;padding:4px 6px;font-size:10px;
            width:100px;text-align:center">${row.responsible || ''}</td>
          <td style="border:1px solid #ccc;padding:4px 6px;font-size:10px;
            width:120px">${row.remarks || ''}</td>
        </tr>`
    })
  })

  const printHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        body { font-family: Arial, sans-serif; margin:0; padding:0; }
        .header-banner { width:100%; max-height:70px; object-fit:contain; }
        .title-section { text-align:center; margin: 8px 0 6px; }
        .title-main { font-size:14px; font-weight:bold; text-transform:uppercase; margin:0; }
        .title-sub { font-size:12px; font-weight:bold; margin:2px 0 0; }
        .objectives { font-size:9px; margin-bottom:8px; }
        .objectives b { font-style:italic; }
        table { width:100%; border-collapse:collapse; }
        th { background:#1B5E20; color:white; padding:4px 5px;
             font-size:9px; border:1px solid #aaa; text-align:center; }
        .sig-table td { text-align:center; padding:0 10px; font-size:10px; }
        .sig-line { border-top: 1px solid #333; margin:20px auto 4px; width:80%; }
        .sig-name { font-weight:bold; margin:0; }
        .sig-title { margin:0; color:#555; }
        hr { border:none; border-top:2px solid #1B5E20; margin:6px 0; }
      </style>
    </head>
    <body>
      <img src="/images/header_banner.png" class="header-banner" />
      <hr/>
      <div class="title-section">
        <p class="title-main">Annual Preventive Maintenance Program</p>
        <p class="title-sub">For Transportation Services — ${selectedYear.value}</p>
      </div>

      <div class="objectives">
        <b>OBJECTIVE:</b>&nbsp;&nbsp;
        <b>Ensure Vehicle Safety</b> — Prevent failures that could result in accidents.
        Maintain critical systems in optimal working order. Comply with road safety regulations.<br/>
        <b>Enhance Vehicle Reliability</b> — Reduce risk of unexpected breakdowns.
        Ensure efficient operation. Maintain optimal engine, transmission, and suspension performance.<br/>
        <b>Minimize Operating Costs</b> — Avoid costly emergency repairs.
        Improve fuel efficiency. Reduce downtime affecting transport schedules.
      </div>

      <table>
        <thead>
          <tr>
            <th rowspan="2" style="width:110px">DESCRIPTION</th>
            <th rowspan="2" style="width:110px">COMPONENTS</th>
            <th rowspan="2">TASK</th>
            <th colspan="6">FREQUENCY</th>
            <th rowspan="2" style="width:100px">RESPONSIBLE</th>
            <th rowspan="2" style="width:120px">REMARKS</th>
          </tr>
          <tr>
            <th style="width:50px">DAILY</th>
            <th style="width:55px">WEEKLY</th>
            <th style="width:60px">MONTHLY</th>
            <th style="width:65px">QUARTERLY</th>
            <th style="width:65px">BI-ANNUAL</th>
            <th style="width:55px">ANNUAL</th>
          </tr>
        </thead>
        <tbody>${tbodyHtml}</tbody>
      </table>

      <br/>
      <table class="sig-table" style="width:100%">
        <tr>
          <td>
            <div>Prepared By:</div>
            <div class="sig-line"></div>
            <p class="sig-name">${sig?.prepared_by_name || ''}</p>
            <p class="sig-title">${sig?.prepared_by_title || ''}</p>
          </td>
          <td>
            <div>Reviewed By:</div>
            <div class="sig-line"></div>
            <p class="sig-name">${sig?.reviewed_by_name || ''}</p>
            <p class="sig-title">${sig?.reviewed_by_title || ''}</p>
          </td>
          <td>
            <div>Approved By:</div>
            <div class="sig-line"></div>
            <p class="sig-name">${sig?.approved_by_name || ''}</p>
            <p class="sig-title">${sig?.approved_by_title || ''}</p>
          </td>
        </tr>
      </table>
    </body>
    </html>`

  const win = window.open('', '_blank')
  win.document.write(printHtml)
  win.document.close()
  win.onload = () => {
    win.print()
  }
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

onMounted(async () => {
  await fetchAvailableYears()
  await fetchProgram()
  await fetchSignatories()
})
</script>

<style scoped>
/* ── Document Card ── */
.document-card {
  border: 1px solid #e0e0e0;
  background: #fff;
}

/* ── Header ── */
.doc-header {
  background: linear-gradient(180deg, #f1f8e9 0%, #ffffff 100%);
  border-bottom: 2px solid #c8e6c9;
}
.header-banner {
  height: 64px;
  object-fit: contain;
  object-position: left center;
  max-width: 55%;
}
.logo-bagong {
  height: 44px;
  object-fit: contain;
}
.logo-socotec {
  height: 38px;
  object-fit: contain;
}
.doc-title {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #1b5e20;
  margin: 0;
  text-transform: uppercase;
}
.doc-subtitle {
  font-size: 13px;
  font-weight: 600;
  color: #2e7d32;
  margin: 2px 0 0;
  text-transform: uppercase;
}

/* ── Objectives Panel ── */
.objectives-panel {
  border: 1px solid #c8e6c9 !important;
  border-radius: 8px !important;
}
.objectives-title {
  min-height: 40px !important;
  padding: 0 16px !important;
  background: #f9fbe7 !important;
}
.objectives-content {
  padding: 4px 8px;
}
.objectives-list {
  margin: 0;
  padding-left: 20px;
  line-height: 1.7;
}

/* ── Table wrapper ── */
.table-wrapper {
  overflow-x: auto;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
}

/* ── PM Table ── */
.pm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  table-layout: fixed;
}

/* Header rows */
.pm-table thead tr:first-child th {
  background: #1b5e20;
  color: #fff;
  padding: 8px 6px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  border: 1px solid #145214;
}
.th-freq {
  background: #2e7d32 !important;
}
.pm-table thead tr:nth-child(2) th {
  background: #388e3c;
  color: #fff;
  padding: 5px 4px;
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid #2e7d32;
}

/* Column widths */
.th-desc {
  width: 130px;
}
.th-comp {
  width: 130px;
}
.th-task {
  min-width: 200px;
}
.th-freq {
  width: 290px;
}
.th-freq-sub {
  width: 48px;
}
.th-resp {
  width: 140px;
}
.th-rem {
  width: 160px;
}
.th-act {
  width: 72px;
}

/* Body rows */
.pm-row td {
  border: 1px solid #e8f5e9;
  padding: 6px 7px;
  vertical-align: middle;
  line-height: 1.4;
}
.pm-row:hover td {
  background: #f1f8e9 !important;
}
.row-even {
  background: #ffffff;
}
.row-odd {
  background: #fafafa;
}

/* Description cell */
.td-desc {
  background: #e8f5e9 !important;
  font-weight: 700;
  font-size: 11px;
  color: #1b5e20;
  text-align: center;
  vertical-align: middle !important;
  border-right: 2px solid #a5d6a7 !important;
  border-left: 3px solid #2e7d32 !important;
}
.desc-text {
  display: block;
  line-height: 1.5;
}

.td-comp {
  text-align: center;
  font-size: 11px;
}
.td-task {
  font-size: 11px;
}
.td-resp {
  text-align: center;
  font-size: 11px;
}
.td-rem {
  font-size: 11px;
  color: #555;
}
.td-act {
  text-align: center;
  white-space: nowrap;
}

/* Frequency cells */
.td-freq {
  text-align: center;
  width: 48px;
  min-width: 48px;
  padding: 0 !important;
  height: 32px;
}
.freq-active {
  background: #fff59d !important; /* Yellow — exactly like PDF */
}
.pm-row:hover .freq-active {
  background: #fff176 !important;
}

/* ── Signatories ── */
.signatories-section {
  background: #fafafa;
  border-top: 1px solid #e8f5e9;
}
.sig-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 20px;
}
.sig-line {
  border-top: 1px solid #333;
  width: 70%;
  margin: 0 auto 6px;
}
.sig-name {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 2px;
}
.sig-title {
  font-size: 11px;
  color: #666;
  margin: 0;
}
</style>
