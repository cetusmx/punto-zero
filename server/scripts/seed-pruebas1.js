import prisma from '../config/prisma-client.js';
import bcrypt from 'bcryptjs';
import { checkAndAutoGenerateCertificate } from '../src/services/exemption-service.js';

const USERS = {
  'Irregular': { name: 'Usuario irregular', phone: '3333333333', email: 'irre@test.com' },
  'Antiguo': { name: 'Usuario Antiguo', phone: '4444444444', email: 'ant@test.com' },
  'Comprometido': { name: 'Usuario Comprometido', phone: '5555555555', email: 'comp@test.com' }
};

const POINTS = [
  { id: 1, name: 'Parque Jardines de la Hacienda', colonia: 'Jardines de la Hacienda' },
  { id: 2, name: 'Punto Cero Simulado 1', colonia: 'Simulada 1' },
  { id: 3, name: 'Punto Cero Simulado 2', colonia: 'Simulada 2' },
];

const RECORDS = [
  // Antiguo (Point 1)
  { date: '2023-01-07', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-01-21', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-02-11', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-03-11', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-04-08', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-05-06', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-06-10', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-07-08', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-08-05', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-09-16', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-10-07', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-11-18', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2023-12-16', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-01-06', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-02-14', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-03-16', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-04-06', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-05-11', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-06-01', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-07-13', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-08-10', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-09-14', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-10-05', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-11-09', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2024-12-14', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2025-01-04', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2025-02-08', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2025-03-08', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2025-04-05', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2025-05-10', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2025-06-14', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2025-07-12', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2025-08-23', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2025-09-27', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2025-11-01', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2025-12-06', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2026-01-03', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2026-02-07', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2026-02-28', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2026-03-21', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2026-04-18', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2026-05-02', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2026-05-16', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2026-06-13', u: 'Antiguo', st: 'Asistió', pt: 1 },
  { date: '2026-06-27', u: 'Antiguo', st: 'Asistió', pt: 1 },
  
  // Comprometido
  { date: '2025-09-06', u: 'Comprometido', st: 'Asistió', pt: 1 },
  { date: '2025-10-11', u: 'Comprometido', st: 'Asistió', pt: 1 },
  { date: '2025-11-22', u: 'Comprometido', st: 'Asistió', pt: 1 },
  { date: '2025-12-13', u: 'Comprometido', st: 'Asistió', pt: 1 },
  { date: '2026-01-17', u: 'Comprometido', st: 'Asistió', pt: 2 },
  { date: '2026-02-28', u: 'Comprometido', st: 'Asistió', pt: 2 },
  { date: '2026-03-21', u: 'Comprometido', st: 'Asistió', pt: 2 },
  { date: '2026-04-18', u: 'Comprometido', st: 'Asistió', pt: 2 },
  { date: '2026-05-16', u: 'Comprometido', st: 'Asistió', pt: 2 },
  { date: '2026-06-13', u: 'Comprometido', st: 'Asistió', pt: 2 },
  { date: '2026-06-27', u: 'Comprometido', st: 'Asistió', pt: 2 },

  // Irregular
  { date: '2024-07-27', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2024-08-10', u: 'Irregular', st: 'Falta', pt: 3 },
  { date: '2024-09-14', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2024-10-05', u: 'Irregular', st: 'Falta', pt: 3 },
  { date: '2024-10-26', u: 'Irregular', st: 'Asistió', pt: 1 },
  { date: '2024-12-14', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2025-01-25', u: 'Irregular', st: 'Asistió', pt: 2 },
  { date: '2025-02-22', u: 'Irregular', st: 'Asistió', pt: 2 },
  { date: '2025-03-08', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2025-04-05', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2025-05-31', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2025-07-12', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2025-08-09', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2025-08-23', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2025-09-27', u: 'Irregular', st: 'Asistió', pt: 2 },
  { date: '2025-11-01', u: 'Irregular', st: 'Asistió', pt: 2 },
  { date: '2025-12-13', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2026-01-17', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2026-02-28', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2026-03-21', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2026-04-18', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2026-05-02', u: 'Irregular', st: 'Asistió', pt: 2 },
  { date: '2026-06-13', u: 'Irregular', st: 'Asistió', pt: 3 },
  { date: '2026-06-27', u: 'Irregular', st: 'Asistió', pt: 3 },
];

async function seed() {
  console.log('Starting seed Pruebas1...');

  const hashedPassword = await bcrypt.hash('password123', 10);
  const dbUsers = {};

  for (const [key, userData] of Object.entries(USERS)) {
    // Clean up if exists
    const existing = await prisma.user.findUnique({ where: { phone: userData.phone } });
    if (existing) {
      await prisma.attendance.deleteMany({ where: { userId: existing.id } });
      await prisma.scheduling.deleteMany({ where: { userId: existing.id } });
      await prisma.certificateQR.deleteMany({ where: { userId: existing.id } });
      await prisma.notificationBadge.deleteMany({ where: { userId: existing.id } });
      await prisma.user.delete({ where: { id: existing.id } });
    }

    const created = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: 'volunteer',
        gender: 'Otro',
        age: '20-29',
        esquema: 'Puntos de Acopio',
        residuo: 'Todos',
        frecuencia: 'Mensual',
        status: 'Alta'
      }
    });
    dbUsers[key] = created.id;
    console.log(`Created user ${key} with ID ${created.id}`);
  }

  const dbPoints = {};
  for (const p of POINTS) {
    const point = await prisma.collectionPoint.upsert({
      where: { id: p.id },
      update: { name: p.name, colonia: p.colonia, status: 'Activo' },
      create: { id: p.id, name: p.name, colonia: p.colonia, status: 'Activo' }
    });
    dbPoints[p.id] = point.id;
    console.log(`Ensured point ${p.id} exists`);
  }

  // Insert records chronologically per user to allow checkAndAutoGenerateCertificate to work iteratively
  for (const [key, userId] of Object.entries(dbUsers)) {
    console.log(`Processing attendances for ${key}...`);
    const userRecords = RECORDS.filter(r => r.u === key).sort((a, b) => new Date(a.date) - new Date(b.date));

    for (const r of userRecords) {
      const parsedDate = new Date(`${r.date}T12:00:00Z`); // Normalize to 12 PM UTC
      
      const scheduling = await prisma.scheduling.create({
        data: {
          userId,
          pointId: dbPoints[r.pt],
          saturdayDate: parsedDate,
          status: r.st,
          acceptedTerms: true
        }
      });

      await prisma.attendance.create({
        data: {
          schedulingId: scheduling.id,
          userId,
          status: r.st,
          notes: 'Pruebas1 Seed'
        }
      });

      // Run auto-generation iteratively after each attendance to accurately simulate history
      if (r.st === 'Asistió') {
        const cert = await checkAndAutoGenerateCertificate(userId);
        if (cert) {
          console.log(`--> Generated ${cert.type} certificate for ${key} at ${r.date}`);
          
          // The auto-generator issues the certificate with 'issuedAt: new Date()'. 
          // We MUST override the issuedAt and expiresAt dates to match the historical timeline!
          const { addYears } = await import('date-fns');
          const issueDate = new Date(`${r.date}T12:00:00Z`);
          // Add 1 day to correctly match the rule (Certificate issued 1 day after the 6th attendance)
          issueDate.setDate(issueDate.getDate() + 1);

          let expiresAt = cert.type === 'Exencion' ? addYears(issueDate, 1) : addYears(issueDate, 100);

          await prisma.certificateQR.update({
            where: { id: cert.id },
            data: { issuedAt: issueDate, expiresAt }
          });
        }
      }
    }
  }

  console.log('Seed Pruebas1 completed!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
