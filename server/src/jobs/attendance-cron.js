import cron from 'node-cron';
import prisma from '../config/prisma-client.js';
import { logger } from '../config/logger.js';

export function initAttendanceJob() {
  // Every Saturday at 14:00 (America/Mexico_City)
  // Format: second minute hour dayMonth month dayWeek
  cron.schedule('0 0 14 * * 6', async () => {
    logger.info('[CRON] Starting automated Saturday attendance confirmation...');
    
    try {
      const today = new Date();
      today.setHours(12, 0, 0, 0); // Normalized Saturday date

      const result = await prisma.scheduling.updateMany({
        where: {
          saturdayDate: today,
          status: 'Pendiente'
        },
        data: {
          status: 'Asistio'
        }
      });

      logger.info(`[CRON] Successfully confirmed attendance for ${result.count} turns.`);
    } catch (err) {
      logger.error('[CRON] Error during automated attendance confirmation:', err.message);
    }
  }, {
    timezone: "America/Mexico_City"
  });

  logger.info('[CRON] Attendance job initialized (Saturdays 14:00 CDMX).');
}
