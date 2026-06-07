import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth-controller.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { message: 'Demasiadas solicitudes, intenta en 15 minutos' } },
});

const router = Router();

router.post('/otp', limiter, auth.requestOtp);
router.post('/register', auth.register);
router.post('/login', limiter, auth.login);
router.post('/forgot-password', limiter, auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);

export default router;
