<template>
  <v-container fluid>

    <!-- ── Page Header ── -->
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
            <v-select v-model="selectedYear" :items="availableYears" label="Year"
              variant="outlined" density="compact" hide-details style="min-width:110px"
              @update:modelValue="fetchProgram" />
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">Add Row</v-btn>
            <v-btn color="success" variant="outlined" prepend-icon="mdi-pencil" @click="openSignatoryDialog">Edit Signatories</v-btn>
            <v-btn color="teal" variant="outlined" prepend-icon="mdi-printer" @click="printProgram">Print / PDF</v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- ── Summary Cards ── -->
    <v-row class="mb-4">
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="44"><v-icon>mdi-format-list-bulleted</v-icon></v-avatar>
            <div><p class="text-medium-emphasis text-body-2">Total Tasks</p><p class="text-h5 font-weight-bold">{{ rows.length }}</p></div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="green-darken-2" variant="tonal" size="44"><v-icon>mdi-tag-multiple</v-icon></v-avatar>
            <div><p class="text-medium-emphasis text-body-2">Categories</p><p class="text-h5 font-weight-bold">{{ uniqueDescriptions.length }}</p></div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="orange-darken-2" variant="tonal" size="44"><v-icon>mdi-calendar-today</v-icon></v-avatar>
            <div><p class="text-medium-emphasis text-body-2">Daily Tasks</p><p class="text-h5 font-weight-bold">{{ dailyCount }}</p></div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="info" variant="tonal" size="44"><v-icon>mdi-calendar-star</v-icon></v-avatar>
            <div><p class="text-medium-emphasis text-body-2">Program Year</p><p class="text-h5 font-weight-bold">{{ selectedYear }}</p></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Loading / Empty State ── -->
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-card v-if="!loading && rows.length === 0" rounded="lg" elevation="0" border class="mb-6">
      <v-card-text class="text-center pa-12">
        <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-clipboard-text-off</v-icon>
        <p class="text-h6 text-medium-emphasis">No program found for {{ selectedYear }}.</p>
        <v-btn color="primary" class="mt-3" prepend-icon="mdi-plus" @click="openAddDialog">Add First Row</v-btn>
      </v-card-text>
    </v-card>

    <!-- ── Objectives Section ── -->
    <v-card v-if="rows.length > 0" rounded="lg" elevation="0" border class="mb-4">
      <v-card-text class="pa-4">
        <div class="text-subtitle-2 font-weight-bold mb-2">OBJECTIVE:</div>
        <v-row  density="comfortable">
          <v-col v-for="(obj, i) in objectives" :key="i" cols="12" md="4">
            <div class="obj-group">
              <div class="obj-title">{{ obj.title }}</div>
              <ul class="obj-list">
                <li v-for="(pt, j) in obj.points" :key="j">{{ pt }}</li>
              </ul>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ── Screen Table ── -->
    <v-card v-if="rows.length > 0" rounded="lg" elevation="0" border class="mb-6">
      <v-card-title class="pa-4 pb-2 d-flex align-center justify-space-between">
        <span class="text-subtitle-1 font-weight-bold">{{ selectedYear }} Maintenance Program</span>
        <v-chip color="primary" variant="tonal" size="small">{{ rows.length }} tasks</v-chip>
      </v-card-title>
      <div class="screen-table-wrap">
        <table class="screen-table">
          <thead>
            <tr>
              <th class="s-desc">Description</th>
              <th class="s-comp">Components</th>
              <th class="s-task">Task</th>
              <th class="s-freq" title="Daily">D</th>
              <th class="s-freq" title="Weekly">W</th>
              <th class="s-freq" title="Monthly">M</th>
              <th class="s-freq" title="Quarterly">Q</th>
              <th class="s-freq" title="Bi-Annual">BA</th>
              <th class="s-freq" title="Annual">A</th>
              <th class="s-resp">Responsible</th>
              <th class="s-rem">Remarks</th>
              <th class="s-act">Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(group, gi) in groupedRows" :key="gi">
              <tr v-for="(row, ri) in group.items" :key="row.id">
                <td v-if="ri === 0" :rowspan="group.items.length" class="desc-cell">
                  {{ group.description }}
                </td>
                <td class="comp-cell">{{ row.component }}</td>
                <td class="task-cell">{{ row.task }}</td>
                <td class="freq-cell"><v-icon v-if="row.freq_daily" size="14" color="success">mdi-check-bold</v-icon></td>
                <td class="freq-cell"><v-icon v-if="row.freq_weekly" size="14" color="success">mdi-check-bold</v-icon></td>
                <td class="freq-cell"><v-icon v-if="row.freq_monthly" size="14" color="success">mdi-check-bold</v-icon></td>
                <td class="freq-cell"><v-icon v-if="row.freq_quarterly" size="14" color="success">mdi-check-bold</v-icon></td>
                <td class="freq-cell"><v-icon v-if="row.freq_biannual" size="14" color="success">mdi-check-bold</v-icon></td>
                <td class="freq-cell"><v-icon v-if="row.freq_annual" size="14" color="success">mdi-check-bold</v-icon></td>
                <td class="resp-cell">{{ row.responsible }}</td>
                <td class="rem-cell">{{ row.remarks }}</td>
                <td class="act-cell">
                  <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary" @click="openEditDialog(row)" />
                  <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="openDeleteDialog(row)" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Signatories display -->
      <div v-if="signatories" class="signatories-section pa-6">
        <v-row>
          <v-col cols="12" md="4" class="text-center">
            <p class="sig-label">Prepared by:</p>
            <div class="sig-line"></div>
            <p class="sig-name">{{ signatories.prepared_by_name }}</p>
            <p class="sig-title">{{ signatories.prepared_by_title }}</p>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <p class="sig-label">Reviewed by:</p>
            <div class="sig-line"></div>
            <p class="sig-name">{{ signatories.reviewed_by_name }}</p>
            <p class="sig-title">{{ signatories.reviewed_by_title }}</p>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <p class="sig-label">Approved by:</p>
            <div class="sig-line"></div>
            <p class="sig-name">{{ signatories.approved_by_name }}</p>
            <p class="sig-title">{{ signatories.approved_by_title }}</p>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- ══════════════ ADD / EDIT DIALOG ══════════════ -->
    <v-dialog v-model="formDialog" max-width="680" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">{{ isEditing ? 'Edit Row' : 'Add Row' }}</v-card-title>
        <v-card-text class="pa-4">
          <v-row  density="comfortable">
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.description" label="Description *" variant="outlined"
                density="comfortable" :error-messages="errors.description" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.component" label="Component *" variant="outlined"
                density="comfortable" :error-messages="errors.component" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.task" label="Task" variant="outlined" density="comfortable" rows="2" />
            </v-col>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Frequency</div>
              <div class="d-flex flex-wrap ga-3">
                <v-checkbox v-model="form.freq_daily" label="Daily" density="compact" hide-details />
                <v-checkbox v-model="form.freq_weekly" label="Weekly" density="compact" hide-details />
                <v-checkbox v-model="form.freq_monthly" label="Monthly" density="compact" hide-details />
                <v-checkbox v-model="form.freq_quarterly" label="Quarterly" density="compact" hide-details />
                <v-checkbox v-model="form.freq_biannual" label="Bi-Annual" density="compact" hide-details />
                <v-checkbox v-model="form.freq_annual" label="Annual" density="compact" hide-details />
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <v-combobox v-model="form.responsible" :items="responsibleOptions" label="Responsible"
                variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.remarks" label="Remarks" variant="outlined" density="comfortable" />
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

    <!-- ══════════════ SIGNATORIES DIALOG ══════════════ -->
    <v-dialog v-model="signatoryDialog" max-width="600" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">Edit Signatories</v-card-title>
        <v-card-text class="pa-4">
          <v-row  density="comfortable">
            <v-col cols="12"><div class="text-subtitle-2 mb-1">Prepared By</div></v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="sigForm.prepared_by_name" label="Name" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="sigForm.prepared_by_title" label="Title" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12"><div class="text-subtitle-2 mb-1">Reviewed By</div></v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="sigForm.reviewed_by_name" label="Name" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="sigForm.reviewed_by_title" label="Title" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12"><div class="text-subtitle-2 mb-1">Approved By</div></v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="sigForm.approved_by_name" label="Name" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="sigForm.approved_by_title" label="Title" variant="outlined" density="comfortable" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="signatoryDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="savingSig" @click="saveSignatories">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════ DELETE DIALOG ══════════════ -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-4 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete Row?</h3>
          <p class="text-medium-emphasis">Are you sure you want to delete <strong>{{ selectedRow?.component }}</strong>? This cannot be undone.</p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 justify-center">
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteRow">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════ SNACKBAR ══════════════ -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="bottom right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

