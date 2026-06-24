import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listUsers(req, res, next) {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    let whereClause = { role: 'volunteer' };

    if (q) {
      const isStatusOrAccess = ['Alta', 'Pausa', 'Baja', 'Habilitado', 'Bloqueado'].includes(q);

      whereClause.AND = [
        {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } }
          ]
        }
      ];

      const qLower = q.toLowerCase();
      const statusMatch = ['Alta', 'Pausa', 'Baja'].find(s => s.toLowerCase() === qLower);
      const accessMatch = ['Habilitado', 'Bloqueado'].find(s => s.toLowerCase() === qLower);
      
      if (statusMatch) whereClause.AND[0].OR.push({ status: statusMatch });
      if (accessMatch) whereClause.AND[0].OR.push({ access: accessMatch });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          status: true,
          access: true,
          createdAt: true,
          gender: true,
          age: true,
          esquema: true,
          residuo: true,
          frecuencia: true,
          _count: {
            select: {
              schedulings: {
                where: {
                  status: 'Pendiente',
                  saturdayDate: { gte: today }
                }
              }
            }
          }
        }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const data = users.map(u => {
      const mapped = { 
        ...u, 
        scheme: u.esquema, 
        residueType: u.residuo, 
        frequency: u.frecuencia, 
        futureSchedulingsCount: u._count.schedulings 
      };
      delete mapped.esquema;
      delete mapped.residuo;
      delete mapped.frecuencia;
      delete mapped._count;
      return mapped;
    });

    res.json({ data, totalCount, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
}

export async function updateUserProfile(req, res, next) {
  try {
    const { id } = req.params;
    // Strip name, phone, email from the body
    const { gender, age, scheme, frequency, status } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        gender,
        age,
        esquema: scheme,
        frecuencia: frequency,
        status
      }
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function blockUser(req, res, next) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'block' or 'unblock'

    const userId = parseInt(id);

    if (action === 'unblock') {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { access: 'Habilitado' }
      });
      return res.json(user);
    }

    if (action === 'block') {
      const result = await prisma.$transaction(async (tx) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await tx.scheduling.updateMany({
          where: {
            userId,
            saturdayDate: { gte: today },
            status: 'Pendiente'
          },
          data: {
            status: 'Cancelado',
            cancellationType: 'Admin',
            cancelledAt: new Date()
          }
        });

        const user = await tx.user.update({
          where: { id: userId },
          data: { access: 'Bloqueado' }
        });

        return user;
      });

      return res.json(result);
    }

    res.status(400).json({ error: { message: 'Action not allowed' } });
  } catch (err) {
    next(err);
  }
}
