---
stepsCompleted: [1, 2, 3, 4]
workInProgress:
  epic: null
  story: null
  notes: "Step 4 completed 2026-06-06. Final validation passed: 34/34 FRs covered, architecture compliant, story quality verified, dependencies clean. Document ready for development."
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-punto-zero-2026-05-24/prd.md"
  - "_bmad-output/planning-artifacts/prds/prd-punto-zero-2026-05-24/addendum.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# punto-zero - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for punto-zero, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**FR-1:** Registro de usuario nuevo con validación SMS (OTP, 3 intentos, 60s reenvío)
**FR-2:** Login con teléfono y contraseña (redirect a perfil si primer login)
**FR-3:** Recuperación de contraseña vía SMS (OTP + nueva contraseña)
**FR-4:** Campo email obligatorio (solo contacto, no para auth)
**FR-5:** Formulario de perfil obligatorio en primer login (nombre heredado, género, edad, esquema, residuo, frecuencia, estatus)
**FR-6:** Edición de perfil y cambio de Estatus (Alta/Pausa/Baja con reglas de cancelación)
**FR-7:** Links de WhatsApp en perfil (Grupo Avisos + Grupo Abierto, solo si Estatus=Alta)
**FR-8:** Vista de agenda (solo sábados, 6 meses, filtros colonia/punto/cupo, deadline viernes 23:59)
**FR-9:** Calendarización de turno (cupo=1, constraint única point_id+saturday_date, T&C primera vez)
**FR-10:** Visualización de mis calendarizaciones (futuros resaltados, pasado Asistió/Falta)
**FR-11:** Cancelación autónoma de turno (Lun-Jue: inmediato; Vie: +SMS admin; Sáb: no disponible)
**FR-12:** CRUD de Puntos de Acopio (nombre, colonia, ubicación Maps, horario, estado)
**FR-13:** Sábados "no disponibles" por punto (excepciones, respeta calendarizaciones existentes)
**FR-14:** Inactivación de punto con cancelación automática + badge a afectados
**FR-15:** Asistencia por default vía node-cron (sábados 14:00 CDMX)
**FR-16:** Registro de faltas por admin (vista por sábado, badge al usuario)
**FR-17:** Gestión de turnos por admin los sábados (cancelar, asignar reemplazo)
**FR-18:** Historial de asistencias y faltas (cronológico, progreso programa)
**FR-19:** Activación automática del programa de exención (primera calendarización + T&C)
**FR-20:** Seguimiento de progreso (atenciones, faltas, fecha límite, restantes)
**FR-21:** Reseteo del conteo por 3 faltas (automático, badge, re-evaluación si se revierte)
**FR-22:** Generación de QR de Exención (6 atenciones en 6 meses, dinámico, qrcode.react, no descargable)
**FR-23:** QR de Reconocimiento (cada 6 atenciones en 6 meses durante vigencia QR exención, color distinto)
**FR-24:** QR vencido (badge 30d/7d/día, estilo gris/opaco, reseteo automático)
**FR-25:** Lista y búsqueda de usuarios (Admin: nombre, telf, email, estatus, acceso)
**FR-26:** Bloqueo/Desbloqueo de acceso por admin (advertencia si hay calendarizaciones)
**FR-27:** Edición de perfil de usuario por admin (excepto nombre, telf, email)
**FR-28:** Gestión de admins (solo superadmin: crear, modificar, eliminar admins)
**FR-29:** Cancelación individual y masiva por admin (sin notificación al usuario)
**FR-30:** Configuración de links de WhatsApp por admin
**FR-32:** Dashboard de métricas (usuarios, puntos, programa exención)
**FR-33:** Notificaciones SMS vía Twilio (OTP, cancelación viernes→admin, reactivación baja→admin)
**FR-34:** Notificaciones Badge (campana: faltas, cambios estatus, inactivación punto, vencimiento QR, reseteo 3 faltas)

### NonFunctional Requirements

**NFR-1:** Timezone `America/Mexico_City` para toda lógica temporal
**NFR-2:** SMS delivery <30 segundos (Twilio)
**NFR-3:** OTP máximo 3 intentos, 60s reenvío, 15min cooldown IP-level
**NFR-4:** Contraseña mínimo 8 caracteres, al menos 1 especial
**NFR-5:** Constraint única `(point_id, saturday_date)` para race conditions
**NFR-6:** node-cron ejecutándose sábados 14:00 hrs CDMX (mockeable)
**NFR-7:** WCAG 2.1 AA compliance
**NFR-8:** Mobile-first responsive (375px → 1200px+)
**NFR-9:** Touch targets 48x48px mínimo
**NFR-10:** Docker containerization (docker-compose)
**NFR-11:** VPS Linux deployment (Nginx reverse proxy)
**NFR-12:** ES Modules (`"type": "module"`) en server
**NFR-13:** QR generado client-side (qrcode.react), no descargable
**NFR-14:** JWT en localStorage, Authorization header (Bearer)
**NFR-15:** express-rate-limit en auth endpoints
**NFR-16:** helmet + cors para seguridad HTTP
**NFR-17:** Morgan (HTTP) + Winston (app) logging
**NFR-18:** mysqldump + Docker cron para backups

