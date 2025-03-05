import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const paymentController = new PaymentController();

router.post('/process', authenticate, paymentController.processPayment);
router.post('/confirm/:paymentId', authenticate, paymentController.confirmPayment);

export default router;