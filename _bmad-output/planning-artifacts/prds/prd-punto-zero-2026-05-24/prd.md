---
title: punto-zero
created: 2026-05-24
updated: 2026-06-02 (party-mode audit)
status: draft
---

# PRD: punto-zero
*Working title.*

---

## 0. Document Purpose

Este PRD define los requerimientos para la primera versión de la aplicación web punto-zero.mx, enfocada en la **gestión de agenda para voluntarios** del programa de recolección de desechos orgánicos.

Este documento está dirigido a:
- **PM y Stakeholders:** para validar la visión y el alcance
- **Agente UX Designer:** para diseñar las interfaces de usuario
- **Agente Architect:** para definir la arquitectura técnica
- **Agente Developer:** para implementar las funcionalidades
- **Downstream workflows:** épicas, historias de usuario, y pruebas

**Inputs considerados:**
- Entrevista de Discovery con Oscar (Product Owner)
- Stakeholder review con cambios profundos en autenticación y lógica de negocio
- Stack técnico decidido: VPS Linux, React.js, Docker, Twilio, node-cron

**Estructura de este PRD:**
- Glosario con términos definidos una sola vez
- Features agrupados con Functional Requirements (FRs) anidados y numerados globalmente
- User Journeys (UJs) referenciados por ID desde los FRs

---

## 1. Visión

punto-zero es una plataforma que conecta ciudadanos comprometidos con el medio ambiente a través de un programa estructurado de voluntariado para la recolección de desechos orgánicos.

El producto permite a los **voluntarios** registrarse, calendarizar turnos en puntos de acopio públicos los sábados, y participar automáticamente en un programa de recompensa donde 6 atenciones en 6 meses se traducen en exención del pago de cuotas de recuperación por 1 año.

Para los **administradores**, la plataforma ofrece herramientas para gestionar puntos de acopio, supervisar asistencia, administrar cancelaciones, atender reemplazos tardíos, y visualizar métricas del programa.

Este MVP se enfoca exclusivamente en la **gestión de agenda para voluntarios**. La parte de generadores de desechos (usuarios que entregan cubetas y pagan cuotas) queda fuera de este alcance.

---

## 2. Target User

### 2.1 Primary Personas

#### Persona 1: Voluntario
**Quién es:** Ciudadano comprometido con el medio ambiente, de cualquier rango de edad, que quiere aportar su tiempo. Todos los voluntarios participan automáticamente en el programa de recompensa.

**Contexto:** Puede ser estudiante, jubilado, profesional con tiempo libre los sábados. Busca comunidad, contribuir a una causa, y potencialmente obtener exención del pago de cuotas.

**Cómo encaja punto-zero:** Registra con teléfono, completa su perfil, calendariza turnos cuando tiene disponibilidad, y automáticamente acumula atenciones para su QR de exención.

#### Persona 2: Administrador (Admin)
**Quién es:** Coordinador o responsable operativo del programa punto-zero.

**Contexto:** Necesita herramientas para gestionar la operación diaria: dar de alta puntos de acopio, supervisar asistencia, agendar reemplazos tardíos, atender solicitudes de cancelación, y generar métricas.

**Sub-roles:**
- **Superadmin:** Creado en BD durante despliegue. Puede crear, modificar y eliminar otros admins.
- **Admin:** Puede hacer todo lo operativo, pero no gestionar otros admins.

**Cómo encaja punto-zero:** Es el usuario con mayor nivel de permisos. Utiliza dashboards administrativos con notificaciones vía badge (campana) y SMS.

### 2.2 Jobs To Be Done

**Para Voluntario:**
- **JTBD-1:** Necesito registrarme en la plataforma de manera rápida usando mi teléfono
- **JTBD-2:** Necesito iniciar sesión con mi teléfono y contraseña
- **JTBD-3:** Necesito ver qué puntos de acopio están disponibles y en qué fechas
- **JTBD-4:** Necesito calendarizar un turno sabatino en un punto de acopio
- **JTBD-5:** Necesito cancelar mi turno si no puedo asistir
- **JTBD-6:** Necesito ver mi historial de turnos, asistencias y faltas
- **JTBD-7:** Necesito editar mi información personal (formulario)
- **JTBD-8:** Necesito saber mi progreso en el programa de exención (atenciones, faltas, fecha límite)
- **JTBD-9:** Necesito acceder a mi certificado QR de exención cuando esté disponible
- **JTBD-10:** Necesito ver mis QRs de reconocimiento

**Para Administrador:**
- **JTBD-11:** Necesito crear y gestionar puntos de acopio (activar/inactivar)
- **JTBD-12:** Necesito registrar faltas de voluntarios y agendar reemplazos tardíos
- **JTBD-13:** Necesito gestionar cancelaciones de turnos los sábados (por inasistencia)
- **JTBD-14:** Necesito cancelar reservaciones (individual, masiva)
- **JTBD-15:** Necesito gestionar usuarios (cambiar acceso, editar información)
- **JTBD-16:** Necesito configurar los links de WhatsApp y otras configuraciones
- **JTBD-17:** Necesito ver métricas del programa
- **JTBD-18:** Necesito gestionar otros admins (solo Superadmin)

### 2.3 Non-Users (v1)

Este producto NO está diseñado para:
- **Generadores de desechos:** Usuarios que solo entregan cubetas y pagan cuotas. Su gestión queda fuera de este MVP.
- **Aplicación móvil nativa:** Este MVP es web responsive, no una app nativa.

### 2.4 Key User Journeys

#### UJ-1: Voluntario se registra y activa su cuenta vía SMS
**Persona:** Cualquier voluntario