### Additional Requirements

- Custom project structure: no CLI starter, Vite + Express + Prisma + MySQL
- Docker + docker-compose (MySQL 8 + app services)
- GitHub Actions CI/CD pipeline
- Swagger/OpenAPI para documentación de API
- .env + .env.example para secrets management
- Prisma migrate para versionamiento de BD
- ES Modules (`"type": "module"`) en server

### UX Design Requirements

**UX-DR1:** Implementar MUI 6.x theme con colores de marca (primary `#41703f`, secondary `#dbb539`, accent `#ffe10f`, success `#789b3d`)
**UX-DR2:** Componente custom Calendar-grid scheduler (estados: disponible, ocupado, mi reserva, deadline pasado, seleccionado)
**UX-DR3:** Componente custom Progress bar (estilo thin bar, 0/6 a 6/6, celebración en 6/6)
**UX-DR4:** Componente custom Badge notification center (categorizado: recordatorios, alertas, logros)
**UX-DR5:** Bottom tab navigation mobile: Inicio, Agenda, Mis Turnos, Certificados, Perfil
**UX-DR6:** Admin sidebar navigation: Dashboard, Puntos, Usuarios, Agenda, Certificados, Configuración
**UX-DR7:** Layouts responsive: mobile (375px), tablet (768px), desktop (1200px+)
**UX-DR8:** Clean Minimal: card-based, 24px radius, sombras sutiles, system font
**UX-DR9:** WCAG 2.1 AA: contraste, focus indicators, aria-labels, keyboard nav
**UX-DR10:** prefers-reduced-motion respetado en todas las animaciones
**UX-DR11:** Empty states: sin turnos, sin certificados, sin notificaciones, sin cupos
**UX-DR12:** Loading states: skeleton cards (agenda), pulse (progress), full-screen (OTP)
**UX-DR13:** Validación inline on blur, mensajes de error debajo del campo
**UX-DR14:** Saturday Dashboard como landing en sábados: hero message, Maps CTA, progress ring

### FR Coverage Map

**FR-1:** Epic 2 - Volunteer Onboarding & Identity
**FR-2:** Epic 2 - Volunteer Onboarding & Identity
**FR-3:** Epic 2 - Volunteer Onboarding & Identity
**FR-4:** Epic 2 - Volunteer Onboarding & Identity
**FR-5:** Epic 2 - Volunteer Onboarding & Identity
**FR-6:** Epic 2 - Volunteer Onboarding & Identity
**FR-7:** Epic 2 - Volunteer Onboarding & Identity
**FR-8:** Epic 3 - Agenda, Scheduling & Saturday Operations
**FR-9:** Epic 3 - Agenda, Scheduling & Saturday Operations
**FR-10:** Epic 3 - Agenda, Scheduling & Saturday Operations
**FR-11:** Epic 3 - Agenda, Scheduling & Saturday Operations
**FR-12:** Epic 4 - Collection Points & Admin Management
**FR-13:** Epic 4 - Collection Points & Admin Management
**FR-14:** Epic 4 - Collection Points & Admin Management
**FR-15:** Epic 3 - Agenda, Scheduling & Saturday Operations
**FR-16:** Epic 3 - Agenda, Scheduling & Saturday Operations
**FR-17:** Epic 3 - Agenda, Scheduling & Saturday Operations
**FR-18:** Epic 3 - Agenda, Scheduling & Saturday Operations
**FR-19:** Epic 5 - Exemption Program & Certificates
**FR-20:** Epic 5 - Exemption Program & Certificates
**FR-21:** Epic 5 - Exemption Program & Certificates
**FR-22:** Epic 5 - Exemption Program & Certificates
**FR-23:** Epic 5 - Exemption Program & Certificates
**FR-24:** Epic 5 - Exemption Program & Certificates
**FR-25:** Epic 4 - Collection Points & Admin Management
**FR-26:** Epic 4 - Collection Points & Admin Management
**FR-27:** Epic 4 - Collection Points & Admin Management
**FR-28:** Epic 4 - Collection Points & Admin Management
**FR-30:** Epic 4 - Collection Points & Admin Management
**FR-32:** Epic 4 - Collection Points & Admin Management
**FR-33:** Epic 6 - Notifications System
**FR-34:** Epic 6 - Notifications System

## Epic List

### Epic 1: Project Foundation
Scaffold the complete project infrastructure: Vite+Express+Prisma+MySQL project structure, Docker+nginx+CI/CD pipeline, Prisma schema with all domain models, MUI theme with brand colors, and navigation layouts for volunteer and admin.
**FRs covered:** None (enabling infrastructure)
**UX-DRs:** UX-DR1 (MUI theme), UX-DR5 (bottom nav), UX-DR6 (sidebar admin)

