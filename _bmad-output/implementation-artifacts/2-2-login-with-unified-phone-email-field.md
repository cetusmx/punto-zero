# Story 2.2: Login with Unified Phone/Email Field

Status: done

## Story

As a registered volunteer,
I want to log in using my phone number or email plus password in a single unified field,
so that I can access my account quickly.

## Acceptance Criteria

1. **Unified field auto-detect**
   Given I am on the login page,
   When I enter my phone (10 digits) or email in the unified field and my password,
   Then the backend auto-detects the identifier type (`@` → email, else → phone) and authenticates me.

2. **First login redirect to profile**
   Given I log in for the first time and have not completed my profile,
   When authentication succeeds,
   Then I am redirected to the mandatory profile form.

3. **Returning user redirect to agenda/home**
   Given I am a returning user with a completed profile,
   When authentication succeeds,
   Then I am redirected to the agenda/home page.

4. **Blocked access**
   Given my access is BLOCKED,
   When I attempt to log in,
   Then I see "Cuenta desactivada. Contacta al administrador."

5. **Invalid credentials (generic error)**
   Given I enter invalid credentials,
   When I submit the form,
   Then I see "Identificador o contraseña incorrectos" (generic message, no revealing which field is wrong).

6. **Non-existent identifier**
   Given I enter a non-existent email or phone,
   When I submit,
   Then I see the same generic error message as AC5.

## Tasks / Subtasks

### Server-Side

- [x] **AC: 1,5,6** — Add `login` handler in `server/src/controllers/auth-controller.js`:
  - Accept `{ identifier, password }`
  - Auto-detect: if `identifier` includes `@` → `findFirst({ where: { email: identifier } })`, else → `findUnique({ where: { phone: identifier } })`
  - If user not found → generic error "Identificador o contraseña incorrectos"
  - If `user.access === 'Bloqueado'` → "Cuenta desactivada. Contacta al administrador." (403 status)
  - Compare password with `bcrypt.compare`
  - If password mismatch → same generic error
  - Generate JWT (`{ id, phone, role }`, 7d expiry)
  - Determine `isFirstLogin`: `true` if `user.name` is null OR `user.gender` is null (profile incomplete)
  - Return `{ token, isFirstLogin, user: { id, name, phone, email, role } }`

- [x] **AC: 1,5,6** — Add `loginRules` in `server/src/middleware/validate.js`:
  - `identifier`: notEmpty, custom message "El identificador es obligatorio"
  - `password`: notEmpty, custom message "La contraseña es obligatoria"

- [x] **AC: 1,5,6** — Add `POST /login` route in `server/src/routes/auth-routes.js`:
  - Rate limiter: 10 requests per 15min window (soft rate limiting per FR-2)
  - Use `loginRules` validation middleware
  - Map to `login` controller

### Client-Side

- [x] **AC: 1-6** — Create `client/src/pages/LoginPage.jsx`:
  - Unified field: `<TextField label="Teléfono o correo electrónico" />` (no mask — accepts alphanumeric for email)
  - Password field: `<TextField type="password" />` with show/hide toggle (InputAdornment)
  - Submit button: "Iniciar sesión" (primary `#41703f`, full-width, 48px min height)
  - Link: "¿Olvidaste tu contraseña?" → `/forgot-password` (gray text, for Story 2.3)
  - Link: "¿No tienes cuenta? Regístrate" → `/register`
  - On submit: `POST /api/v1/auth/login` → on success call `login(token, userData)` from AuthContext → if `isFirstLogin` navigate to `/profile`, else navigate to `/`
  - Error handling: display API error message below form; map 403 blocked to "Cuenta desactivada. Contacta al administrador."
  - Inline validation on blur: identifier required, password required
  - Empty states: show nothing extra beyond form
  - Loading state: disable button + show CircularProgress on submit

- [x] **AC: 3** — Update `client/src/App.jsx`:
  - Import `LoginPage`
  - Add `<Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />`
  - Change default redirect from `/register` to `/login` for unauthenticated users in `/*` route

## Dev Notes

### Files to CREATE
- `client/src/pages/LoginPage.jsx` — Login form with unified field

### Files to MODIFY
- `server/src/controllers/auth-controller.js` — Add `login` handler
- `server/src/middleware/validate.js` — Add `loginRules`
- `server/src/routes/auth-routes.js` — Add `POST /login` route
- `client/src/App.jsx` — Add `/login` route, change default redirect

### `isFirstLogin` Detection Logic

