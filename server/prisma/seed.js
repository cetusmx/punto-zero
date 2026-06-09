import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_USERS = [
  {
    name: 'Oscar Rodriguez',
    phone: '6182201885',
    email: 'orodriguez@sealmarket.mx',
    password: 'Trof#4102',
    role: 'superadmin',
    status: 'Alta',
    access: 'Habilitado',
  },
  {
    name: 'Rosy Salas',
    phone: '6181772124',
    email: 'rosysalash@gmail.com',
    password: 'rosys#7208',
    role: 'volunteer',
    status: 'Alta',
    access: 'Habilitado',
  },
];

async function main() {
  console.log('[Seed] Starting...');

  for (const user of SEED_USERS) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const result = await prisma.user.upsert({
      where: { phone: user.phone },
      update: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        status: user.status,
        access: user.access,
      },
      create: {
        name: user.name,
        phone: user.phone,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        status: user.status,
        access: user.access,
      },
    });

    console.log(`[Seed] ${result.role}: ${result.name} (${result.phone})`);
  }

  const CONFIGS = [
    { key: 'whatsapp_avisos_url', value: 'https://chat.whatsapp.com/HoxtnWrx9Am5a4ttjLOkaX' },
    { key: 'whatsapp_abierto_url', value: 'https://chat.whatsapp.com/KYD7WsfthcQGt5vmqcK5pER' },
  ];

  for (const config of CONFIGS) {
    await prisma.appConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
    console.log(`[Seed] Config: ${config.key}`);
  }

  console.log('[Seed] Done.');
}

main()
  .catch((e) => {
    console.error('[Seed] Failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