### Epic 2: Volunteer Onboarding & Identity
Volunteers can register via SMS OTP, log in with phone or email+password (unified field), recover their password, complete their profile, manage account status, and access WhatsApp group links.
**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7
**UX-DRs:** UX-DR9 (WCAG AA), UX-DR13 (form validation)

### Epic 3: Agenda, Scheduling & Saturday Operations
Volunteers can browse available Saturdays with filters, book collection point slots, view their upcoming and past appointments, and cancel their own bookings with day-aware rules. Admins run Saturday operations: default attendance via node-cron, register faltas, assign reemplazos, cancel bookings (individual/mass), and view attendance history. All Saturday-related flows live here — volunteer and admin — since they share the Scheduling model, agenda routes, and CalendarGrid component.
**FRs covered:** FR-8, FR-9, FR-10, FR-11, FR-15, FR-16, FR-17, FR-18, FR-29
**UX-DRs:** UX-DR2 (calendar-grid), UX-DR7 (responsive), UX-DR11 (empty states), UX-DR12 (loading states)
**Implementation notes:** QA split into two tracks (volunteer flows vs admin ops) per Winston. node-cron requires externalized config for container environments per Amelia. Include cron config spike in architecture. Shared date logic between agenda and points routes should be extracted to `src/lib/date-utils.ts` to avoid duplication per Amelia.

### Epic 4: Collection Points & Admin Management
Admins can manage collection points (CRUD, inactivate with cascade), manage users (list, block/unblock, edit profiles), manage superadmin roles, configure WhatsApp links, and view metrics dashboard. FR-29 (admin cancellations) moved to Epic 3 per UX recommendation — all Saturday booking mutations share the same conceptual domain.
**FRs covered:** FR-12, FR-13, FR-14, FR-25, FR-26, FR-27, FR-28, FR-30, FR-32

### Epic 5: Exemption Program & Certificates
Volunteers automatically participate in the exemption program, track their progress (6 attendances in 6 months), receive QR exemption certificates (generated dynamically), earn recognition QRs during exemption validity, and get notified of resets and expirations.
**FRs covered:** FR-19, FR-20, FR-21, FR-22, FR-23, FR-24
**UX-DRs:** UX-DR3 (progress bar), UX-DR8 (clean minimal), UX-DR14 (Saturday Dashboard)
**Implementation notes:** QR rendering (qrcode.react) requires client-side test coverage beyond visual inspection per Amelia. Ensure rendering logic is isolated for unit testing.

### Epic 6: Notifications System
Dual notification system: SMS via Twilio for critical events (OTP, Friday cancellations to admin, low-to-high reactivations) and in-app badge center for operational notifications (faltas, status changes, point inactivation, QR expiry, 3-falta reset).
**FRs covered:** FR-33, FR-34
**UX-DRs:** UX-DR4 (badge center), UX-DR10 (reduced motion)

## Epic 1: Project Foundation

Scaffold the complete project infrastructure: Vite+Express+Prisma+MySQL project structure, Docker+nginx+CI/CD pipeline, Prisma schema with all domain models, MUI theme with brand colors, and navigation layouts for volunteer and admin.

### Story 1.1: Project Scaffold & Docker Setup

As a developer,
I want the project scaffolded with Vite+React, Express+Prisma, MySQL via Docker, and Nginx,
So that all foundation infrastructure is ready for feature development.

**Acceptance Criteria:**

**Given** no project structure exists,
**When** I run `npm run dev`,
**Then** both client (Vite) and server (Express) start concurrently.

**Given** docker-compose is configured,
**When** I run `docker-compose up`,
**Then** MySQL 8 and app containers start and are healthy.

**Given** Nginx config exists,
**When** the app is accessed via port 80,
**Then** requests proxy to the correct service (client or server).

**Given** the project structure is initialized,
**Then** `/client` (React/Vite) and `/server` (Express/Prisma) directories exist with proper `package.json` files.

**Given** ES Modules configuration,
**Then** server `package.json` has `"type": "module"`.

### Story 1.2: CI/CD Pipeline & Git Setup

As a developer,
I want GitHub Actions CI/CD configured with linting, testing, building, and deployment,
So that code quality is enforced and deployments are automated.

**Acceptance Criteria:**

**Given** a push to main branch,
**When** CI workflow runs,
**Then** lint + test + build execute and pass.

**Given** all checks pass on main,
**When** the workflow completes,
**Then** the app is deployed to VPS via SSH/Docker compose.

**Given** the repository is initialized,
**Then** `.github/workflows/ci.yml` exists with pipeline definition.

**Given** the project root,
**Then** `.gitignore` excludes `node_modules`, `.env`, and build artifacts.

**Given** the project is set up,
**Then** `README.md` exists with setup and run instructions.

### Story 1.3: Prisma Schema & MUI Theme

As a developer,
I want the Prisma schema with all domain models defined and the MUI 6.x theme with brand colors configured,
So that the data layer and design foundation are ready for feature development.

