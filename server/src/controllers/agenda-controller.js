import prisma from '../../config/prisma-client.js';
import { calculateUserProgress } from '../services/exemption-service.js';
import { sendSMS, getTwilioConfig } from '../config/twilio.js';
import { logger } from '../../config/logger.js';

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

    const nowStr = new Date().toLocaleString("en-US", {timeZone: "America/Mexico_City", weekday: "short"});
    if (nowStr === "Fri") {
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
