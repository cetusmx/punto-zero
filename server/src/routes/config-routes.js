import { Router } from 'express';
import { getWhatsAppLinks } from '../controllers/config-controller.js';

const router = Router();

router.get('/whatsapp-links', getWhatsAppLinks);

export default router;