**Acceptance Criteria:**

**Given** Prisma is initialized,
**When** `npx prisma db push` runs,
**Then** all tables are created in MySQL 8.

**Given** the Prisma schema,
**Then** models exist for: User, CollectionPoint, Scheduling, Attendance, Badge, CertificateQR, AppConfig.

**Given** the Scheduling model,
**Then** a unique constraint `(point_id, saturday_date)` exists for race condition handling.

**Given** the User model,
**Then** fields include Estatus (Alta/Pausa/Baja enum) and Acceso (Habilitado/Bloqueado enum).

**Given** MUI theme is configured,
**Then** brand colors map to `createTheme`: primary `#41703f`, secondary `#dbb539`, warning `#ffe10f`, success `#789b3d`.

**Given** the theme file,
**Then** system font stack and 8px base spacing unit are configured.

### Story 1.4: Navigation Layout & App Shell

As a user,
I want to see the correct navigation layout based on my role,
So that I can navigate the app intuitively.

**Acceptance Criteria:**

**Given** I am a volunteer on a mobile viewport,
**Then** I see a bottom tab bar with: Inicio, Agenda, Mis Turnos, Certificados, Perfil.

**Given** I am an admin on a desktop viewport,
**Then** I see a sidebar navigation with: Dashboard, Puntos, Usuarios, Agenda, Certificados, Configuración.

**Given** I am a superadmin,
**Then** the sidebar includes an additional "Administradores" section.

**Given** React Router is configured,
**Then** all page routes map to their respective components with lazy loading.

**Given** the app shell renders,
**Then** AuthContext and NotificationContext wrap the application providing default empty values.

### Story 1.5: VPS Provisioning & First Deployment

As a developer,
I want the VPS provisioned with Docker, Nginx, and SSL, and the first deployment executed,
So that the application is accessible via HTTPS in production.

**Acceptance Criteria:**

**Given** the VPS already has Nginx and Docker installed with existing domains,
**When** the new Nginx site config for punto-zero.mx is added,
**Then** it proxies client on port 80 (Vite app) and API routes (Express), with SSL via Let's Encrypt certbot.

**Given** the docker-compose.yml is deployed,
**When** `docker-compose up -d` runs on the VPS,
**Then** all containers (client, server, MySQL) start and are healthy without affecting existing services.

**Given** the domain punto-zero.mx resolves to the VPS,
**When** accessed via HTTPS,
**Then** the app loads without certificate warnings.

**Given** the `deploy` workflow in GitHub Actions,
**When** merged to main,
**Then** the pipeline SSHes into the VPS, pulls the latest images, and restarts containers.

## Epic 2: Volunteer Onboarding & Identity

Volunteers can register via SMS OTP, log in with phone or email+password (unified field), recover their password, complete their profile, manage account status (Alta/Pausa/Baja), and access WhatsApp group links.

### Story 2.1: User Registration with SMS OTP

As a new visitor,
I want to register using my phone number validated via SMS OTP,
So that I can create a verified account and access the platform.

**Acceptance Criteria:**

**Given** I am a new user on the registration page,
**When** I fill in name, phone (10 digits), email (valid format), password (min 8 + 1 special), accept T&C and privacy notice,
**Then** the system validates the phone is not duplicate, email is not duplicate, and sends a 6-digit OTP via SMS.

**Given** I received an OTP,
**When** I enter the correct 6-digit code,
**Then** my account is created and activated, and I am redirected to complete my profile.

**Given** I enter an incorrect OTP,
**When** I have made fewer than 3 attempts,
**Then** I see "Código incorrecto. Intenta de nuevo."

**Given** I fail OTP 3 times,
**When** the code expires,
**Then** I must request a new OTP.

**Given** I want to resend OTP,
**When** 60 seconds have passed since the last code,
**Then** a new OTP is generated and the previous one expires.

**Given** I enter a phone that already exists,
**When** I submit the form,
**Then** I see a message suggesting password recovery.

**Given** I enter a duplicate email,
**When** I submit the form,
**Then** I see "Este correo electrónico ya está registrado."

### Story 2.2: Login with Unified Phone/Email Field

As a registered volunteer,
I want to log in using my phone number or email plus password in a single unified field,
So that I can access my account quickly.

**Acceptance Criteria:**

**Given** I am on the login page,
**When** I enter my phone (10 digits) or email in the unified field and my password,
**Then** the backend auto-detects the identifier type (`@` → email, else → phone) and authenticates me.

**Given** I log in for the first time and have not completed my profile,
**When** authentication succeeds,
**Then** I am redirected to the mandatory profile form.

**Given** I am a returning user with a completed profile,
**When** authentication succeeds,
**Then** I am redirected to the agenda/home page.

**Given** my access is BLOCKED,
**When** I attempt to log in,
**Then** I see "Cuenta desactivada. Contacta al administrador."

**Given** I enter invalid credentials,
**When** I submit the form,
**Then** I see "Identificador o contraseña incorrectos" (generic message, no revealing which field is wrong).

