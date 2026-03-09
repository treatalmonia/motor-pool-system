# Motor Pool & AC Management System — Project Reference

## About This Project
A full-stack web system built by an OJT student at **Caraga State University (CSU)**, Butuan City, Philippines.
Manages vehicle/equipment assets, preventive maintenance, AC units, and service requests for the General Services Office / Motor Pool division.

**OJT Hours Remaining:** ~300 hours (as of early March 2026)
**Developer Level:** Beginner full-stack

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue.js 3 (Composition API + `<script setup>`) |
| UI Framework | Vuetify 3 |
| Backend / DB | Supabase (PostgreSQL, Singapore region) |
| Auth | None (RLS disabled on all tables) |
| Package Manager | npm |
| Local Dev Server | Laragon |
| Version Control | GitHub |

**Supabase URL:** `https://zhjggszrogktpbgfqtti.supabase.co`
**Project Path:** `C:\DevTools\laragon\www\motor-pool-system`
**GitHub:** `treatalmonia/motor-pool-system`

---

## Project Structure

```
src/
├── views/
│   ├── VehiclesView.vue         # Module 2 — Assets Registry
│   ├── VehicleRequestsView.vue  # Module 3 — Service Requests
│   ├── VehiclePMView.vue        # Module 4 — PM Log
│   ├── ACUnitsView.vue          # Module 5 — AC Unit Registry
│   ├── ACRequestsView.vue       # Module 6 — AC Service Requests
│   ├── ACCleaningView.vue       # Module 7 — AC Cleaning Log
│   ├── PMProgramView.vue        # Module 9 — PM Program
│   └── AnnualPMView.vue         # Module 10 — Annual PM Program
├── layouts/
│   └── MainLayout.vue           # Sidebar navigation + app shell
├── router/
│   └── index.js                 # Vue Router config
└── supabase.js                  # Supabase client init
public/
└── images/
    ├── header_banner.png        # CSU full header banner (left side)
    ├── bagong_pilipinas.png     # Bagong Pilipinas logo (right side)
    └── socotec_ab.png           # SOCOTEC/AB certification logo (right side)
```

---

## Database Tables

### `vehicles` — Assets Registry
Stores all assets (vehicles AND non-vehicular equipment).

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| asset_name | text | Renamed from `unit_name` |
| asset_type | text | `'Vehicle'` or `'Non-Vehicular'` |
| eqf_code | text | Equipment code |
| model | text | |
| year_model | text | |
| engine_number | text | |
| displacement | text | |
| plate_number | text | |
| body_type | text | Vehicle only |
| assigned_driver | text | Vehicle only |
| chassis_number | text | Non-Vehicular only |
| operator | text | Non-Vehicular only |
| status | text | `'Active'` / `'Inactive'` |
| created_at | timestamptz | |

### `vehicle_service_requests` — Service Requests

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| request_no | text | Auto-generated: `2025-001` format |
| date_of_request | date | |
| vehicle_id | uuid | FK → vehicles.id |
| asset_type | text | `'Vehicle'` or `'Non-Vehicular'` |
| requisitioner | text | |
| problem_details | text | |
| work_details | text | |
| conducted_by | text | |
| mileage | numeric | Vehicle only |
| hours_of_operation | numeric | Non-Vehicular only |
| cost | numeric | |
| status | text | `'In Progress'` / `'Completed'` / `'Cancelled'` |
| created_at | timestamptz | |

### `vehicle_pm_log` — PM Log

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| vehicle_id | uuid | FK → vehicles.id |
| asset_type | text | `'Vehicle'` or `'Non-Vehicular'` |
| service_type | text | |
| date_performed | date | |
| odometer | numeric | Vehicle only |
| hours_of_operation | numeric | Non-Vehicular only |
| km_between_service | integer | Vehicle only, from PM Program |
| months_between_service | integer | Both types |
| next_due_date | date | Auto-calculated |
| next_due_odometer | numeric | Vehicle only, auto-calculated |
| conducted_by | text | |
| cost | numeric | |
| status | text | `'Scheduled'` / `'Completed'` / `'Cancelled'` |
| remarks | text | |
| created_at | timestamptz | |

