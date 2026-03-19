<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">Schedule of Maintenance</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Track scheduled and completed preventive maintenance
            </p>
          </div>

          <!-- WHAT: Year management controls — matches VehicleRequestsView layout -->
          <div class="d-flex align-center ga-2 flex-wrap">
            <!-- WHY: item-title/item-value needed because yearOptions now returns
                 objects to support the "All Years" (null value) option -->
            <v-select
              v-model="yearFilter"
              :items="yearOptions"
              item-title="title"
              item-value="value"
              label="Year"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 120px"
            />
            <v-btn variant="outlined" prepend-icon="mdi-plus" @click="addYear"> Add Year </v-btn>

            <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
              Add PM Record
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Summary Cards — date-based status for Scheduled records only -->
    <!-- WHY: Shows actionable maintenance urgency, not just database status counts -->
    <v-row class="mb-4">
      <!-- Overdue Maintenance — past the due date -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="error" variant="tonal" size="48">
              <v-icon>mdi-alert-circle</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Overdue Maintenance</p>
              <p class="text-h5 font-weight-bold text-error">{{ overdueMaintenanceCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Due Today — exactly on the due date -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="48">
              <v-icon>mdi-calendar-today</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Due Today</p>
              <p class="text-h5 font-weight-bold text-primary">{{ dueTodayCount }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Due Soon — within 2 days of due date -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="warning" variant="tonal" size="48">
              <v-icon>mdi-clock-alert</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Due Soon</p>
              <p class="text-h5 font-weight-bold text-warning">{{ dueSoonCount }}</p>
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

          <v-col cols="12" sm="2">
            <v-select
              v-model="yearFilter"
              :items="yearOptions"
              label="Year"
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
            <!-- WHY: Row background color shows urgency at a glance -->
            <!-- Red = Overdue, Blue = Due Today, Yellow = Due Soon, none = OK -->
            <tr v-bind="props" :style="getRowStyle(item)">
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

<!-- Next Due Date — row color already shows urgency -->
              <!-- WHY: Chip labels removed — row background color (red/blue/yellow)
                   communicates the status. Chips were redundant and cluttered. -->
              <td>
                <span
                  v-if="item.next_due_date"
                  :class="{
                    'text-error font-weight-bold': getDateStatus(item) === 'overdue',
                    'text-primary font-weight-bold': getDateStatus(item) === 'due-today',
                    'text-warning font-weight-bold': getDateStatus(item) === 'due-soon',
                  }"
                >
                  {{ formatDate(item.next_due_date) }}
                </span>
                <span v-else class="text-medium-emphasis">—</span>
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
                  <v-list density="compact" min-width="150">
                    <v-list-item
                      v-for="s in ['Scheduled', 'Completed', 'Cancelled']"
                      :key="s"
                      :title="s"
                      @click="quickUpdateStatus(item, s)"
                    />
                  </v-list>
                </v-menu>
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
            <!-- Asset — grouped dropdown, disabled/class set on items directly -->
            <!-- WHY: :item-props function causes Vuetify 4 virtual scroll crash -->
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

            <!-- Conducted By — searchable combobox with auto-save -->
            <!-- WHAT: Same behavior as VehicleRequestsView Conducted By field -->
            <!-- WHY: Saved entries persist in Supabase dropdown_options table -->
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.conducted_by"
                :items="conductedByOptions"
                label="Conducted By"
                variant="outlined"
                density="comfortable"
                placeholder="Type or select name"
                clearable
                @update:modelValue="onConductedByUpdate"
              />
              <!-- Saved custom entries with delete button -->
              <div v-if="getSavedOptions('conducted_by').length" class="d-flex flex-wrap ga-1 mt-1">
                <v-chip
                  v-for="opt in getSavedOptions('conducted_by')"
                  :key="opt.id"
                  size="small"
                  closable
                  @click:close="deleteDropdownOption(opt.id)"
                >
                  {{ opt.value }}
                </v-chip>
              </div>
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

            <!-- Date Completed — MM/DD/YY typed input -->
            <!-- WHAT: User can type date in MM/DD/YY, MM-DD-YY, or DD-Mon-YYYY format -->
            <!-- WHY: Matches the date input style used in VehicleRequestsView -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="dateAccomplishedDisplay"
                label="Date Completed (MM/DD/YY)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 04/24/26"
                autocomplete="off"
                hint="Auto-fills when status is set to Completed. You can change it."
                persistent-hint
                @input="onDateAccomplishedInput"
              />
            </v-col>
            <!-- WHY: Current Odometer removed — redundant with Previous Odometer -->
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
              <v-row density="comfortable">
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
              <v-row density="comfortable">
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
                <!-- WHY: Current Odometer removed — redundant with Previous Odometer -->
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
              <v-row density="comfortable">
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

    <!-- ── Schedule Next Maintenance Modal ── -->
    <!-- WHAT: Opens automatically when a record is marked as Completed -->
    <!-- WHY: Lets the user schedule the next maintenance cycle without -->
    <!--      manually opening Add PM Record and re-entering everything -->
    <v-dialog v-model="scheduleNextDialog" max-width="650" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0">
          <span class="text-h6">Schedule Next Maintenance</span>
        </v-card-title>

        <v-card-subtitle class="px-4 pb-2">
          <!-- Read-only chips showing what asset and service this is for -->
          <div class="d-flex ga-2 flex-wrap mt-1">
            <v-chip color="primary" size="small" variant="tonal">
              <v-icon start size="12">mdi-car</v-icon>
              {{ scheduleNextForm.asset_name }}
            </v-chip>
            <v-chip color="info" size="small" variant="tonal">
              <v-icon start size="12">mdi-wrench</v-icon>
              {{ scheduleNextForm.service_type_label }}
            </v-chip>
            <v-chip color="success" size="small" variant="tonal">
              <v-icon start size="12">mdi-calendar-clock</v-icon>
              Scheduled
            </v-chip>
          </div>
        </v-card-subtitle>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Last Date Performed — pre-filled from date_accomplished of completed record -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="scheduleNextForm.date_performed_display"
                label="Last Date Performed (MM/DD/YY)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 04/24/26"
                autocomplete="off"
                hint="Auto-filled from the completed record. You can change it."
                persistent-hint
                @input="onSNDatePerformedInput"
              />
            </v-col>

            <!-- Previous Odometer — Vehicle only -->
            <v-col cols="12" sm="6" v-if="scheduleNextForm.asset_type === 'Vehicle'">
              <v-text-field
                v-model="scheduleNextForm.odometer_display"
                label="Previous Odometer (km)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 43,117"
                autocomplete="off"
                @input="onSNOdometerInput"
                @blur="onSNOdometerBlur"
              />
            </v-col>

            <!-- Hours of Operation — Non-Vehicular only -->
            <v-col cols="12" sm="6" v-if="scheduleNextForm.asset_type === 'Non-Vehicular'">
              <v-text-field
                v-model="scheduleNextForm.hours_of_operation"
                label="Hours of Operation"
                variant="outlined"
                density="comfortable"
                type="number"
                placeholder="e.g. 250"
              />
            </v-col>

            <!-- Months Between Service -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="scheduleNextForm.months_between_service"
                label="Months Between Service"
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
                hint="From PM Program settings."
                persistent-hint
              />
            </v-col>

            <!-- KM Between Service — Vehicle only -->
            <v-col cols="12" sm="6" v-if="scheduleNextForm.asset_type === 'Vehicle'">
              <v-text-field
                v-model="scheduleNextForm.km_between_service_display"
                label="KM Between Service"
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
              />
            </v-col>

            <!-- Next Due Date — auto-calculated, editable -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="scheduleNextForm.next_due_date_display"
                label="Next Due Date (MM/DD/YY)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 10/24/26"
                autocomplete="off"
                @input="onSNNextDueDateInput"
              />
            </v-col>

            <!-- Next Due Odometer — Vehicle only, auto-calculated, editable -->
            <v-col cols="12" sm="6" v-if="scheduleNextForm.asset_type === 'Vehicle'">
              <v-text-field
                v-model="scheduleNextForm.next_due_odometer_display"
                label="Next Due Odometer (km)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 51,117"
                autocomplete="off"
                @input="onSNNextDueOdometerInput"
                @blur="onSNNextDueOdometerBlur"
              />
            </v-col>

            <v-col cols="12"><v-divider /></v-col>

            <!-- Conducted By -->
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="scheduleNextForm.conducted_by"
                :items="conductedByOptions"
                label="Conducted By"
                variant="outlined"
                density="comfortable"
                placeholder="Type or select name"
                clearable
                @update:modelValue="onConductedByUpdate"
              />
              <div v-if="getSavedOptions('conducted_by').length" class="d-flex flex-wrap ga-1 mt-1">
                <v-chip
                  v-for="opt in getSavedOptions('conducted_by')"
                  :key="opt.id"
                  size="small"
                  closable
                  @click:close="deleteDropdownOption(opt.id)"
                >
                  {{ opt.value }}
                </v-chip>
              </div>
            </v-col>

            <!-- Cost -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="scheduleNextForm.cost_display"
                label="Cost (₱)"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 1,500"
                autocomplete="off"
                @input="onSNCostInput"
                @blur="onSNCostBlur"
              />
            </v-col>

            <!-- Remarks -->
            <v-col cols="12">
              <v-textarea
                v-model="scheduleNextForm.remarks"
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
          <!-- Skip — keeps the Completed status, just doesn't create next record -->
          <v-btn variant="text" @click="scheduleNextDialog = false"> Skip for now </v-btn>
          <!-- Schedule Next — saves the new Scheduled record -->
          <v-btn
            color="primary"
            variant="flat"
            :loading="savingNext"
            prepend-icon="mdi-calendar-plus"
            @click="saveScheduleNext"
          >
            Schedule Next
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
// import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

// const router = useRouter()

// ---- DATA ----
const pmRecords = ref([])
const assetList = ref([])
const pmServiceTypes = ref([])

// WHY: Stores dropdown options for Conducted By, loaded from Supabase.
// CONNECTS TO: Same 'dropdown_options' table used by VehicleRequestsView.
const dropdownOptions = ref([])

async function fetchDropdownOptions() {
  const { data, error } = await supabase
    .from('dropdown_options')
    .select('*')
    .order('value', { ascending: true })
  if (!error) dropdownOptions.value = data
}

async function addDropdownOption(category, value) {
  const trimmed = value?.trim()
  if (!trimmed) return
  const exists = dropdownOptions.value.some(
    (o) => o.category === category && o.value.toLowerCase() === trimmed.toLowerCase(),
  )
  if (exists) return
  const { data, error } = await supabase
    .from('dropdown_options')
    .insert({ category, value: trimmed })
    .select()
    .single()
  if (!error && data) dropdownOptions.value.push(data)
}

async function deleteDropdownOption(id) {
  const { error } = await supabase.from('dropdown_options').delete().eq('id', id)
  if (!error) {
    dropdownOptions.value = dropdownOptions.value.filter((o) => o.id !== id)
  }
}
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref('All')
// WHY: Default is null = "All Years" so the user sees everything on first load.
//      Previously defaulted to current year which hid older records — this caused
//      the problem where records from the previous year were invisible.
const yearFilter = ref(null)

const yearOptions = computed(() => {
  const cur = new Date().getFullYear()
  // WHY: null value = "All Years" — must be first so it's the default visible option
  return [
    { title: 'All Years', value: null },
    { title: String(cur + 1), value: cur + 1 },
    { title: String(cur), value: cur },
    { title: String(cur - 1), value: cur - 1 },
    { title: String(cur - 2), value: cur - 2 },
  ]
})
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

// WHAT: Controls the "Schedule Next Maintenance" modal.
// WHY: Separate from formDialog so it doesn't conflict with the Add/Edit form.
const scheduleNextDialog = ref(false)

// WHAT: Holds the data for the next scheduled record being created.
// WHY: Separate from form so the main form stays clean.
const scheduleNextForm = ref({
  // Read-only display info (shown to user but not editable)
  asset_name: '',
  service_type_label: '',
  asset_type: 'Vehicle',

  // Editable fields
  vehicle_id: null,
  service_type: '',
  service_type_id: null,
  date_performed: '', // Last Date Performed = date_accomplished of completed record
  date_performed_display: '',
  odometer: null, // Previous Odometer
  odometer_display: '',
  hours_of_operation: null,
  km_between_service: null,
  km_between_service_display: '',
  months_between_service: null,
  next_due_date: '',
  next_due_date_display: '',
  next_due_odometer: null,
  next_due_odometer_display: '',
  cost: null,
  cost_display: '',
  conducted_by: '',
  remarks: '',
  status: 'Scheduled',
})
const savingNext = ref(false)

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
  // WHY: current_odometer removed — it was redundant with odometer (Previous Odometer).
  //      Both fields captured the same value with confusing different names.
  remarks: '',
  date_accomplished: null,
}
const form = ref({ ...defaultForm })
const errors = ref({})

// WHAT: Display variables for MM/DD/YY date fields.
// WHY: The form stores ISO dates (YYYY-MM-DD) for the database,
//      but the user types and sees MM/DD/YY.
const dateAccomplishedDisplay = ref('')

// WHAT: Converts user-typed dates into ISO format for the database.
// HANDLES: MM/DD/YY, MM/DD/YYYY, MM-DD-YY, DD-Mon-YYYY (e.g. 10-Jan-2023)
function parseFlexibleDate(val) {
  if (!val) return null
  const s = val.trim()
  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ]
  const alphaMatch = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/)
  if (alphaMatch) {
    const dd = alphaMatch[1].padStart(2, '0')
    const mo = monthNames.indexOf(alphaMatch[2].toLowerCase())
    if (mo === -1) return null
    const mm = String(mo + 1).padStart(2, '0')
    const yy = alphaMatch[3].length === 2 ? '20' + alphaMatch[3] : alphaMatch[3]
    const iso = `${yy}-${mm}-${dd}`
    return isNaN(new Date(iso).getTime()) ? null : iso
  }
  const parts = s.split(/[/-]/)
  if (parts.length === 3) {
    const mm = parts[0].padStart(2, '0')
    const dd = parts[1].padStart(2, '0')
    const yy = parts[2].length === 2 ? '20' + parts[2] : parts[2]
    const iso = `${yy}-${mm}-${dd}`
    return isNaN(new Date(iso).getTime()) ? null : iso
  }
  return null
}

