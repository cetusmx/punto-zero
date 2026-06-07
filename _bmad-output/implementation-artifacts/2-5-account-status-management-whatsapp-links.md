# Story 2.5: Account Status Management & WhatsApp Links

Status: ready-for-dev

## Story

As a volunteer,
I want to manage my account status (Alta, Pausa, Baja) and access community WhatsApp group links,
so that I can control my participation and stay connected with the community.

## Acceptance Criteria

1. **Status Transition Confirmation**
   Given I am on my profile page and attempt to change my Status from `Alta` to `Pausa` or `Baja`,
   Then the system shows a confirmation dialog: "Este cambio cancelará TODAS tus calendarizaciones futuras. ¿Estás seguro?"

2. **Cascading Cancellations**
   Given I confirm a status change to `Pausa` or `Baja`,
   Then all future schedulings (saturdays > today) are cancelled in the database, and the administrator is notified via a badge notification.

3. **Status Reversion Rules**
   Given I am in `Pausa` status,
   When I change back to `Alta`,
   Then the change is immediate and I can schedule turns again.
   
   Given I am in `Baja` status,
   When I request to revert to `Alta`,
   Then the system sends an SMS notification to the administrator, and my status remains `Baja` (or a pending state) until authorized by an admin.

4. **WhatsApp Links Visibility**
   Given my status is `Alta`,
   Then I see buttons/links for "Grupo de Avisos" and "Grupo Abierto" in the "Información de Cuenta" section.
   
   Given my status is NOT `Alta`,
   Then the WhatsApp links are hidden.

5. **Dynamic Config**
   Given I see the WhatsApp links,
   Then the URLs are fetched from the system configuration (`AppConfig` table).

## Tasks / Subtasks

### Server-Side (Express + Prisma)

- [ ] **AC: 2** — Add `changeStatus` handler in `auth-controller.js`:
  - If target status is `Pausa` or `Baja`:
    - Cancel all future `Scheduling` records for the user (`saturdayDate > now`).
    - Create a `NotificationBadge` for the administrator.
  - If target status is `Alta` and current is `Baja`:
    - Send SMS to admin via `twilio.js`.
    - (Optional) Implement a pending authorization flow or mark for admin review.
  - Update user status.
- [ ] **AC: 5** — Create `config-controller.js` and route `GET /api/v1/config/whatsapp-links`:
  - Fetch `whatsapp_avisos` and `whatsapp_abierto` from `AppConfig` table.
- [ ] **AC: 2,3** — Register route `POST /api/v1/auth/status` (protected).

### Client-Side (React + MUI)

- [ ] **AC: 1,3** — Update `client/src/pages/ProfilePage.jsx`:
  - Add "Estatus" select field.
  - Implement confirmation dialog (MUI `Dialog`) for Pausa/Baja transitions.
  - Handle Baja -> Alta "Request" state.
- [ ] **AC: 4,5** — Add WhatsApp Links section in `ProfilePage.jsx`:
  - Fetch links from the new config endpoint.
  - Conditionally render based on `user.status === 'Alta'`.
- [ ] **AC: 4** — Update `AuthContext` if status changes to ensure UI consistency.

## Dev Notes

### Architecture Patterns
- **Cascading logic:** Even though Epic 3 (Agenda) isn't built yet, the `Scheduling` model exists. The deletion/cancellation logic should be implemented now to be ready.
- **Admin Notifications:** Use the `NotificationBadge` model. Since we don't have an admin ID yet, we might target all users with `role: 'admin'`.
- **Config Constants:** Use `app_config` keys: `whatsapp_avisos_url`, `whatsapp_abierto_url`.

### Project Structure Notes
- `AppConfig` model in `schema.prisma` is ready.
- `twilio.js` utility is ready for the admin SMS.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.5]
- [Source: _bmad-output/planning-artifacts/prds/prd-punto-zero-2026-05-24/prd.md#FR-6, FR-7]
- [Source: server/prisma/schema.prisma] AppConfig and NotificationBadge models.

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
