# Addendum: Decisiones Técnicas

**Fecha:** 2026-05-24  
**Proyecto:** punto-zero

---

## Stack Tecnológico Decidido

Estas decisiones fueron proporcionadas por Oscar durante la fase de Discovery. Son definitivas para este MVP.

### 1. Plataforma de Despliegue
- **Servidor:** VPS (Virtual Private Server)
- **Sistema Operativo:** Linux

### 2. Frontend
- **Framework:** React.js

### 3. Contenerización
- **Tecnología:** Docker
- **Arquitectura:** Frontend y Backend en contenedores separados (o juntos según se decida en arquitectura)

### 4. Autenticación vía SMS
- **Proveedor:** Twilio
- **Propósito:** Envío de OTP para registro y recuperación de contraseña, notificaciones al admin (cancelaciones en viernes, reactivaciones de baja)
- **Formato:** SMS con código de 6 dígitos

### 5. Scheduler
- **Librería:** node-cron
- **Propósito:** Asistencia por default a las 14:00 hrs CDMX cada sábado
- **Nota:** Debe ser inyectable/mockeable para testing

---

## Pendientes de Definición en Arquitectura

Los siguientes aspectos se definirán en la fase de **Create Architecture**:

- Base de datos (motor, versión)
- Backend framework/lenguaje
- Servidor web (Nginx, Apache, etc.)
- ORM si aplica
- Estrategia de logging
- Estrategia de backups
- Pipeline de CI/CD
- Variables de entorno y secrets management

---

## Paleta de Colores

Proporcionada por Oscar durante Discovery:

| Color | Hex | Descripción |
|-------|-----|-------------|
| Blanco | `#ffffff` | Background base |
| Amarillo brillante | `#ffe10f` | Acento, alertas, highlights |
| Verde oscuro | `#41703f` | Primario, branding |
| Dorado/Mostaza | `#dbb539` | Secundario, acentos cálidos |
| Verde claro | `#789b3d` | Secundario, énfasis |

Estos colores se usarán en:
- UI de la aplicación
- Branding general
- Estados visuales (éxito, advertencia, etc.)
