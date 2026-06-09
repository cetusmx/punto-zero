# Story 3.5: Saturday Operations — Default Attendance & Faltas

Status: done

## Story

As an admin,
I want the system to auto-confirm attendance on Saturdays and allow me to register faltas,
so that attendance tracking is accurate with minimal manual effort.

## Acceptance Criteria

- [x] **Automated Default Attendance:** Installed `node-cron` and created `attendance-cron.js` to auto-confirm turns at 14:00 CDMX on Saturdays.
- [x] **Admin Saturday Dashboard:** Refactor `AdminAgenda.jsx` with date selection and volunteer listing.
- [x] **Manual Status Override:** Implemented action buttons to mark "Falta" or "Asistencia" with immediate DB updates.
- [x] **Badge Notification:** System automatically creates a `NotificationBadge` for users when marked as `Falta`.
- [x] **CRON Reliability:** Job is initialized in the main entrypoint and configured for the correct timezone.

## Tasks / Subtasks

- [x] **Server-Side (Express + Prisma)**
  - [x] Install `node-cron`.
  - [x] Create attendance background job.
  - [x] Create `admin-agenda-controller.js` for management endpoints.
  - [x] Register admin routes with role protection.
- [x] **Client-Side (React + MUI)**
  - [x] Build the Admin Agenda management interface.
  - [x] Implement status toggle actions.

## Dev Notes

- **Timezone:** Used `timezone: "America/Mexico_City"` in `node-cron` to ensure operational accuracy.
- **Admin Security:** Added `authorizeAdmin` middleware to protect management routes.

## Dev Agent Record

### Agent Model Used
Amelia (Gemini CLI)

### Completion Notes List
- Automated the attendance lifecycle.
- Empowered admins with manual control over Saturday operations.
- Established the notification bridge for participation issues.

### File List
- `server/src/jobs/attendance-cron.js`
- `server/src/controllers/admin-agenda-controller.js`
- `server/src/routes/admin-routes.js`
- `server/index.js`
- `server/middleware/auth.js`
- `client/src/pages/admin/AdminAgenda.jsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
