import { Router } from 'express';
import {
  getSaturdayTurns,
  updateTurnStatus,
  cancelSaturdayTurn,
  cancelMultipleTurns,
  getEligibleVolunteers,
  assignReplacementTurn,
  getUpcomingTurns
} from '../controllers/admin-agenda-controller.js';
import {
  getCollectionPoints,
  createCollectionPoint,
  updateCollectionPoint,
  getPointExceptions,
  addPointException,
  removePointException
} from '../controllers/collection-points-controller.js';
import { authenticate, authorizeAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/agenda/turns', authenticate, authorizeAdmin, getSaturdayTurns);
router.patch('/agenda/turns/:id/status', authenticate, authorizeAdmin, updateTurnStatus);
router.post('/agenda/turns/:id/cancel', authenticate, authorizeAdmin, cancelSaturdayTurn);
router.post('/agenda/turns/cancel-multiple', authenticate, authorizeAdmin, cancelMultipleTurns);
router.get('/agenda/upcoming-turns', authenticate, authorizeAdmin, getUpcomingTurns);
router.get('/users/eligible-volunteers', authenticate, authorizeAdmin, getEligibleVolunteers);
router.post('/agenda/turns/assign-replacement', authenticate, authorizeAdmin, assignReplacementTurn);

// Collection Points CRUD & Exceptions
router.get('/collection-points', authenticate, authorizeAdmin, getCollectionPoints);
router.post('/collection-points', authenticate, authorizeAdmin, createCollectionPoint);
router.put('/collection-points/:id', authenticate, authorizeAdmin, updateCollectionPoint);
router.get('/collection-points/:id/exceptions', authenticate, authorizeAdmin, getPointExceptions);
router.post('/collection-points/:id/exceptions', authenticate, authorizeAdmin, addPointException);
router.delete('/collection-points/:id/exceptions/:date', authenticate, authorizeAdmin, removePointException);

export default router;
