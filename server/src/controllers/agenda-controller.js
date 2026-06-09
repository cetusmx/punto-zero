import prisma from '../../config/prisma-client.js';

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
