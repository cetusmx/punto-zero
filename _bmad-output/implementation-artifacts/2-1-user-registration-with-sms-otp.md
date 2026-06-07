# Story 2.1: User Registration with SMS OTP

Status: done

## Story

As a new visitor,
I want to register using my phone number validated via SMS OTP,
so that I can create a verified account and access the platform.

## Acceptance Criteria

1. **Registration form with SMS OTP**
   Given I am a new user on the registration page,
   When I fill in name, phone (10 digits), email (valid format), password (min 8 + 1 special), accept T&C and privacy notice,
   Then the system validates the phone is not duplicate, email is not duplicate, and sends a 6-digit OTP via SMS.

2. **OTP verification success**
   Given I received an OTP,
   When I enter the correct 6-digit code,
   Then my account is created and activated, and I am redirected to complete my profile.

3. **Incorrect OTP with retries**
   Given I enter an incorrect OTP,
   When I have made fewer than 3 attempts,
   Then I see "Código incorrecto. Intenta de nuevo."

4. **Max OTP attempts reached**
   Given I fail OTP 3 times,
   When the code expires,
   Then I must request a new OTP.

5. **OTP resend with cooldown**
   Given I want to resend OTP,
   When 60 seconds have passed since the last code,
   Then a new OTP is generated and the previous one expires.

6. **Duplicate phone number**
   Given I enter a phone that already exists,
   When I submit the form,
   Then I see a message suggesting password recovery.

7. **Duplicate email**
   Given I enter a duplicate email,
   When I submit the form,
   Then I see "Este correo electrónico ya está registrado."

8. **Validation errors**
   Given I submit with invalid data (short password, invalid email, empty name),
   When validation runs,
   Then inline error messages appear below each field.

## Tasks / Subtasks

### Server-Side (Express + Prisma)

- [ ] **AC: 7,8** — Install `twilio` package: `npm install twilio`
- [ ] **AC: 1** — Create `server/src/config/twilio.js`: Twilio client singleton with mock fallback for development
- [ ] **AC: 1,3,4,5** — Create `server/src/services/otp-service.js`: OTP generation, verification (max 3 attempts, 60s cooldown, 5min expiry), and cleanup using in-memory Map
- [ ] **AC: 1,6,7** — Create `server/src/middleware/validate.js`: express-validator rules for registration (name required, phone 10 digits unique, email valid format unique, password min 8 + 1 special, T&C accepted)
- [ ] **AC: 1** — Create `server/src/controllers/auth-controller.js` with `register` handler:
  - Validate input (phone unique, email unique, password strength)
  - Generate OTP via otp-service
  - Send OTP via Twilio SMS (mock in dev)
  - Return success response
- [ ] **AC: 2,3,4,5** — Add `verifyOtp` handler in auth-controller:
  - Accept phone + code
  - Verify OTP via otp-service
  - If valid: create User in DB (password hashed with bcryptjs), generate JWT, return token + profile redirect flag
  - If invalid: return appropriate error
- [ ] **AC: 5** — Add `resendOtp` handler in auth-controller:
  - Check 60s cooldown
  - Generate new OTP, send SMS, invalidate previous OTP
- [ ] **AC: 8** — Create validation rules for each endpoint using express-validator
- [ ] **AC: 1-8** — Create `server/src/routes/auth-routes.js`: POST `/api/v1/auth/register`, POST `/api/v1/auth/verify-otp`, POST `/api/v1/auth/resend-otp`
- [ ] **AC: 1-8** — Register auth routes in `server/index.js` (before error handler middleware)
- [ ] **AC: 1,6** — Add express-rate-limit to auth endpoints (15min cooldown at IP level after 3 failed attempts)

### Client-Side (React + MUI)

- [ ] **AC: 1,8** — Create `client/src/lib/api.js`: Axios instance with base URL from env, JWT interceptor (Authorization Bearer header), 401 redirect
- [ ] **AC: 1** — Create `client/src/pages/RegisterPage.jsx`: Registration form with:
  - Name, Phone (10-digit MX mask), Email, Password (show/hide toggle), T&C checkbox, Privacy checkbox
  - Inline validation on blur (express-validator compatible rules)
  - Submit → POST `/api/v1/auth/register` → redirect to OTP verification
  - Error handling for duplicate phone/email
