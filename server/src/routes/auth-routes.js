import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, verifyOtpHandler, resendOtp, login } from '../controllers/auth-controller.js';
import { registerRules, verifyOtpRules, resendOtpRules, loginRules } from '../middleware/validate.js';

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: { message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: { message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginRules, loginLimiter, login);
router.post('/register', registerLimiter, registerRules, register);
router.post('/verify-otp', verifyLimiter, verifyOtpRules, verifyOtpHandler);
router.post('/resend-otp', resendLimiter, resendOtpRules, resendOtp);

export default router;
