import { Router } from 'express';
import { getAvailableSlots, getAgendaFilters, createScheduling, getMySchedulings } from '../controllers/agenda-controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/available-slots', authenticate, getAvailableSlots);
router.get('/filters', authenticate, getAgendaFilters);
router.get('/my-turns', authenticate, getMySchedulings);
router.post('/schedule', authenticate, createScheduling);

export default router;