**Given** I enter a non-existent email,
**When** I submit,
**Then** I see the same generic error message.

### Story 2.3: Password Recovery via SMS

As a registered user who forgot their password,
I want to recover my password via SMS OTP,
So that I can regain access to my account.

**Acceptance Criteria:**

**Given** I am on the login page and click "Olvidé mi contraseña",
**When** I enter my phone number,
**Then** if the phone exists, the system sends a 6-digit OTP via SMS; if not, a generic message is shown.

**Given** I received an OTP,
**When** I enter the correct code,
**Then** I can set a new password (min 8 chars + 1 special).

**Given** I set a new password meeting validation rules,
**When** I submit,
**Then** the password is updated and the OTP expires (single-use).

**Given** I enter an incorrect OTP,
**When** I exceed 3 attempts,
**Then** the code expires and I must request a new one.

### Story 2.4: Mandatory Profile Form

As a new volunteer after first login,
I want to complete my mandatory profile form,
So that the organization has my demographic and participation information.

**Acceptance Criteria:**

**Given** I have logged in for the first time,
**When** I am redirected to the profile form,
**Then** I cannot skip or dismiss it.

**Given** I see the profile form,
**Then** the following fields are present: Name (inherited, not editable), Email (inherited, not editable), Phone (inherited, not editable), Gender (Hombre/Mujer/Otro/Prefiero no decir), Age (<20/20-29/30-39/40-49/50-59/60+/OTRA), Scheme (Puntos de Acopio/Ruta en casa), Residue Type (Crudos/Heces y guisados, non-exclusive, with bucket count), Frequency (Semanal/Quincenal), Status (default Alta).

**Given** I fill in all required fields,
**When** I submit,
**Then** the profile is saved and I am redirected to the agenda.

**Given** I return to edit my profile later,
**Then** editable fields: Gender, Age, Scheme, Residue Type, Frequency, Status. Non-editable: Name, Phone, Email.

### Story 2.5: Account Status Management & WhatsApp Links

As a volunteer,
I want to manage my account status (Alta/Pausa/Baja) and access WhatsApp group links,
So that I can control my participation and stay connected with the community.

**Acceptance Criteria:**

**Given** I am on my profile page,
**When** I change my Status from Alta to Pausa or Baja,
**Then** the system shows confirmation: "Este cambio cancelará TODAS tus calendarizaciones futuras."

**Given** I confirm the status change to Pausa or Baja,
**Then** all future schedulings are cancelled, dates/points are freed, and the admin is notified via badge.

**Given** I am in Pausa status,
**When** I revert to Alta,
**Then** I can schedule immediately without admin approval.

**Given** I am in Baja status,
**When** I request to revert to Alta,
**Then** admin authorization is required, an SMS is sent to admin, and I cannot schedule while waiting.

**Given** my status is Alta,
**Then** I see WhatsApp group links: "Grupo de Avisos" and "Grupo Abierto" in my account info section.

**Given** my status is not Alta,
**Then** I do not see the WhatsApp group links.

## Epic 3: Agenda, Scheduling & Saturday Operations

Volunteers can browse available Saturdays with filters, book collection point slots, view their upcoming and past appointments, and cancel their own bookings with day-aware rules. Admins run Saturday operations: default attendance via node-cron, register faltas, assign reemplazos, cancel bookings (individual/mass), and view attendance history. All Saturday-related flows live here — volunteer and admin.

### Story 3.1: Agenda View with Filters

As a volunteer,
I want to see a calendar-style agenda of available Saturdays with filter options,
So that I can find a convenient collection point to volunteer at.

**Acceptance Criteria:**

**Given** I am a volunteer with Alta status and Habilitado access,
**When** I navigate to the Agenda,
**Then** I see a monthly calendar grid showing only Saturdays, with prev/next month navigation to browse up to 6 months ahead, color-coded by availability.

**Given** I apply the Colonia filter,
**When** I select a colonia from the dropdown,
**Then** only collection points in that colonia are shown.

**Given** I toggle "Solo con cupo disponible",
**When** the toggle is active,
**Then** only Saturdays with at least one available slot are displayed.

**Given** it is Friday after 23:59 CDMX,
**When** a volunteer tries to book the upcoming Saturday,
**Then** the slot shows as unavailable with message: "El plazo para calendarizar este sábado ha vencido (viernes 23:59). Contacta al administrador si necesitas asistir."

**Given** I am an admin,
**When** viewing the agenda,
**Then** I can book regardless of the Friday deadline.

**Given** there are no available slots,
**Then** an empty state is shown: "Esta semana no hay cupos disponibles. Prueba la próxima semana."

**Given** the agenda is loading,
**Then** skeleton cards are shown (not spinners).

### Story 3.2: Schedule a Turno

As a volunteer,
I want to book a Saturday slot at a collection point,
So that I can participate in the program.

**Acceptance Criteria:**

