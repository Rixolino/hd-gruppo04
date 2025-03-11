import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendi l'interfaccia Request per includere l'utente
declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.redirect('/auth/login');
  }
  
  try {
    // Verifica e decodifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    // Log per debug
    console.log('Token decodificato:', decoded);
    
    // Assicurati che userId sia presente nel token decodificato
    if (typeof decoded !== 'string' && !decoded.userId) {
      console.error('Token manca userId:', decoded);
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }
    
    // Aggiungi i dati dell'utente alla richiesta
    req.user = decoded;
    
    next();
  } catch (err) {
    console.error('Errore autenticazione:', err);
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};