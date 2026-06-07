import prisma from '../config/prisma-client.js';

export async function getProfile(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, phone: true, email: true,
      gender: true, age: true, esquema: true, residuo: true,
      frecuencia: true, status: true, access: true, role: true,
      createdAt: true,
    },
  });
  if (!user) return res.status(404).json({ error: { message: 'Usuario no encontrado' } });
  res.json(user);
}

export async function updateProfile(req, res) {
  const allowed = ['name', 'email', 'gender', 'age', 'esquema', 'residuo', 'frecuencia', 'status'];
  const data = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return res.status(400).json({ error: { message: 'Email inválido' } });
  }
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: {
      id: true, name: true, phone: true, email: true,
      gender: true, age: true, esquema: true, residuo: true,
      frecuencia: true, status: true, access: true, role: true,
    },
  });
  res.json(user);
}

export async function getWhatsAppLinks(req, res) {
  const configs = await prisma.appConfig.findMany({
    where: { key: { in: ['whatsapp_avisos', 'whatsapp_abierto'] } },
  });
  const links = {};
  for (const c of configs) links[c.key] = c.value;
  res.json({
    avisos: links.whatsapp_avisos || null,
    abierto: links.whatsapp_abierto || null,
  });
}
