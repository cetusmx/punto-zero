import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/metrics-controller.js';
import { authenticate, authorizeAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorizeAdmin, getDashboardMetrics);

export default router;
