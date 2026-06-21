import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List all collection points
export async function getCollectionPoints(req, res, next) {
  try {
    const points = await prisma.collectionPoint.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(points);
  } catch (err) {
    next(err);
  }
}

// Create a new collection point
export async function createCollectionPoint(req, res, next) {
  try {
    const { name, colonia, address, lat, lng, horario } = req.body;

    if (!name || !colonia) {
      return res.status(400).json({ error: { message: 'Nombre y colonia son obligatorios.' } });
    }

    const point = await prisma.collectionPoint.create({
      data: {
        name,
        colonia,
        address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        horario,
        status: 'Activo'
      }
    });

    res.status(201).json(point);
  } catch (err) {
    next(err);
  }
}

// Edit an existing point
export async function updateCollectionPoint(req, res, next) {
  try {
    const { id } = req.params;
    const { name, colonia, address, lat, lng, horario, status } = req.body;

    const pointId = parseInt(id);
    if (isNaN(pointId)) {
      return res.status(400).json({ error: { message: 'ID de punto inválido.' } });
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentPoint = await tx.collectionPoint.findUnique({ where: { id: pointId } });
      if (!currentPoint) {
        throw new Error('PUNTO_NO_ENCONTRADO');
      }

      const isDeactivating = currentPoint.status !== 'Inactivo' && status === 'Inactivo';

      const point = await tx.collectionPoint.update({
        where: { id: pointId },
        data: {
          name,
          colonia,
          address,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          horario,
          status
        }
      });

      if (isDeactivating) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const affected = await tx.scheduling.findMany({
          where: {
            pointId,
            saturdayDate: { gte: today },
            status: 'Pendiente'
          }
        });

        if (affected.length > 0) {
          await tx.scheduling.updateMany({
            where: { id: { in: affected.map(s => s.id) } },
            data: {
              status: 'Cancelado',
              cancellationType: 'Admin',
              cancelledAt: new Date()
            }
          });

          const uniqueUserIds = [...new Set(affected.map(s => s.userId))];

          await tx.notificationBadge.createMany({
            data: uniqueUserIds.map(userId => ({
              userId,
              category: 'system',
              title: 'Punto de acopio inhabilitado',
              message: `El punto de acopio ${point.name} ha sido inhabilitado de forma permanente. Tus próximas asistencias agendadas en esta ubicación han sido canceladas.`
            }))
          });
        }
      }

      return point;
    });

    res.json(result);
  } catch (err) {
    if (err.message === 'PUNTO_NO_ENCONTRADO') {
      return res.status(404).json({ error: { message: 'Punto no encontrado.' } });
    }
    next(err);
  }
}

// List Exceptions for a point
export async function getPointExceptions(req, res, next) {
  try {
    const { id } = req.params;
    const pointId = parseInt(id);

    if (isNaN(pointId)) {
      return res.status(400).json({ error: { message: 'ID de punto inválido.' } });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exceptions = await prisma.unavailableDate.findMany({
      where: { 
        pointId,
        saturdayDate: { gte: today } // Usually only care about future/current exceptions
      },
      orderBy: { saturdayDate: 'asc' }
    });

    res.json(exceptions);
  } catch (err) {
    next(err);
  }
}

// Add a Saturday Exception
export async function addPointException(req, res, next) {
  try {
    const { id } = req.params;
    const { date, reason } = req.body;

    const pointId = parseInt(id);
    if (isNaN(pointId) || !date) {
      return res.status(400).json({ error: { message: 'ID y fecha son requeridos.' } });
    }

    const [year, month, day] = date.split('-');
    const targetDate = new Date(year, month - 1, day, 12, 0, 0, 0);

    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: { message: 'Fecha inválida.' } });
    }
    targetDate.setHours(12, 0, 0, 0);

    // Verify it's a Saturday (6)
    if (targetDate.getDay() !== 6) {
      return res.status(400).json({ error: { message: 'La fecha debe ser un sábado.' } });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Add exception
      const exception = await tx.unavailableDate.upsert({
        where: {
          pointId_saturdayDate: {
            pointId,
            saturdayDate: targetDate
          }
        },
        update: { reason },
        create: {
          pointId,
          saturdayDate: targetDate,
          reason
        }
      });

      // 2. Find affected active schedulings
      const affected = await tx.scheduling.findMany({
        where: { 
          pointId, 
          saturdayDate: targetDate, 
          status: 'Pendiente' 
        },
        include: { user: true }
      });

      if (affected.length > 0) {
        // 3. Update schedulings to cancelled
        await tx.scheduling.updateMany({
          where: { id: { in: affected.map(s => s.id) } },
          data: { 
            status: 'Cancelado', 
            cancellationType: 'Admin', 
            cancelledAt: new Date() 
          }
        });

        // 4. Create badges for affected users
        const badgePromises = affected.map(s => tx.notificationBadge.create({
          data: {
            userId: s.userId,
            category: 'system',
            title: 'Punto de acopio inhabilitado',
            message: `El punto de acopio al que te registraste para el sábado ha sido marcado como no disponible por el administrador. Tu turno ha sido cancelado.`
          }
        }));
        await Promise.all(badgePromises);
      }

      return { exception, affectedCount: affected.length };
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// Remove an Exception
export async function removePointException(req, res, next) {
  try {
    const { id, date } = req.params;
    
    const pointId = parseInt(id);
    if (isNaN(pointId) || !date) {
      return res.status(400).json({ error: { message: 'Parámetros inválidos.' } });
    }

    const [year, month, day] = date.split('-');
    const targetDate = new Date(year, month - 1, day, 12, 0, 0, 0);

    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: { message: 'Fecha inválida.' } });
    }

    await prisma.unavailableDate.delete({
      where: {
        pointId_saturdayDate: {
          pointId,
          saturdayDate: targetDate
        }
      }
    });

    res.json({ success: true, message: 'Excepción eliminada correctamente.' });
  } catch (err) {
    // If record doesn't exist, ignore
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Excepción no encontrada.' } });
    }
    next(err);
  }
}
