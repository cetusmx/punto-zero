import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const configs = await prisma.appConfig.findMany();
console.log(configs);
prisma.$disconnect();