// WHAT: Called every time the user types in the Date Completed field.
function onDateAccomplishedInput(e) {
  const val = e.target.value
  dateAccomplishedDisplay.value = val
  const iso = parseFlexibleDate(val)
  if (iso) form.value.date_accomplished = iso
}

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

// WHAT: Default technicians/shops for Conducted By in the PM module.
// WHY: Same list used in VehicleRequestsView Conducted By field.
const DEFAULT_CONDUCTED_BY = [
  'Vergilio P. Villamor Jr.',
  'Redline Auto Parts',
  'Torralba Metalcraft, Inc.',
  'Gv Diesel Calibration Center',
  'Toyota Butuan',
  'Oro Asian Automotive Center Corp.',
  'Allan Velmote',
]

// WHAT: Builds the Conducted By dropdown list — saved entries first, then defaults.
const conductedByOptions = computed(() => {
  const savedValues = dropdownOptions.value
    .filter((o) => o.category === 'conducted_by')
    .map((o) => o.value)
  const filteredDefaults = DEFAULT_CONDUCTED_BY.filter(
    (d) => !savedValues.some((s) => s.toLowerCase() === d.toLowerCase()),
  )
  return [...savedValues, ...filteredDefaults]
})

// WHAT: Returns only the saved (non-default) entries for the delete chip list.
function getSavedOptions(category) {
  return dropdownOptions.value.filter((o) => o.category === category)
}

