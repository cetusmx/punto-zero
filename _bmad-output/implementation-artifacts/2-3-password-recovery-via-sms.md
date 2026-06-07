# Story 2.3: Password Recovery via SMS

Status: done

## Story

As a registered user who forgot their password,
I want to recover my password via SMS OTP,
so that I can regain access to my account safely.

## Acceptance Criteria

1. **Request Reset OTP**
   Given I am on the login page and click "¿Olvidaste tu contraseña?",
   When I enter my phone number (10 digits),
   Then if the phone exists, the system sends a 6-digit OTP via SMS; if not, a generic success message is shown to prevent enumeration.

2. **Verify Reset OTP**
   Given I received a reset OTP,
   When I enter the correct 6-digit code,
   Then I am allowed to set a new password.

3. **Set New Password**
   Given I am on the new password form,
   When I enter a new password (min 8 chars, 1 special char) and confirm it,
   Then the user's password is updated in the database, the OTP is invalidated, and I am redirected to login.

4. **OTP Limits and Expiry**
   Given I enter an incorrect OTP,
   When I exceed 3 failed attempts,
   Then the code is invalidated, and I must request a new one.

5. **Validation and Feedback**
   Given I use the recovery flow,
   When validation fails (short password, no special char, invalid phone),
   Then I see inline error messages following the UX "Clean Minimal" style.

## Tasks / Subtasks

- [x] **Server-Side (Express + Prisma)**
  - [x] Add `forgotPassword` handler in `auth-controller.js`.
  - [x] Add `resetPassword` handler in `auth-controller.js`.
  - [x] Add validation rules in `validate.js`.
  - [x] Register routes in `auth-routes.js`.
- [x] **Client-Side (React + MUI)**
  - [x] Create `client/src/pages/ForgotPasswordPage.jsx`.
  - [x] Create `client/src/pages/ResetPasswordPage.jsx`.
  - [x] Update `client/src/App.jsx`.

## Dev Notes

- **OTP Reuse:** Leveraged `otp-service.js`.
- **Security:** User enumeration protected in `forgotPassword`.
- **UX Specs:** Followed "Clean Minimal" (Card 24px, Button 12px).

## Dev Agent Record

### Agent Model Used
Amelia (Gemini CLI)

### Completion Notes List
- Implemented full recovery flow with SMS OTP.
- Applied "Clean Minimal" UI patterns consistently.
- Added rate limiters to recovery endpoints.

### File List
- `server/src/controllers/auth-controller.js`
- `server/src/middleware/validate.js`
- `server/src/routes/auth-routes.js`
- `client/src/pages/ForgotPasswordPage.jsx`
- `client/src/pages/ResetPasswordPage.jsx`
- `client/src/App.jsx`
