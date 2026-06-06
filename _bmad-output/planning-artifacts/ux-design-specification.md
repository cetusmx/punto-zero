---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-punto-zero-2026-05-24/prd.md"
  - "_bmad-output/planning-artifacts/prds/prd-punto-zero-2026-05-24/addendum.md"
  - "_bmad-output/planning-artifacts/prds/prd-punto-zero-2026-05-24/.decision-log.md"
---

# UX Design Specification punto-zero

**Author:** Oscar
**Date:** 2026-06-02

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

punto-zero es una plataforma web que conecta ciudadanos voluntarios con un programa de recolección de desechos orgánicos. Los voluntarios se registran vía SMS (OTP), calendarizan turnos sabatinos en puntos de acopio públicos, y participan automáticamente en un programa de recompensa donde 6 atenciones en 6 meses generan un QR de exención de cuotas por 1 año. Los administradores gestionan puntos, asistencia, reemplazos y usuarios.

### Target Users

- **Voluntario:** Ciudadano comprometido con el medio ambiente. Se registra con teléfono + SMS OTP. Agenda turnos los sábados. Participa automáticamente en programa de recompensa.
- **Admin:** Coordinador operativo. Gestiona puntos de acopio, asistencia, reemplazos, usuarios y métricas.
- **Superadmin:** Creado en BD durante despliegue. Puede gestionar otros admins. Hereda capacidades de Admin.

### Key Design Challenges

1. **Onboarding SMS OTP** — Flujo registro → OTP → perfil completo con múltiples pasos. Riesgo de abandono.
2. **Deadline viernes 23:59** — Restricción temporal que debe ser visible en UI para evitar frustración.
3. **Dual Estatus/Acceso** — Estatus (control usuario) vs Acceso (control admin) deben diferenciarse claramente.
4. **QR Exención vs Reconocimiento** — Dos tipos de QR con valores y reglas distintas. Jerarquía visual necesaria en "Mis Certificados".
5. **Layout admin (OQ-2)** — Sin definir: navegación, badges, jerarquía de secciones.

### Design Opportunities

3. **Badge como centro de información** — Campana no solo notificaciones, sino también próximo turno, logros y alertas.

## Core User Experience

### Defining Experience

**"Every Saturday, a chance to improve our planet."** — The defining experience of punto-zero is the moment a volunteer opens the app on Saturday morning, sees their assigned collection point, and feels: *today I contribute*. It is not about scheduling efficiency. It is about making each Saturday a meaningful ritual of community service. The scheduling, the exemption tracking, the deadlines — all are supporting acts. The main event is Saturday.

### Platform Strategy

**Mobile-first responsive web** (React.js). The primary design target is mobile screens, with graceful scaling to tablet and desktop. All core flows (register, browse, schedule, cancel, view QRs) must work flawlessly on a 375px viewport. Admin panel can be more desktop-oriented given the operational nature.

### Effortless Interactions

1. **Dashboard personal inmediato** — Upon login, the user sees their next scheduled turno, current exemption progress (X of 6 attendances), and any pending notifications. No navigation required for the most important information.
2. **Filtros rápidos** — Agenda filters (colonia, punto, solo con cupo) update results instantly without page reload. Debounced input to avoid performance issues on mobile.

### Critical Success Moments

- First-time user sees available Saturdays → "Hay cupo este sábado" (conversion moment)
- User completes 6th attendance → QR de exención generado (accomplishment moment)
- User cancels on Friday and sees instant confirmation → trust moment (no bureaucratic delay)

### Experience Principles

1. **Availability first** — The most important thing is showing what's available, clearly and immediately.
2. **Deadline transparency** — Never let the user discover the deadline by hitting an error. Show remaining time proactively.
3. **Mobile-optimized scheduling** — Every tap counts. Minimize form fields, maximize legibility.
4. **Instant feedback** — Every action (schedule, cancel, filter) reflects immediately without confusion.

### User Mental Model

**Explore first, register later.** The volunteer arrives wanting to see what's available before committing to anything. They scan Saturdays and collection points like a calendar they already understand — looking for what fits their schedule and location.