// WHAT: Called when user picks or types in the Conducted By combobox.
// WHY: If the value is new, saves it to Supabase for next time.
async function onConductedByUpdate(value) {
  if (value === undefined || value === null) return
  const text = String(value).trim()
  if (!text) return
  const exists = conductedByOptions.value.some((o) => o.toLowerCase() === text.toLowerCase())
  if (!exists) {
    await addDropdownOption('conducted_by', text)
  }
}

// WHY: scheduledCount removed — replaced by date-based status summary cards

// WHY: completedCount removed — replaced by date-based status summary cards
// WHY: overdueCount removed — replaced by overdueMaintenanceCount (date-based)


// ── New date-based status logic ──
// WHAT: Computes a visual status for each Scheduled record based on next_due_date.
// WHY: The database status (Scheduled/Completed/Cancelled) is different from
//      the visual urgency status (Overdue/Due Today/Due Soon/OK).
// RULES:
//   1 day AFTER next_due_date  → 'overdue'   (Red)
//   Exactly ON next_due_date   → 'due-today' (Blue)
//   2 days BEFORE next_due_date → 'due-soon'  (Yellow)
//   Anything else              → 'ok'

function getDateStatus(record) {
  // Only Scheduled records have a meaningful due status
  if (record.status !== 'Scheduled') return 'ok'
  if (!record.next_due_date) return 'ok'

  const now = new Date(today)
  const due = new Date(record.next_due_date + 'T00:00:00')

  // Difference in whole days (positive = future, negative = past)
  const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue' // Past due date
  if (diffDays === 0) return 'due-today' // Exactly today
  if (diffDays <= 2) return 'due-soon' // Within 2 days
  return 'ok'
}

