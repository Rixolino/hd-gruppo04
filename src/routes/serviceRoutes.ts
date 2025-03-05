import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const serviceController = new ServiceController();

router.get('/', authenticate, serviceController.selectService);
router.post('/request', authenticate, serviceController.submitRequest);
router.put('/edit/:id', authenticate, serviceController.editService);

export default router;