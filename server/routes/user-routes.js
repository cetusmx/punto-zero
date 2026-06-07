import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as user from '../controllers/user-controller.js';

const router = Router();

router.get('/profile', authenticate, user.getProfile);
router.put('/profile', authenticate, user.updateProfile);
router.get('/whatsapp-links', authenticate, user.getWhatsAppLinks);

export default router;
