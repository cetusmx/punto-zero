import prisma from '../../config/prisma-client.js';
import { calculateUserProgress } from '../services/exemption-service.js';
import { isAfter } from 'date-fns';

export async function getSaturdayTurns(req, res, next) {
  try {
    const { date, month } = req.query;

    if (!date && !month) {
      return res.status(400).json({ error: { message: 'Se requiere un date (YYYY-MM-DD) o un month (YYYY-MM).' } });
    }

    let targetDates = [];

    if (date) {
      const saturday = new Date(date);
      saturday.setHours(12, 0, 0, 0);
      targetDates.push(saturday);
    } else if (month) {
      const [y, m] = month.split('-');
      const year = parseInt(y);
      const monthNum = parseInt(m) - 1; // 0-indexed
      const dateCursor = new Date(year, monthNum, 1);
      dateCursor.setHours(12, 0, 0, 0);
      
      while (dateCursor.getMonth() === monthNum) {
        if (dateCursor.getDay() === 6) {
          targetDates.push(new Date(dateCursor));
        }
        dateCursor.setDate(dateCursor.getDate() + 1);
      }
    }

    // Get all schedulings for the target dates
    const schedulings = await prisma.scheduling.findMany({
      where: { saturdayDate: { in: targetDates } },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, status: true }
        },
        point: true
      }
    });

    // Get relevant collection points
    const activePoints = await prisma.collectionPoint.findMany({
      where: {
        OR: [
          { status: 'Activo' },
          { id: { in: schedulings.map(s => s.pointId) } }
        ]
      },
      orderBy: { name: 'asc' }
    });

    const result = [];

    for (const satDate of targetDates) {
      const satSchedulings = schedulings.filter(s => s.saturdayDate.getTime() === satDate.getTime());
      
      for (const point of activePoints) {
        const scheduling = satSchedulings.find(s => s.pointId === point.id);
        if (scheduling) {
          result.push({
            id: scheduling.id,
            pointId: point.id,
            point: point,
            user: scheduling.user,
            status: scheduling.status,
            saturdayDate: scheduling.saturdayDate
          });
        } else {
          result.push({
            id: `vacant-${point.id}-${satDate.getTime()}`,
            pointId: point.id,
            point: point,
            user: null,
            status: 'Vacante',
            saturdayDate: satDate
          });
        }
      }
    }

    // Sort by Date asc, then Point name asc
    result.sort((a, b) => {
      if (a.saturdayDate.getTime() !== b.saturdayDate.getTime()) {
        return a.saturdayDate.getTime() - b.saturdayDate.getTime();
      }
      return a.point.name.localeCompare(b.point.name);
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateTurnStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const turnId = parseInt(id);
    if (isNaN(turnId)) return res.status(400).json({ error: { message: 'ID inválido.' } });

    const validStatuses = ['Pendiente', 'Asistio', 'Falta', 'Cancelado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: { message: 'Estatus inválido.' } });
    }

    const currentTurn = await prisma.scheduling.findUnique({ where: { id: turnId } });
    if (!currentTurn) return res.status(404).json({ error: { message: 'Turno no encontrado.' } });

    if (currentTurn.status === status) {
      return res.json({ message: 'Estatus sin cambios.', turn: currentTurn });
    }

    // Validation: Check if it is part of an already issued certificate
    const conflictingCert = await prisma.certificateQR.findFirst({
      where: {
        userId: currentTurn.userId,
        issuedAt: { gte: currentTurn.saturdayDate }
      }
    });

    if (conflictingCert) {
      if (status === 'Falta') {
        // Automatically revoke the conflicting certificate(s) since this attendance was part of it
        await prisma.certificateQR.deleteMany({
          where: {
            userId: currentTurn.userId,
            issuedAt: { gte: currentTurn.saturdayDate }
          }
        });
      } else {
        return res.status(400).json({ error: { message: 'No se puede modificar esta reserva a este estatus porque ya forma parte de un certificado emitido. Solo es posible asignarle Falta, lo cual revocará el certificado automáticamente.' } });
      }
    }

    const oldProgress = await calculateUserProgress(currentTurn.userId);

    const turn = await prisma.scheduling.update({
      where: { id: turnId },
      data: { status },
      include: { user: true }
    });

    // If it's a Falta, notify the user
    if (status === 'Falta') {
      await prisma.notificationBadge.create({
        data: {
          userId: turn.userId,
          category: 'falta',
          title: 'Falta registrada',
          message: `Has sido marcado con una Falta para el sábado ${turn.saturdayDate.toISOString().split('T')[0]}. Contacta al administrador si crees que es un error.`,
        }
      });
      
      const newProgress = await calculateUserProgress(turn.userId);
      const isTimeExpiration = newProgress.deadline && isAfter(currentTurn.saturdayDate, newProgress.deadline);
      const resetOccurred = oldProgress.faltas === 2 && newProgress.faltas === 0 && !isTimeExpiration;
      
      if (resetOccurred) {
        await prisma.notificationBadge.create({
          data: {
            userId: turn.userId,
            category: 'reset',
            title: 'Conteo Reiniciado',
            message: 'Has acumulado 3 faltas. Tu conteo de atenciones se ha reiniciado a 0. ¡No te rindas, vuelve a agendar!',
          }
        });
      }
    } else if (status === 'Asistio') {
      const { checkAndAutoGenerateCertificate } = await import('../services/exemption-service.js');
      await checkAndAutoGenerateCertificate(turn.userId);
    }

    res.json({ message: 'Estatus actualizado correctamente.', turn });
  } catch (err) {
    next(err);
  }
}

