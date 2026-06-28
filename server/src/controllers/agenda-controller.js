import prisma from '../../config/prisma-client.js';
import { calculateUserProgress } from '../services/exemption-service.js';
import { sendSMS, getTwilioConfig } from '../config/twilio.js';
import { logger } from '../../config/logger.js';
import bcrypt from 'bcryptjs';

export async function seedCertTestUser(req, res, next) {
  try {
    const existingUser = await prisma.user.findUnique({ where: { phone: '1234567890' } });
    if (existingUser) {
      await prisma.attendance.deleteMany({ where: { userId: existingUser.id } });
      await prisma.scheduling.deleteMany({ where: { userId: existingUser.id } });
      await prisma.certificateQR.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Usuario Certificado Test',
        phone: '1234567890',
        email: 'cert@test.com',
        password: hashedPassword,
        role: 'volunteer',
        gender: 'Otro',
        age: '30-39',
        esquema: 'Puntos de Acopio',
        residuo: 'Crudos',
        frecuencia: 'Semanal',
        status: 'Alta'
      }
    });

    const point = await prisma.collectionPoint.findFirst({ where: { status: 'Activo' } });
    if (!point) return res.status(400).json({ error: 'No active points found' });

    const attendancesDates = [
      '2025-08-09T12:00:00Z', '2025-09-13T12:00:00Z', '2025-10-11T12:00:00Z',
      '2025-11-29T12:00:00Z', '2026-01-03T12:00:00Z', '2026-01-17T12:00:00Z',
      '2026-02-14T12:00:00Z', '2026-03-07T12:00:00Z', '2026-04-02T12:00:00Z',
      '2026-05-02T12:00:00Z', '2026-06-06T12:00:00Z'
    ];

    for (const dateStr of attendancesDates) {
      const date = new Date(dateStr);
      const scheduling = await prisma.scheduling.create({
        data: { userId: user.id, pointId: point.id, saturdayDate: date, status: 'Asistio', acceptedTerms: true }
      });

      await prisma.attendance.create({
        data: { schedulingId: scheduling.id, userId: user.id, status: 'Asistio', notes: 'Test certificate seeder' }
      });
    }

    await prisma.certificateQR.create({
      data: {
        userId: user.id,
        type: 'Exencion',
        issuedAt: new Date('2026-01-18T12:00:00Z'),
        expiresAt: new Date('2026-07-18T12:00:00Z'),
        isActive: true,
        attendancesAtIssuance: 6
      }
    });

    res.json({ success: true, message: 'Seed completed successfully with Exencion certificate on 2026-01-18', phone: '1234567890', password: '123456' });
  } catch (err) {
    next(err);
  }
}

