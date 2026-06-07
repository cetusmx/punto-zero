# Story 2.5: Account Status Management & WhatsApp Links

Status: done

## Story

As a volunteer,
I want to manage my account status (Alta, Pausa, Baja) and access community WhatsApp group links,
so that I can control my participation and stay connected with the community.

## Acceptance Criteria

- [x] **Status Transition Confirmation:** Implemented MUI `Dialog` to warn about cascading cancellations when moving from Alta to Pausa/Baja.
- [x] **Cascading Cancellations:** Backend endpoint `POST /auth/status` automatically cancels future schedulings and notifies admins via `NotificationBadge`.
- [x] **Status Reversion Rules:** Implementation allows immediate reversion from Pausa, and sends SMS to admin when requesting from Baja.
- [x] **WhatsApp Links Visibility:** Section only renders if `user.status === 'Alta'`.
- [x] **Dynamic Config:** Links are fetched from the `AppConfig` table via a new API endpoint.

## Tasks / Subtasks

- [x] **Server-Side (Express + Prisma)**
  - [x] Add `changeStatus` handler in `auth-controller.js`.
  - [x] Create `config-controller.js` for dynamic links.
  - [x] Register new routes in `auth-routes.js` and `config-routes.js`.
- [x] **Client-Side (React + MUI)**
  - [x] Add Status field and confirmation logic to `ProfilePage.jsx`.
  - [x] Add community links section with dynamic fetching.
  - [x] Ensure UI reflects status changes immediately.

## Dev Notes

- **Admin Notification:** Currently creates a `NotificationBadge` for all users with `role: 'admin'`.
- **Cancellations:** Uses a simple `updateMany` on `Scheduling` records for now.
- **Config:** Defaults to empty strings if `whatsapp_avisos_url` or `whatsapp_abierto_url` are missing in DB.

## Dev Agent Record

### Agent Model Used
Amelia (Gemini CLI)

### Completion Notes List
- Completed Epic 2 with full onboarding and identity features.
- Implemented operational cascading logic for status changes.
- Added dynamic configuration support for community links.

### File List
- `server/src/controllers/auth-controller.js`
- `server/src/controllers/config-controller.js`
- `server/src/routes/auth-routes.js`
- `server/src/routes/config-routes.js`
- `server/index.js`
- `client/src/pages/ProfilePage.jsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
