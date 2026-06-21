import { Router } from 'express';
import { getConfig, updateConfig } from '../controllers/config-controller.js';
import { authenticate, authorizeAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getConfig);
router.put('/', authenticate, authorizeAdmin, updateConfig);

export default router;