### `ac_units` — AC Unit Registry

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| building | text | 6 buildings |
| floor | text | |
| area_room | text | |
| unit_type | text | Floor-Mounted / Wall-Mounted / Window Type / Ceiling Type |
| num_units | integer | |
| brand | text | 11 brands |
| capacity | text | 1.0–5.0 TR/HP |
| technology | text | `'Inverter'` / `'Non-Inverter'` |
| status | text | `'Active'` / `'Inactive'` / `'Transferred'` / `'Decommissioned'` |
| remarks | text | |
| created_at | timestamptz | |

### `ac_service_requests` — AC Service Requests

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| request_no | text | Auto-generated: `AC-25-001` format |
| date_received | date | |
| ac_unit_id | uuid | FK → ac_units.id |
| building | text | Auto-filled from AC unit |
| area_room | text | Auto-filled from AC unit |
| details_of_request | text | |
| remarks | text | |
| status | text | `'Pending'` / `'Forwarded to Tech.'` / `'Completed'` |
| created_at | timestamptz | |

### `ac_cleaning_log` — AC Cleaning Log

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| ac_unit_id | uuid | FK → ac_units.id |
| building | text | |
| area_room | text | |
| last_cleaning_date | date | |
| next_cleaning_date | date | Auto: last + 3 months |
| conducted_by | text | |
| status | text | `'Pending'` / `'Forwarded to Tech.'` / `'Completed'` |
| remarks | text | |
| created_at | timestamptz | |

### `pm_service_types` — PM Program

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| service_type | text | e.g. `'Change Engine Oil'` |
| km_between_service | integer | nullable |
| months_between_service | integer | nullable |
| remarks | text | |
| created_at | timestamptz | |

### `annual_pm_program` — Annual PM Program

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| year | integer | e.g. `2026` |
| description | text | Category group |
| component | text | |
| task | text | |
| freq_daily | boolean | |
| freq_weekly | boolean | |
| freq_monthly | boolean | |
| freq_quarterly | boolean | |
| freq_biannual | boolean | |
| freq_annual | boolean | |
| responsible | text | |
| remarks | text | |
| sort_order | integer | |
| created_at | timestamptz | |

### `pm_signatories` — Annual PM Signatories
Single row table. Editable via UI.

| Column | Type |
|---|---|
| prepared_by_name | text |
| prepared_by_title | text |
| reviewed_by_name | text |
| reviewed_by_title | text |
| approved_by_name | text |
| approved_by_title | text |

---

## Module Summary

| # | Module | File | Route | Status |
|---|---|---|---|---|
| 1 | Navigation & Layout | MainLayout.vue | — | ✅ Done |
| 2 | Assets Registry | VehiclesView.vue | `/vehicles` | ✅ Done |
| 3 | Service Requests | VehicleRequestsView.vue | `/vehicle-requests` | ✅ Done |
| 4 | PM Log | VehiclePMView.vue | `/vehicle-pm` | ✅ Done |
| 5 | AC Unit Registry | ACUnitsView.vue | `/ac-units` | ✅ Done |
| 6 | AC Service Requests | ACRequestsView.vue | `/ac-requests` | ✅ Done |
| 7 | AC Cleaning Log | ACCleaningView.vue | `/ac-cleaning` | ✅ Done |
| 8 | Dashboard | — | `/` | ⏳ Pending |
| 9 | PM Program | PMProgramView.vue | `/pm-program` | ✅ Done |
| 10 | Annual PM Program | AnnualPMView.vue | `/annual-pm` | ✅ Done |
| 11 | Fuel Consumption | — | `/fuel` | ⏳ Pending |

---

## Key Business Rules

### Assets (Module 2)
- Asset Type: `Vehicle` or `Non-Vehicular`
- Vehicle-only fields: Body Type, Assigned Driver
- Non-Vehicular-only fields: Chassis Number, Operator
- Non-vehicular examples: Chainsaw, Grasscutter, Farm Tractor, Generator, Motorcycle, Brushcutter

### Service Requests (Module 3)
- Request number format: `2025-001` (year-sequence, auto-generated)
- Vehicle: shows Mileage field
- Non-Vehicular: shows Hours of Operation field
- Asset dropdown is grouped: VEHICLE section / NON-VEHICULAR section
- Header items use sentinel values `__header_vehicle__` and `__header_nonvehicle__`
- Status: `In Progress` → `Completed` / `Cancelled`