export async function cancelSaturdayTurn(req, res, next) {
  try {
    const { id } = req.params;

    const turnId = parseInt(id);
    if (isNaN(turnId)) {
      return res.status(400).json({ error: { message: 'ID inválido.' } });
    }

    const turn = await prisma.scheduling.findUnique({
      where: { id: turnId }
    });

    if (!turn) {
      return res.status(404).json({ error: { message: 'Turno no encontrado.' } });
    }

    if (turn.status === 'Asistio' || turn.status === 'Falta') {
      return res.status(400).json({ error: { message: 'No se puede cancelar un turno finalizado (Asistencia o Falta).' } });
    }

    const updated = await prisma.scheduling.update({
      where: { id: turnId },
      data: {
        status: 'Cancelado',
        cancelledAt: new Date(),
        cancellationType: 'Admin'
      }
    });

    res.json({ message: 'Turno cancelado exitosamente.', turn: updated });
  } catch (err) {
    next(err);
  }
}

export async function cancelMultipleTurns(req, res, next) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: { message: 'Se requiere un arreglo de IDs.' } });
    }

    const intIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));

    if (intIds.length === 0) {
      return res.status(400).json({ error: { message: 'Se requiere un arreglo de IDs válidos.' } });
    }

    await prisma.scheduling.updateMany({
      where: {
        id: { in: intIds },
        status: { notIn: ['Asistio', 'Falta'] }
      },
      data: {
        status: 'Cancelado',
        cancelledAt: new Date(),
        cancellationType: 'Admin'
      }
    });

    res.json({ message: 'Turnos cancelados exitosamente.' });
  } catch (err) {
    next(err);
  }
}

export async function getEligibleVolunteers(req, res, next) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: { message: 'Se requiere una fecha (YYYY-MM-DD).' } });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: { message: 'Fecha inválida.' } });
    }
    targetDate.setHours(12, 0, 0, 0);

    const activeUsers = await prisma.user.findMany({
      where: {
        role: 'volunteer',
        status: 'Alta',
        access: 'Habilitado',
        NOT: {
          schedulings: {
            some: {
              saturdayDate: targetDate,
              status: { in: ['Pendiente', 'Asistio'] }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(activeUsers);
  } catch (err) {
    next(err);
  }
}

export async function assignReplacementTurn(req, res, next) {
  try {
    const { pointId, saturdayDate, userId } = req.body;

    if (!pointId || !saturdayDate || !userId) {
      return res.status(400).json({ error: { message: 'Faltan parámetros requeridos (pointId, saturdayDate, userId).' } });
    }

    const pid = parseInt(pointId);
    const uid = parseInt(userId);

    if (isNaN(pid) || isNaN(uid)) {
      return res.status(400).json({ error: { message: 'IDs inválidos.' } });
    }

    const date = new Date(saturdayDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: { message: 'Fecha inválida.' } });
    }
    date.setHours(12, 0, 0, 0);

    const point = await prisma.collectionPoint.findUnique({ where: { id: pid } });
    if (!point || point.status !== 'Activo') {
      return res.status(400).json({ error: { message: 'El punto de acopio no existe o está inactivo.' } });
    }

    const user = await prisma.user.findUnique({
      where: { id: uid }
    });

    if (!user || user.role !== 'volunteer' || user.status !== 'Alta' || user.access !== 'Habilitado') {
      return res.status(400).json({ error: { message: 'El usuario no es elegible para asignación.' } });
    }

    const userAlreadyScheduled = await prisma.scheduling.findFirst({
      where: {
        userId: uid,
        saturdayDate: date,
        status: { in: ['Pendiente', 'Asistio'] }
      }
    });

    if (userAlreadyScheduled) {
      return res.status(400).json({ error: { message: 'El usuario ya tiene un turno activo para este sábado.' } });
    }

    const existing = await prisma.scheduling.findUnique({
      where: {
        pointId_saturdayDate: {
          pointId: pid,
          saturdayDate: date
        }
      }
    });

    let turn;
    if (existing) {
      if (existing.status === 'Cancelado') {
        turn = await prisma.scheduling.update({
          where: { id: existing.id },
          data: {
            userId: uid,
            status: 'Asistio',
            cancelledAt: null,
            cancellationType: null,
            acceptedTerms: true
          },
          include: { user: true, point: true }
        });
      } else {
        return res.status(409).json({ error: { message: 'El espacio ya está reservado por un voluntario activo.' } });
      }
    } else {
      turn = await prisma.scheduling.create({
        data: {
          userId: uid,
          pointId: pid,
          saturdayDate: date,
          status: 'Asistio',
          acceptedTerms: true
        },
        include: { user: true, point: true }
      });
    }

    const { checkAndAutoGenerateCertificate } = await import('../services/exemption-service.js');
    await checkAndAutoGenerateCertificate(turn.userId);

    res.status(201).json({ message: 'Reemplazo asignado exitosamente.', turn });
  } catch (err) {
    next(err);
  }
}

export async function getUpcomingTurns(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const turns = await prisma.scheduling.findMany({
      where: {
        saturdayDate: { gte: today },
        status: 'Pendiente'
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true }
        },
        point: true
      },
      orderBy: { saturdayDate: 'asc' }
    });

    res.json(turns);
  } catch (err) {
    next(err);
  }
}