**Exemption program is intuitive.** The "6 Saturdays in 6 months → 1 year free" structure maps to a natural mental model: a progress bar the user fills by showing up. No explanation needed. The user understands it the same way they understand a punch card at a coffee shop.

**Tacit attendance is expected.** The volunteer knows the admin is there in person. They don't need to "check in" digitally. Showing up is confirmation enough. The system confirms their attendance silently at 2pm.

### Success Criteria

- **"I know where to go"** — Saturday morning, one tap opens Maps to their assigned point
- **"I know how I'm doing"** — X/6 progress is visible whenever they want it, but never in their face
- **"I feel part of something"** — The experience prioritizes belonging and recognition over utility and efficiency
- **"It just works"** — No confirmation needed, no extra steps, no friction on Saturday
- **"I'm proud"** — At the end of the day, the volunteer feels they gave their time to a noble cause

### Novel vs. Established Patterns

The core experience relies on **established patterns** with a unique emotional twist:

| Pattern | Source | Twist |
|---|---|---|
| Saturday reminder (badge) | Standard notification pattern | Not "don't forget" but "today you contribute" — celebratory tone |
| Maps button | Common "open in Maps" pattern | Placed front and center on Saturday dashboard, not buried |
| Tacit attendance | Uncommon in digital products | Trust-based. Admin marks attendance; user doesn't need to check in. Novel for its absence of friction. |
| Progress indicator | Duolingo Streak, Apple Watch Rings | Always accessible, never persistent. User pulls the info, it doesn't push. |
| Belonging-first tone | Community apps (Nextdoor, Meetup) | Volunteer pride and recognition before task completion |

**What's novel:** The combination of a trust-based tacit attendance model with a progress-driven exemption program, wrapped in a pride-and-belonging emotional frame rather than a purely transactional one.

### Experience Mechanics

**The Saturday Flow**

**Day before (Friday):**
- Badge notification: "Mañana es sábado — te esperamos en [Punto] a las 8am"
- No SMS. Just badge. Gentle. Celebratory.

**Saturday morning (user opens app):**
- Landing page is not the agenda. It's the **Saturday Dashboard**.
- Hero message: "Hoy participas en [Punto de Acopio] — [Colonia]"
- Subtext: "8:00am - 2:00pm"
- Primary CTA: "Abrir en Maps" → launches Google Maps / Waze / Apple Maps
- Secondary: full agenda (in case they want to see upcoming Saturdays)
- Progress ring (X/6) visible in top corner of the Saturday Dashboard — present but not dominant

**During the day (8am-2pm):**
- User goes to the point. Admin marks attendance in person (admin flow).
- No digital check-in required from user.
- Badge remains unchanged until 2pm.

**At 2pm:**
- Attendance auto-confirmed by system (via node-cron). If admin didn't manually mark falta, attendance is assumed.
- Progress ring updates: X+1/6
- Badge notification: "Asistencia confirmada. Gracias por participar."
- Optional: impact micro-message ("Gracias a ti, hoy se recolectaron N kg en tu colonia")

**End of day emotion:**
- Pride. The volunteer closes the app feeling they contributed to something larger than themselves.
- The Saturday Dashboard transitions back to the regular agenda view for next week.

## Desired Emotional Response

### Primary Emotional Goals

1. **Orgulloso de contribuir** — Pride in being part of an environmental initiative. Requires early touchpoints (before the 6-month milestone) such as impact metrics and community visibility.
2. **En control y confiado** — Always know turn status, progress, and deadlines. Proactive alerts for 3-falta risk. Real-time feedback on Saturdays.
3. **Eficiente y sin esfuerzo** — Scheduling and canceling take seconds. No fields asked without immediate value.
4. **Conectado con la comunidad** — Sense of belonging to a group with shared purpose. Warm onboarding, visible community size, WhatsApp groups feel like a team.

### Admin Emotional Goals

