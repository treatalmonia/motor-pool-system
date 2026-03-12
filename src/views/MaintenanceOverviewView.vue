<template>
  <div class="ml-root">
    <!-- ── Header ── -->
    <div class="ml-header">
      <div class="ml-header__left">
        <p class="ml-header__eyebrow">Fleet Management</p>
        <h2 class="ml-header__title">Maintenance Log</h2>
        <p class="ml-header__sub">
          Performance tasks are auto-logged when marked <em>Completed</em> from the Schedule tab.
        </p>
      </div>
      <div class="ml-header__controls">
        <div class="ml-control-group">
          <label class="ml-label">Year</label>
          <select v-model="selectedYear" class="ml-select">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <div class="ml-control-group">
          <label class="ml-label">Filter Vehicle</label>
          <select v-model="selectedVehicleId" class="ml-select ml-select--wide">
            <option :value="null">All Vehicles</option>
            <option v-for="v in vehicleOptions" :key="v.id" :value="v.id">
              {{ v.asset_name }}
            </option>
          </select>
        </div>
        <div class="ml-control-group">
          <label class="ml-label">Sort By</label>
          <select v-model="sortBy" class="ml-select">
            <option value="vehicle">Vehicle</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ── Summary Bar ── -->
    <div class="ml-summary">
      <div class="ml-stat ml-stat--ok">
        <span class="ml-stat__num">{{ summaryTotals.ok }}</span>
        <span class="ml-stat__label">OK</span>
      </div>
      <div class="ml-stat ml-stat--soon">
        <span class="ml-stat__num">{{ summaryTotals.soon }}</span>
        <span class="ml-stat__label">Due Soon</span>
      </div>
      <div class="ml-stat ml-stat--overdue">
        <span class="ml-stat__num">{{ summaryTotals.overdue }}</span>
        <span class="ml-stat__label">Overdue</span>
      </div>
      <div class="ml-stat ml-stat--none">
        <span class="ml-stat__num">{{ summaryTotals.none }}</span>
        <span class="ml-stat__label">No Record</span>
      </div>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" class="ml-empty">
      <div class="ml-spinner"></div>
      <p>Loading maintenance data…</p>
    </div>

    <!-- ── Matrix ── -->
    <div v-else class="ml-matrix-wrap">
      <div class="ml-matrix-scroll">
        <table class="ml-matrix">
          <thead>
            <tr>
              <th class="ml-col-vehicle ml-sticky-l">Vehicle</th>
              <th class="ml-col-task ml-sticky-l2">Performance Task</th>
              <th
                v-for="m in months"
                :key="m.value"
                class="ml-col-month"
                :class="{
                  'ml-col-month--current': m.value === currentMonth && selectedYear === currentYear,
                }"
              >
                {{ m.label }}
              </th>
              <th class="ml-col-status">Status</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(group, gi) in matrixGroups" :key="group.vehicleId">
              <tr
                v-for="(row, ri) in group.rows"
                :key="row.service_type"
                class="ml-row"
                :class="rowStatusClass(row)"
              >
                <!-- Vehicle cell — only on first row of group -->
                <td v-if="ri === 0" :rowspan="group.rows.length" class="ml-td-vehicle ml-sticky-l">
                  <div class="ml-vehicle-badge">
                    <span class="ml-vehicle-badge__icon">🚗</span>
                    <div>
                      <p class="ml-vehicle-name">{{ group.vehicleName }}</p>
                      <p class="ml-vehicle-plate">{{ group.plate || '—' }}</p>
                    </div>
                  </div>
                </td>
                <!-- Task name -->
                <td class="ml-td-task ml-sticky-l2">
                  <span class="ml-task-name">{{ row.service_type }}</span>
                  <span
                    class="ml-task-interval"
                    v-if="row.km_between_service || row.months_between_service"
                  >
                    <template v-if="row.km_between_service"
                      >every {{ Number(row.km_between_service).toLocaleString() }} km</template
                    >
                    <template v-if="row.km_between_service && row.months_between_service">
                      ·
                    </template>
                    <template v-if="row.months_between_service"
                      >{{ row.months_between_service }} mo</template
                    >
                  </span>
                </td>
                <!-- Month cells -->
                <td
                  v-for="m in months"
                  :key="m.value"
                  class="ml-td-month"
                  :class="{
                    'ml-td-month--current':
                      m.value === currentMonth && selectedYear === currentYear,
                  }"
                >
                  <button
                    v-if="row.monthCells[m.value]"
                    class="ml-cell-done"
                    @click="
                      openDetail(
                        row.monthCells[m.value],
                        group.vehicleName,
                        row.service_type,
                        group.currentOdometer,
                      )
                    "
                    :title="
                      'View details for ' + formatDate(row.monthCells[m.value].date_performed)
                    "
                  >
                    <span class="ml-cell-done__date">{{
                      formatShortDate(row.monthCells[m.value].date_performed)
                    }}</span>
                    <span class="ml-cell-done__dot"></span>
                  </button>
                  <span v-else class="ml-cell-empty">—</span>
                </td>
                <!-- Status -->
                <td class="ml-td-status">
                  <span class="ml-status-pill" :class="'ml-status-pill--' + statusKey(row)">
                    {{ statusLabel(row) }}
                  </span>
                </td>
              </tr>
              <!-- Group separator -->
              <tr v-if="gi < matrixGroups.length - 1" class="ml-row-sep">
                <td :colspan="months.length + 3"></td>
              </tr>
            </template>
            <tr v-if="matrixGroups.length === 0">
              <td :colspan="months.length + 3" class="ml-empty-row">No records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Legend ── -->
    <div class="ml-legend">
      <span class="ml-legend__label">Legend:</span>
      <span class="ml-pill ml-pill--ok">OK</span>
      <span class="ml-pill ml-pill--soon">Due Soon (30 days)</span>
      <span class="ml-pill ml-pill--overdue">Overdue</span>
      <span class="ml-pill ml-pill--none">No Record</span>
    </div>

    <!-- ── Detail Popup ── -->
    <transition name="ml-fade">
      <div v-if="detailOpen" class="ml-overlay" @click.self="detailOpen = false">
        <div class="ml-detail">
          <button class="ml-detail__close" @click="detailOpen = false">✕</button>
          <p class="ml-detail__eyebrow">{{ detailVehicle }} · {{ detailTask }}</p>
          <h3 class="ml-detail__title">Service Record</h3>
          <div class="ml-detail__grid">
            
            <div class="ml-detail__item">
              <span class="ml-detail__key">Date Conducted</span>
              <div class="ml-detail__item">
                <span class="ml-detail__key">Current Odometer</span>
                <span class="ml-detail__val">
                  {{
                    detailRecord?.current_odometer
                      ? Number(detailRecord.current_odometer).toLocaleString() + ' km'
                      : '—'
                  }}
                </span>
              </div>
            </div>

            <div class="ml-detail__item">
              <span class="ml-detail__key">Odometer Reading</span>
              <span class="ml-detail__val">
                {{
                  detailRecord?.odometer_reading
                    ? Number(detailRecord.odometer_reading).toLocaleString() + ' km'
                    : '—'
                }}
              </span>
            </div>
            <div class="ml-detail__item">
              <span class="ml-detail__key">Mechanic / Conducted By</span>
              <span class="ml-detail__val">{{ detailRecord?.conducted_by || '—' }}</span>
            </div>
            <div class="ml-detail__item">
              <span class="ml-detail__key">Next Due Date</span>
              <span
                class="ml-detail__val"
                :class="detailRecord?.next_due_date < today ? 'ml-detail__val--overdue' : ''"
              >
                {{ formatDate(detailRecord?.next_due_date) || '—' }}
              </span>
            </div>
            <div class="ml-detail__item">
              <span class="ml-detail__key">Next Due Odometer</span>
              <span class="ml-detail__val">
                {{
                  detailRecord?.next_due_odometer
                    ? Number(detailRecord.next_due_odometer).toLocaleString() + ' km'
                    : '—'
                }}
              </span>
            </div>
            <div class="ml-detail__item ml-detail__item--full" v-if="detailRecord?.remarks">
              <span class="ml-detail__key">Remarks</span>
              <span class="ml-detail__val">{{ detailRecord.remarks }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { supabase } from '../supabase'

const today = new Date().toISOString().split('T')[0]
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

// ── State ──
const loading = ref(false)
const vehicles = ref([])
const pmServiceTypes = ref([])
const pmRecords = ref([])
const selectedVehicleId = ref(null)
const selectedYear = ref(currentYear)
const sortBy = ref('vehicle')

// ── Detail popup ──
const detailOpen = ref(false)
const detailRecord = ref(null)
const detailVehicle = ref('')
const detailTask = ref('')

function openDetail(record, vehicleName, taskName, vehicleOdometer) {
  detailRecord.value = { ...record, current_odometer: vehicleOdometer }
  detailVehicle.value = vehicleName
  detailTask.value = taskName
  detailOpen.value = true
}

// ── Options ──
const yearOptions = computed(() => {
  const years = []
  for (let y = currentYear + 1; y >= currentYear - 4; y--) years.push(y)
  return years
})

const months = [
  { label: 'Jan', value: 1 },
  { label: 'Feb', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Apr', value: 4 },
  { label: 'May', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Aug', value: 8 },
  { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Dec', value: 12 },
]

const vehicleOptions = computed(() => vehicles.value.filter((v) => v.asset_type === 'Vehicle'))

const filteredVehicles = computed(() => {
  const list = vehicleOptions.value
  if (selectedVehicleId.value) return list.filter((v) => v.id === selectedVehicleId.value)
  return list
})

// ── Matrix groups (one per vehicle) ──
const matrixGroups = computed(() => {
  if (!pmServiceTypes.value.length) return []

  const groups = filteredVehicles.value.map((vehicle) => {
    const vehicleRecords = pmRecords.value.filter((r) => r.vehicle_id === vehicle.id)

    const rows = pmServiceTypes.value.map((st) => {
      const records = vehicleRecords.filter((r) => r.service_type === st.service_type)

      const yearRecords = records.filter((r) => {
        if (!r.date_performed) return false
        return new Date(r.date_performed).getFullYear() === selectedYear.value
      })

      const monthCells = {}
      yearRecords.forEach((r) => {
        const month = new Date(r.date_performed + 'T00:00:00').getMonth() + 1
        if (!monthCells[month] || r.date_performed > monthCells[month].date_performed) {
          monthCells[month] = r
        }
      })

      const latestRecord = records.length
        ? records.reduce((a, b) => ((a.date_performed || '') > (b.date_performed || '') ? a : b))
        : null

      return {
        service_type: st.service_type,
        km_between_service: st.km_between_service,
        months_between_service: st.months_between_service,
        monthCells,
        latestRecord,
      }
    })

    return {
      vehicleId: vehicle.id,
      vehicleName: vehicle.asset_name,
      plate: vehicle.plate_number,

      rows,
    }
  })

  if (sortBy.value === 'status') {
    return [...groups].sort((a, b) => {
      const priority = (r) => {
        const worst = r.rows.reduce((p, row) => {
          const s = statusKey(row)
          const map = { overdue: 0, soon: 1, ok: 2, none: 3 }
          return Math.min(p, map[s] ?? 3)
        }, 3)
        return worst
      }
      return priority(a) - priority(b)
    })
  }

  return groups
})

// ── Summary totals (across all shown groups) ──
const summaryTotals = computed(() => {
  const counts = { ok: 0, soon: 0, overdue: 0, none: 0 }
  matrixGroups.value.forEach((g) => {
    g.rows.forEach((row) => {
      counts[statusKey(row)]++
    })
  })
  return counts
})

// ── Helpers ──
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}/${dd}`
}

function statusKey(row) {
  if (!row.latestRecord?.next_due_date) return 'none'
  if (row.latestRecord.next_due_date < today) return 'overdue'
  const soon = new Date()
  soon.setDate(soon.getDate() + 30)
  if (row.latestRecord.next_due_date <= soon.toISOString().split('T')[0]) return 'soon'
  return 'ok'
}

function statusLabel(row) {
  return { overdue: 'Overdue', soon: 'Due Soon', ok: 'OK', none: 'No Record' }[statusKey(row)]
}

function rowStatusClass(row) {
  return {
    'ml-row--overdue': statusKey(row) === 'overdue',
    'ml-row--soon': statusKey(row) === 'soon',
  }
}

// ── Fetch ──
async function fetchAll() {
  loading.value = true
  const [vRes, stRes] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id,asset_name,asset_type,plate_number,model,year_model,current_odometer')
      .eq('status', 'Active')
      .order('asset_name'),
    supabase.from('pm_service_types').select('*').order('service_type'),
  ])
  if (!vRes.error) vehicles.value = vRes.data
  if (!stRes.error) pmServiceTypes.value = stRes.data

  const vIds = vehicles.value.filter((v) => v.asset_type === 'Vehicle').map((v) => v.id)
  if (vIds.length) {
    const { data, error } = await supabase
      .from('vehicle_pm_log')
      .select('*')
      .in('vehicle_id', vIds)
      .order('date_performed', { ascending: false })
    if (!error) pmRecords.value = data
  }
  loading.value = false
}

watch(selectedYear, fetchAll)
onMounted(fetchAll)
</script>

<style scoped>
/* ── Root & tokens ── */
.ml-root {
  --c-bg: #f8f8f6;
  --c-surface: #ffffff;
  --c-border: #e4e2dc;
  --c-text: #1a1a18;
  --c-muted: #8a8880;
  --c-accent: #2563eb;

  --c-ok: #16a34a;
  --c-ok-bg: #f0fdf4;
  --c-soon: #d97706;
  --c-soon-bg: #fffbeb;
  --c-overdue: #dc2626;
  --c-overdue-bg: #fef2f2;
  --c-none: #9ca3af;
  --c-none-bg: #f9fafb;

  font-family: 'DM Sans', 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px;
  color: var(--c-text);
  background: var(--c-bg);
  padding: 24px;
  min-height: 100%;
  box-sizing: border-box;
}

/* ── Header ── */
.ml-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.ml-header__eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
  margin: 0 0 4px;
}
.ml-header__title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
  color: var(--c-text);
}
.ml-header__sub {
  font-size: 12px;
  color: var(--c-muted);
  margin: 0;
}
.ml-header__controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.ml-control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ml-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--c-muted);
}
.ml-select {
  appearance: none;
  background: var(--c-surface)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238a8880'/%3E%3C/svg%3E")
    no-repeat right 10px center;
  border: 1.5px solid var(--c-border);
  border-radius: 7px;
  padding: 7px 30px 7px 11px;
  font-size: 13px;
  font-family: inherit;
  color: var(--c-text);
  cursor: pointer;
  transition: border-color 0.15s;
  min-width: 90px;
}
.ml-select:focus {
  outline: none;
  border-color: var(--c-accent);
}
.ml-select--wide {
  min-width: 170px;
}

/* ── Summary Bar ── */
.ml-summary {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.ml-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 9px;
  border: 1.5px solid;
  background: var(--c-surface);
  flex: 1;
  min-width: 100px;
}
.ml-stat--ok {
  border-color: #bbf7d0;
  background: var(--c-ok-bg);
}
.ml-stat--soon {
  border-color: #fde68a;
  background: var(--c-soon-bg);
}
.ml-stat--overdue {
  border-color: #fecaca;
  background: var(--c-overdue-bg);
}
.ml-stat--none {
  border-color: var(--c-border);
  background: var(--c-surface);
}

.ml-stat__num {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}
.ml-stat--ok .ml-stat__num {
  color: var(--c-ok);
}
.ml-stat--soon .ml-stat__num {
  color: var(--c-soon);
}
.ml-stat--overdue .ml-stat__num {
  color: var(--c-overdue);
}
.ml-stat--none .ml-stat__num {
  color: var(--c-none);
}
.ml-stat__label {
  font-size: 11px;
  color: var(--c-muted);
  font-weight: 500;
}

/* ── Matrix wrap ── */
.ml-matrix-wrap {
  background: var(--c-surface);
  border: 1.5px solid var(--c-border);
  border-radius: 12px;
  overflow: hidden;
}
.ml-matrix-scroll {
  overflow-x: auto;
}

/* ── Matrix table ── */
.ml-matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.ml-matrix thead tr {
  background: #f4f3ef;
}
.ml-matrix th {
  padding: 9px 10px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--c-muted);
  border-bottom: 1.5px solid var(--c-border);
  white-space: nowrap;
}
.ml-matrix td {
  padding: 7px 10px;
  border-bottom: 1px solid var(--c-border);
  vertical-align: middle;
}

/* Sticky columns */
.ml-sticky-l {
  position: sticky;
  left: 0;
  z-index: 2;
  background: inherit;
}
.ml-sticky-l2 {
  position: sticky;
  left: 148px;
  z-index: 2;
  background: inherit;
  border-right: 1.5px solid var(--c-border);
}
thead .ml-sticky-l,
thead .ml-sticky-l2 {
  z-index: 4;
  background: #f4f3ef;
}

/* Column widths */
.ml-col-vehicle {
  min-width: 148px;
}
.ml-col-task {
  min-width: 180px;
}
.ml-col-month {
  min-width: 64px;
  text-align: center;
}
.ml-col-month--current {
  background: #eff6ff;
  color: var(--c-accent);
}
.ml-col-status {
  min-width: 90px;
  text-align: center;
}

/* Row states */
.ml-row {
  transition: background 0.1s;
}
.ml-row:hover td {
  background: #f8f8f6;
}
.ml-row--overdue td {
  background: #fff8f8;
}
.ml-row--soon td {
  background: #fffef5;
}

.ml-row-sep td {
  padding: 0;
  height: 6px;
  background: #f4f3ef;
  border-bottom: 1.5px solid var(--c-border);
}

/* Vehicle cell */
.ml-td-vehicle {
  vertical-align: top !important;
  padding-top: 12px !important;
  background: #fafaf8;
  border-right: 1.5px solid var(--c-border);
}
.ml-vehicle-badge {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.ml-vehicle-badge__icon {
  font-size: 16px;
  margin-top: 1px;
}
.ml-vehicle-name {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}
.ml-vehicle-plate {
  font-size: 10.5px;
  color: var(--c-muted);
  margin: 0;
  letter-spacing: 0.04em;
}

/* Task cell */
.ml-td-task {
  background: #fafaf8;
}
.ml-task-name {
  display: block;
  font-weight: 600;
  color: var(--c-text);
}
.ml-task-interval {
  display: block;
  font-size: 10.5px;
  color: var(--c-muted);
  margin-top: 1px;
}

/* Month cells */
.ml-td-month {
  text-align: center;
}
.ml-td-month--current {
  background: #eff6ff22;
}

.ml-cell-done {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: #dcfce7;
  border: 1.5px solid #86efac;
  border-radius: 6px;
  padding: 3px 7px;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
  font-family: inherit;
}
.ml-cell-done:hover {
  background: #bbf7d0;
  border-color: #4ade80;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(22, 163, 74, 0.15);
}
.ml-cell-done__date {
  font-size: 10.5px;
  font-weight: 700;
  color: #15803d;
  line-height: 1;
}
.ml-cell-done__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #22c55e;
}

.ml-cell-empty {
  color: #d1d5db;
  font-size: 12px;
}

/* Status */
.ml-td-status {
  text-align: center;
}
.ml-status-pill {
  display: inline-block;
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
}
.ml-status-pill--ok {
  background: var(--c-ok-bg);
  color: var(--c-ok);
}
.ml-status-pill--soon {
  background: var(--c-soon-bg);
  color: var(--c-soon);
}
.ml-status-pill--overdue {
  background: var(--c-overdue-bg);
  color: var(--c-overdue);
}
.ml-status-pill--none {
  background: var(--c-none-bg);
  color: var(--c-none);
}

/* ── Legend ── */
.ml-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}
.ml-legend__label {
  font-size: 11px;
  color: var(--c-muted);
  font-weight: 500;
}
.ml-pill {
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
}
.ml-pill--ok {
  background: var(--c-ok-bg);
  color: var(--c-ok);
}
.ml-pill--soon {
  background: var(--c-soon-bg);
  color: var(--c-soon);
}
.ml-pill--overdue {
  background: var(--c-overdue-bg);
  color: var(--c-overdue);
}
.ml-pill--none {
  background: var(--c-none-bg);
  color: var(--c-none);
}

/* ── Loading / Empty ── */
.ml-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--c-muted);
}
.ml-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--c-border);
  border-top-color: var(--c-accent);
  border-radius: 50%;
  animation: ml-spin 0.7s linear infinite;
  margin: 0 auto 12px;
}
@keyframes ml-spin {
  to {
    transform: rotate(360deg);
  }
}
.ml-empty-row {
  text-align: center;
  padding: 40px;
  color: var(--c-muted);
}

/* ── Detail Overlay ── */
.ml-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.ml-detail {
  background: var(--c-surface);
  border: 1.5px solid var(--c-border);
  border-radius: 16px;
  padding: 28px;
  max-width: 480px;
  width: 100%;
  position: relative;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}
.ml-detail__close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f0ede8;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 12px;
  color: var(--c-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.ml-detail__close:hover {
  background: #e4e0d8;
}
.ml-detail__eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-accent);
  margin: 0 0 4px;
}
.ml-detail__title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px;
  letter-spacing: -0.02em;
}
.ml-detail__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.ml-detail__item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.ml-detail__item--full {
  grid-column: 1 / -1;
}
.ml-detail__key {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--c-muted);
}
.ml-detail__val {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
}
.ml-detail__val--overdue {
  color: var(--c-overdue);
}

/* ── Transition ── */
.ml-fade-enter-active,
.ml-fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.ml-fade-enter-from,
.ml-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
