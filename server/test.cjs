const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const configs = await prisma.appConfig.findMany();
  console.log(configs);
}

check().finally(() => prisma.$disconnect());
