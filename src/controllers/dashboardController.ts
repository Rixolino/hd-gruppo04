import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/userModel';
import OrderModel from '../models/orderModel';
import jwt from 'jsonwebtoken';

interface UserJwtPayload {
    userId: number;
    nome: string;
    cognome: string;
    isAdmin: boolean;
    puntifedelta: number;
}

interface AuthenticatedRequest extends Request {
    user: UserJwtPayload;
}

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user.userId;

        const attributes = ['id', 'utenteId', 'servizio', 'stato', 'dataRichiesta', 
                            'dataConsegna', 'prezzo', 'progressoLavoro', 'createdAt', 'updatedAt'];

        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            return res.render('error', { 
                user: req.user,
                errorMessage: 'Utente non trovato',
                showLogout: true
            });
        }

        const activeOrders = await OrderModel.findAll({
            attributes: attributes,
            where: { 
                utenteId: userId,
                stato: ['in-attesa', 'pagamento-in-attesa', 'in-lavorazione'] 
            },
            order: [['dataRichiesta', 'DESC']]
        });

        const completedOrders = await OrderModel.findAll({
            attributes: attributes,
            where: { 
                utenteId: userId,
                stato: 'completato' 
            },
            order: [['dataConsegna', 'DESC']],
            limit: 5
        });

        res.render('dashboard', {
            user: user,
            activeOrders: activeOrders || [],
            completedOrders: completedOrders || [],
            activeTab: req.query.tab || 'overview'
        });
    } catch (error) {
        console.error('Errore nel caricamento della dashboard:', error);
        res.status(500).render('500', { 
            user: req.user || null,
            message: 'Si è verificato un errore durante il caricamento della dashboard.',
            error: process.env.NODE_ENV === 'development' ? error : undefined,
            showLogout: true
        });
    }
};