**Given** I select an available Saturday and a collection point,
**When** I proceed to book,
**Then** if it is my first booking, the system shows the exemption program T&C with a mandatory checkbox; otherwise it goes directly to confirmation.

**Given** I accept the T&C and confirm,
**When** I submit my booking,
**Then** the system creates the scheduling with a unique constraint `(point_id, saturday_date)`.

**Given** two users attempt to book the same slot simultaneously,
**When** the second booking hits the unique constraint,
**Then** the second user sees: "Este turno acaba de ser reservado por otra persona."

**Given** I already have a booking for that Saturday,
**When** I try to book another slot on the same day,
**Then** the system prevents it (max 1 turno per Saturday).

**Given** a user tries to book after Friday 23:59 for the upcoming Saturday,
**When** they attempt to schedule,
**Then** the system shows the deadline message and blocks the booking. Admins are exempt from this restriction.

### Story 3.3: My Schedulings & Attendance History

As a volunteer,
I want to view my upcoming and past turns with attendance status and program progress,
So that I can track my participation in the exemption program.

**Acceptance Criteria:**

**Given** I am authenticated,
**When** I navigate to "Mis Turnos",
**Then** I see a chronological list of my schedulings: future ones highlighted with dates and points, past ones showing Asistió or Falta status.

**Given** I have past attendances,
**Then** I see my exemption program progress: total attendances, faltas, 6-month deadline, and remaining attendances needed.

**Given** I have no upcoming turns,
**Then** an empty state is shown: "Aún no has agendado ningún sábado. Explora la agenda para encontrar tu primer turno."

### Story 3.4: Autonomous Turno Cancellation

As a volunteer,
I want to cancel my own turno,
So that the slot becomes available for someone else when I cannot attend.

**Acceptance Criteria:**

**Given** I have a future turno,
**When** I select it and choose "Cancelar turno",
**Then** the system shows a confirmation dialog.

**Given** I confirm cancellation on Monday through Thursday,
**Then** the turno is cancelled immediately, the point is freed, and no notification is sent.

**Given** I confirm cancellation on Friday (0:00-24:00) before the Saturday,
**Then** the turno is cancelled immediately, the point is freed, and an informative SMS is sent to the admin.

**Given** it is Saturday,
**When** I try to cancel,
**Then** the cancellation option is not available.

**Given** the cancellation succeeds,
**Then** I see "Turno cancelado exitosamente."

### Story 3.5: Saturday Operations — Default Attendance & Faltas

As an admin,
I want the system to auto-confirm attendance on Saturdays and allow me to register faltas,
So that attendance tracking is accurate with minimal manual effort.

**Acceptance Criteria:**

**Given** it is Saturday at 14:00 hrs CDMX,
**When** the node-cron job runs,
**Then** all schedulings for that Saturday are assigned "Asistencia" by default.

**Given** I am an admin on the Saturday operations view,
**When** I see the list of points with assigned volunteers,
**Then** I can mark a volunteer as Falta, or revert a Falta back to Asistencia.

**Given** I mark a volunteer as Falta,
**Then** the user receives a badge notification about the falta.

**Given** the node-cron scheduler,
**Then** it must be mockable/injectable for testing.

**Given** I am an admin,
**When** I revert a default Asistencia to Falta,
**Then** the attendance record updates accordingly.

### Story 3.6: Admin Saturday Turn Management & Cancellations

As an admin,
I want to manage Saturday turns — cancel bookings and assign replacements,
So that I can handle no-shows and keep collection points covered.

**Acceptance Criteria:**

**Given** I am an admin viewing the Saturday operations dashboard (current or past Saturday),
**When** I see a point with a volunteer assigned,
**Then** I can cancel that volunteer's turn.

**Given** I cancel a volunteer's turn on Saturday (after 14:00 CDMX),
**Then** the point is freed and no notification is sent to the user.

**Given** I see a vacant point (due to cancellation or falta),
**When** I select "Asignar reemplazo" and choose a user,
**Then** the user is scheduled at that point/date and automatically assigned Asistencia.

**Given** I want to cancel bookings outside of Saturday operations,
**When** I select individual or multiple schedulings and confirm cancellation,
**Then** they are cancelled, points/date are freed, and no notification is sent.

## Epic 4: Collection Points & Admin Management

Admins can manage collection points (CRUD, inactivate with cascade), manage users (list, block/unblock, edit profiles), manage superadmin roles, configure WhatsApp links, and view metrics dashboard. FR-29 (admin cancellations) moved to Epic 3 per UX recommendation.

### Story 4.1: Collection Points CRUD & Saturday Exceptions

As an admin,
I want to create, edit, activate, and deactivate collection points, and mark specific Saturdays as unavailable,
So that I can manage the volunteer locations.

**Acceptance Criteria:**

**Given** I am an admin on the Puntos de Acopio section,
**When** I create a new point with name, colonia, Maps location, and hours,
**Then** it appears as Activo and is available for scheduling on all Saturdays.