- **Confianza operativa** — Trust that the system reflects reality (attendance, reemplazos). Clear feedback for every action.
- **Control bajo presión** — Saturdays are operational peak. UI must enable fast decisions without errors.
- **Visibilidad del impacto** — Seeing metrics of program success = job satisfaction.

### Emotional Journey Mapping

- **Discovery/Registration:** Curious → Welcomed (warm onboarding message, community size visible)
- **First scheduling:** Anticipatory → Satisfied (clear availability, secured a spot)
- **Ongoing use:** In control (next turno always visible, proactive deadline countdown, falta counter visible)
- **Cancellation:** Responsible (not guilty — micro-moment of "gracias por avisar" with acknowledgment)
- **No hay cupo scenario:** Disappointed → Hopeful (alternative Saturdays highlighted, "próxima semana hay más cupos")
- **Saturday operation (8am-2pm):** Uncertain → Confirmed (real-time attendance feedback, badge update)
- **Exemption achieved:** Proud and rewarded (celebration animation, QR as trophy)
- **Admin on Saturday:** Pressured → In control (fast tools, clear overview, undo capability)

### Micro-Emotions

- **To cultivate:** Trust, accomplishment, belonging, anticipation, hope (when no cupo), responsibility (when canceling)
- **To eliminate:** Confusion (rules/deadlines), anxiety (slot availability), frustration (onboarding friction), uncertainty (saturday feedback gap), desconfianza (in system accuracy)

### Design Implications

- **Pertenencia desde el registro** → Post-activation message: "¡Bienvenido! Ya eres parte de los N voluntarios que mantienen limpia tu colonia."
- **Confianza en cancelación** → After cancel: show confirmation with "Turno liberado. Admin notificado." plus updated counter status.
- **Urgencia tranquila ante deadline** → Persistent countdown: "Quedan 2 días para agendar este sábado." Not error-based.
- **Esperanza cuando no hay cupo** → "Este sábado está lleno, pero el próximo sábado X tiene cupos disponibles." Highlight alternatives.
- **Feedback en vivo los sábados** → At 14:00, badge updates to "Asistencia confirmada." Before that, show "Turno hoy a las 8am" with pending status.
- **Alerta predictiva de faltas** → At 2 faltas: "Llevas 2 faltas. Una más y tu conteo de atenciones se reiniciará."
- **Celebración del logro** → QR de exención con micro-animación y mensaje de felicitación. No un PDF genérico.
- **Admin confidente** → Saturday dashboard with: list of points, assigned volunteers, one-click falta/reemplazo, undo option. No ambiguous states.

### Emotional Design Principles

1. **Clarity over cleverness** — No ambiguous icons or jargon. Every state explained in plain language.
2. **Celebrate contribution early and often** — Don't wait 6 months for the first proud moment.
3. **Frictionless but meaningful cancellation** — Instant, but with acknowledgment of the commitment.
4. **Proactive communication** — Tell the user before they need to ask (deadline countdown, falta alert, Saturday feedback).
5. **Admin experience matters** — Operational confidence directly impacts program quality.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Volunteering & Social Impact Apps:**
- Clear impact visualization ("X volunteers", "Y kg collected") → users return to see their contribution
- Low-commitment signup (phone-only, minimal fields) → reduces barrier to first action
- Social proof ("Join 500 volunteers in your area") → builds trust and belonging

**Community Apps (WhatsApp, Meetup, Nextdoor):**
- Hyper-local focus (colonias, neighborhoods) → users feel it is their community
- Broadcast + open channels → clear distinction between info and conversation
- Event-based scheduling with RSVP → familiar mental model for signing up for a Saturday

**Generic UX Patterns:**
- Progressive disclosure (register → profile → agenda) → don't ask everything at once
- Countdown timers for deadlines → creates gentle urgency without anxiety
- Achievement badges/progress bars → Duolingo-style motivation for long-term goals

### Transferable UX Patterns

**Navigation:**
- Bottom tab bar (mobile) with 4 sections: Agenda, Mis Turnos, Certificados, Perfil
- Admin: sidebar nav with sections (Agenda, Puntos, Usuarios, Métricas, Config)

