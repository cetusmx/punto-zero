import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); prisma.appConfig.findMany().then(console.log).finally(() => prisma.\());
