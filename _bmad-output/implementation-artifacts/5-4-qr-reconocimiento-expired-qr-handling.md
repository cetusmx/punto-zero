# Story 5.4: QR Reconocimiento & Expired QR Handling

Status: ready-for-dev

## Story

As a volunteer,
I want to earn recognition QRs during my exemption period and see visual state for expired certificates,
So that I feel recognized for continued participation and know when my exemption has lapsed.

## Acceptance Criteria

1. **Earning QR Reconocimiento (AC: #1):**
   - **Given** I am a volunteer with an *active* `Exencion` certificate,
   - **When** I complete 6 valid attendances within a new 6-month cycle (started after the most recent certificate, Exencion or Reconocimiento, was issued),
   - **Then** I am eligible to claim a `Reconocimiento` certificate.
   - **And** when claimed, a new `CertificateQR` of type `'Reconocimiento'` is generated with no expiration date (`expiresAt` is null).

2. **Cycle Tracking & Reset (AC: #2):**
   - **Given** I am earning a Reconocimiento,
   - **When** I fail to complete the 6 attendances within 6 months of the last issued certificate,
   - **Then** the count resets to 0 and a new 6-month cycle starts automatically (FR-24).
   - **And** upon successfully claiming a Reconocimiento, those 6 attendances are consumed and a new 6-month cycle begins immediately for the next potential Reconocimiento.

3. **Visual Differentiation for Reconocimiento (AC: #3):**
   - **Given** I view "Mis Certificados",
   - **When** I have a `Reconocimiento` certificate alongside an expired `Exencion` certificate,
   - **Then** the `Reconocimiento` is formatted with a distinct visual style (e.g., brand primary or gold/secondary colors) to differentiate it.
   - **And** the `Reconocimiento` displays the date of issuance but never shows an expiration date.
   - **And** the `Reconocimiento` is always shown in its original colored style (never grey/opaque), while the expired `Exencion` shows grey/opaque simultaneously.

4. **Notifications for Expiring Exención (AC: #4):**
   - **Given** my QR `Exencion` is active,
   - **When** the current date reaches exactly 30 days, 7 days, or 0 days (day of) prior to the `expiresAt` date,
   - **Then** a background system process generates an in-app badge notification warning me of the upcoming expiry.

5. **Cycle Reset Post-Expiry (AC: #5):**
   - **Given** my QR `Exencion` expires,
   - **When** I attend new operations,
   - **Then** my new attendances automatically start counting toward a brand new `Exencion` certificate cycle.

## Tasks / Subtasks

### Server-Side (Express + Prisma)
- [ ] **Endpoint: Claim Reconocimiento (`POST /api/v1/volunteer/certificates/claim-reconocimiento`)**
  - Verify if user has an active `Exencion` certificate.
  - Calculate attendances using the updated `calculateUserProgress`.
  - Ensure the user is eligible for a `Reconocimiento` (totalAttendances >= 6 in the current cycle).
  - Create a new `CertificateQR` with `type: 'Reconocimiento'`, `issuedAt: new Date()`, `expiresAt: null`, `isActive: true`. This automatically consumes the 6 attendances by establishing a new `issuedAt` date for future cycle tracking.
- [ ] **Exemption Service Logic Update (`calculateUserProgress`)**
  - Overhaul the dynamic `periodStartDate` calculation. It must resolve to the `issuedAt` date of the *most recent* certificate (`Exencion` or `Reconocimiento`) OR the start of a new cycle if 6 months have passed since then.
  - Return `{ cycleType: 'Exencion' | 'Reconocimiento', totalAttendances, isEligible, cycleStartDate, cycleEndDate }` to assist the frontend CTA logic and properly enforce the strict 6-month window without concurrent periods (FR-23).
- [ ] **Background Job: Expiry Notifications**
  - Implement a daily cron job that queries for `CertificateQR` where `type = 'Exencion'` and `isActive = true`.
  - Calculate days remaining until `expiresAt`. If exactly 30, 7, or 0 days, create a `NotificationBadge` for the user.
  - Automatically update `isActive = false` if `expiresAt < now()`.

### Client-Side (React + MUI)
- [ ] **Component: `CertificatesPage.jsx` updates**
  - Read `cycleType` from `/agenda/progress` to conditionally render either "Generar Certificado de Exención" or "Generar Certificado de Reconocimiento" when eligible.
  - Update `CertificateCard` logic to apply a distinct color theme (e.g., warning/gold) when `cert.type === 'Reconocimiento'`.
  - Ensure `Reconocimiento` cards do not render an expiration date block and bypass the `!isActive` grayscale logic.
  - Test UI visually with both an expired Exención and a new Reconocimiento side-by-side to ensure styles apply concurrently without conflicts.

## Dev Notes

### Progress Calculation Overhaul (Critical)
The `calculateUserProgress` service must dynamically set the `periodStartDate`. 
1. Fetch the user's most recently issued certificate. 
2. If none, start from the first attendance or today.
3. If one exists, the new tracking cycle starts on its `issuedAt` date.
4. However, if >6 months have elapsed since that date, the cycle has failed and it must fast-forward the `periodStartDate` in 6-month chunks (or simply from the first attendance after the lapsed 6 months) to enforce the rolling expiry, identical to how the Exencion expiry works.

### Idempotency & Claim Vulnerability
By anchoring the `periodStartDate` to the most recent certificate's `issuedAt` date, claiming a Reconocimiento implicitly "consumes" the 6 attendances (because the next progress check will only count attendances *after* the newly minted Reconocimiento). Ensure the claim endpoint runs within a database transaction or uses proper locking to prevent concurrent requests from minting duplicate certificates for the same 6 attendances.

### Cron Job Safety
The daily expiry cron job must be idempotent. Avoid sending duplicate notifications if the cron runs twice in one day. 