- **Entry state:** Usuario nuevo, sin cuenta. Accede a punto-zero.mx.
- **Path:**
  1. Usuario ve página de login con opción "Registrarse"
  2. Llena mini-formulario de registro: nombre, teléfono, contraseña (mín 8 + 1 especial), email (obligatorio, solo contacto)
  3. Acepta términos y condiciones + aviso de privacidad
  4. Sistema envía OTP (código de 6 dígitos) por SMS al teléfono vía Twilio
  5. Usuario ingresa OTP en la app
  6. Teléfono validado → cuenta creada y activada
  7. Redirigido a completar perfil
- **Clímax:** Usuario ve mensaje de "Cuenta creada exitosamente" y puede completar su perfil.
- **Resolution:** Usuario tiene cuenta activa y procede a llenar su formulario de perfil.

#### UJ-2: Voluntario completa su perfil y accede a la agenda
**Persona:** Cualquier voluntario

- **Persona + context:** Usuario ya activó su cuenta pero no ha completado el formulario completo.
- **Entry state:** Autenticado por primera vez.
- **Path:**
  1. Primer login → sistema requiere completar formulario de perfil
  2. Llena campos: Teléfono (heredado), Email (heredado), Género, Edad, Esquema, Tipo de residuo, Frecuencia, Estatus (default Alta)
  3. Guarda formulario
  4. Sistema redirige a la agenda
- **Clímax:** Usuario ve la agenda con los sábados disponibles de los próximos 6 meses.
- **Resolution:** Usuario puede navegar la agenda y calendarizar turnos.

#### UJ-3: Voluntario calendariza un turno
**Persona:** Cualquier voluntario (Estatus=Alta, Acceso=Habilitado)

- **Persona + context:** Usuario quiere participar como voluntario un sábado próximo.
- **Entry state:** Autenticado, en la agenda.
- **Path:**
  1. Navega por los meses (6 meses hacia adelante)
  2. Solo los sábados son seleccionables
  3. Selecciona un sábado → ve puntos de acopio disponibles ese día
  4. Selecciona un punto de acopio
  5. Sistema muestra T&C del programa de exención (solo la PRIMERA vez que agenda):
     - "Al calendarizar tu primera atención aceptas los términos y condiciones del programa de exención. Acumula 6 atenciones en 6 meses y obtén 1 año de exención de cuota"
     - Checkbox de aceptación
  6. Sistema muestra confirmación de la reservación
  7. Usuario confirma
  8. Turno calendarizado. El punto queda ocupado para ese sábado (cupo=1).
- **Clímax:** Usuario ve confirmación visual de su calendarización en la agenda.
- **Resolution:** Usuario tiene un turno calendarizado. No puede calendarizar más turnos para ese sábado.

#### UJ-4: Voluntario cancela su turno (autónomo)
**Persona:** Cualquier voluntario

- **Persona + context:** Usuario tiene un turno calendarizado pero ya no puede asistir.
- **Entry state:** Autenticado, ve su turno en la agenda.
- **Path:**
   1. Selecciona su turno calendarizado
   2. Ve opción "Cancelar turno"
   3. Sistema evalúa día/hora actual:
      - **Si es LUNES a JUEVES:** cancelación inmediata + punto liberado. Sin notificación.
      - **Si es VIERNES (0:00-24:00) previo al sábado:** cancelación inmediata + punto liberado + SMS informativo al admin
      - **Si es SÁBADO:** opción de cancelación no disponible
   4. Sistema muestra confirmación con regla aplicable
   5. Usuario confirma
   6. Turno cancelado y liberado automáticamente
- **Clímax:** Usuario ve mensaje: "Turno cancelado exitosamente."
- **Resolution:** Turno cancelado. Punto liberado para otro voluntario o reemplazo.

#### UJ-5: Voluntario acumula 6 atenciones - Obtiene QR de exención
**Persona:** Cualquier voluntario

- **Persona + context:** Usuario ha cumplido 6 atenciones dentro de su plazo de 6 meses.
- **Entry state:** Voluntario revisa su progreso.
- **Path:**
  1. Usuario ve en su progreso: "¡Has completado 6 atenciones!"
  2. Sistema muestra: "Tu certificado de exención por 1 año está listo"
  3. Usuario accede a sección "Mis Certificados"
  4. Ve su QR de exención vigente
  5. QR se genera DINÁMICAMENTE al momento de consultar
  6. QR contiene: nombre, fecha de registro, fecha de vencimiento LEGIBLE
- **Clímax:** Usuario ve su QR con la exención válida por 1 año.
- **Resolution:**
  - Usuario tiene exención por 1 año
  - Puede mostrar el QR en cualquier punto de acopio
   - Durante ese año, cada 6 atenciones en 6 meses genera un QR de reconocimiento (sin valor de exención)
  - Al vencer el QR de exención, las atenciones vuelven a contar para un nuevo QR de exención
  - Solo 1 QR de exención vigente a la vez

#### UJ-6: Sábado de operación - Asistencia, faltas y reemplazos
**Persona:** Admin

- **Persona + context:** Un sábado transcurre. Voluntarios asisten o faltan a sus turnos.
- **Entry state:** Sábado a las 14:00 hrs CDMX.
- **Path:**
  1. Sistema ejecuta `node-cron` a las 14:00 hrs CDMX:
     - Asigna ASISTENCIA por DEFAULT a todos los turnos del sábado
  2. Admin ingresa a su vista de agenda del sábado
  3. Ve cada punto de acopio con su voluntario asignado
  4. Para quienes no asistieron, admin marca como FALTA
     - Notificación: badge (campana) al usuario
     - Si acumula 3 faltas: conteo se resetea
  5. Admin puede AGENDAR REEMPLAZOS tardíamente:
     - Asigna un reemplazo a un punto que quedó vacante por cancelación o falta
     - El reemplazo se asigna al sábado en curso o pasado
     - Se le asigna ASISTENCIA automáticamente
- **Clímax:** Admin termina de registrar faltas y reemplazos.
- **Resolution:**
  - Asistencias por default
  - Faltas registradas manualmente
  - Reemplazos asignados con asistencia automática

