---
stepsCompleted: [1, 2]
workInProgress:
  epic: 2
  story: null
  notes: "Epic 1 complete (5 stories). Epic 2+ pending for next session."
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-punto-zero-2026-05-24/prd.md"
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
**FR-8:** Epic 3 - Agenda & Scheduling
**FR-9:** Epic 3 - Agenda & Scheduling
**FR-10:** Epic 3 - Agenda & Scheduling
**FR-11:** Epic 3 - Agenda & Scheduling
**FR-12:** Epic 4 - Admin Operations
**FR-13:** Epic 4 - Admin Operations
**FR-14:** Epic 4 - Admin Operations
**FR-15:** Epic 4 - Admin Operations
**FR-16:** Epic 4 - Admin Operations
**FR-17:** Epic 4 - Admin Operations
**FR-18:** Epic 3 - Agenda & Scheduling
**FR-19:** Epic 5 - Exemption Program & Certificates
**FR-20:** Epic 5 - Exemption Program & Certificates
**FR-21:** Epic 5 - Exemption Program & Certificates
**FR-22:** Epic 5 - Exemption Program & Certificates
**FR-23:** Epic 5 - Exemption Program & Certificates
**FR-24:** Epic 5 - Exemption Program & Certificates
**FR-25:** Epic 4 - Admin Operations
**FR-26:** Epic 4 - Admin Operations
**FR-27:** Epic 4 - Admin Operations
**FR-28:** Epic 4 - Admin Operations
**FR-29:** Epic 4 - Admin Operations
**FR-30:** Epic 4 - Admin Operations
**FR-32:** Epic 4 - Admin Operations
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

### Epic 3: Agenda & Scheduling
Volunteers can browse available Saturdays with filters, book collection point slots, view their upcoming and past appointments, and cancel their own bookings with day-aware rules.
**FRs covered:** FR-8, FR-9, FR-10, FR-11, FR-18
**UX-DRs:** UX-DR2 (calendar-grid), UX-DR7 (responsive), UX-DR11 (empty states), UX-DR12 (loading states)

### Epic 4: Admin Operations
Admins can manage collection points (CRUD, inactivate with cascade), run Saturday operations (default attendance via node-cron, register faltas, assign reemplazos), manage users (list, block/unblock, edit profiles), manage superadmin roles, configure WhatsApp links, cancel bookings, and view metrics dashboard.
**FRs covered:** FR-12, FR-13, FR-14, FR-15, FR-16, FR-17, FR-25, FR-26, FR-27, FR-28, FR-29, FR-30, FR-32

### Epic 5: Exemption Program & Certificates
Volunteers automatically participate in the exemption program, track their progress (6 attendances in 6 months), receive QR exemption certificates (generated dynamically), earn recognition QRs during exemption validity, and get notified of resets and expirations.
**FRs covered:** FR-19, FR-20, FR-21, FR-22, FR-23, FR-24
**UX-DRs:** UX-DR3 (progress bar), UX-DR8 (clean minimal), UX-DR14 (Saturday Dashboard)

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
