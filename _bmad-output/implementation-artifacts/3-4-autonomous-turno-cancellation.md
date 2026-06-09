# Story 3.4: Autonomous Turno Cancellation

Status: done

## Story

As a volunteer,
I want to autonomously cancel my scheduled turns if I cannot attend,
so that the slot becomes available for other volunteers and the organization is notified.

## Acceptance Criteria

- [x] **Cancellation Eligibility:** Added "Cancelar turno" button to upcoming turns in `MySchedulesPage.jsx`.
- [x] **Confirmation Dialog:** Implemented a safety dialog to prevent accidental cancellations.
- [x] **Status Update:** Created `POST /api/v1/agenda/cancel/:id` which updates status to `Cancelado` and records metadata.
- [x] **Slot Release:** Cancellation immediately frees the slot in the Agenda view.
- [x] **Success Feedback:** Users see immediate feedback and the list is refreshed without page reload.
- [x] **Clean Minimal UI:** Used MUI Dialogs and consistent button styling.

## Tasks / Subtasks

- [x] **Database Schema**
  - [x] Added `Cancelado` to `AttendanceStatus` enum.
- [x] **Server-Side (Express + Prisma)**
  - [x] Add `cancelScheduling` handler in `agenda-controller.js`.
  - [x] Update `changeStatus` in `auth-controller.js` to use `Cancelado`.
  - [x] Register route in `agenda-routes.js`.
- [x] **Client-Side (React + MUI)**
  - [x] Add cancellation flow to `MySchedulesPage.jsx`.
  - [x] Implement UI for `Cancelado` status.

## Dev Notes

- **Data Integrity:** Distinguished between `Falta` (missed without notice) and `Cancelado` (premeditated).
- **Security:** Backend verifies that the requester owns the scheduling record.

## Dev Agent Record

### Agent Model Used
Amelia (Gemini CLI)

### Completion Notes List
- Implemented autonomous cancellation lifecycle.
- Enhanced participation status mapping.
- Improved data integrity for operational metrics.

### File List
- `server/prisma/schema.prisma`
- `server/src/controllers/agenda-controller.js`
- `server/src/controllers/auth-controller.js`
- `server/src/routes/agenda-routes.js`
- `client/src/pages/MySchedulesPage.jsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