#### UJ-7: Admin inactiva un punto de acopio
**Persona:** Admin

- **Persona + context:** Un punto de acopio ya no operará más.
- **Entry state:** Punto de acopio activo con calendarizaciones futuras.
- **Path:**
  1. Admin cambia punto a INACTIVO
  2. Sistema verifica calendarizaciones futuras
  3. Calendarizaciones se CANCELAN EN AUTOMÁTICO
  4. Sistema notifica a usuarios afectados vía badge (campana)
  5. Fechas quedan liberadas
  6. Punto queda inactivo
- **Clímax:** Sistema confirma: "Punto de acopio inactivado. X calendarizaciones canceladas. Usuarios notificados."
- **Resolution:** Punto no aparece más en la agenda para nuevas calendarizaciones.

#### UJ-8: Voluntario cambia su Estatus
**Persona:** Cualquier voluntario

- **Persona + context:** Usuario quiere pausar o darse de baja temporal o permanentemente.
- **Entry state:** Autenticado, en su perfil.
- **Path:**
  1. Usuario cambia su Estatus de Alta a Pausa o Baja
  2. Sistema muestra CONFIRMACIÓN:
     - "Este cambio cancelará TODAS tus calendarizaciones futuras"
  3. Usuario confirma
  4. Sistema:
     - Cancela TODAS las calendarizaciones futuras
     - Libera fechas/puntos
     - Notifica al admin vía badge (campana)
- **Clímax:** Sistema confirma el cambio.
- **Resolution:**
  - Si es **PAUSA**: usuario puede iniciar sesión, ver historial. Puede revertir a Alta → vuelve a agendar inmediatamente.
  - Si es **BAJA**: usuario puede iniciar sesión, ver historial. Para revertir a Alta → necesita AUTORIZACIÓN del admin. Se notifica admin vía SMS.

#### UJ-9: Admin bloquea a un usuario
**Persona:** Admin

- **Persona + context:** Admin necesita restringir el acceso de un usuario.
- **Entry state:** Admin en gestión de usuarios.
- **Path:**
  1. Admin selecciona usuario y elige "Bloquear acceso"
  2. Sistema verifica: ¿tiene calendarizaciones futuras?
     - Si SÍ → muestra advertencia: "Este usuario tiene X calendarizaciones futuras. ¿Deseas continuar? Se cancelarán y liberarán."
     - Si NO → confirmación simple
  3. Admin confirma
  4. Sistema:
     - Cambia Acceso a BLOQUEADO
     - (Si aplica) Cancela calendarizaciones futuras y libera fechas
     - Usuario no puede iniciar sesión
- **Clímax:** Sistema confirma: "Usuario bloqueado. No podrá iniciar sesión."
- **Resolution:** Admin puede desbloquear en cualquier momento. Estatus del usuario (Alta/Pausa/Baja) se mantiene.

#### UJ-10: Admin agenda reemplazo tardío
**Persona:** Admin

- **Persona + context:** Un voluntario faltó o canceló. El admin asigna un reemplazo para ese sábado.
- **Entry state:** Admin en agenda del sábado en curso o pasado, ve punto vacante.
- **Path:**
  1. Admin ve punto de acopio sin voluntario (por falta o cancelación)
  2. Admin selecciona "Asignar reemplazo"
  3. Busca y selecciona un usuario disponible
  4. Sistema calendariza al usuario en ese punto/fecha
  5. Sistema asigna ASISTENCIA automáticamente
- **Clímax:** Reemplazo asignado. Punto cubierto.
- **Resolution:** El reemplazo queda registrado con asistencia en su historial.

---

## 3. Glossary

| Término | Definición |
|---------|------------|
| **Voluntario** | Usuario registrado que calendariza turnos para atender puntos de acopio los sábados |
| **Generador** | Usuario que entrega desechos orgánicos y paga cuota de recuperación. Fuera del alcance de este MVP. |
| **Admin / Administrador** | Usuario con permisos elevados para gestionar el sistema |
| **Superadmin** | Admin con capacidad de crear, modificar y eliminar otros admins. Creado en BD durante despliegue. |
| **Punto de Acopio** | Lugar público (plaza, parque, etc.) donde los voluntarios atienden sábados. Datos: nombre, colonia, ubicación Maps, horario. |
| **Calendarización / Turno** | Asignación de un voluntario a un punto de acopio un sábado específico. Cupo máximo: 1 voluntario por punto por sábado. |
| **Agenda** | Vista que muestra sábados disponibles para calendarización. Ventana de 6 meses hacia adelante. |
| **Atención** | Asistencia confirmada de un voluntario a su turno. Default: asignado automáticamente a las 14:00 hrs CDMX del sábado. |
| **Falta** | No-asistencia registrada manualmente por el admin. 3 faltas → reseteo del conteo de atenciones. |
| **Reemplazo** | Voluntario asignado tardíamente (por admin) a un sábado en curso o pasado para cubrir una falta o cancelación. Recibe asistencia automática. |
| **Estatus (Usuario)** | Controlado por el usuario: `Alta` (activo, puede agendar), `Pausa` (temporal, no puede agendar pero sí iniciar sesión), `Baja` (desactivado, no puede agendar pero sí iniciar sesión) |
| **Acceso (Usuario)** | Controlado por admin: `Habilitado` (puede iniciar sesión), `Bloqueado` (NO puede iniciar sesión) |
| **Estado (Punto de Acopio)** | `Activo` (disponible para calendarización), `Inactivo` (no disponible; calendarizaciones futuras se cancelan automáticamente) |
| **No Disponible (por fecha)** | Excepción: un sábado específico en que un punto activo no opera |
| **Programa de Exención** | Automático para todos los voluntarios. 6 atenciones en 6 meses → QR de exención de cuota por 1 año. |
| **QR de Exención** | Código QR con valor de exención de pago. Generado dinámicamente al consultar. Vigente por 1 año. Solo 1 por usuario a la vez. |
| **QR de Reconocimiento** | QR generado durante el periodo de vigencia de un QR de exención. Solo valor moral/reconocimiento. Distintivo visual diferente (color). |
| **OTP** | Código de 6 dígitos enviado por SMS vía Twilio para autenticación |
| **Badge (Campana)** | Notificación dentro de la aplicación (icono de campana con contador de notificaciones no leídas) |
| **Grupo de Avisos** | Chat de WhatsApp (solo admin envía mensajes). Link configurable por admin. Visible solo para usuarios con Estatus=Alta. |
| **Grupo Abierto** | Chat de WhatsApp (todos pueden enviar mensajes). Link configurable por admin. Visible solo para usuarios con Estatus=Alta. |