Use the same pattern from Story 2.1 (verify-otp returns `isFirstLogin: true`). For login:

```js
const isFirstLogin = user.name === null || user.gender === null
```

This is checked AFTER password verification, on every login. The user model fields `name` and `gender` are nullable — when both are populated, profile is complete.

### Error Response Format (Consistent with Story 2.1)

```json
// Invalid credentials (any case)
{ "error": { "message": "Identificador o contraseña incorrectos" } }

// Blocked access
{ "error": { "message": "Cuenta desactivada. Contacta al administrador." } }
```

Use `403` for blocked access, `401` for invalid credentials (to distinguish from 401 interceptor which clears session — `401` will NOT trigger Axios interceptor logout because there's no Authorization header on login requests; confirmed via `api.js:19` check).

### Route Guard Behavior After Story 2.2

- `/login`, `/register`, `/verify-otp`: public routes (PublicRoute — redirect to `/` if authenticated)
- `/*`: if authenticated → VolunteerLayout, else → redirect to `/login` (not `/register`)
- `/admin/*`: protected (ProtectedRoute — redirect to `/login` if not authenticated)

### AuthContext Integration

The existing `login(token, userData)` method in AuthContext handles JWT storage and user state — no changes needed. The `login` handler in auth-controller returns the same shape as verify-otp: `{ token, isFirstLogin, user }`.

### Rate Limiting

Per FR-2: "Sin bloqueo por intentos fallidos, pero al menos rate limiting suave." Use a login-specific limiter: 10 requests per 15min window (matches verify-otp pattern).

### Password Verification

```js
const isValid = await bcrypt.compare(password, user.password)
```

### JWT Payload

Same as Story 2.1:
```js
{ id: user.id, phone: user.phone, role: user.role }
```

### Architecture Compliance

- **API style:** REST with `/api/v1/` prefix
- **Validation:** express-validator middleware (not in controllers)
- **Auth flow:** JWT in localStorage, Authorization Bearer header
- **Project structure:** `/server/src/routes/`, `/server/src/controllers/`, `/server/src/services/`, `/server/src/middleware/`
- **Error format:** `{ error: { message: "..." } }` via centralized error handler
- **Naming:** kebab-case files, PascalCase components, camelCase functions
- **API Response Wrapper:** The centralized error handler handles errors; success responses use plain `res.json()` (consistent with Story 2.1 pattern)

### References

- [Source: epics.md#Story-2.2] Full ACs for login with unified field
- [Source: epics.md#Epic-2] Epic 2: "log in with phone or email+password (unified field)"
- [Source: PRD.md#FR-2] FR-2 full spec: unified field, auto-detect, no lockout, soft rate limit, blocked user message, generic error
- [Source: architecture.md#Authentication] JWT localStorage, bcryptjs, unified field login, express-rate-limit
- [Source: architecture.md#API--Communication] REST API pattern, Axios interceptor, API response wrapper
- [Source: architecture.md#Project-Structure] Server layers: routes → controllers → services, naming patterns
- [Source: UX.md#Form-Patterns] Login form: 1 unified field, label "Teléfono o correo electrónico", auto-detect `@`
- [Source: UX.md#Button-Hierarchy] Primary button `#41703f` filled, 48px min height
- [Source: Story 2.1 `2-1-user-registration-with-sms-otp.md`] Previous patterns: JWT payload, error format, rate limiter pattern, controller structure, validation rules
- [Source: `server/src/controllers/auth-controller.js`] Current auth controller (register, verifyOtpHandler, resendOtp) — add `login` following same pattern
- [Source: `server/src/middleware/validate.js`] Current validation rules — add `loginRules`
- [Source: `server/src/routes/auth-routes.js`] Current routes — add `POST /login`
- [Source: `client/src/context/AuthContext.jsx`] AuthContext with `login(token, userData)` — no changes needed
- [Source: `client/src/App.jsx`] Current route setup — add `/login` + change default redirect
- [Source: `server/prisma/schema.prisma`] User model: phone (unique), email (optional), password, access (Habilitado/Bloqueado), name, gender
- [Source: commit `0ea3f7c`] Previous Story 2.1 implementation — established patterns to follow

## Dev Agent Record

### Agent Model Used

big-pickle / opencode

### Completion Notes List

- Implemented `login` handler in auth-controller.js: auto-detects `@` → email/phone, bcrypt comparison, Bloqueado check (403), generic error (401), isFirstLogin flag based on name/gender null check
- Added `loginRules` validation in validate.js: identifier required, password required
- Added `POST /auth/login` route with 10req/15min rate limiter
- Created LoginPage.jsx: unified identifier field, password toggle, error handling for blocked/invalid, links to reset password and register
- Updated App.jsx: added `/login` route (PublicRoute), changed default redirect from `/register` to `/login`, updated ProtectedRoute redirect
- Validation: client lint OK, server syntax OK, production build OK

### File List

- CREATE: `client/src/pages/LoginPage.jsx`
- MODIFY: `server/src/controllers/auth-controller.js`
- MODIFY: `server/src/middleware/validate.js`
- MODIFY: `server/src/routes/auth-routes.js`
- MODIFY: `client/src/App.jsx`

### Review Findings

#### Patch

- [x] [Review][Patch] `submittedRef` not reset on validation failure [LoginPage.jsx:58,68] — Early return at line 68 exits without resetting `submittedRef.current`, permanently blocking future form submissions until page reload.
- [x] [Review][Patch] Timing-based user enumeration via bcrypt compare [auth-controller.js:109-130] — bcrypt.compare runs only when user exists; non-existent identifiers return ~10ms faster. Attacker can probe valid emails/phones via timing even with identical status/message.
- [x] [Review][Patch] Rate limiter runs before validation middleware [auth-routes.js:40] — Malformed requests consume the 10-attempt budget, locking out legitimate users for 15min without a real login attempt.
- [x] [Review][Patch] `findUnique` on phone throws at runtime if schema drops `@unique` [auth-controller.js:108] — Use `findFirst` (defensive, works with any field). Phone is `@unique` today but the code shouldn't crash if schema evolves.
- [x] [Review][Patch] `isFirstLogin` doesn't handle empty-string `name` [auth-controller.js:131] — If `name` is `''` (not null) and `gender` is set, `isFirstLogin` is `false` despite profile being incomplete. Add `|| user.name === ''`.
- [x] [Review][Patch] No format/length validation on `identifier` [validate.js:72-73] — Only `.notEmpty()`. No max length, no email/phone format check. Attacker can send 1MB identifier strings. registerRules enforces max 254 on email for reference.
- [x] [Review][Patch] `user.status` (Baja/Pausa) not checked at login [auth-controller.js:117] — Only checks `access === 'Bloqueado'`. A user with `status === 'Baja'` (deactivated) or `status === 'Pausa'` (paused) can still log in. Add `|| user.status !== 'Alta'`.
- [x] [Review][Patch] Stale localStorage token causes false 401 redirect during login [api.js interceptor + LoginPage.jsx] — A stale Authorization header on `/auth/login` POST triggers the 401 interceptor which hard-redirects to `/register`, preventing login. Clear token before login or exempt login endpoint.
- [x] [Review][Patch] Email normalization asymmetry: register vs login [auth-controller.js:106-108] — Register uses `normalizeEmail()` (strips Gmail dots, subaddressing, normalizes case). Login uses raw `identifier.includes('@')` query. MySQL CI helps case but not Gmail dot/subaddress variance → user cannot log in.
- [x] [Review][Patch] 401 interceptor redirects to `/register` instead of `/login` [api.js:22] — Expired token users are sent to registration flow instead of re-authentication. Change target to `/login`.
- [x] [Review][Patch] Error handler leaks internal `err.message` in production [error-handler.js] — Returns `err.message` directly to client regardless of `NODE_ENV`. Could leak DB details, file paths, or internal service names.

#### Defer

- [x] [Review][Defer] OTP bypass — no verified flag check on login [auth-controller.js] — deferred, pre-existing (no verified field in schema)
- [x] [Review][Defer] Rate limiter IP-only, vulnerable to distributed credential stuffing [auth-routes.js] — deferred, pre-existing pattern across all endpoints
- [x] [Review][Defer] `isFirstLogin` should use dedicated `profile_completed` flag [auth-controller.js:131] — deferred, schema change needed
- [x] [Review][Defer] Phone PII in JWT payload [auth-controller.js:137] — deferred, pre-existing pattern from Story 2.1
- [x] [Review][Defer] No refresh-token rotation [auth-controller.js] — deferred, enhancement beyond scope
- [x] [Review][Defer] No JWT server-side verify middleware [server/] — deferred, pre-existing architectural gap
- [x] [Review][Defer] JWT payload missing access/status for revocation [auth-controller.js:137] — deferred, requires auth middleware
- [x] [Review][Defer] `isAuthenticated = !!token` doesn't check token expiry [AuthContext.jsx] — deferred, pre-existing pattern
