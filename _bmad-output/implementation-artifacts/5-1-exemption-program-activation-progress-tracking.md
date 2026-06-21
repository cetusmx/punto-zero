# Story 5.1: Exemption Program Activation & Progress Tracking

## Story Requirements

**User Story:**
As a volunteer,
I want the exemption program to activate automatically when I book my first turno, and to track my progress,
So that I know how close I am to earning the fee exemption.

**Acceptance Criteria:**
- **Given** I book my first turno and accept the T&C, **Then** the exemption program is activated. The 6-month countdown starts from my first confirmed attendance.
- **Given** I have active participations, **When** I view my progress, **Then** I see: total attendances, number of faltas, the 6-month deadline, and remaining attendances needed.
- **Given** I have 0 attendances, **Then** the progress bar shows 0/6.
- **Given** I complete 6 attendances within 6 months, **Then** I am eligible for the QR Exención.
- **Given** I do not complete 6 attendances within 6 months, **Then** the count resets automatically, and new attendances start a new cycle.

## Developer Context

This story introduces the core tracking mechanics for the Exemption Program (Programa de Exención). 
Currently, the `Scheduling` model records `acceptedTerms`, which serves as the "activation" trigger when the user books their first turn.
The progress tracking requires looking at the user's `Attendance` records. 

To implement this, you will need to:
1. Provide an endpoint to calculate the user's current exemption program progress:
   - Identify the first "Asistio" attendance to start the 6-month window.
   - Count the number of "Asistio" attendances within those 6 months.
   - Count the number of "Falta" attendances in the current window.
   - Return the deadline (first attendance + 6 months), current counts, and whether they are eligible for the QR.
2. If 6 months pass without reaching 6 attendances, the system should reset the window to start at the *next* "Asistio" attendance after the expiration. *(Note: Build this window calculation modularly so it's easy to inject the "reset after 3 faltas" rule in upcoming Story 5.2).*
3. On the frontend (`MySchedulesPage.jsx` and the Saturday Dashboard if applicable), display this progress visually using a custom reusable component (UX-DR14 & UX-DR3: thin bar, 0/6 to 6/6, celebration on 6/6). Ensure it's not heavy so it fits well within the Saturday Dashboard's hero section.
4. Display the total attendances, faltas, deadline, and remaining needed within this component.

### Technical Requirements
- **Backend:** Create a service function (`src/services/exemption-service.js` or within `agenda` logic) to compute progress dynamically. It should not necessarily be stored persistently if it can be derived from attendances, or it can be cached. Computing on the fly is preferred if performant, to avoid sync issues.
- **Database:** Prisma schema already has `Attendance` and `Scheduling`. You will query `Attendance` joined with `Scheduling` for dates.
- **Frontend:** Update `MySchedulesPage.jsx` to fetch and render the progress UI. Also, ensure the component can be imported into the Saturday Dashboard for weekend operations.

### File Structure Requirements
- `client/src/components/ExemptionProgress.jsx`: New component for the progress bar.
- `server/src/routes/exemption-routes.js` or add to `agenda-routes.js` for fetching progress.

### Testing Requirements
- The date logic for 6-month windows must be robust and tested manually.
- Verify the edge case where the 6-month deadline passes: the window should shift.

## Review Findings

- [x] [Review][Patch] Missing Eligibility Retention (merged A1, E3, B11) [server/src/services/exemption-service.js:53]
- [x] [Review][Patch] Missing Real-Time Window Expiration Reset (merged A2, E1) [server/src/services/exemption-service.js:90]
- [x] [Review][Patch] Missing Program Activation Verification (merged A3, B8) [server/src/services/exemption-service.js:25]
- [x] [Review][Patch] Boundary Condition Logic Error / Exclusive deadline (merged A4, B6) [server/src/services/exemption-service.js:53]
- [x] [Review][Patch] Silent UI Failure on Network Error (B1) [client/src/components/ExemptionProgress.jsx:35]
- [x] [Review][Patch] Database Over-fetching (B3) [server/src/services/exemption-service.js:10]
- [x] [Review][Patch] Uncapped Attendance Display (B5) [client/src/components/ExemptionProgress.jsx:56]
- [x] [Review][Patch] Timezone Date-Parsing (B7) [client/src/components/ExemptionProgress.jsx:90]
- [x] [Review][Patch] Silent NaN Coercion (B10) [server/src/services/exemption-service.js:12]
- [x] [Review][Patch] ExemptionProgress stale on cancellation (E2) [client/src/pages/MySchedulesPage.jsx:163]

## Status
Status: done
