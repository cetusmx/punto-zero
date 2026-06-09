# Story 3.2: Schedule a Turno

Status: done

## Story

As a volunteer,
I want to schedule a turn for a specific Saturday and collection point,
so that I can commit my participation and the organization can coordinate the logistics.

## Acceptance Criteria

- [x] **Confirmation Flow:** Added `BookingConfirmationDialog` in `AgendaPage.jsx` with full slot details.
- [x] **Term Acceptance:** Implemented a mandatory checkbox for "Compromiso de asistencia".
- [x] **Booking Persistence:** Created `POST /api/v1/agenda/schedule` which handles the scheduling record creation in `Pendiente` status.
- [x] **Capacity Logic:** Implementation prevents double-booking using Prisma's unique constraint and pre-creation checks.
- [x] **Success Feedback & Redirection:** Users are notified of success and automatically redirected to `/mis-turnos`.
- [x] **Error Handling:** Backend returns clear status codes (409 for conflicts, 400 for validation), displayed via MUI Alert.

## Tasks / Subtasks

- [x] **Server-Side (Express + Prisma)**
  - [x] Add `createScheduling` handler in `agenda-controller.js`.
  - [x] Implement Saturday date normalization (noon) to avoid timezone shifts.
  - [x] Register route in `agenda-routes.js`.
- [x] **Client-Side (React + MUI)**
  - [x] Create `BookingConfirmationDialog` component.
  - [x] Implement `handleBookTurn` with loading and success states.
  - [x] Add checkbox validation for booking.

## Dev Notes

- **Date Normalization:** Dates are stored at 12:00:00 UTC to ensure consistency across queries.
- **Volunteer Safety:** Logic ensures one user cannot book two different points on the same Saturday.
- **Race Conditions:** Managed via database-level unique index on `[pointId, saturdayDate]`.

## Dev Agent Record

### Agent Model Used
Amelia (Gemini CLI)

### Completion Notes List
- Implemented the full booking lifecycle.
- Secured slots against overbooking.
- Integrated redirection to the Turns history page.

### File List
- `server/src/controllers/agenda-controller.js`
- `server/src/routes/agenda-routes.js`
- `client/src/pages/AgendaPage.jsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