---

## 4. Features

### 4.1 Feature: Autenticación y Registro vía SMS
**Description:** Manejo de cuentas de usuario con teléfono como identificador verificado (SMS OTP) y email como identificador secundario de login. Autenticación vía SMS (Twilio) siguiendo estándar de la industria. Realiza UJ-1.

**Functional Requirements:**

#### FR-1: Registro de usuario nuevo con validación SMS
El sistema debe permitir a usuarios nuevos crear una cuenta mediante un mini-formulario de registro y validar su teléfono mediante OTP por SMS.
- **Actor:** Usuario no autenticado
- **Campos requeridos:**
  - Nombre (para personalizar SMS/correos)
  - Teléfono (identificador verificado, login, no editable después)
  - Email (obligatorio, identificador secundario de login, no editable después)
  - Contraseña
- **Validación de contraseña:** longitud mínima 8 caracteres, al menos 1 carácter especial
- **Validación de email:** debe tener formato válido, el email no debe existir ya en la BD (unique constraint)
- **Checkboxes obligatorios:**
  - Aceptar términos y condiciones
  - Aceptar aviso de privacidad
- **Flujo:**
   1. Usuario llena formulario y hace clic en "Registrarse"
   2. Sistema valida que el teléfono no exista ya en la BD
   3. Sistema valida que el email no exista ya en la BD (unique constraint)
   4. Sistema envía OTP de 6 dígitos por SMS (vía Twilio) al teléfono
   5. Usuario ingresa OTP en la app
   6. Si OTP correcto → cuenta creada y activada
   7. Si OTP incorrecto → mensaje: "Código incorrecto. Intenta de nuevo."
- **Reintentos OTP:** máximo 3 intentos por código. Después del 3ro, el código se invalida y debe solicitar uno nuevo.
- **Reenvío OTP:** disponible después de 60 segundos. Al reenviar, se genera un nuevo código y el anterior expira.
- **OTP expirado:** mostrar "El código ha expirado. Solicita uno nuevo."
- **Si teléfono ya existe:** mostrar mensaje y sugerir recuperación de contraseña
- **Si email ya existe:** mostrar mensaje: "Este correo electrónico ya está registrado"
- Realiza UJ-1.

**Consequences (testable):**
- SMS con OTP se envía en menos de 30 segundos
- OTP correcto → cuenta activa
- 3 intentos fallidos → código inválido, debe solicitar nuevo OTP
- Reenvío disponible después de 60 segundos
- Email duplicado → registro rechazado con mensaje

#### FR-2: Login con teléfono o email y contraseña
El sistema debe autenticar usuarios mediante teléfono o email más contraseña, en un campo unificado.
- **Actor:** Usuario registrado y activado
- **Credenciales:** identificador (teléfono o email) + contraseña
- **Detección automática:** el backend detecta si el identificador contiene `@` → busca por email; caso contrario → busca por teléfono
- **Sin bloqueo por intentos fallidos** (decisión de producto), pero al menos rate limiting suave
- **Primer login exitoso:**
  - Si usuario NO ha completado formulario de perfil → redirigir a formulario obligatorio
  - Si usuario YA completó formulario → redirigir a agenda
- **Usuario con Acceso=BLOQUEADO:**
  - Mensaje: "Tu cuenta ha sido bloqueada. Contacta al administrador."
- Realiza UJ-1.

**Consequences (testable):**
- Credenciales correctas → sesión iniciada
- Credenciales incorrectas → mensaje: "Identificador o contraseña incorrectos"
- Usuario bloqueado → no puede iniciar sesión
- Login con email funciona igual que con teléfono
- Email no existente → mismo mensaje genérico (no revelar qué campos existen)

#### FR-3: Recuperación de contraseña vía SMS
El sistema debe permitir a usuarios recuperar su contraseña mediante OTP enviado por SMS.
- **Actor:** Usuario registrado
- **Flujo:**
  1. Usuario ingresa su teléfono en "Olvidé mi contraseña"
  2. Si teléfono existe → enviar OTP por SMS
  3. Si teléfono NO existe → mostrar mensaje genérico
  4. Usuario ingresa OTP correcto → puede establecer nueva contraseña
- **Validación de nueva contraseña:** mín 8, 1 carácter especial
- **OTP de un solo uso:** después de cambiar contraseña, el código expira

**Consequences (testable):**
- Teléfono existente recibe SMS con OTP en menos de 30 segundos
- OTP correcto → contraseña actualizada

#### FR-4: Campo email obligatorio (identificador de login + contacto)
El sistema debe capturar el email como campo obligatorio, usado como identificador secundario de login además de contacto.
- **Actor:** Usuario durante registro
- **Email es obligatorio** con validación de formato
- **Email debe ser único** en la BD (unique constraint)
- **Email NO es editable** después del registro
- **Email SÍ se usa** para login (vía campo unificado en FR-2)
- **Email NO se usa** para recuperación de contraseña (sigue siendo vía SMS al teléfono)

**Consequences (testable):**
- Formulario de registro no se envía sin email válido
- Email duplicado → mensaje de error
- Puedo hacer login con mi email + contraseña
- Recuperación de contraseña sigue pidiendo teléfono, no email