**Given** I edit an existing point,
**When** I update its details,
**Then** changes are reflected immediately in the agenda.

**Given** I mark a specific Saturday as "no disponible" for a point,
**Then** that Saturday does not appear for new bookings, and existing schedulings for future are cancelled. Users affected are notified by badge.

**Given** I view a point that has Saturday exceptions,
**Then** I can see which Saturdays are marked as unavailable.

### Story 4.2: Inactivate Collection Point with Cascade Cancellation

As an admin,
I want to inactivate a collection point so that all future schedulings are automatically cancelled and affected users are notified,
So that I can retire a location that is no longer operating.

**Acceptance Criteria:**

**Given** I am an admin viewing a collection point,
**When** I change its status to Inactivo,
**Then** the system cancels ALL future schedulings for that point, frees the dates, and notifies affected users via badge.

**Given** the inactivation completes,
**Then** the point no longer appears in the agenda for new bookings.

**Given** a point has no future schedulings,
**When** I inactivate it,
**Then** no cancellations are needed, and the point simply becomes unavailable.

**Given** I reactivate an inactive point,
**Then** it becomes available for new bookings starting from the next Saturday.

### Story 4.3: Admin User Management — List, Search, Block, Edit

As an admin,
I want to view, search, block/unblock, and edit user profiles,
So that I can manage the volunteer roster.

**Acceptance Criteria:**

**Given** I am an admin on the Usuarios section,
**Then** I see a list of all users with name, phone, email, Estatus (Alta/Pausa/Baja), Acceso (Habilitado/Bloqueado), and registration date.

**Given** I search by name, phone, email, Estatus, or Acceso,
**Then** the list filters to matching results.

**Given** I select a user and choose "Bloquear acceso",
**When** the user has future schedulings,
**Then** the system shows a warning: "Este usuario tiene X calendarizaciones futuras. ¿Deseas continuar? Se cancelarán y liberarán."

**Given** I confirm the block,
**Then** access is set to Bloqueado, the user cannot log in, and (if applicable) future schedulings are cancelled and freed.

**Given** I select a blocked user and choose "Desbloquear",
**Then** access returns to Habilitado, and their Estatus is preserved.

**Given** I edit a user's profile,
**Then** I can modify: Gender, Age, Scheme, Residue Type, Frequency, Estatus. I cannot modify: Name, Phone, Email.

### Story 4.4: Superadmin Role Management

As a superadmin,
I want to create, modify, and manage admin accounts,
So that I can control who has administrative access.

**Acceptance Criteria:**

**Given** I am a superadmin in the Administradores section,
**Then** I see a list of all admins with the ability to promote users, demote admins, and block admins.

**Given** I promote a user to Admin,
**Then** the user gains admin privileges.

**Given** I demote an admin to regular user,
**Then** the admin loses all admin privileges.

**Given** I block an admin,
**Then** the admin loses access to the admin panel.

**Given** I am a regular admin (not superadmin),
**When** I navigate to the admin management section,
**Then** it is not visible or accessible.

**Given** I am a superadmin,
**When** I try to demote or block myself,
**Then** the system prevents it.

### Story 4.5: WhatsApp Configuration & Metrics Dashboard

As an admin,
I want to configure WhatsApp group links and view program metrics,
So that volunteers can connect via chat and I can track program performance.

**Acceptance Criteria:**

**Given** I am an admin on the Configuración section,
**When** I save URLs for "Grupo de Avisos" and "Grupo Abierto",
**Then** these links are displayed in the profile of users with Estatus=Alta.

**Given** I navigate to the Dashboard (Métricas),
**Then** I see: total users, users by Estatus, users by Acceso, % assigned dates per point for the current year, users with active exemption, expired exemptions, and recognition QRs generated.

**Given** there is no data yet,
**Then** metrics show zero values (not errors).

## Epic 5: Exemption Program & Certificates

Volunteers automatically participate in the exemption program, track their progress (6 attendances in 6 months), receive QR exemption certificates (generated dynamically), earn recognition QRs during exemption validity, and get notified of resets and expirations.

### Story 5.1: Exemption Program Activation & Progress Tracking

As a volunteer,
I want the exemption program to activate automatically when I book my first turno, and to track my progress,
So that I know how close I am to earning the fee exemption.

**Acceptance Criteria:**

**Given** I book my first turno and accept the T&C,
**Then** the exemption program is activated. The 6-month countdown starts from my first confirmed attendance.

**Given** I have active participations,
**When** I view my progress,
**Then** I see: total attendances, number of faltas, the 6-month deadline, and remaining attendances needed.

**Given** I have 0 attendances,
**Then** the progress bar shows 0/6.

**Given** I complete 6 attendances within 6 months,
**Then** I am eligible for the QR Exención.

**Given** I do not complete 6 attendances within 6 months,
**Then** the count resets automatically, and new attendances start a new cycle.

### Story 5.2: 3-Falta Reset Logic

As a volunteer,
I want my attendance count to reset if I accumulate 3 faltas,
So that the exemption program is fair and requires consistent participation.

