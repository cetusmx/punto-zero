import { Router } from 'express';
import { getConfig, updateConfig, testSmsConfig } from '../controllers/config-controller.js';
import { authenticate, authorizeAdmin } from '../../middleware/auth.js';

const router = Router();

// Config routes
router.get('/', authenticate, getConfig);
router.put('/', authenticate, authorizeAdmin, updateConfig);
router.post('/test-sms', authenticate, authorizeAdmin, testSmsConfig);

export default router;
