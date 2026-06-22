import cron from 'node-cron';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import prisma from '../../config/prisma-client.js';

export function initExpiryJob() {
  // Run every day at 1:00 AM CDMX time
  cron.schedule('0 1 * * *', async () => {
    console.log('[Expiry-Cron] Starting expiry check for Exencion certificates...');
    try {
      const activeExenciones = await prisma.certificateQR.findMany({
        where: {
          type: 'Exencion',
          isActive: true
        },
        include: { user: true }
      });

      const todayCdmx = startOfDay(toZonedTime(new Date(), 'America/Mexico_City'));

      for (const cert of activeExenciones) {
        try {
          if (!cert.expiryDate) continue;

          const expiryCdmx = startOfDay(toZonedTime(cert.expiryDate, 'America/Mexico_City'));
          const diffDays = differenceInCalendarDays(expiryCdmx, todayCdmx);

          if (diffDays < 0) {
            await prisma.$transaction([
              prisma.certificateQR.update({
                where: { id: cert.id },
                data: { isActive: false }
              }),
              prisma.notification.create({
                data: {
                  userId: cert.userId,
                  type: 'SYSTEM',
                  title: 'Certificado Expirado',
                  message: 'Tu Certificado de Exención ha expirado. Necesitarás generar uno nuevo cumpliendo los requisitos.'
                }
              })
            ]);
            console.log(`[Expiry-Cron] Certificate ${cert.id} marked as inactive.`);
          } else if (diffDays <= 30) {
            let threshold = null;
            let message = '';

            if (diffDays === 30) {
              threshold = '30d';
              message = 'Tu Certificado de Exención expira en 30 días.';
            } else if (diffDays === 7) {
              threshold = '7d';
              message = 'Tu Certificado de Exención expira en 7 días.';
            } else if (diffDays === 0) {
              threshold = '0d';
              message = 'Tu Certificado de Exención expira hoy.';
            }

            if (threshold) {
              const existingNotif = await prisma.notification.findFirst({
                where: {
                  userId: cert.userId,
                  title: 'Aviso de Expiración',
                  message: { contains: threshold }
                }
              });

              if (!existingNotif) {
                const finalMsg = `${message} Recuerda renovarlo a tiempo. (Aviso: ${threshold})`;
                await prisma.notification.create({
                  data: {
                    userId: cert.userId,
                    type: 'SYSTEM',
                    title: 'Aviso de Expiración',
                    message: finalMsg
                  }
                });
                console.log(`[Expiry-Cron] Expiry notification sent for certificate ${cert.id} (Threshold: ${threshold}).`);
              }
            }
          }
        } catch (innerErr) {
          console.error(`[Expiry-Cron] Failed to process certificate ${cert.id}:`, innerErr);
        }
      }
      console.log('[Expiry-Cron] Expiry check completed successfully.');
    } catch (err) {
      console.error('[Expiry-Cron] Error running expiry check:', err);
    }
  }, {
    timezone: 'America/Mexico_City'
  });
}