export async function seedPruebas1(req, res, next) {
  try {
    const { checkAndAutoGenerateCertificate } = await import('../services/exemption-service.js');
    
    // 1. Delete all volunteers and their relationships
    const volunteers = await prisma.user.findMany({ where: { role: 'volunteer' }, select: { id: true } });
    const volIds = volunteers.map(v => v.id);
    
    if (volIds.length > 0) {
      await prisma.attendance.deleteMany({ where: { userId: { in: volIds } } });
      await prisma.scheduling.deleteMany({ where: { userId: { in: volIds } } });
      await prisma.certificateQR.deleteMany({ where: { userId: { in: volIds } } });
      await prisma.notificationBadge.deleteMany({ where: { userId: { in: volIds } } });
      await prisma.user.deleteMany({ where: { id: { in: volIds } } });
    }

    // 2. Define data
    const USERS = {
      'Irregular': { name: 'Usuario irregular', phone: '3333333333', email: 'irre@test.com' },
      'Antiguo': { name: 'Usuario Antiguo', phone: '4444444444', email: 'ant@test.com' },
      'Comprometido': { name: 'Usuario Comprometido', phone: '5555555555', email: 'comp@test.com' }
    };

    const POINTS = [
      { id: 1, name: 'Parque Jardines de la Hacienda', colonia: 'Jardines de la Hacienda' },
      { id: 2, name: 'Punto Cero Simulado 1', colonia: 'Simulada 1' },
      { id: 3, name: 'Punto Cero Simulado 2', colonia: 'Simulada 2' },
    ];

    const RECORDS = [
      { date: '2023-01-07', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-01-21', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-02-11', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-03-11', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-04-08', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-05-06', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-06-10', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-07-08', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-08-05', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-09-16', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-10-07', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-11-18', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2023-12-16', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-01-06', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-02-14', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-03-16', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-04-06', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-05-11', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-06-01', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-07-13', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-08-10', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-09-14', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-10-05', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-11-09', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2024-12-14', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-01-04', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-02-08', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-03-08', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-04-05', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-05-10', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-06-14', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-07-12', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-08-23', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-09-27', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-11-01', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-12-06', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2026-01-03', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2026-02-07', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2026-02-28', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2026-03-21', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2026-04-18', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2026-05-02', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2026-05-16', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2026-06-13', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2026-06-27', u: 'Antiguo', st: 'Asistio', pt: 1 },
      { date: '2025-09-06', u: 'Comprometido', st: 'Asistio', pt: 1 },
      { date: '2025-10-11', u: 'Comprometido', st: 'Asistio', pt: 1 },
      { date: '2025-11-22', u: 'Comprometido', st: 'Asistio', pt: 1 },
      { date: '2025-12-13', u: 'Comprometido', st: 'Asistio', pt: 1 },
      { date: '2026-01-17', u: 'Comprometido', st: 'Asistio', pt: 2 },
      { date: '2026-02-28', u: 'Comprometido', st: 'Asistio', pt: 2 },
      { date: '2026-03-21', u: 'Comprometido', st: 'Asistio', pt: 2 },
      { date: '2026-04-18', u: 'Comprometido', st: 'Asistio', pt: 2 },
      { date: '2026-05-16', u: 'Comprometido', st: 'Asistio', pt: 2 },
      { date: '2026-06-13', u: 'Comprometido', st: 'Asistio', pt: 2 },
      { date: '2026-06-27', u: 'Comprometido', st: 'Asistio', pt: 2 },
      { date: '2024-07-27', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2024-08-10', u: 'Irregular', st: 'Falta', pt: 3 },
      { date: '2024-09-14', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2024-10-05', u: 'Irregular', st: 'Falta', pt: 3 },
      { date: '2024-10-26', u: 'Irregular', st: 'Asistio', pt: 1 },
      { date: '2024-11-09', u: 'Irregular', st: 'Falta', pt: 3 },
      { date: '2024-12-14', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2025-01-25', u: 'Irregular', st: 'Asistio', pt: 2 },
      { date: '2025-02-22', u: 'Irregular', st: 'Asistio', pt: 2 },
      { date: '2025-03-08', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2025-04-05', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2025-05-31', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2025-07-12', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2025-08-09', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2025-08-23', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2025-09-27', u: 'Irregular', st: 'Asistio', pt: 2 },
      { date: '2025-11-01', u: 'Irregular', st: 'Asistio', pt: 2 },
      { date: '2025-12-13', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2026-01-17', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2026-02-28', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2026-03-21', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2026-04-18', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2026-05-02', u: 'Irregular', st: 'Asistio', pt: 2 },
      { date: '2026-06-13', u: 'Irregular', st: 'Asistio', pt: 3 },
      { date: '2026-06-27', u: 'Irregular', st: 'Asistio', pt: 3 },
    ];

    const hashedPassword = await bcrypt.hash('password123', 10);
    const dbUsers = {};

    for (const [key, userData] of Object.entries(USERS)) {
      const created = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          role: 'volunteer',
          gender: 'Otro',
          age: '20-29',
          esquema: 'Puntos de Acopio',
          residuo: 'Todos',
          frecuencia: 'Mensual',
          status: 'Alta'
        }
      });
      dbUsers[key] = created.id;
    }

    const dbPoints = {};
    for (const p of POINTS) {
      const point = await prisma.collectionPoint.upsert({
        where: { id: p.id },
        update: { name: p.name, colonia: p.colonia, status: 'Activo' },
        create: { id: p.id, name: p.name, colonia: p.colonia, status: 'Activo' }
      });
      dbPoints[p.id] = point.id;
    }

    const { addYears } = await import('date-fns');

    for (const [key, userId] of Object.entries(dbUsers)) {
      const userRecords = RECORDS.filter(r => r.u === key).sort((a, b) => new Date(a.date) - new Date(b.date));

      for (const r of userRecords) {
        const parsedDate = new Date(`${r.date}T12:00:00Z`);
        
        const scheduling = await prisma.scheduling.create({
          data: {
            userId,
            pointId: dbPoints[r.pt],
            saturdayDate: parsedDate,
            status: r.st,
            acceptedTerms: true
          }
        });

        await prisma.attendance.create({
          data: {
            schedulingId: scheduling.id,
            userId,
            status: r.st,
            notes: 'Pruebas1 Seed'
          }
        });

        if (r.st === 'Asistio') {
          const cert = await checkAndAutoGenerateCertificate(userId);
          if (cert) {
            const issueDate = new Date(`${r.date}T12:00:00Z`);
            issueDate.setDate(issueDate.getDate() + 1);
            let expiresAt = cert.type === 'Exencion' ? addYears(issueDate, 1) : addYears(issueDate, 100);

            await prisma.certificateQR.update({
              where: { id: cert.id },
              data: { issuedAt: issueDate, expiresAt }
            });
          }
        }
      }
    }

    res.json({ success: true, message: 'Seeding of Pruebas1 completed! All existing volunteers were wiped.' });
  } catch (err) {
    next(err);
  }
}

export async function getProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const progress = await calculateUserProgress(userId);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

export async function getAvailableSlots(req, res, next) {
  try {
    const { colonia, pointId, onlyAvailable } = req.query;

    const points = await prisma.collectionPoint.findMany({
      where: {
        status: 'Activo',
        ...(colonia && { colonia }),
        ...(pointId && { id: parseInt(pointId) }),
      },
      include: {
        unavailableDates: true,
      }
    });

    const now = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(now.getMonth() + 6);

    const schedulings = await prisma.scheduling.findMany({
      where: {
        saturdayDate: {
          gte: now,
          lte: sixMonthsFromNow,
        },
        // We only care about active reservations for availability check
        status: { in: ['Pendiente', 'Asistio'] } 
      }
    });

    // We'll return the raw data and let the frontend calculate the Saturday grid 
    // to avoid complex date manipulation in the backend across timezones for now.
    res.json({
      points,
      schedulings,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAgendaFilters(req, res, next) {
  try {
    const activePoints = await prisma.collectionPoint.findMany({
      where: { status: 'Activo' },
      select: { colonia: true, name: true, id: true }
    });

    const colonias = [...new Set(activePoints.map(p => p.colonia))].sort();
    const points = activePoints.map(p => ({ id: p.id, name: p.name })).sort((a, b) => a.name.localeCompare(b.name));

    res.json({ colonias, points });
  } catch (err) {
    next(err);
  }
}

export async function createScheduling(req, res, next) {
  try {
    const { pointId, saturdayDate, acceptedTerms } = req.body;
    const userId = req.user.id;

    if (!acceptedTerms) {
      return res.status(400).json({ error: { message: 'Debes aceptar el compromiso de asistencia.' } });
    }

    const [year, month, day] = saturdayDate.split('-');
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);

    // 1. Check if the point is active
    const point = await prisma.collectionPoint.findUnique({ where: { id: parseInt(pointId) } });
    if (!point || point.status !== 'Activo') {
      return res.status(400).json({ error: { message: 'El punto de acopio no está disponible.' } });
    }

    // 1.5 Check if the point has an exception for this Saturday
    const exception = await prisma.unavailableDate.findUnique({
      where: {
        pointId_saturdayDate: {
          pointId: parseInt(pointId),
          saturdayDate: date
        }
      }
    });

    if (exception) {
      return res.status(400).json({ error: { message: 'Este punto de acopio no está disponible para la fecha seleccionada (inhabilitado).' } });
    }

    // 2. Check if point is already taken for that date
    const existingAtPoint = await prisma.scheduling.findFirst({
      where: {
        pointId: parseInt(pointId),
        saturdayDate: date,
        status: { in: ['Pendiente', 'Asistio'] }
      }
    });

    if (existingAtPoint) {
      return res.status(409).json({ error: { message: 'Este espacio ya ha sido reservado por otro voluntario.' } });
    }

    // 3. Check if user already has a turn for that Saturday
    const userAlreadyScheduled = await prisma.scheduling.findFirst({
      where: {
        userId,
        saturdayDate: date,
        status: { in: ['Pendiente', 'Asistio'] }
      }
    });

    if (userAlreadyScheduled) {
      return res.status(409).json({ error: { message: 'Ya tienes un turno agendado para este sábado.' } });
    }

    // 4. Create scheduling
    const scheduling = await prisma.scheduling.create({
      data: {
        userId,
        pointId: parseInt(pointId),
        saturdayDate: date,
        acceptedTerms: true,
        status: 'Pendiente'
      }
    });

    res.status(201).json({
      message: '¡Turno agendado exitosamente!',
      scheduling
    });
  } catch (err) {
    next(err);
  }
}

export async function getMySchedulings(req, res, next) {
  try {
    const userId = req.user.id;

    const schedulings = await prisma.scheduling.findMany({
      where: { userId },
      include: {
        point: true
      },
      orderBy: {
        saturdayDate: 'desc'
      }
    });

    res.json(schedulings);
  } catch (err) {
    next(err);
  }
}

export async function cancelScheduling(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const scheduling = await prisma.scheduling.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { name: true, phone: true } } }
    });

    if (!scheduling) {
      return res.status(404).json({ error: { message: 'Turno no encontrado.' } });
    }

    if (scheduling.userId !== userId) {
      return res.status(403).json({ error: { message: 'No tienes permiso para cancelar este turno.' } });
    }

    if (scheduling.status !== 'Pendiente') {
      return res.status(400).json({ error: { message: 'Solo se pueden cancelar turnos pendientes.' } });
    }

    const updated = await prisma.scheduling.update({
      where: { id: parseInt(id) },
      data: {
        status: 'Cancelado',
        cancelledAt: new Date(),
        cancellationType: 'Volunteer'
      }
    });

    const nowCDMX = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Mexico_City"}));
    const day = nowCDMX.getDay();
    const hour = nowCDMX.getHours();
    
    if (day === 5 || (day === 6 && hour < 12)) {
      const config = await getTwilioConfig();
      if (!config.adminPhone) {
        logger.warn('Admin phone not configured, skipping Friday cancellation SMS.');
      } else {
        const msg = `Alerta: El voluntario ${scheduling.user.name || scheduling.user.phone} ha cancelado su turno de mañana sábado.`;
        await sendSMS(config.adminPhone, msg);
      }
    }

    res.json({
      message: 'Turno cancelado exitosamente.',
      scheduling: updated
    });
  } catch (err) {
    next(err);
  }
}
