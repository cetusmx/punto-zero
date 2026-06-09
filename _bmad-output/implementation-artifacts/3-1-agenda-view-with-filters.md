# Story 3.1: Agenda View with Filters

Status: done

## Story

As a volunteer,
I want to view the available Saturdays and collection points with filters,
so that I can find a convenient time and location to schedule my turns.

## Acceptance Criteria

- [x] **Saturday-Only Calendar:** Created `CalendarGrid.jsx` which only allows interaction with Saturdays.
- [x] **6-Month Window:** Calendar handles month navigation and caps the selectable dates to the next 6 months.
- [x] **Filtering by Location:** Implemented filters for "Colonia" and "Punto de Acopio" in `AgendaPage.jsx`.
- [x] **Availability Filter:** Added a switch to filter only points with available capacity.
- [x] **Slot Detail Preview:** Selecting a Saturday displays detailed cards for each collection point with address, hours, and status.
- [x] **Clean Minimal UI:** Applied card-based layout with 24px radii and airy spacing.

## Tasks / Subtasks

- [x] **Server-Side (Express + Prisma)**
  - [x] Create `agenda-controller.js` with `getAvailableSlots` and `getAgendaFilters`.
  - [x] Register `agenda-routes.js` and link in `server/index.js`.
- [x] **Client-Side (React + MUI)**
  - [x] Install `date-fns`.
  - [x] Build custom `CalendarGrid` component.
  - [x] Build `AgendaPage` with reactive filtering and slot details.

## Dev Notes

- **Backend logic:** `getAvailableSlots` fetches active points and current reservations, allowing the frontend to compute final availability for each Saturday.
- **Frontend library:** Added `date-fns` for robust date manipulation and localized formatting.
- **Styling consistency:** Reused the Card and Shadow patterns from the Auth/Profile phase.

## Dev Agent Record

### Agent Model Used
Amelia (Gemini CLI)

### Completion Notes List
- Implemented the visual foundation of the scheduling system.
- Added localized date handling (Mexico City context).
- Enabled dynamic filtering by location.

### File List
- `server/src/controllers/agenda-controller.js`
- `server/src/routes/agenda-routes.js`
- `server/index.js`
- `client/src/components/agenda/CalendarGrid.jsx`
- `client/src/pages/AgendaPage.jsx`
- `client/package.json`
