import cron from 'node-cron';
import prisma from '../../config/prisma-client.js';
import { differenceInCalendarDays } from 'date-fns';
import logger from '../utils/logger.js';

export function initExpiryJob() {
  // Run every day at 1:00 AM CDMX time
  cron.schedule('0 1 * * *', async () => {
    logger.info('[Expiry-Cron] Starting expiry check for Exencion certificates...');
    try {
      const activeExenciones = await prisma.certificateQR.findMany({
        where: {
          type: 'Exencion',
          isActive: true
        }
      });

      const nowTime = Date.now();
      // Approximate CDMX shift (UTC-6)
      const todayCDMX = new Date(nowTime - 6 * 3600 * 1000);

      for (const cert of activeExenciones) {
        if (!cert.expiresAt) continue;

        try {
          const expiresCDMX = new Date(cert.expiresAt.getTime() - 6 * 3600 * 1000);
          const diffDays = differenceInCalendarDays(expiresCDMX, todayCDMX);

          if (diffDays < 0) {
            // Expired
            await prisma.$transaction([
              prisma.certificateQR.update({
                where: { id: cert.id },
                data: { isActive: false }
              }),
              prisma.notificationBadge.create({
                data: {
                  userId: cert.userId,
                  category: 'system',
                  title: 'Exención Expirada',
                  message: 'Tu certificado de exención ha expirado. Tus nuevas atenciones comenzarán a contar para uno nuevo.'
                }
              })
            ]);
            logger.info(`[Expiry-Cron] Certificate ${cert.id} marked as inactive.`);
          } else if (diffDays <= 30) {
            let threshold = null;
            let message = '';
            
            if (diffDays <= 0) { threshold = 0; message = 'Tu certificado de exención expira el día de hoy.'; }
            else if (diffDays <= 7) { threshold = 7; message = 'Tu certificado de exención expira en 7 días u hoy mismo.'; message = `Tu certificado de exención expira en ${diffDays} días.`; }
            else if (diffDays <= 30 && diffDays > 7) { threshold = 30; message = 'Tu certificado de exención expira en menos de 30 días.'; message = `Tu certificado de exención expira en ${diffDays} días.`; }

            if (threshold !== null) {
              // Ensure idempotency for each threshold window
              const alreadyNotified = await prisma.notificationBadge.findFirst({
                where: {
                  userId: cert.userId,
                  title: 'Aviso de Expiración',
                  message: { contains: threshold === 30 ? '30 días' : (threshold === 7 ? '7 días' : 'día de hoy') },
                  createdAt: { gte: new Date(nowTime - 35 * 24 * 3600 * 1000) }
                }
              });

              if (!alreadyNotified) {
                // To avoid string matching issues, just use strict strings for the query match
                const finalMsg = threshold === 30 ? 'Tu certificado de exención expira en 30 días.' : (threshold === 7 ? 'Tu certificado de exención expira en 7 días.' : 'Tu certificado de exención expira el día de hoy.');
                
                await prisma.notificationBadge.create({
                  data: {
                    userId: cert.userId,
                    category: 'system',
                    title: 'Aviso de Expiración',
                    message: finalMsg
                  }
                });
                logger.info(`[Expiry-Cron] Expiry notification sent for certificate ${cert.id} (Threshold: ${threshold}).`);
              }
            }
          }
        } catch (innerErr) {
          logger.error(`[Expiry-Cron] Failed to process certificate ${cert.id}:`, innerErr);
        }
      }
      logger.info('[Expiry-Cron] Expiry check completed successfully.');
    } catch (err) {
      logger.error('[Expiry-Cron] Error running expiry check:', err);
    }
  }, {
    timezone: "America/Mexico_City"
  });
}
