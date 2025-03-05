import { Request, Response } from 'express';
import Payment from '../models/paymentModel';

export class PaymentController {
    public async processPayment(req: Request, res: Response): Promise<void> {
        const { amount, serviceId, userId } = req.body;
        const paymentData = { amount, serviceId, userId, status: 'pending' };

        try {
            const payment = await Payment.create(paymentData);
            res.status(200).json({ message: 'Pagamento processato con successo', payment });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ message: 'Errore nel processamento del pagamento', error: err.message });
        }
    }

    public async confirmPayment(req: Request, res: Response): Promise<void> {
        const { paymentId } = req.params;

        try {
            const payment = await Payment.findByPk(paymentId);
            if (payment) {
                await payment.update({ status: 'confirmed' });
                res.status(200).json({ message: 'Pagamento confermato con successo', payment });
            } else {
                res.status(404).json({ message: 'Pagamento non trovato' });
            }
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ message: 'Errore nella conferma del pagamento', error: err.message });
        }
    }
}