// ── DATA ──
const rows         = ref([])
const signatories  = ref(null)
const loading      = ref(false)
const saving       = ref(false)
const savingSig    = ref(false)
const deleting     = ref(false)
const selectedYear = ref(new Date().getFullYear())
const availableYears = ref([new Date().getFullYear()])

// ── DIALOGS ──
const formDialog      = ref(false)
const deleteDialog    = ref(false)
const signatoryDialog = ref(false)
const isEditing       = ref(false)
const selectedRow     = ref(null)

// ── FORM ──
const defaultForm = {
  description: '', component: '', task: '',
  freq_daily: false, freq_weekly: false, freq_monthly: false,
  freq_quarterly: false, freq_biannual: false, freq_annual: false,
  responsible: '', remarks: '',
}
const form   = ref({ ...defaultForm })
const errors = ref({})

const sigForm = ref({
  prepared_by_name: '', prepared_by_title: '',
  reviewed_by_name: '', reviewed_by_title: '',
  approved_by_name: '', approved_by_title: '',
})

const responsibleOptions = [
  'Mechanic', 'Assigned driver', 'Mechanic/ Assigned driver',
  'Supervisor & Mechanic', 'Car Aircon Technician (outsource)', 'Mechanic/ outsource',
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
function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// ── COMPUTED ──
const uniqueDescriptions = computed(() => [...new Set(rows.value.map(r => r.description).filter(Boolean))])
const dailyCount = computed(() => rows.value.filter(r => r.freq_daily).length)
const groupedRows = computed(() => {
  const groups = []
  const seen = new Map()
  rows.value.forEach(row => {
    const key = row.description || ''
    if (!seen.has(key)) { seen.set(key, { description: key, items: [] }); groups.push(seen.get(key)) }
    seen.get(key).items.push(row)
  })
  return groups
})

// ── DATA FETCH ──
async function fetchAvailableYears() {
  const { data } = await supabase.from('annual_pm_program').select('year').order('year')
  if (data) {
    const years = [...new Set(data.map(r => r.year))]
    availableYears.value = years.length > 0 ? years : [new Date().getFullYear()]
    if (!availableYears.value.includes(selectedYear.value))
      selectedYear.value = availableYears.value[availableYears.value.length - 1]
  }
}

async function fetchProgram() {
  loading.value = true
  const { data, error } = await supabase
    .from('annual_pm_program').select('*')
    .eq('year', selectedYear.value).order('sort_order', { ascending: true })
  if (error) showSnackbar('Failed to load program', 'error')
  else rows.value = data
  loading.value = false
}

async function fetchSignatories() {
  const { data } = await supabase.from('pm_signatories').select('*').limit(1).single()
  if (data) signatories.value = data
}

// ── DIALOGS ──
function openAddDialog() {
  isEditing.value = false; form.value = { ...defaultForm }; errors.value = {}; formDialog.value = true
}
function openEditDialog(row) {
  isEditing.value = true; selectedRow.value = row; form.value = { ...row }; errors.value = {}; formDialog.value = true
}
function openDeleteDialog(row) { selectedRow.value = row; deleteDialog.value = true }
function openSignatoryDialog() { sigForm.value = { ...signatories.value }; signatoryDialog.value = true }
function closeFormDialog() { formDialog.value = false; form.value = { ...defaultForm }; errors.value = {} }

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
    description: form.value.description, component: form.value.component, task: form.value.task,
    freq_daily: form.value.freq_daily || false, freq_weekly: form.value.freq_weekly || false,
    freq_monthly: form.value.freq_monthly || false, freq_quarterly: form.value.freq_quarterly || false,
    freq_biannual: form.value.freq_biannual || false, freq_annual: form.value.freq_annual || false,
    responsible: form.value.responsible, remarks: form.value.remarks,
    sort_order: form.value.sort_order || rows.value.length + 1,
  }
  if (isEditing.value) {
    const { error } = await supabase.from('annual_pm_program').update(payload).eq('id', form.value.id)
    if (error) showSnackbar('Failed to update row', 'error')
    else { showSnackbar('Row updated', 'success'); closeFormDialog(); await fetchProgram() }
  } else {
    const { error } = await supabase.from('annual_pm_program').insert(payload)
    if (error) showSnackbar('Failed to add row', 'error')
    else { showSnackbar('Row added', 'success'); closeFormDialog(); await fetchProgram() }
  }
  saving.value = false
}

async function deleteRow() {
  deleting.value = true
  const { error } = await supabase.from('annual_pm_program').delete().eq('id', selectedRow.value.id)
  if (error) showSnackbar('Failed to delete row', 'error')
  else { showSnackbar('Row deleted', 'success'); deleteDialog.value = false; await fetchProgram() }
  deleting.value = false
}

async function saveSignatories() {
  savingSig.value = true
  const { error } = await supabase.from('pm_signatories').update({
    prepared_by_name: sigForm.value.prepared_by_name, prepared_by_title: sigForm.value.prepared_by_title,
    reviewed_by_name: sigForm.value.reviewed_by_name, reviewed_by_title: sigForm.value.reviewed_by_title,
    approved_by_name: sigForm.value.approved_by_name, approved_by_title: sigForm.value.approved_by_title,
    updated_at: new Date().toISOString(),
  }).eq('id', signatories.value.id)
  if (error) showSnackbar('Failed to save signatories', 'error')
  else { showSnackbar('Signatories updated', 'success'); signatoryDialog.value = false; await fetchSignatories() }
  savingSig.value = false
}

