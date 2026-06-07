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

    res.json({ token, isFirstLogin: true, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role } });
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
