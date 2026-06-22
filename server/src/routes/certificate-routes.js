import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { getCertificates, claimExencion, claimReconocimiento } from '../controllers/certificate-controller.js';

const router = Router();

router.get('/', authenticate, getCertificates);
router.post('/claim-exencion', authenticate, claimExencion);
router.post('/claim-reconocimiento', authenticate, claimReconocimiento);

export default router;