**Scheduling:**
- Calendar-like grid showing Saturdays as available slots
- Color-coded: green = available, grey = taken, yellow = my booking, red = deadline passed
- Filter chips at top: Colonia, Punto, toggle "Solo con cupo"

**Progress & Motivation:**
- Circular progress ring for "X of 6 attendances" (Duolingo streak / Apple Watch rings style)
- Milestone celebration: micro-animation at 3/6 and 6/6

**Community:**
- WhatsApp group links accessible from dashboard, not buried in profile
- Optional: show total volunteer count and active participants this week

### Anti-Patterns to Avoid

1. Excessive form fields without immediate value → generator fields need clear labeling or deferral
2. Hidden deadlines → never show error without having shown countdown
3. Guilt-laden cancellation → trust the user, one-click confirmation
4. Admin UI as afterthought → Saturday operations are high-pressure, design accordingly

### Design Inspiration Strategy

**Adopt:** Calendar-grid scheduling with color-coded availability, progressive disclosure onboarding, community-first messaging.

**Adapt:** Duolingo-style progress rings for 6-month exemption tracking, WhatsApp community model for hyper-local groups.

**Avoid:** Feature bloat, multi-step confirmations, guilt-driven cancellation, admin as second-class UX citizen.

## Design System Foundation

### 1.1 Design System Choice

**Material UI (MUI)** — open-source React component library implementing Google's Material Design.

### Rationale for Selection

1. **Mobile-first DNA** — Material Design was born for mobile. Bottom navigation, floating action buttons, responsive grids, and touch-friendly hit targets align perfectly with punto-zero's mobile primary target.
2. **Theme customization** — MUI's `ThemeProvider` maps cleanly to the existing color palette (dark green `#41703f` primary, yellow `#ffe10f` accent, gold `#dbb539` secondary, light green `#789b3d` emphasis) without fighting framework defaults.
3. **React ecosystem maturity** — Largest community, most third-party integrations, abundant examples for scheduling, progress rings, badge notification patterns.
4. **Accessibility built-in** — WCAG 2.1 AA compliance out of the box reduces audit risk for a public program.
5. **Admin viability** — MUI's Data Grid, Drawer, and Stepper components handle admin operational needs (attendance rosters, user tables, multi-step flows) without switching to a second design system.

### Implementation Approach

- **Version:** MUI 6.x (latest stable with React 18+ support)
- **Theme engine:** MUI's `createTheme` with custom palette, typography, and shape tokens mapped to brand colors
- **Responsive breakpoints:** Mobile-first with breakpoints at `xs` (0), `sm` (600px), `md` (900px), `lg` (1200px)
- **Icons:** MUI Icons library (Material Symbols) for all UI icons
- **Custom components:** Build only where MUI doesn't cover:
  - Calendar-grid scheduler (color-coded Saturday agenda)
  - Circular progress ring (exemption tracker, 0-6 attendance)
  - Badge notification center (bell + panel with categorized messages)

### Customization Strategy

- **Color tokens** — Map brand palette to MUI semantic roles:
  - `primary` → Dark green `#41703f`
  - `secondary` → Gold/mustard `#dbb539`
  - `accent/warning` → Yellow `#ffe10f`
  - `success` → Light green `#789b3d`
  - `background` → White `#ffffff`
- **Typography** — System font stack (no custom font loading needed for MVP)
- **Shape** — Rounded corners (`borderRadius: 8`) for cards, buttons, inputs — friendly but not playful
- **Custom components** — Wrapped in theme-aware styled components; design tokens consumed from theme, not hardcoded
- **Override approach** — One centralized theme file; no per-component overrides scattered across the codebase

### Component Library Mapping

