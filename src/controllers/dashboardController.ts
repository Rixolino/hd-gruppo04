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
        // Ottieni l'ID utente dal token JWT decodificato nell'autenticazione
        const userId = (req as AuthenticatedRequest).user.userId;

        // Recupera i dati completi dell'utente dal database
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            // Invece di mandare solo un messaggio di errore, renderizza una pagina di errore
            return res.render('error', { 
                user: req.user,
                errorMessage: 'Utente non trovato',
                showLogout: true
            });
        }

        // Recupera gli ordini attivi dell'utente
        const activeOrders = await OrderModel.findAll({
            where: { 
                utenteId: userId,
                stato: ['in-attesa', 'pagamento-in-attesa', 'in-lavorazione'] 
            },
            order: [['dataRichiesta', 'DESC']]
        });

        // Recupera gli ordini completati dell'utente
        const completedOrders = await OrderModel.findAll({
            where: { 
                utenteId: userId,
                stato: 'completato' 
            },
            order: [['dataConsegna', 'DESC']],
            limit: 5
        });

        // Passa tutti i dati necessari al template
        res.render('dashboard', {
            user: user,
            activeOrders: activeOrders || [],
            completedOrders: completedOrders || [],
            activeTab: req.query.tab || 'overview'
        });
    } catch (error) {
        console.error('Errore nel caricamento della dashboard:', error);
        // Renderizza la pagina 500.ejs invece di error.ejs
        res.status(500).render('500', { 
            user: req.user || null,
            message: 'Si è verificato un errore durante il caricamento della dashboard.',
            error: process.env.NODE_ENV === 'development' ? error : undefined,
            showLogout: true
        });
    }
};