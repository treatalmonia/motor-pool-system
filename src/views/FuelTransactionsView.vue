<template>
  <v-container fluid>
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <h2 class="text-h5 font-weight-bold">Fuel Transactions</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Encode fuel withdrawals from hard copy invoices
            </p>
          </div>
          <div class="d-flex ga-2 flex-wrap align-center">
            <v-select
              v-model="filterYear"
              :items="availableYears"
              label="Year"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 110px"
              @update:modelValue="onYearChange"
            />
            <v-btn
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-calendar-plus"
              @click="openAddYearDialog"
            >
              Add Year
            </v-btn>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
              Add Transaction
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
              <v-icon>mdi-receipt-text</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Transactions</p>
              <p class="text-h5 font-weight-bold">{{ transactions.length }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="blue-darken-2" variant="tonal" size="44">
              <v-icon>mdi-fuel</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Diesel (L)</p>
              <p class="text-h5 font-weight-bold">{{ formatNumber(totalDiesel) }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="green-darken-2" variant="tonal" size="44">
              <v-icon>mdi-gas-station</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Gasoline (L)</p>
              <p class="text-h5 font-weight-bold">{{ formatNumber(totalGasoline) }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="orange-darken-2" variant="tonal" size="44">
              <v-icon>mdi-cash-multiple</v-icon>
            </v-avatar>
            <div>
              <p class="text-medium-emphasis text-body-2">Total Amount</p>
              <p class="text-h5 font-weight-bold">₱{{ formatNumber(totalAmount) }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card rounded="lg" elevation="0" border class="mb-4 pa-3">
      <div class="d-flex ga-3 flex-wrap align-center">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search OR#, PO#, vehicle, account code, utilized by..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="min-width: 260px"
        />
        <v-select
          v-model="filterAssetType"
          :items="['All Types', 'Vehicular', 'Non-Vehicular']"
          label="Asset Type"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 140px"
        />
        <v-select
          v-model="filterPeriod"
          :items="['All Periods', ...billingPeriods]"
          label="Billing Period"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 200px"
        />
        <v-select
          v-model="filterFuel"
          :items="['All Types', 'Diesel', 'Gasoline']"
          label="Fuel Type"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 130px"
        />
        <v-select
          v-model="filterFund"
          :items="['All Funds', ...availableFunds]"
          label="Fund"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 120px"
        />
        <v-spacer />
        <p class="text-medium-emphasis text-body-2 text-no-wrap">
          {{ filteredTransactions.length }} of {{ transactions.length }}
        </p>
      </div>
    </v-card>

    <!-- Transactions Table -->
    <v-card rounded="lg" elevation="0" border>
      <p class="text-caption text-medium-emphasis px-4 pt-3 pb-1">
        Click any row to view details · Double-click to edit
      </p>
      <v-data-table
        :headers="headers"
        :items="filteredTransactions"
        :loading="loading"
        items-per-page="15"
        :row-props="
          ({ item }) => ({
            style: { cursor: 'pointer' },
            onClick: () => openViewDialog(item),
            onDblclick: () => openEditDialog(item),
          })
        "
      >
        <!-- Date -->
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <!-- Fuel Type chip -->
        <template #item.fuel_type="{ item }">
          <v-chip
            :color="item.fuel_type === 'Diesel' ? 'blue-darken-2' : 'green-darken-2'"
            variant="tonal"
            size="small"
            class="font-weight-bold"
          >
            {{ item.fuel_type }}
          </v-chip>
        </template>

        <!-- Quantity -->
        <template #item.quantity="{ item }"> {{ formatNumber(item.quantity) }} L </template>

        <!-- Unit Price -->
        <template #item.unit_price="{ item }"> ₱{{ formatNumber(item.unit_price) }} </template>

        <!-- Total Amount -->
        <template #item.total_amount="{ item }">
          <span class="font-weight-medium">₱{{ formatNumber(item.total_amount) }}</span>
        </template>

        <!-- Fund -->
        <template #item.fund_cluster="{ item }">
          <v-chip
            :color="fundColor(item.fund_cluster)"
            variant="tonal"
            size="small"
            class="font-weight-bold"
          >
            {{ item.fund_cluster }}
          </v-chip>
        </template>

        <!-- Billing Period -->
        <template #item.billing_period="{ item }">
          <span class="text-caption">{{ item.billing_period }}</span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center">
            <v-btn
              icon="mdi-pencil"
              size="x-small"
              variant="text"
              color="primary"
              @click.stop="openEditDialog(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="x-small"
              variant="text"
              color="error"
              @click.stop="openDeleteDialog(item)"
            />
          </div>
        </template>

        <template #no-data>
          <div class="pa-8 text-center">
            <v-icon size="56" color="grey-lighten-1">mdi-receipt-text-outline</v-icon>
            <p class="mt-3 text-medium-emphasis">No transactions found.</p>
            <v-btn color="primary" class="mt-3" @click="openAddDialog">
              Add First Transaction
            </v-btn>
          </div>
        </template>

        <template #body.append>
          <tr
            v-if="filteredTransactions.length > 0"
            style="background: var(--v-theme-surface); border-top: 2px solid rgba(0, 0, 0, 0.12)"
          >
            <td colspan="4" style="padding: 10px 14px; font-size: 12px; font-weight: 600">
              Totals ({{ filteredTransactions.length }} records)
            </td>
            <td style="padding: 10px 14px; text-align: right; font-size: 12px; font-weight: 700">
              {{ formatNumber(filteredTransactions.reduce((s, t) => s + (t.quantity || 0), 0)) }} L
            </td>
            <td style="padding: 10px 14px"></td>
            <td
              style="
                padding: 10px 14px;
                text-align: right;
                font-size: 12px;
                font-weight: 700;
                color: #e65100;
              "
            >
              ₱{{
                formatNumber(filteredTransactions.reduce((s, t) => s + (t.total_amount || 0), 0))
              }}
            </td>
            <td colspan="4" style="padding: 10px 14px"></td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <!-- ── ADD / EDIT DIALOG ── -->
    <v-dialog v-model="formDialog" max-width="760" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">
          <v-icon start :color="isEditing ? 'primary' : 'success'">
            {{ isEditing ? 'mdi-pencil' : 'mdi-plus-circle' }}
          </v-icon>
          {{ isEditing ? 'Edit Transaction' : 'Add Transaction' }}
          <v-chip size="small" variant="tonal" color="primary" class="ml-2">
            FY {{ filterYear }}
          </v-chip>
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-4">
          <v-row>
            <!-- ── SECTION 1: Receipt Details ── -->
            <v-col cols="12">
              <p class="text-body-2 font-weight-medium text-medium-emphasis mb-1">
                <v-icon size="16" class="mr-1">mdi-receipt</v-icon>
                Receipt Details
              </p>
            </v-col>

            <!-- Date -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.date_display"
                label="Date *"
                variant="outlined"
                density="comfortable"
                placeholder="MM/DD/YY"
                :error-messages="errors.date"
                @blur="onDateBlur"
              />
            </v-col>
            <!-- OR Number -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.or_number"
                label="OR Number *"
                variant="outlined"
                density="comfortable"
                placeholder="e.g. 30221"
                :error-messages="errors.or_number"
              />
            </v-col>
            <!-- Billing Period -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.billing_period"
                label="Billing Period"
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
                hint="Auto-detected from date"
                persistent-hint
              />
            </v-col>

            <!-- ── SECTION 2: Fuel Details ── -->
            <v-col cols="12">
              <v-divider class="mb-1" />
              <p class="text-body-2 font-weight-medium text-medium-emphasis my-2">
                <v-icon size="16" class="mr-1">mdi-fuel</v-icon>
                Fuel Details
              </p>
            </v-col>

            <!-- Fuel Type -->
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.fuel_type"
                :items="['Diesel', 'Gasoline']"
                label="Fuel Type *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.fuel_type"
              />
            </v-col>
            <!-- Quantity -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.quantity_display"
                label="Quantity (Liters) *"
                variant="outlined"
                density="comfortable"
                suffix="L"
                :error-messages="errors.quantity"
                @input="onQuantityInput"
                @blur="onQuantityBlur"
              />
            </v-col>
            <!-- Unit -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.unit"
                label="Unit"
                variant="outlined"
                density="comfortable"
                placeholder="LTRS."
              />
            </v-col>

            <!-- Unit Price -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.unit_price_display"
                label="Unit Price (₱/L) *"
                variant="outlined"
                density="comfortable"
                prefix="₱"
                hint="No VAT — enter base price only"
                persistent-hint
                :error-messages="errors.unit_price"
                @input="onUnitPriceInput"
                @blur="onUnitPriceBlur"
              />
            </v-col>
            <!-- Total Amount -->
            <v-col cols="12">
              <v-card rounded="lg" variant="tonal" color="grey" class="pa-3">
                <div class="d-flex align-center justify-space-between">
                  <p class="text-body-2 text-medium-emphasis">Total amount due</p>
                  <p class="text-h5 font-weight-bold">₱{{ form.total_amount_display || '0.00' }}</p>
                </div>
              </v-card>
            </v-col>

            <!-- ── SECTION 3: Vehicle / Equipment ── -->
            <v-col cols="12">
              <v-divider class="mb-1" />
              <p class="text-body-2 font-weight-medium text-medium-emphasis my-2">
                <v-icon size="16" class="mr-1">mdi-car</v-icon>
                Vehicle / Equipment
              </p>
            </v-col>

            <v-col cols="12">
              <v-btn-toggle
                v-model="form.utilization_type"
                mandatory
                rounded="lg"
                density="compact"
                color="primary"
              >
                <v-btn value="Vehicular" prepend-icon="mdi-car"> Vehicular </v-btn>
                <v-btn value="Non-Vehicular" prepend-icon="mdi-tractor">
                  Non-vehicular equipment
                </v-btn>
              </v-btn-toggle>
            </v-col>

            <!-- Vehicle / Equipment -->
            <v-col cols="12" sm="4">
              <v-combobox
                v-model="form.vehicle"
                :items="vehicleOptions"
                :label="form.utilization_type === 'Non-Vehicular' ? 'Equipment *' : 'Vehicle *'"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.vehicle"
                :placeholder="
                  form.utilization_type === 'Non-Vehicular'
                    ? 'e.g. FARMALL, BRUSHCUTTER, GENERATOR'
                    : 'e.g. COASTER, FORTUNER, VAN'
                "
              />
            </v-col>

            <!-- Plate Number -->
            <v-col v-if="form.utilization_type !== 'Non-Vehicular'" cols="12" sm="4">
              <v-text-field
                v-model="form.plate_number"
                label="Plate Number"
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
                hint="Auto-filled from fleet data"
                persistent-hint
              />
            </v-col>

            <!-- Utilized By — save/delete pattern like Conducted By in VehiclePMView -->
            <v-col cols="12" :sm="form.utilization_type !== 'Non-Vehicular' ? 4 : 8">
              <v-combobox
                v-model="form.utilized_by"
                :items="utilizedByOptions"
                label="Utilized By (Office) *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.utilized_by"
                placeholder="e.g. HRMO, ECO, CAA"
                clearable
                @update:modelValue="onUtilizedByUpdate"
              />
              <!-- Saved custom entries with delete button -->
              <div v-if="getSavedOptions('utilized_by').length" class="d-flex flex-wrap ga-1 mt-1">
                <v-chip
                  v-for="opt in getSavedOptions('utilized_by')"
                  :key="opt.id"
                  size="small"
                  closable
                  @click:close="deleteDropdownOption(opt.id)"
                >
                  {{ opt.value }}
                </v-chip>
              </div>
            </v-col>

            <!-- ── SECTION 4: Charge To ── -->
            <v-col cols="12">
              <v-divider class="mb-1" />
              <p class="text-body-2 font-weight-medium text-medium-emphasis my-2">
                <v-icon size="16" class="mr-1">mdi-file-document</v-icon>
                Charge To
              </p>
            </v-col>

            <!-- Charge To autocomplete -->
            <v-col cols="12">
              <p class="text-caption text-medium-emphasis mb-1">
                Search by cost center name, PO number, or account code. Only showing FY
                {{ filterYear }} contracts.
              </p>
              <v-autocomplete
                v-model="form.contract_id"
                :items="filteredContractOptions"
                item-title="label"
                item-value="id"
                label="Fuel Charge To (Cost Center) *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.contract_id"
                :disabled="filteredContractOptions.length === 0"
                :hint="contractBalanceHint"
                persistent-hint
                clearable
                no-data-text="No contracts found for this year"
                @update:modelValue="onContractSelected"
              >
                <template #item="{ props, item }">
                  <v-list-item v-if="item.raw" v-bind="props" :title="undefined">
                    <template #prepend>
                      <v-chip
                        :color="fundColor(item.raw.fund_cluster)"
                        variant="tonal"
                        size="x-small"
                        class="mr-2 font-weight-bold"
                      >
                        {{ item.raw.fund_cluster }}
                      </v-chip>
                    </template>
                    <v-list-item-title class="text-body-2">
                      {{ item.raw.fund_cluster }} — {{ item.raw.account_code }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption">
                      {{ item.raw.po_number }}
                    </v-list-item-subtitle>
                    <template #append>
                      <span
                        class="text-caption font-weight-medium"
                        :class="item.raw.balance < 0 ? 'text-error' : 'text-success'"
                      >
                        {{ item.raw.balance < 0 ? '−' : '' }}₱{{
                          formatNumber(Math.abs(item.raw.balance))
                        }}
                        left
                      </span>
                    </template>
                  </v-list-item>
                  <v-list-item v-else v-bind="props" />
                </template>
              </v-autocomplete>

              <!-- Balance summary line -->
              <p v-if="form.contract_id && selectedContractSummary" class="text-caption mt-1">
                Balance:
                <span
                  :class="selectedContractSummary.balance < 0 ? 'text-error' : 'text-success'"
                  class="font-weight-medium"
                >
                  {{ selectedContractSummary.balance < 0 ? '−' : '' }}₱{{
                    formatNumber(Math.abs(selectedContractSummary.balance))
                  }}
                </span>
              </p>
            </v-col>

            <!-- PO Number — auto-filled, read-only, visible for ISO form reference -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.po_number"
                label="PO Number"
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
                hint="Auto-filled from selected contract"
                persistent-hint
              />
            </v-col>

            <!-- Fuel Charge To label — shows fund + account code for ISO form reference -->
            <v-col cols="12" sm="6">
              <v-text-field
                :model-value="
                  selectedContractSummary
                    ? selectedContractSummary.fund_cluster +
                      ' — ' +
                      selectedContractSummary.account_code
                    : ''
                "
                label="Fuel Charge To"
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
                hint="Auto-filled from selected contract"
                persistent-hint
              />
            </v-col>

            <!-- Remarks -->
            <v-col cols="12">
              <v-text-field
                v-model="form.remarks"
                label="Remarks (optional)"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveTransaction">
            {{ isEditing ? 'Save Changes' : 'Add Transaction' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── VIEW DIALOG ── -->
    <v-dialog v-model="viewDialog" max-width="560">
      <v-card rounded="lg" v-if="selectedTx">
        <v-card-title class="pa-4 pb-2 d-flex align-center justify-space-between">
          <span>Transaction Details</span>
          <v-chip
            :color="selectedTx.fuel_type === 'Diesel' ? 'blue-darken-2' : 'green-darken-2'"
            variant="tonal"
            size="small"
            class="font-weight-bold"
          >
            {{ selectedTx.fuel_type }}
          </v-chip>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <!-- Invoice Info -->
          <v-card rounded="lg" variant="tonal" color="grey" class="pa-3 mb-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">INVOICE</p>
            <v-row density="comfortable">
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Date</p>
                <p class="font-weight-medium">{{ formatDate(selectedTx.date) }}</p>
              </v-col>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">OR Number</p>
                <p class="font-weight-medium">{{ selectedTx.or_number }}</p>
              </v-col>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Billing Period</p>
                <p class="font-weight-medium text-caption">{{ selectedTx.billing_period }}</p>
              </v-col>
            </v-row>
          </v-card>
          <!-- Fuel Info -->
          <v-card rounded="lg" variant="tonal" color="blue" class="pa-3 mb-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">FUEL</p>
            <v-row density="comfortable">
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Quantity</p>
                <p class="font-weight-bold">{{ formatNumber(selectedTx.quantity) }} L</p>
              </v-col>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Unit Price</p>
                <p class="font-weight-medium">₱{{ formatNumber(selectedTx.unit_price) }}</p>
              </v-col>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Total Amount</p>
                <p class="font-weight-bold text-orange-darken-3">
                  ₱{{ formatNumber(selectedTx.total_amount) }}
                </p>
              </v-col>
            </v-row>
          </v-card>
          <!-- Usage Info -->
          <v-card rounded="lg" variant="tonal" color="green" class="pa-3 mb-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">USAGE</p>
            <v-row density="comfortable">
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Vehicle / Equipment</p>
                <p class="font-weight-medium">{{ selectedTx.vehicle }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Utilized By</p>
                <p class="font-weight-medium">{{ selectedTx.utilized_by }}</p>
              </v-col>
            </v-row>
          </v-card>
          <!-- Charge Info -->
          <v-card rounded="lg" variant="tonal" color="orange" class="pa-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">CHARGED TO</p>
            <v-row density="comfortable">
              <v-col cols="12">
                <p class="text-caption text-medium-emphasis">Fuel Charge To</p>
                <p class="font-weight-medium">
                  {{ selectedTx.fund_cluster }} — {{ selectedTx.account_code }}
                </p>
              </v-col>
              <v-col cols="12" class="mt-1">
                <p class="text-caption text-medium-emphasis">PO Number</p>
                <p class="font-weight-medium">{{ selectedTx.po_number }}</p>
              </v-col>
            </v-row>
          </v-card>
          <div v-if="selectedTx.remarks" class="mt-3">
            <p class="text-caption text-medium-emphasis">Remarks</p>
            <p class="text-body-2">{{ selectedTx.remarks }}</p>
          </div>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            prepend-icon="mdi-pencil"
            class="flex-grow-1"
            @click="viewDialog = false; openEditDialog(selectedTx)"
          >
            Edit Record
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            size="large"
            prepend-icon="mdi-delete"
            class="flex-grow-1"
            @click="viewDialog = false; openDeleteDialog(selectedTx)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── DELETE DIALOG ── -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-5 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete Transaction?</h3>
          <p class="text-medium-emphasis">
            Delete OR# <strong>{{ selectedTx?.or_number }}</strong
            >? This cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteTx">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── ADD YEAR DIALOG ── -->
    <v-dialog v-model="addYearDialog" max-width="360">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-0">
          <v-icon start>mdi-calendar-plus</v-icon>
          Add New Year
        </v-card-title>
        <v-card-text class="pa-4">
          <v-text-field
            v-model="newYear"
            label="Year"
            variant="outlined"
            density="comfortable"
            type="number"
            placeholder="e.g. 2027"
            hint="Starts blank with no data"
            persistent-hint
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="addYearDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="confirmAddYear">Add Year</v-btn>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'

const route = useRoute()

// ── STATE ──
const transactions = ref([])
const contracts = ref([])
const assets = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const filterYear = ref(new Date().getFullYear())
const addYearDialog = ref(false)
const newYear = ref(new Date().getFullYear() + 1)
const availableYears = ref([new Date().getFullYear()])
const search = ref('')
const filterPeriod = ref('All Periods')
const filterFuel = ref('All Types')
const filterFund = ref('All Funds')
const filterAssetType = ref('All Types')

// ── DIALOGS ──
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const selectedTx = ref(null)

// ── FORM ──
const defaultForm = {
  date: '',
  date_display: '',
  or_number: '',
  billing_period: '',
  fuel_type: 'Diesel',
  quantity: 0,
  quantity_display: '',
  unit: 'LTRS.',
  unit_price: 0,
  unit_price_display: '',
  total_amount: 0,
  total_amount_display: '',
  vehicle: '',
  utilization_type: 'Vehicular',
  plate_number: '',
  utilized_by: '',
  fund_cluster: '',
  contract_id: null,
  po_number: '',
  account_code: '',
  remarks: '',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ── SNACKBAR ──
const snackbar = ref({ show: false, message: '', color: 'success' })

// ── TABLE HEADERS ──
const headers = [
  { title: 'Date', key: 'date', width: '90px' },
  { title: 'OR #', key: 'or_number', width: '80px' },
  { title: 'Billing Period', key: 'billing_period', width: '150px' },
  { title: 'Type', key: 'fuel_type', width: '80px' },
  { title: 'Qty (L)', key: 'quantity', align: 'end', width: '80px' },
  { title: 'Unit Price', key: 'unit_price', align: 'end', width: '90px' },
  { title: 'Total Amt.', key: 'total_amount', align: 'end', width: '100px' },
  { title: 'Vehicle / Equip.', key: 'vehicle', width: '140px' },
  { title: 'Utilized By', key: 'utilized_by', width: '120px' },
  { title: 'Fund', key: 'fund_cluster', width: '70px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: '100px' },
]

// ── BILLING PERIODS ──
const MONTH_NAMES = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
]

function getBillingPeriod(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const month = MONTH_NAMES[d.getMonth()]
  const day = d.getDate()
  const year = d.getFullYear()
  const lastDay = new Date(year, d.getMonth() + 1, 0).getDate()
  if (day <= 15) return `${month} 1-15, ${year}`
  return `${month} 16-${lastDay}, ${year}`
}

const billingPeriods = computed(() => {
  const set = new Set(transactions.value.map((t) => t.billing_period).filter(Boolean))
  return [...set].sort((a, b) => {
    const rank = (p) => {
      const parts = p.split(', ')
      const year = parseInt(parts[1]) || 0
      const monthPart = parts[0]?.split(' ')[0] || ''
      const monthIdx = MONTH_NAMES.indexOf(monthPart)
      const isSecondHalf = parts[0]?.includes('16') ? 1 : 0
      return year * 1000 + monthIdx * 2 + isSecondHalf
    }
    return rank(a) - rank(b)
  })
})

// ── DROPDOWN OPTIONS (save/delete pattern) ──
const dropdownOptions = ref([])

const DEFAULT_UTILIZED_BY = [
  'OPQMS',
  'VPRIE',
  'OAS',
  'CAA',
  'MAPX',
  'RDPO',
  'HRMO',
  'ECO',
  'CAO',
  'SUPPLY OFFICE',
  'PROCUREMENT OFFICE',
  'OFFICE OF THE PRESIDENT',
  'EXTENSION SERVICES',
  'RESEARCH SERVICES',
  'ICT OFFICE',
  'REGISTRAR',
  'GUIDANCE AND COUNSELING',
  'NSTP',
  'CULTURE AND ARTS',
  'SOM',
]

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

async function deleteDropdownOption(id) {
  const { error } = await supabase.from('dropdown_options').delete().eq('id', id)
  if (!error) dropdownOptions.value = dropdownOptions.value.filter((o) => o.id !== id)
}

function getSavedOptions(category) {
  return dropdownOptions.value.filter((o) => o.category === category)
}

const utilizedByOptions = computed(() => {
  const saved = dropdownOptions.value
    .filter((o) => o.category === 'utilized_by')
    .map((o) => o.value)
  const defaults = DEFAULT_UTILIZED_BY.filter(
    (d) => !saved.some((s) => s.toLowerCase() === d.toLowerCase()),
  )
  return [...saved, ...defaults]
})

async function onUtilizedByUpdate(value) {
  if (!value) return
  // Saving deferred to saveTransaction to avoid storing partial keystrokes
}

// ── COMPUTED ──
const filteredTransactions = computed(() => {
  return transactions.value.filter((t) => {
    const matchSearch =
      !search.value ||
      [t.or_number, t.vehicle, t.utilized_by, t.account_code, t.po_number].some((f) =>
        f?.toLowerCase().includes(search.value.toLowerCase()),
      )
    const matchPeriod =
      filterPeriod.value === 'All Periods' || t.billing_period === filterPeriod.value
    const matchFuel = filterFuel.value === 'All Types' || t.fuel_type === filterFuel.value
    const matchFund = filterFund.value === 'All Funds' || t.fund_cluster === filterFund.value
    const matchAssetType =
      filterAssetType.value === 'All Types' || t.utilization_type === filterAssetType.value
    return matchSearch && matchPeriod && matchFuel && matchFund && matchAssetType
  })
})

const totalDiesel = computed(() =>
  filteredTransactions.value
    .filter((t) => t.fuel_type === 'Diesel')
    .reduce((s, t) => s + (t.quantity || 0), 0),
)

const totalGasoline = computed(() =>
  filteredTransactions.value
    .filter((t) => t.fuel_type === 'Gasoline')
    .reduce((s, t) => s + (t.quantity || 0), 0),
)

const totalAmount = computed(() =>
  filteredTransactions.value.reduce((s, t) => s + (t.total_amount || 0), 0),
)

const availableFunds = computed(() =>
  [...new Set(contracts.value.map((c) => c.fund_cluster).filter(Boolean))].sort(),
)

const contractsWithBalance = computed(() => {
  const consumedMap = new Map()
  transactions.value.forEach((t) => {
    if (!t.contract_id) return
    const prev = consumedMap.get(t.contract_id) || 0
    consumedMap.set(t.contract_id, prev + (t.total_amount || 0))
  })
  return contracts.value.map((c) => {
    const consumed = consumedMap.get(c.id) || 0
    const balance = (c.contract_amount || 0) - consumed
    return { ...c, consumed, balance }
  })
})

const filteredContractOptions = computed(() => {
  return contractsWithBalance.value
    .filter((c) => {
      const matchYear = c.year === filterYear.value
      const matchFund = !form.value.fund_cluster || c.fund_cluster === form.value.fund_cluster
      return matchYear && matchFund
    })
    .map((c) => ({
      id: c.id,
      label: `[${c.fund_cluster}] ${c.account_code} — ${c.po_number}`,
      po_number: c.po_number,
      fund_cluster: c.fund_cluster,
      account_code: c.account_code,
      balance: c.balance,
      contract_amount: c.contract_amount,
    }))
})

const contractBalanceHint = computed(() => {
  if (!form.value.contract_id) return 'Only showing FY ' + filterYear.value + ' contracts'
  return ''
})

const selectedContractSummary = computed(() => {
  if (!form.value.contract_id) return null
  const contract = filteredContractOptions.value.find((c) => c.id === form.value.contract_id)
  if (!contract) return null
  const currentTxAmount = isEditing.value ? selectedTx.value?.total_amount || 0 : 0
  const pendingAmount = form.value.total_amount || 0
  const adjustedBalance = contract.balance + currentTxAmount - pendingAmount
  return { ...contract, balance: adjustedBalance }
})

const vehicleOptions = computed(() => {
  const fromAssets = assets.value.map((a) => a.asset_name)
  const fromTx = [...new Set(transactions.value.map((t) => t.vehicle).filter(Boolean))]
  return [...new Set([...fromAssets, ...fromTx])].sort()
})

// ── FETCH ──
async function fetchAvailableYears() {
  const { data } = await supabase.from('fuel_transactions').select('date').order('date')
  if (data && data.length > 0) {
    const years = [...new Set(data.map((r) => new Date(r.date).getFullYear()))]
    const allYears = [...new Set([...years, new Date().getFullYear()])].sort()
    availableYears.value = allYears
  }
}

async function fetchTransactions() {
  loading.value = true
  const startDate = `${filterYear.value}-01-01`
  const endDate = `${filterYear.value}-12-31`
  const { data, error } = await supabase
    .from('fuel_transactions')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('or_number', { ascending: false })
  if (error) showSnackbar('Failed to load transactions', 'error')
  else transactions.value = data
  loading.value = false
}

async function fetchContracts() {
  const { data } = await supabase
    .from('fuel_contracts')
    .select('*')
    .eq('year', filterYear.value)
    .order('fund_cluster')
    .order('account_code')
  if (data) contracts.value = data
}

async function fetchAssets() {
  const { data } = await supabase
    .from('vehicles')
    .select('asset_name, asset_type, plate_number')
    .eq('status', 'Active')
    .order('asset_name')
  if (data) assets.value = data
}

async function onYearChange() {
  await Promise.all([fetchTransactions(), fetchContracts()])
}

function openAddYearDialog() {
  newYear.value = new Date().getFullYear() + 1
  addYearDialog.value = true
}

function confirmAddYear() {
  const y = Number(newYear.value)
  if (!y || y < 2000 || y > 2100) return
  if (!availableYears.value.includes(y)) {
    availableYears.value = [...availableYears.value, y].sort()
  }
  filterYear.value = y
  addYearDialog.value = false
  onYearChange()
}

// ── DIALOGS ──
function openAddDialog() {
  isEditing.value = false
  form.value = { ...defaultForm }
  errors.value = {}
  formDialog.value = true
}

function openEditDialog(tx) {
  isEditing.value = true
  selectedTx.value = tx
  form.value = {
    ...tx,
    date_display: formatDate(tx.date),
    quantity_display: formatNumberExact(tx.quantity),
    unit_price_display: formatNumberExact(tx.unit_price),
    total_amount_display: formatNumberExact(tx.total_amount),
  }
  errors.value = {}
  formDialog.value = true
}

function openViewDialog(tx) {
  selectedTx.value = tx
  viewDialog.value = true
}

function openDeleteDialog(tx) {
  selectedTx.value = tx
  deleteDialog.value = true
}

function closeFormDialog() {
  formDialog.value = false
  form.value = { ...defaultForm }
  errors.value = {}
}

// ── FORM HANDLERS ──
function onDateBlur() {
  const val = form.value.date_display?.trim()
  if (!val) return
  const parts = val.split('/')
  if (parts.length === 3) {
    const mm = parts[0].padStart(2, '0')
    const dd = parts[1].padStart(2, '0')
    const yy = parts[2].length === 2 ? '20' + parts[2] : parts[2]
    form.value.date = `${yy}-${mm}-${dd}`
    form.value.billing_period = getBillingPeriod(form.value.date)
  }
}

function onContractSelected(id) {
  const contract = filteredContractOptions.value.find((c) => c.id === id)
  if (contract) {
    form.value.po_number = contract.po_number
    form.value.fund_cluster = contract.fund_cluster
    form.value.account_code = contract.account_code
  } else {
    form.value.po_number = ''
    form.value.fund_cluster = ''
    form.value.account_code = ''
  }
}

function recalcTotal() {
  const qty = form.value.quantity || 0
  const price = form.value.unit_price || 0
  form.value.total_amount = Math.round(qty * price * 100) / 100
  form.value.total_amount_display = formatNumberExact(form.value.total_amount)
}

function onQuantityInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    form.value.quantity = parseFloat(raw)
    recalcTotal()
  }
}
function onQuantityBlur() {
  form.value.quantity_display =
    form.value.quantity != null ? formatNumberExact(form.value.quantity) : ''
}

function onUnitPriceInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    form.value.unit_price = parseFloat(raw)
    recalcTotal()
  }
}
function onUnitPriceBlur() {
  form.value.unit_price_display =
    form.value.unit_price != null ? formatNumberExact(form.value.unit_price) : ''
}

// ── VALIDATION ──
function validateForm() {
  errors.value = {}
  if (!form.value.date) errors.value.date = 'Required (MM/DD/YY)'
  if (!form.value.or_number?.trim()) errors.value.or_number = 'Required'
  if (!form.value.fuel_type) errors.value.fuel_type = 'Required'
  if (!form.value.quantity || form.value.quantity <= 0)
    errors.value.quantity = 'Must be greater than 0'
  if (!form.value.unit_price || form.value.unit_price <= 0)
    errors.value.unit_price = 'Must be greater than 0'
  if (!form.value.vehicle?.trim()) errors.value.vehicle = 'Required'
  if (!form.value.utilized_by?.trim()) errors.value.utilized_by = 'Required'
  if (!form.value.contract_id) errors.value.contract_id = 'Select a cost center to charge'
  return Object.keys(errors.value).length === 0
}

// ── SAVE ──
async function saveTransaction() {
  if (!validateForm()) return
  saving.value = true
  const payload = {
    date: form.value.date,
    or_number: form.value.or_number,
    billing_period: form.value.billing_period || getBillingPeriod(form.value.date),
    fuel_type: form.value.fuel_type,
    quantity: form.value.quantity,
    unit: form.value.unit || 'LTRS.',
    unit_price: form.value.unit_price,
    total_amount: form.value.total_amount,
    vehicle: form.value.vehicle,
    utilization_type: form.value.utilization_type || 'Vehicular',
    plate_number: form.value.plate_number || '',
    utilized_by: form.value.utilized_by,
    fund_cluster: form.value.fund_cluster,
    contract_id: form.value.contract_id,
    po_number: form.value.po_number,
    account_code: form.value.account_code,
    remarks: form.value.remarks || '',
  }
  if (isEditing.value) {
    const { error } = await supabase
      .from('fuel_transactions')
      .update(payload)
      .eq('id', form.value.id)
    if (error) showSnackbar('Failed to update transaction', 'error')
    else {
      await saveCustomDropdownValues()
      showSnackbar('Transaction updated', 'success')
      closeFormDialog()
      await fetchTransactions()
    }
  } else {
    const { error } = await supabase.from('fuel_transactions').insert(payload)
    if (error) showSnackbar('Failed to add transaction', 'error')
    else {
      await saveCustomDropdownValues()
      showSnackbar('Transaction added', 'success')
      closeFormDialog()
      await fetchTransactions()
    }
  }
  saving.value = false
}

// Saves custom (user-typed) dropdown values only after a successful submit.
// This prevents partial keystrokes from being stored as options.
async function saveCustomDropdownValues() {
  const utilizedBy = form.value.utilized_by?.trim()
  if (
    utilizedBy &&
    !utilizedByOptions.value.some((o) => o.toLowerCase() === utilizedBy.toLowerCase())
  ) {
    await addDropdownOption('utilized_by', utilizedBy)
  }
}

// ── WATCH vehicle to auto-fill plate number ──
watch(
  () => form.value.vehicle,
  (vehicleName) => {
    if (!vehicleName || form.value.utilization_type === 'Non-Vehicular') {
      form.value.plate_number = ''
      return
    }
    const match = assets.value.find((a) => a.asset_name === vehicleName)
    form.value.plate_number = match?.plate_number || ''
  },
)

// ── DELETE ──
async function deleteTx() {
  deleting.value = true
  const { error } = await supabase.from('fuel_transactions').delete().eq('id', selectedTx.value.id)
  if (error) showSnackbar('Failed to delete transaction', 'error')
  else {
    showSnackbar('Transaction deleted', 'success')
    deleteDialog.value = false
    await fetchTransactions()
  }
  deleting.value = false
}

// ── HELPERS ──
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}
function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '0.00'
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatNumberExact(val) {
  if (val === null || val === undefined || val === '') return '0'
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fundColor(fund) {
  const map = { RAF: 'blue', IGF: 'green', BRF: 'orange', TRF: 'purple' }
  if (map[fund]) return map[fund]
  const colors = ['teal', 'pink', 'indigo', 'cyan', 'deep-orange', 'lime', 'brown', 'blue-grey']
  let hash = 0
  for (let i = 0; i < (fund?.length || 0); i++) hash += fund.charCodeAt(i)
  return colors[hash % colors.length]
}
function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

onMounted(async () => {
  await fetchDropdownOptions()
  await fetchAssets()
  await fetchAvailableYears()
  await Promise.all([fetchTransactions(), fetchContracts()])

  // Apply pre-filters from query params (e.g. coming from Fuel Allocation Monitoring)
  if (route.query.fund) filterFund.value = route.query.fund
  if (route.query.po) search.value = route.query.po
})
</script>
