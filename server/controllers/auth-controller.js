import bcrypt from 'bcryptjs';
import prisma from '../config/prisma-client.js';
import { generateToken } from '../middleware/auth.js';
import { createOtp, verifyOtp } from '../services/otp-service.js';
import { sendSms } from '../services/twilio-service.js';

export async function requestOtp(req, res) {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: { message: 'Teléfono requerido' } });
  const result = createOtp(phone);
  if (!result.ok) {
    return res.status(429).json({ error: { message: `Espera ${result.remaining}s para reenviar` } });
  }
  await sendSms(phone, `Tu código punto-zero es: ${result.code}`);
  res.json({ ok: true });
}

export async function register(req, res) {
  const { phone, code, password } = req.body;
  if (!phone || !code || !password) {
    return res.status(400).json({ error: { message: 'Teléfono, código y contraseña requeridos' } });
  }
  if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return res.status(400).json({ error: { message: 'Contraseña: mínimo 8 caracteres y 1 especial' } });
  }
  const otpCheck = verifyOtp(phone, code);
  if (!otpCheck.ok) {
    const messages = {
      no_otp: 'Solicita un código primero',
      expired: 'Código expirado, solicita uno nuevo',
      max_attempts: 'Demasiados intentos, solicita un nuevo código',
      invalid: `Código incorrecto (${otpCheck.attemptsLeft} intentos restantes)`,
    };
    return res.status(400).json({ error: { message: messages[otpCheck.reason] || 'Código inválido' } });
  }
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return res.status(409).json({ error: { message: 'Este teléfono ya está registrado' } });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { phone, password: hashed },
  });
  const token = generateToken(user);
  res.status(201).json({ token, isFirstLogin: true });
}

export async function login(req, res) {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: { message: 'Teléfono y contraseña requeridos' } });
  }
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return res.status(401).json({ error: { message: 'Credenciales inválidas' } });
  }
  if (user.access === 'Bloqueado') {
    return res.status(403).json({ error: { message: 'Cuenta bloqueada, contacta al administrador' } });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: { message: 'Credenciales inválidas' } });
  }
  const token = generateToken(user);
  const isFirstLogin = !user.name;
  res.json({ token, isFirstLogin });
}

export async function forgotPassword(req, res) {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: { message: 'Teléfono requerido' } });
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return res.status(404).json({ error: { message: 'Teléfono no registrado' } });
  }
  const result = createOtp(phone);
  if (!result.ok) {
    return res.status(429).json({ error: { message: `Espera ${result.remaining}s para reenviar` } });
  }
  await sendSms(phone, `Tu código de recuperación punto-zero es: ${result.code}`);
  res.json({ ok: true });
}

export async function resetPassword(req, res) {
  const { phone, code, password } = req.body;
  if (!phone || !code || !password) {
    return res.status(400).json({ error: { message: 'Teléfono, código y nueva contraseña requeridos' } });
  }
  if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return res.status(400).json({ error: { message: 'Contraseña: mínimo 8 caracteres y 1 especial' } });
  }
  const otpCheck = verifyOtp(phone, code);
  if (!otpCheck.ok) {
    const messages = {
      no_otp: 'Solicita un código primero',
      expired: 'Código expirado',
      max_attempts: 'Demasiados intentos',
      invalid: `Código incorrecto (${otpCheck.attemptsLeft} intentos restantes)`,
    };
    return res.status(400).json({ error: { message: messages[otpCheck.reason] || 'Código inválido' } });
  }
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { phone },
    data: { password: hashed },
  });
  res.json({ ok: true });
}