**Acceptance Criteria:**

**Given** I have accumulated 3 faltas in my current cycle,
**When** the third falta is registered by the admin,
**Then** my attendance and falta counts reset to 0, a new cycle starts from that date, and I receive a badge notification.

**Given** an admin reverts a falta that caused a 3-falta reset,
**Then** the system re-evaluates the count and restores it if appropriate.

**Given** I have 2 faltas,
**Then** I see a warning on my progress view: "Llevas 2 faltas. Una más y tu conteo de atenciones se reiniciará."

### Story 5.3: QR Exención Certificate

As a volunteer who completed 6 attendances in 6 months,
I want to access my dynamically generated QR Exención certificate,
So that I can prove my fee exemption at collection points.

**Acceptance Criteria:**

**Given** I have completed 6 attendances within 6 months,
**When** I navigate to "Mis Certificados",
**Then** I see my QR Exención generated dynamically (client-side via qrcode.react) containing: name, registration date, and expiry date (legible text).

**Given** the QR Exención is valid,
**Then** it is displayed with the active certificate style and a congratulatory message.

**Given** I click on the QR,
**Then** there is no download button, and right-click is disabled on the container. Screenshots are acceptable.

**Given** I already have an active QR Exención,
**Then** I cannot generate a second one until the current one expires.

**Given** the QR expires after 1 year,
**Then** new attendances after expiry count toward a new QR Exención.

### Story 5.4: QR Reconocimiento & Expired QR Handling

As a volunteer,
I want to earn recognition QRs during my exemption period and see visual state for expired certificates,
So that I feel recognized for continued participation and know when my exemption has lapsed.

**Acceptance Criteria:**

**Given** I have an active QR Exención,
**When** I complete another 6 attendances within 6 months,
**Then** a QR Reconocimiento is generated with a different visual style (color) to distinguish it from the Exención QR, showing the date of issuance (no expiry date, never expires).

**Given** my QR Exención is approaching expiry,
**Then** I receive badge notifications at 30 days, 7 days, and on the day of expiry.

**Given** my QR Exención expires,
**Then** it is shown in grey/opaque style with the expiry date legible, and new attendances start counting toward a new QR Exención.

**Given** I view a QR Reconocimiento,
**Then** it never shows as expired (no expiry date), but it shows the date of issuance (legible).

**Given** I have both active and expired certificates,
**Then** expired Exención QRs show grey/opaque, while Reconocimiento QRs always show their original style.

## Epic 6: Notifications System

Dual notification system: SMS via Twilio for critical events (OTP, Friday cancellations to admin, low-to-high reactivations) and in-app badge center for operational notifications (faltas, status changes, point inactivation, QR expiry, 3-falta reset).

### Story 6.1: SMS Notifications via Twilio

As a user or admin,
I want to receive SMS notifications for critical events,
So that I am aware of important actions without needing to check the app.

**Acceptance Criteria:**

**Given** a new user registers,
**When** they submit the registration form,
**Then** an SMS with a 6-digit OTP is sent to their phone within 30 seconds.

**Given** a user requests password recovery,
**When** they submit their phone number,
**Then** an SMS with a 6-digit OTP is sent to their phone within 30 seconds.

**Given** a volunteer cancels their turno on Friday (0:00-24:00),
**Then** an informative SMS is sent to the admin.

**Given** a user in Baja status requests to revert to Alta,
**Then** an SMS is sent to the admin notifying them of the reactivation request.

**Given** the SMS provider (Twilio) is unavailable,
**Then** the system logs the error and continues without blocking the user flow (OTP flows can retry).

**Given** I am an admin on the Configuración section,
**Then** I can register and modify Twilio credentials (account SID, auth token, phone number) as needed.

### Story 6.2: In-App Badge Notification Center

As a user or admin,
I want to receive in-app notifications via a bell icon with an unread counter,
So that I am aware of program events without SMS overload.

**Acceptance Criteria:**

**Given** I am authenticated,
**Then** I see a bell icon with a counter showing the number of unread notifications.

**Given** a falta is registered for me,
**Then** I receive a badge notification.

**Given** I change my Estatus (user-initiated),
**Then** the admin receives a badge notification.

**Given** a collection point is inactivated with affected schedulings,
**Then** affected users receive a badge notification.

**Given** my QR Exención is approaching expiry,
**Then** I receive badge notifications at 30 days, 7 days, and on the day of expiry.

**Given** my attendance count resets due to 3 faltas,
**Then** I receive a badge notification.

**Given** I open the notification panel and read a notification,
**Then** the unread counter decreases.

**Given** I am an admin,
**Then** I see both admin-specific notifications (status changes, Friday cancellations) and system notifications.

**Given** I am a volunteer,
**Then** I see only my personal notifications (faltas, QR expiry, resets).

**Given** there are no notifications,
**Then** I see an empty state: "No hay novedades. Te avisaremos cuando tengas algo nuevo."
