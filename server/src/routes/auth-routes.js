import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, verifyOtpHandler, resendOtp, login, forgotPassword, resetPassword, updateProfile } from '../controllers/auth-controller.js';
import { registerRules, verifyOtpRules, resendOtpRules, loginRules, forgotPasswordRules, resetPasswordRules, updateProfileRules } from '../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';

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

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: { message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginRules, loginLimiter, login);
router.post('/register', registerLimiter, registerRules, register);
router.post('/verify-otp', verifyLimiter, verifyOtpRules, verifyOtpHandler);
router.post('/resend-otp', resendLimiter, resendOtpRules, resendOtp);
router.post('/forgot-password', forgotPasswordRules, forgotLimiter, forgotPassword);
router.post('/reset-password', resetPasswordRules, resetLimiter, resetPassword);
router.put('/profile', authenticate, updateProfileRules, updateProfile);

export default router;
