import { Router } from 'express';
import { getAvailableSlots, getAgendaFilters, createScheduling, getMySchedulings, cancelScheduling, getProgress } from '../controllers/agenda-controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/available-slots', authenticate, getAvailableSlots);
router.get('/filters', authenticate, getAgendaFilters);
router.get('/my-turns', authenticate, getMySchedulings);
router.get('/progress', authenticate, getProgress);
router.post('/schedule', authenticate, createScheduling);
router.post('/cancel/:id', authenticate, cancelScheduling);

export default router;