// WHAT: Summary card counts — only for Scheduled records
// WHY: Completed and Cancelled records are not actionable
const overdueMaintenanceCount = computed(
  () => pmRecords.value.filter((r) => getDateStatus(r) === 'overdue').length,
)
const dueTodayCount = computed(
  () => pmRecords.value.filter((r) => getDateStatus(r) === 'due-today').length,
)
const dueSoonCount = computed(
  () => pmRecords.value.filter((r) => getDateStatus(r) === 'due-soon').length,
)
const serviceTypeNames = computed(() => pmServiceTypes.value.map((s) => s.service_type))
const assetOptions = computed(() => ['All', ...assetList.value.map((a) => a.asset_name)])

// WHY: disabled and class are set directly on item objects instead of using
//      :item-props function — prevents Vuetify 4 virtual scroll render crash.
const groupedAssetItems = computed(() => {
  const vehicles = assetList.value.filter((a) => a.asset_type === 'Vehicle')
  const nonVehicles = assetList.value.filter((a) => a.asset_type === 'Non-Vehicular')
  const items = []

  if (vehicles.length > 0) {
    items.push({
      title: '── VEHICLES ──',
      value: '__header_vehicle__',
      disabled: true,
      class: 'text-primary font-weight-bold text-caption',
    })
    vehicles.forEach((v) => items.push({ title: v.asset_name, value: v.id }))
  }
  if (nonVehicles.length > 0) {
    items.push({
      title: '── NON-VEHICULAR ──',
      value: '__header_nonvehicle__',
      disabled: true,
      class: 'text-primary font-weight-bold text-caption',
    })
    nonVehicles.forEach((v) => items.push({ title: v.asset_name, value: v.id }))
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
  // WHY: Only filter by year if a specific year is selected.
  //      null means "All Years" — skip the filter entirely.
  if (yearFilter.value !== null) {
    result = result.filter((r) => {
      const yr = r.date_performed ? new Date(r.date_performed + 'T00:00:00').getFullYear() : null
      return yr === yearFilter.value
    })
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

//current odometer removed — redundant with odometer (Previous Odometer)
// function onCurrentOdometerInput(e) {
//   const raw = e.target.value.replace(/,/g, '')
//   if (!isNaN(raw) && raw !== '') {
//     form.value.current_odometer = Number(raw)
//   }
// }
// function onCurrentOdometerBlur() {
//   form.value.current_odometer_display = form.value.current_odometer
//     ? formatNumber(form.value.current_odometer)
//     : ''
// }

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
    // WHY: Also sync the display field so the user sees the auto-filled date
    dateAccomplishedDisplay.value = formatDate(today)
  }
}
// function itemProps(item) {
//   return {
//     disabled: item.isHeader,
//     class: item.isHeader ? 'text-primary font-weight-bold text-caption' : '',
//   }
// }

// WHY: isOverdue removed — replaced by getDateStatus which handles all
//      three states (overdue, due-today, due-soon) consistently.
//      Having two separate functions for the same concept caused conflicts.
function isOverdue(record) {
  return getDateStatus(record) === 'overdue'
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

// // WHAT: Returns a Vuetify color name for the date-based status.
// // CONNECTS TO: Used by the row highlight in the table.
// function dateStatusColor(record) {
//   const s = getDateStatus(record)
//   if (s === 'overdue') return 'error'
//   if (s === 'due-today') return 'primary'
//   if (s === 'due-soon') return 'warning'
//   return ''
// }

// WHAT: Returns an inline style object for the entire table row.
// WHY: Coloring the full row makes the urgency immediately visible
//      without needing to read the date column.
// Colors are intentionally light so text remains readable.
function getRowStyle(record) {
  const s = getDateStatus(record)
  if (s === 'overdue') return { backgroundColor: '#fff1f1' }   // light red
  if (s === 'due-today') return { backgroundColor: '#e3f2fd' } // light blue
  if (s === 'due-soon') return { backgroundColor: '#fffde7' }  // light yellow
  return {}
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
      // WHY: Clear KM fields — non-vehicular assets only use month intervals
      form.value.km_between_service = null
      form.value.km_between_service_display = ''
      // WHY: If a service type is already selected, re-run onServiceTypeSelected
      //      so it picks up the correct non-vehicular interval (months_between_service_nv)
      if (form.value.service_type) {
        onServiceTypeSelected(form.value.service_type)
      } else {
        form.value.months_between_service = null
      }
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
      // WHY: Non-vehicular — clear KM fields, use only the month interval
      form.value.km_between_service = null
      form.value.km_between_service_display = ''
      // WHY: Use months_between_service_nv — the dedicated non-vehicular interval
      //      set in PMProgramView. This replaces the old hardcoded 6-month default.
      form.value.months_between_service = match.months_between_service_nv || null
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
    .ilike('status', 'active') // WHY: ilike = case-insensitive match, catches 'active', 'Active', 'ACTIVE'
    .order('asset_type')
  if (!error) assetList.value = data
}

async function fetchPMServiceTypes() {
  const { data, error } = await supabase.from('pm_service_types').select('*').order('service_type')
  if (!error) pmServiceTypes.value = data
}

// WHAT: Placeholder for Add Year button.
function addYear() {
  showSnackbar('Add Year feature coming soon', 'info')
}

function openAddDialog() {
  isEditing.value = false
  selectedAssetType.value = 'Vehicle'
  form.value = { ...defaultForm, date_performed: today }
  errors.value = {}
  // WHY: Reset the date completed display when opening a fresh form
  dateAccomplishedDisplay.value = ''
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
    // WHY: current_odometer_display removed — field no longer exists in the form
  }
  errors.value = {}
  // WHY: Sync the date accomplished display field with the saved record value
  dateAccomplishedDisplay.value = record.date_accomplished
    ? formatDate(record.date_accomplished)
    : ''
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
    // WHY: current_odometer removed from payload — field no longer used
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

// WHAT: Computes Next Due Date given a date string and months interval.
// WHY: Reused by both the main form and the Schedule Next modal.
function computeNextDueDate(isoDate, months) {
  if (!isoDate || !months) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  const next = new Date(year, month - 1 + Number(months), day)
  const y = next.getFullYear()
  const m = String(next.getMonth() + 1).padStart(2, '0')
  const d = String(next.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// WHAT: Opens the Schedule Next Maintenance modal pre-filled from the
//       record that was just marked as Completed.
// WHY: Saves the user from manually opening Add PM Record and re-entering
//      all the same asset/service info for the next cycle.
async function openScheduleNextDialog(completedRecord) {
  // Step 1: Check if a Scheduled record already exists for this asset + service type
  // WHY: Prevent duplicate scheduled records
  const { data: existing } = await supabase
    .from('vehicle_pm_log')
    .select('id')
    .eq('vehicle_id', completedRecord.vehicle_id)
    .eq('service_type', completedRecord.service_type)
    .eq('status', 'Scheduled')
    .limit(1)

  if (existing && existing.length > 0) {
    showSnackbar(
      '⚠️ A scheduled record already exists for this service. Add manually if needed.',
      'warning',
    )
    return
  }

  // Step 2: Get the service type intervals from the PM program
  const serviceTypeRecord = pmServiceTypes.value.find(
    (s) => s.service_type === completedRecord.service_type,
  )

  // Step 3: Determine asset type for this record
  const assetType = completedRecord.asset_type || 'Vehicle'
  const isVehicle = assetType === 'Vehicle'

  // Step 4: Last Date Performed = Date Completed of the record just marked done
  const lastDatePerformed = completedRecord.date_accomplished || today

  // Step 5: Get the correct months interval
  // For non-vehicular, use months_between_service_nv; for vehicle use months_between_service
  const monthsInterval = isVehicle
    ? serviceTypeRecord?.months_between_service || completedRecord.months_between_service || null
    : serviceTypeRecord?.months_between_service_nv || completedRecord.months_between_service || null

  const kmInterval = isVehicle
    ? serviceTypeRecord?.km_between_service || completedRecord.km_between_service || null
    : null

  // Step 6: Calculate Next Due Date
  const nextDueDate = computeNextDueDate(lastDatePerformed, monthsInterval)

  // Step 7: Previous Odometer for the NEXT record =
  //         next_due_odometer of the record just completed.
  // WHY: This keeps the maintenance chain continuous and logical.
  //      The completed record's next_due_odometer is where the
  //      next service was predicted to happen — so that becomes
  //      the "Previous Odometer" when scheduling the next cycle.
  const previousOdometerForNext = isVehicle
    ? completedRecord.next_due_odometer || completedRecord.odometer || null
    : null

  // Step 8: Calculate Next Due Odometer for the new scheduled record
  const nextDueOdometer =
    isVehicle && previousOdometerForNext && kmInterval
      ? Number(previousOdometerForNext) + Number(kmInterval)
      : null

  // Step 9: Pre-fill the schedule next form
  scheduleNextForm.value = {
    // Read-only display
    asset_name: completedRecord.asset_name || getAssetName(completedRecord.vehicle_id),
    service_type_label: completedRecord.service_type,
    asset_type: assetType,

    // Data fields
    vehicle_id: completedRecord.vehicle_id,
    service_type: completedRecord.service_type,
    service_type_id: completedRecord.service_type_id || null,
    date_performed: lastDatePerformed,
    date_performed_display: formatDate(lastDatePerformed),
    odometer: previousOdometerForNext,
    odometer_display: previousOdometerForNext ? formatNumber(previousOdometerForNext) : '',

    hours_of_operation: completedRecord.hours_of_operation || null,
    km_between_service: kmInterval,
    km_between_service_display: kmInterval ? formatNumber(kmInterval) : '',
    months_between_service: monthsInterval,
    next_due_date: nextDueDate,
    next_due_date_display: nextDueDate ? formatDate(nextDueDate) : '',
    next_due_odometer: nextDueOdometer,
    next_due_odometer_display: nextDueOdometer ? formatNumber(nextDueOdometer) : '',
    cost: null,
    cost_display: '',
    conducted_by: '',
    remarks: '',
    status: 'Scheduled',
  }

  scheduleNextDialog.value = true
}

// WHAT: Saves the new scheduled record to the database.
// WHY: Called when user clicks "Schedule Next" in the modal.
async function saveScheduleNext() {
  savingNext.value = true

  const isVehicle = scheduleNextForm.value.asset_type === 'Vehicle'

  const payload = {
    vehicle_id: scheduleNextForm.value.vehicle_id,
    asset_type: scheduleNextForm.value.asset_type,
    service_type: scheduleNextForm.value.service_type,
    service_type_id: scheduleNextForm.value.service_type_id || null,
    date_performed: scheduleNextForm.value.date_performed || null,
    odometer: isVehicle ? scheduleNextForm.value.odometer || null : null,
    hours_of_operation: !isVehicle ? scheduleNextForm.value.hours_of_operation || null : null,
    km_between_service: isVehicle ? scheduleNextForm.value.km_between_service || null : null,
    months_between_service: scheduleNextForm.value.months_between_service || null,
    next_due_date: scheduleNextForm.value.next_due_date || null,
    next_due_odometer: isVehicle ? scheduleNextForm.value.next_due_odometer || null : null,
    conducted_by: scheduleNextForm.value.conducted_by || null,
    cost: scheduleNextForm.value.cost || null,
    remarks: scheduleNextForm.value.remarks || null,
    status: 'Scheduled',
    date_accomplished: null,
  }

  const { error } = await supabase.from('vehicle_pm_log').insert(payload)

  if (error) {
    showSnackbar('Failed to schedule next maintenance', 'error')
  } else {
    showSnackbar('Next maintenance scheduled successfully', 'success')
    scheduleNextDialog.value = false
    await fetchRecords()
  }

  savingNext.value = false
}

// WHAT: Input handlers for the Schedule Next modal fields.
// WHY: Same comma-format and date-parse behavior as the main form.
function onSNDatePerformedInput(e) {
  const val = e.target.value
  scheduleNextForm.value.date_performed_display = val
  const iso = parseFlexibleDate(val)
  if (iso) {
    scheduleNextForm.value.date_performed = iso
    // Recalculate next due date when last date performed changes
    const nextDue = computeNextDueDate(iso, scheduleNextForm.value.months_between_service)
    if (nextDue) {
      scheduleNextForm.value.next_due_date = nextDue
      scheduleNextForm.value.next_due_date_display = formatDate(nextDue)
    }
  }
}

function onSNNextDueDateInput(e) {
  const val = e.target.value
  scheduleNextForm.value.next_due_date_display = val
  const iso = parseFlexibleDate(val)
  if (iso) scheduleNextForm.value.next_due_date = iso
}

function onSNOdometerInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    scheduleNextForm.value.odometer = Number(raw)
    // WHY: Update display immediately as user types so it doesn't look stale
    scheduleNextForm.value.odometer_display = Number(raw).toLocaleString()
    // Recalculate next due odometer
    if (scheduleNextForm.value.km_between_service) {
      scheduleNextForm.value.next_due_odometer =
        Number(raw) + Number(scheduleNextForm.value.km_between_service)
      scheduleNextForm.value.next_due_odometer_display = formatNumber(
        scheduleNextForm.value.next_due_odometer
      )
    }
  }
}

function onSNOdometerBlur() {
  scheduleNextForm.value.odometer_display = scheduleNextForm.value.odometer
    ? formatNumber(scheduleNextForm.value.odometer)
    : ''
}

function onSNNextDueOdometerInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    scheduleNextForm.value.next_due_odometer = Number(raw)
  }
}

function onSNNextDueOdometerBlur() {
  scheduleNextForm.value.next_due_odometer_display = scheduleNextForm.value.next_due_odometer
    ? formatNumber(scheduleNextForm.value.next_due_odometer)
    : ''
}

function onSNCostInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    scheduleNextForm.value.cost = Number(raw)
    scheduleNextForm.value.cost_display = formatNumber(Number(raw))
  }
}

