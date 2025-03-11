import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const serviceController = new ServiceController();

// Route pubbliche
router.get('/', serviceController.selectService);
router.get('/dashboard/services', authenticate, serviceController.getServicesForDashboard);
router.get('/:id', serviceController.getServiceById);

// Route protette (richiedono autenticazione)
router.get('/request/:id', authenticate, serviceController.requestService);
router.post('/create', authenticate, serviceController.createService);
router.put('/edit/:id', authenticate, serviceController.editService);
router.delete('/delete/:id', authenticate, serviceController.deleteService);

export default router;