import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/userModel';

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Verifica che l'utente sia autenticato (req.user deve esistere dal middleware authenticate)
    if (!req.user || !req.user.userId) {
      res.redirect('/auth/login');
      return;
    }
    
    // Verifica che l'utente sia un amministratore
    const user = await UserModel.findByPk(req.user.userId);
    
    if (!user || !user.isAdmin) {
      res.status(403).render('error', {
        user: req.user,
        title: 'Accesso negato',
        errorMessage: 'Non hai i permessi necessari per accedere a questa pagina',
        showLogout: true
      });
      return;
    }
    
    // Se è un amministratore, procedi alla pagina richiesta
    next();
  } catch (error) {
    console.error('Errore nella verifica dei permessi di amministratore:', error);
    res.status(500).render('error', {
      user: req.user,
      title: 'Errore',
      errorMessage: 'Si è verificato un errore durante la verifica dei permessi',
      showLogout: true
    });
  }
};