- [ ] **AC: 2,3,4,5** — Create `client/src/pages/OtpVerificationPage.jsx`:
  - 6 individual digit input boxes (auto-advance)
  - 60s resend countdown timer
  - Max 3 attempts error state
  - Success → store JWT, redirect to profile completion
  - Full-screen loading state during OTP send/verify
- [ ] **AC: 1-8** — Update `client/src/context/AuthContext.jsx` to support:
  - JWT stored in localStorage
  - `login(token, isFirstLogin)` method
  - `logout()` method
  - Auth state initialization from stored token
  - `loading` state for initial auth check
- [ ] **AC: 1-8** — Update `client/src/App.jsx` to add public routes:
  - Public routes: `/register`, `/verify-otp` (no auth required)
  - Protected routes behind auth check
  - Redirect to agenda if already authenticated
- [ ] **AC: 8** — Add MUI form validation patterns: helper text on blur, error state styling per UX spec

### Testing

- [ ] **AC: 1-8** — Server unit tests for OTP service (generate, verify, expiry, max attempts)
- [ ] **AC: 1-8** — Server integration tests for registration flow (happy path, duplicate phone, duplicate email, invalid data)
- [ ] **AC: 3,4,5** — Server integration tests for OTP verification (correct, incorrect, max attempts, resend cooldown)

## Review Findings

### Decision Needed
- [x] [Review][Decision] OTP consumed before user creation — Fixed: reversed order (user created first, OTP consumed after).
- [x] [Review][Decision] Registration credentials passed via React Router `location.state` — Fixed: implemented server-side session token via `pending-registration.js`.
- [x] [Review][Decision] AC6: Duplicate phone recovery suggestion is conditional on matching email — Kept current logic (safer — don't suggest recovery for someone else's account).

### Patch
- [x] [Review][Patch] JWT secret fallback has no warning [auth-controller.js:7] — Added `process.emitWarning` when using fallback.
- [x] [Review][Patch] `loading` permanently `false` in AuthContext creates dead code [AuthContext.jsx:19] — Removed `loading` from AuthContext and route guards.
- [x] [Review][Patch] Broad 401 interceptor clears session on ANY 401 [api.js:17-22] — Added check for Authorization header presence.
- [x] [Review][Patch] Combined rate limiter blocks all auth endpoints as one pool [server/index.js:19-27] — Split into per-endpoint limiters in auth-routes.js (register: 5/15min, verify: 10/15min, resend: 3/15min).
- [x] [Review][Patch] Phone number prefix corruption via `.slice(0,10)` [RegisterPage.jsx:144] — Replaced with length guard (max 10 digits, no slice).
- [x] [Review][Patch] Paste handler only attached to first OTP input [OtpVerificationPage.jsx:153] — Attached to all 6 inputs.
- [x] [Review][Patch] No max-length validation on name/email/password [validate.js] — Added max length: name=100, email=254, password=128.
- [x] [Review][Patch] verify-otp endpoint doesn't require acceptedTerms/privacyAccepted [validate.js:54-78] — Resolved architecturally by session token flow (terms validated at register).
- [x] [Review][Patch] isFormValid() double-submit risk [RegisterPage.jsx:208] — Added `submittedRef` guard.
- [x] [Review][Patch] Mock SMS logs OTP in plaintext [twilio.js:46-47] — Masked OTP digits in mock log output.

### Deferred
- [x] [Review][Defer] In-memory OTP lost on server restart [otp-service.js:3] — Known architectural decision; Redis persistence planned for future.
- [x] [Review][Defer] JWT in localStorage exposes token to XSS [AuthContext.jsx] — Inherent tradeoff of localStorage auth; accepted for v1.
- [x] [Review][Defer] No login endpoint — Part of Story 2.2 (planned).
- [x] [Review][Defer] No token refresh mechanism — Future auth work (planned).
- [x] [Review][Defer] No server-side auth middleware — Coming in future stories.

Dismissed: 7 findings (OTP race condition — Node single-threaded, TOCTOU — phone @unique in schema, localStorage unavailable — v1 edge case, email normalization — correct behavior, error handler stack trace — standard pattern, AC3/AC7 messages — code actually correct, false positives).

## Dev Notes

### Previous Implementation (Reverted)

Epic 2 was previously implemented and reverted (commit `7f1db5c`). The reverted code provides proven patterns to follow:

