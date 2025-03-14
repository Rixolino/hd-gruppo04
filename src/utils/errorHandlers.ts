import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Verifica se l'errore è relativo al database
 */
export const isDbError = (err: any): boolean => {
  if (!err) return false;
  
  return (
    (err.name === 'SequelizeConnectionError') ||
    (err.parent && (
      err.parent.code === 'ER_USER_LIMIT_REACHED' ||
      err.parent.sqlMessage?.includes('max_user_connections')
    )) ||
    (err.message && (
      err.message.includes('max_user_connections') ||
      err.message.includes('ECONNREFUSED') ||
      err.message.includes('ER_') ||
      err.message.includes('connection') ||
      err.message.includes('Connection')
    )) ||
    (err.code === 'ETIMEDOUT') ||
    (err.code === 'ENOTFOUND')
  );
};

/**
 * Gestisce gli errori di database reindirizzando alla pagina dberror
 */
export const handleDbError = (err: any, req: Request, res: Response) => {
  console.error('Errore database:', err);
  
  // Genera un codice di errore univoco
  const errorCode = 'DB' + Math.floor(1000 + Math.random() * 9000);
  
  // Ottieni i dettagli dell'errore
  let errorDetails = 'Errore di connessione al database';
  if (process.env.NODE_ENV === 'development') {
    if (err.parent && err.parent.sqlMessage) {
      errorDetails = err.parent.sqlMessage;
    } else if (err.message) {
      errorDetails = err.message;
    }
  }
  
  // Verifica se è una richiesta API basata sul percorso URL o sugli header Accept
  const isApiRequest = req.path.startsWith('/api/') || 
                      req.headers.accept?.includes('application/json') ||
                      req.xhr;
  
  // Verifica se c'è un utente autenticato
  let user = null;
  const token = req.cookies?.token;
  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      // Token non valido, user rimane null
    }
  }
  
  // SE è una richiesta AJAX / XHR, restituisci SEMPRE la pagina di errore
  return res.status(503).render('dberror', {
    user,
    errorDetails: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
    errorCode
  });
};

/**
 * Wrappa un middleware per catturare gli errori di database
 */
export const catchDatabaseErrors = (fn: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err: any) {
      // Controlla se è un errore di database
      if (isDbError(err)) {
        return handleDbError(err, req, res);
      } else {
        next(err); // Passa altri tipi di errori al prossimo middleware
      }
    }
  };
};