### 4.2 Feature: Perfil de Usuario (Formulario Completo)
**Description:** Formulario detallado que el usuario completa después del primer login. Realiza UJ-2.

**Functional Requirements:**

#### FR-5: Formulario de perfil obligatorio en primer login
El sistema debe requerir que el usuario complete el formulario de perfil después de su primer login exitoso.
- **Actor:** Usuario autenticado (primer login)
- **No puede saltarse**
- **Campos del formulario:**
  - Nombre (heredado, NO editable)
  - Email (heredado, NO editable)
  - Teléfono (heredado, NO editable)
  - **Género** → Hombre / Mujer / Otro / Prefiero no decir
   - **Edad** → <20, 20-29, 30-39, 40-49, 50-59, 60+, OTRA
  - **Esquema** → **E** (editable): Puntos de Acopio / Ruta en casa
    - Si Ruta en casa: domicilio, colonia, CP, Maps
  - **Tipo de Residuo** → **E**: Crudos / Heces y guisados (no excluyentes), con número de cubetas
  - **Frecuencia** → **E**: Semanal / Quincenal
  - **Estatus** → **E**: Alta / Pausa / Baja (default: Alta)
- **Nota:** Campos Esquema, Tipo Residuo, Frecuencia son "de generador" para uso futuro.
- Realiza UJ-2.

**Consequences (testable):**
- Después de guardar, redirigido a la agenda
- Formulario accesible para edición posterior

#### FR-6: Edición de perfil y cambio de Estatus
El sistema debe permitir al usuario editar campos marcados como editables y cambiar su propio Estatus.
- **Actor:** Usuario autenticado
- **Campos editables:** Género, Edad, Esquema, Tipo Residuo, Frecuencia, **Estatus**
- **NO editables:** Nombre, Teléfono, Email
- **Sección "Información de Cuenta":**
  - Links de WhatsApp (Grupo Avisos + Grupo Abierto) si Estatus=Alta
- **ANTES de cambiar Estatus a ≠Alta:**
  - Confirmación: "Este cambio cancelará TODAS tus calendarizaciones futuras. ¿Estás seguro?"
- **DESPUÉS de cambiar a ≠Alta:**
  - Cancelar TODAS las calendarizaciones futuras
  - Liberar fechas/puntos
  - Notificar admin vía badge (campana)
- **Al revertir PAUSA → Alta:** puede agendar inmediatamente
- **Al revertir BAJA → Alta:** necesita autorización del admin. Admin notificado vía SMS. Mientras espera: solo gestionar cuenta (no agendar)
- Realiza UJ-8.

**Consequences (testable):**
- Cambio de Estatus ≠ Alta cancela calendarizaciones futuras
- Reversión de Baja requiere aprobación admin + SMS al admin
- Reversión de Pusa es inmediata

#### FR-7: Links de WhatsApp en perfil
El sistema debe mostrar botones/links a los chats de WhatsApp en la información de cuenta.
- **Actor:** Usuario con Estatus=Alta
- **Dos links configurables por admin:**
  - "Grupo de Avisos" (solo admin envía)
  - "Grupo Abierto" (todos pueden enviar)

**Consequences (testable):**
- Usuario con Estatus=Alta ve ambos links

### 4.3 Feature: Agenda y Calendarización
**Description:** Vista donde los usuarios ven turnos disponibles y calendarizan. Realiza UJ-2, UJ-3, UJ-4.

**Functional Requirements:**

#### FR-8: Vista de agenda
El sistema debe mostrar una vista donde solo los sábados son seleccionables.
- **Actor:** Usuario (Estatus=Alta, Acceso=Habilitado) o Admin
- **Ventana de tiempo:** 6 meses hacia adelante
- **Solo sábados seleccionables**
- **Filtros disponibles:**
  1. Por Colonia (dropdown)
  2. Por Punto de Acopio (dropdown)
  3. Toggle "Solo con cupo disponible"
- **Límite para usuarios regulares:** no calendarizar después de las **23:59 hrs del viernes anterior** (zona `America/Mexico_City`)
- **Si intenta calendarizar después del deadline:** mostrar "El plazo para calendarizar este sábado ha vencido (viernes 23:59). Contacta al administrador si necesitas asistir."
- **Admin PUEDE agendar el mismo sábado** (para reemplazos)
- Realiza UJ-3.

**Consequences (testable):**
- Viernes 23:59 CDMX: sábado siguiente no disponible para usuarios normales
- Mensaje de error claro al intentar después del deadline
- Admin puede agendar independientemente del deadline
- Filtros visibles y funcionales

#### FR-9: Calendarización de turno en punto de acopio
El sistema debe permitir calendarizar un turno en un punto de acopio un sábado.
- **Actor:** Usuario (Estatus=Alta, Acceso=Habilitado) o Admin
- **Cupo:** 1 voluntario por punto por sábado. **Constraint única en BD** `(point_id, saturday_date)` para race conditions
- **Usuario: máximo 1 turno por sábado** (con reservaciones activas)
- **Primera calendarización del usuario:**
  - Mostrar T&C del programa de exención con checkbox obligatorio
- **Confirmación antes de confirmar**
- **Race condition:** constraint única. Segundo usuario ve: "Este turno acaba de ser reservado por otra persona."
- Realiza UJ-3.

**Consequences (testable):**
- Constraint única `(point_id, saturday_date)` en BD
- Primera vez: T&C obligatorio
- Dos clicks simultáneos: solo uno reserva

#### FR-10: Visualización de mis calendarizaciones
El sistema debe mostrar al usuario sus turnos pasados y futuros.
- **Actor:** Usuario autenticado
- **Futuros:** resaltados en agenda
- **Pasados:** estado Asistió / Falta
- **Historial detallado**

**Consequences (testable):**
- Usuario identifica fácilmente sus turnos

