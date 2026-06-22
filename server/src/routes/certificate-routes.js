import { Router } from 'express';
import { requireAuth } from '../middleware/auth-middleware.js';
import { getCertificates, claimExencion, claimReconocimiento } from '../controllers/certificate-controller.js';

const router = Router();

router.get('/', requireAuth, getCertificates);
router.post('/claim-exencion', requireAuth, claimExencion);
router.post('/claim-reconocimiento', requireAuth, claimReconocimiento);

export default router;
