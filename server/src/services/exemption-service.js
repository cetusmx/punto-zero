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

  // Find all attendances for the user, only "Asistio" or "Falta"
  const attendances = await prisma.attendance.findMany({
    where: {
      userId: parsedUserId,
      status: { in: ['Asistio', 'Falta'] }
    },
    include: {
      scheduling: true
    },
    orderBy: {
      scheduling: {
        saturdayDate: 'asc'
      }
    }
  });

  if (attendances.length === 0) {
    return {
      isActive: true,
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

  for (const att of attendances) {
    const attDate = att.scheduling.saturdayDate;

    if (!currentWindowStart) {
      if (att.status === 'Asistio') {
        currentWindowStart = attDate;
        currentWindowDeadline = addMonths(currentWindowStart, 6);
        currentWindowAttendances = [att];
      }
      // "Conteo desde la PRIMERA ATENCIÓN". Faltas before any attendance do not start a window.
      continue;
    }

    // Window has started
    if (isAfter(attDate, currentWindowDeadline)) {
      // Current attendance is strictly after the deadline.
      // If the user already reached 6 attendances in this window, they keep their eligibility forever
      const attsInWindow = currentWindowAttendances.filter(a => a.status === 'Asistio').length;
      if (attsInWindow >= 6) {
        break; // Stop evaluating, they earned it
      }

      // Otherwise, the current window expired without success. Reset.
      currentWindowStart = null;
      currentWindowDeadline = null;
      currentWindowAttendances = [];

      // If this one is 'Asistio', it starts a new window immediately
      if (att.status === 'Asistio') {
        currentWindowStart = attDate;
        currentWindowDeadline = addMonths(currentWindowStart, 6);
        currentWindowAttendances = [att];
      }
    } else {
      // It is within the window
      currentWindowAttendances.push(att);
    }
  }

  if (!currentWindowStart) {
    return {
      isActive: true,
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

  // Real-time Expiration check:
  // If the current date is past the deadline, and they didn't reach eligibility, the window is reset.
  if (!isEligible && isAfter(new Date(), currentWindowDeadline)) {
    return {
      isActive: true,
      totalAttendances: 0,
      faltas: 0,
      deadline: null,
      remaining: 6,
      isEligible: false
    };
  }

  return {
    isActive: true,
    totalAttendances,
    faltas,
    deadline: currentWindowDeadline,
    remaining,
    isEligible
  };
}
