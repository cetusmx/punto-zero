# Story 6.1: SMS Notifications via Twilio

Status: review

## Story

As a user or admin,
I want to receive SMS notifications for critical events,
so that I am aware of important actions without needing to check the app.

## Acceptance Criteria

1. **OTP on Registration (AC: #1):**
   - **Given** a new user registers,
   - **When** they submit the registration form,
   - **Then** an SMS with a 6-digit OTP is sent to their phone within 30 seconds.

2. **OTP on Password Recovery (AC: #2):**
   - **Given** a user requests password recovery,
   - **When** they submit their unified identifier (phone number or email),
   - **Then** the system looks up their registered phone number and an SMS with a 6-digit OTP is sent to that phone within 30 seconds.

3. **Friday Cancellation Notification to Admin (AC: #3):**
   - **Given** a volunteer cancels their turno on Friday (0:00-24:00),
   - **Then** an informative SMS is sent to the admin.

4. **Reactivation Request Notification to Admin (AC: #4):**
   - **Given** a user in Baja status requests to revert to Alta,
   - **Then** an SMS is sent to the admin notifying them of the reactivation request.

5. **Graceful Failure when Provider Unavailable (AC: #5):**
   - **Given** the SMS provider (Twilio) is unavailable,
   - **Then** the system logs the error and continues without blocking the user flow (OTP flows can retry).

6. **Admin Twilio Configuration (AC: #6):**
   - **Given** I am an admin on the Configuración section,
   - **Then** I can register and modify Twilio credentials (account SID, auth token, phone number) as needed.

## Tasks / Subtasks

### Server-Side (Express + Prisma)
- [x] **Config Controller & DB Model Updates (`server/src/controllers/config-controller.js`)**
  - Update `getConfig` to return Twilio credentials (`twilio_account_sid`, `twilio_auth_token`, `twilio_phone_number`, `admin_phone`) **ONLY** if `req.user.role === 'admin' || req.user.role === 'superadmin'`. Normal users should not receive these keys.
  - Update `updateConfig` to accept and save `twilio_account_sid`, `twilio_auth_token`, `twilio_phone_number`, and `admin_phone` in the `AppConfig` table.
- [x] **Twilio Service Overhaul (`server/src/config/twilio.js`)**
  - Modify `getTwilioClient` to query configuration from the database `AppConfig` first, using `process.env` only as a fallback.
  - **Caching:** Implement a simple memory cache in `twilio.js` (e.g., `let cachedConfig = null;`) that is used for client creation, and expose a method `clearTwilioCache()` to be called by `config-controller.js` when `updateConfig` is executed, preventing DB overhead on every SMS sent.
  - Modify `sendSMS` to **not throw errors** when `client.messages.create` fails. Instead, log the error and return `{ success: false, error: err.message }` to prevent blocking the user flow (graceful degradation).
- [x] **Agenda Controller Updates (`server/src/controllers/agenda-controller.js`)**
  - In `cancelScheduling`, check if the current day is Friday.
  - If Friday, fetch `admin_phone` from `AppConfig` (or `.env` fallback). If the resolved `admin_phone` is null or undefined, log a warning and skip the SMS to prevent crashing. Otherwise, send an informative SMS notification using `sendSMS()`.
- [x] **Auth Controller Updates (`server/src/controllers/auth-controller.js`)**
  - In `changeStatus`, when `targetStatus === 'Alta'` and `user.status === 'Baja'`, fetch `admin_phone` from `AppConfig` (or `.env` fallback). If missing, log a warning and skip the SMS. Otherwise, send the reactivation SMS.

### Client-Side (React + MUI)
- [x] **Admin Configuration UI Updates (`client/src/pages/admin/AdminConfig.jsx`)**
  - Add input fields for `twilio_account_sid`, `twilio_auth_token` (type "password"), `twilio_phone_number`, and `admin_phone`.
  - Update state initialization in `fetchConfig` and payload handling in `handleSubmit`.

## Dev Notes

### Graceful Fallback (CRITICAL)
- The PRD demands: "Given the SMS provider (Twilio) is unavailable, Then the system logs the error and continues without blocking the user flow".
- Currently, `server/src/config/twilio.js` line 42 THROWS an error: `throw new Error('Error al enviar el SMS. Intenta de nuevo.');`.
- You **MUST** remove this `throw` in `twilio.js`. If an error occurs, simply log it and return `{ success: false }`. The OTP flow must not crash; it should continue so the user sees a successful UI state but can request a resend later if needed.

### Dynamic Configuration Lifecycle
- The `Twilio` client instance must be refreshed if credentials are changed in the Admin Dashboard. Because `twilio.js` currently caches the client globally (`let twilioClient = null;`), it ignores any DB updates. Ensure you recreate the Twilio client dynamically per request or introduce a cache invalidation mechanism when fetching from `AppConfig`.

### CDMX Timezone Check for Friday
- When evaluating "Friday (0:00-24:00)" in `agenda-controller.js`, it must be evaluated in the CDMX timezone (`America/Mexico_City`).
- Do not use a naive `new Date().getDay() === 5` as it depends on the server's local timezone.
- Use explicit formatting to check the day of the week in CDMX, avoiding timezone offset bugs. Example:
  ```javascript
  const nowStr = new Date().toLocaleString("en-US", {timeZone: "America/Mexico_City", weekday: "short"});
  if (nowStr === "Fri") {
      // Fetch admin_phone from AppConfig and send SMS
  }
  ```

### Data Privacy & Security
- `getConfig` currently returns `whatsapp_avisos_url` to normal volunteers. Be EXTREMELY careful: Twilio credentials **must not** be included in the JSON payload unless the requester's `role` is `admin` or `superadmin`.

### Existing OTP Logic
- The OTP generation (`generateOtp`) and validation (`verifyOtp`) logic already exists and functions correctly. Your task is only to ensure the Twilio delivery mechanism points to the DB config, handles failures gracefully, and expands to Admin UI settings.

## Dev Agent Record

### Agent Model Used
Gemini
### Completion Notes List
- ✅ Implemented Twilio Config fallback using AppConfig via `getTwilioConfig()`.
- ✅ Handled graceful fallback in `sendSMS` to not block OTP registration flow.
- ✅ Implemented Friday check in `cancelScheduling` based on CDMX timezone and sent SMS to admin.
- ✅ Handled Baja to Alta reactivation SMS logic in `auth-controller.js`.
- ✅ Exposed new Twilio and Admin SMS input fields in the Admin React Dashboard (`AdminConfig.jsx`).
### File List
- `server/src/config/twilio.js`
- `server/src/controllers/config-controller.js`
- `server/src/controllers/agenda-controller.js`
- `server/src/controllers/auth-controller.js`
- `client/src/pages/admin/AdminConfig.jsx`

### Review Findings
- [x] [Review][Patch] `req.user.name` is undefined in JWT context (`server/src/controllers/agenda-controller.js:208`)
- [x] [Review][Defer] Stale Twilio configuration in multi-instance setups (`server/src/config/twilio.js:7`)
- [x] [Review][Defer] Admin cannot fully disable notifications via UI if env fallback exists (`server/src/controllers/config-controller.js:71`)
- [x] [Review][Defer] No SMS notification for late Saturday cancellations (`server/src/controllers/agenda-controller.js:201`)