// ── PRINT ── (exact Excel layout: landscape A4, green header row, frequency checkmarks)
function printProgram() {
  const sig = signatories.value

  // Build objectives HTML
  const objHtml = objectives.map(o => `
    <div style="flex:1;min-width:200px;padding:0 8px">
      <b style="font-size:9px">${o.title}</b>
      <ul style="margin:2px 0 0 14px;padding:0;font-size:8.5px;line-height:1.5">
        ${o.points.map(p => `<li>${p}</li>`).join('')}
      </ul>
    </div>`).join('')

  // Build table body — grouped rows with rowspan for description
  let tbodyHtml = ''
  groupedRows.value.forEach(group => {
    group.items.forEach((row, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f9f9f9'
      const chk = (v) => v
        ? `<td style="border:1px solid #ccc;padding:3px;text-align:center;background:#E8F5E9;width:42px"><b style="color:#2e7d32;font-size:11px">✓</b></td>`
        : `<td style="border:1px solid #ccc;padding:3px;text-align:center;width:42px"></td>`

      tbodyHtml += `<tr style="background:${bg}">
        ${idx === 0
          ? `<td rowspan="${group.items.length}" style="border:1px solid #ccc;padding:5px 6px;vertical-align:middle;font-weight:bold;font-size:9px;color:#1B5E20;background:#E8F5E9;text-align:center;width:105px">${group.description}</td>`
          : ''}
        <td style="border:1px solid #ccc;padding:4px 5px;font-size:9px;width:100px">${row.component || ''}</td>
        <td style="border:1px solid #ccc;padding:4px 5px;font-size:9px">${row.task || ''}</td>
        ${chk(row.freq_daily)}${chk(row.freq_weekly)}${chk(row.freq_monthly)}${chk(row.freq_quarterly)}${chk(row.freq_biannual)}${chk(row.freq_annual)}
        <td style="border:1px solid #ccc;padding:4px 5px;font-size:9px;width:95px;text-align:center">${row.responsible || ''}</td>
        <td style="border:1px solid #ccc;padding:4px 5px;font-size:9px;width:110px">${row.remarks || ''}</td>
      </tr>`
    })
  })

  // Signatories
  const sigHtml = sig ? `
    <table style="width:100%;margin-top:32px;border-collapse:collapse">
      <tr>
        <td style="width:33%;text-align:center;padding:0 12px;font-size:10px">
          <div style="margin-bottom:22px">Prepared By:</div>
          <div style="border-top:1px solid #333;padding-top:3px;font-weight:bold">${sig.prepared_by_name || ''}</div>
          <div style="color:#555;font-size:9px">${sig.prepared_by_title || ''}</div>
        </td>
        <td style="width:33%;text-align:center;padding:0 12px;font-size:10px">
          <div style="margin-bottom:22px">Reviewed By:</div>
          <div style="border-top:1px solid #333;padding-top:3px;font-weight:bold">${sig.reviewed_by_name || ''}</div>
          <div style="color:#555;font-size:9px">${sig.reviewed_by_title || ''}</div>
        </td>
        <td style="width:33%;text-align:center;padding:0 12px;font-size:10px">
          <div style="margin-bottom:22px">Approved By:</div>
          <div style="border-top:1px solid #333;padding-top:3px;font-weight:bold">${sig.approved_by_name || ''}</div>
          <div style="color:#555;font-size:9px">${sig.approved_by_title || ''}</div>
        </td>
      </tr>
    </table>` : ''

  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Annual PM Program ${selectedYear.value}</title>
    <style>
      @page { size: A4 landscape; margin: 10mm 12mm; }
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
      * { box-sizing: border-box; }
      .header-wrap { display: flex; align-items: center; justify-content: space-between; border-bottom: 2.5px solid #1B5E20; padding-bottom: 6px; margin-bottom: 6px; }
      .logo-left img { height: 60px; }
      .logo-right img { height: 55px; }
      .header-center { text-align: center; flex: 1; padding: 0 12px; }
      .univ-name { font-size: 11px; font-weight: bold; }
      .office-name { font-size: 10px; }
      .doc-title { font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 4px 0 2px; }
      .doc-sub { font-size: 10px; font-weight: bold; }
      .obj-wrap { display: flex; gap: 8px; margin: 6px 0; background: #f1f8e9; border: 1px solid #c8e6c9; border-radius: 3px; padding: 6px 8px; }
      .obj-label { font-size: 9px; font-weight: bold; margin-bottom: 3px; }
      table.main { width: 100%; border-collapse: collapse; font-size: 9px; }
      table.main th { background: #1B5E20; color: white; padding: 4px 5px; border: 1px solid #ccc; text-align: center; font-size: 9px; }
      table.main td { vertical-align: middle; }
    </style>
  </head><body>

    <div class="header-wrap">
      <div class="logo-left"><img src="${logoCsu}" /></div>
      <div class="header-center">
        <div class="univ-name">CARAGA STATE UNIVERSITY</div>
        <div class="office-name">General Services Office — Transportation Unit</div>
        <div class="doc-title">Annual Preventive Maintenance Program</div>
        <div class="doc-sub">For Transportation Services — ${selectedYear.value}</div>
      </div>
      <div class="logo-right"><img src="${logoRight}" /></div>
    </div>

    <div class="obj-label">OBJECTIVE:</div>
    <div class="obj-wrap">${objHtml}</div>

    <table class="main">
      <thead>
        <tr>
          <th rowspan="2" style="width:105px">DESCRIPTION</th>
          <th rowspan="2" style="width:100px">COMPONENTS</th>
          <th rowspan="2">TASK</th>
          <th colspan="6">FREQUENCY</th>
          <th rowspan="2" style="width:95px">RESPONSIBLE</th>
          <th rowspan="2" style="width:110px">REMARKS</th>
        </tr>
        <tr>
          <th style="width:42px">DAILY</th>
          <th style="width:42px">WEEKLY</th>
          <th style="width:42px">MONTHLY</th>
          <th style="width:42px">QUARTERLY</th>
          <th style="width:42px">BI-ANNUAL</th>
          <th style="width:42px">ANNUAL</th>
        </tr>
      </thead>
      <tbody>${tbodyHtml}</tbody>
    </table>

    ${sigHtml}

  </body></html>`)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}

const logoCsu = 'data:image/png;base64,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'
const logoRight = 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCADWAaEDASIAAhEBAxEB/8QAHQABAAEFAQEBAAAAAAAAAAAAAAYBAwUHCAQCCf/EAFEQAAEDAwEEAgwHDwMEAAcAAAEAAgMEBREGBxIhMRNBCBQWIjZRVGFxlLHRFRcyVnJ0gSM0N0JSYnN1kZKTobKzwiQzVSZDU8E1RGOio+Hw/8QAHAEBAAIDAQEBAAAAAAAAAAAAAAQFAQIDBgcI/8QARBEAAgECAQYICggGAwEBAAAAAAECAwQRBRIhMVGRBhMVQVNhcYEUIjJygqGxwdHSNDVERVSiwvAHIzNSkrJi4fEkQv/aAAwDAQACEQMRAD8A7LREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBEPJUyUBVFQZTKAqiplMoCqKmUygKoqZTKAqiplMoCqKmUygKoqZTKAqiplMoCqKmUygKoqZTKAqiplMoCqKmUygKoqZTKAqiplOOEBVFQKqAIiIAiIgCJlUygKoqZTKAqiplMoCqKmUygKoqZTKAqiplMoCqKmUygKoqZTKAqiplMoCpXycquU8aA11NrjU9Xfrpb7BpaKvit0/QySOqQw59B9BX33TbRvmJB6433qmyrwr1t+sh/kphqi6tsdjqrrJC6ZtO0O6NpALskDAz6Va15UqVRU40k9C286T2nnLWNe4t3cVLiUdMtSjgkm1s2IiPdNtG+YkHrjfendNtG+YkHrjfeso3U9/c0OGi68gjIPbEfvVe6bUHzKuHrEXvWucuijvfzGyWP2mf8AivlMV3TbRvmJB6433p3TbRvmJB6433rK902oPmVcPWIvendNqD5lXD1iL3pnLoo738wwf4mf+K+UxXdNtG+YkHrjfendNtG+YkHrjfesr3Tag+ZVw9Yi96d02oPmVcPWIvemcuijvfzDB/iZ/wCK+UxXdNtG+YkHrjfendNtG+YkHrjfesr3Tag+ZVw9Yi96d02oPmVcPWIvemcuijvfzDB/iZ/4r5TFd020b5iQeuN96d020b5iQeuN96yvdNqD5lXD1iL3p3Tag+ZVw9Yi96Zy6KO9/MMH+Jn/AIr5TFd020f5iQeuN96d020b5iQeuN96yo1LqD5lV/rMXvVaPVda+90VsuGnaq3msLxFJJKxwy1uTwCZy6GO9/MMNWNzPT1L5TE9020b5iQeuN96d020b5iQeuN962A1fQXDwqn0UfzfEmcn1/xEvy/Ka97pto3zEg9cb707pto3zEg9cb71sJFnwqn0UfzfEcn1/wARL8vymve6baN8xIPXG+9O6baN8xIPXG+9bCRPCqfRR/N8RyfX/ES/L8pr3um2jfMSD1xvvTum2jfMSD1xvvWwkTwqn0UfzfEcn1/xEvy/Ka97pto3zEg9cb707pto3zEg9cb71sJE8Kp9FH83xHJ9f8RL8vymve6baN8xIPXG+9O6baN8xIPXG+9bCRPCqfRR/N8RyfX/ABEvy/Ka0uWs9e26gnr63RMEVNAwvleawHdaOZ4KdaduPwtY6K5iMxdswtk3M53cjksXtT/B3ffqb/YruzvwGs31RnsW1bi6luqkYKLxw0Y7Ots523HUb10Z1HNZuOnDXjhzJGfCqg60UAuQiIgCIiAoUQogCIiAIiIAiIgCtVE8dPE+WVwaxgy4+JXVh9Q2o3OKONjxGQ7vn/m+LzqLe1a1KhKdGOdJaltN6ai5JSeCMrFI2RjXsIIcMhfaxun7e63UXQyOD5N45eD8odSyS2tZ1KlGMqsc2TWlbDE0lJpPFBEVFINSqKiqsAIiLICIiA15sq8LNbfrIf5LN7VPAK6fQb/WFhNlXhXrb9ZD/JZvap4A3P6Df6wrK6+lr0fYjz9l9Vy9P/Zkjo+NJD9AexXcK3RfecP0B7FdVc9Ze0/IRTCYVVhdWamtWmbe6suUkhAAIihjMkhBOM7o5NyeLjgDrKwbmZwi1Tdto+pKiumodP2BktZSXPtWoo3u35jCGh3S4BADSDwPnHNfM1ftkkpqo0tronPlI7Se5zY91jZnEmRp5OdGGt4flZ4YQG2AmFq6tue0KydtXA089XSyVEjxFPG14pYd1obkx987DnOJAySGL2aY2n0dTcqex3iCWK4zHdhljgc2OpJfhu613fAlmHkHk3igNi4TCt0tRBVQNnp5o5onfJfG4OafQQrqA+SFFNVj/rfSv6Wf+2pYonqzw30r+ln/ALa7W/ldz9hByh/RXbH2olmFUIUC4k4IiIAsJqnVFp0xA2qvb6imoz8qqFO+SKP6ZaDu+k8POs2vl7GvaWuaHNIwQeRCGGYXTur9L6ihbLYtQWy4tIzinqWvP2gHIWbyfEtIbWexy0lquWW76bcdL37i4T0Y3YpHfnsGMeluFz5ddY7dti14Fsut4qqilY/didV/6qlnA6mvPEHHVnIXeFFVPJenYcJVpU/KWg7zRct7P+y4ttQ6Ok1vYZaBx4GsoSZI/SWHvh9mV0VpLVWntWWxty05eKO50zh8qCQEt8zhzafMQtJ0p0/KR0p1YVF4rM0ioOIVVzOhGtqf4O779Tf7Fd2d+A1m+qM9itbU/wAHd9+pv9iu7O/AazfVGexTfsa873IqvvN+Z+pkgHWiDrRQkWoREQBERAUKIUQBERAUPJR3VNwuFIY4qWPeDjvZbkuAHE/YpF5l8lrXccceSg5QtalzQdOnPMb50dKU1CWLWKPNaaiapoYp5msaZBvAMOQAvWqNaGtwAAPEFXKk0YyhTUZPFrn2mjeLxRVeO419PQRCSpfuNcQB48q5X1cNHTmad+60cPSVCdYPldeCHvJj3AYx1AFUPCPLnJVs6lNYy0aNmPOyVZ23H1FFvBE6geySMPY4Oa4ZBB6lcUQ0rXOpLLVzyuc+KFw3W+IeZSqlnjqKdk8Tt5jxkHxqXkjK1PKFvCpqlJY4eo516DozcdhcXivNRNS0L6iFrHlgyQ7PEebzr2kjkvlwa4YcAQrGvCVSnKMXg2tew5RaTxZgdJ19fVtkjq4w0xnJLshxzxHDxKQr4DWg5AGT1r6yFwsLapbUI0qk3NrnZmpNTlilgVRUByMhVU40CIiA15sq8K9bfrIf5LN7VPAG5/Qb/WFhNlXhXrb9ZD/JZvap4A3P6Df6wrK5+lr0fYigsvquXp/7MklF95w/QHsV1WqL7zh+gPYrF3uNNbLbPX1bw2GFuTkgZOcADPWTgD0quesvKfkLsMXqvV1h03NS093uEdK6rkETXb4zGXcGucM5DSeG9jGeai1k2f182qqm96mu9RX7pdHTMZMeilje3dfvM5Br24DmDhvNyOax2gLPXai1a7Ut7gqC6hMsbXVZ3ZBI5wIa2PdBjYGcHNJIJwRyytpVdRBR0stVUyshghYXve44DQOZWEm9Rs2orFnzQ0VHRRiOkpoogGNZlreJDRgAnmcAY4q+57G/Lc1vpK572g7ZLnX1MtFpdxoqJpLe2iMyyecZ+SP5rWFZdLpWymaruNZUSHm6SdxPtXo7Xg1cVoqVR5uO88fe8MbahNwpRc8OfUjtQEEZBBHmWG1Tpmz6konUtypic727NE4xysLm7pLXjiMjgfGOC5RsmqdR2WVsttvNbAW/imQuYfS05C3hsx2t016Ituo+hoq5rSWTg7sU2B5/ku8y433B+4tY58XnLq17iTk3hXaXk+LmsyXXq3km2b6YuGmGVVDVVRmooGx09tDH4YIGjrYOAkLiS49fDGFMgtKa92qVU1UKPTLzDBE8F1S4cZSDyA6m+dbQ0XfodSaep7pDhrnjdlZ+Q8cwoFxk6vb0o1aiwTJ9ll6zvrmdtRli47ntw7DNqJ6s8N9K/pZ/7aliieq/DfSv6Wf+2o9v5Xc/YS8of0V2x9qJaUCFAuJOCIiAFfJ5qpWK1VfLdpyxVV5uk4hpqZhc4nm49TR4yVhtJYs2p05VJKEFi3oSMdrrUMlpipbbbWtnvVzk6Ghh54P40jvExo4k/YrtVpCy3HSR01fKOK60crMTiobvGR54l+ep2cnI5KNbJrdcbxVVO0HUERjr7m3coKd3/wApS571o8RdzK2MudJuXjvuJl9ThQfg8dLXlPa9nYtXW8WcFdkXsHuGzmSS+2Iy1+l5H8XHjLRE8mv8bfE79q1RpXUd+0rd47tp261NtrGHO/C/Ad5nDk4eYr9RLnRUlyt1Rb6+njqKWojMU0Ugy17SMEEL82NtmjmaD2nXnTUDi6lglElKTz6F43mg+jl9iubWvxqcJ6WebuqHFPPgdZdjr2QdHrueLTWqGw2/UZbiGRhxDW457ufkv/N6+pb+HJflDTTz0lRFVUsz4KiF4kilYcOY4HIIPjBX6V7FdUzaz2XWHUdUAKqqpR2xgc5GktcftIz9qj3dBU3nR1Em0uHVWEtaPdtT/B3ffqb/AGK7s78BrN9UZ7Fa2pfg6vv1N/sV3Z34DWb6oz2LP2Ned7kR/vN+Z+pkgHWiDrRQkWoREQBERAUKIUQBUVVCduWp3aP2U6gv0Tg2oipXR0/6V/et/mc/YulGlKtUjTjrbw3g1RR9kPTHsiKrS1TLE3S5It8NRw72qB4yE/kk979mVvy83SO2QxyyxPe15x3i/K9nSSPLnOcXk7znE8c8858eV2l2OG0sbQ9Ht0heK1jdR2pgMT5HffkIGA76Q5H9q9Nw64M18nZN8JycsZRik+3b3nS3zJTWfqN6WzUNLXzmBjHRyEd6Hn5XmX3br0yor5KCendTzN5BxzvKDVMNRST9HMx0UrTkdX2hZiKf4XiY5rxFdKcZjdy6UDqXwPJ/C29qyVKvoqRerDDOXOuprm2ltWyfSj48PJfqM/q2kNVZpd0ZdH37fsUZv7u2KS3Vg5vh3HekKWWivjuNucZAGPGWTMPDdPWofWyQstrqHpGufT1JLOvLD4l14V8RVou4g9FSPri8V360a5PzozUWtT9pdp3Fmk6gDnLUBqmlviFLb4IuQZGAoPR1NN2jSUkj8btV0kmRwDVJb5cg+iZT2+Rsk1Sdxhac4HWV14NXdvb0JV3JNxhGKXPjrw3tGt7TnKebhrbZ5hdKqsu0z4p+ht9Nxkdj5WOrKwtxvtfUVT3QzvhiJwxjfEvi7VEcFO21Ubh0UZ+6v/8AI/r+xfVttjDB29cX9DSDiB+NJ5gqC+yjfXtTwShUeOLc3joXVjzJetkujQpUo8ZUXUl++dkp0nLLLZY5Jnuke5zuLjnPFaE7J/bLUWytbpHR9cY62CRslfWRu/2yDkRA+P8AK83BZDbptrh0xY5NPaYDGXqcFu83iKOM/jH889Q6ua5MJfNJJLM90kj3F7nuOS5x5k+Mr6FbXeZY0qcJZzSWkucg8H3Xqu6uY4R5lt/6P0G2P6zp9d6Dob9GAyoc3o6uIH/blb8oeg8x6VMFyP2Gmp3W/WVbpmV+Ke5w9NE0nlMznj0t9i64V7a1uNppnm8t5P8AALyVJata7GVREUgqTXmyrwr1t+sh/ks3tU8Abn9Bv9YWE2VeFetv1kP8lm9qngDc/oN/rCsrn6WvR9iKCy+q5en/ALMklF95w/ox7FC9sjzPpZ9upo7VVVrw6pZR3He6KZkXfPzu8scCN7hnCmdH95w/ox7FrPba+A3KzQVQrIIX7zXVMFK+QbriA6N5YQQwjiR1quesvKfkLsJtoaldRaQtcDzl/azHuAcSA5wyQMknAzgcTwWruyW1NNDFSaXpZCxs7enqt082g4a37Tx+xblpGRx00UcLWtjZG0MDRgBoHDA8S5l7IF0h2oVgfyEEIZ6N1XXB+jGterO5sWed4V3M6GT5ZmjOaXcQ+wWmuvt5p7Vboukqah260dTR1k+IBb70/sQ01S0bfhiaqr6ojv3NfuMB8QAUM7GRlO7WFwfJjp2Uf3LPPBdxwuhKozNpZTTMY+cMPRtecAuxwBPiVjl7KlxTuOIpSzUveU/BfItrUtfCa0c5vHuw95oHa1sttOnbNJerPcXRMj4upKh286TzMPMnzLny4XKapeOjLo42nLW9eR1lbo17W6hrNQyN1IHx1MZwyE8GMb+b4x51pG5hjbnVCLAaJXYx6Vb2qrwt4qrPOx/es83Vr2txe1OJpZijowfw5if2Gu7ftUNQ7G/jdf6RzW5Ox6ujo7ncLO5/3OWMTxgn8YcD/L2LRGgiTaps8hNw/YttbDi/4wIA3ODBJn9izlOKq2M87YV+RZu1y5TUNWdh3M6GUT1Z4b6V/Sz/ANtSxRPVfhvpX9LP/bXgbfyu5+w+x5Q/pLtj7US0oEKBcScEXluFRU08W/T0L6t35LHtaf5qKXfWd+oM7uzrUVWOo076d2f/AMmVlLEw2kTKeRkUTpZXtYxgLnOccAAcyVoztmXbJtGbTxl3cbYpQ9/UKuUcvs/9elQzbJtp1BqOJ+irBofUVJWPeWVsTmtdK4AZ3AGE/arGmNsGp9E6bp7HY9it/aIhmWWpY/Msh+U47rP/AOC4SoVK881LxVr0rT1F7bXFDJdtKvJ/z5aIrB+KueXa9S2azq6NrWMaxjQ1rRgAcgFUlce3nsgNudaHMtmz59uB5H4NnlcP28FB77deyR1mHR1VLrB8D+cVLRup4yPF3oHtU+NpJ62keZldRXM2dbbVNsmh9n1DKbndIqu5Bp6K3Urw+Z7uoHHyR5yuAtouq7jrfWly1RdA1lRWyZEbfkxMAw1g9ACmtl7Hra7dpd86XdR75y6WuqWMPpPEuP7FtHRnYh175WTaw1RDFGDl1Nboy5x82+7/ANBS6XE2+nOxZFq8dcaMMEc46L0ve9Y6kpdP6fpH1VbUuAAA72NvW956mjnlfpRs20tS6L0NadMUj+kjoKdsbpP/ACP5ud9pJK82znZ7pLQFsNDpi0xUm+B00576aYjrc88T6OSlYUS4uONejUSre34padZGtqX4O779Tf7Fd2d+A1m+qM9itbUvwd336m/2K7s78BrN9UZ7F0+xrzvciJ95vzP1MkA60QdaKEi1CIiAIiIChRCiALnLs9ru+k2aWq1RuINdcg54B5tjaT7SF0YtJ9lts6qdf6MgdaZ83m0l9TTUm8P9SzHftA/KxghW+QKtKllKjOs8Ip/+Gsk2tBwjK55hYT18SfGvVYLrX2S7012tdS+mrKWQSRSNPIjqPmPiXnd0rGFjmua6Pg5rh8k54ghfUDI5chwLXAZ73rX32dGnXpuE1nRlr7BTeg7n2PbTaPaHpUS1UDZqqmAbXU7T91gd+W3rLD41KKqi6BoraGoEsAIw8HDmHzhcE6N1TetI6ipr5p+qdSVdOeGOLZG9bHj8Zp8S7B0FtOsG0a2xS0MDLdd42Zr6Le4735TPym+xflb+KH8Op5FpTyhbJzpc390Hsx549u8urK4lKahqx3EvqquepldI4hheAJNzgH46yrAAHUqg8EX52rXFStLOqSxZ6CEIw0RQwFWF8sMnSQvLHYxkedUK8l0uNFbKV1TW1EcEQ63HifQOtYpOecuL19RvmZ7zcMcTMWhlMHGR8T6mcHEUAHAnxk+Jar23bWWWgy2izVUVbeiCySVhzBReYdTn+xRraBtIuNa2WhskktvpHAtkmacSyNPVn8ULTdWziXYwc9fWvouRLNK2Ua0dOzm7XtfqR6rJHA+U5+FXb0c0fj1dR4Kh0s9RJUVMr5ppXFz3vOXOceslW2HHDGCP5q68dX7FI9m+iLprm+igoHNp6WAdJXV0nCOliHNzjyzjkF6ulFzebEvb10rWDqVNEUSnsb7BcbhtBpNQxVDaK12aUTVlZLwYM8BGCfxnZwu5RyXDGvdaWsz2nQehQ6HTFurIzJMPl3GcPGZXHrbnku5KYk08RPMsGf2L0FhmxThHm1nyjhS61apTr1FhnJ4LnSWrHtLiIinnlDXmyrwr1t+sh/ks3tU8Abn9Bv8AWFhNlXhXrb9ZD/JZvap4A3P6Df6wrK5+lr0fYjz9l9Vy9P8A2ZJKL7zh+gPYte7cWx0tttt5qpoY6Kjmeyo3qJtS877e93GuIaCCOZK2FRfecP0B7F5NQW74Vs1TQCUQvlZiOUsD+jfza7B4HBwVXPWXtPyF2FjR90gvOmLfc6Z+/HPA1wOR4uvHDPmC092TWnpW1dFqWCMuiLe1qkj8U5y0nzcwpZsnrKulvVbY5Z7hcZHh9TXVFXEY309QHBm4Rjd3XgBzd0nkSean95ttHd7bPbq+Bs1LOwskYesKZk+8dncRqrv7CBlbJ6yhayoc71dpyDpG/wBdprUFNeKAjpIjhzDykYebSujNP7WdG3SjbJPchbZ8d/DUggg+Y8iFqDaDsrvmnKiSotsMtztmSWvjbmSIeJzRzx4wtePBY4tkBa4cw4YIXtbizssrxVWMtPVr7GfN7XKGUcgylRlDRsertRurbTr7SV5tDrdao/hGv5R1jWlrafxkE8XHzclzVcKKelmO/l7XHvXAc/8A9qZUFFWXCobT0NLPVSuOGshYXE/sW6NmWxziLnrGBjst+5UGc7p/KeR1+YLWorTJVvmuWne33G9CV9lm7dSMFp1vDBLvNQaaozQ2eGJ4xI7v3jxE9S3B2PdudNfa65ub9zp4eiafznHPsCx+vdm1zs9X09njlr6GV4axrRl8RJ4A+Medbd2eadbprTMFAcGod90qHDreef7OX2KDlXKdGVlhSeOdo+Jng9kC7jlh1LmOChi+p46sCRqJ6s8N9K/pZ/7aliierOGt9K/pZ/7a8nb+V3P2H0jKH9FdsfaiWFVCwt6vtPa7zaLfO3/4pK+GN+eT2t3gPt4rMeZcE8dRYShKKTa0PUfR5LV23faMzR9mNttsrXXusYej6+12HgZD5/EPGpJtQ1pQaI06+41JbLVSZZSU+eMr/cOZK0fsZ0ncNoesqjWeqC6oo4ZukO+O9nlHJg/MaoV1XeKo0/KfqPU5AyVS4uWUr5fyafN/fLmivf8A+k97HXQUlltj9U3pj3Xe4t3oxLxdFGeOTn8Z3Mqb7Rtb2XQtpp667yuL6upjpKSnjI6SeV7g0BoPizknqAWV1Febdp2x1N4us7aeipY957sZPma0dbicAAcyVxbtuump732QmkhqQOphJPST0lsz95RPlG613jkIALj1Hh1KdaW0YrMWpHncsZVq31eVzV1yermS5kuw7jcXNaSASQOXjWob7t/03ZNaDR1w09qNt8MjImUrKeN5eX/J3SH4OVt8lrQS44A4kriLQmoLFqLstbvrXUd3orfarbNPURy1UwY09GOjiAzzPM4C7Uaali3zFfWqOOCXOdF2/bno2TWjNH3iG7aevT3tjZBc6Xo2uc75I3gSOPUeRW0wuN9W6X1Ft327waisFqqqTSdM6GJl3njMbJoonbxezPFxcc4x5srsaJoY0NGcAAZKxVhGOGGszSnKWOOo+0RFyOxGtqf4O779Tf7Fd2d+A1m+qM9itbU/wd336m/2K7s78BrN9UZ7FN+xrzvciq+835n6mSAdaIOtFCRahERAEREBQohRAUWkuy5uN50zpiwa3sEro62y3RpJ/FfHI0tcxw62nAC3coltf0u3WWze+adIBkqqV3QEjlK3vmH9oCl5PrU6N1CdVYxx09nP6hhico7VdHWvabpN21rZzTgVJb/1BZ4xl8UgGXSNaP2nxjj41oSgwJCXDIx48Ka7Ltaah2a6sbcraTljugr6KT5E7QcOY4dRBzg9S9W1q7aL1Nf333SNkrbJPU5dWUkpaYXP/KZjkT1jkvpmRuFVjaV1ZSrZ1N+TLnX/ABl7mWnIl6lnKm2uogRY0yEMdxzycvZa6yts1whuFDVS0lZC7eikidhzT7vMvA/O/lwwc8VfqeMgI8S+kTpU7inxc0pRktKelNEGOMXgdK7K9t9vvLYbVqwx2+4nDGVY4QTn878h38ltmtu1vo4w+orIWgjIw4EuHmxzXBzcD5bcg9R5KUWDWN2sLmxRyds0uB9xlcXbo8x6l+c+G/8AAe3uqsrvIrzG9LpvU/NfN2F9k/KEM5RuH4u1HT181zuMdHbYO+/8kv8A6C11fq6suErp6yokmceILjy9A6lgrTrizXVrWul7TqT/ANuY4H2O5Fe6rmDm7zTnPEEcl8QuODV5kWq6V1RcJda1959WyHSsWlO2ab28/wD0Ye4taWkE5JUXrPluDskgqTSNmq6hlLTQyTzSHEccbS5zj6Ap9Z9ldr0/b26p2rXBtsoGjeitkbv9RUnqBA5Z8QV1k62qVNWrbzHor/K9tk+l/NljJ6orS32L9ogOzTZxd9bVMlRvtttjpe+rbnP3scTRzDSebsLJ7SteWqGyHZ/s4idR6biP+rrOUtxeObnHnue1ebavtRr9VUrLBZaRtj0vT97Bb4O93wORkI5+jktf0kE9RNFR0kL5qiZwZHHG3LnuPIADmrtVI01mUtL2/A8lUtq95U8JvlmpaYw5l1y2v1Iy+zu1OumubHbmtDnVFfC3DRyAcCf5BfoyAAAByC0d2OOySl0cz4Yv/QzankiDuhBDu0Y3ch9I9ZW8RyVzY0HSh42tnzXhPlSnfXKVLyY6MdpVERTjzRrzZV4V62/WQ/yWb2qeANz+g3+sLCbKvCvW36yH+Sze1TwBuf0G/wBYVlc/S16PsRQWX1XL0/8AZkkovvOH6A9iunkrVF95w/QHsV08lXPWXlPyF2Fiqqaajp3VFXURU8LeLpJXhjR6SeCtx3GglojXRV1K+kAyZ2zNMYA697OFpfsuKay1li09Feb/APBIiuBnjFTQS1NBUFrfkVIj4hvHh51qF9UbpsroHu0g236IodVg342KKYQXKm3B92Yx3f8ARh2ARyWDc7Gt9fQXKn7Yt9bTVkOcdJBK2RufFkZCx0sGlblcJKWWKz1daz5cREb5G+kc1zPpqIVuq9dVmwairaPT79MPiBjjfFTy3H8Qwh/44bnJHWvrZn8WcukWUGiLXWQbVhZalomqqacVLKvojvmR7huhxdndJWYycdKZrKnGawksTpu2T6dhq5bdbJrWypj/ANynp3xiRvpaOIX22/2F0nRtvdsLy7dDRVMznljGea42tEWkKix6Htuz+z3en2qQXKA3KV0ErZo8O/1JqHu4FhGea2VbdmuiW9lhV23uWohQRafZcI4wx3RtqunGZBx+UjbbxZlRUVgkdAyXuyMqe1pLxb2Th24YnVLA7e8WM5z5ldq7lbaOeKnrLhSU80v+3HLM1rn+gE5K410zJpODbvqSTVTdPAO1VI5ra+3VEtU8b3emGRneNG9jn1qQW52zql1/q2Pbjaq6r1RNei63PqKeaVj6TI6EU+5wwOvCwZwOtQcqKas8NtLfpJ/7alFPudAzohiPdG6MY4Y4KL6s8N9K/pZ/7a7W/ldz9hByh/RXavaiJ9kpUT23T9iv9Pnftl3im4eg5H7MhTO+a0sVn0azVFZVN7UlhbJC1py6VzhkNaOsrx7ZbDLqTZ1dbbTs36gR9NC3xvYd4D7cEfauS9PW6/6ruNHp63mpq5IyWxRPcTHTDPfEjk0DrVLc1529V5scc5aO0+mZByNa5YyfF1qmYqMnndcXg+7SmSqmZqLbPtFBmc6KAHLsfIo6fPIfnH+ZXVFktlu09Y4LbQRx01FSRYGcAADm4n+ZKxGzPRdu0RpyO20gElQ/v6qoI76Z/j9A6gvHtb0dedb2B9iodUS2KiqBu1nQU4fJO3PyN4ng08jjmpFnbOms6b8Z6ym4SZcjfzjQtlm0KeiK9762RC4xav2k3uj1Fp6W00+mbZO51tiucL3tr5m8BVbrSO9achmefyvEtB7TWX2o7LvTtLqOot9RcG1VC1zqKNzIt3JIGHEnPjXZ9koam36fpre+ogfPTwCFsscO4zgMNIZngOXBaWvnY+3C77TGbQqrXUzbzHUx1EYbQN6Jhjxut3c8se1WtKrGLeOw8jVpOSWBsvbTqJuldlmor7vBslPRPEJz/wBxw3Wf/c4LRPYO6JtlXoS+agvttpK5txq+14+2oWyDcjHfHvh1lx/Ytt7Zdm932lWJlgqtVG22zfZLNHT0gLpXt5ZcT8nPHHoWCs+xzVFp0NHoq27S6qgszGuYe1bdGydzXEl2ZMk8cnitYTjGm446WzMoydRSw0JGluxu1Lc7V2SFfpPTdZUT6WqaurYKMyF8UUbCS17Afk4Ixw5hdoha42ObHNJbMI55rMyeruNQ3cmrqpwdIW5zujHBozx4LY4WtecZyxibUYShHCRVERcjsRran+Du+/U3+xXdnfgNZvqjPYrW1P8AB3ffqb/YruzvwGs31RnsU37GvO9yKr7zfmfqZIB1og60UJFqEREAREQFCiFEAVMBVRAcUdlvs+fpbWrtT0EBbaL08ueWjhDU/jN8wdzHnytKQuAlBLct6wV+kuudL2rWOl63T15g6SkqmYJHyo3fivaeog8V+f8AtY0Ne9nOqZLLdoDJA4l1HVtGGVEfUR5x1hcqORLjKVV07VJyenDFLce6yFwhpUaKp3Dwa59pH6mCKsO9gRydRA9q8NRDJDKGyMOOOHdRV2OrLeO4SB51mtMVVgq7nHTalqauht7uDp6eESuZ6Wnq9HFfSODtThXkWPF3FB1KS5sViuz4EjK0ciXydWFTMqdSeD7TAYDm4KtwtBcQ/jgda3TrLZfs8gskV00rtUtdTK9m/wBr1hxv+YbvFp8xC1bS2Wple5xkhYAcOO9n7QvaLhjkiNJzq1VTa1qWhruPM2eSby6f8im5LbhoMPVRhrMtHLmvRabneoJRDbqid2f+3jeb+xSij09RNj6ape+ducEcgstFHSU0cbaaKOGJ/Ahg4g+dfPuEf8TcjVKToUqPH+cvF9ek9jkngLlFzU6lTil1PT6iXbOdqd10lZJY+5Oxx3Z7cMuB3nSg+NwPD7BhQnWF8vOpLq+53q4zV1S78aR3Bo8TRyA9CsXIPbOWA7w55CwV5vFNRtLXOD5OqNvV6V8lp+F5auM23ppY6oxWCR7zwLJmQqTua0vG55SeMn+9iL9PA+pq4qeN8Ub5XhjTK8MZknrceAC3hp+XSmyahpTZaig1ltFugEVG2leJYKMu4DBHX/M+YLlqvrqq4zgOaX7x3WRMGck8AAOsrszsRthcmloYtb6spAy9TMzQ0b28aNhHynf/AFCP2Be2qcEqWSrVVbmp/NepL9+s+UZb4ZyyjX4ujD+Uu7O7erqN17LdOVuntNNF6rHV18rXds3Opeflyu5tHia0cAPMpYqAYCqqyKwWB4+c3Uk5PnKoiLJqa82VeFetv1kP8lm9qngDc/oN/rCwmyrwr1t+sh/ks3tU8Abn9Bv9YVlc/S16PsRQWX1XL0/9mSOjP+kh+gPYrqtUn3nD9AexY2/XO4W98IorJU3IOB3jE9rdz05KgKLlLBFxxkadJSlqMrJHHKwslja9p5tcMhGxxtjEYjaGYxugcMehRjulvvzMuP8AGj96d0t9+Zlx/jR+9dPBanVvXxOHKNDr3P4EniiiiYGRRMjaPxWtwP5KjIYmSOkZExr3fKcGgE+kqM90t9+Zlx/jR+9O6W+/My4/xo/engtTq3r4jlGh17n8CTNhhZI6VsMbZHfKcGgE+kr63Gb+/uN3sY3sccKL90t9+Zlx/jR+9O6W+/My4/xo/eng1Tq3r4jlGh17n8CSmnpy7eNPEXZzncGVV8MT3te+JjnN+S4tBI9CjPdLffmZcf40fvQ6lvvzMuX8aP3p4NU6t6+JnlCh17n8CUnmonqvw30r+ln/ALalEDnPiY98Zjc5oJaebeHJRfVfhvpX9LP/AG1ih5b7H7DF+8aKfXH2olhA8S8dBabZQzz1FFb6WmmndvTPiiDXPPjJHNe0qCaysGqK+/VFxtN3dSRx00TKaPpSAZN5+/kZwBgt6iTjhhcMET1KSWCesneAmAtWWKya/o9WUEtwrjU0lGxkUsoqsMnY1rwSWk5DnEtPEcxzX2LJrkPcLpK6500tQ6qMFJXmnfE544R7xPyGEAjHjPArJg2hgJgLVtRpvWNZAacVctLVGp36ivfXl8U7MuLQ2JpBAGWg8uXWvLS6f1xDDUtru36p5NPgi4tbvxt3OkYHbwwTh3UOfNAbcwEwFrek0zqiaOH4QrqjLKtkkTBXuzHBuSAscRjeIcY8nrwsXS6f1wy2UUUzK41TGyNklNyDA2Ylu5KcOO80YPDz8kBtzARa11dZtZVN3qG26SoJqA1sddFXiNlNF0W65piPNxdk73VkHqwsedPbQ+kZU1NXLUyB8IZHHXYjHRjd3ncj3wG8cdZ5FAbaRUZndG9zxxVUBGtqf4O779Tf7Fd2d+A1m+qM9itbU/wd336m/wBiu7O/AazfVGexTfsa873IqvvN+Z+pkgHWiDrRQkWoREQBERAUKIUQBFREAPJR7X2jbBrewS2XUFG2ogfxjeOEkL+p7HdRUhRbU6k6U1ODwa1NawcFbYdh2qdA1E9bTQy3iwFxLKuBmXxDxSNHL0jgtTt+TloHA8Sv1Lexr2lrwHNIwQRkFao2hbAtA6sfLUw0brLXyZLp6EBrXHxuZyK+lZH/AIgShFU7+OP/ACWvvXwJFOthoZwjCZM5icGuzz5LIUtwnpv92MSZGCGnBwt56k7FjVlDO6SwXa3XOEcmTEwyO9oUKuWwnarTyEO0nJIOWYaiN4I/apuWcocF8qU8brCXXg8fUsS+ydlO8t5f/JVzeptYbmRSgvFO8FjphGxwOQ/hhbD0Tsx1FqijNdFU2ygtZbvGqq6toGPHug5H24WCothW0uQdH3I1oJP/AHJGNHtUv0x2N+0CSMsmht9pjee/6SpLsjztbz/avjuV8mZFjUcrBTl1NYLfrPc0eE19xWFevTh1+U9y0GrtfWq62u4y26kvNpucbBh01vlLmjzFzgP5KOaa0Lq7Vd2ZbbBZ56+oecOMfyGed7+QHpXY2j+xn09RGOXUt2qrs5pz0EQ6GH0cOJC3Vp6wWbT9vbb7Lbaagpm/iQsDc+c+M+lXeR8v3lhS4unShFdS097PE8Ir2xvH4lSdSe16I9yNK9j92OVn0JJBf9TPhvGomjejw3MFIfzAflO/OP2LfoHEphCot1d1ruo6laWLPKxiloRVFTKKOZKoiIDXmyrwr1t+sh/ks3tU8Abn9Bv9YWE2VeFmtv1kP8lm9qngFdP0bf6wrK5+lr0fYjz9l9Vy9P8A2ZJKL7zh+gPYrqs0X3nD9AexXsqulrL2n5C7AoxrfWtq0lLAy5xVb+lpaipBgj38NhaHOGOeSDwUnyo3qzScGoLnQ3I3CsoamhgqIoXwbuR0zQ0u4g8Rj0LBuYFu1Clmt1sko9M3ysuNxjkmht1O2J8ohZjelLg/c3OIx33EnA4r23HaRY4NH2zUlFT1txjukwgoqWGMNmkl77LCHkBpbuOzkjksLbdkFPaaWnks2p7pbrtFLO51fBHGN9kxBfH0WNxrctBAA4HJ61mbns1sFbs1boI9M22gDelJDpid/ee/ePJ7iXZcOI3jhAY+j2v6brLhboaakuclHWCAS13QgQ0sk+eijkychxwRwBA4ZPFWW7ZbALbcK+SzX5kNLC2phxShxqqYyGPp2AO4MDgc72CBg44r2Veyuxy6ipbhT1VXSW6I0z5bVFuinmfTtLYXHhkbo6geOBleW37IbVS2270El5udTFXUJt1N0hbmipS8v6NmBx748zk8AOpAbHp5WzU8czc7sjQ4Z8RGV9q3SxCnpooGklsbAwE+IDCuZQFFE9WeG+lf0s/9tSzqUT1X4b6V/Sz/ANtdrfyu5+wg5Q/ortj7US0qMa4slbeDb300dPVRU8j3S0lRK6OOXLcNcS0Zy08QFJygXEnGqRs6v1TS1NHU10EDpa01HbTJHSEtw/dbukcgXN5k8l6K3Z/XstVQ6Gtp6Sqkp6eOSoM8n4jHtkJcfGS0/ZxWzlg9f2qS+aJvNmiaXPraOSANBxneaRjPVzQEMuOknwTUjIK+3VtFFCyA0VTVGJk0pDsPO7+MN4EAcT+xfTdD3mtr6ia43WkrYZ6yCeSnD34pjE4Dcac5IMfA5xxWsqDZJrSjhhIoX1VWytiqe2aiqjLmbjWsAAzg96xrcH0qZaH05r/TUt+lNNW1El7lFVM/tqAGCoLiXOYCCN0t3W4P5IQHurtFXV0c9NLdqJkvAmsdWPbLTRkOb0IH5Lsjjn9pAXprNHX6r07UWdt7pq6eG6MlaTUEP6BsW41rzg9+OfLjjPNQ/WOzvWN/1Fdbuyyxx9umNzYpaxjg7dwC2XHymtxlgHJynGxfSt701VX110p+ghrZo5YQZxK97gCHPe7nvHhw5DHBAeSfQWo3wbjqikmqGnemqTUyB1YzvfuDxjvWDHPjyHDiVnNOaNr6K6UNbVVpbDEJXy0ccz3RNcXkwgZ5hjXOHHnnlwCnCICjQQOKqiICNbU/wd336m/2K7s78BrN9UZ7Fa2p/g7vv1N/sV3Z34DWb6oz2Kb9jXne5FV95vzP1MkA60QdaKEi1CIiAIiIChUS2sa7tmznR02prtBUVFPHKyIRQY33OccDGVLStPdlHoTVe0LSlqsmmY6KRsVeKmrbVTmMOa0HABA45JK72sKc60Y1XhHHSazbUW0ejQm3Gy6o1rT6Qm09fbNc6qn7Yp21sADXsxnOQeAI5FX37b9JDa9Fs2iZVTVz5egdVsA6Bs27vdHnnnq9K1ZpDY/tR0xfrtqux0NhtNdLbTRUdBFXPmYXuGOldI8Ejd54HWvCexw19ZKbT91s+paW5XaiuTLhPTzsETWykgyOEvFz+IxxVq7Wwz34+Cw0aef4HBTq4ajb+0HbZYtL6mfpe3We8amvcLOkqaS1wdIaduM9+eo46lbuO3XS9u0Xa9QV1svUFXdZHR0NofSkVk7gcHDPyc/jdaglbs12uaX2hauvWhRZK2l1W09JPVzmOajc4ccEcy0k4x5lavexzaXbKvQ2q7LdKG/6k0/SmGriuU7tyZ5c47zXHzOx9gK5q3s8IpyW/W8NXUsTOfU06Cc6T296avTL/BXWi72O6WOjfW1Nvrog2V0TRklvn5cD4144+yN0ZNoOj1VT0dwmNTcW280Dd3tiOV3EEjOMEcchQ+67Gdo17tmstV3qptUms9Q0jaGnpYJSynpIN5u8C8jicNAWLi7GS7WzW2kLnapqV1rp+1pr1TyTHvJo8b7oxjvgT+xdI2+TnjnTw7+rSt+o1c63MjaGsdvNhsuoKmwWiwX3U1woWB9ey2Qb7aXhkhzvGOtTqxauo7poNusHUVfQ0hpX1LoKuExzNa0EnLT6OHjWhY9lu2TSV11lbdFS2Sotmp6h0vwlPUOiqabeJPDAzkAkfzW177pLU7dgM+jKCtbcNQOtQo+2qmYgSSEYe4uPHrKi16NtHMVOS0tacd+K5jeMpvHEiFh7JnSlxqLY6s07qK22+5zinprhPTgwOfnGN4HjgkZxyWRufZB6WoaHVdc+1XOSDTdbHRTObu/6iR7i0CPj5ieKwOzbsdKS02ex1OqbtcbrXWppngtTqj/QwVPMFoxxGcKFVuwTaTNs1mswjtD7rcNRuutdv1feGNrT0bc448SchSlRydObSloTw19fwNM6qljgb/13tJtWjtmcWurnRVbqWVkLm0zMdKTJjDePDPFQ/UnZCWazXz4GZpXUNxq2W+KvnbSRNf0Eb2B/fceGARk8lHdoWhdse0LRVu07f6DTdDHTXWCVzaOqdummY3BzkcTnkFai2Bagv203VN+1Bfquy22uDYKMWqpAkmgADdyThwGGjh51zo29lGONaWnTqfZh7zaUqjfiomtLt80jXHSItlLcKw6nnfBTgMDXU7mEB3SAnqPiXlt3ZF6JrbXqmtbFWxv06C6SB+6H1LA/c3o+OCMqP1uxO7WzaXYK3S9HRQ6b09Z5oaFktR91fVva/vnDHW5wy7zLXVw7FjVkugrdJTT0MeqTUyi5MNSehlhcctIdjmPF15XSlb5NlhnTax+L93tNXKsuY35qfbRpzTuy+066uVHWsiu7WmjoAGmok3uPLlwHEr7uu2jSNs2WW3aDVuqRQ3PDaSmY0OmkkOR0eOWeByVre77Edd6s1TDV3O+UlgtljoGUFkhgaKnLNzde97TwaXePmsbQbJdplv2TUmhq3TGl9RU1Jc5ahrKutcx3REd6Y3NHeOzk/auatbLCPj6cdOnm2ew2z6mw3Tst2iTa3qKyGXR9+sIpWMeJLhGGslDuQaRzPWp6tNdjNs21RoChu8mo7gMXCZrqa2RVL54qNozyc7mTnq8S3GM9ar7qNOFZqk8YnWDk44s1/sp8K9bfrIf5LNbVSG6BupJAAjbxP0wsDsulii1brYSSMZm5DG87H5SntRJQVETop5KaWNww5jy1wPpBUm8bjcqWHNH2IpcmpTye6eKTbmvzMxdJqnTbaWJrr7bgQwAjthvDh6Vd7qtNf89bvWG+9fXwbpvyC0/wY/cnwZpvyC0/wY/co7VF8z/fcS4yuopLPh6/ifPdVpr/AJ63esN96d1Wmv8Anrd6w33r6+DNN+QWn+DH7k+DNN+QWn+DH7ljCjsf77jOfdf3Q9fxPnuq01/z1u9Yb707qtNf89bvWG+9fXwZpvyC0/wY/cnwZpvyC0/wY/cmFHY/33DPuv7oev4nz3Vaa/563esN96d1Wmv+et3rDfevr4M035Baf4MfuT4N035Baf4MfuTCjsf77hn3X90PX8T57qtNf89bvWG+9O6rTX/PW71hvvX18Gab8gtP8GP3J8G6b8gtP8GP3JhR2P8AfcM+6/uh6/ifHdVpr/nrb6w33qP3m7Wy5a40wLfcKWrLJJ94RShxb9z68KR/Bmm/ILT/AAY/crlNSWGmmE1PTW2GVvJ8cbGuH2hbRdKGLSeJyqQuKyUZzjhinox5njtMmUCs9tU3lMX74Ttqm8pi/fCjZr2FnxkNpeRWe2qbymL98J21TeUxfvhM17BxkNpewmArPbVN5TF++E7apvKYv3wma9g4yG0vYCYCs9tU3lMX74Ttqm8pi/fCZr2DjIbS8is9tU3lMX74Ttqm8pi/fCZr2DjIbS8is9tU3lMX74Ttqm8pi/fCZr2DjIbTAbU/wd336m/2K7s78BrN9UZ7F5dp9RTv2e3xrZ43E0b8AOHiXq2d+A1m+ps9imNNWax/u9yKyMlLKbwf/wCP1MkA60VG8lVQi2CIiAIiICmEwqogKYTCqiA+cHqVcFVRAUwmCqogPnBVcKqJgCmEwqogKYTCqixgCmEwqomAKAJhVRMAUIVN0r6RZBDLrsz0pc7lUXCqpajp6h5fIWTuaC48zgLzfFLo3yWs9acp4ilRvrmKwVR7yvlkmxk23Sji+pED+KXRvktZ605Pil0b5LWetOU8RbcoXXSPea8j2HQx3IgfxS6N8lrPWnJ8UujfJaz1pyniJyhddI945HsOhjuRA/il0b5LWetOT4pdG+S1nrTlPETlC66R7xyPYdDHciB/FLo3yWs9acnxS6N8lrPWnKeIscoXXSPeOR7DoY7kQP4pdG+S1nrTk+KXRvktZ605TxFnlC66R7xyPYdDHciB/FLo3yWs9acnxS6N8mrPWnKeInKF10j3jkew6GO5ED+KXRvktZ605Pil0b5LWetOU8ROULrpHvHI9h0MdyIH8UujfJaz1pyfFLo3yWs9acp4icoXXSPeOR7DoY7kQP4pdG+S1nrTk+KXRvktZ605TxE5Quuke8cj2HQx3IgfxS6N8lrPWnJ8UujfJaz1pyniLHKF10j3jkew6GO5ED+KXRvktZ605Pil0b5LWetOU8RZ5Quuke8cj2HQx3IgfxS6N8lrPWnJ8UujfJaz1pyniJyhddI945HsOhjuRAjsk0YRg0tXj605TO20UFuoIKGkZuQQMEcbc5wByXqRcatzWrLCpJvtJFvY21s3KjBRb2LAoFVEXElBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAf/Z'

// ── LIFECYCLE ──
onMounted(async () => {
  await fetchAvailableYears()
  await fetchProgram()
  await fetchSignatories()
})
</script>

<script>
// Logo constants — must be outside setup() so printProgram() can access them
// These are referenced inside the printProgram function via closure
</script>

<style scoped>
/* Screen table */
.screen-table-wrap { overflow-x: auto; }
.screen-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.screen-table th {
  background: #1B5E20; color: white; padding: 6px 8px;
  border: 1px solid #ccc; text-align: center; white-space: nowrap; font-size: 11px;
}
.screen-table td { border: 1px solid #e0e0e0; padding: 5px 8px; vertical-align: middle; }
.screen-table tr:hover td { background: rgba(0,0,0,0.02); }
.desc-cell { font-weight: bold; background: #E8F5E9 !important; text-align: center; color: #1B5E20; font-size: 11px; }
.comp-cell { width: 130px; }
.task-cell { min-width: 200px; font-size: 11px; }
.freq-cell { width: 36px; text-align: center; }
.resp-cell { width: 130px; font-size: 11px; }
.rem-cell  { font-size: 11px; }
.act-cell  { width: 80px; text-align: center; white-space: nowrap; }
.s-desc { width: 120px; }
.s-comp { width: 120px; }
.s-task { min-width: 200px; }
.s-freq { width: 36px; }
.s-resp { width: 130px; }
.s-rem  { min-width: 120px; }
.s-act  { width: 80px; }

/* Objectives */
.obj-group { margin-bottom: 4px; }
.obj-title { font-size: 12px; font-weight: bold; margin-bottom: 2px; }
.obj-list { margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.6; }

/* Signatories */
.signatories-section { border-top: 1px solid #e0e0e0; }
.sig-label { font-size: 11px; font-weight: bold; margin-bottom: 20px; }
.sig-line  { border-top: 1px solid #333; margin: 0 auto 4px; width: 70%; }
.sig-name  { font-weight: bold; font-size: 13px; margin: 0; }
.sig-title { font-size: 11px; color: #555; margin: 0; }
</style>