#### FR-11: Cancelación autónoma de turno por usuario
El sistema debe permitir al usuario cancelar su propio turno de forma autónoma e inmediata.
- **Actor:** Usuario autenticado con turno futuro
- **Reglas por día:**
  - **Lunes a Jueves:** cancelación inmediata + punto liberado
  - **VIERNES (0:00-24:00) previo al sábado:** cancelación inmediata + punto liberado + **SMS al admin** (informativo)
  - **Sábado:** usuario NO puede cancelar
- **Flujo:**
  1. Usuario selecciona su turno futuro
  2. Ve opción "Cancelar turno"
  3. Sistema muestra confirmación
  4. Si confirma → turno cancelado y liberado automáticamente
- Realiza UJ-4.

**Consequences (testable):**
- Lunes a jueves: cancelación inmediata + punto liberado
- Viernes: cancelación inmediata + punto liberado + SMS al admin
- Sábado: opción de cancelación no disponible para el usuario

### 4.4 Feature: Gestión de Puntos de Acopio (Admin)
**Description:** Herramientas para que el admin cree, active e inactive puntos. Realiza UJ-7.

**Functional Requirements:**

#### FR-12: CRUD de Puntos de Acopio
El sistema debe permitir al admin crear, editar, activar e inactivar puntos de acopio.
- **Actor:** Administrador
- **Datos:** Nombre, Colonia, Ubicación Maps, Horario, Estado (Activo/Inactivo)
- **Activo:** disponible todos los sábados (excepto excepciones)
- **Inactivo:** no disponible para nuevas calendarizaciones
- Realiza UJ-7.

**Consequences (testable):**
- Punto nuevo aparece en la agenda
- Punto inactivo no aparece

#### FR-13: Sábados "no disponibles" para un punto
El sistema debe permitir al admin registrar excepciones de sábados específicos.
- **Actor:** Administrador
- **Si hay calendarizaciones existentes en esa fecha:** se respetan

**Consequences (testable):**
- Sábado marcado no aparece para nuevos usuarios
- Calendarizaciones existentes se respetan

#### FR-14: Inactivación de punto - cancelación automática
El sistema debe cancelar automáticamente todas las calendarizaciones futuras al inactivar un punto y notificar a los afectados.
- **Actor:** Administrador
- **Flujo:**
  1. Admin inactiva punto
  2. Sistema cancela TODAS las calendarizaciones futuras
  3. Sistema notifica a usuarios afectados vía badge (campana)
  4. Fechas liberadas
- Realiza UJ-7.

**Consequences (testable):**
- Inactivar punto → cancelación automática de todas las calendarizaciones futuras
- Badge a usuarios afectados

### 4.5 Feature: Asistencia, Faltas y Reemplazos (Admin)
**Description:** Asistencia default vía node-cron. Admin registra faltas y reemplazos. Realiza UJ-6.

**Functional Requirements:**

#### FR-15: Asistencia por default vía node-cron
El sistema debe ejecutar `node-cron` a las 14:00 hrs CDMX cada sábado para asignar "Asistencia" por default.
- **Actor:** Sistema (node-cron)
- **Horario:** 14:00 hrs CDMX
- **Time zone:** `America/Mexico_City`
- **Aplica a:** todas las calendarizaciones del sábado en curso
- **Admin puede revertir**
- Realiza UJ-6.

**Consequences (testable):**
- A las 14:00 CDMX, default Asistencia
- Scheduler mockeable

#### FR-16: Registro de faltas por admin
El sistema debe mostrar al admin una vista por sábado para registrar faltas.
- **Actor:** Administrador
- **Vista:** puntos con voluntarios asignados
- **Acciones:** marcar Falta, revertir a Asistencia, revertir Asistencia a Falta
- **Al marcar Falta:** badge (campana) al usuario
- Realiza UJ-6.

**Consequences (testable):**
- Admin ve lista completa por sábado
- Falta dispara badge al usuario

#### FR-17: Gestión de turnos por admin los sábados
El sistema debe permitir al admin gestionar turnos los sábados: cancelar y asignar reemplazos.
- **Actor:** Administrador
- **Cuándo:** cualquier sábado (en curso o pasado), después de 14:00 CDMX
- **Acciones:**
  1. Ver puntos y sus voluntarios asignados
  2. **Cancelar turno** de un voluntario (por inasistencia confirmada)
  3. **Asignar reemplazo** a un punto vacante (por cancelación o falta)
     - Busca usuario disponible
     - Calendariza al usuario + asigna ASISTENCIA automática
- Realiza UJ-6, UJ-10.

**Consequences (testable):**
- Admin puede cancelar turnos los sábados
- Reemplazo calendarizado con asistencia automática
- Reemplazo cuenta como atención en el programa

#### FR-18: Historial de asistencias y faltas
El sistema debe mostrar al usuario su historial y progreso en el programa de exención.
- **Actor:** Usuario autenticado
- **Historial:** lista cronológica con estado
- **Progreso:** atenciones, faltas, fecha límite, atenciones restantes

**Consequences (testable):**
- Usuario ve todo su historial y progreso

### 4.6 Feature: Programa de Exención Automático
**Description:** Todos participan automáticamente. 6 atenciones en 6 meses → QR exención 1 año. QRs de reconocimiento durante vigencia. Realiza UJ-5.

**Functional Requirements:**

#### FR-19: Activación automática del programa
El sistema debe activar el programa al calendarizar el primer turno + aceptar T&C.
- **Actor:** Usuario + Sistema
- **Primera calendarización:** T&C obligatorio
- **Conteo desde la PRIMERA ATENCIÓN**
- **Plazo:** 6 meses desde primera atención
- Realiza UJ-5.

**Consequences (testable):**
- Aceptar T&C al primer turno = programa activado
- Conteo desde primera atención confirmada

