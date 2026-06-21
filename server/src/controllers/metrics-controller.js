import prisma from '../../config/prisma-client.js';

export async function getDashboardMetrics(req, res, next) {
  try {
    const totalUsers = await prisma.user.count();
    
    const usersByStatusRaw = await prisma.user.groupBy({
      by: ['status'],
      _count: true
    });
    const usersByStatus = { Alta: 0, Pausa: 0, Baja: 0 };
    usersByStatusRaw.forEach(item => { usersByStatus[item.status] = item._count; });

    const usersByAccessRaw = await prisma.user.groupBy({
      by: ['access'],
      _count: true
    });
    const usersByAccess = { Habilitado: 0, Bloqueado: 0 };
    usersByAccessRaw.forEach(item => { usersByAccess[item.access] = item._count; });

    const cdmxFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', year: 'numeric' });
    const currentYear = parseInt(cdmxFormatter.format(new Date()), 10);
    
    const getSaturdaysInYear = (year) => {
      let count = 0;
      let d = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
      while (d.getUTCFullYear() === year) {
        if (d.getUTCDay() === 6) count++;
        d.setUTCDate(d.getUTCDate() + 1);
      }
      return count;
    };
    const saturdays = getSaturdaysInYear(currentYear);

    // CDMX operates at -06:00 (no DST as of 2023)
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00-06:00`);
    const endOfYear = new Date(`${currentYear + 1}-01-01T00:00:00-06:00`);

    const points = await prisma.collectionPoint.findMany({ select: { id: true, name: true } });
    
    const schedulingsGrouped = await prisma.scheduling.groupBy({
      by: ['pointId', 'saturdayDate'],
      where: {
        saturdayDate: {
          gte: startOfYear,
          lt: endOfYear
        }
      }
    });

    const pointCounts = {};
    for (const item of schedulingsGrouped) {
      pointCounts[item.pointId] = (pointCounts[item.pointId] || 0) + 1;
    }

    const assignedDatesPerPoint = points.map(p => {
      const uniqueDatesCount = pointCounts[p.id] || 0;
      const percentage = (uniqueDatesCount / saturdays) * 100;
      return {
        pointId: p.id,
        name: p.name,
        percentage: Math.round(percentage)
      };
    });

    const nowUtc = new Date();
    const activeExemptionQrs = await prisma.certificateQR.count({
      where: {
        type: 'exencion',
        isActive: true,
        expiresAt: { gt: nowUtc }
      }
    });

    const expiredExemptionQrs = await prisma.certificateQR.count({
      where: {
        type: 'exencion',
        OR: [
          { isActive: false },
          { expiresAt: { lte: nowUtc } }
        ]
      }
    });

    const recognitionQrsGenerated = await prisma.certificateQR.count({
      where: {
        type: 'reconocimiento'
      }
    });

    res.status(200).json({
      data: {
        totalUsers,
        usersByStatus,
        usersByAccess,
        assignedDatesPerPoint,
        activeExemptionQrs,
        expiredExemptionQrs,
        recognitionQrsGenerated
      },
      message: 'Success',
      error: null,
      statusCode: 200
    });
  } catch (err) {
    next(err);
  }
}
