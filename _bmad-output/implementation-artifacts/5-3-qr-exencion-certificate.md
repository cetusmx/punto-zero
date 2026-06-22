# Story 5.3: QR Exención Certificate

Status: ready-for-dev

## Story

As a volunteer who completed 6 attendances in 6 months,
I want to access my dynamically generated QR Exención certificate,
so that I can prove my fee exemption at collection points.

## Acceptance Criteria

1. **Certificate Generation Eligibility (AC: #1):**
   - **Given** I am a volunteer with at least 6 valid attendances in my current 6-month cycle,
   - **And** I do not currently have an active `Exencion` certificate,
   - **When** I request to claim my exemption certificate,
   - **Then** a new `CertificateQR` of type `'Exencion'` is generated in the database, valid for exactly 1 year from the date of issuance.

2. **Viewing the Active QR Certificate (AC: #2):**
   - **Given** I have an active QR Exención certificate,
   - **When** I navigate to the "Mis Certificados" tab via the main navigation,
   - **Then** I see my active certificate displayed dynamically using `qrcode.react`,
   - **And** it is formatted with the active certificate style (brand success colors) and a congratulatory message,
   - **And** the certificate card clearly displays my name, the registration date (`issuedAt`), and the expiration date (`expiresAt`).

3. **QR Code Security & Anti-Download Measures (AC: #3):**
   - **Given** the QR certificate is displayed on my screen,
   - **When** I interact with the QR code image,
   - **Then** there is no download button available,
   - **And** right-click (context menu), long-press, and drag-and-drop are disabled on the QR container to discourage saving it locally (screenshots remain acceptable).

4. **Empty State Handling (AC: #4):**
   - **Given** I do not have any active or past certificates,
   - **When** I navigate to "Mis Certificados",
   - **Then** I see an empty state message (UX-DR11): "Aún no tienes certificados. Completa 6 atenciones para obtener tu Exención."

5. **Expired Certificate Handling (AC: #5):**
   - **Given** my QR Exención has passed its `expiresAt` date,
   - **When** I view "Mis Certificados",
   - **Then** the certificate is shown with an expired style (gray/opaque filter),
   - **And** the system recognizes that new attendances accumulated after the expiry date will now count toward a brand new QR Exención cycle.

## Tasks / Subtasks

### Server-Side (Express + Prisma)
- [ ] **Endpoint: List Certificates (`GET /api/volunteer/certificates`)**
  - Fetch all `CertificateQR` records for `req.user.id`, ordering by `issuedAt` descending.
  - Return the JSON array of certificates.
- [ ] **Endpoint: Claim Exención (`POST /api/volunteer/certificates/claim-exencion`)**
  - Fetch user's current progress to verify `totalAttendances >= 6` within the valid timeframe.
  - Query for an existing active certificate: `findFirst` where `userId = req.user.id`, `type = 'Exencion'`, `isActive = true`, and `expiresAt > new Date()`.
  - If eligible and no active certificate exists: Create a new `CertificateQR` with `type: 'Exencion'`, `issuedAt: new Date()`, `expiresAt: new Date() + 1 year`, `isActive: true`, `attendancesAtIssuance: progress.totalAttendances`.
  - If already active or ineligible, return `400 Bad Request` with a clear error message.
- [ ] **QR Data Payload Structure**
  - Define the standard JSON payload encoded inside the QR: `{"certId": id, "userId": userId, "type": "Exencion", "expiresAt": "YYYY-MM-DD"}`.

### Client-Side (React + MUI)
- [ ] **Navigation & Routing Integration**
  - Ensure the bottom tab navigation (mobile) and sidebar (desktop) point to `/mis-certificados` (UX-DR5).
- [ ] **Page Component: `Certificates.jsx`**
  - Fetch certificates via `GET /api/volunteer/certificates` on mount. Handle loading skeletons (UX-DR12).
  - If the user has 6 attendances but no active certificates, display a "Generar Certificado de Exención" CTA button that invokes `POST /api/volunteer/certificates/claim-exencion`.
  - Implement the empty state (UX-DR11) if the list is completely empty.
- [ ] **Component: `QRCodeCard.jsx`**
  - Build a reusable card component utilizing `qrcode.react`.
  - Apply MUI theming: success colors (`#789b3d`) for active, and grayscale styles for expired.
  - Implement DOM event blockers: `onContextMenu={(e) => e.preventDefault()}`, `draggable={false}`. Add CSS properties `user-select: none; pointer-events: none;` on the `<canvas>`/`<svg>` element.

## Dev Notes

### Mutating State in GET Requests (CRITICAL)
Do **not** auto-generate the certificate inside `GET /certificates` as the previous spec suggested. `GET` endpoints must remain idempotent. Use the dedicated `POST /api/volunteer/certificates/claim-exencion` endpoint when the user explicitly interacts with the UI to claim it, or defer automatic generation to a background job/webhook tied to attendance recording.

### Database Query for Active Certificates
When verifying if a user already has an active Exención, ensure you check the expiration date, not just the `isActive` boolean, to handle temporal expiration gracefully:
```javascript
const activeExencion = await prisma.certificateQR.findFirst({
  where: {
    userId: req.user.id,
    type: 'Exencion',
    isActive: true,
    expiresAt: {
      gt: new Date()
    }
  }
});
```

### Timezones
Ensure `issuedAt` and `expiresAt` boundaries are calculated securely within the `America/Mexico_City` timezone, matching the standard established in the agenda scheduling endpoints.
