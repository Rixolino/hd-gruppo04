import { Request, Response } from 'express';
import UserModel from '../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Definisci l'interfaccia per l'utente nei JWT
interface UserJwtPayload {
  userId: number;
  nome: string;
  cognome: string;
  isAdmin: boolean;
  puntifedelta: number;
}

// Estendi Request con una proprietà user
interface AuthenticatedRequest extends Request {
  user: UserJwtPayload;
}

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        // Usa l'asserzione di tipo per accedere a req.user
        const userId = (req as AuthenticatedRequest).user.userId;
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            res.status(404).send('Utente non trovato');
            return;
        }
        
        res.render('profile', { user });
    } catch (error) {
        console.error('Errore nel recupero del profilo:', error);
        res.status(500).send('Errore nel caricamento del profilo');
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user.userId;
        const { nome, cognome, telefono, indirizzo, email } = req.body;
        
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            res.status(404).send('Utente non trovato');
            return;
        }
        
        // Verifica se l'email è già utilizzata da un altro utente
        if (email !== user.email) {
            const existingUser = await UserModel.findOne({ where: { email } });
            if (existingUser) {
                res.render('profile', { 
                    user,
                    errorMessage: 'Email già utilizzata da un altro utente'
                });
                return;
            }
        }
        
        await user.update({
            nome,
            cognome,
            email,  // Aggiungi l'email all'update
            telefono: telefono || null,
            indirizzo: indirizzo || null
        });
        
        const token = jwt.sign(
            { 
                userId: user.id,
                nome: user.nome,
                cognome: user.cognome,
                isAdmin: user.isAdmin,
                puntifedelta: user.puntifedelta
            }, 
            process.env.JWT_SECRET!, 
            { expiresIn: '1h' }
        );
        
        res.cookie('token', token, { httpOnly: false });
        
        res.render('profile', { 
            user,
            successMessage: 'Profilo aggiornato con successo!'
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento del profilo:', error);
        res.status(500).render('profile', { 
            user: (req as AuthenticatedRequest).user,
            errorMessage: 'Errore nell\'aggiornamento del profilo'
        });
    }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user.userId;
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        if (newPassword !== confirmPassword) {
            res.render('profile', { 
                user: (req as AuthenticatedRequest).user,
                errorMessage: 'Le password non corrispondono'
            });
            return;
        }
        
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            res.status(404).send('Utente non trovato');
            return;
        }
        
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isPasswordValid) {
            res.render('profile', { 
                user,
                errorMessage: 'Password attuale non corretta'
            });
            return;
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await user.update({ password: hashedPassword });
        
        res.render('profile', { 
            user,
            successMessage: 'Password cambiata con successo!'
        });
    } catch (error) {
        console.error('Errore nel cambio password:', error);
        res.status(500).render('profile', { 
            user: (req as AuthenticatedRequest).user,
            errorMessage: 'Errore nel cambio password'
        });
    }
};