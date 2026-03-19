<template>
  <v-container fluid>
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <h2 class="text-h5 font-weight-bold">Fuel Allocation Monitoring</h2>
            <p class="text-medium-emphasis text-body-2 mt-1">
              Monitor annual fuel allocation and remaining balance per cost center
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
              @update:modelValue="refreshData"
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
              Add Contract
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- ── SUMMARY CARDS ──────────────────────────────────────────────────────
         Three cards showing the fuel allocation health for the selected year.
         Card 1: Budget overview (contract total, consumed, remaining balance)
         Card 2: Diesel        (allocated L, consumed L, remaining L)
         Card 3: Gasoline      (allocated L, consumed L, remaining L)
         All values come from computed properties defined in <script setup>.
         Remaining values turn red when negative (over-budget/over-allocated).
    ─────────────────────────────────────────────────────────────────────────-->
    <v-row class="mb-4">
      <!-- ── CARD 1: Contract Budget Overview ── -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border height="100%">
          <v-card-text>
            <!-- Header: icon + label -->
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar color="orange-darken-2" variant="tonal" size="44">
                <v-icon>mdi-cash-multiple</v-icon>
              </v-avatar>
              <p class="text-body-2 font-weight-bold">Total Contract Amount</p>
            </div>

            <!-- Main figure: the full approved budget for this year -->
            <p class="text-h5 font-weight-bold mb-3">
              {{ formatCurrency(totalContractAmount) }}
            </p>

            <v-divider class="mb-3" />

            <!-- Row: total peso amount consumed so far this year -->
            <div class="d-flex justify-space-between align-center mb-2">
              <p class="text-caption text-medium-emphasis">Total consumed</p>
              <p class="text-body-2 font-weight-medium">
                {{ formatCurrency(totalConsumedAmount) }}
              </p>
            </div>

            <!-- Row: remaining balance = contract total minus consumed.
                 Turns red with a "−" prefix when the balance is negative.
                 A negative balance is VALID — it means the office spent
                 slightly more than the contract allows (see Image 5). -->
            <div class="d-flex justify-space-between align-center">
              <p class="text-caption text-medium-emphasis">Remaining balance</p>
              <p
                class="text-body-2 font-weight-bold"
                :class="totalRemainingBalance < 0 ? 'text-error' : 'text-success'"
              >
                {{ totalRemainingBalance < 0 ? '−' : ''
                }}{{ formatCurrency(Math.abs(totalRemainingBalance)) }}
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- ── CARD 2: Diesel ── -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border height="100%">
          <v-card-text>
            <!-- Header: icon + label -->
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar color="blue-darken-2" variant="tonal" size="44">
                <v-icon>mdi-fuel</v-icon>
              </v-avatar>
              <p class="text-body-2 font-weight-bold">Diesel</p>
            </div>

            <!-- Top section: what was ALLOCATED (the plan from contracts) -->
            <v-row class="mb-1">
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Total No. (L)</p>
                <!-- totalDiesel = sum of allocated_diesel from all contracts -->
                <p class="text-h6 font-weight-bold text-blue-darken-2">
                  {{ formatNumber(totalDiesel) }}
                </p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Total Amount</p>
                <!-- totalDieselAmount = sum of actual transaction amounts for diesel -->
                <p class="text-h6 font-weight-bold">
                  {{ formatCurrency(totalDieselAmount) }}
                </p>
              </v-col>
            </v-row>

            <v-divider class="mb-2" />

            <!-- Bottom section: REMAINING BALANCE (what the end user requested) -->
            <p class="text-caption text-medium-emphasis mb-1">Remaining balance</p>
            <v-row>
              <v-col cols="6">
                <!-- Remaining liters = allocated minus consumed.
                     Red + "−" prefix when over-allocated. -->
                <p
                  class="text-body-2 font-weight-bold"
                  :class="totalRemainingDiesel < 0 ? 'text-error' : ''"
                >
                  {{ totalRemainingDiesel < 0 ? '−' : ''
                  }}{{ formatNumber(Math.abs(totalRemainingDiesel)) }} L
                </p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Consumed</p>
                <!-- totalConsumedDiesel = actual liters withdrawn from transactions -->
                <p class="text-body-2 font-weight-medium">
                  {{ formatNumber(totalConsumedDiesel) }} L
                </p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- ── CARD 3: Gasoline (same structure as Card 2) ── -->
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="0" border height="100%">
          <v-card-text>
            <!-- Header: icon + label -->
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar color="green-darken-2" variant="tonal" size="44">
                <v-icon>mdi-gas-station</v-icon>
              </v-avatar>
              <p class="text-body-2 font-weight-bold">Gasoline</p>
            </div>

            <!-- Top section: what was ALLOCATED -->
            <v-row class="mb-1">
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Total No. (L)</p>
                <!-- totalGasoline = sum of allocated_gasoline from all contracts -->
                <p class="text-h6 font-weight-bold text-green-darken-2">
                  {{ formatNumber(totalGasoline) }}
                </p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Total Amount</p>
                <!-- totalGasolineAmount = sum of actual transaction amounts for gasoline -->
                <p class="text-h6 font-weight-bold">
                  {{ formatCurrency(totalGasolineAmount) }}
                </p>
              </v-col>
            </v-row>

            <v-divider class="mb-2" />

            <!-- Bottom section: REMAINING BALANCE -->
            <p class="text-caption text-medium-emphasis mb-1">Remaining balance</p>
            <v-row>
              <v-col cols="6">
                <!-- Remaining liters = allocated minus consumed.
                     Red + "−" prefix when over-allocated. -->
                <p
                  class="text-body-2 font-weight-bold"
                  :class="totalRemainingGasoline < 0 ? 'text-error' : ''"
                >
                  {{ totalRemainingGasoline < 0 ? '−' : ''
                  }}{{ formatNumber(Math.abs(totalRemainingGasoline)) }} L
                </p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Consumed</p>
                <!-- totalConsumedGasoline = actual liters withdrawn from transactions -->
                <p class="text-body-2 font-weight-medium">
                  {{ formatNumber(totalConsumedGasoline) }} L
                </p>
              </v-col>
            </v-row>
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
          label="Search cost center, head, account code..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="min-width: 280px"
        />
        <v-select
          v-model="filterFund"
          :items="['All Funds', 'RAF', 'IGF', 'BRF', 'TRF']"
          label="Fund Cluster"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 140px"
        />

        <!-- FEATURE 5: filter by cost center, updates summary cards -->
        <v-autocomplete
          v-model="filterCostCenter"
          :items="costCenterOptions"
          label="Cost Center"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="min-width: 220px"
        />

        <v-spacer />
        <p class="text-medium-emphasis text-body-2">
          Showing {{ filteredContracts.length }} of {{ contracts.length }} contracts
        </p>
      </div>
    </v-card>

    <!-- Contracts Table -->
    <v-card rounded="lg" elevation="0" border>
      <v-data-table
        :headers="headers"
        :items="filteredContracts"
        :loading="loading"
        items-per-page="15"
        class="fuel-table"
      >
        <!-- Fund Cluster chip -->
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

        <!-- Contract Amount -->
        <template #item.contract_amount="{ item }">
          <span class="font-weight-medium">₱{{ formatNumber(item.contract_amount) }}</span>
        </template>

        <!-- Consumed -->
        <template #item.consumed_amount="{ item }">
          <span class="text-medium-emphasis">₱{{ formatNumber(item.consumed_amount) }}</span>
        </template>

        <!-- Remaining Diesel -->
        <template #item.remaining_diesel="{ item }">
          <span :class="item.remaining_diesel < 0 ? 'text-error font-weight-bold' : ''">
            {{ formatNumber(item.remaining_diesel) }} L
          </span>
        </template>

        <!-- Remaining Gasoline -->
        <template #item.remaining_gasoline="{ item }">
          <span :class="item.remaining_gasoline < 0 ? 'text-error font-weight-bold' : ''">
            {{ formatNumber(item.remaining_gasoline) }} L
          </span>
        </template>

        <!-- Diesel liters -->
        <template #item.allocated_diesel="{ item }">
          <span>{{ formatNumber(item.allocated_diesel) }} L</span>
        </template>

        <!-- Gasoline liters -->
        <template #item.allocated_gasoline="{ item }">
          <span>{{ formatNumber(item.allocated_gasoline) }} L</span>
        </template>

        <!-- Balance -->
        <template #item.balance="{ item }">
          <v-chip :color="item.balance >= 0 ? 'success' : 'error'" variant="tonal" size="small">
            ₱{{ formatNumber(Math.abs(item.balance)) }}
            {{ item.balance < 0 ? '(over)' : '' }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="x-small"
            variant="text"
            color="info"
            @click="openViewDialog(item)"
          />
          <v-btn
            icon="mdi-pencil"
            size="x-small"
            variant="text"
            color="primary"
            @click="openEditDialog(item)"
          />
          <v-btn
            icon="mdi-delete"
            size="x-small"
            variant="text"
            color="error"
            @click="openDeleteDialog(item)"
          />
        </template>

        <template #no-data>
          <div class="pa-8 text-center">
            <v-icon size="56" color="grey-lighten-1">mdi-file-document-outline</v-icon>
            <p class="mt-3 text-medium-emphasis">No contracts found for {{ selectedYear }}.</p>
            <v-btn color="primary" class="mt-3" @click="openAddDialog"> Add First Contract </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- ── ADD / EDIT DIALOG ── -->
    <v-dialog v-model="formDialog" max-width="700" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">
          <v-icon start :color="isEditing ? 'primary' : 'success'">
            {{ isEditing ? 'mdi-pencil' : 'mdi-plus-circle' }}
          </v-icon>
          {{ isEditing ? 'Edit Contract' : 'Add Contract' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row>
            <!-- Fund Cluster -->
            <v-col cols="12" sm="4">
              <v-combobox
                v-model="form.fund_cluster"
                :items="existingFundClusters"
                label="Fund Cluster *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.fund_cluster"
                placeholder="e.g. RAF, IGF, BRF, TRF"
              />
            </v-col>
            <!-- PO Number -->
            <v-col cols="12" sm="4">
              <v-combobox
                v-model="form.po_number"
                :items="existingPONumbers"
                label="PO Number *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.po_number"
                placeholder="e.g. 101-25-01-002"
              />
            </v-col>
            <!-- Mode of Procurement -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.mode_of_procurement"
                label="Mode of Procurement"
                variant="outlined"
                density="comfortable"
                placeholder="CONTRACT"
              />
            </v-col>

            <!-- Account Code -->
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="form.account_code"
                label="Account Code *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.account_code"
                placeholder="e.g. CAA LABSHARE"
              />
            </v-col>
            <!-- Year -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.year"
                label="Year *"
                variant="outlined"
                density="comfortable"
                type="number"
                :error-messages="errors.year"
              />
            </v-col>

            <!-- Cost Center Head -->
            <v-col cols="12">
              <v-text-field
                v-model="form.cost_center_head"
                label="Cost Center Head *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.cost_center_head"
                placeholder="e.g. ELIZABETH PARAC, PH.D"
              />
            </v-col>

            <v-col cols="12">
              <v-divider class="mb-3" />
              <p class="text-body-2 font-weight-medium text-medium-emphasis mb-3">
                <v-icon size="16" class="mr-1">mdi-currency-php</v-icon>
                Contract Financial Details
              </p>
            </v-col>

            <!-- Contract Amount -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.contract_amount_display"
                label="Contract Amount (₱) *"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.contract_amount"
                placeholder="0.00"
                @input="onAmountInput"
                @blur="onAmountBlur"
              />
            </v-col>
            <!-- Allocated Diesel -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.allocated_diesel_display"
                label="Allocated Diesel (L)"
                variant="outlined"
                density="comfortable"
                placeholder="0.00"
                suffix="L"
                @input="onDieselInput"
                @blur="onDieselBlur"
              />
            </v-col>
            <!-- Allocated Gasoline -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.allocated_gasoline_display"
                label="Allocated Gasoline (L)"
                variant="outlined"
                density="comfortable"
                placeholder="0.00"
                suffix="L"
                @input="onGasolineInput"
                @blur="onGasolineBlur"
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
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveContract">
            {{ isEditing ? 'Save Changes' : 'Add Contract' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── VIEW DIALOG ── -->
    <v-dialog v-model="viewDialog" max-width="680">
      <v-card rounded="lg" v-if="selectedContract">
        <v-card-title class="pa-4 pb-2 d-flex align-center justify-space-between">
          <span>Contract Details</span>
          <v-chip
            :color="fundColor(selectedContract.fund_cluster)"
            variant="tonal"
            size="small"
            class="font-weight-bold"
          >
            {{ selectedContract.fund_cluster }}
          </v-chip>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <!-- Contract Info -->
          <v-card rounded="lg" variant="tonal" color="grey" class="pa-3 mb-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">
              CONTRACT INFORMATION
            </p>
            <v-row density="comfortable">
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">PO Number</p>
                <p class="font-weight-medium">{{ selectedContract.po_number }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Mode of Procurement</p>
                <p class="font-weight-medium">{{ selectedContract.mode_of_procurement || '—' }}</p>
              </v-col>
              <v-col cols="12" class="mt-1">
                <p class="text-caption text-medium-emphasis">Account Code</p>
                <p class="font-weight-medium">{{ selectedContract.account_code }}</p>
              </v-col>
              <v-col cols="12" class="mt-1">
                <p class="text-caption text-medium-emphasis">Cost Center Head</p>
                <p class="font-weight-medium">{{ selectedContract.cost_center_head }}</p>
              </v-col>
            </v-row>
          </v-card>

          <!-- Peso Balance -->
          <v-card rounded="lg" variant="tonal" color="orange" class="pa-3 mb-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">PESO BALANCE</p>
            <v-row density="comfortable">
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Contract Amount</p>
                <p class="font-weight-bold text-orange-darken-3">
                  ₱{{ formatNumber(selectedContract.contract_amount) }}
                </p>
              </v-col>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Consumed</p>
                <p class="font-weight-medium">
                  ₱{{ formatNumber(selectedContract.consumed_amount) }}
                </p>
              </v-col>
              <v-col cols="4">
                <p class="text-caption text-medium-emphasis">Remaining</p>
                <p
                  :class="
                    selectedContract.balance >= 0
                      ? 'font-weight-bold text-success'
                      : 'font-weight-bold text-error'
                  "
                >
                  ₱{{ formatNumber(Math.abs(selectedContract.balance)) }}
                  {{ selectedContract.balance < 0 ? '(OVER)' : '' }}
                </p>
              </v-col>
            </v-row>
            <v-progress-linear
              class="mt-2"
              :model-value="
                selectedContract.contract_amount > 0
                  ? Math.min(
                      (selectedContract.consumed_amount / selectedContract.contract_amount) * 100,
                      100,
                    )
                  : 0
              "
              :color="
                selectedContract.balance < 0
                  ? 'error'
                  : selectedContract.balance / selectedContract.contract_amount < 0.1
                    ? 'warning'
                    : 'success'
              "
              bg-color="grey-lighten-3"
              rounded
              height="6"
            />
          </v-card>

          <!-- Liter Balance -->
          <v-card rounded="lg" variant="tonal" color="blue" class="pa-3 mb-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">LITER BALANCE</p>
            <v-row density="comfortable">
              <!-- Diesel -->
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis font-weight-bold mb-1">
                  <v-icon size="12" class="mr-1">mdi-fuel</v-icon>DIESEL
                </p>
                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>Allocated: {{ formatNumber(selectedContract.allocated_diesel) }} L</span>
                  <span>Used: {{ formatNumber(selectedContract.consumed_diesel) }} L</span>
                </div>
                <v-progress-linear
                  :model-value="
                    selectedContract.allocated_diesel > 0
                      ? Math.min(
                          (selectedContract.consumed_diesel / selectedContract.allocated_diesel) *
                            100,
                          100,
                        )
                      : 0
                  "
                  :color="selectedContract.remaining_diesel < 0 ? 'error' : 'blue-darken-2'"
                  bg-color="grey-lighten-3"
                  rounded
                  height="5"
                />
                <p
                  class="text-caption mt-1"
                  :class="
                    selectedContract.remaining_diesel < 0
                      ? 'text-error font-weight-bold'
                      : 'text-medium-emphasis'
                  "
                >
                  Remaining: {{ formatNumber(selectedContract.remaining_diesel) }} L
                  {{ selectedContract.remaining_diesel < 0 ? '(OVER)' : '' }}
                </p>
              </v-col>
              <!-- Gasoline -->
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis font-weight-bold mb-1">
                  <v-icon size="12" class="mr-1">mdi-gas-station</v-icon>GASOLINE
                </p>
                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>Allocated: {{ formatNumber(selectedContract.allocated_gasoline) }} L</span>
                  <span>Used: {{ formatNumber(selectedContract.consumed_gasoline) }} L</span>
                </div>
                <v-progress-linear
                  :model-value="
                    selectedContract.allocated_gasoline > 0
                      ? Math.min(
                          (selectedContract.consumed_gasoline /
                            selectedContract.allocated_gasoline) *
                            100,
                          100,
                        )
                      : 0
                  "
                  :color="selectedContract.remaining_gasoline < 0 ? 'error' : 'green-darken-2'"
                  bg-color="grey-lighten-3"
                  rounded
                  height="5"
                />
                <p
                  class="text-caption mt-1"
                  :class="
                    selectedContract.remaining_gasoline < 0
                      ? 'text-error font-weight-bold'
                      : 'text-medium-emphasis'
                  "
                >
                  Remaining: {{ formatNumber(selectedContract.remaining_gasoline) }} L
                  {{ selectedContract.remaining_gasoline < 0 ? '(OVER)' : '' }}
                </p>
              </v-col>
            </v-row>
          </v-card>

          <!-- Transactions charged to this contract -->
          <v-card rounded="lg" variant="tonal" color="grey" class="pa-3">
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">
              TRANSACTIONS ({{ selectedContract.transactions?.length || 0 }})
            </p>
            <div
              v-if="!selectedContract.transactions?.length"
              class="text-caption text-medium-emphasis pa-2 text-center"
            >
              No transactions recorded for this contract.
            </div>
            <v-table v-else density="compact" class="text-caption">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>OR #</th>
                  <th>Billing Period</th>
                  <th>Type</th>
                  <th class="text-right">Qty (L)</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="t in [...(selectedContract.transactions || [])].sort((a, b) =>
                    a.date.localeCompare(b.date),
                  )"
                  :key="t.id"
                >
                  <td>{{ formatDate(t.date) }}</td>
                  <td>{{ t.or_number }}</td>
                  <td class="text-caption">{{ t.billing_period }}</td>
                  <td>
                    <v-chip
                      :color="t.fuel_type === 'Diesel' ? 'blue-darken-2' : 'green-darken-2'"
                      variant="tonal"
                      size="x-small"
                      >{{ t.fuel_type }}</v-chip
                    >
                  </td>
                  <td class="text-right">{{ formatNumber(t.quantity) }}</td>
                  <td class="text-right font-weight-medium">₱{{ formatNumber(t.total_amount) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="font-weight-bold">
                  <td colspan="4" class="text-right text-caption">TOTAL</td>
                  <td class="text-right">
                    {{
                      formatNumber(
                        selectedContract.consumed_diesel + selectedContract.consumed_gasoline,
                      )
                    }}
                    L
                  </td>
                  <td class="text-right text-orange-darken-3">
                    ₱{{ formatNumber(selectedContract.consumed_amount) }}
                  </td>
                </tr>
              </tfoot>
            </v-table>
          </v-card>

          <div v-if="selectedContract.remarks" class="mt-3">
            <p class="text-caption text-medium-emphasis">Remarks</p>
            <p class="text-body-2">{{ selectedContract.remarks }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="viewDialog = false">Close</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="
              () => {
                viewDialog = false
                openEditDialog(selectedContract)
              }
            "
          >
            Edit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── DELETE DIALOG ── -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="pa-5 text-center">
          <v-icon color="error" size="56" class="mb-3">mdi-alert-circle</v-icon>
          <h3 class="text-h6 mb-2">Delete Contract?</h3>
          <p class="text-medium-emphasis">
            Delete <strong>{{ selectedContract?.account_code }}</strong
            >? This cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteContract">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

// ── STATE ──
const contracts = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

const selectedYear = ref(new Date().getFullYear())
const addYearDialog = ref(false)
const newYear = ref(new Date().getFullYear() + 1)
const availableYears = ref([new Date().getFullYear()])
const filterCostCenter = ref('All Cost Centers') // ← FEATURE 5
const search = ref('')
const filterFund = ref('All Funds')
const allTransactions = ref([])

// ── DIALOGS ──
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)

const isEditing = ref(false)
const selectedContract = ref(null)

// ── FORM ──
const defaultForm = {
  year: new Date().getFullYear(),
  fund_cluster: '',
  po_number: '',
  account_code: '',
  cost_center_head: '',
  contract_amount: 0,
  contract_amount_display: '',
  allocated_diesel: 0,
  allocated_diesel_display: '',
  allocated_gasoline: 0,
  allocated_gasoline_display: '',
  mode_of_procurement: 'CONTRACT',
  remarks: '',
}
const form = ref({ ...defaultForm })
const errors = ref({})

// ── SNACKBAR ──
const snackbar = ref({ show: false, message: '', color: 'success' })

// ── TABLE HEADERS ──
const headers = [
  { title: 'Fund', key: 'fund_cluster', width: '80px' },
  { title: 'PO Number', key: 'po_number', width: '140px' },
  { title: 'Account Code', key: 'account_code' },
  { title: 'Cost Center Head', key: 'cost_center_head' },
  { title: 'Contract Amt.', key: 'contract_amount', align: 'end' },
  { title: 'Consumed', key: 'consumed_amount', align: 'end' },
  { title: 'Balance', key: 'balance', align: 'center' },
  { title: 'Diesel Rem.', key: 'remaining_diesel', align: 'end' },
  { title: 'Gas. Rem.', key: 'remaining_gasoline', align: 'end' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: '100px' },
]

// ── COMPUTED ──
const filteredContracts = computed(() => {
  return enrichedContracts.value.filter((c) => {
    const matchSearch =
      !search.value ||
      [c.account_code, c.cost_center_head, c.po_number].some((f) =>
        f?.toLowerCase().includes(search.value.toLowerCase()),
      )
    const matchFund = filterFund.value === 'All Funds' || c.fund_cluster === filterFund.value
    return matchSearch && matchFund
  })
})

// FEATURE 5: contracts scoped to the selected cost center filter
const summaryContracts = computed(() => {
  if (filterCostCenter.value === 'All Cost Centers') return enrichedContracts.value
  return enrichedContracts.value.filter((c) => c.account_code === filterCostCenter.value)
})

// FEATURE 5: transactions scoped to the filtered contracts
const summaryContractIds = computed(() => new Set(summaryContracts.value.map((c) => c.id)))

const summaryTransactions = computed(() =>
  allTransactions.value.filter((t) => summaryContractIds.value.has(t.contract_id)),
)

// FEATURE 4 & 5: summary totals derived from filtered scope
const totalContractAmount = computed(() =>
  summaryContracts.value.reduce((s, c) => s + (c.contract_amount || 0), 0),
)
const totalRemainingAmount = computed(() =>
  summaryContracts.value.reduce((s, c) => s + (c.balance || 0), 0),
)

const totalDiesel = computed(() =>
  summaryContracts.value.reduce((s, c) => s + (c.allocated_diesel || 0), 0),
)
const totalGasoline = computed(() =>
  summaryContracts.value.reduce((s, c) => s + (c.allocated_gasoline || 0), 0),
)

const totalDieselAmount = computed(() =>
  summaryTransactions.value
    .filter((t) => t.fuel_type === 'Diesel')
    .reduce((s, t) => s + (t.total_amount || 0), 0),
)
const totalGasolineAmount = computed(() =>
  allTransactions.value
    .filter((t) => t.fuel_type === 'Gasoline')
    .reduce((s, t) => s + (t.total_amount || 0), 0),
)

// totalConsumedAmount: total peso amount spent across ALL cost centers this year.
// This is calculated from actual transactions, not from contract amounts.
const totalConsumedAmount = computed(() =>
  allTransactions.value.reduce((s, t) => s + (t.total_amount || 0), 0),
)

// totalRemainingBalance: total contract budget minus total amount actually spent.
// This can be negative if any cost centers went over budget.
const totalRemainingBalance = computed(() => totalContractAmount.value - totalConsumedAmount.value)

// totalConsumedDiesel: total liters of diesel actually withdrawn this year.
// Sourced from transactions, not from the allocated amount in contracts.
const totalConsumedDiesel = computed(() =>
  allTransactions.value
    .filter((t) => t.fuel_type === 'Diesel')
    .reduce((s, t) => s + (t.quantity || 0), 0),
)

// totalConsumedGasoline: total liters of gasoline actually withdrawn this year.
const totalConsumedGasoline = computed(() =>
  allTransactions.value
    .filter((t) => t.fuel_type === 'Gasoline')
    .reduce((s, t) => s + (t.quantity || 0), 0),
)

// totalRemainingDiesel: allocated diesel liters minus consumed diesel liters.
// Negative means the office used more diesel than was allocated.
const totalRemainingDiesel = computed(() => totalDiesel.value - totalConsumedDiesel.value)

// totalRemainingGasoline: allocated gasoline liters minus consumed gasoline liters.
const totalRemainingGasoline = computed(() => totalGasoline.value - totalConsumedGasoline.value)
// FEATURE 4: used liters per fuel type (from transactions)
const usedDieselLiters = computed(() =>
  summaryTransactions.value
    .filter((t) => t.fuel_type === 'Diesel')
    .reduce((s, t) => s + (t.quantity || 0), 0),
)
const usedGasolineLiters = computed(() =>
  summaryTransactions.value
    .filter((t) => t.fuel_type === 'Gasoline')
    .reduce((s, t) => s + (t.quantity || 0), 0),
)

// FEATURE 4: remaining = allocated - used
const remainingDieselLiters = computed(() => totalDiesel.value - usedDieselLiters.value)
const remainingGasolineLiters = computed(() => totalGasoline.value - usedGasolineLiters.value)

// Options list for the cost center filter dropdown
const costCenterOptions = computed(() => [
  'All Cost Centers',
  ...new Set(contracts.value.map((c) => c.account_code).filter(Boolean)),
])

// Per-contract consumption stats keyed by contract_id
const contractStats = computed(() => {
  const map = new Map()
  allTransactions.value.forEach((t) => {
    if (!t.contract_id) return
    if (!map.has(t.contract_id)) {
      map.set(t.contract_id, {
        consumed_amount: 0,
        consumed_diesel: 0,
        consumed_gasoline: 0,
        transactions: [],
      })
    }
    const s = map.get(t.contract_id)
    s.consumed_amount += t.total_amount || 0
    if (t.fuel_type === 'Diesel') s.consumed_diesel += t.quantity || 0
    else if (t.fuel_type === 'Gasoline') s.consumed_gasoline += t.quantity || 0
    s.transactions.push(t)
  })
  return map
})

// Enrich contracts with live balance and remaining liters
const enrichedContracts = computed(() =>
  contracts.value.map((c) => {
    const stats = contractStats.value.get(c.id) || {
      consumed_amount: 0,
      consumed_diesel: 0,
      consumed_gasoline: 0,
      transactions: [],
    }
    return {
      ...c,
      consumed_amount: stats.consumed_amount,
      balance: (c.contract_amount || 0) - stats.consumed_amount,
      remaining_diesel: (c.allocated_diesel || 0) - stats.consumed_diesel,
      remaining_gasoline: (c.allocated_gasoline || 0) - stats.consumed_gasoline,
      consumed_diesel: stats.consumed_diesel,
      consumed_gasoline: stats.consumed_gasoline,
      transactions: stats.transactions,
    }
  }),
)

const existingPONumbers = computed(() => [
  ...new Set(contracts.value.map((c) => c.po_number).filter(Boolean)),
])

const existingFundClusters = computed(() => [
  ...new Set(contracts.value.map((c) => c.fund_cluster).filter(Boolean)),
])

// ── FETCH ──
async function fetchAvailableYears() {
  const { data } = await supabase.from('fuel_contracts').select('year').order('year')
  if (data) {
    const years = [...new Set(data.map((r) => r.year))]
    availableYears.value = years.length > 0 ? years : [new Date().getFullYear()]
    if (!availableYears.value.includes(selectedYear.value)) {
      selectedYear.value = availableYears.value[availableYears.value.length - 1]
    }
  }
}

async function refreshData() {
  await Promise.all([fetchContracts(), fetchAllTransactions()])
}

async function fetchContracts() {
  loading.value = true
  const { data, error } = await supabase
    .from('fuel_contracts')
    .select('*')
    .eq('year', selectedYear.value)
    .order('fund_cluster')
    .order('po_number')
    .order('account_code')
  if (error) showSnackbar('Failed to load contracts', 'error')
  else contracts.value = data
  loading.value = false
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
  selectedYear.value = y
  addYearDialog.value = false
  refreshData()
}

async function fetchAllTransactions() {
  const startDate = `${selectedYear.value}-01-01`
  const endDate = `${selectedYear.value}-12-31`
  const { data } = await supabase
    .from('fuel_transactions')
    .select(
      'id, contract_id, fuel_type, quantity, total_amount, billing_period, date, vehicle, or_number',
    )
    .gte('date', startDate)
    .lte('date', endDate)
  if (data) allTransactions.value = data
}

// ── DIALOGS ──
function openAddDialog() {
  isEditing.value = false
  form.value = { ...defaultForm, year: selectedYear.value }
  errors.value = {}
  formDialog.value = true
}

function openEditDialog(contract) {
  isEditing.value = true
  selectedContract.value = contract
  form.value = {
    ...contract,
    contract_amount_display: formatNumber(contract.contract_amount),
    allocated_diesel_display: formatNumber(contract.allocated_diesel),
    allocated_gasoline_display: formatNumber(contract.allocated_gasoline),
  }
  errors.value = {}
  formDialog.value = true
}

function openViewDialog(contract) {
  selectedContract.value = contract
  viewDialog.value = true
}

function openDeleteDialog(contract) {
  selectedContract.value = contract
  deleteDialog.value = true
}

function closeFormDialog() {
  formDialog.value = false
  form.value = { ...defaultForm }
  errors.value = {}
}

// ── VALIDATION ──
function validateForm() {
  errors.value = {}
  if (!form.value.fund_cluster) errors.value.fund_cluster = 'Required'
  if (!form.value.po_number?.trim()) errors.value.po_number = 'Required'
  if (!form.value.account_code?.trim()) errors.value.account_code = 'Required'
  if (!form.value.cost_center_head?.trim()) errors.value.cost_center_head = 'Required'
  if (!form.value.contract_amount || form.value.contract_amount <= 0)
    errors.value.contract_amount = 'Must be greater than 0'
  if (!form.value.year) errors.value.year = 'Required'
  return Object.keys(errors.value).length === 0
}

// ── SAVE ──
async function saveContract() {
  if (!validateForm()) return
  saving.value = true
  const payload = {
    year: Number(form.value.year),
    fund_cluster: form.value.fund_cluster,
    po_number: form.value.po_number,
    account_code: form.value.account_code,
    cost_center_head: form.value.cost_center_head,
    contract_amount: form.value.contract_amount || 0,
    allocated_diesel: form.value.allocated_diesel || 0,
    allocated_gasoline: form.value.allocated_gasoline || 0,
    mode_of_procurement: form.value.mode_of_procurement || 'CONTRACT',
    remarks: form.value.remarks || '',
  }
  if (isEditing.value) {
    const { error } = await supabase.from('fuel_contracts').update(payload).eq('id', form.value.id)
    if (error) showSnackbar('Failed to update contract', 'error')
    else {
      showSnackbar('Contract updated', 'success')
      closeFormDialog()
      await refreshData()
    }
  } else {
    const { error } = await supabase.from('fuel_contracts').insert(payload)
    if (error) showSnackbar('Failed to add contract', 'error')
    else {
      showSnackbar('Contract added', 'success')
      closeFormDialog()
      await refreshData()
    }
  }
  saving.value = false
}

// ── DELETE ──
async function deleteContract() {
  deleting.value = true
  const { error } = await supabase
    .from('fuel_contracts')
    .delete()
    .eq('id', selectedContract.value.id)
  if (error) showSnackbar('Failed to delete contract', 'error')
  else {
    showSnackbar('Contract deleted', 'success')
    deleteDialog.value = false
    await refreshData()
  }
  deleting.value = false
}

// ── COMMA-FORMATTED INPUTS ──
function onAmountInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') form.value.contract_amount = Number(raw)
}
function onAmountBlur() {
  form.value.contract_amount_display = form.value.contract_amount
    ? formatNumber(form.value.contract_amount)
    : ''
}
function onDieselInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') form.value.allocated_diesel = Number(raw)
}
function onDieselBlur() {
  form.value.allocated_diesel_display = form.value.allocated_diesel
    ? formatNumber(form.value.allocated_diesel)
    : ''
}
function onGasolineInput(e) {
  const raw = e.target.value.replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') form.value.allocated_gasoline = Number(raw)
}
function onGasolineBlur() {
  form.value.allocated_gasoline_display = form.value.allocated_gasoline
    ? formatNumber(form.value.allocated_gasoline)
    : ''
}

// ── HELPERS ──
function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '0'
  return Number(val).toLocaleString('en-PH', { maximumFractionDigits: 2 })
}
// formatCurrency: always shows the full exact peso amount with 2 decimal places.
// Why: This is a government accounting system — abbreviating ₱385,785 as "₱385.8K"
// hides the real number and can cause confusion during audits.
// How it works: it reuses formatNumber (which adds commas) then adds the ₱ sign.

// formatCurrency: always shows the exact peso amount with 2 decimal places.
// WHY this exists: government accounting requires exact amounts — never abbreviations.
// PROBLEM it solves: the old version showed ₱385,785.00 as "₱385.8K" which is
//   misleading and wrong for official financial records.
// HOW it works: it uses the same number formatter as formatNumber, but forces
//   exactly 2 decimal places so ₱200,450.00 never shows as ₱200,450.
function formatCurrency(val) {
  if (val === null || val === undefined || val === '') return '₱0.00'
  return (
    '₱' +
    Number(val).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}
function fundColor(fund) {
  const map = { RAF: 'blue', IGF: 'green', BRF: 'orange', TRF: 'purple' }
  if (map[fund]) return map[fund]
  // Auto-assign color for new fund clusters based on name
  const colors = ['teal', 'pink', 'indigo', 'cyan', 'deep-orange', 'lime', 'brown', 'blue-grey']
  let hash = 0
  for (let i = 0; i < fund.length; i++) hash += fund.charCodeAt(i)
  return colors[hash % colors.length]
}
function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

onMounted(async () => {
  await fetchAvailableYears()
  await refreshData()
})
</script>
