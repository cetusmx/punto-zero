import prisma from '../../config/prisma-client.js';
import { calculateUserProgress } from '../services/exemption-service.js';
import { addYears } from 'date-fns';

export async function getCertificates(req, res, next) {
  try {
    const userId = req.user.id;

    const certificates = await prisma.certificateQR.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' }
    });

    res.json(certificates);
  } catch (err) {
    next(err);
  }
}

export async function claimExencion(req, res, next) {
  try {
    const userId = req.user.id;

    const progress = await calculateUserProgress(userId);

    // The backend single source of truth for eligibility
    if (!progress.isEligible) {
      return res.status(400).json({ 
        error: { message: 'Aún no cuentas con la asistencia necesaria en el periodo actual para solicitar tu exención.' } 
      });
    }

    const activeExencion = await prisma.certificateQR.findFirst({
      where: {
        userId,
        type: 'Exencion',
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (activeExencion) {
      return res.status(400).json({ 
        error: { message: 'Ya cuentas con un certificado de Exención activo.' } 
      });
    }

    const issuedAt = new Date();
    const expiresAt = addYears(issuedAt, 1);

    const newCertificate = await prisma.certificateQR.create({
      data: {
        userId,
        type: 'Exencion',
        issuedAt,
        expiresAt,
        isActive: true,
        attendancesAtIssuance: progress.totalAttendances
      }
    });

    res.status(201).json({
      message: 'Certificado generado con éxito.',
      certificate: newCertificate
    });
  } catch (err) {
    next(err);
  }
}
