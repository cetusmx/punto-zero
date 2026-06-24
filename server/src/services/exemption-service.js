import prisma from '../../config/prisma-client.js';
import { addMonths, isAfter, isEqual } from 'date-fns';

/**
 * Calculates the current exemption program progress for a user.
 * Modular calculation to make it easy to inject additional reset logic (like 3 faltas) in the future.
 */
export async function calculateUserProgress(userId) {
  const parsedUserId = Number(userId);
  if (isNaN(parsedUserId)) {
    throw new Error('Invalid User ID');
  }

  // Check for activation: Has the user booked any turno and accepted T&C?
  const activationRecord = await prisma.scheduling.findFirst({
    where: { userId: parsedUserId, acceptedTerms: true }
  });

  if (!activationRecord) {
    return { isActive: false, totalAttendances: 0, faltas: 0, deadline: null, remaining: 6, isEligible: false };
  }

  // Find the latest certificate issued to this user
  const latestCertificate = await prisma.certificateQR.findFirst({
    where: { userId: parsedUserId },
    orderBy: { issuedAt: 'desc' }
  });

  let cycleType = 'Exencion';
  let activeExencion = null;
  if (latestCertificate) {
    // Check if the user has an active Exencion
    activeExencion = await prisma.certificateQR.findFirst({
      where: {
        userId: parsedUserId,
        type: 'Exencion',
        isActive: true,
        expiresAt: { gt: new Date() }
      }
    });
    if (activeExencion) {
      cycleType = 'Reconocimiento';
    }
  }

  let periodStartDate = null;
  if (latestCertificate) {
    if (latestCertificate.type === 'Exencion' && latestCertificate.expiresAt && !activeExencion) {
      // The Exencion expired. Only attendances AFTER the expiration date count for the new Exencion.
      periodStartDate = latestCertificate.expiresAt;
    } else {
      // Reconocimientos or Active Exencion. Attendances after the issue date count.
      periodStartDate = latestCertificate.issuedAt;
    }
  }

  const attendanceWhere = {
    userId: parsedUserId,
    status: { in: ['Asistio', 'Falta'] }
  };

  if (periodStartDate) {
    // Start of day ensures we don't omit same-day attendances incorrectly, 
    // but if claimed at the point of collection, we must ensure it strictly is strictly greater.
    // However, scheduling dates are strictly dates without time (or midnight). 
    // To safely include same-day attendances for future, we use the timestamp properly.
    attendanceWhere.saturdayDate = { gt: periodStartDate };
  }

  // Find all valid attendances
  const attendances = await prisma.scheduling.findMany({
    where: attendanceWhere,
    orderBy: [
      { saturdayDate: 'asc' },
      { id: 'asc' }
    ]
  });

  if (attendances.length === 0) {
    return {
      isActive: true,
      cycleType,
      totalAttendances: 0,
      faltas: 0,
      deadline: null,
      remaining: 6,
      isEligible: false
    };
  }

  let currentWindowStart = null;
  let currentWindowAttendances = [];
  let currentWindowDeadline = null;
  let faltasInWindow = 0;

  for (const att of attendances) {
    const attDate = att.saturdayDate;

    if (!currentWindowStart) {
      if (att.status === 'Asistio') {
        currentWindowStart = attDate;
        currentWindowDeadline = addMonths(currentWindowStart, 6);
        currentWindowAttendances = [att];
        faltasInWindow = 0;
      }
      continue;
    }

    if (isAfter(attDate, currentWindowDeadline)) {
      const attsInWindow = currentWindowAttendances.filter(a => a.status === 'Asistio').length;
      if (attsInWindow >= 6) {
        break; // The window closed and they earned it. Future attendances are frozen until claim.
      }

      currentWindowStart = null;
      currentWindowDeadline = null;
      currentWindowAttendances = [];
      faltasInWindow = 0;

      if (att.status === 'Asistio') {
        currentWindowStart = attDate;
        currentWindowDeadline = addMonths(currentWindowStart, 6);
        currentWindowAttendances = [att];
        faltasInWindow = 0;
      }
    } else {
      currentWindowAttendances.push(att);

      if (att.status === 'Falta') {
        faltasInWindow++;
        if (faltasInWindow >= 3) {
          currentWindowStart = null;
          currentWindowDeadline = null;
          currentWindowAttendances = [];
          faltasInWindow = 0;
        }
      }
    }
  }

  if (!currentWindowStart) {
    return {
      isActive: true,
      cycleType,
      totalAttendances: 0,
      faltas: 0,
      deadline: null,
      remaining: 6,
      isEligible: false
    };
  }

  let totalAttendances = 0;
  let faltas = 0;

  for (const att of currentWindowAttendances) {
    if (att.status === 'Asistio') totalAttendances++;
    if (att.status === 'Falta') faltas++;
  }

  let isEligible = totalAttendances >= 6;
  const remaining = Math.max(0, 6 - totalAttendances);

  if (!isEligible && isAfter(new Date(), currentWindowDeadline)) {
    return {
      isActive: true,
      cycleType,
      totalAttendances: 0,
      faltas: 0,
      deadline: null,
      remaining: 6,
      isEligible: false
    };
  }

  return {
    isActive: true,
    cycleType,
    totalAttendances,
    faltas,
    deadline: currentWindowDeadline,
    remaining,
    isEligible
  };
}

/**
 * Checks if the user is eligible for a certificate and automatically generates it.
 * Notifies the user via NotificationBadge.
 */
export async function checkAndAutoGenerateCertificate(userId) {
  try {
    const parsedUserId = Number(userId);
    const progress = await calculateUserProgress(parsedUserId);

    if (!progress.isEligible) {
      return null;
    }

    // Wrap the generation in a transaction
    return await prisma.$transaction(async (tx) => {
      // Lock the user row to prevent concurrent generations
      await tx.$executeRaw`SELECT id FROM users WHERE id = ${parsedUserId} FOR UPDATE`;

      // Re-check progress inside lock to guarantee safety
      const lockedProgress = await calculateUserProgress(parsedUserId);
      if (!lockedProgress.isEligible) {
        return null;
      }

      const issuedAt = new Date();
      let expiresAt = null;

      if (lockedProgress.cycleType === 'Exencion') {
        const { addYears } = await import('date-fns');
        expiresAt = addYears(issuedAt, 1);
      }

      const certificate = await tx.certificateQR.create({
        data: {
          userId: parsedUserId,
          type: lockedProgress.cycleType,
          issuedAt,
          expiresAt,
          isActive: true,
          attendancesAtIssuance: lockedProgress.totalAttendances
        }
      });

      // Send a notification badge
      await tx.notificationBadge.create({
        data: {
          userId: parsedUserId,
          category: 'system',
          title: `¡Certificado de ${lockedProgress.cycleType} Generado!`,
          message: `Has completado 6 asistencias exitosamente. Tu código QR ha sido emitido de forma automática y ya puedes visualizarlo en tu perfil.`
        }
      });

      return certificate;
    });
  } catch (error) {
    console.error(`Failed to auto-generate certificate for user ${userId}:`, error);
    return null;
  }
}
