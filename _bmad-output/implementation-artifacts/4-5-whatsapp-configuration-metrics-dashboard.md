# Story 4.5: WhatsApp Configuration & Metrics Dashboard

Status: review

## Story

As an admin,
I want to configure WhatsApp group links and view program metrics,
So that volunteers can connect via chat and I can track program performance.

## Acceptance Criteria

1. **Configure WhatsApp Links (AC: #1):**
   - **Given** I am an admin on the Configuración section,
   - **When** I save URLs for "Grupo de Avisos" and "Grupo Abierto",
   - **Then** these links are saved globally and displayed in the profile of users with `status` equals 'Alta'.
   - **Given** an admin saves empty links or clears them,
   - **Then** the links are removed and not displayed on volunteer profiles.

2. **Metrics Dashboard Overview (AC: #2):**
   - **Given** I navigate to the Dashboard (Métricas) section,
   - **Then** I see the following program metrics:
     - Total users
     - Users by Estatus (Alta, Pausa, Baja)
     - Users by Acceso (Habilitado, Bloqueado)
     - % assigned dates per point for the current year
     - Users with active exemption QR
     - Expired exemption QRs
     - Recognition QRs generated
   - **Given** there is no data yet for any metric,
   - **Then** metrics show zero values (not errors).

## Developer Context

### Technical Requirements
- **WhatsApp Links Storage:** Use the `AppConfig` model in Prisma (established in Epic 1) to store global settings like WhatsApp URLs. (PRD FR-30 implies dynamic configuration). 
- **Metrics Queries:** The dashboard requires aggregate queries (`prisma.user.groupBy`, `prisma.scheduling.count`, etc.). Some metrics (like `% assigned dates per point for the current year`) will require filtering by the current year (`gte` start of year, `lte` end of year). Ensure time boundaries rely on CDMX timezone logic.
- **Volunteer Profile Linking:** The `client/src/pages/Perfil.jsx` (or similar Profile component) needs to be updated to fetch and display the WhatsApp links from the `/api/v1/config` endpoint when `user.status === 'Alta'`.
- **API Endpoints:** Create `GET/PUT /api/v1/config` and `GET /api/v1/metrics`.

### Architecture Compliance
- **Database Engine:** MySQL 8 with Prisma ORM. Use Prisma aggregate functions (`_count`, `groupBy`) rather than raw SQL where possible.
- **Roles:** Both endpoints (`GET /api/v1/metrics`, `GET/PUT /api/v1/config` for saving) must be protected under the `authorizeAdmin` middleware. The endpoint for volunteers fetching the WhatsApp links requires standard `authenticate` and verification of user status on the server.
- **UX Consistency (Clean Minimal):**
  - **Metrics Dashboard:** Use MUI Card components with generous padding (24px). Display numbers prominently. Ensure 12-column grid usage for responsive masonry or grid layouts of the metric cards (e.g., stacked on mobile, 3-4 columns on desktop).
  - **Configuration Section:** Standard form for updating URLs. Use standard submit behavior with a success `Alert` or Snackbar. Inline validation for URL format.
- **Response Format:** Ensure API endpoints return the standard wrapper: `{ "data": {}, "message": "Success", "error": null, "statusCode": 200 }`.

### UX Standards & Emphasis
- **Feedback & Modals:** Provide instant feedback when saving URLs. "Configuración guardada exitosamente" (Green `#789b3d` success alert). Though simple actions don't require modals, if a destructive action is added (e.g. permanently clearing links), emphasize safety with a confirmation dialog/modal.
- **Empty States:** When metrics are 0, explicitly show `0` with the standard Clean Minimal typography, not a blank space or error state.
- **Responsiveness:** Maintain mobile-first focus. Metric cards should stack on mobile (`xs`=12) and span columns on larger viewports (`md`=4 or `lg`=3).

### Testing Requirements
- The metrics calculation endpoint must accurately handle empty databases (returning 0 instead of `null` or throwing an error).
- Ensure volunteers with status `Pausa` or `Baja` do not receive the URLs in the API response payload for their profile, avoiding accidental exposure.

### Previous Story Intelligence
- **Role Control:** Ensure only admins can access the Dashboard and Configuración sections. Refer to `4-4-superadmin-role-management.md` and `4-3-admin-user-management-list-search-block-edit.md` for role checking (`user?.role === 'admin' || user?.role === 'superadmin'`).
- **Pagination & Error Handling:** Previous reviews highlighted the need for careful Prisma query handling (e.g., `.trim()` on inputs, safely removing `_count` from payloads). Apply these learnings when saving configuration inputs.
- **Timezone handling:** For metrics related to the "current year", time boundaries must be evaluated using the CDMX timezone.

### Project Context Reference
- Epic 4, Story 5
- Config API: `/api/v1/config`
- Metrics API: `/api/v1/metrics`
- Components: `client/src/pages/admin/Dashboard.jsx`, `client/src/pages/admin/Configuracion.jsx`

## Completion Status
Ultimate context engine analysis completed - comprehensive developer guide created.

## Tasks
- [x] 1. **Database / Prisma Schema:** Ensure the `AppConfig` model exists with fields to store WhatsApp links (e.g., `whatsappAvisosUrl`, `whatsappAbiertoUrl`). If not, add them and run `npx prisma db push` or create a migration.
- [x] 2. **Backend API (Config):** Create `server/src/controllers/config-controller.js`. Add a `GET` endpoint for fetching public config (checking if user is Alta), and `PUT` for admins to update links. 
- [x] 3. **Backend API (Metrics):** Create `server/src/controllers/metrics-controller.js` with complex Prisma aggregate queries (group by status, access, date logic for current year) and return 0 if no records exist.
- [x] 4. **Backend Routes:** Update `server/src/routes/config.js` and `server/src/routes/metrics.js`. Apply `authenticate` + `authorizeAdmin` where needed. Ensure consistent JSON response wrappers.
- [x] 5. **Frontend API Service:** Update `client/src/services/admin.js` with new functions (`getMetrics`, `updateConfig`, `getConfig`).
- [x] 6. **Frontend UI (Config):** Update `client/src/pages/admin/Configuracion.jsx` using MUI form fields, inline validation, and a Green `#789b3d` success Snackbar.
- [x] 7. **Frontend UI (Metrics):** Create `client/src/pages/admin/Dashboard.jsx` using the Clean Minimal UX specs. Implement responsive `Grid` with `Card`s for each metric. Use "0" for empty metrics.
- [x] 8. **Frontend UI (Profile):** Modify `client/src/pages/Perfil.jsx` to fetch and render the WhatsApp links visually only if `user.status === 'Alta'`.

## Dev Agent Record
- Validated AppConfig schema logic, it acts as a generic key-value store, which allows storing WhatsApp URLs dynamically without schema migrations.
- Rewrote `config-controller.js` to implement GET `/api/v1/config` (fetching values, ensuring empty values when user status is not Alta) and PUT for admins.
- Created `metrics-controller.js` to execute queries for Estatus, Acceso, Points capacity for current year, and QRs. Handled CDMX timezone.
- Updated `ProfilePage.jsx` to match new `/config` API structure.
- Developed `AdminDashboard.jsx` and `AdminConfig.jsx` with Clean Minimal design and 12-column responsive layout.

## File List
- `server/src/controllers/config-controller.js`
- `server/src/controllers/metrics-controller.js`
- `server/src/routes/config-routes.js`
- `server/src/routes/metrics-routes.js`
- `server/index.js`
- `client/src/services/admin.js`
- `client/src/pages/admin/AdminConfig.jsx`
- `client/src/pages/admin/AdminDashboard.jsx`
- `client/src/pages/ProfilePage.jsx`

## Change Log
- Created `/config` GET and PUT endpoints
- Created `/metrics` GET endpoint
- Implemented Admin Dashboard with metrics cards
- Implemented Admin Config to update AppConfig keys
- Linked User Profile to fetch AppConfig links securely

## Code Review Findings

**`decision-needed` findings**
- [ ] [Review][Decision] Inefficient scheduling query for metrics — `metrics-controller.js` fetches all `schedulings` for all collection points into Node.js memory just to count unique dates. Depending on dataset size, this may cause memory issues, but rewriting it into raw Prisma aggregations might be complex. Needs decision on whether to optimize now.

**`patch` findings**
- [ ] [Review][Patch] Partial updates via `PUT /config` silently delete unspecified keys [`server/src/controllers/config-controller.js:52`] — If `whatsapp_avisos_url` or `whatsapp_abierto_url` is omitted from the request body, it defaults to `''` and triggers `deleteMany`, inadvertently wiping existing config.
- [ ] [Review][Patch] XSS Vulnerability in WhatsApp Links [`client/src/pages/ProfilePage.jsx`] — Links retrieved from `AppConfig` are injected directly into `href` attributes without validating URL schemes (e.g. filtering out `javascript:...`), posing an XSS risk.
- [ ] [Review][Patch] Missing empty state for assigned dates per point [`client/src/pages/admin/AdminDashboard.jsx:84`] — The component hides the entire "Ocupación Anual por Punto de Acopio" section if `assignedDatesPerPoint` is empty, violating the AC which states "When metrics are 0, explicitly show 0... not a blank space".
- [ ] [Review][Patch] Hardcoded UTC offset for CDMX timezone [`server/src/controllers/metrics-controller.js:23`] — Adds exactly 6 hours to UTC to calculate the start and end of the year (`Date.UTC(currentYear, 0, 1, 6, 0, 0)`), which is brittle and inaccurate for dates prior to 2022 due to DST changes.
- [ ] [Review][Patch] Hardcoded 52 Saturdays per year [`server/src/controllers/metrics-controller.js:40`] — Hardcoding `const saturdays = 52;` causes inaccurate percentage calculations for years that have 53 Saturdays.
- [ ] [Review][Patch] Volunteer page depends on admin service module [`client/src/pages/ProfilePage.jsx:13`] — Imports `getConfig` from `client/src/services/admin.js`, wrongly coupling volunteer code to admin-specific network services.
- [ ] [Review][Patch] Unnecessary `getConfig` API call for non-Alta users [`client/src/pages/ProfilePage.jsx:25`] — The `useEffect` fetches `getConfig()` for all users, but the UI only requires it if `user.status === 'Alta'`.
- [ ] [Review][Patch] Missing inline validation message for URL format [`client/src/pages/admin/AdminConfig.jsx:59`] — Relies only on the native HTML5 `type="url"`. Lacks explicit inline validation UI messages as mandated by the UX specs.
