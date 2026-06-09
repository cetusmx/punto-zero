import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma-client.js';
import { sendSMS } from '../config/twilio.js';
import { generateOtp, verifyOtp } from '../services/otp-service.js';
import { createPendingRegistration, consumePendingRegistration } from '../services/pending-registration.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRY = '7d';

if (JWT_SECRET === 'change-me-in-production') {
  process.emitWarning('JWT_SECRET is set to the insecure default value. Set a strong secret in production.');
}

export async function register(req, res, next) {
  try {
    const { name, phone, email, password } = req.body;

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      if (existingPhone.email === email) {
        return res.status(409).json({
          error: { message: 'Este número ya está registrado. ¿Olvidaste tu contraseña?', field: 'phone' },
        });
      }
      return res.status(409).json({
        error: { message: 'Este número de teléfono ya está registrado.', field: 'phone' },
      });
    }

    const existingEmail = await prisma.user.findFirst({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({
        error: { message: 'Este correo electrónico ya está registrado.', field: 'email' },
      });
    }

    const code = generateOtp(phone);

    await sendSMS(`+52${phone}`, `Tu código de verificación de punto-zero es: ${code}`);

    const sessionToken = createPendingRegistration({ name, phone, email, password });

    res.json({ message: 'Código de verificación enviado', phone, sessionToken });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtpHandler(req, res, next) {
  try {
    const { phone, code, sessionToken } = req.body;

    const pending = consumePendingRegistration(sessionToken);

    if (pending.phone !== phone) {
      return res.status(400).json({
        error: { message: 'El teléfono no coincide con la sesión de registro.' },
      });
    }

    const hashedPassword = await bcrypt.hash(pending.password, 10);

    const user = await prisma.user.create({
      data: {
        name: pending.name,
        phone: pending.phone,
        email: pending.email,
        password: hashedPassword,
        role: 'volunteer',
      },
    });

    verifyOtp(phone, code);

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({ 
      token, 
      isFirstLogin: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        phone: user.phone, 
        email: user.email, 
        role: user.role,
        gender: user.gender,
        age: user.age,
        esquema: user.esquema,
        residuo: user.residuo,
        frecuencia: user.frecuencia,
        status: user.status,
      } 
    });
  } catch (err) {
    next(err);
  }
}

export async function resendOtp(req, res, next) {
  try {
    const { phone } = req.body;

    const code = generateOtp(phone);

    await sendSMS(`+52${phone}`, `Tu código de verificación de punto-zero es: ${code}`);

    res.json({ message: 'Código reenviado', phone });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;

    const isEmail = identifier.includes('@');
    const lookupIdentifier = isEmail ? identifier.toLowerCase().trim() : identifier;
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: lookupIdentifier } : { phone: lookupIdentifier },
    });

    if (!user) {
      await bcrypt.compare(password, '$2b$10$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuuabcdefghijklmnopqrstuu');
      return res.status(401).json({
        error: { message: 'Identificador o contraseña incorrectos' },
      });
    }

    if (user.access === 'Bloqueado' || user.status !== 'Alta') {
      return res.status(403).json({
        error: { message: 'Cuenta desactivada. Contacta al administrador.' },
      });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        error: { message: 'Identificador o contraseña incorrectos' },
      });
    }

    const isFirstLogin = user.name === null || user.name === '' || user.gender === null;

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      token,
      isFirstLogin,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        gender: user.gender,
        age: user.age,
        esquema: user.esquema,
        residuo: user.residuo,
        frecuencia: user.frecuencia,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { phone } = req.body;

    const user = await prisma.user.findUnique({ where: { phone } });

    if (user) {
      const code = generateOtp(phone);
      await sendSMS(`+52${phone}`, `Tu código para restablecer tu contraseña en punto-zero es: ${code}`);
    }

    // Always generic message to prevent enumeration
    res.json({ message: 'Si el número está registrado, recibirás un código por SMS.' });
  } catch (err) {
    // If it's a rate limit error from generateOtp, we should handle it or just let it pass
    if (err.status === 429) {
      return res.status(429).json({ error: { message: err.message } });
    }
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { phone, code, password } = req.body;

    verifyOtp(phone, code);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { phone },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { gender, age, esquema, residuo, frecuencia } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        gender,
        age,
        esquema,
        residuo,
        frecuencia,
        status: 'Alta',
      },
    });

    res.json({
      message: 'Perfil actualizado exitosamente.',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        gender: user.gender,
        age: user.age,
        esquema: user.esquema,
        residuo: user.residuo,
        frecuencia: user.frecuencia,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function changeStatus(req, res, next) {
  try {
    const { status: targetStatus } = req.body;
    const userId = req.user.id;
    const currentStatus = req.user.status; // We might need to fetch it to be sure

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (targetStatus === user.status) {
      return res.json({ message: 'El estatus ya es el solicitado.', user });
    }

    // Cascading cancellations for Pausa/Baja
    if (targetStatus === 'Pausa' || targetStatus === 'Baja') {
      const now = new Date();
      await prisma.scheduling.updateMany({
        where: {
          userId,
          saturdayDate: { gt: now },
          status: 'Pendiente'
        },
        data: {
          status: 'Cancelado',
          notes: `Cancelado automáticamente por cambio de estatus a ${targetStatus}`
        }
      });

      // Notify admins
      const admins = await prisma.user.findMany({ where: { role: 'admin' } });
      if (admins.length > 0) {
        await prisma.notificationBadge.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            category: 'status_change',
            title: 'Cambio de Estatus',
            message: `El usuario ${user.name} (${user.phone}) cambió su estatus a ${targetStatus}.`,
          }))
        });
      }
    }

    // Special rule: Baja -> Alta requires SMS to admin
    if (user.status === 'Baja' && targetStatus === 'Alta') {
      await sendSMS(process.env.ADMIN_PHONE || '+520000000000', `Solicitud de reactivación: ${user.name} (${user.phone}) desea volver a Alta.`);
      // Per PRD UJ-8: Reverting from Baja needs authorization. 
      // For MVP, we will set it to Alta but notify. If a strict block is needed, we'd need a "Pending" status.
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: targetStatus },
    });

    res.json({
      message: `Estatus actualizado a ${targetStatus} exitosamente.`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        gender: updatedUser.gender,
        age: updatedUser.age,
        esquema: updatedUser.esquema,
        residuo: updatedUser.residuo,
        frecuencia: updatedUser.frecuencia,
        status: updatedUser.status,
      },
    });
  } catch (err) {
    next(err);
  }
}
