# Story 4.1: Collection Points CRUD & Saturday Exceptions

Status: done

## Story

As an admin,
I want to create, edit, activate, and deactivate collection points, and mark specific Saturdays as unavailable,
So that I can manage the volunteer locations and ensure accurate agenda scheduling.

## Acceptance Criteria

1. **Create and Edit Collection Points (AC: #1):**
   - **Given** I am an admin on the "Puntos de Acopio" section,
   - **When** I create a new point (name, colonia, address, maps location, hours),
   - **Then** it appears as `'Activo'` and becomes available for scheduling on all Saturdays.
   - **When** I edit an existing point's details,
   - **Then** changes are saved and reflected immediately across the app.

2. **Add Saturday Exceptions (AC: #2):**
   - **Given** I am managing a specific point,
   - **When** I mark a specific Saturday as "no disponible" (exception),
   - **Then** that Saturday becomes unavailable for new bookings.
   - **And** any existing future schedulings for that point on that date are cancelled (status updated to `'Cancelado'`, `cancellationType: 'Admin'`).
   - **And** the affected users receive a `NotificationBadge` explaining the cancellation.

3. **View and Remove Exceptions (AC: #3):**
   - **Given** I view a point that has Saturday exceptions,
   - **Then** I can see a list of which Saturdays are marked as unavailable.
   - **When** I remove an exception,
   - **Then** the date becomes available for booking again.

## Tasks / Subtasks

### Server-Side (Express + Prisma)
- [x] **Controller: `collection-points-controller.js`**
  - Create the controller to handle CRUD operations.
- [x] **Endpoint: List Points (`GET /api/admin/collection-points`)**
  - Return all points ordered by name, optionally paginated.
- [x] **Endpoint: Create Point (`POST /api/admin/collection-points`)**
  - Accept point details and create a new record.
- [x] **Endpoint: Edit Point (`PUT /api/admin/collection-points/:id`)**
  - Update point details.
- [x] **Endpoint: Add Exception (`POST /api/admin/collection-points/:id/exceptions`)**
  - Receive a `date` (YYYY-MM-DD) and optional `reason`.
  - Validate date is a Saturday and parse to noon CDMX time.
  - Upsert into `UnavailableDate` model (use the Prisma `UnavailableDate` model).
  - Search for any active `Scheduling` (`status: 'Pendiente'`) on that date for that point.
  - Cancel these schedulings: `status: 'Cancelado'`, `cancellationType: 'Admin'`, `cancelledAt: new Date()`.
  - Create `NotificationBadge` for affected users: "Punto de acopio no disponible" with explanation.
- [x] **Endpoint: List Exceptions (`GET /api/admin/collection-points/:id/exceptions`)**
  - Return all `UnavailableDate` records for the point, ordered by date.
- [x] **Endpoint: Remove Exception (`DELETE /api/admin/collection-points/:id/exceptions/:date`)**
  - Delete the `UnavailableDate` record.
- [x] **Router: `server/src/routes/admin-routes.js`**
  - Register the new endpoints with `authenticate` and `authorizeAdmin` middleware.

### Client-Side (React + MUI)
- [x] **View: Collection Points List (`client/src/pages/admin/CollectionPoints.jsx`)**
  - Render a data table listing all points with their status and actions (Edit, Manage Exceptions).
  - Include a "Crear Punto" button.
- [x] **Component: Collection Point Form Dialog**
  - Form fields: `name`, `colonia`, `address`, `lat`, `lng`, `horario`.
  - Handles both creation and editing.
- [x] **Component: Exceptions Management Dialog**
  - Display a date picker (restricted to Saturdays).
  - "Agregar Excepción" button.
  - List of currently added exceptions with a "Delete" icon to remove them.
  - Display a confirmation dialog if adding an exception will cancel active turns: "Este punto tiene X reservas para este sábado. ¿Deseas inhabilitarlo? Las reservas se cancelarán automáticamente."

## Dev Notes

### `UnavailableDate` Model Interaction
In `schema.prisma`, exceptions are tracked via:
```prisma
model UnavailableDate {
  id           Int      @id @default(autoincrement())
  pointId      Int      @map("point_id")
  saturdayDate DateTime @map("saturday_date")
  reason       String?
  // ...
  @@unique([pointId, saturdayDate])
}
```
When querying or inserting `saturdayDate`, you **must** force the time to `12:00:00` (CDMX time) to avoid time-zone drifting issues:
```javascript
const targetDate = new Date(dateStr);
targetDate.setHours(12, 0, 0, 0);
```

### Affected Schedulings & Notifications
When adding an exception, fetch active schedulings to cancel them and notify users. Example flow:
```javascript
// Add exception
await prisma.unavailableDate.upsert({ ... });

// Find affected schedulings
const affected = await prisma.scheduling.findMany({
  where: { pointId: pid, saturdayDate: targetDate, status: 'Pendiente' },
  include: { user: true }
});

// Update schedulings
await prisma.scheduling.updateMany({
  where: { id: { in: affected.map(s => s.id) } },
  data: { status: 'Cancelado', cancellationType: 'Admin', cancelledAt: new Date() }
});

// Create badges for users
const badgePromises = affected.map(s => prisma.notificationBadge.create({
  data: {
    userId: s.userId,
    category: 'system',
    title: 'Punto de acopio inhabilitado',
    message: `El punto de acopio al que te registraste para el sábado ha sido marcado como no disponible por el administrador. Tu turno ha sido cancelado.`,
    read: false
  }
}));
await Promise.all(badgePromises);
```

### Security & Validations
- Ensure endpoints are protected by `authenticate` and `authorizeAdmin`.
- Avoid fetching excessive records. Only fetch `UnavailableDate` records from the current date forward when checking for UI, unless showing history.

## Dev Agent Record

### Agent Model Used
Amelia (Gemini CLI via Antigravity)

### Completion Notes List
- Implemented `collection-points-controller.js` to handle CRUD of points and exceptions.
- Updated `agenda-controller.js` to block volunteer scheduling via API if a point has an exception on the target Saturday.
- Created UI in `client/src/pages/admin/AdminPoints.jsx` (replacing the requested `CollectionPoints.jsx` name to match standard project layout routing) containing the data table, `PointFormDialog`, and `ExceptionsDialog`.
- Verified cancellation of existing turns and `NotificationBadge` creation is correctly applied when an admin inserts a new `UnavailableDate` exception.

### File List
- `server/src/controllers/collection-points-controller.js`
- `server/src/routes/admin-routes.js`
- `server/src/controllers/agenda-controller.js`
- `client/src/pages/admin/AdminPoints.jsx`

### Review Findings
- [x] [Review][Patch] **CRITICAL: Server-Side Timezone Collapse in Exception Creation** - Fixed by parsing `YYYY-MM-DD` strings explicitly into `[year, month, day]` and constructing `new Date` to enforce local timezone context at exactly 12:00:00 without relying on native V8 ISO parsing.
- [x] [Review][Patch] **HIGH: Brittle Exact-Match Date Trap in Agenda** - Fixed by applying the exact same local split parsing logic in `agenda-controller.js` `createScheduling` to ensure identical byte-level database querying.
- [x] [Review][Patch] **HIGH: Shattered State (Missing Database Transactions)** - Fixed by wrapping the 4 operations (upsert exception, find schedulings, cancel schedulings, create badges) inside a `$transaction`.
- [x] [Review][Dismissed] **MEDIUM: The "Inactivo" Bypass** - Dismissed as hallucinated/pre-existing feature. `agenda-controller.js` already explicitly verifies `if (!point || point.status !== 'Activo')` directly before proceeding.
- [x] [Review][Patch] **LOW: Client-Side Timezone Drift on Deletion** - Fixed in `AdminPoints.jsx` by extracting `YYYY-MM-DD` directly via `date.split('T')[0]` string manipulation instead of volatile client `Date` formatting.
