# Story 2.4: Mandatory Profile Form

Status: done

## Story

As a new volunteer after first login,
I want to complete my mandatory profile form,
so that the organization has my demographic and participation information to coordinate effectively.

## Acceptance Criteria

- [x] **Mandatory Redirect:** Implemented `ProfileGuard` in `App.jsx` to force incomplete profiles to the profile page.
- [x] **Form Fields:** Refactored `ProfilePage.jsx` with Gender, Age, Scheme, Residue Type, and Frequency.
- [x] **Validation and Submission:** Added `PUT /auth/profile` with `updateProfileRules` and database updates.
- [x] **Persisted State:** Profile changes are saved to DB and updated in `AuthContext` (localStorage).
- [x] **Clean Minimal UI:** Applied card-based layout with 24px radius and shadows.

## Tasks / Subtasks

- [x] **Server-Side (Express + Prisma)**
  - [x] Add `updateProfile` handler in `auth-controller.js`.
  - [x] Add `updateProfileRules` in `validate.js`.
  - [x] Create `authenticate` middleware in `auth.js`.
  - [x] Register route in `auth-routes.js`.
  - [x] Update Prisma schema (`age` to `String`).
- [x] **Client-Side (React + MUI)**
  - [x] Implement `ProfileGuard` for mandatory redirection.
  - [x] Refactor `ProfilePage.jsx` with full form and validation.
  - [x] Update `AuthContext` with `updateUser` method.
  - [x] Ensure non-editable fields are disabled.

## Dev Notes

- **Forced Flow:** The `ProfileGuard` checks for `!user?.gender` to determine if the profile is incomplete.
- **Data Shape:** `residuo` is stored as a comma-separated string (`Crudos, Heces y guisados`).
- **UX Alignment:** Used `Grid` for layout consistency and `Divider` for sectioning.

## Dev Agent Record

### Agent Model Used
Amelia (Gemini CLI)

### Completion Notes List
- Implemented forced profile completion logic.
- Created secure profile update endpoint.
- Updated database schema to match PRD age ranges.
- Applied "Clean Minimal" styles to the new form.

### File List
- `server/prisma/schema.prisma`
- `server/middleware/auth.js`
- `server/src/middleware/validate.js`
- `server/src/controllers/auth-controller.js`
- `server/src/routes/auth-routes.js`
- `client/src/context/AuthContext.jsx`
- `client/src/pages/ProfilePage.jsx`
- `client/src/App.jsx`