#### FR-20: Seguimiento de progreso
El sistema debe mostrar al usuario su progreso en el programa.
- **Actor:** Usuario en programa
- **Mostrar:** atenciones, faltas, fecha límite, atenciones restantes

**Consequences (testable):**
- Usuario ve su progreso

#### FR-21: Reseteo del conteo por 3 faltas
El sistema debe resetear el conteo al acumular 3 faltas en el ciclo actual.
- **Actor:** Sistema (automático)
- **Trigger:** 3ra falta registrada por admin
- **Acción:** resetear atenciones y faltas a 0. Nuevo ciclo desde la fecha.
- **Notificar usuario:** badge (campana)
- **Si admin REVIERTE una falta que causó el reseteo:** re-evaluar y restaurar si corresponde
- **No hay baja del programa:** solo reseteo

**Consequences (testable):**
- 3ra falta → reseteo inmediato
- Reversión → re-evaluación

#### FR-22: Generación de QR de Exención
El sistema debe generar QR de exención al completar 6 atenciones en ≤6 meses.
- **Actor:** Usuario + Sistema
- **QR vigente por 1 año**
- **Solo 1 QR de exención vigente por usuario**
- **Generado DINÁMICAMENTE** al consultar
- **Contenido:** nombre, fecha registro, fecha vencimiento LEGIBLE
- **NO descargable:** renderizado client-side con qrcode.react. Sin botón de descarga. Clic derecho deshabilitado en el contenedor. El usuario puede hacer screenshot (aceptable).
- **Sin validación**
- Realiza UJ-5.

**Consequences (testable):**
- QR disponible después de 6 atenciones
- Contiene fecha de vencimiento legible

#### FR-23: QR de Reconocimiento
El sistema debe generar QRs de reconocimiento durante la vigencia de un QR de exención.
- **Actor:** Sistema (automático)
- **Cuándo:** al completar 6 atenciones en un plazo de 6 meses durante la vigencia del QR de exención
- **Sin superposición:** no hay periodos concurrentes. Un QR (exención o reconocimiento) debe vencer antes de que comience a contar otro.
- **Valor:** solo moral/reconocimiento
- **Distintivo visual diferente** (color) - a definir en UX
- **Al vencer QR de exención:** nuevas atenciones cuentan para nuevo QR de exención

**Consequences (testable):**
- QR de reconocimiento con estilo visual distinto
- Sin valor de exención

#### FR-24: QR vencido o expirado
El sistema debe notificar y mostrar visualmente QRs vencidos.
- **Actor:** Sistema
- **Notificaciones badge:** 30 días antes, 7 días antes, día del vencimiento
- **QR vencido:** accesible, fecha vencimiento legible, estilo gris/opaco
- **Programa sin completar en 6 meses:** conteo se resetea automáticamente
- **Después de vencimiento:** nuevas atenciones cuentan para nuevo QR de exención

**Consequences (testable):**
- Badge 30d, 7d, día de vencimiento
- QR vencido con estilo visual diferente
- Reseteo automático de conteo si no completó

### 4.7 Feature: Gestión de Usuarios y Acceso (Admin)
**Description:** Herramientas para gestionar usuarios, bloquear/desbloquear acceso, y gestionar admins. Realiza UJ-8, UJ-9.

**Functional Requirements:**

#### FR-25: Lista y búsqueda de usuarios (Admin)
El sistema debe mostrar al admin una lista de usuarios con búsqueda.
- **Actor:** Administrador
- **Datos:** Nombre, Teléfono, Email, Estatus (Alta/Pausa/Baja), Acceso (Habilitado/Bloqueado), Fecha registro
- **Búsqueda:** por nombre, teléfono, email, estatus, acceso

**Consequences (testable):**
- Admin puede buscar y encontrar usuarios

#### FR-26: Bloqueo/Desbloqueo de acceso por admin
El sistema debe permitir al admin bloquear/desbloquear acceso.
- **Actor:** Administrador
- **Al bloquear con calendarizaciones futuras:**
  - Advertencia + confirmación
  - Si confirma: bloquear + cancelar calendarizaciones + liberar fechas
- **Al bloquear sin calendarizaciones:** directo
- **Usuario bloqueado:** NO puede iniciar sesión
- **Al desbloquear:** vuelve a Habilitado. Estatus se mantiene.
- Realiza UJ-9.

**Consequences (testable):**
- Bloqueado no puede iniciar sesión
- Bloqueo con calendarizaciones = advertencia
- Desbloqueo restaura acceso

#### FR-27: Edición de perfil de usuario por admin
El sistema debe permitir al admin editar cualquier perfil de usuario.
- **Actor:** Administrador
- **Editable:** Género, Edad, Esquema, Tipo Residuo, Frecuencia, Estatus
- **NO editables:** Nombre, Teléfono, Email

**Consequences (testable):**
- Admin puede editar perfil de cualquier usuario

#### FR-28: Gestión de admins (solo superadmin)
El sistema debe permitir al superadmin crear, modificar y eliminar admins.
- **Actor:** Superadmin
- **Acciones:** promover usuario a Admin, degradar Admin a usuario, eliminar Admin
- **Restricción:** Admin no puede gestionar otros admins
- **Restricción:** superadmin no puede degradarse/eliminarse a sí mismo

**Consequences (testable):**
- Superadmin puede crear admins
- Admin no puede gestionar admins

### 4.8 Feature: Cancelación Directa por Admin
**Description:** Admin cancela calendarizaciones directamente.

**Functional Requirements:**

#### FR-29: Cancelación individual y masiva por admin
El sistema debe permitir al admin cancelar calendarizaciones directas.
- **Actor:** Administrador
- **Individual o masiva**
- **Al cancelar:** calendarización cancelada, fecha/punto liberado
- **Sin notificación al usuario** (intencional: el admin puede hacer cambios operativos sin badge ni SMS)**

