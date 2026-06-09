import prisma from '../../config/prisma-client.js';

export async function getSaturdayTurns(req, res, next) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: { message: 'Se requiere una fecha (YYYY-MM-DD).' } });
    }

    const saturday = new Date(date);
    saturday.setHours(12, 0, 0, 0);

    const turns = await prisma.scheduling.findMany({
      where: {
        saturdayDate: saturday
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            status: true
          }
        },
        point: true
      },
      orderBy: {
        point: { name: 'asc' }
      }
    });

    res.json(turns);
  } catch (err) {
    next(err);
  }
}

export async function updateTurnStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pendiente', 'Asistio', 'Falta', 'Cancelado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: { message: 'Estatus inválido.' } });
    }

    const turn = await prisma.scheduling.update({
      where: { id: parseInt(id) },
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
    }

    res.json({ message: 'Estatus actualizado correctamente.', turn });
  } catch (err) {
    next(err);
  }
}