| UX Pattern | MUI Component | Customization |
|---|---|---|
| Bottom tab nav (mobile) | `BottomNavigation` | Brand-colored active state |
| Admin sidebar | `Drawer` + `List` | Collapsible, icon + label |
| Calendar-grid scheduler | Custom (`Grid` + `Card`) | Color-coded by availability |
| Agenda filter chips | `Chip` (toggle variant) | Multi-select, instant response |
| Scheduling form | `Stepper` + form fields | Progressive disclosure |
| Exemption progress ring | Custom (SVG circle) | Theme colors, ~ Apple Watch style |
| Badge notification center | `Badge` + `Popover`/`Drawer` | Categorized messages |
| QR display | Custom (`qrcode.react`) | Wrapped in themed card |
| Attendance table (admin) | `DataGrid` | Sortable, filterable |
| Countdown banner | `Alert` (persistent) | Yellow accent, non-dismissible |

### Accessibility & Responsiveness

- **Target:** WCAG 2.1 AA minimum
- **Touch targets:** Minimum 48x48px for all interactive elements
- **Color contrast:** Yellow `#ffe10f` only as accent/warning, never for critical text on white (contrast ratio ~1.3:1 fails AA); pair with dark backgrounds when used as text background
- **Responsive behavior:** Single-column mobile → two-column tablet → sidebar + main area desktop
- **Reduced motion:** `prefers-reduced-motion` respected; animations (celebration, progress updates) degrade gracefully to static states

## Visual Design Foundation

### Color System

Brand palette mapped to MUI semantic roles (defined in Design System Foundation §1.1):

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#41703f` | Buttons, headers, active states, brand elements |
| `secondary` | `#dbb539` | Secondary buttons, warm accents, badges |
| `warning/accent` | `#ffe10f` | Deadline countdowns, alerts, celebratory highlights |
| `success` | `#789b3d` | Confirmed attendance, progress complete, positive states |
| `background` | `#ffffff` | Page and card backgrounds |
| `text.primary` | `#1a1a1a` | Body and heading text (high contrast) |
| `text.secondary` | `#5c5c5c` | Labels, hints, secondary info |

**Accessibility notes:**
- Yellow `#ffe10f` (contrast ~1.3:1 on white) used only as accent/warning background with dark text, never as text color on white.
- All text/background combinations meet WCAG 2.1 AA (minimum 4.5:1 for normal text, 3:1 for large text).
- Success/failure states use color + icon (never color alone) for accessibility.

### Typography System

**Typeface:** System font stack (friendly, modern, fast-loading)
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif;
```

**Type scale (MUI defaults customized):**

| Level | Size | Weight | Usage |
|---|---|---|---|
| h1 | 1.75rem / 28px | 700 | Page titles, Saturday Dashboard hero |
| h2 | 1.5rem / 24px | 600 | Section headings |
| h3 | 1.25rem / 20px | 600 | Card titles, modal headers |
| body | 1rem / 16px | 400 | Primary reading text |
| body small | 0.875rem / 14px | 400 | Labels, secondary info |
| caption | 0.75rem / 12px | 400 | Badge counts, timestamps |
| button | 0.875rem / 14px | 600 | All interactive labels |
| progress | 2rem / 32px | 700 | X/6 ring count display |

**Tone:** Rounded, approachable, modern. Generous line-height (1.5 body, 1.2 headings) for readability on mobile.

### Spacing & Layout Foundation

**Base unit:** 8px (Material Design standard)

**Grid:** MUI 12-column grid system
- Mobile: 4 columns (375px)
- Tablet: 8 columns (768px)
- Desktop: 12 columns (1200px+)

**Content density:** Normal — neither dense nor excessively airy. 24px between major sections, 16px between related elements, 8px between tightly grouped items.

**Container max-width:** 1200px (desktop), full-bleed on mobile.

**Key spacing values:**
- Page padding: 16px mobile, 24px tablet, 32px desktop
- Card padding: 16px
- Gap between cards: 16px
- Bottom navigation height: 56px (MUI default)

### Accessibility Considerations

- All interactive elements meet 48x48px minimum touch target
- Focus indicators visible (MUI default: outline + color change)
- Color never used as sole differentiator (icon + label pattern)
- `prefers-reduced-motion` respected for animations
- MUI's built-in WCAG 2.1 AA compliance inherited
- Role and aria-label applied to all custom components (calendar grid, progress ring, notification panel)
- Form error messages associated via `aria-describedby` (MUI TextField default)

## Design Direction Decision

### Design Directions Explored

Three visual directions were generated as an interactive HTML showcase (`ux-design-directions.html`) covering 5 key screens (Saturday Dashboard, Agenda, Mis Turnos, Certificados, Perfil):

- **A: Green Impact** — Dark green (`#41703f`) dominant. Gradient hero cards, impact metrics banner (kg collected), eco-conscious tone. Green active states throughout.
- **B: Warm Community** — Gold/mustard (`#dbb539`) as primary accent. Community stats banner (active volunteers), warm welcome message, belonging-focused. Gold active states.
- **C: Clean Minimal** — White and light gray dominant, green as accent. 24px border radius, subtle shadows, system font. Minimalist product aesthetic (fintech/banking style). Progress shown as thin bar instead of ring.

