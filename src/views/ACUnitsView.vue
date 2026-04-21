<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold">AC Unit Registry</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Manage all air conditioner units across {{ buildings.length }} building{{
                buildings.length !== 1 ? 's' : ''
              }}
            </p>
          </div>
          <div class="d-flex ga-2 flex-wrap">
            <v-btn color="secondary" variant="outlined" prepend-icon="mdi-table-plus" @click="openBulkDialog">
              Bulk Add Rooms
            </v-btn>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
              Add AC Unit
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row class="mb-4">
      <!-- Card 1: Total with type breakdown -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border height="100%">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar color="primary" variant="tonal" size="40">
                <v-icon size="20">mdi-air-conditioner</v-icon>
              </v-avatar>
              <div>
                <p class="text-medium-emphasis text-body-2" style="line-height:1.2">Total AC Units</p>
                <p class="text-h5 font-weight-bold" style="line-height:1.2">{{ filteredUnits.length }}</p>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px">
              <div class="d-flex align-center justify-space-between" style="gap:4px">
                <span class="text-caption text-medium-emphasis" style="white-space:nowrap">Floor-Mntd</span>
                <span class="text-caption font-weight-bold text-primary">{{ filteredTypeCount('Floor-Mounted') }}</span>
              </div>
              <div class="d-flex align-center justify-space-between" style="gap:4px">
                <span class="text-caption text-medium-emphasis" style="white-space:nowrap">Wall-Mntd</span>
                <span class="text-caption font-weight-bold text-info">{{ filteredTypeCount('Wall-Mounted') }}</span>
              </div>
              <div class="d-flex align-center justify-space-between" style="gap:4px">
                <span class="text-caption text-medium-emphasis" style="white-space:nowrap">Window</span>
                <span class="text-caption font-weight-bold text-warning">{{ filteredTypeCount('Window Type') }}</span>
              </div>
              <div class="d-flex align-center justify-space-between" style="gap:4px">
                <span class="text-caption text-medium-emphasis" style="white-space:nowrap">Ceiling</span>
                <span class="text-caption font-weight-bold" style="color:#7c3aed">{{ filteredTypeCount('Ceiling Type') }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Card 2: Active / Inactive breakdown -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border height="100%">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar color="success" variant="tonal" size="40">
                <v-icon size="20">mdi-check-circle</v-icon>
              </v-avatar>
              <div>
                <p class="text-medium-emphasis text-body-2" style="line-height:1.2">Status</p>
                <p class="text-h5 font-weight-bold" style="line-height:1.2">{{ filteredActiveCount }} active</p>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px">
              <div class="d-flex align-center justify-space-between" style="gap:4px">
                <span class="text-caption text-medium-emphasis">Inactive</span>
                <span class="text-caption font-weight-bold text-grey">{{ filteredStatusCount('Inactive') }}</span>
              </div>

              <div class="d-flex align-center justify-space-between" style="gap:4px">
                <span class="text-caption text-medium-emphasis">Decommissioned</span>
                <span class="text-caption font-weight-bold text-error">{{ filteredStatusCount('Decommissioned') }}</span>
              </div>
              <div class="d-flex align-center justify-space-between" style="gap:4px">
                <span class="text-caption text-medium-emphasis" style="white-space:nowrap">Has History</span>
                <span class="text-caption font-weight-bold" style="color:#F59E0B">{{ filteredTransferHistoryCount }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Card 3: Buildings count -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border height="100%">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar color="info" variant="tonal" size="40">
                <v-icon size="20">mdi-office-building</v-icon>
              </v-avatar>
              <div>
                <p class="text-medium-emphasis text-body-2" style="line-height:1.2">Buildings</p>
                <p class="text-h5 font-weight-bold" style="line-height:1.2">{{ filteredBuildingCount }}</p>
              </div>
            </div>
            <p class="text-caption text-medium-emphasis">
              {{ buildingFilter === 'All' ? 'All registered buildings' : 'Filtered: ' + buildingFilter }}
            </p>
            <p class="text-caption text-medium-emphasis mt-1">
              {{ buildings.length }} total building{{ buildings.length !== 1 ? 's' : '' }} registered
            </p>
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
          <v-col cols="12" sm="2">
            <v-select
              v-model="unitTypeFilter"
              :items="['All', ...unitTypes]"
              label="Unit Type"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="2">
            <v-select
              v-model="statusFilter"
              :items="['All', 'Active', 'Inactive', 'Decommissioned', 'Has Transfer History']"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="2" class="d-flex justify-end align-center">
            <span class="text-caption text-medium-emphasis">
              Showing {{ filteredUnits.length }} of {{ acUnits.length }} units
            </span>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <div class="d-flex align-center justify-space-between mb-2 flex-wrap ga-2">
          <p class="text-caption text-medium-emphasis">
            Click any row to view details · Double-click to edit
          </p>

        </div>
        <v-data-table
          :headers="headers"
          :items="filteredUnits"
          :loading="loading"
          loading-text="Loading AC units..."
          no-data-text="No AC units found"
          items-per-page="10"
          rounded="lg"
          :custom-key-sort="{ ac_identification_code: (a, b) => acCodeSort(a, b) }"
:sort-by="[{ key: 'ac_identification_code', order: 'asc' }]"
must-sort
          :row-props="
            ({ item }) => ({
              style: {
                cursor: 'pointer',
                borderLeft: transferredUnitIds.has(item.id)
                  ? '4px solid #F59E0B'
                  : '4px solid transparent',
                background: transferredUnitIds.has(item.id)
                  ? 'rgba(245,158,11,0.06)'
                  : '',
              },
              onClick: () => viewUnit(item),
              onDblclick: () => openEditDialog(item),
            })
          "
        >
          <!-- AC Identification Code Column -->
          <template v-slot:item.ac_identification_code="{ item }">
            <div class="d-flex align-center ga-1">
              <span class="font-weight-medium text-mono">
                {{ item.ac_identification_code || '—' }}
              </span>
              <v-tooltip
                v-if="transferredUnitIds.has(item.id)"
                text="This unit has been transferred"
                location="top"
              >
                <template v-slot:activator="{ props }">
                  <v-icon
                    v-bind="props"
                    size="14"
                    color="warning"
                    style="opacity:0.85"
                  >mdi-swap-horizontal-circle</v-icon>
                </template>
              </v-tooltip>
            </div>
          </template>
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

          <!-- Status Column — inline quick-change -->
          <template v-slot:item.status="{ item }">
            <v-menu location="bottom start" :close-on-content-click="true">
              <template v-slot:activator="{ props }">
                <v-chip
                  v-bind="props"
                  :color="statusColor(item.status)"
                  size="small"
                  variant="tonal"
                  append-icon="mdi-chevron-down"
                  style="cursor:pointer"
                  @click.stop
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <v-list density="compact" min-width="160">
                <v-list-item
                  v-for="s in ['Active', 'Inactive', 'Decommissioned']"
                  :key="s"
                  :value="s"
                  @click.stop="quickUpdateStatus(item, s)"
                >
                  <template v-slot:prepend>
                    <v-icon size="14" :color="statusColor(s)" class="mr-1">mdi-circle</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">{{ s }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <v-tooltip text="Transfer unit" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-swap-horizontal"
                  size="small"
                  variant="text"
                  color="warning"
                  @click.stop="openTransferDialog(item)"
                />
              </template>
            </v-tooltip>
            <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click.stop="openEditDialog(item)" />
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click.stop="openDeleteDialog(item)" />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- ===================== -->
    <!-- Add / Edit Dialog     -->
    <!-- ===================== -->
    <v-dialog v-model="formDialog" max-width="650" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0">
          <span class="text-h6">
            {{ isEditing ? 'Edit AC Unit' : 'Add AC Unit' }}
          </span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.building"
                :items="buildings"
                label="Building *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.building"
                hint="Select or type a new building"
                persistent-hint
              />
            </v-col>
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
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.ac_identification_code"
                label="AC Identification Code"
                variant="outlined"
                density="comfortable"
                hint="Auto-generated — you may edit if needed"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.brand"
                :items="brandOptions"
                label="Brand / Make"
                variant="outlined"
                density="comfortable"
                hint="Select or type your own"
                persistent-hint
                clearable
                @keydown.enter="onBrandUpdate(form.brand)"
                @blur="onBrandUpdate(form.brand)"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="form.capacity"
                :items="capacityOptions"
                label="Capacity"
                variant="outlined"
                density="comfortable"
                hint="Select or type your own"
                persistent-hint
                clearable
                @keydown.enter="onCapacityUpdate(form.capacity)"
                @blur="onCapacityUpdate(form.capacity)"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.technology"
                :items="['Inverter', 'Non-Inverter']"
                label="Technology"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.serial_no_indoor"
                label="Serial No. (Indoor)"
                variant="outlined"
                density="comfortable"
                placeholder="Indoor unit serial number"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.serial_no_outdoor"
                label="Serial No. (Outdoor)"
                variant="outlined"
                density="comfortable"
                placeholder="Outdoor unit serial number"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="['Active', 'Inactive', 'Transferred', 'Decommissioned']"
                label="Status"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
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

    <!-- ===================== -->
    <!-- View Details Dialog   -->
    <!-- ===================== -->
    <v-dialog v-model="viewDialog" max-width="700">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0 d-flex align-center justify-space-between">
          <span class="text-h6">AC Unit Details</span>
          <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
        </v-card-title>

        <v-card-text class="pa-4" v-if="selectedUnit">
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
              subtitle="AC Identification Code"
              :title="selectedUnit.ac_identification_code || '—'"
            />
            <v-list-item subtitle="Brand / Make" :title="selectedUnit.brand || '—'" />
            <v-list-item subtitle="Capacity" :title="selectedUnit.capacity || '—'" />
            <v-list-item subtitle="Technology" :title="selectedUnit.technology || '—'" />
            <v-list-item
              subtitle="Serial No. (Indoor)"
              :title="selectedUnit.serial_no_indoor || '—'"
            />
            <v-list-item
              subtitle="Serial No. (Outdoor)"
              :title="selectedUnit.serial_no_outdoor || '—'"
            />
            <v-list-item subtitle="Remarks" :title="selectedUnit.remarks || '—'" />
          </v-list>

          <!-- Transfer History Section -->
          <v-divider class="my-4" />
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon color="warning" size="20">mdi-swap-horizontal</v-icon>
            <span class="text-subtitle-2 font-weight-bold">Transfer History</span>
            <v-chip size="x-small" color="warning" variant="tonal">
              {{ transferHistory.length }} transfer{{ transferHistory.length !== 1 ? 's' : '' }}
            </v-chip>
          </div>

          <!-- Loading state -->
          <div v-if="loadingHistory" class="d-flex align-center ga-2 py-2">
            <v-progress-circular size="18" width="2" indeterminate color="warning" />
            <span class="text-caption text-medium-emphasis">Loading history...</span>
          </div>

          <!-- Empty state -->
          <div
            v-else-if="transferHistory.length === 0"
            class="text-center py-3"
          >
            <v-icon color="grey-lighten-1" size="36">mdi-map-marker-path</v-icon>
            <p class="text-caption text-medium-emphasis mt-1">
              No transfers recorded for this unit.
            </p>
          </div>

          <!-- Timeline -->
          <v-timeline
            v-else
            density="compact"
            side="end"
            truncate-line="both"
          >
            <!-- Current location (always shown at top) -->
            <v-timeline-item
              dot-color="success"
              size="small"
              icon="mdi-map-marker"
            >
              <div class="d-flex align-center ga-2 flex-wrap mb-1">
                <v-chip size="x-small" color="success" variant="flat">Current Location</v-chip>
              </div>
              <p class="text-body-2 font-weight-medium">
                {{ selectedUnit.building }} · {{ selectedUnit.floor }} · {{ selectedUnit.area_room }}
              </p>
            </v-timeline-item>

            <!-- Past transfers (most recent first) -->
            <v-timeline-item
              v-for="log in transferHistory"
              :key="log.id"
              dot-color="warning"
              size="small"
              icon="mdi-swap-horizontal"
            >
              <div class="d-flex align-center ga-2 flex-wrap mb-1">
                <span class="text-caption text-medium-emphasis">
                  {{ formatDate(log.transferred_at) }}
                </span>
              </div>
              <p class="text-body-2">
                <span class="text-medium-emphasis">From:</span>
                {{ log.from_building }} · {{ log.from_floor }} · {{ log.from_room }}
              </p>
              <p class="text-body-2">
                <span class="text-medium-emphasis">To:</span>
                {{ log.to_building }} · {{ log.to_floor }} · {{ log.to_room }}
              </p>
              <p v-if="log.remarks" class="text-caption text-medium-emphasis mt-1">
                {{ log.remarks }}
              </p>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn
            color="warning"
            variant="outlined"
            size="large"
            prepend-icon="mdi-swap-horizontal"
            class="flex-grow-1"
            @click="viewDialog = false; openTransferDialog(selectedUnit)"
          >
            Transfer
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            prepend-icon="mdi-pencil"
            class="flex-grow-1"
            @click="viewDialog = false; openEditDialog(selectedUnit)"
          >
            Edit Record
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            size="large"
            prepend-icon="mdi-delete"
            class="flex-grow-1"
            @click="viewDialog = false; openDeleteDialog(selectedUnit)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===================== -->
    <!-- Transfer Dialog       -->
    <!-- ===================== -->
    <v-dialog v-model="transferDialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0 d-flex align-center ga-2">
          <v-icon color="warning">mdi-swap-horizontal</v-icon>
          <span class="text-h6">Transfer AC Unit</span>
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- From (read-only summary) -->
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            icon="mdi-map-marker"
            class="mb-4"
          >
            <strong>Moving from:</strong>
            {{ selectedUnit?.building }} · {{ selectedUnit?.floor }} · {{ selectedUnit?.area_room }}
            <span v-if="selectedUnit?.ac_identification_code" class="text-caption d-block mt-1">
              {{ selectedUnit.ac_identification_code }}
            </span>
          </v-alert>

          <!-- To (editable) -->
          <p class="text-subtitle-2 font-weight-bold mb-3">New Location</p>
          <v-row>
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="transferForm.to_building"
                :items="buildings"
                label="Building *"
                variant="outlined"
                density="comfortable"
                :error-messages="transferErrors.to_building"
                hint="Select or type a new building"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="transferForm.to_floor"
                :items="floors"
                label="Floor *"
                variant="outlined"
                density="comfortable"
                :error-messages="transferErrors.to_floor"
                hint="Select or type your own"
                persistent-hint
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="transferForm.to_room"
                label="Area / Room *"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. Conference Room A, Lobby"
                :error-messages="transferErrors.to_room"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="transferForm.transferred_at"
                label="Date of Transfer"
                variant="outlined"
                density="comfortable"
                type="date"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="transferForm.remarks"
                label="Reason / Remarks"
                variant="outlined"
                density="comfortable"
                rows="2"
                placeholder="e.g. Relocated due to renovation"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeTransferDialog">Cancel</v-btn>
          <v-btn
            color="warning"
            variant="flat"
            :loading="transferring"
            prepend-icon="mdi-swap-horizontal"
            @click="saveTransfer"
          >
            Confirm Transfer
          </v-btn>
        </v-card-actions>
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
            <strong>{{ selectedUnit?.area_room }}</strong>? This cannot be undone.
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

    <!-- Bulk Add Rooms Dialog -->
    <v-dialog v-model="bulkDialog" max-width="650" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">
          <v-icon start color="primary">mdi-table-plus</v-icon>
          Bulk Add Rooms
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Select a building and floor, then type one room name per line. All rooms will share the same unit type, brand, capacity, and technology.
          </p>
          <v-alert type="info" variant="tonal" density="compact" class="mb-4" icon="mdi-information-outline">
            AC Identification Codes will be auto-generated for each room. Serial numbers can be filled in later by editing each unit individually.
          </v-alert>
          <v-row>
            <v-col cols="12" sm="6">
              <v-combobox v-model="bulk.building" :items="buildings" label="Building *"
                variant="outlined" density="comfortable" :error-messages="bulkErrors.building"
                hint="Select or type a new building" persistent-hint />
            </v-col>
            <v-col cols="12" sm="6">
              <v-combobox v-model="bulk.floor" :items="floors" label="Floor *"
                variant="outlined" density="comfortable" :error-messages="bulkErrors.floor"
                hint="Select or type your own" persistent-hint />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="bulk.rooms" label="Room Names * (one per line)"
                variant="outlined" density="comfortable" rows="5" :error-messages="bulkErrors.rooms"
                placeholder="e.g.&#10;Server Room&#10;Conference Room A&#10;Lobby&#10;Faculty Office"
                hint="Each line becomes one AC unit entry" persistent-hint />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="bulk.unit_type" :items="unitTypes" label="Unit Type *"
                variant="outlined" density="comfortable" :error-messages="bulkErrors.unit_type" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="bulk.technology" :items="['Inverter', 'Non-Inverter']"
                label="Technology" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-combobox v-model="bulk.brand" :items="brandOptions" label="Brand / Make"
                variant="outlined" density="comfortable" hint="Optional — applies to all rooms" persistent-hint />
            </v-col>
            <v-col cols="12" sm="6">
              <v-combobox v-model="bulk.capacity" :items="capacityOptions" label="Capacity"
                variant="outlined" density="comfortable" hint="Optional — applies to all rooms" persistent-hint />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="bulkDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="bulkSaving" prepend-icon="mdi-check" @click="saveBulk">
            Add {{ bulk.rooms ? bulk.rooms.split('\n').filter(r => r.trim()).length : 0 }} Rooms
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
const statusFilter = ref('All')
const unitTypeFilter = ref('All')

// ---- DROPDOWN OPTIONS ----
const buildings = ref([])
const floors = ref([])
const unitTypes = ['Floor-Mounted', 'Wall-Mounted', 'Window Type', 'Ceiling Type']

const DEFAULT_BRANDS = [
  'Midea', 'Koppel', 'Matrix', 'Gen. Royal', 'Daikin',
  'Samsung', 'Kolin', 'Carrier', 'Sharp', 'LG', 'Condura',
]
const DEFAULT_CAPACITIES = ['1.0 HP', '1.5 HP', '2.0 HP', '2.5 HP', '3.0 TR', '3.0 HP', '5.0 TR']

const dropdownOptions = ref([])

async function fetchDropdownOptions() {
  const { data, error } = await supabase
    .from('dropdown_options')
    .select('*')
    .order('value', { ascending: true })
  if (!error) dropdownOptions.value = data || []
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

const brandOptions = computed(() => {
  const saved = dropdownOptions.value.filter((o) => o.category === 'ac_brand').map((o) => o.value)
  const defaults = DEFAULT_BRANDS.filter(
    (d) => !saved.some((s) => s.toLowerCase() === d.toLowerCase()),
  )
  return [...saved, ...defaults]
})

const capacityOptions = computed(() => {
  const saved = dropdownOptions.value.filter((o) => o.category === 'ac_capacity').map((o) => o.value)
  const defaults = DEFAULT_CAPACITIES.filter(
    (d) => !saved.some((s) => s.toLowerCase() === d.toLowerCase()),
  )
  return [...saved, ...defaults]
})

async function onBrandUpdate(value) {
  if (!value) return
  const text = String(value).trim()
  if (!text) return
  const exists = brandOptions.value.some((o) => o.toLowerCase() === text.toLowerCase())
  if (!exists) await addDropdownOption('ac_brand', text)
}

async function onCapacityUpdate(value) {
  if (!value) return
  const text = String(value).trim()
  if (!text) return
  const exists = capacityOptions.value.some((o) => o.toLowerCase() === text.toLowerCase())
  if (!exists) await addDropdownOption('ac_capacity', text)
}

// ---- DIALOGS ----
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const transferDialog = ref(false)
const isEditing = ref(false)
const selectedUnit = ref(null)

// ---- TRANSFER ----
const transferring = ref(false)
const transferHistory = ref([])
const loadingHistory = ref(false)

const defaultTransferForm = {
  to_building: '',
  to_floor: '',
  to_room: '',
  transferred_at: new Date().toISOString().split('T')[0],
  remarks: '',
}
const transferForm = ref({ ...defaultTransferForm })
const transferErrors = ref({})

function openTransferDialog(unit) {
  selectedUnit.value = unit
  transferForm.value = { ...defaultTransferForm }
  transferErrors.value = {}
  transferDialog.value = true
}

function closeTransferDialog() {
  transferDialog.value = false
  transferForm.value = { ...defaultTransferForm }
  transferErrors.value = {}
}

function validateTransferForm() {
  transferErrors.value = {}
  if (!transferForm.value.to_building?.trim()) transferErrors.value.to_building = 'Building is required'
  if (!transferForm.value.to_floor?.trim()) transferErrors.value.to_floor = 'Floor is required'
  if (!transferForm.value.to_room?.trim()) transferErrors.value.to_room = 'Area / Room is required'

  // Prevent transferring to the exact same location
  const u = selectedUnit.value
  if (
    transferForm.value.to_building?.trim() === u?.building &&
    transferForm.value.to_floor?.trim() === u?.floor &&
    transferForm.value.to_room?.trim() === u?.area_room
  ) {
    transferErrors.value.to_room = 'New location must be different from current location'
  }

  return Object.keys(transferErrors.value).length === 0
}

async function saveTransfer() {
  if (!validateTransferForm()) return

  transferring.value = true
  const unit = selectedUnit.value

  // 1. Log the transfer
  const { error: logError } = await supabase.from('ac_transfer_log').insert({
    ac_unit_id: unit.id,
    from_building: unit.building,
    from_floor: unit.floor,
    from_room: unit.area_room,
    to_building: transferForm.value.to_building.trim(),
    to_floor: transferForm.value.to_floor.trim(),
    to_room: transferForm.value.to_room.trim(),
    transferred_at: transferForm.value.transferred_at,
    remarks: transferForm.value.remarks?.trim() || null,
  })

  if (logError) {
    showSnackbar('Failed to log transfer: ' + logError.message, 'error')
    transferring.value = false
    return
  }

  // 2. Update the unit's current location
  const { error: updateError } = await supabase
    .from('ac_units')
    .update({
      building: transferForm.value.to_building.trim(),
      floor: transferForm.value.to_floor.trim(),
      area_room: transferForm.value.to_room.trim(),
      status: 'Active',
    })
    .eq('id', unit.id)

  if (updateError) {
    showSnackbar('Transfer logged but unit location not updated: ' + updateError.message, 'error')
  } else {
    showSnackbar(
      `AC unit transferred to ${transferForm.value.to_building} · ${transferForm.value.to_room}`,
      'success',
    )
    closeTransferDialog()
    await fetchUnits()
    await fetchTransferredIds()
  }

  transferring.value = false
}

async function fetchTransferHistory(unitId) {
  loadingHistory.value = true
  transferHistory.value = []
  const { data, error } = await supabase
    .from('ac_transfer_log')
    .select('*')
    .eq('ac_unit_id', unitId)
    .order('transferred_at', { ascending: false })
  if (!error) transferHistory.value = data || []
  loadingHistory.value = false
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ---- FORM ----
const defaultForm = {
  building: '',
  floor: '',
  area_room: '',
  unit_type: '',
  ac_identification_code: '',
  brand: '',
  capacity: '',
  technology: 'Inverter',
  serial_no_indoor: '',
  serial_no_outdoor: '',
  status: 'Active',
  remarks: '',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ---- SNACKBAR ----
const snackbar = ref({ show: false, message: '', color: 'success' })

// ---- TABLE HEADERS ----
const headers = [
  { title: 'AC Code', key: 'ac_identification_code', sortable: true },
  { title: 'Building', key: 'building', sortable: true },
  { title: 'Floor', key: 'floor', sortable: true },
  { title: 'Area / Room', key: 'area_room', sortable: true },
  { title: 'Unit Type', key: 'unit_type', sortable: true },
  { title: 'Brand', key: 'brand', sortable: false },
  { title: 'Capacity', key: 'capacity', sortable: false },
  { title: 'Technology', key: 'technology', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// Numeric sort for AC codes like AC-001, AC-002 … AC-020
function acCodeSort(a, b) {
  const extract = (v) => {
    const m = String(v || '').match(/(\d+)$/)
    return m ? parseInt(m[1], 10) : 0
  }
  return extract(a) - extract(b)
}

// Set of unit IDs that have at least one transfer log entry
const transferredUnitIds = ref(new Set())

async function fetchTransferredIds() {
  const { data, error } = await supabase
    .from('ac_transfer_log')
    .select('ac_unit_id')
  if (!error && data) {
    transferredUnitIds.value = new Set(data.map((r) => r.ac_unit_id))
  }
}

// ---- COMPUTED ----
function filteredTypeCount(type) {
  return filteredUnits.value.filter((u) => u.unit_type === type).length
}
const filteredActiveCount = computed(
  () => filteredUnits.value.filter((u) => u.status === 'Active').length,
)
function filteredStatusCount(status) {
  return filteredUnits.value.filter((u) => u.status === status).length
}
const filteredBuildingCount = computed(
  () => new Set(filteredUnits.value.map((u) => u.building).filter(Boolean)).size,
)

const filteredTransferHistoryCount = computed(
  () => filteredUnits.value.filter((u) => transferredUnitIds.value.has(u.id)).length,
)

// ---- BULK ADD ----
const bulkDialog = ref(false)
const bulkSaving = ref(false)
const bulkErrors = ref({})
const bulk = ref({
  building: '', floor: '', rooms: '', unit_type: '',
  technology: 'Inverter', brand: '', capacity: '',
})

function openBulkDialog() {
  bulk.value = { building: '', floor: '', rooms: '', unit_type: '', technology: 'Inverter', brand: '', capacity: '' }
  bulkErrors.value = {}
  bulkDialog.value = true
}

async function saveBulk() {
  bulkErrors.value = {}
  if (!bulk.value.building?.trim()) bulkErrors.value.building = 'Building is required'
  if (!bulk.value.floor?.trim()) bulkErrors.value.floor = 'Floor is required'
  if (!bulk.value.unit_type) bulkErrors.value.unit_type = 'Unit type is required'
  const roomLines = (bulk.value.rooms || '').split('\n').map((r) => r.trim()).filter(Boolean)
  if (!roomLines.length) bulkErrors.value.rooms = 'Enter at least one room name'
  if (Object.keys(bulkErrors.value).length) return

  bulkSaving.value = true

  if (!buildings.value.includes(bulk.value.building)) {
    await supabase.from('buildings').insert({ name: bulk.value.building })
    await fetchBuildings()
  }
  if (!floors.value.includes(bulk.value.floor)) {
    await supabase.from('floors').insert({ name: bulk.value.floor })
    await fetchFloors()
  }

  const rows = roomLines.map((room) => ({
    building: bulk.value.building,
    floor: bulk.value.floor,
    area_room: room,
    unit_type: bulk.value.unit_type,
    technology: bulk.value.technology,
    brand: bulk.value.brand || null,
    capacity: bulk.value.capacity || null,
    status: 'Active',
  }))

  const { error } = await supabase.from('ac_units').insert(rows)
  if (error) {
    showSnackbar('Failed to add rooms: ' + error.message, 'error')
  } else {
    showSnackbar(`${rows.length} room${rows.length !== 1 ? 's' : ''} added successfully`, 'success')
    bulkDialog.value = false
    await fetchUnits()
  }
  bulkSaving.value = false
}

// Full filter (table)
const filteredUnits = computed(() => {
  // Default sort: AC code numerically (AC-001 before AC-002 … AC-020)
  let result = [...acUnits.value].sort(acCodeSort)
  if (buildingFilter.value !== 'All') {
    result = result.filter((u) => u.building === buildingFilter.value)
  }
  if (unitTypeFilter.value !== 'All') {
    result = result.filter((u) => u.unit_type === unitTypeFilter.value)
  }
  if (statusFilter.value === 'Has Transfer History') {
    result = result.filter((u) => transferredUnitIds.value.has(u.id))
  } else if (statusFilter.value !== 'All') {
    result = result.filter((u) => u.status === statusFilter.value)
  }
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(
      (u) =>
        u.ac_identification_code?.toLowerCase().includes(s) ||
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
async function fetchBuildings() {
  const { data, error } = await supabase.from('buildings').select('name').order('name')
  if (!error) buildings.value = data.map((b) => b.name)
}

async function fetchFloors() {
  const { data, error } = await supabase.from('floors').select('name').order('name')
  if (!error) floors.value = data.map((f) => f.name)
}

async function fetchUnits() {
  loading.value = true
  const { data, error } = await supabase
    .from('ac_units')
    .select('*')
    .order('building', { ascending: true })
  if (error) showSnackbar('Failed to load AC units', 'error')
  else acUnits.value = data
  loading.value = false
}

async function generateNextCode() {
  const codes = acUnits.value
    .map((u) => u.ac_identification_code)
    .filter((c) => c && /^AC-\d+$/.test(c))
    .map((c) => parseInt(c.replace('AC-', ''), 10))
  const highest = codes.length ? Math.max(...codes) : 0
  return `AC-${String(highest + 1).padStart(3, '0')}`
}

async function openAddDialog() {
  isEditing.value = false
  form.value = { ...defaultForm }
  form.value.ac_identification_code = await generateNextCode()
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

async function viewUnit(unit) {
  selectedUnit.value = unit
  viewDialog.value = true
  await fetchTransferHistory(unit.id)
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
  return Object.keys(errors.value).length === 0
}

async function saveUnit() {
  if (!validateForm()) return

  if (!buildings.value.includes(form.value.building)) {
    await supabase.from('buildings').insert({ name: form.value.building })
    await fetchBuildings()
  }
  if (!floors.value.includes(form.value.floor)) {
    await supabase.from('floors').insert({ name: form.value.floor })
    await fetchFloors()
  }

  saving.value = true
  const payload = {
    building: form.value.building,
    floor: form.value.floor,
    area_room: form.value.area_room,
    unit_type: form.value.unit_type,
    ac_identification_code: form.value.ac_identification_code || null,
    brand: form.value.brand,
    capacity: form.value.capacity,
    technology: form.value.technology,
    serial_no_indoor: form.value.serial_no_indoor || null,
    serial_no_outdoor: form.value.serial_no_outdoor || null,
    status: form.value.status,
    remarks: form.value.remarks,
  }

  if (isEditing.value) {
    const { error } = await supabase.from('ac_units').update(payload).eq('id', form.value.id)
    if (error) showSnackbar('Failed to update AC unit', 'error')
    else {
      showSnackbar('AC unit updated successfully', 'success')
      closeFormDialog()
      await fetchUnits()
    }
  } else {
    const { error } = await supabase.from('ac_units').insert(payload)
    if (error) showSnackbar('Failed to add AC unit', 'error')
    else {
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
  if (error) showSnackbar('Failed to delete AC unit', 'error')
  else {
    showSnackbar('AC unit deleted successfully', 'success')
    deleteDialog.value = false
    await fetchUnits()
  }
  deleting.value = false
}

async function quickUpdateStatus(unit, newStatus) {
  const { error } = await supabase
    .from('ac_units')
    .update({ status: newStatus })
    .eq('id', unit.id)
  if (error) {
    showSnackbar('Failed to update status', 'error')
  } else {
    unit.status = newStatus
    showSnackbar(`Status updated to ${newStatus}`, 'success')
  }
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// ---- LIFECYCLE ----
onMounted(async () => {
  await fetchDropdownOptions()
  await fetchBuildings()
  await fetchFloors()
  await fetchUnits()
  await fetchTransferredIds()
})
</script>
