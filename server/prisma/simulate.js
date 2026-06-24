import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { subWeeks, startOfWeek, setDay, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('[Simulate] Iniciando script de simulación...');

  // 1. Crear Puntos de Acopio temporales para asignar los turnos sin colisionar
  let point1 = await prisma.collectionPoint.findFirst({ where: { name: 'Punto Cero Simulado 1' } });
  if (!point1) {
    point1 = await prisma.collectionPoint.create({
      data: { name: 'Punto Cero Simulado 1', colonia: 'Simulada', status: 'Activo' }
    });
  }

  let point2 = await prisma.collectionPoint.findFirst({ where: { name: 'Punto Cero Simulado 2' } });
  if (!point2) {
    point2 = await prisma.collectionPoint.create({
      data: { name: 'Punto Cero Simulado 2', colonia: 'Simulada', status: 'Activo' }
    });
  }

  // Contraseña por defecto para ambos usuarios
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Crear Voluntario Perfecto (6 Asistencias)
  const userPerfecto = await prisma.user.upsert({
    where: { phone: '1111111111' },
    update: {},
    create: {
      name: 'Voluntario Perfecto',
      phone: '1111111111',
      password: hashedPassword,
      role: 'volunteer',
      status: 'Alta',
      gender: 'Otro',
      age: '30-39'
    }
  });

  // 3. Crear Voluntario Faltista (3 Asistencias, 3 Faltas)
  const userFaltista = await prisma.user.upsert({
    where: { phone: '2222222222' },
    update: {},
    create: {
      name: 'Voluntario Faltista',
      phone: '2222222222',
      password: hashedPassword,
      role: 'volunteer',
      status: 'Alta',
      gender: 'Otro',
      age: '30-39'
    }
  });

  console.log('[Simulate] Usuarios de prueba creados.');

  // 4. Generar fechas para las últimas 6 semanas (Sábados a las 9 AM)
  const today = new Date();
  const pastSaturdays = [];
  for (let i = 6; i >= 1; i--) {
    const pastDate = subWeeks(today, i);
    // Asegurarnos de que sea sábado
    const saturday = setDay(pastDate, 6, { weekStartsOn: 1 });
    saturday.setHours(9, 0, 0, 0);
    pastSaturdays.push(saturday);
  }

  // Función auxiliar para crear la reserva y la asistencia
  async function createAttendanceRecord(user, point, date, status) {
    // Buscar si ya existe una reserva para evitar errores de duplicado
    let scheduling = await prisma.scheduling.findFirst({
      where: { userId: user.id, saturdayDate: date }
    });

    if (!scheduling) {
      scheduling = await prisma.scheduling.create({
        data: {
          userId: user.id,
          pointId: point.id,
          saturdayDate: date,
          status: status,
          acceptedTerms: true
        }
      });
    } else {
      // Actualizar el estado por si ya existía
      scheduling = await prisma.scheduling.update({
        where: { id: scheduling.id },
        data: { status: status }
      });
    }

    // Crear el registro de asistencia en 'Attendance'
    const existingLog = await prisma.attendance.findUnique({
      where: { schedulingId: scheduling.id }
    });

    if (!existingLog) {
      await prisma.attendance.create({
        data: {
          schedulingId: scheduling.id,
          userId: user.id,
          status: status,
          notes: 'Simulado por script'
        }
      });
    }
  }

  console.log('[Simulate] Generando 6 semanas de historial...');

  // 5. Inyectar historial para Voluntario Perfecto (Todos "Asistio")
  for (const date of pastSaturdays) {
    await createAttendanceRecord(userPerfecto, point1, date, 'Asistio');
  }

  // 6. Inyectar historial para Voluntario Faltista (Alternando "Asistio" y "Falta")
  // 3 Asistencias y 3 Faltas
  const statuses = ['Asistio', 'Falta', 'Asistio', 'Falta', 'Asistio', 'Falta'];
  for (let i = 0; i < 6; i++) {
    await createAttendanceRecord(userFaltista, point2, pastSaturdays[i], statuses[i]);
  }

  console.log('\n--- SIMULACIÓN COMPLETADA ---');
  console.log('Puedes iniciar sesión con los siguientes usuarios para probar:');
  console.log('\n✅ Voluntario Perfecto (6 Asistencias, 0 Faltas)');
  console.log('   Teléfono: 1111111111');
  console.log('   Contraseña: password123');
  
  console.log('\n⚠️ Voluntario Faltista (3 Asistencias, 3 Faltas)');
  console.log('   Teléfono: 2222222222');
  console.log('   Contraseña: password123');
  console.log('\nNota: Si quieres que el servidor verifique automáticamente los certificados y vencimientos, puedes ejecutar en otra terminal: node server/src/jobs/attendance-cron.js (o esperar a que el cron corra de forma natural).');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
