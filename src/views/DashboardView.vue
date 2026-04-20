<template>
  <v-container fluid class="pa-6">
    <!-- ── Page Header ── -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-3">
      <div class="d-flex align-center ga-3">
        <div>
          <div class="d-flex align-center ga-2 mb-1">
            <h1 class="text-h5 font-weight-bold">Dashboard</h1>
          </div>
        </div>
      </div>
      <div class="d-flex align-center ga-3">
        <v-btn
          icon
          variant="text"
          size="small"
          :loading="loadingAll"
          title="Refresh dashboard"
          @click="loadAll"
        >
          <v-icon size="18">mdi-refresh</v-icon>
        </v-btn>
        <v-select
          v-model="selectedYear"
          :items="yearOptions"
          label="Year"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 110px"
          @update:modelValue="loadAll"
        />
        <v-chip size="small" class="csu-updated-chip">
          <v-icon start size="13">mdi-clock-outline</v-icon>
          {{ lastRefreshed }}
        </v-chip>
      </div>
    </div>

    <!-- ── Loading state ── -->
    <div v-if="loadingAll" class="d-flex align-center justify-center py-16">
      <div class="text-center">
        <v-progress-circular indeterminate color="primary" size="48" width="3" class="mb-4" />
        <div class="text-body-2 text-medium-emphasis">Loading dashboard…</div>
      </div>
    </div>

    <template v-else>
      <!-- ══════════════════════════════════════════════════ -->
      <!-- 1. KPI SUMMARY                                     -->
      <!-- ══════════════════════════════════════════════════ -->
      <v-row density="comfortable" class="mb-4">
        <v-col cols="6" sm="3" v-for="kpi in kpiCards" :key="kpi.label">
          <v-card
            rounded="lg"
            elevation="0"
            border
            class="kpi-card"
            style="cursor: pointer"
            @click="$router.push(kpi.route)"
          >
            <div class="kpi-top-border" :style="`background: ${kpi.borderColor}`" />
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">{{
                  kpi.label
                }}</span>
                <v-avatar :color="kpi.color" variant="tonal" size="30" rounded="md">
                  <v-icon size="16">{{ kpi.icon }}</v-icon>
                </v-avatar>
              </div>
              <div class="text-h5 font-weight-bold mt-1">{{ kpi.value }}</div>
              <div class="text-caption text-medium-emphasis mt-1">{{ kpi.sub }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- 2. UPCOMING PREVENTIVE MAINTENANCE                 -->
      <!--    (moved to top per end-user request)             -->
      <!-- ══════════════════════════════════════════════════ -->
      <div class="section-label mb-3"><span>Upcoming Preventive Maintenance</span></div>
      <v-row density="comfortable" class="mb-4">
        <!-- Vehicle / Equipment PM -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="0" border class="kpi-card" style="min-height: 200px">
            <div class="kpi-top-border" style="background: #1a6e2e" />
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center ga-2">
                  <v-icon color="success" size="18">mdi-car-wrench</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">Vehicle / Equipment PM</span>
                </div>
                <v-btn
                  variant="text"
                  size="x-small"
                  color="primary"
                  to="/vehicle-pm"
                  append-icon="mdi-arrow-right"
                  >View All</v-btn
                >
              </div>
              <div v-if="upcomingPM.length === 0" class="empty-state-panel">
                <v-icon size="32" color="grey-lighten-1" class="mb-2"
                  >mdi-calendar-check-outline</v-icon
                >
                <p class="text-caption text-medium-emphasis mb-3">
                  No upcoming PM in the next 30 days
                </p>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="primary"
                  to="/vehicle-pm"
                  prepend-icon="mdi-plus"
                  >Add PM Record</v-btn
                >
              </div>
              <div v-else>
                <div
                  v-for="pm in upcomingPM"
                  :key="pm.id"
                  class="sr-row d-flex align-center justify-space-between py-2 clickable-row"
                  @click="$router.push('/vehicle-pm')"
                >
                  <div class="flex-grow-1 min-width-0 mr-2">
                    <div class="text-body-2 font-weight-medium text-truncate">
                      {{ pm.asset_name }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ pm.service_type }} · Due {{ formatDate(pm.next_due_date) }}
                    </div>
                  </div>
                  <v-chip
                    :color="dueColor(pm.next_due_date)"
                    size="x-small"
                    variant="tonal"
                    class="flex-shrink-0"
                  >
                    {{
                      daysUntil(pm.next_due_date) === 0
                        ? 'Today'
                        : daysUntil(pm.next_due_date) + 'd'
                    }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- AC Unit Cleaning -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="0" border class="kpi-card" style="min-height: 200px">
            <div class="kpi-top-border" style="background: #0288d1" />
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center ga-2">
                  <v-icon color="info" size="18">mdi-air-conditioner</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">AC Unit Cleaning</span>
                </div>
                <v-btn
                  variant="text"
                  size="x-small"
                  color="primary"
                  to="/ac-cleaning"
                  append-icon="mdi-arrow-right"
                  >View All</v-btn
                >
              </div>
              <div v-if="upcomingACCleaning.length === 0" class="empty-state-panel">
                <v-icon size="32" color="grey-lighten-1" class="mb-2">mdi-air-conditioner</v-icon>
                <p class="text-caption text-medium-emphasis mb-3">
                  No AC cleaning due in the next 30 days
                </p>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="info"
                  to="/ac-cleaning"
                  prepend-icon="mdi-plus"
                  >Add Cleaning Record</v-btn
                >
              </div>
              <div v-else>
                <div
                  v-for="ac in upcomingACCleaning"
                  :key="ac.id"
                  class="sr-row d-flex align-center justify-space-between py-2 clickable-row"
                  @click="$router.push('/ac-cleaning')"
                >
                  <div class="flex-grow-1 min-width-0 mr-2">
                    <div class="text-body-2 font-weight-medium text-truncate">
                      {{ ac.area_room }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ ac.building }} · Due {{ formatDate(ac.next_cleaning_date) }}
                    </div>
                  </div>
                  <v-chip
                    :color="dueColor(ac.next_cleaning_date)"
                    size="x-small"
                    variant="tonal"
                    class="flex-shrink-0"
                  >
                    {{
                      daysUntil(ac.next_cleaning_date) === 0
                        ? 'Today'
                        : daysUntil(ac.next_cleaning_date) + 'd'
                    }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- 3. RECENT SERVICE REQUESTS                         -->
      <!-- ══════════════════════════════════════════════════ -->
      <div class="section-label mb-3"><span>Recent Service Requests</span></div>
      <v-row density="comfortable" class="mb-4">
        <v-col cols="12">
          <v-card rounded="lg" elevation="0" border class="kpi-card">
            <div class="kpi-top-border" style="background: #d4621a" />
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center ga-2">
                  <v-icon color="orange" size="18">mdi-wrench</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">Service Requests</span>
                </div>
                <v-btn
                  variant="text"
                  size="x-small"
                  color="primary"
                  to="/vehicle-requests"
                  append-icon="mdi-arrow-right"
                  >View All</v-btn
                >
              </div>
              <div v-if="recentSR.length === 0" class="empty-state-panel">
                <v-icon size="32" color="grey-lighten-1" class="mb-2">mdi-wrench-outline</v-icon>
                <p class="text-caption text-medium-emphasis mb-3">
                  No service requests recorded yet
                </p>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="primary"
                  to="/vehicle-requests"
                  prepend-icon="mdi-plus"
                  >Add Request</v-btn
                >
              </div>
              <div v-else>
                <v-row density="compact">
                  <v-col cols="12" sm="6" v-for="sr in recentSR" :key="sr.id">
                    <div
                      class="sr-row d-flex align-center justify-space-between py-2 clickable-row"
                      @click="$router.push('/vehicle-requests')"
                    >
                      <div class="flex-grow-1 min-width-0 mr-2">
                        <div class="text-body-2 font-weight-medium">{{ sr.request_no }}</div>
                        <div class="text-caption text-medium-emphasis text-truncate">
                          {{ sr.asset_name }} · {{ formatDate(sr.date_of_request) }}
                        </div>
                      </div>
                      <v-chip
                        :color="srColor(sr.status)"
                        size="x-small"
                        variant="tonal"
                        class="flex-shrink-0"
                        >{{ sr.status }}</v-chip
                      >
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- 4. FUEL BUDGET                                     -->
      <!-- ══════════════════════════════════════════════════ -->
      <div class="section-label mb-3">
        <span>Fuel Budget — FY {{ selectedYear }}</span>
      </div>
      <v-row density="comfortable" class="mb-4">
        <v-col cols="6" sm="3">
          <v-card
            rounded="lg"
            elevation="0"
            border
            class="kpi-card"
            style="cursor: pointer"
            @click="$router.push('/fuel-contracts')"
          >
            <div class="kpi-top-border" style="background: #c9960c" />
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium"
                  >Contract Budget</span
                >
                <v-icon color="orange" size="18" opacity="0.7">mdi-cash-multiple</v-icon>
              </div>
              <div class="text-h5 font-weight-bold">
                {{ formatCurrency(fuelBudget.totalContractAmount) }}
              </div>
              <div class="text-caption text-medium-emphasis mt-1">
                {{ fuelBudget.totalContracts }} cost centers
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card
            rounded="lg"
            elevation="0"
            border
            class="kpi-card"
            style="cursor: pointer"
            @click="$router.push('/fuel-contracts')"
          >
            <div class="kpi-top-border" style="background: #1565c0" />
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium"
                  >Consumed</span
                >
                <v-icon color="blue" size="18" opacity="0.7">mdi-fuel</v-icon>
              </div>
              <div class="text-h5 font-weight-bold">
                {{ formatCurrency(fuelBudget.totalConsumed) }}
              </div>
              <div class="mt-2">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span
                    class="text-caption font-weight-medium"
                    :class="
                      fuelBudget.utilizationPct >= 90
                        ? 'text-error'
                        : fuelBudget.utilizationPct >= 80
                          ? 'text-warning'
                          : 'text-success'
                    "
                  >
                    {{ fuelBudget.utilizationPct }}% utilized
                  </span>
                  <span class="text-caption text-medium-emphasis">of budget</span>
                </div>
                <div class="util-bar-track">
                  <div
                    class="util-bar-fill"
                    :style="{
                      width: Math.min(fuelBudget.utilizationPct, 100) + '%',
                      background:
                        fuelBudget.utilizationPct >= 90
                          ? '#d32f2f'
                          : fuelBudget.utilizationPct >= 80
                            ? '#f57c00'
                            : '#1a6e2e',
                    }"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card
            rounded="lg"
            elevation="0"
            border
            class="kpi-card"
            style="cursor: pointer"
            @click="$router.push('/fuel-contracts')"
          >
            <div
              class="kpi-top-border"
              :style="fuelBudget.totalBalance < 0 ? 'background:#d32f2f' : 'background:#1a6e2e'"
            />
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium"
                  >Remaining</span
                >
                <v-icon
                  :color="fuelBudget.totalBalance < 0 ? 'error' : 'success'"
                  size="18"
                  opacity="0.7"
                  >mdi-scale-balance</v-icon
                >
              </div>
              <div
                class="text-h5 font-weight-bold"
                :class="fuelBudget.totalBalance < 0 ? 'text-error' : ''"
              >
                {{ fuelBudget.totalBalance < 0 ? '−' : ''
                }}{{ formatCurrency(Math.abs(fuelBudget.totalBalance)) }}
              </div>
              <div v-if="fuelBudget.overBudgetCount > 0" class="text-caption text-error mt-1">
                {{ fuelBudget.overBudgetCount }} center{{
                  fuelBudget.overBudgetCount > 1 ? 's' : ''
                }}
                over budget
              </div>
              <div v-else class="text-caption text-success mt-1">All centers within budget</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card
            rounded="lg"
            elevation="0"
            border
            class="kpi-card"
            style="cursor: pointer"
            @click="$router.push('/fuel-transactions')"
          >
            <div class="kpi-top-border" style="background: #1a6e2e" />
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium"
                  >Transactions</span
                >
                <v-icon color="primary" size="18" opacity="0.7">mdi-receipt-text</v-icon>
              </div>
              <div class="text-h5 font-weight-bold">{{ fuelBudget.totalTransactions }}</div>
              <div class="text-caption text-medium-emphasis mt-1">
                This period: {{ fuelBudget.currentPeriodTransactions }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Budget Alerts -->
      <v-row v-if="budgetAlerts.length > 0" density="comfortable" class="mb-4">
        <v-col cols="12">
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-4">
              <div class="text-subtitle-2 font-weight-bold mb-3">
                <v-icon start color="warning" size="18">mdi-alert-circle</v-icon>
                Budget Alerts
              </div>
              <div class="d-flex flex-column ga-2">
                <v-alert
                  v-for="alert in budgetAlerts"
                  :key="alert.id"
                  :type="alert.type"
                  variant="tonal"
                  density="compact"
                  rounded="lg"
                  style="cursor: pointer"
                  @click="$router.push('/fuel-contracts')"
                >
                  <span class="text-body-2"
                    ><strong>{{ alert.name }}</strong> {{ alert.message }}</span
                  >
                </v-alert>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- 5. FUEL CONSUMPTION — with allocation bars         -->
      <!--    Bug fix: proportion bar is now shared above     -->
      <!--    both cards so both show the same percentage      -->
      <!-- ══════════════════════════════════════════════════ -->
      <div class="section-label mb-3">
        <span>Fuel Consumption — FY {{ selectedYear }}</span>
      </div>

      <!-- Shared proportion bar — one bar, centered above both cards -->
      <v-row
        v-if="fuelStats.dieselLiters + fuelStats.gasolineLiters > 0"
        density="comfortable"
        class="mb-2"
      >
        <v-col cols="12">
          <div class="d-flex text-caption justify-space-between mb-1 px-1">
            <span class="font-weight-medium" style="color: #1565c0">
              <v-icon size="10" class="mr-1">mdi-circle</v-icon>Diesel {{ dieselPct }}%
            </span>
            <span class="font-weight-medium" style="color: #1a6e2e">
              Gasoline {{ 100 - dieselPct }}%<v-icon size="10" class="ml-1">mdi-circle</v-icon>
            </span>
          </div>
          <div class="fuel-split-track">
            <div class="fuel-split-diesel" :style="`width: ${dieselPct}%`" />
            <div class="fuel-split-gasoline" :style="`width: ${100 - dieselPct}%`" />
          </div>
        </v-col>
      </v-row>

      <v-row density="comfortable" class="mb-4">
        <!-- Diesel card -->
        <v-col cols="12" sm="6">
          <v-card
            rounded="lg"
            elevation="0"
            border
            class="kpi-card"
            style="cursor: pointer"
            @click="$router.push('/fuel-transactions')"
          >
            <div class="kpi-top-border" style="background: #1565c0" />
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-3 mb-3">
                <v-avatar color="blue-darken-2" variant="tonal" size="40">
                  <v-icon size="20">mdi-fuel</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-bold">Diesel</div>
                  <div class="text-caption text-medium-emphasis">FY {{ selectedYear }}</div>
                </div>
                <v-spacer />
                <div class="text-right" v-if="fuelAllocation.allocatedDiesel > 0">
                  <div class="text-caption text-medium-emphasis">Allocated</div>
                  <div class="text-body-2 font-weight-bold">
                    {{ formatNum(fuelAllocation.allocatedDiesel) }} L
                  </div>
                </div>
              </div>
              <!-- Consumed vs allocated progress -->
              <div class="mb-3" v-if="fuelAllocation.allocatedDiesel > 0">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-caption text-medium-emphasis">Consumed vs Allocated</span>
                  <span
                    class="text-caption font-weight-medium"
                    :class="
                      fuelAllocation.dieselPct >= 90
                        ? 'text-error'
                        : fuelAllocation.dieselPct >= 75
                          ? 'text-warning'
                          : 'text-success'
                    "
                  >
                    {{ fuelAllocation.dieselPct }}%
                  </span>
                </div>
                <div class="util-bar-track">
                  <div
                    class="util-bar-fill"
                    :style="{
                      width: Math.min(fuelAllocation.dieselPct, 100) + '%',
                      background:
                        fuelAllocation.dieselPct >= 90
                          ? '#d32f2f'
                          : fuelAllocation.dieselPct >= 75
                            ? '#f57c00'
                            : '#1565c0',
                    }"
                  />
                </div>
              </div>
              <v-divider class="mb-3" />
              <v-row density="compact">
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">Consumed</div>
                  <div class="text-h6 font-weight-bold text-blue-darken-2">
                    {{ formatNum(fuelStats.dieselLiters) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">L</div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">Amount</div>
                  <div class="text-body-2 font-weight-bold">
                    {{ formatCurrency(fuelStats.dieselAmount) }}
                  </div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">
                    {{ fuelAllocation.allocatedDiesel > 0 ? 'Remaining' : 'Withdrawals' }}
                  </div>
                  <div
                    class="text-h6 font-weight-bold"
                    :class="
                      fuelAllocation.allocatedDiesel > 0
                        ? fuelAllocation.remainingDiesel < 0
                          ? 'text-error'
                          : 'text-success'
                        : ''
                    "
                  >
                    {{
                      fuelAllocation.allocatedDiesel > 0
                        ? formatNum(Math.abs(fuelAllocation.remainingDiesel))
                        : fuelStats.dieselCount
                    }}
                  </div>
                  <div
                    class="text-caption text-medium-emphasis"
                    v-if="fuelAllocation.allocatedDiesel > 0"
                  >
                    L
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Gasoline card -->
        <v-col cols="12" sm="6">
          <v-card
            rounded="lg"
            elevation="0"
            border
            class="kpi-card"
            style="cursor: pointer"
            @click="$router.push('/fuel-transactions')"
          >
            <div class="kpi-top-border" style="background: #1a6e2e" />
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-3 mb-3">
                <v-avatar color="green-darken-2" variant="tonal" size="40">
                  <v-icon size="20">mdi-gas-station</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-bold">Gasoline</div>
                  <div class="text-caption text-medium-emphasis">FY {{ selectedYear }}</div>
                </div>
                <v-spacer />
                <div class="text-right" v-if="fuelAllocation.allocatedGasoline > 0">
                  <div class="text-caption text-medium-emphasis">Allocated</div>
                  <div class="text-body-2 font-weight-bold">
                    {{ formatNum(fuelAllocation.allocatedGasoline) }} L
                  </div>
                </div>
              </div>
              <!-- Consumed vs allocated progress -->
              <div class="mb-3" v-if="fuelAllocation.allocatedGasoline > 0">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-caption text-medium-emphasis">Consumed vs Allocated</span>
                  <span
                    class="text-caption font-weight-medium"
                    :class="
                      fuelAllocation.gasolinePct >= 90
                        ? 'text-error'
                        : fuelAllocation.gasolinePct >= 75
                          ? 'text-warning'
                          : 'text-success'
                    "
                  >
                    {{ fuelAllocation.gasolinePct }}%
                  </span>
                </div>
                <div class="util-bar-track">
                  <div
                    class="util-bar-fill"
                    :style="{
                      width: Math.min(fuelAllocation.gasolinePct, 100) + '%',
                      background:
                        fuelAllocation.gasolinePct >= 90
                          ? '#d32f2f'
                          : fuelAllocation.gasolinePct >= 75
                            ? '#f57c00'
                            : '#1a6e2e',
                    }"
                  />
                </div>
              </div>
              <v-divider class="mb-3" />
              <v-row density="compact">
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">Consumed</div>
                  <div class="text-h6 font-weight-bold text-green-darken-2">
                    {{ formatNum(fuelStats.gasolineLiters) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">L</div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">Amount</div>
                  <div class="text-body-2 font-weight-bold">
                    {{ formatCurrency(fuelStats.gasolineAmount) }}
                  </div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis mb-1">
                    {{ fuelAllocation.allocatedGasoline > 0 ? 'Remaining' : 'Withdrawals' }}
                  </div>
                  <div
                    class="text-h6 font-weight-bold"
                    :class="
                      fuelAllocation.allocatedGasoline > 0
                        ? fuelAllocation.remainingGasoline < 0
                          ? 'text-error'
                          : 'text-success'
                        : ''
                    "
                  >
                    {{
                      fuelAllocation.allocatedGasoline > 0
                        ? formatNum(Math.abs(fuelAllocation.remainingGasoline))
                        : fuelStats.gasolineCount
                    }}
                  </div>
                  <div
                    class="text-caption text-medium-emphasis"
                    v-if="fuelAllocation.allocatedGasoline > 0"
                  >
                    L
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- 6. TOP 5 VEHICLE CONSUMPTION                       -->
      <!--    Replaces the heavy full data-table              -->
      <!-- ══════════════════════════════════════════════════ -->
      <div class="section-label mb-3">
        <span>Top Vehicle Consumption — FY {{ selectedYear }}</span>
      </div>
      <v-row density="comfortable" class="mb-4">
        <v-col cols="12">
          <v-card rounded="lg" elevation="0" border class="kpi-card">
            <v-card-text class="pa-4">
              <div v-if="top5Assets.length === 0" class="empty-state-panel">
                <v-icon size="36" color="grey-lighten-1" class="mb-2">mdi-car-outline</v-icon>
                <p class="text-caption text-medium-emphasis mb-3">
                  No fuel transactions recorded yet
                </p>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="primary"
                  to="/fuel-transactions"
                  prepend-icon="mdi-plus"
                >
                  Add Transaction
                </v-btn>
              </div>
              <div v-else>
                <div
                  v-for="(asset, i) in top5Assets"
                  :key="asset.id"
                  class="top5-row d-flex align-center ga-3 py-2 clickable-row"
                  @click="$router.push('/fuel-transactions')"
                >
                  <div class="top5-rank text-caption font-weight-bold text-medium-emphasis">
                    {{ i + 1 }}
                  </div>
                  <v-chip
                    :color="asset.asset_type === 'Vehicle' ? 'primary' : 'warning'"
                    size="x-small"
                    variant="tonal"
                    class="flex-shrink-0"
                  >
                    {{ asset.asset_type === 'Vehicle' ? 'V' : 'NV' }}
                  </v-chip>
                  <div class="flex-grow-1 min-width-0">
                    <div class="text-body-2 font-weight-medium text-truncate">
                      {{ asset.asset_name }}
                    </div>
                    <div class="top5-bar-track mt-1">
                      <div
                        class="top5-bar-fill"
                        :style="`width: ${asset.pct}%; background: ${asset.asset_type === 'Vehicle' ? '#1565c0' : '#c9960c'}`"
                      />
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <div class="text-body-2 font-weight-bold">
                      {{ formatNum(asset.total_liters) }} L
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatCurrency(asset.total_amount) }}
                    </div>
                  </div>
                </div>
                <v-divider class="my-3" />
                <div class="d-flex justify-end">
                  <v-btn
                    variant="text"
                    size="small"
                    color="primary"
                    to="/fuel-transactions"
                    append-icon="mdi-arrow-right"
                  >
                    View All Transactions
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

// ── Year selector ──
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const yearOptions = computed(() => [currentYear - 2, currentYear - 1, currentYear].reverse())

// Show actual refresh time instead of just today's date
const lastRefreshed = ref('—')
function updateRefreshTime() {
  lastRefreshed.value = new Date().toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Single loading flag ──
const loadingAll = ref(true)

// ── KPI cards — each links to its module ──
const kpiCards = ref([
  {
    label: 'Total Assets',
    icon: 'mdi-car',
    color: 'primary',
    borderColor: '#1a6e2e',
    value: '—',
    sub: 'Active vehicles & equipment',
    route: '/vehicles',
  },
  {
    label: 'Service Requests',
    icon: 'mdi-wrench',
    color: 'orange',
    borderColor: '#d4621a',
    value: '—',
    sub: 'This year',
    route: '/vehicle-requests',
  },
  {
    label: 'PM Completed',
    icon: 'mdi-check-circle',
    color: 'success',
    borderColor: '#c9960c',
    value: '—',
    sub: 'This year',
    route: '/vehicle-pm',
  },
  {
    label: 'Total Fuel Cost',
    icon: 'mdi-gas-station',
    color: 'blue',
    borderColor: '#1565c0',
    value: '—',
    sub: 'This year (₱)',
    route: '/fuel-transactions',
  },
])

// ── Fuel stats ──
const fuelStats = ref({
  dieselLiters: 0,
  dieselAmount: 0,
  dieselCount: 0,
  gasolineLiters: 0,
  gasolineAmount: 0,
  gasolineCount: 0,
})

// ── Fuel allocation (from fuel_contracts allocated_diesel / allocated_gasoline) ──
const fuelAllocation = ref({
  allocatedDiesel: 0,
  allocatedGasoline: 0,
  remainingDiesel: 0,
  remainingGasoline: 0,
  dieselPct: 0,
  gasolinePct: 0,
})

// ── Diesel vs Gasoline proportion bar ──
const dieselPct = computed(() => {
  const total = fuelStats.value.dieselLiters + fuelStats.value.gasolineLiters
  if (total === 0) return 50
  return Math.round((fuelStats.value.dieselLiters / total) * 100)
})

// ── Top 5 assets by liters ──
const assetRows = ref([])
const top5Assets = computed(() => {
  const withFuel = assetRows.value.filter((r) => r.total_liters > 0)
  const maxL = withFuel.length > 0 ? Math.max(...withFuel.map((r) => r.total_liters)) : 1
  return withFuel
    .sort((a, b) => b.total_liters - a.total_liters)
    .slice(0, 5)
    .map((r) => ({ ...r, pct: Math.round((r.total_liters / maxL) * 100) }))
})

// ── SR, PM, AC ──
const recentSR = ref([])
const upcomingPM = ref([])
const upcomingACCleaning = ref([])

// ── Fuel budget ──
const fuelBudget = ref({
  totalContractAmount: 0,
  totalConsumed: 0,
  totalBalance: 0,
  totalContracts: 0,
  overBudgetCount: 0,
  utilizationPct: 0,
  totalTransactions: 0,
  currentPeriodTransactions: 0,
})
const budgetAlerts = ref([])

// ── Helpers ──
function formatNum(n) {
  return Number(n || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
function formatCurrency(n) {
  return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
function srColor(s) {
  return (
    { Pending: 'warning', 'In Progress': 'info', Completed: 'success', Cancelled: 'grey' }[s] ||
    'grey'
  )
}
function daysUntil(d) {
  if (!d) return 0
  return Math.max(0, Math.ceil((new Date(d + 'T00:00:00') - new Date()) / 86400000))
}
function dueColor(d) {
  const days = daysUntil(d)
  if (days <= 0) return 'error'
  if (days <= 7) return 'error'
  if (days <= 14) return 'warning'
  return 'success'
}

// ── Load everything ──
// Queries: vehicles, fuel_transactions, fuel_contracts (with allocated liters),
//          SR count, PM count, AC cleaning count — then conditionally fetch rows.
async function loadAll() {
  loadingAll.value = true
  const yr = selectedYear.value
  const startDate = `${yr}-01-01`
  const endDate = `${yr}-12-31`
  const today = new Date().toISOString().split('T')[0]
  const plus30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  // ── Round 1: all base data in parallel ──
  const [vehiclesRes, txRes, contractsRes, srCountRes, pmCountRes, acCountRes] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id, asset_name, asset_type')
      .eq('status', 'Active')
      .order('asset_name'),
    supabase
      .from('fuel_transactions')
      .select('vehicle, fuel_type, quantity, total_amount, contract_id, billing_period')
      .gte('date', startDate)
      .lte('date', endDate),
    // Include allocated_diesel and allocated_gasoline for the fuel allocation cards
    supabase
      .from('fuel_contracts')
      .select(
        'id, contract_amount, account_code, fund_cluster, allocated_diesel, allocated_gasoline',
      )
      .eq('year', yr),
    supabase
      .from('vehicle_service_requests')
      .select('id', { count: 'exact', head: true })
      .gte('date_of_request', startDate)
      .lte('date_of_request', endDate),
    supabase
      .from('vehicle_pm_log')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Completed')
      .gte('date_performed', startDate)
      .lte('date_performed', endDate),
    // AC cleaning: count upcoming due in next 30 days (not Completed)
    supabase
      .from('ac_cleaning_log')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'Completed')
      .gte('next_cleaning_date', today)
      .lte('next_cleaning_date', plus30),
  ])

  const allVehicles = vehiclesRes.data || []
  const txRows = txRes.data || []
  const contracts = contractsRes.data || []

  // ── KPI cards ──
  const totalFuel = txRows.reduce((s, r) => s + (Number(r.total_amount) || 0), 0)
  kpiCards.value = [
    {
      label: 'Total Assets',
      icon: 'mdi-car',
      color: 'primary',
      borderColor: '#1a6e2e',
      value: allVehicles.length,
      sub: 'Active vehicles & equipment',
      route: '/vehicles',
    },
    {
      label: 'Service Requests',
      icon: 'mdi-wrench',
      color: 'orange',
      borderColor: '#d4621a',
      value: srCountRes.count ?? 0,
      sub: `${yr} records`,
      route: '/vehicle-requests',
    },
    {
      label: 'PM Completed',
      icon: 'mdi-check-circle',
      color: 'success',
      borderColor: '#c9960c',
      value: pmCountRes.count ?? 0,
      sub: `${yr} records`,
      route: '/vehicle-pm',
    },
    {
      label: 'Total Fuel Cost',
      icon: 'mdi-gas-station',
      color: 'blue',
      borderColor: '#1565c0',
      value: '₱' + formatNum(totalFuel),
      sub: `${yr} transactions`,
      route: '/fuel-transactions',
    },
  ]

  // ── Fuel stats ──
  const diesel = txRows.filter((r) => r.fuel_type === 'Diesel')
  const gasoline = txRows.filter((r) => r.fuel_type === 'Gasoline')
  fuelStats.value = {
    dieselLiters: diesel.reduce((s, r) => s + (Number(r.quantity) || 0), 0),
    dieselAmount: diesel.reduce((s, r) => s + (Number(r.total_amount) || 0), 0),
    dieselCount: diesel.length,
    gasolineLiters: gasoline.reduce((s, r) => s + (Number(r.quantity) || 0), 0),
    gasolineAmount: gasoline.reduce((s, r) => s + (Number(r.total_amount) || 0), 0),
    gasolineCount: gasoline.length,
  }

  // ── Fuel allocation (from contracts — allocated_diesel / allocated_gasoline) ──
  const allocatedDiesel = contracts.reduce((s, c) => s + (c.allocated_diesel || 0), 0)
  const allocatedGasoline = contracts.reduce((s, c) => s + (c.allocated_gasoline || 0), 0)
  const consumedDiesel = fuelStats.value.dieselLiters
  const consumedGasoline = fuelStats.value.gasolineLiters
  fuelAllocation.value = {
    allocatedDiesel,
    allocatedGasoline,
    remainingDiesel: allocatedDiesel - consumedDiesel,
    remainingGasoline: allocatedGasoline - consumedGasoline,
    dieselPct: allocatedDiesel > 0 ? Math.round((consumedDiesel / allocatedDiesel) * 100) : 0,
    gasolinePct:
      allocatedGasoline > 0 ? Math.round((consumedGasoline / allocatedGasoline) * 100) : 0,
  }

  // ── Asset rows (for Top 5) ──
  assetRows.value = allVehicles.map((v) => {
    const nm = (v.asset_name || '').toLowerCase()
    const matching = txRows.filter((r) => (r.vehicle || '').toLowerCase().includes(nm))
    const dL = matching
      .filter((r) => r.fuel_type === 'Diesel')
      .reduce((s, r) => s + (Number(r.quantity) || 0), 0)
    const gL = matching
      .filter((r) => r.fuel_type === 'Gasoline')
      .reduce((s, r) => s + (Number(r.quantity) || 0), 0)
    const allAmt = matching.reduce((s, r) => s + (Number(r.total_amount) || 0), 0)
    return {
      id: v.id,
      asset_name: v.asset_name,
      asset_type: v.asset_type,
      total_liters: Math.round((dL + gL) * 100) / 100,
      total_amount: Math.round(allAmt * 100) / 100,
    }
  })

  // ── Fuel budget ──
  const consumedMap = new Map()
  txRows.forEach((t) => {
    if (!t.contract_id) return
    consumedMap.set(t.contract_id, (consumedMap.get(t.contract_id) || 0) + (t.total_amount || 0))
  })
  const totalContractAmount = contracts.reduce((s, c) => s + (c.contract_amount || 0), 0)
  const totalConsumed = txRows.reduce((s, t) => s + (t.total_amount || 0), 0)
  const alerts = []
  contracts.forEach((c) => {
    const consumed = consumedMap.get(c.id) || 0
    const balance = (c.contract_amount || 0) - consumed
    const pct = c.contract_amount > 0 ? (consumed / c.contract_amount) * 100 : 0
    if (balance < 0)
      alerts.push({
        id: c.id,
        type: 'error',
        name: c.account_code,
        message: `is ₱${formatNum(Math.abs(balance))} over budget`,
      })
    else if (pct >= 90)
      alerts.push({
        id: c.id,
        type: 'warning',
        name: c.account_code,
        message: `at ${pct.toFixed(1)}% utilized. ₱${formatNum(balance)} remaining`,
      })
  })
  const periodCounts = {}
  txRows.forEach((t) => {
    if (t.billing_period) periodCounts[t.billing_period] = (periodCounts[t.billing_period] || 0) + 1
  })
  const currentPeriod = Object.keys(periodCounts).sort().pop() || ''
  const utilizationPct =
    totalContractAmount > 0 ? Math.round((totalConsumed / totalContractAmount) * 1000) / 10 : 0
  fuelBudget.value = {
    totalContractAmount,
    totalConsumed,
    totalBalance: totalContractAmount - totalConsumed,
    totalContracts: contracts.length,
    overBudgetCount: alerts.filter((a) => a.type === 'error').length,
    utilizationPct,
    totalTransactions: txRows.length,
    currentPeriodTransactions: periodCounts[currentPeriod] || 0,
  }
  budgetAlerts.value = alerts.sort((a, b) =>
    a.type === 'error' && b.type !== 'error' ? -1 : b.type === 'error' ? 1 : 0,
  )

  // ── Round 2: fetch SR / PM rows only if data exists; AC always fetched ──
  const hasSR = (srCountRes.count ?? 0) > 0
  const hasPM = (pmCountRes.count ?? 0) > 0
  const hasAC = (acCountRes.count ?? 0) > 0

  const vMap = Object.fromEntries(allVehicles.map((v) => [String(v.id), v.asset_name]))

  const [srRes, pmRes, acRes] = await Promise.all([
    hasSR
      ? supabase
          .from('vehicle_service_requests')
          .select('id, request_no, date_of_request, status, vehicle_id')
          .order('date_of_request', { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] }),
    hasPM
      ? supabase
          .from('vehicle_pm_log')
          .select('id, vehicle_id, service_type, next_due_date, status')
          .neq('status', 'Completed')
          .gte('next_due_date', today)
          .lte('next_due_date', plus30)
          .order('next_due_date')
          .limit(8)
      : Promise.resolve({ data: [] }),
    hasAC
      ? supabase
          .from('ac_cleaning_log')
          .select('id, building, area_room, next_cleaning_date, status')
          .neq('status', 'Completed')
          .gte('next_cleaning_date', today)
          .lte('next_cleaning_date', plus30)
          .order('next_cleaning_date')
          .limit(8)
      : Promise.resolve({ data: [] }),
  ])

  recentSR.value = (srRes.data || []).map((r) => ({
    ...r,
    asset_name: vMap[String(r.vehicle_id)] || `Asset #${r.vehicle_id}`,
  }))
  upcomingPM.value = (pmRes.data || []).map((r) => ({
    ...r,
    asset_name: vMap[String(r.vehicle_id)] || `Asset #${r.vehicle_id}`,
  }))
  upcomingACCleaning.value = acRes.data || []

  updateRefreshTime()
  loadingAll.value = false
}

onMounted(() => loadAll())
</script>

<style scoped>
/* ── CSU Brand Colors ──────────────────────────── */
/* Green: #1a6e2e  Gold: #c9960c  Orange: #d4621a  */

/* ── Header chip ── */
.csu-updated-chip {
  background: rgba(26, 110, 46, 0.1) !important;
  color: #1a6e2e !important;
  font-size: 11px !important;
}

/* ── Section labels ── */
.section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 10px;
  border-left: 3px solid #1a6e2e;
}
.section-label span {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  opacity: 0.7;
}