### Chosen Direction

**C: Clean Minimal** — selected as the primary design direction.

### Design Rationale

1. **Focus on content, not chrome** — The minimalist approach lets the Saturday mission ("Hoy participas en Punto Centro") be the hero, not the UI chrome. The white background makes the green brand elements pop without overwhelming.
2. **Mobile-first by nature** — Sparse, airy layouts perform better on small screens. The 24px border radius and generous spacing feel native and modern.
3. **Trust and clarity** — A clean, almost-financial-app aesthetic communicates reliability and precision — important for a program managing attendance, deadlines, and exemptions.
4. **Tone flexibility** — White + green base allows injecting warmth (gold accents) or impact (metrics cards) without breaking the foundation. It is the most extensible of the three directions.

### Implementation Approach

- Card-based layouts with generous white space (24px padding, 16px gaps)
- Green `#41703f` as primary action color; gold `#dbb539` reserved for recognition/warmth moments
- Progress tracked via thin bar (not circular ring) — cleaner, less visual weight
- Bottom nav with simple outlined/filled icon states
- All corners at 24px for cards, 12px for small components
- Shadows: very subtle (0 2px 8px rgba(0,0,0,.06)) for depth without heaviness

## User Journey Flows

### Journey 1: Onboarding → First Scheduling

**Entry points:** QR code at collection points / WhatsApp referral link

**Flow overview:**

```
Entry → Welcome → Phone Input → SMS OTP (3 attempts, 60s timer)
  → Profile (name, age, gender, email, T&C)
  → Agenda (grid of available Saturdays + filters)
  → Slot Detail (point, address, time window)
  → Commitment Step (weekly, 6/6 rule, 3 faltas reset)
  → Booking Confirmation (badge + progress 0/6) → Saturday Flow
```

**Edge cases handled:**

| Error | UX Response |
|---|---|
| Invalid phone number | "Número inválido. Formato esperado: 10 dígitos" |
| OTP incorrect (≤3 attempts) | Re-enter code, remaining attempts shown |
| OTP 3 failures | Code expires, request new one |
| OTP timeout (60s) | "Timer expirado. Reenviar código" |
| Rate limiting | Server-side: 15min cooldown after 3rd fail, IP-level |
| T&C not accepted | Checkbox required, cannot proceed |
| No slots available | "Este sábado está lleno" + green alternatives |
| Slot taken mid-session | Optimistic locking + auto-refresh grid |
| Deadline passed (Fri 23:59) | "Plazo vencido. Contacta al admin" |

**Party Mode improvements (integrated):**

- **Compromiso step** (John/PM): Before final confirmation, user sees a clear summary of the program rules — weekly participation, 6 attendances in 6 months for exemption, 3 faltas reset count. Explicit "Sí, confirmo" required.
- **Slot detail enriched** (Sally/UX): Each slot card shows point name, full address, time window, and remaining capacity. Progress shows as "0 de 6 sábados completados" with explanatory text.
- **Technical safeguards** (Amelia/Dev): Server-side optimistic locking for race conditions on slot booking. Rate limiting enforced server-side (15min cooldown, IP throttling) — not in frontend logic.

**Mermaid diagram:** See `journey-onboarding.mmd` for the complete visual flow.

