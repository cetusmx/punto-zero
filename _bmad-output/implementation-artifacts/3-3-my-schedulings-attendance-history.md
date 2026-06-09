# Story 3.3: My Schedulings & Attendance History

Status: done

## Story

As a volunteer,
I want to see my upcoming turns and my past attendance history,
so that I can manage my commitments and track my participation progress.

## Acceptance Criteria

- [x] **Dual-View Layout:** Implemented `MySchedulesPage.jsx` with two side-by-side (or stacked on mobile) columns for upcoming and history.
- [x] **Upcoming Turns Display:** Active reservations are filtered and displayed with full point details.
- [x] **Status Badges:** Integrated visual indicators for `Pendiente` (Yellow), `Asistió` (Green), and `Falta` (Red).
- [x] **Empty States:** Friendly messages and "Go to Agenda" buttons guide users when no data is available.
- [x] **Clean Minimal UI:** Applied consistent card-based layout and established typography.

## Tasks / Subtasks

- [x] **Server-Side (Express + Prisma)**
  - [x] Add `getMySchedulings` handler in `agenda-controller.js`.
  - [x] Register route `GET /api/v1/agenda/my-turns`.
- [x] **Client-Side (React + MUI)**
  - [x] Refactor `MySchedulesPage.jsx` into a reactive dashboard.
  - [x] Implement filtering logic to separate future vs. past turns.
  - [x] Integrate with `AuthContext` for data fetching.

## Dev Notes

- **Filtering Logic:** Turns are categorized in the frontend: `Upcoming` includes anything from today onwards with status `Pendiente`. Everything else goes to `History`.
- **UI Performance:** Data is fetched on mount and sorted by date (descending) by the backend.

## Dev Agent Record

### Agent Model Used
Amelia (Gemini CLI)

### Completion Notes List
- Completed the volunteer dashboard view.
- Standardized participation status visualization.
- Enhanced UX with contextual guidance (CTAs).

### File List
- `server/src/controllers/agenda-controller.js`
- `server/src/routes/agenda-routes.js`
- `client/src/pages/MySchedulesPage.jsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