/* ── Cards ── */
.kpi-card {
  overflow: hidden;
  transition:
    box-shadow 0.2s,
    transform 0.15s;
}
.kpi-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
  transform: translateY(-1px);
}
.kpi-top-border {
  height: 3px;
  width: 100%;
}

/* ── Progress bars ── */
.util-bar-track {
  height: 6px;
  border-radius: 99px;
  background: rgba(128, 128, 128, 0.15);
  overflow: hidden;
}
.util-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s ease;
}

/* ── Fuel split bar (shared above both fuel cards) ── */
.fuel-split-track {
  height: 7px;
  border-radius: 99px;
  overflow: hidden;
  display: flex;
}
.fuel-split-diesel {
  height: 100%;
  background: #1565c0;
  transition: width 0.6s ease;
}
.fuel-split-gasoline {
  height: 100%;
  background: #1a6e2e;
  transition: width 0.6s ease;
}

/* ── Clickable rows ── */
.clickable-row {
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}
.clickable-row:hover {
  background: rgba(26, 110, 46, 0.06) !important;
}

/* ── SR / PM list rows ── */
.sr-row {
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}
.sr-row:last-child {
  border-bottom: none;
}

/* ── Empty state ── */
.empty-state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  text-align: center;
}

/* ── Top 5 bar ── */
.top5-row {
  border-radius: 6px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.08);
}
.top5-row:last-child {
  border-bottom: none;
}
.top5-rank {
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}
.top5-bar-track {
  height: 4px;
  border-radius: 99px;
  background: rgba(128, 128, 128, 0.12);
  overflow: hidden;
}
.top5-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}

/* ── Text truncate ── */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.min-width-0 {
  min-width: 0;
}
</style>