## Component Strategy

The component library strategy is fully defined in the **Design System Foundation** section (§1.1). The Component Library Mapping table covers all 10 UX patterns mapped to MUI components, with 3 custom components identified:

| Custom Component | Rationale | States |
|---|---|---|
| **Calendar-grid scheduler** | MUI has no weekly Saturday grid with color-coded availability | Available, Full, My booking, Deadline passed, Selected |
| **Progress bar** (thin bar, Clean Minimal style) | MUI LinearProgress lacks the branding and "X of 6" label integration | 0/6 through 6/6, celebration at 6/6 |
| **Badge notification center** | MUI Badge is just a dot; needs a categorized panel | New, Read, Categories (reminders, alerts, achievements) |

**Implementation approach:** All custom components built as theme-aware styled components consuming MUI design tokens. No hardcoded colors or spacing.

## UX Consistency Patterns

### Button Hierarchy

| Level | Style | Usage | Example |
|---|---|---|---|
| **Primary** | `#41703f` filled, white text, 24px radius | Single most important action on screen | "Agendar", "Confirmar turno", "Abrir en Maps" |
| **Secondary** | White fill, `#41703f` border, `#41703f` text | Alternative action, cancel | "Cancelar turno", "Ver agenda" |
| **Tertiary** | Text only, `#5c5c5c` | Less important, contextual | "Ver detalle", "Más información" |
| **Destructive** | White fill, `#c62828` border | Irreversible actions | "Dar de baja" (admin only) |
| **Disabled** | `#e0e0e0` fill, `#999` text | Unavailable action | Slot already taken |

All buttons: 48px min height (touch target), 14px font, 600 weight.

### Feedback Patterns

| Type | Component | Style | Behavior |
|---|---|---|---|
| **Success** | MUI Alert / Badge | Green `#789b3d` background | Auto-dismiss after 3s or user tap |
| **Error** | MUI Alert (persistent) | Red background + icon | Dismiss only after user action |
| **Warning** | MUI Alert (persistent) | Yellow `#ffe10f` bg + dark text | Non-dismissible when deadline-critical |
| **Info** | MUI Alert / Badge dot | Gray `#5c5c5c` | Badge dot in bell icon, panel on tap |
| **Celebration** | Micro-animation | Green + gold accent | 6/6 milestone, new QR certificate |

**Notification hierarchy:**
1. **SMS** — OTP only, plus admin notifications (Friday cancellations, reactivations)
2. **Badge (bell)** — Upcoming turno, falta alerts, deadline warnings, achievement unlocks
3. **In-app alert** — Success/error messages within current screen context

### Form Patterns

| Form | Fields | Validation | Behavior |
|---|---|---|---|
| **Login identifier** | 1 field (email or phone) | Auto-detect: if `@` → email format, else → 10-digit MX | Unified field label: "Teléfono o correo electrónico" |
| **Phone input** | 1 field (10 digits) | MX format, real-time mask | Send OTP on valid input, error on invalid |
| **OTP** | 6 individual digit boxes | 6 digits required | Auto-advance on input, timer countdown |
| **Profile** | Name, Age, Gender, Email, T&C | Name required, Email format, T&C checkbox | Name not editable after submit |
| **Agenda filters** | Colonia (dropdown), Punto (dropdown), Cupo (toggle) | None | Instant results, no submit button |
| **Schedule confirm** | Slot selection + Commitment checkbox | Checkbox required | Preview of selected slot before confirm |

General form rules:
- Inline validation on blur (not on keystroke)
- Error message below the field, not as a toast
- Submit button disabled until all required fields valid

### Navigation Patterns

**Mobile (volunteer):** Bottom tab bar — 5 items max, always visible.
- Inicio (active tab = Saturday Dashboard on Saturday, agenda otherwise)
- Agenda
- Mis Turnos
- Certificados
- Perfil

**Desktop/Tablet (volunteer):** Same bottom bar or top tab bar. Agenda becomes two-column (calendar + detail).