### PM Log (Module 4)
- Service type selected → KM and Months auto-fill from `pm_service_types`
- Date Performed + Months → Next Due Date auto-calculates
- Odometer + KM interval → Next Due Odometer auto-calculates
- Vehicle: shows Odometer, KM Between Service, Next Due Odometer
- Non-Vehicular: shows Hours of Operation only, Months defaults to 6
- KM Between Service and Months Between Service are **read-only** (auto-filled, grey bg)
- Next Due Odometer is **manually editable**
- Date format displayed: `MM/DD/YY`
- Numeric fields formatted with comma separators
- Status options: `Scheduled`, `Completed`, `Cancelled`
- Overdue = next_due_date < today AND status not Completed/Cancelled
- Overdue rows highlighted `bg-red-lighten-5`

### AC Cleaning Log (Module 7)
- Next cleaning = last cleaning + 3 months (auto-calculated)
- Overdue is auto-detected, NOT a selectable status
- Status: `Pending`, `Forwarded to Tech.`, `Completed`

### PM Program (Module 9)
- 28 pre-loaded service types with default intervals
- Defaults only change when manually edited in PM Program module
- PM Log pulls defaults but does NOT write back on save

### Annual PM Program (Module 10)
- Planning purposes only — vehicles only, no non-vehicular
- Year-based data — copy one year to another via UI
- Frequency shown as yellow filled cells (matching official PDF format)
- Header: CSU banner left, Bagong Pilipinas + SOCOTEC/AB logos right
- Signatories editable via UI (stored in `pm_signatories`)
- Print outputs A4 landscape matching official document format

---

## UI/UX Conventions
- All views: `v-container fluid`
- Summary cards at top of every module using `v-avatar` + `v-card`
- `v-data-table` for all lists with search + filter row above
- Standard dialog set per module: Add, Edit, View Details, Delete Confirmation
- Snackbar: `location="bottom right"`, `:timeout="3000"`
- Grouped asset dropdowns: disabled headers, sentinel values for Vehicle/Non-Vehicular
- Date display format: `MM/DD/YY` — use `formatDate()` helper, NOT `type="date"`
- Numeric display: always use `.toLocaleString()` for comma separators
- Overdue rows: `bg-red-lighten-5` class on `<tr>`
- Color theme: Vuetify green (`green-darken-2`, `#1B5E20`, `#2E7D32`)
- Form fields: `variant="outlined"` `density="comfortable"`
- Read-only fields: `readonly` + `bg-color="grey-lighten-4"`

---

## ESLint Rules (Important)
- Unused variables are **errors**, not warnings
- `_` prefix does NOT suppress the error
- Fix: use `// eslint-disable-next-line no-unused-vars` on the line above

---

## Common Gotchas
- `unit_name` was renamed to `asset_name` in `vehicles` table — always use `asset_name`
- Campus network may block GitHub — use mobile hotspot as backup
- `type="date"` inputs show browser-native format — always use plain text + manual parsing
- Supabase date columns return ISO strings — always append `T00:00:00` before creating a `new Date()` to avoid timezone shift
- Next Due Date calculation must use `new Date(year, month - 1 + months, day)` directly — never use `setMonth()` on a parsed date string

---

## Pending Modules

### Module 11 — Fuel Consumption
- Log fuel fill-ups per asset (vehicles primarily)
- Fields: asset, date, liters, odometer, cost per liter, total cost, station/supplier
- Calculate: fuel consumption (km/L), cost per km
- Summary cards: total fuel cost, average consumption

### Module 8 — Dashboard
- Build last, after Fuel Consumption
- System-wide summary cards
- Charts: PM status, AC cleaning status, service request breakdown
- Recent activity feed
- Overdue alerts

---

## Signatories (Editable via UI — stored in `pm_signatories`)
- **Prepared By:** ENGR. ENA TIU-IBARRA — AO III, General Services Office / Motor pool-in-charge
- **Reviewed By:** ENGR. MARIEL M. DELO — Director, General Services Office
- **Approved By:** ALEXANDER T. DEMETILLO, D.ENG — VP for Administration and Finance
