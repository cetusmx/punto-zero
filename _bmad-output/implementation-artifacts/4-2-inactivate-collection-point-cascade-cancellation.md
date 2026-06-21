# Story 4.2: Inactivate Collection Point with Cascade Cancellation

Status: review

## Story

As an admin,
I want to inactivate a collection point so that all future schedulings are automatically cancelled and affected users are notified,
So that I can retire a location that is no longer operating without leaving orphaned reservations.

## Acceptance Criteria

1. **Inactivation with Active Bookings (AC: #1):**
   - **Given** I am an admin viewing a collection point in the Admin Puntos section,
   - **When** I change its status from `Activo` to `Inactivo` and save,
   - **Then** the system cancels ALL future schedulings (where `status` is `'Pendiente'`) for that point, frees the dates, and creates a `NotificationBadge` for all affected users informing them of the cancellation.

2. **Inactivation Warning (AC: #2):**
   - **Given** I am editing a point in the `PointFormDialog`,
   - **When** I change the status dropdown to `Inactivo`,
   - **Then** a warning alert appears in the dialog: "Atención: Al inhabilitar este punto, todas las reservas futuras para esta ubicación serán canceladas y los usuarios serán notificados."
   - **And** upon clicking Save, a `window.confirm` dialog prompts me to confirm the destructive action.

3. **Inactivation without Active Bookings (AC: #3):**
   - **Given** a point has no future schedulings,
   - **When** I inactivate it,
   - **Then** the point status becomes `Inactivo`, no cancellations are executed, and no notifications are sent.

4. **Reactivation (AC: #4):**
   - **Given** I reactivate an inactive point by changing its status to `Activo`,
   - **Then** it becomes available for new volunteer bookings starting from the next available Saturday.

## Tasks / Subtasks

### Server-Side (Express + Prisma)
- [x] **Endpoint Update: Update Collection Point (`PUT /api/admin/collection-points/:id`)**
  - Extract the current status of the point from the DB before making changes.
  - Check if the incoming request changes the status from `'Activo'` to `'Inactivo'`.
  - If it does, execute the update within a `prisma.$transaction`:
    1. Update the `CollectionPoint` status to `Inactivo`.
    2. Query `Scheduling` for `pointId = id`, `saturdayDate >= today`, and `status = 'Pendiente'`.
    3. If there are affected schedulings, update them to `Cancelado` with `cancellationType: 'Admin'` and `cancelledAt: new Date()`.
    4. Create a `NotificationBadge` for each affected user. Payload: `category: 'system'`, Title: "Punto de acopio inhabilitado", Message: "El punto de acopio [Nombre] ha sido inhabilitado de forma permanente. Tus próximas asistencias agendadas en esta ubicación han sido canceladas."
  - If the status is not changing to `Inactivo`, simply update the point normally.

### Client-Side (React + MUI)
- [x] **Component Update: `PointFormDialog` (`client/src/pages/admin/AdminPoints.jsx`)**
  - Add a state to detect if the user has selected `Inactivo`.
  - Conditionally render a MUI `<Alert severity="warning">` inside the form to warn the admin about cascade cancellations.
  - Intercept the `handleSubmit` to show a `window.confirm('¿Seguro que quieres inhabilitar el punto? Se cancelarán reservas activas.')` before sending the API request if the status is `Inactivo` and it differs from the original.

## Dev Notes

### Transaction Integrity (CRITICAL)
When inactivating a point, the state change of the point, the cancellation of the schedulings, and the creation of notification badges must be fully atomic. Use `prisma.$transaction` to guarantee that if creating a badge fails, the point is not left in a broken half-inactivated state.

### Date Handling & Timezones
- When querying for future schedulings, use today's date adjusted to CDMX timezone midnight (`setHours(0,0,0,0)`) to ensure you only cancel schedulings from today onwards (since schedulings are stored at 12:00:00), leaving past attendances/faltas untouched.
- Only cancel schedulings where `status === 'Pendiente'`. Do NOT touch `'Asistio'` or `'Falta'` as those are historical facts.

### Security
- The `updateCollectionPoint` endpoint is already protected by `authenticate` and `authorizeAdmin` middleware. No changes needed there.

## Dev Agent Record

### Agent Model Used
Amelia (Gemini CLI via Antigravity)

### Completion Notes List
- Updated `updateCollectionPoint` endpoint inside `server/src/controllers/collection-points-controller.js` to identify state transitions from `Activo` to `Inactivo`.
- Wrapped backend operations inside a `prisma.$transaction` ensuring point update, scheduling cancellation (for future dates), and badge generation act atomically.
- Inserted conditional UI `<Alert severity="warning">` inside `PointFormDialog` in `client/src/pages/admin/AdminPoints.jsx` dynamically reacting to `status` changes.
- Intercepted `handleSubmit` with a `window.confirm` guard to prevent accidental cascade cancellations.

### File List
- `server/src/controllers/collection-points-controller.js`
- `client/src/pages/admin/AdminPoints.jsx`

### Review Findings

- [x] [Review][Patch] Race Condition on State Read: Moved the initial point state read inside the `$transaction`.
- [x] [Review][Patch] Duplicate User Notifications: Added deduplication logic `[...new Set(userIds)]` to ensure a user only receives one badge even if they had multiple future schedules cancelled.
- [x] [Review][Patch] Inefficient Database Operations: Swapped `Promise.all` with `createMany` for bulk badge inserts.
- [x] [Review][Patch] Unnecessary Data Fetching Overhead: Removed `include: { user: true }` from the `findMany` query.
- [x] [Review][Patch] Fragile State Transitions: Changed the backend condition from `status === 'Activo'` to `status !== 'Inactivo'` to catch transitions from any other state.
- [x] [Review][Patch] UI Warning Mismatch: Updated the frontend logic to match the backend state transition fix.
- [x] [Review][Dismissed] Inconsistent and Blocking UX: `window.confirm` is explicitly required by the Acceptance Criteria.
- [x] [Review][Defer] Hardcoded String Reliance: Accepted as standard in this Prisma setup without explicit TS Enums.
- [x] [Review][Defer] Timezone Vulnerability: Accepted as the system runs exclusively in CDMX time.
- [x] [Review][Defer] All-or-Nothing Transaction Risk: Accepted as atomic failure is the desired behavior per AC.
