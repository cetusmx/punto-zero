# Story 5.2: 3-Falta Reset Logic

## Story Foundation
As a volunteer,
I want my attendance count to reset if I accumulate 3 faltas,
So that the exemption program is fair and requires consistent participation.

**Acceptance Criteria:**
- Given I have accumulated 3 faltas in my current cycle,
  When the third falta is registered by the admin,
  Then my attendance and falta counts reset to 0, a new cycle starts from that date, and I receive a badge notification.
- Given an admin reverts a falta that caused a 3-falta reset,
  Then the system re-evaluates the count and restores it if appropriate.
- Given I have 2 faltas,
  Then I see a warning on my progress view: "Llevas 2 faltas. Una más y tu conteo de atenciones se reiniciará."

## Developer Context

### Technical Requirements
1. **Reset Logic**: Update `calculateUserProgress` in `server/src/services/exemption-service.js`. 
   - Inside the loop evaluating `attendances`, keep track of `faltas`. 
   - If `att.status === 'Falta'` and `faltas` reaches `3`, immediately reset `currentWindowStart = null`, `currentWindowDeadline = null`, `currentWindowAttendances = []`, and reset `faltas`. 
   - This automatically satisfies the "revert" rule, since `calculateUserProgress` dynamically recalculates the window based on the actual history of attendances and faltas. If an admin changes a "Falta" back to "Pendiente", the 3-falta condition won't trigger during recalculation.
2. **Warning UI**: In `client/src/components/ExemptionProgress.jsx`:
   - If `progress.faltas === 2`, display a warning alert.
   - Text: "Llevas 2 faltas. Una más y tu conteo de atenciones se reiniciará."
3. **Admin Trigger & Notification**: 
   - The PRD says "When the third falta is registered by the admin... I receive a badge notification". 
   - This requires updating the admin endpoint that marks a `Falta`. When a status is changed to `Falta`, calculate the progress *after* the change. If the resulting calculation triggered a reset (this requires checking if the newly added falta was the 3rd one, which might be tricky if we just recalculate), we need to send a badge notification.
   - Alternatively, we can check the state *before* and *after*. If `faltas` was `2` before the change, and we are adding a `Falta`, then it resets. So we can just check `const oldProgress = await calculateUserProgress(userId)` and `const newProgress = await calculateUserProgress(userId)`. If `oldProgress.faltas === 2` and `newProgress.faltas === 0` (and `newProgress.totalAttendances === 0`), it means a reset occurred, so we can trigger the badge notification. (Note: The Notification System is Epic 6, but we should at least leave a placeholder or simple DB insertion for the badge if Epic 6 isn't fully implemented, or just log it for now). Wait! "notificar usuario: badge (campana)" - we might not have a `Notification` model yet. If we don't, just add a simple `TODO` or a basic schema update for Notifications if it doesn't exist, or just skip the actual notification delivery if the model isn't there yet. Let's look if `Notification` exists.

### Architecture & Compliance
- The dynamic `calculateUserProgress` is the single source of truth. Do NOT store `windowStart` in the DB as a persistent field, keep the dynamic calculation to ensure automatic reversions.

## Status
Status: ready-for-dev
