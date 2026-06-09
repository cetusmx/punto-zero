import { Router } from 'express';
import { getSaturdayTurns, updateTurnStatus } from '../controllers/admin-agenda-controller.js';
import { authenticate, authorizeAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/agenda/turns', authenticate, authorizeAdmin, getSaturdayTurns);
router.patch('/agenda/turns/:id/status', authenticate, authorizeAdmin, updateTurnStatus);

export default router;
