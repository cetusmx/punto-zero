---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-punto-zero-2026-05-24/prd.md"
  - "_bmad-output/planning-artifacts/prds/prd-punto-zero-2026-05-24/addendum.md"
  - "_bmad-output/planning-artifacts/prds/prd-punto-zero-2026-05-24/.decision-log.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-06-03'
project_name: 'punto-zero'
user_name: 'Oscar'
date: '2026-06-03'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
34 FRs across 11 features: Authentication (SMS OTP via Twilio, phone as primary identifier), User Profile (form, status management), Agenda & Scheduling (calendar, unique constraint, cancellation rules), Collection Points CRUD (admin, inactivation cascades), Attendance (node-cron, faltas, replacements), Exemption Program (auto 6/6 tracking, QR generation), User Management (admin list/block, superadmin roles), Admin Cancellation (individual/mass), Configuration (WhatsApp links), Metrics Dashboard, Notifications (SMS Twilio + in-app badge).

**Non-Functional Requirements:**
- Timezone: `America/Mexico_City` — single zone, no DST complexity
- Deadline Friday 23:59 — time-sensitive logic
- Unique constraint `(point_id, saturday_date)` — race condition handling
- OTP: 3 attempts, 60s resend, 15min IP-level cooldown
- QR generated client-side (qrcode.react), non-downloadable
- node-cron must be mockable for testing
- SMS delivery <30 seconds
- Password: min 8 chars, 1 special character

**Scale & Complexity:**
- Primary domain: Full-stack web (React frontend + backend API + DB)
- Complexity level: Low-medium — no real-time, no multi-tenancy, no payments, no multi-language
- Estimated architectural components: 6-8 (Frontend SPA, Backend API, DB, SMS service, Scheduler, Admin panel)

### Technical Constraints & Dependencies

**Decided stack (non-negotiable):**
- VPS Linux + Docker
- React.js (frontend)
- Twilio (SMS provider)
- node-cron (scheduler)

**Pending architecture decisions:**
- Database engine/version
- Backend framework/language
- Web server (Nginx/Apache)
- ORM
- Logging strategy
- Backup strategy
- CI/CD pipeline
- Secrets management

### Cross-Cutting Concerns Identified

1. **Auth & authorization** — 3 roles (volunteer, admin, superadmin)
2. **State machines** — Status (Alta/Pausa/Baja), Access (Habilitado/Bloqueado), Point (Activo/Inactivo), Scheduling (pendiente/asistió/falta)
3. **Timezone** — All temporal logic in `America/Mexico_City`
4. **Race conditions** — Single slot per point/date
5. **Scheduled jobs** — 1 weekly cron (mockable)
6. **SMS delivery** — External dependency (Twilio), latency <30s
7. **Notifications** — Dual: urgent SMS + badge (DB pull, no push)

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (React SPA frontend + Express REST API backend).

### Stack Decisions from Step 3

| Aspect | Decision |
|--------|----------|
| Language | JavaScript (frontend + backend) |
| Frontend | Vite 7.x + React 19.x + MUI 6.x |
| Backend | Express 5.x + JavaScript |
| ORM | Prisma 6.x + MySQL 8 |
| Containerization | Docker + docker-compose |
| Monorepo style | Root package.json + `concurrently` for dev scripts |

### Selected Approach: Custom Project Structure

No single CLI starter matched the exact stack (React + Express + Prisma + MySQL). Using standard tooling for each layer ensures maximum flexibility and avoids dependency on unmaintained starters.

**Frontend initialization:**
```bash
npm create vite@latest client -- --template react
```

**Backend initialization:**
```bash
mkdir server && cd server
npm init -y
npm install express prisma @prisma/client cors dotenv
npm install -D nodemon
```

**Prisma initialization:**
```bash
npx prisma init --datasource-provider mysql
```

