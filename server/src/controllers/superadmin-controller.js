import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdministrators = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'superadmin'] } },
      select: { id: true, name: true, email: true, phone: true, role: true, access: true }
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: { message: 'Error al obtener administradores.' } });
  }
};

export const getEligibleUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const whereClause = { role: 'volunteer' };
    
    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      take: 20, // AC performance fix
      select: { id: true, name: true, email: true, phone: true, role: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: { message: 'Error al obtener usuarios elegibles.' } });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: { message: 'ID de usuario inválido.' } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'volunteer') {
      return res.status(400).json({ error: { message: 'Usuario no elegible para promoción.' } });
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'admin' }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: { message: 'Error al promover usuario.' } });
  }
};

export const demoteToVolunteer = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: { message: 'ID de usuario inválido.' } });
    if (req.user.id === userId) {
      return res.status(403).json({ error: { message: 'No puedes degradarte a ti mismo.' } }); // Security Guardrail
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(400).json({ error: { message: 'Usuario no es administrador.' } });
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'volunteer' }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: { message: 'Error al degradar administrador.' } });
  }
};

export const toggleAdminBlock = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: { message: 'ID de usuario inválido.' } });
    const { action } = req.body;
    if (req.user.id === userId) {
      return res.status(403).json({ error: { message: 'No puedes bloquearte o desbloquearte a ti mismo.' } }); // Security Guardrail
    }
    if (action !== 'block' && action !== 'unblock') {
      return res.status(400).json({ error: { message: 'Acción inválida.' } });
    }
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(400).json({ error: { message: 'Usuario no es administrador.' } });
    }
    
    const newAccess = action === 'block' ? 'Bloqueado' : 'Habilitado';
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { access: newAccess }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: { message: 'Error al modificar acceso del administrador.' } });
  }
};
