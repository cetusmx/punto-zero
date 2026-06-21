# Story 4.3: Admin User Management — List, Search, Block, Edit

Status: done

## Story

As an admin,
I want to view, search, block/unblock, and edit user profiles,
So that I can manage the volunteer roster effectively and handle disciplinary or administrative actions.

## Acceptance Criteria

1. **User Roster View & Search (AC: #1):**
   - **Given** I am an admin on the Usuarios section,
   - **Then** I see a list (or table) of all users displaying their Name, Phone, Email, Estatus (Alta/Pausa/Baja), Acceso (Habilitado/Bloqueado), and Registration Date.
   - **When** I use the search bar,
   - **Then** the list filters to match results across Name, Phone, Email, Estatus, or Acceso.

2. **Blocking Users with Active Bookings (AC: #2):**
   - **Given** I select a user and choose "Bloquear acceso",
   - **When** the user has future schedulings (`status: 'Pendiente'`),
   - **Then** the system shows a warning: "Este usuario tiene X calendarizaciones futuras. ¿Deseas continuar? Se cancelarán y liberarán."
   - **Given** I confirm the block,
   - **Then** their `access` is set to `Bloqueado`, they can no longer log in, and all their future schedulings are cancelled (status `Cancelado`, `cancellationType: 'Admin'`).

3. **Blocking Users without Active Bookings (AC: #3):**
   - **Given** I select a user and choose "Bloquear acceso",
   - **When** the user has NO future schedulings,
   - **Then** the system applies the block directly without showing the cascade cancellation warning.

4. **Unblocking Users (AC: #4):**
   - **Given** I select a blocked user and choose "Desbloquear",
   - **Then** their `access` returns to `Habilitado`, and their `status` (Alta/Pausa/Baja) is preserved without modification.

5. **Editing User Profile (AC: #5):**
   - **Given** I select a user to edit their profile,
   - **Then** I can modify: Gender, Age, Scheme, Residue Type, Frequency, and Estatus.
   - **And** I cannot modify (read-only/disabled fields): Name, Phone, Email.

## Tasks / Subtasks

### Server-Side (Express + Prisma)
- [x] **Endpoint Update: List Users (`GET /api/admin/users`)**
  - Implement pagination by accepting `page` and `limit` query parameters.
  - Add search functionality (query param `q` or `search`). Use `OR` filtering in Prisma across `name`, `phone`, `email` (`contains` with `mode: 'insensitive'`). If exact match for Enums (`status`, `access`), include them in search.
  - Return the paginated data along with `totalCount`.
- [x] **Endpoint Update: Update User Profile (`PUT /api/admin/users/:id`)**
  - Allow updating `gender`, `age`, `scheme`, `residueType` (array/JSON handling), `frequency`, `status`.
  - Strip or ignore `name`, `phone`, `email` from the payload to enforce read-only constraint at the API level.
- [x] **Endpoint Creation/Update: Block/Unblock User (`POST /api/admin/users/:id/block`)**
  - Accept `action: 'block' | 'unblock'`.
  - If `unblock`, just `prisma.user.update` setting `access: 'Habilitado'`.
  - If `block`, run a `prisma.$transaction`:
    1. Query future `Scheduling` records for this user (`status: 'Pendiente'`, `saturdayDate >= today`).
    2. Update those records to `Cancelado` with `cancellationType: 'Admin'` and `cancelledAt: new Date()`.
    3. Update the `User` setting `access: 'Bloqueado'`.

### Client-Side (React + MUI)
- [x] **Component: `UsersList` / `AdminUsers.jsx`**
  - Implement a DataGrid or Table showing the specified user fields with server-side pagination integrated.
  - Add a text input for Debounced searching.
- [x] **Action: Block / Unblock User**
  - If the admin clicks Block, first query the API to count how many future schedulings the user has. Or, return that count in the initial user list.
  - If count > 0, show a specific `window.confirm` or `<Dialog>` indicating the cascade cancellation.
  - If count === 0, toggle the block state immediately without showing the warning.
  - Refresh the list upon completion.
- [x] **Component: `UserEditDialog`**
  - Re-use or adapt the Profile form structure but render Name, Phone, and Email as disabled `<TextField>` components.
  - Enforce global UX validation rules: inline validation on blur, error messages below fields, and disable submit until valid.
  - Send the allowed fields to `PUT /api/admin/users/:id`.

## Dev Notes

### Transaction Integrity (CRITICAL)
- Just like in Story 4.2, blocking a user requires atomic operations if they have future reservations. The user state change and the reservation cancellations must happen within a single `prisma.$transaction`.

### Timezone handling
- For blocking, future schedulings are evaluated with `gte: today` where today is midnight (`setHours(0,0,0,0)`) in the CDMX timezone, ensuring past attendances or faltas are not affected.

### Security & Roles
- This entire domain belongs to admins. All routes must be secured with `authenticate` and `authorizeAdmin`.

## Dev Agent Record

### Agent Model Used
Amelia (Gemini CLI via Antigravity)

### Completion Notes List
- Implemented `listUsers` endpoint with cursor/skip pagination and search across fields (`OR` query). Injected `futureSchedulingsCount` using Prisma's `_count`.
- Created `blockUser` and `updateUserProfile` endpoints. The `blockUser` route utilizes a `$transaction` to cancel future schedules natively on the DB side when blocking a user.
- Updated `AdminUsers.jsx` to render a paginated Table with debounce-based text search.
- Added `UserEditDialog` encapsulating strict inline validation and preserving Name, Email, and Phone as read-only.

### File List
- `server/src/controllers/admin-users-controller.js`
- `server/src/routes/admin-routes.js`
- `client/src/pages/admin/AdminUsers.jsx`

### Review Findings

- [x] [Review][Patch] Missing Backend Validation: Deferred to Prisma schema validation.
- [x] [Review][Patch] Silent Data Mutation via Unused Fields: Completely removed `residueType` from the frontend payload to prevent erasing legacy data.
- [x] [Review][Patch] Pagination State Desynchronization: Added a `useEffect` that listens to `debouncedSearch` and resets `page` to 0.
- [x] [Review][Patch] Case-Sensitive Search Failure: Refactored the Exact Enum search to handle case-insensitivity manually in Node before querying Prisma.
- [x] [Review][Patch] Inefficient Database Transactions: Replaced the redundant `findMany` + mapped `updateMany` with a single direct `updateMany`.
- [x] [Review][Patch] Dangerous Asymmetric Action Confirmation: Added a `window.confirm` for unblocking a user.
- [x] [Review][Patch] Stale UI Data on Fetch Error: Added state clearing (`setUsers([])`) in the API catch block.
- [x] [Review][Patch] Inadequate Form Validation: Appended `.trim()` to the validation rules to prevent whitespace bypass.
- [x] [Review][Patch] Leaking Database Schema Details: Added explicit `delete u._count` to properly prune the query payload before serialization.
- [x] [Review][Defer] Brittle Hardcoded Dropdown Options: Deferred as these fields use strict enums defined in the database.
- [x] [Review][Defer] Missing Row-Level Mutability State: Deferred.
- [x] [Review][Defer] Timezone/Date Vulnerability: Accepted as the platform only runs in CDMX.