**Docker setup:**
```bash
docker-compose.yml with MySQL 8 + app services
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- JavaScript (ES2020+) with Node.js 20+ LTS
- ES modules or CommonJS (to be decided in implementation)

**Styling Solution:**
- MUI 6.x (from UX Design Spec)
- System font stack (no custom fonts for MVP)

**Build Tooling:**
- Frontend: Vite 7.x (fast dev server, optimized production builds)
- Backend: nodemon for development, plain Node.js for production

**Testing Framework:**
- To be decided in implementation (Vitest for frontend, Jest for backend recommended)

**Code Organization:**
- `/client` — React SPA (Vite)
- `/server` — Express API + Prisma
- Root `package.json` with `concurrently` for unified dev command

**Development Experience:**
- Single command: `npm run dev` starts both client + server
- Vite hot module replacement for frontend
- nodemon auto-restart for backend

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Database: MySQL 8 with Prisma ORM
- Validation: express-validator (middleware-style)
- Migrations: Prisma migrate (declarative schema → SQL migrations)
- Authentication: JWT stored in localStorage, bcryptjs for password hashing
- Web server: Nginx reverse proxy + static files on VPS Linux

**Important Decisions (Shape Architecture):**
- API docs: Swagger/OpenAPI
- State management: React Context (no Redux/Zustand needed)
- HTTP client: Axios with JWT interceptor
- Routing: React Router v7
- Logging: Morgan (HTTP) + Winston (app logging)
- Security middleware: helmet + cors + express-rate-limit

**Deferred Decisions (Post-MVP):**
- Advanced caching strategy (not needed for current scale)
- Secrets management service (env vars + .env.example sufficient for MVP)
- Automated backups script (mysqldump cron in Docker)

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | MySQL 8 | Relacional, maduro, perfecto para datos estructurados de agenda |
| ORM | Prisma 6.x | Type-safe queries, migrations declarativas, integración Express |
| Validation | express-validator | Middleware nativo Express, liviano, suficiente para el proyecto |
| Migrations | Prisma migrate | Declarativo,版本控制, integrado con Prisma |

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth mechanism | JWT (localStorage) | Simple con React, sin cookies HttpOnly para este nivel de seguridad |
| Login identifier | Unified field (phone or email) | Detección automática backend: `@` → email, else → phone |
| Password hashing | bcryptjs | Estándar industria, maduro, bien soportado |
| Rate limiting | express-rate-limit | 15min cooldown en auth/IP-level (OTP endpoints) |
| Security headers | helmet | XSS, clickjacking, MIME sniffing protection |
| CORS | cors configurado | Origen explícito desde CLIENT_URL |
| Email uniqueness | Unique constraint in Prisma | Email es ahora identificador de login |

### API & Communication

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API style | REST | Natural con Express, suficiente sin GraphQL |
| API docs | Swagger/OpenAPI | Consistencia para implementación con agentes de IA |
| Error handling | Middleware centralizado | Patrón Express estándar, formato uniforme |
| API versioning | `/api/v1/` prefix | Espacio para evolución futura |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | React Context | Suficiente: auth + notificaciones, sin WebSockets |
| HTTP client | Axios | Interceptors para JWT, más expresivo que fetch |
| Routing | React Router v7 | Estándar React, lazy loading |
| Design system | MUI 6.x (desde UX spec) | Mobile-first, WCAG AA, tema personalizable |
| Custom components | 3: calendar-grid, progress bar, badge center | Solo donde MUI no cubre |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Web server | Nginx | Reverse proxy + static files, estándar con VPS Linux |
| CI/CD | GitHub Actions | Gratuito, integración GitHub, matriz de pruebas |
| Logging | Morgan (HTTP) + Winston (app) | Liviano, estructura JSON, rotación de logs |
| Backups | mysqldump + Docker cron job | Simple, efectivo para MySQL en VPS |
| Secrets | .env + .env.example | Suficiente para MVP en VPS single-tenant |

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database Naming:**
- Tables: `snake_case` plural (`users`, `collection_points`, `attendance_logs`)
- Columns: `snake_case` (`user_id`, `saturday_date`, `created_at`)
- Foreign keys: `singular_table_id` (`point_id`, `volunteer_id`)
- Primary keys: `id` (auto-increment integer)
- Join tables: `table1_table2` (`volunteers_collection_points`)

**API Naming:**
- Endpoints: plural RESTful (`/api/v1/users`, `/api/v1/collection-points`)
- Route params: `:id` (`/api/v1/users/:id`)
- Query params: `snake_case` (`?saturday_date=2026-06-06`)
- HTTP methods: GET/POST/PUT/PATCH/DELETE estándar

**Code Naming:**
- Components: PascalCase (`UserCard.jsx`, `SaturdayDashboard.jsx`)
- Utilities: kebab-case (`format-date.js`, `validate-phone.js`)
- Functions: camelCase (`getUserById`, `formatSaturdayDate`)
- Variables: camelCase (`userName`, `collectionPointId`)
- Files (non-component): kebab-case (`prisma-client.js`, `auth-middleware.js`)

### Structure Patterns

**Project Organization:**
- **Backend:** Separated layers: routes → controllers → services
  - `/server/routes/` — route definitions only
  - `/server/controllers/` — request handling, response formatting
  - `/server/services/` — business logic
  - `/server/middleware/` — auth, validation, error handling
  - `/server/prisma/` — Prisma schema + migrations
  - `/server/config/` — environment config
- **Tests:** Separate folder (`/server/__tests__/`, `/client/src/__tests__/`)
- **Frontend:** By type (components, pages, services, hooks)

### Format Patterns

**API Response Wrapper:**
```json
{
  "data": {},
  "message": "Success",
  "error": null,
  "statusCode": 200
}
```

**Error Response:**
```json
{
  "data": null,
  "message": "Validation error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "field": "phone", "message": "Invalid format" }]
  },
  "statusCode": 400
}
```

**Date Format:** ISO 8601 everywhere — API, DB, UI formatting
- API: `"2026-06-06T14:00:00-06:00"`
- DB: DATETIME with timezone
- UI: formatted client-side with locale

**JSON Fields:** `camelCase` in API responses (JS convention)

### Process Patterns

**Error Handling:**
- Centralized error middleware in Express
- Custom error classes: `AppError`, `ValidationError`, `AuthError`
- User-facing messages in Spanish
- Logged errors include stack trace (dev only)

**Loading States:**
- Skeleton cards for agendas (not spinners)
- Full-screen loader only for OTP send/verify
- Pulse animation on progress bar

**Auth Flow:**
- JWT token in Authorization header (Bearer)
- Axios interceptor attaches token automatically
- 401 response → redirect to login
- Token validated on every protected route via middleware

## Project Structure & Boundaries

### Complete Project Directory Structure

```
punto-zero/
├── client/                          # React + Vite frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/              # Navbar, BottomNav, Sidebar
│   │   │   ├── agenda/              # CalendarGrid (custom)
│   │   │   ├── profile/             # ProfileForm, StatusBadge
│   │   │   ├── auth/                # LoginForm, OTPInput
│   │   │   ├── certificates/        # QRDisplay, ProgressBar (custom)
│   │   │   ├── notifications/       # BadgeCenter (custom), BellIcon
│   │   │   ├── admin/               # AttendanceTable, UserList
│   │   │   └── shared/              # LoadingSkeleton, EmptyState
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Agenda.jsx
│   │   │   ├── SaturdayDashboard.jsx
│   │   │   ├── MisTurnos.jsx
│   │   │   ├── Certificados.jsx
│   │   │   ├── Perfil.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Puntos.jsx
│   │   │       ├── Usuarios.jsx
│   │   │       ├── AgendaAdmin.jsx
│   │   │       ├── CertificadosAdmin.jsx
│   │   │       └── Configuracion.jsx
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance + interceptors
│   │   │   ├── auth.js
│   │   │   ├── agenda.js
│   │   │   ├── profile.js
│   │   │   ├── certificates.js
│   │   │   └── admin.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAgenda.js
│   │   │   ├── useAuth.js
│   │   │   └── useNotifications.js
│   │   ├── utils/
│   │   │   ├── format-date.js
│   │   │   ├── validate-phone.js
│   │   │   └── constants.js
│   │   ├── theme.js                 # MUI theme (brand colors)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── __tests__/
│   │   ├── components/
│   │   └── pages/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Express + Prisma backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── agenda.js
│   │   │   ├── points.js
│   │   │   ├── certificates.js
│   │   │   ├── attendance.js
│   │   │   ├── notifications.js
│   │   │   ├── admin.js
│   │   │   ├── metrics.js
│   │   │   └── config.js
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validate.js
│   │   │   └── rateLimiter.js
│   │   ├── config/
│   │   │   ├── index.js
│   │   │   ├── database.js          # Prisma client singleton
│   │   │   ├── twilio.js
│   │   │   └── cron.js              # node-cron setup
│   │   ├── utils/
│   │   │   ├── logger.js            # Winston
│   │   │   ├── sms.js
│   │   │   └── errors.js            # Custom error classes
│   │   └── app.js                   # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── __tests__/
│   │   ├── integration/
│   │   └── unit/
│   ├── index.js                     # Entry point
│   └── package.json
│
├── docker/
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── nginx/
│       └── default.conf
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json                     # Root: concurrently scripts
└── README.md
```

### Requirements to Structure Mapping

**Auth & Registration (FR-1–4):**
- Routes: `server/src/routes/auth.js`
- Controllers: `server/src/controllers/auth.js`
- Components: `client/src/components/auth/`
- Pages: `Login.jsx`, `Register.jsx`

**Profile (FR-5–7):**
- Routes: `server/src/routes/users.js`
- Components: `client/src/components/profile/`
- Page: `Perfil.jsx`

**Agenda & Scheduling (FR-8–11):**
- Routes: `server/src/routes/agenda.js`
- Components: `client/src/components/agenda/` (CalendarGrid custom)
- Pages: `Agenda.jsx`, `MisTurnos.jsx`

**Collection Points (FR-12–14):**
- Routes: `server/src/routes/points.js`
- Components: `client/src/components/admin/`
- Page (admin): `Puntos.jsx`

**Attendance & Replacements (FR-15–18):**
- Routes: `server/src/routes/attendance.js`
- Scheduler: `server/src/config/cron.js` (node-cron)
- Components: `client/src/components/admin/`

**Exemption Program (FR-19–24):**
- Routes: `server/src/routes/certificates.js`
- Components: `client/src/components/certificates/` (ProgressBar, QRDisplay custom)
- Page: `Certificados.jsx`

**User Management (FR-25–28):**
- Routes: `server/src/routes/admin.js`, `server/src/routes/users.js`
- Page (admin): `Usuarios.jsx`

**Notifications (FR-33–34):**
- Routes: `server/src/routes/notifications.js`
- Components: `client/src/components/notifications/` (BadgeCenter custom)
- SMS: `server/src/utils/sms.js` (Twilio)

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are compatible: React 19 + Vite 7 for frontend, Express 5 + Prisma 6 + MySQL 8 for backend. Docker + Nginx for deployment. Twilio for SMS. node-cron for scheduling. No version conflicts or integration incompatibilities.

**Pattern Consistency:**
Naming conventions (snake_case DB, camelCase JSON, PascalCase components), structure patterns (separated routes/controllers/services layers, tests in `__tests__/`), and communication patterns (RESTful API, JWT auth, Axios interceptors) are fully consistent across all project areas.

**Structure Alignment:**
The project structure directly supports all architectural decisions — each FR category maps to specific routes, controllers, services, and component directories.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
All 34 FRs across 11 features have architectural support:
- Auth (FR-1–4): routes/auth.js, components/auth/, Twilio SMS module
- Profile (FR-5–7): routes/users.js, components/profile/
- Agenda (FR-8–11): routes/agenda.js, CalendarGrid custom component, unique constraint in Prisma
- Points (FR-12–14): routes/points.js, admin components
- Attendance (FR-15–18): routes/attendance.js, cron.js scheduler
- Exemption (FR-19–24): routes/certificates.js, ProgressBar + QRDisplay custom components
- User Management (FR-25–28): routes/admin.js + routes/users.js
- Admin Cancellation (FR-29): routes/agenda.js
- Config (FR-30): routes/config.js
- Metrics (FR-32): routes/metrics.js
- Notifications (FR-33–34): routes/notifications.js, sms.js (Twilio), BadgeCenter custom component

**Non-Functional Requirements:**
- Timezone CDMX: server config centralizes timezone logic
- Deadline Friday 23:59: validated in route/controller layer
- Race conditions: Prisma unique constraint `(point_id, saturday_date)`
- OTP rate limiting: express-rate-limit middleware
- node-cron mockable: wrapped in config/cron.js for DI
- QR client-side: qrcode.react in components/certificates/
- WCAG AA: MUI 6.x built-in compliance

### Implementation Readiness Validation ✅

**Decision Completeness:**
All critical decisions documented with specific technology choices, versions, and rationale. Remaining implementation details (component internals, specific validation rules) deferred to implementation phase.

**Structure Completeness:**
Complete directory tree defined with all files and directories. Every FR maps to specific locations in both client and server.

**Pattern Completeness:**
Naming, structure, format, and process patterns defined. ES Modules confirmed as module system.

### Gap Analysis Results

**Minor Gap — Deferred to Implementation:**
- Specific Prisma schema models and relations (defined during implementation)
- Docker multistage build details (Dockerfile contents)
- GitHub Actions workflow YAML specifics
- Swagger setup configuration

**Decisions Addressed:**
- ES Modules (`"type": "module"`) confirmed for server-side code

### Architecture Completeness Checklist

**Requirements Analysis:**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions:**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns:**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure:**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Well-established, proven technology stack (React + Express + Prisma + MySQL)
- Clear separation of concerns with layered backend architecture
- Mobile-first responsive design with MUI
- All 34 FRs mapped to specific implementation targets
- Comprehensive naming and consistency patterns for AI agent collaboration

**Areas for Future Enhancement:**
- Advanced caching strategy (if scale increases)
- Automated backup scheduling (post-MVP)
- Monitoring/observability stack (post-MVP)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
Project initialization:
1. Set up root `package.json` with `concurrently`
2. Initialize frontend with `npm create vite@latest client -- --template react`
3. Initialize server with Express + Prisma + MySQL
4. Configure Docker + docker-compose with MySQL 8
5. Run `npx prisma init --datasource-provider mysql`
6. Push initial Prisma schema and verify connection
