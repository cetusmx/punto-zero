# Story 4.4: Superadmin Role Management

Status: ready-for-dev

## Story

As a superadmin,
I want to create, modify, and manage admin accounts,
So that I can control who has administrative access.

## Acceptance Criteria

1. **Superadmin Section Visibility (AC: #1):**
   - **Given** I am a superadmin,
   - **When** I log in and view the sidebar,
   - **Then** I see an "Administradores" section.
   - **Given** I am a regular admin,
   - **Then** the "Administradores" section is hidden and the route is inaccessible.

2. **List Administrators (AC: #2):**
   - **Given** I am a superadmin in the Administradores section,
   - **Then** I see a list of all users with `role` equal to 'admin' or 'superadmin', displaying their name, phone, email, and current role.

3. **Promote User to Admin (AC: #3):**
   - **Given** I am a superadmin,
   - **When** I choose to promote a user,
   - **Then** I can search for eligible regular volunteers and upgrade their role to 'admin', granting them admin privileges.

4. **Demote Admin to Volunteer (AC: #4):**
   - **Given** I am a superadmin,
   - **When** I demote an admin,
   - **Then** their role is changed to 'volunteer' and they lose admin panel access.
   - **Given** I am a superadmin,
   - **When** I try to demote myself,
   - **Then** the system prevents the action with an error.

5. **Block Admin Access (AC: #5):**
   - **Given** I am a superadmin,
   - **When** I block an admin,
   - **Then** their access is set to 'Bloqueado', and they lose access to the platform.
   - **Given** I am a superadmin,
   - **When** I try to block myself,
   - **Then** the system prevents it.

## Tasks / Subtasks

### Server-Side (Express + Prisma)
- [ ] **Middleware Updates (`server/middleware/auth.js`)**
  - Create `authorizeSuperAdmin` middleware to strictly check `req.user.role === 'superadmin'`.
- [ ] **Superadmin Controller (`server/src/controllers/superadmin-controller.js`)**
  - Implement **`GET /api/admin/administrators`**: Fetch all users where `role` in `['admin', 'superadmin']`.
  - Implement **`GET /api/admin/administrators/eligible-users`**: Fetch users with `role === 'volunteer'` to populate the promotion search autocomplete. **Must accept a `?q=` search query and limit results to prevent performance issues.**
  - Implement **`POST /api/admin/administrators/:id/promote`**: Update a user's role to `'admin'`.
  - Implement **`POST /api/admin/administrators/:id/demote`**: Update an admin's role to `'volunteer'`. Validate `req.user.id !== parseInt(req.params.id)` to prevent self-demotion.
  - Implement **`POST /api/admin/administrators/:id/block`**: Accept an `{ action: 'block' | 'unblock' }` payload to update an admin's access to `'Bloqueado'` or `'Habilitado'`. Validate `req.user.id !== parseInt(req.params.id)`.
- [ ] **Superadmin Routes (`server/src/routes/admin-routes.js`)**
  - Register the new endpoints using `authenticate` and `authorizeSuperAdmin` middleware.

### Client-Side (React + MUI)
- [ ] **Admin Layout Updates (`client/src/layouts/AdminLayout.jsx`)**
  - Dynamically inject `{ label: 'Administradores', icon: <SecurityIcon />, path: '/admin/administradores' }` into `menuItems` only if `user.role === 'superadmin'`.
  - Add `<Route path="administradores" element={<AdminAdministrators />} />` inside the `<Routes>` block.
- [ ] **Superadmin Management View (`client/src/pages/admin/AdminAdministrators.jsx`)**
  - Render a data table listing current administrators.
  - Include row actions: "Degradar a voluntario", "Bloquear/Desbloquear". Disable these actions for the row corresponding to the logged-in user (`user.id`).
  - Add a "Promover Usuario" button that opens an assignment modal.
- [ ] **Promote User Modal (`client/src/pages/admin/AdminAdministrators.jsx`)**
  - Implement a modal with an MUI `<Autocomplete>` that asynchronously searches for eligible volunteers (`/api/admin/administrators/eligible-users?q=`) using a debounced input.
  - Confirming the modal calls the `promoteToAdmin` API and refreshes the table.
- [ ] **API Service (`client/src/services/admin.js`)**
  - Add new API methods: `getAdministrators()`, `getEligibleUsersForAdmin()`, `promoteToAdmin(userId)`, `demoteToVolunteer(userId)`, `toggleAdminBlock(userId)`.

## Dev Notes

### Role Architecture Intelligence
- **User Model Requirements:** The `User` model defines `role` as a `String` with `@default("volunteer")`. Admins use `'admin'` and superadmins use `'superadmin'`. Do NOT add new Prisma Enums for roles; simply manage string values.
- **`AuthContext.jsx` usage:** The frontend `useAuth()` hook exposes `user`. You can safely check `user?.role === 'superadmin'` to conditionally render UI elements without additional requests.

### Security Guardrails
- **CRITICAL: Self-Modification:** You MUST prevent superadmins from altering their own role or block status. If a superadmin demotes or blocks themselves, it could result in zero superadmins in the system, bricking admin control. Both the UI (disable action buttons where `row.id === user.id`) and the API (return 403 if `req.user.id === parseInt(req.params.id)`) must strictly enforce this.
- **Middleware Usage:** Ensure ALL new endpoints are protected by `authenticate` followed by the newly created `authorizeSuperAdmin` middleware. Do not rely on `authorizeAdmin` for these routes.
- **Clarification on Hard Deletions:** PRD FR-28 requests the ability to "eliminar admins". Hard deletion is intentionally omitted in favor of role demotion/blocking to preserve referential integrity (volunteer history).

### Files Being Modified
- `server/middleware/auth.js`: Adding the `authorizeSuperAdmin` exported function.
- `server/src/routes/admin-routes.js`: Appending the new administrator management routes.
- `client/src/layouts/AdminLayout.jsx`: Altering the static `menuItems` array to evaluate role state dynamically.
- `client/src/services/admin.js`: Adding the API integration functions.

## Completion Status
Ultimate context engine analysis completed - comprehensive developer guide created.
