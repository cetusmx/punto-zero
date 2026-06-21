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
import {
  listUsers,
  updateUserProfile,
  blockUser
} from '../controllers/admin-users-controller.js';
import {
  getAdministrators,
  getEligibleUsers,
  promoteToAdmin,
  demoteToVolunteer,
  toggleAdminBlock
} from '../controllers/superadmin-controller.js';
import { authenticate, authorizeAdmin, authorizeSuperAdmin } from '../../middleware/auth.js';

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
// Users Management
router.get('/users', authenticate, authorizeAdmin, listUsers);
router.put('/users/:id', authenticate, authorizeAdmin, updateUserProfile);
router.post('/users/:id/block', authenticate, authorizeAdmin, blockUser);

// Superadmin Routes
router.get('/administrators', authenticate, authorizeSuperAdmin, getAdministrators);
router.get('/administrators/eligible-users', authenticate, authorizeSuperAdmin, getEligibleUsers);
router.post('/administrators/:id/promote', authenticate, authorizeSuperAdmin, promoteToAdmin);
router.post('/administrators/:id/demote', authenticate, authorizeSuperAdmin, demoteToVolunteer);
router.post('/administrators/:id/block', authenticate, authorizeSuperAdmin, toggleAdminBlock);

export default router;