function onSNCostBlur() {
  scheduleNextForm.value.cost_display = scheduleNextForm.value.cost
    ? formatNumber(scheduleNextForm.value.cost)
    : ''
}

async function quickUpdateStatus(item, newStatus) {
  const payload = { status: newStatus }

  // WHY: Auto-fill date_accomplished when marking as Completed
  if (newStatus === 'Completed' && !item.date_accomplished) {
    payload.date_accomplished = today
  }

  const { error } = await supabase.from('vehicle_pm_log').update(payload).eq('id', item.id)

  if (error) {
    showSnackbar('Failed to update status', 'error')
    return
  }

  // Update the local record immediately so the table reflects the change
  item.status = newStatus
  if (payload.date_accomplished) item.date_accomplished = payload.date_accomplished
  showSnackbar('Status updated', 'success')

  // WHY: Only open the Schedule Next modal when marking as Completed.
  //      Other status changes (Scheduled, Cancelled) don't need it.
  if (newStatus === 'Completed') {
    // Pass the updated item (with date_accomplished set) to the modal
    await openScheduleNextDialog({
      ...item,
      date_accomplished: payload.date_accomplished || item.date_accomplished,
    })
  }
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// ---- LIFECYCLE ----
onMounted(async () => {
  await fetchAssets()
  await fetchDropdownOptions()
  await fetchPMServiceTypes()
  await fetchRecords()
})
</script>
