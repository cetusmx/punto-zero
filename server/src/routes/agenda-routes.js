import { Router } from 'express';
import { getAvailableSlots, getAgendaFilters, createScheduling } from '../controllers/agenda-controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/available-slots', authenticate, getAvailableSlots);
router.get('/filters', authenticate, getAgendaFilters);
router.post('/schedule', authenticate, createScheduling);

export default router;