**Consequences (testable):**
- Calendarización cancelada y liberada
- Sin notificación

### 4.9 Feature: Configuración (Admin)

**Functional Requirements:**

#### FR-30: Configuración de links de WhatsApp
El sistema debe permitir al admin configurar URLs de WhatsApp.
- **Actor:** Administrador
- **URLs:** Grupo de Avisos + Grupo Abierto
- **Se muestran en perfil de usuarios con Estatus=Alta**

**Consequences (testable):**
- Admin guarda URLs
- Usuarios con Alta ven los links

### 4.11 Feature: Métricas (Admin)
**Description:** Dashboard de métricas.

**Functional Requirements:**

#### FR-32: Dashboard de métricas
El sistema debe mostrar métricas al admin.
- **Actor:** Administrador
- **Usuarios:** total, por Estatus, por Acceso
- **Puntos:** % fechas asignadas por punto en año actual
- **Programa:** usuarios con exención vigente, vencida, QRs de reconocimiento generados

**Consequences (testable):**
- Admin ve dashboard con todas las métricas

### 4.12 Feature: Sistema de Notificaciones
**Description:** Notificaciones vía SMS (Twilio) y Badge (campana).

**Functional Requirements:**

#### FR-33: Notificaciones SMS (vía Twilio)
El sistema debe enviar SMS para eventos específicos.
- **OTP registro** → usuario
- **OTP recuperación contraseña** → usuario
- **Cancelación en VIERNES** → admin
- **Reactivación de BAJA** → admin

**Consequences (testable):**
- SMS en menos de 30 segundos

#### FR-34: Notificaciones Badge (Campana)
El sistema debe mostrar notificaciones dentro de la app mediante badge.
- **Eventos:**
  - Falta registrada → usuario
  - Cambio Estatus por usuario → admin
  - Inactivación punto con cancelaciones → usuarios afectados
  - Vencimiento QR (30d, 7d, día) → usuario
  - Reseteo conteo 3 faltas → usuario
- **Visualización:** icono campana con contador de no leídas
- **Al leer:** contador disminuye
- **Diferenciado por rol:** usuario ve solo sus notificaciones; admin ve administrativas + propias

**Consequences (testable):**
- Badge con contador correcto
- Al leer notificación, contador disminuye

---

## 5. Non-Goals (Explicit)

| ID | Declaración |
|----|-------------|
| **NG-1** | No habrá gestión de usuarios en su rol exclusivo de "generadores" |
| **NG-2** | No habrá procesamiento de pagos ni registro de cuotas |
| **NG-3** | No habrá gestión de rutas a domicilio para recolección |
| **NG-4** | No habrá aplicación móvil nativa. Solo web responsive |
| **NG-5** | No habrá validación escaneable del QR de exención |
| **NG-6** | No habrá integración con APIs externas de maps más allá de mostrar links |
| **NG-7** | No habrá sistema de notificaciones push. Solo SMS + Badge |
| **NG-8** | No habrá sistema de logs de auditoría visibles para usuarios. Se permiten logs internos mínimos para soportar la reversión de reseteo por 3 faltas (FR-21). |
| **NG-9** | No habrá proceso de inscripción al programa de exención. Es automático |

---

## 6. MVP Scope

### 6.1 In Scope

1. **Autenticación vía SMS:** Registro (OTP), login, recuperación contraseña
2. **Perfil:** Formulario completo, edición, links WhatsApp
3. **Agenda:** Vista, calendarización, reemplazos tardíos
4. **Cancelación autónoma de turnos:** Usuario cancela sin aprobación. Lunes-Jueves: inmediato. Viernes: inmediato + SMS admin. Sábado: no disponible.
5. **Puntos de Acopio:** CRUD, inactivar (cancelación automática + badge)
6. **Asistencia:** Default node-cron (14:00 CDMX), faltas, reemplazos
7. **Programa de Exención:** Automático, 6/6, QR exención, QR reconocimiento, reseteo 3 faltas
8. **Gestión Usuarios (Admin):** Lista, edición, bloqueo/desbloqueo
9. **Gestión Admins (Superadmin):** Crear, modificar, eliminar admins
10. **Cancelaciones Admin:** Individual, masiva
11. **Configuración:** Links WhatsApp
12. **Métricas:** Dashboard
13. **Notificaciones:** SMS (Twilio) + Badge (campana)

### 6.2 Out of Scope for MVP

| Item | Motivo |
|------|--------|
| Gestión de generadores y pagos | Fase posterior |
| App móvil nativa | Web responsive suficiente |
| Validación del QR por escaneo | Solo visual |
| Notificaciones push | SMS + Badge |
| Reportes/analytics avanzados | Solo métricas básicas |
| Multi-idioma | Solo español |
| Logs de auditoría | No necesario |

---

## 7. Success Metrics

### Primary
- **SM-1:** Tasa de conversión registro → primer turno calendarizado > 70%
- **SM-2:** Tasa de asistencia promedio > 90%

### Secondary
- **SM-3:** Tasa de completación programa exención > 60%
- **SM-4:** Tasa de reemplazos exitosos > 80%

### Counter-metrics
- **SM-C1:** Solicitudes de cancelación por usuario (no optimizar)
- **SM-C2:** Reseteos por 3 faltas (no optimizar)

---

## 8. Open Questions

~~OQ-1:~~ Resuelto. Filtros: Colonia, Punto, toggle "Solo con cupo disponible".
**OQ-2:** Detalle de vistas admin - layout, navegación, badges. A definir en UX.
~~OQ-3:~~ Resuelto. Máximo 3 reintentos OTP, 60 segundos entre reintentos.

---

## 9. Assumptions Index

**A-1:** Teléfono no editable después del registro.
**A-2:** Email no editable después del registro.
**A-3:** Género y Edad son editables por usuario y admin. Nombre NO es editable.
**A-4:** Sistema de badges como tabla de notificaciones en BD, no push.
