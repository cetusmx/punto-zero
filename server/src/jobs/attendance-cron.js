import cron from 'node-cron';
import prisma from '../../config/prisma-client.js';
import { logger } from '../../config/logger.js';

export function initAttendanceJob() {
  // Every Saturday at 14:00 (America/Mexico_City)
  // Format: second minute hour dayMonth month dayWeek
  cron.schedule('0 0 14 * * 6', async () => {
    logger.info('[CRON] Starting automated Saturday attendance confirmation...');
    
    try {
      const today = new Date();
      today.setHours(12, 0, 0, 0); // Normalized Saturday date

      // 1. First, find all users who have a 'Pendiente' turn today
      const pendingTurns = await prisma.scheduling.findMany({
        where: {
          saturdayDate: today,
          status: 'Pendiente'
        },
        select: { id: true, userId: true }
      });

      if (pendingTurns.length > 0) {
        // 2. Update their statuses to 'Asistio'
        await prisma.scheduling.updateMany({
          where: {
            id: { in: pendingTurns.map(t => t.id) }
          },
          data: {
            status: 'Asistio'
          }
        });

        // 3. Check for auto-generation for each unique user
        const { checkAndAutoGenerateCertificate } = await import('../services/exemption-service.js');
        const uniqueUserIds = [...new Set(pendingTurns.map(t => t.userId))];
        for (const uid of uniqueUserIds) {
          await checkAndAutoGenerateCertificate(uid);
        }
      }

      logger.info(`[CRON] Successfully confirmed attendance for ${pendingTurns.length} turns.`);
    } catch (err) {
      logger.error('[CRON] Error during automated attendance confirmation:', err.message);
    }
  }, {
    timezone: "America/Mexico_City"
  });

  logger.info('[CRON] Attendance job initialized (Saturdays 14:00 CDMX).');
}