**Admin:** Sidebar navigation (MUI Drawer) with sections:
- Dashboard (Saturday operations overview)
- Puntos de Acopio
- Usuarios
- Agenda
- Certificados
- Configuración

**Superadmin:** Inherits admin nav + "Administradores" section.

### Additional Patterns

**Empty states:**
- No upcoming turnos: "Aún no has agendado ningún sábado. Explora la agenda para encontrar tu primer turno."
- No certificates yet: "Completa 6 asistencias en 6 meses para obtener tu primer certificado de exención."
- No notifications: "No hay novedades. Te avisaremos cuando tengas algo nuevo."
- No available slots: "Esta semana no hay cupos disponibles. Prueba la próxima semana."

**Loading states:**
- Skeleton cards for agenda grid (not spinner)
- Pulse animation on progress bar
- Full-screen loading only during OTP send/verify

## Responsive Design & Accessibility

### Responsive Strategy

**Mobile-first** — all design starts at 375px viewport and scales up. 3 tiers:

| Tier | Target | Layout | Key Behaviors |
|---|---|---|---|
| **Mobile** | 375px–767px | Single column, bottom tab nav | Full-width cards, stacked filters, one tap actions |
| **Tablet** | 768px–1023px | Two-column | Agenda splits (calendar + detail), filter bar horizontal |
| **Desktop** | 1024px+ | Sidebar + main area | Admin panel layout, multi-column grids, keyboard shortcuts |

**Content adaptation:**
- Saturday Dashboard: hero card fills width on mobile, two-column (maps + info) on desktop
- Agenda: stacked Saturday cards on mobile, 4-column grid on desktop
- Filters: horizontally scrollable chips on mobile, persistent sidebar on desktop

### Breakpoint Strategy

MUI default breakpoints, mobile-first via `theme.breakpoints.up()`:
- `xs`: 0px (mobile portrait)
- `sm`: 600px (mobile landscape / small tablet)
- `md`: 900px (tablet)
- `lg`: 1200px (desktop)
- `xl`: 1536px (large desktop)

Admin panel: separate breakpoint at `lg` where sidebar becomes persistent (not collapsible drawer).

### Accessibility Strategy

**Target:** WCAG 2.1 Level AA.

**Color contrast:**
- Normal text (4.5:1 minimum) — green `#41703f` on white passes at 5.2:1
- Large text (3:1 minimum) — green, gold on white all pass
- Yellow `#ffe10f` used only as background with dark text overlay (never as text on white)
- All interactive states maintain contrast

**Touch targets:**
- 48x48px minimum (WCAG 2.5.5)
- 8px minimum gap between touch targets

**Keyboard & screen reader:**
- MUI components inherit keyboard navigation natively
- Custom components (calendar grid, progress bar, notification panel) get explicit `role`, `aria-label`, `aria-live` regions
- Focus order matches visual order
- `aria-describedby` on form errors (MUI TextField default)

**Reduced motion:**
- `prefers-reduced-motion` respected via MUI theme
- Animations (celebration, progress updates) degrade to static states
- No auto-playing or parallax

### Testing Strategy

**Responsive:**
- Real device testing: iPhone SE (375px), iPhone 14 (390px), Android medium (412px), iPad (768px), desktop 1280px
- Browser matrix: Chrome, Firefox, Safari, Edge — latest 2 versions
- Network: simulate 3G for OTP flows, offline for graceful degradation

**Accessibility:**
- Automated: axe-core (via MUI's built-in + CI integration)
- Screen reader: VoiceOver (iOS + macOS), TalkBack (Android), NVDA (Windows)
- Keyboard-only: full journey walkthrough without mouse
- Color blindness: simulate protanopia/deuteranopia for key screens (dashboard, agenda slots, QR certificates)

**Implementation guidelines:**
- Use MUI's `sx` prop for responsive overrides (not CSS `@media` scattered)
- Custom components use `useMediaQuery` from MUI for breakpoint logic
- Relative units (`rem`, `%`) for all sizes
- Semantic HTML: `<nav>` for navigation, `<main>` for content, `<section>` for cards
