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

    const newCertificate = await prisma.$transaction(async (tx) => {
      // Lock the user row to prevent concurrent claims
      await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

      const progress = await calculateUserProgress(userId);

      if (!progress.isEligible || progress.cycleType !== 'Exencion') {
        throw new Error('No eres elegible para un certificado de Exención en este momento.');
      }

      const issuedAt = new Date();
      const expiresAt = addYears(issuedAt, 1);

      return await tx.certificateQR.create({
        data: {
          userId,
          type: 'Exencion',
          issuedAt,
          expiresAt,
          isActive: true,
          attendancesAtIssuance: progress.totalAttendances
        }
      });
    });

    res.status(201).json({
      message: 'Certificado generado con éxito.',
      certificate: newCertificate
    });
  } catch (err) {
    next(err);
  }
}

export async function claimReconocimiento(req, res, next) {
  try {
    const userId = req.user.id;

    const newCertificate = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

      const progress = await calculateUserProgress(userId);

      if (!progress.isEligible || progress.cycleType !== 'Reconocimiento') {
        throw new Error('No eres elegible para un certificado de Reconocimiento en este momento.');
      }

      const issuedAt = new Date();

      return await tx.certificateQR.create({
        data: {
          userId,
          type: 'Reconocimiento',
          issuedAt,
          expiresAt: null,
          isActive: true,
          attendancesAtIssuance: progress.totalAttendances
        }
      });
    });

    res.status(201).json({
      message: 'Certificado de Reconocimiento generado con éxito.',
      certificate: newCertificate
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllCertificates(req, res, next) {
  try {
    const certificates = await prisma.certificateQR.findMany({
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    res.json(certificates);
  } catch (err) {
    next(err);
  }
}