- **Auth middleware** (`server/middleware/auth.js`): JWT verification, role checks, token generation with 7d expiry. JWT payload: `{ id, phone, role }`.
- **OTP service** (`server/services/otp-service.js`): In-memory Map store, 6-digit codes, 5min expiry, 3 max attempts, 60s resend cooldown.
- **Twilio service** (`server/services/twilio-service.js`): Dynamic import with mock console fallback for development.
- **Auth context** (`client/src/context/AuthContext.jsx`): JWT in localStorage, `login`/`logout`/`fetchProfile`, `isFirstLogin` flag for profile redirect.
- **API lib** (`client/src/lib/api.js`): Axios instance with base URL from `import.meta.env.VITE_API_URL`, JWT Bearer interceptor.

### Architecture Compliance

- **API style**: REST with `/api/v1/` prefix
- **Validation**: express-validator middleware (not in controllers)
- **Auth flow**: JWT in localStorage, Authorization Bearer header
- **Project structure**: `/server/src/routes/`, `/server/src/controllers/`, `/server/src/services/`, `/server/src/middleware/`
- **Error format**: `{ error: { message: "..." } }` via centralized error handler
- **Naming**: kebab-case files, PascalCase components, camelCase functions

### Library Versions (Installed)

- express ^5.2.1, @prisma/client ^6.5.0, prisma ^6.5.0
- bcryptjs ^2.4.3, jsonwebtoken ^9.0.2, express-rate-limit ^7.5.0
- express-validator ^7.2.1, twilio (needs install)
- react ^19.2.6, react-router-dom ^7.17.0
- @mui/material ^9.0.1, @mui/icons-material ^9.0.1
- axios ^1.17.0

### Project Structure Notes

- New files needed:
  - `server/src/config/twilio.js` — Twilio client singleton
  - `server/src/services/otp-service.js` — OTP management
  - `server/src/middleware/validate.js` — Validation rules
  - `server/src/controllers/auth-controller.js` — Auth handlers
  - `server/src/routes/auth-routes.js` — Auth routes
  - `client/src/lib/api.js` — Axios instance
  - `client/src/pages/RegisterPage.jsx` — Registration form
  - `client/src/pages/OtpVerificationPage.jsx` — OTP verification
- Files to modify:
  - `server/index.js` — Register auth routes + rate limiter
  - `server/package.json` — Add `twilio` dependency
  - `client/src/App.jsx` — Add public routes
  - `client/src/context/AuthContext.jsx` — JWT auth methods
  - `client/src/main.jsx` — Verify no changes needed
- Files from reverted implementation to reuse pattern but rewrite fresh:
  - Server middleware (JWT auth), OTP service (in-memory), Twilio service (mockable), Auth context (JWT flow)

### References

- [Source: epics.md#Story-2.1] Full ACs for registration flow
- [Source: epics.md#Epic-2] Epic objectives: "Volunteers can register via SMS OTP, log in, recover password, complete profile"
- [Source: architecture.md#Authentication] JWT localStorage, bcryptjs, express-rate-limit, express-validator
- [Source: architecture.md#API--Communication] REST API pattern, Axios interceptor, API response wrapper
- [Source: architecture.md#Project-Structure] Server layers: routes → controllers → services
- [Source: architecture.md#Naming-Patterns] kebab-case files, PascalCase components, camelCase functions
- [Source: PRD.md#FR-1] FR-1 full spec: OTP flow, 3 attempts, 60s resend, duplicate checks
- [Source: PRD.md#FR-2] Login redirect to profile if first login
- [Source: PRD.md#FR-4] Email required, unique, used as secondary login identifier
- [Source: UX.md#Journey-1] Onboarding flow: Welcome → Phone → SMS OTP → Profile → Agenda
- [Source: UX.md#Form-Patterns] Phone input mask (10 digits), OTP 6 digit boxes, inline validation on blur
- [Source: UX.md#Component-Strategy] Full-screen loader for OTP send/verify, skeleton for other loading
- [Source: UX.md#Button-Hierarchy] Primary button (#41703f filled), form validation error below field
- [Source: Reverted commit `458bc6b`] Previous implementation patterns for auth middleware, OTP service, Twilio, AuthContext, API client
- [Source: server/prisma/schema.prisma] User model: id, name, phone (unique), email (unique), password, role, status, access, etc.
